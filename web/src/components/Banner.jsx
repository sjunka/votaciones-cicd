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
  // Cada parche gira el tono 137 grados: versiones seguidas nunca comparten color
  const patch = Number(health?.version?.split(".").pop()) || 0;
  return (
    <header className={`banner ${cls}`} data-testid="env-banner">
      <div className="banner-inner">
        <Link to="/" className="brand">
          <svg className="brand-mark" viewBox="0 0 26 26" aria-hidden="true">
            <rect x="2" y="14" width="6" height="10" rx="2" fill="#16151a" />
            <rect x="10" y="4" width="6" height="20" rx="2" fill="#e8491d" />
            <rect x="18" y="10" width="6" height="14" rx="2" fill="#16151a" />
          </svg>
          Votaciones
        </Link>
        <span className="env">{LABELS[env] ?? env.toUpperCase()}</span>
        <Link to="/acerca" className="version" data-testid="version"
          style={{ background: `hsl(${(patch * 137) % 360} 75% 42%)` }}>
          {health?.version ? `v${health.version}` : ""}
        </Link>
      </div>
    </header>
  );
}
