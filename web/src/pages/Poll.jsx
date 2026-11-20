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
  const top = Math.max(...poll.options.map((o) => o.votes));

  return (
    <section className="poll">
      <div>
        <div className={`live${poll.closed ? " closed" : ""}`}>
          <span className="live-dot" aria-hidden="true" />
          {poll.closed ? "Votación cerrada" : "En vivo"}
        </div>
        <h1 data-testid="poll-question">{poll.question}</h1>
        <div className="options">
          {poll.options.map((o, i) => (
            <button
              key={o.id}
              className={`option${top > 0 && o.votes === top ? " leader" : ""}`}
              data-testid={`option-${i}`}
              disabled={poll.closed}
              onClick={() => onVote(o.id)}
            >
              <span className="fill" style={{ width: `${pct[i]}%` }} aria-hidden="true" />
              <span className="option-text">{o.text}</span>
              <span className="option-votes">{o.votes} {o.votes === 1 ? "voto" : "votos"}</span>
              <span className="option-pct" data-testid={`percent-${i}`}>{pct[i]}%</span>
            </button>
          ))}
        </div>
        <p className="total" data-testid="vote-count"><strong>{poll.total_votes}</strong> votos</p>
        {notice && <p className="notice" role="status">{notice}</p>}
        {poll.closed && <p className="notice closed" data-testid="closed-notice">Encuesta cerrada</p>}
        {admin && !poll.closed && (
          <button className="ghost" data-testid="close-button" onClick={onClose}>
            Cerrar encuesta
          </button>
        )}
      </div>
      <aside className="qr card">
        <h2>Escanea y vota</h2>
        <QRCodeSVG value={window.location.href} size={240} fgColor="#16151a" bgColor="#fffdf8" />
        <p>Un voto por dispositivo</p>
        <a data-testid="poll-link" href={window.location.href}>{window.location.href}</a>
      </aside>
    </section>
  );
}
