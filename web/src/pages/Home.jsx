import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPoll } from "../lib/api";
import { cleanOptions, validatePoll } from "../lib/validate";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const setOption = (i, v) => setOptions(options.map((o, j) => (j === i ? v : o)));

  async function submit(e) {
    e.preventDefault();
    const problem = validatePoll(question, options);
    if (problem) return setError(problem);
    try {
      const poll = await createPoll(question.trim(), cleanOptions(options));
      // El código de administrador solo lo conoce quien creó la encuesta
      localStorage.setItem(`admin:${poll.id}`, poll.admin_code);
      navigate(`/p/${poll.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="create">
      <h1>Pregunta algo al jurado</h1>
      <p className="lede">Crea la encuesta, proyecta el QR y mira cómo llegan los votos en vivo.</p>
      <div className="card">
        <label htmlFor="q">Pregunta</label>
        <input
          id="q"
          className="question-input"
          data-testid="new-question"
          placeholder="¿Qué lenguaje usamos en el próximo proyecto?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <label htmlFor="o0">Opciones</label>
        {options.map((o, i) => (
          <input
            key={i}
            id={`o${i}`}
            aria-label={`Opción ${i + 1}`}
            data-testid={`new-option-${i}`}
            placeholder={`Opción ${i + 1}`}
            value={o}
            onChange={(e) => setOption(i, e.target.value)}
          />
        ))}
        {options.length < 6 && (
          <button type="button" className="ghost" data-testid="add-option" onClick={() => setOptions([...options, ""])}>
            + Agregar opción
          </button>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary" data-testid="create-poll">
          Crear encuesta
        </button>
      </div>
    </form>
  );
}
