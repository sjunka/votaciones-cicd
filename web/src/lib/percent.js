// Porcentajes enteros que suman 100 (resto mayor), igual que la API
export function percents(votes) {
  const total = votes.reduce((a, b) => a + b, 0);
  if (total === 0) return votes.map(() => 0);
  const base = votes.map((v) => Math.floor((v * 100) / total));
  const missing = 100 - base.reduce((a, b) => a + b, 0);
  votes
    .map((v, i) => [(v * 100) % total, i])
    .sort((a, b) => b[0] - a[0] || a[1] - b[1])
    .slice(0, missing)
    .forEach(([, i]) => (base[i] += 1));
  return base;
}
