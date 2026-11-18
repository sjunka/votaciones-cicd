// Misma validación que la API, para avisar antes de enviar
export function validatePoll(question, options) {
  const q = question.trim();
  if (q.length < 3 || q.length > 200) {
    return "La pregunta debe tener entre 3 y 200 caracteres";
  }
  const opts = options.map((o) => o.trim()).filter(Boolean);
  if (opts.length < 2) return "Escribe al menos 2 opciones";
  if (opts.length > 6) return "Máximo 6 opciones";
  if (opts.some((o) => o.length > 80)) return "Cada opción admite hasta 80 caracteres";
  if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) {
    return "Las opciones no pueden repetirse";
  }
  return null;
}

export function cleanOptions(options) {
  return options.map((o) => o.trim()).filter(Boolean);
}
