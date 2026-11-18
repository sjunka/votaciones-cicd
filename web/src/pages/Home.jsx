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
    <form onSubmit={submit}>
      <h1>Nueva encuesta</h1>
      <input
        data-testid="new-question"
        placeholder="Pregunta"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      {options.map((o, i) => (
        <input
          key={i}
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
      {error && <p className="error">{error}</p>}
      <button type="submit" data-testid="create-poll">
        Crear encuesta
      </button>
    </form>
  );
}
