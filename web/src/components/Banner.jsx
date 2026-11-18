import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHealth } from "../lib/api";

const LABELS = { staging: "STAGING", production: "PRODUCCIÓN" };

export default function Banner() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    getHealth().then(setHealth, () => setHealth({ environment: "sin conexión" }));
  }, []);
  const env = health?.environment ?? "...";
  const cls = env in LABELS ? env : "other";
  return (
    <header className={`banner ${cls}`} data-testid="env-banner">
      <Link to="/">Votaciones</Link>
      <span>{LABELS[env] ?? env.toUpperCase()}</span>
      <Link to="/acerca" data-testid="version">
        {health?.version ? `v${health.version}` : ""}
      </Link>
    </header>
  );
}
