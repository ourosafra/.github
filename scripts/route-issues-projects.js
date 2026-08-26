const fs = require('node:fs');
const path = require('node:path');

const API_URL = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';
const API_VERSION = '2026-03-10';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
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
  if (!response.ok) throw new Error(`${response.status} ${url}: ${JSON.stringify(data)}`);
  return data;
}

async function graphql(query, variables = {}) {
  const payload = await request(GRAPHQL_URL, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });
  if (payload.errors?.length) throw new Error(JSON.stringify(payload.errors));
  return payload.data;
}

function config() {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.github/governance/project-routing.json'), 'utf8'));
}

async function getIssue(owner, repo, number) {
  const data = await graphql(`
    query($owner:String!,$repo:String!,$number:Int!) {
      repository(owner:$owner,name:$repo) {
        issue(number:$number) {
          id number title url
          issueType { name }
          projectItems(first:100) {
            nodes { id project { id number title } }
          }
        }
      }
    }
  `, { owner, repo, number });
  if (!data.repository?.issue) throw new Error(`Issue ${owner}/${repo}#${number} not found`);
  return data.repository.issue;
}

async function getIssueFields(owner, repo, number) {
  return request(`${API_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${number}/issue-field-values?per_page=100`);
}

function fieldValue(fields, name) {
  const field = fields.find(item => item.issue_field_name?.trim().toLowerCase() === name.toLowerCase());
  if (!field) return null;
  if (field.single_select_option?.name) return field.single_select_option.name;
  if (Array.isArray(field.multi_select_options)) return field.multi_select_options.map(x => x.name).filter(Boolean);
  return field.value ?? null;
}

async function getProjects(org) {
  const data = await graphql(`
    query($org:String!) {
      organization(login:$org) {
        projectsV2(first:100) { nodes { id number title } }
      }
    }
  `, { org });
  if (!data.organization) throw new Error(`Organization ${org} not found`);
  return data.organization.projectsV2.nodes;
}

async function add(projectId, issueId) {
  return graphql(`
    mutation($projectId:ID!,$issueId:ID!) {
      addProjectV2ItemById(input:{projectId:$projectId,contentId:$issueId}) { item { id } }
    }
  `, { projectId, issueId });
}

async function remove(projectId, itemId) {
  return graphql(`
    mutation($projectId:ID!,$itemId:ID!) {
      deleteProjectV2Item(input:{projectId:$projectId,itemId:$itemId}) { deletedItemId }
    }
  `, { projectId, itemId });
}

async function main() {
  const organization = required('ORGANIZATION');
  const repository = required('REPOSITORY');
  const issueNumber = Number(required('ISSUE_NUMBER'));
  const [owner, repo] = repository.split('/');
  if (!owner || !repo || owner.toLowerCase() !== organization.toLowerCase()) {
    throw new Error(`Repository ${repository} does not belong to ${organization}`);
  }

  const cfg = config();
  const [issue, fields, projects] = await Promise.all([
    getIssue(owner, repo, issueNumber),
    getIssueFields(owner, repo, issueNumber),
    getProjects(organization),
  ]);

  const projectByKey = new Map();
  for (const [key, definition] of Object.entries(cfg.projects)) {
    const project = projects.find(item => item.number === definition.number);
    if (!project) throw new Error(`Configured project ${key} (#${definition.number}) not found`);
    projectByKey.set(key, project);
  }

  const issueType = issue.issueType?.name ?? null;
  const team = fieldValue(fields, 'Team');
  const desiredKeys = new Set([
    ...(cfg.routing.teams?.[team] || []),
    ...(cfg.routing.types?.[issueType] || []),
  ]);
  const desired = [...desiredKeys].map(key => projectByKey.get(key));
  const governedIds = new Set([...projectByKey.values()].map(project => project.id));
  const desiredIds = new Set(desired.map(project => project.id));
  const currentGoverned = issue.projectItems.nodes.filter(item => governedIds.has(item.project.id));

  console.log(JSON.stringify({ repository, issue: issueNumber, issueType, team, desired: desired.map(p => p.title) }, null, 2));

  for (const project of desired) {
    if (!currentGoverned.some(item => item.project.id === project.id)) {
      await add(project.id, issue.id);
      console.log(`Added to ${project.title}`);
    }
  }

  for (const item of currentGoverned) {
    if (!desiredIds.has(item.project.id)) {
      await remove(item.project.id, item.id);
      console.log(`Removed from ${item.project.title}`);
    }
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
