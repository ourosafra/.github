const API_URL = 'https://api.github.com';
const API_VERSION = '2026-03-10';
const TEAM_HEADING = 'Equipe';
const ALLOWED_TEAMS = new Set(['VX 360', 'RPA', 'SGI', 'OS App']);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${required('GH_TOKEN')}`,
      'X-GitHub-Api-Version': API_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) throw new Error(`${response.status} ${endpoint}: ${JSON.stringify(data)}`);
  return data;
}

function extractHeadingValue(body, heading) {
  if (!body) return null;
  const lines = body.split('\n');
  const expected = `### ${heading}`.toLowerCase();
  const index = lines.findIndex(line => line.trim().toLowerCase() === expected);
  if (index < 0) return null;
  for (let i = index + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line.startsWith('### ')) break;
    if (line && line !== '_No response_') return line;
  }
  return null;
}

async function main() {
  const repository = required('REPOSITORY');
  const issueNumber = Number(required('ISSUE_NUMBER'));
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) throw new Error(`Invalid repository: ${repository}`);

  const issue = await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`);
  if (issue.pull_request) return;

  const team = extractHeadingValue(issue.body, TEAM_HEADING);
  if (!team) {
    console.log('Team heading not present; nothing to synchronize.');
    return;
  }
  if (!ALLOWED_TEAMS.has(team)) throw new Error(`Unsupported Team: ${team}`);

  const fields = await request(`/orgs/${encodeURIComponent(owner)}/issue-fields`);
  const teamField = fields.find(field => field.name?.trim().toLowerCase() === 'team');
  if (!teamField) throw new Error(`Team issue field not found in ${owner}`);

  await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/issue-field-values`, {
    method: 'POST',
    body: JSON.stringify({
      issue_field_values: [{ field_id: teamField.id, value: team }],
    }),
  });

  console.log(`Synchronized Team=${team} using issue field ${teamField.id}.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
