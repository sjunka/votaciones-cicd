// Lambda proxy de solo lectura para la vista "Pipeline en vivo" de Pages.
// Guarda el token de GitHub del lado del servidor y cachea 4 s: muchos celulares = pocas llamadas a GitHub.
const REPO = 'sjunka/votaciones-cicd';
const WORKFLOW = 'ci-cd.yml';
const TTL = 4000;
const cache = new Map();

async function gh(path) {
  const c = cache.get(path);
  if (c && Date.now() - c.t < TTL) return c.data;
  const r = await fetch(`https://api.github.com/${path}`, {
    headers: {
      authorization: `Bearer ${process.env.GH_TOKEN}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'pipeline-vivo',
      ...(c?.etag ? { 'if-none-match': c.etag } : {}), // 304 no gasta cuota
    },
  });
  if (r.status === 304) { c.t = Date.now(); return c.data; }
  if (!r.ok) throw new Error(`GitHub respondió ${r.status}`);
  const data = await r.json();
  cache.set(path, { t: Date.now(), etag: r.headers.get('etag'), data });
  return data;
}

async function state(runId) {
  const { workflow_runs } = await gh(`repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=8`);
  // Sin run fijo: el activo más reciente; si no hay, el último.
  const run = runId ? await gh(`repos/${REPO}/actions/runs/${runId}`)
    : workflow_runs.find((r) => r.status !== 'completed') || workflow_runs[0];
  const { jobs } = await gh(`repos/${REPO}/actions/runs/${run.id}/jobs?per_page=100`);
  return {
    now: Date.now(),
    runs: workflow_runs.map((r) => ({ id: r.id, title: r.display_title, event: r.event, branch: r.head_branch, status: r.status, conclusion: r.conclusion })),
    run: {
      id: run.id, title: run.display_title, event: run.event, branch: run.head_branch, sha: run.head_sha.slice(0, 7),
      status: run.status, conclusion: run.conclusion, url: run.html_url, started: run.run_started_at, updated: run.updated_at,
      pr: run.pull_requests?.[0]?.number ?? null, actor: run.actor?.login,
    },
    jobs: jobs.map((j) => ({
      name: j.name, status: j.status, conclusion: j.conclusion, started: j.started_at, completed: j.completed_at, url: j.html_url,
      steps: j.steps.map((s) => ({ name: s.name, status: s.status, conclusion: s.conclusion, started: s.started_at, completed: s.completed_at })),
    })),
  };
}

export const handler = async (event) => {
  const run = event.queryStringParameters?.run;
  if (run && !/^\d{1,20}$/.test(run)) return { statusCode: 400, body: JSON.stringify({ error: 'run inválido' }) };
  try {
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(await state(run)) };
  } catch (e) {
    return { statusCode: 502, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};
