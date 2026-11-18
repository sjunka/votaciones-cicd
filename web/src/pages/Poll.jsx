import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { closePoll, getPoll, vote, voterId } from "../lib/api";
import { percents } from "../lib/percent";

export default function Poll() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [notice, setNotice] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const admin = localStorage.getItem(`admin:${id}`);

  const load = useCallback(
    () => getPoll(id).then(setPoll, () => setNotFound(true)),
    [id],
  );

  // Refresco cada 2 s: el público ve los resultados moverse
  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [load]);

  async function onVote(optionId) {
    try {
      setPoll(await vote(id, optionId, voterId()));
      setNotice("Voto registrado");
    } catch (err) {
      setNotice(err.status === 409 ? err.message : `No se pudo votar: ${err.message}`);
      load();
    }
  }

  async function onClose() {
    try {
      setPoll(await closePoll(id, admin));
    } catch (err) {
      setNotice(err.message);
    }
  }

  if (notFound) return <p className="error">La encuesta no existe. <Link to="/">Crear una</Link></p>;
  if (!poll) return <p>Cargando...</p>;
  const pct = percents(poll.options.map((o) => o.votes));

  return (
    <section>
      <h1 data-testid="poll-question">{poll.question}</h1>
      {poll.options.map((o, i) => (
        <div key={o.id} className="option">
          <button data-testid={`option-${i}`} disabled={poll.closed} onClick={() => onVote(o.id)}>
            {o.text}
          </button>
          <div className="bar">
            <div style={{ width: `${pct[i]}%` }} />
          </div>
          <span data-testid={`percent-${i}`}>{pct[i]}%</span>
        </div>
      ))}
      <p data-testid="vote-count">{poll.total_votes} votos</p>
      {notice && <p className="notice">{notice}</p>}
      {poll.closed && <p className="notice" data-testid="closed-notice">Encuesta cerrada</p>}
      {admin && !poll.closed && (
        <button className="ghost" data-testid="close-button" onClick={onClose}>
          Cerrar encuesta
        </button>
      )}
      <div className="qr">
        <QRCodeSVG value={window.location.href} size={256} />
        <a data-testid="poll-link" href={window.location.href}>{window.location.href}</a>
      </div>
    </section>
  );
}
