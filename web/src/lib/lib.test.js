import { beforeEach, describe, expect, it, vi } from "vitest";
import { percents } from "./percent";
import { cleanOptions, validatePoll } from "./validate";
import * as api from "./api";

describe("percents", () => {
  it("devuelve ceros sin votos", () => {
    expect(percents([0, 0, 0])).toEqual([0, 0, 0]);
  });
  it("suma 100 con resto mayor", () => {
    expect(percents([1, 1, 1])).toEqual([34, 33, 33]);
    expect(percents([7, 3, 5, 11, 1]).reduce((a, b) => a + b)).toBe(100);
  });
});

describe("validatePoll", () => {
  const ok = ["Si", "No"];
  it("acepta una encuesta válida", () => {
    expect(validatePoll("¿Listo?", ok)).toBeNull();
  });
  it("rechaza preguntas cortas y largas", () => {
    expect(validatePoll("ab", ok)).toMatch(/pregunta/);
    expect(validatePoll("x".repeat(201), ok)).toMatch(/pregunta/);
  });
  it("rechaza pocas, muchas, largas y repetidas", () => {
    expect(validatePoll("¿Listo?", ["Si", " "])).toMatch(/al menos 2/);
    expect(validatePoll("¿Listo?", "abcdefg".split(""))).toMatch(/Máximo/);
    expect(validatePoll("¿Listo?", ["a", "x".repeat(81)])).toMatch(/80/);
    expect(validatePoll("¿Listo?", ["Si", "si"])).toMatch(/repetir/);
  });
  it("limpia opciones vacías", () => {
    expect(cleanOptions([" a ", "", "b"])).toEqual(["a", "b"]);
  });
});

describe("api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Almacén mínimo: no depende de que Node o jsdom expongan localStorage
    const store = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, v),
    });
    vi.stubGlobal("crypto", { randomUUID: () => "uuid-fijo" });
  });
  const reply = (status, body) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: status < 400,
      status,
      json: async () => body,
    });

  it("lee health y encuesta", async () => {
    const f = reply(200, { status: "ok" });
    expect(await api.getHealth()).toEqual({ status: "ok" });
    await api.getPoll("abc");
    expect(f.mock.calls[1][0]).toBe("/api/polls/abc");
  });
  it("genera el voter_id sin randomUUID (contexto HTTP)", () => {
    vi.stubGlobal("crypto", { getRandomValues: (a) => a.fill(15) });
    expect(api.voterId()).toBe("0f".repeat(16));
  });
  it("crea, vota y cierra con los datos del contrato", async () => {
    const f = reply(200, {});
    await api.createPoll("q", ["a", "b"]);
    await api.vote("id", 1, "v");
    await api.closePoll("id", "code");
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ question: "q", options: ["a", "b"] });
    expect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ option_id: 1, voter_id: "v" });
    expect(f.mock.calls[2][1].headers["X-Admin-Code"]).toBe("code");
  });
  it("lanza ApiError con el mensaje de la API", async () => {
    reply(409, { error: "Ya votaste" });
    await expect(api.vote("id", 0, "v")).rejects.toMatchObject({ status: 409, message: "Ya votaste" });
  });
  it("usa mensaje por defecto si no hay JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("no json");
      },
    });
    await expect(api.getHealth()).rejects.toMatchObject({ status: 500, message: "Error inesperado" });
  });
  it("genera voter_id una sola vez", () => {
    const a = api.voterId();
    expect(api.voterId()).toBe(a);
    expect(a).toBe("uuid-fijo");
    expect(localStorage.getItem("voter")).toBe(a);
  });
});
