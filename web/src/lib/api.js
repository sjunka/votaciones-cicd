// Cliente de la API: rutas relativas, el mismo ALB sirve web y api
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function call(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || "Error inesperado");
  return data;
}

export const getHealth = () => call("/health");
export const getPoll = (id) => call(`/polls/${id}`);
export const createPoll = (question, options) =>
  call("/polls", { method: "POST", body: JSON.stringify({ question, options }) });
export const vote = (id, optionId, voterId) =>
  call(`/polls/${id}/votes`, {
    method: "POST",
    body: JSON.stringify({ option_id: optionId, voter_id: voterId }),
  });
export const closePoll = (id, code) =>
  call(`/polls/${id}/close`, { method: "POST", headers: { "X-Admin-Code": code } });

// voter_id anónimo, una vez por navegador
export function voterId() {
  let v = localStorage.getItem("voter");
  if (!v) {
    // randomUUID solo existe en contextos seguros (HTTPS); el ALB sirve por HTTP
    v = crypto.randomUUID
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("voter", v);
  }
  return v;
}
