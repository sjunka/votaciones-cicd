import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";

const REPO = "https://github.com/sjunka/votaciones-cicd";

export default function About() {
  const [h, setH] = useState(null);
  useEffect(() => {
    getHealth().then(setH, () => setH({}));
  }, []);
  return (
    <section className="card create">
      <h1>Acerca de esta versión</h1>
      <p className="lede">Datos que publica el pipeline en cada despliegue.</p>
      <dl className="facts">
        <dt>Versión</dt>
        <dd>{h?.version ?? "..."}</dd>
        <dt>Commit</dt>
        <dd>{h?.commit ?? "..."}</dd>
        <dt>Ambiente</dt>
        <dd>{h?.environment ?? "..."}</dd>
      </dl>
      <p className="links">
        <a href={`${REPO}/releases`}>Releases</a>
        <a href={`${REPO}/actions`}>Ejecuciones del pipeline</a>
      </p>
    </section>
  );
}
