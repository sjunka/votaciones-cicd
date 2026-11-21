// Dashboard CI/CD en vivo: sirve index.html y expone /api/state leyendo GitHub con `gh`.
// Uso: node scripts/dashboard/server.mjs [owner/repo] [puerto]   (requiere `gh auth login`)
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const sh = promisify(execFile);
const REPO = process.argv[2] || 'sjunka/votaciones-cicd';
const PORT = Number(process.argv[3] || 4000);
const WORKFLOW = process.env.WORKFLOW || 'ci-cd.yml';
const html = readFileSync(new URL('./index.html', import.meta.url));
const gh = async (path) => JSON.parse((await sh('gh', ['api', path], { maxBuffer: 20e6 })).stdout);

async function state(runId) {
  const { workflow_runs } = await gh(`repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=10`);
  // Sin run fijo: el activo más reciente; si no hay, el último.
  const run = runId ? await gh(`repos/${REPO}/actions/runs/${runId}`)
    : workflow_runs.find((r) => r.status !== 'completed') || workflow_runs[0];
  const { jobs } = await gh(`repos/${REPO}/actions/runs/${run.id}/jobs?per_page=100`);
  const pr = run.pull_requests?.[0];
  return {
    now: Date.now(), repo: REPO,
    runs: workflow_runs.map((r) => ({ id: r.id, title: r.display_title, event: r.event, branch: r.head_branch, status: r.status, conclusion: r.conclusion, created: r.created_at })),
    run: {
      id: run.id, name: run.name, title: run.display_title, event: run.event, branch: run.head_branch,
      sha: run.head_sha.slice(0, 7), status: run.status, conclusion: run.conclusion, url: run.html_url,
      started: run.run_started_at, updated: run.updated_at, pr: pr?.number, actor: run.actor?.login,
    },
    jobs: jobs.map((j) => ({
      id: j.id, name: j.name, status: j.status, conclusion: j.conclusion, started: j.started_at, completed: j.completed_at, url: j.html_url,
      steps: j.steps.map((s) => ({ name: s.name, status: s.status, conclusion: s.conclusion, started: s.started_at, completed: s.completed_at })),
    })),
  };
}

createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/state') {
    try {
      const body = JSON.stringify(await state(u.searchParams.get('run')));
      res.writeHead(200, { 'content-type': 'application/json' }).end(body);
    } catch (e) { res.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ error: String(e.stderr || e.message) })); }
  } else res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
}).listen(PORT, () => console.log(`Dashboard: http://localhost:${PORT}  (repo ${REPO})`));
