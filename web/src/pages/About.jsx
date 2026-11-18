import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";

const REPO = "https://github.com/sjunka/votaciones-cicd";

export default function About() {
  const [h, setH] = useState(null);
  useEffect(() => {
    getHealth().then(setH, () => setH({}));
  }, []);
  return (
    <section>
      <h1>Acerca de esta versión</h1>
      <dl>
        <dt>Versión</dt>
        <dd>{h?.version ?? "..."}</dd>
        <dt>Commit</dt>
        <dd>{h?.commit ?? "..."}</dd>
        <dt>Ambiente</dt>
        <dd>{h?.environment ?? "..."}</dd>
      </dl>
      <p><a href={`${REPO}/releases`}>Releases</a></p>
      <p><a href={`${REPO}/actions`}>Ejecuciones del pipeline</a></p>
    </section>
  );
}
