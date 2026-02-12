#!/usr/bin/env node
// claude-code-learn: SessionStart hook
// Lists available learnings and provides Claude with knowledge self-maintenance instructions.
// Cross-platform: works on macOS, Linux, and Windows (Node.js required by Claude Code).
// Output is kept compact to minimize context usage.

const fs = require('fs');
const path = require('path');

const LEARNINGS_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'learnings');
const MAX_DISPLAY = 20;
const STALE_DAYS = 90;

if (!fs.existsSync(LEARNINGS_DIR)) process.exit(0);

// --- Dependency detection helpers ---

function extractNpmDeps(cwd) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
    return [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
  } catch (e) { return []; }
}

function extractGoDeps(cwd) {
  try {
    const content = fs.readFileSync(path.join(cwd, 'go.mod'), 'utf-8');
    const m = content.match(/require\s*\(([\s\S]*?)\)/);
    if (!m) return [];
    return m[1].split('\n').map(l => l.trim().split(/\s+/)[0]).filter(Boolean);
  } catch (e) { return []; }
}

function extractPythonDeps(cwd) {
  try {
    const content = fs.readFileSync(path.join(cwd, 'requirements.txt'), 'utf-8');
    return content.split('\n').map(l => l.trim().split(/[>=<!\[]/)[0].trim()).filter(l => l && !l.startsWith('#'));
  } catch (e) { return []; }
}

function extractCargoDeps(cwd) {
  try {
    const content = fs.readFileSync(path.join(cwd, 'Cargo.toml'), 'utf-8');
    const m = content.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/);
    if (!m) return [];
    return m[1].split('\n').map(l => l.trim().split(/\s*=/)[0].trim()).filter(Boolean);
  } catch (e) { return []; }
}

// Convert a dependency name to candidate slugs for matching
function depToSlugs(dep) {
  const slugs = [];
  if (dep.startsWith('@')) {
    // @scope/name -> scope-name, name, scope-<name without framework prefix>
    const parts = dep.slice(1).split('/');
    if (parts.length === 2) {
      const scope = parts[0].toLowerCase();
      const name = parts[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
      slugs.push(scope + '-' + name);
      slugs.push(name);
      const stripped = name.replace(/^(react|vue|solid|svelte|angular)-/, '');
      if (stripped !== name) slugs.push(scope + '-' + stripped);
    }
  } else {
    const slug = dep.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    slugs.push(slug);
    // go module paths: use last segment
    if (dep.includes('/')) {
      const last = dep.split('/').pop().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (last) slugs.push(last);
    }
  }
  return [...new Set(slugs)];
}

function detectProjectDeps(cwd) {
  return [
    ...extractNpmDeps(cwd),
    ...extractGoDeps(cwd),
    ...extractPythonDeps(cwd),
    ...extractCargoDeps(cwd),
  ];
}

function matchDepsToLearnings(deps, learningFiles) {
  const slugSet = new Map(learningFiles.map(f => [f.slug, f]));
  const matched = new Map();
  for (const dep of deps) {
    for (const slug of depToSlugs(dep)) {
      if (slugSet.has(slug) && !matched.has(slug)) {
        matched.set(slug, slugSet.get(slug));
      }
      // Also check if any learning slug contains the candidate as substring
      for (const [lSlug, lFile] of slugSet) {
        if (!matched.has(lSlug) && (lSlug.includes(slug) || slug.includes(lSlug)) && slug.length >= 3) {
          matched.set(lSlug, lFile);
        }
      }
    }
  }
  return [...matched.values()];
}

const files = [];
try {
  for (const name of fs.readdirSync(LEARNINGS_DIR)) {
    if (!name.endsWith('.md')) continue;
    const filePath = path.join(LEARNINGS_DIR, name);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    // Extract topic and last_verified from frontmatter
    const content = fs.readFileSync(filePath, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let topic = null;
    let lastVerified = null;
    if (fmMatch) {
      const fm = fmMatch[1];
      const topicMatch = fm.match(/^topic:\s*"?([^"\n]+)"?\s*$/m);
      if (topicMatch) topic = topicMatch[1].trim();
      const dateMatch = fm.match(/^last_verified:\s*"?([^"\n]+)"?\s*$/m);
      if (dateMatch) lastVerified = dateMatch[1].trim();
    }
    if (!topic) {
      topic = name.replace(/\.md$/, '').replace(/-/g, ' ');
    }

    let stale = false;
    if (lastVerified) {
      const d = new Date(lastVerified);
      const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (age > STALE_DAYS) stale = true;
    }

    files.push({ topic, slug: name.replace(/\.md$/, ''), stale });
  }
} catch (e) {
  process.exit(0);
}

if (files.length === 0) process.exit(0);

// Build topic list
const displayed = files.slice(0, MAX_DISPLAY).map(f => f.topic);
const staleTopics = files.filter(f => f.stale).map(f => f.topic);

let out = `[claude-code-learn] ${files.length} topic(s) in knowledge base: ${displayed.join(', ')}`;
if (files.length > MAX_DISPLAY) {
  out += ` (+${files.length - MAX_DISPLAY} more)`;
}
out += '.';

if (staleTopics.length > 0) {
  out += `\nStale (>${STALE_DAYS}d): ${staleTopics.join(', ')}.`;
}

// Self-maintenance directives for Claude
out += '\n[Knowledge maintenance] When a topic above is relevant to the current task, read ~/.claude/learnings/<slug>.md for reference.';
out += ' If you find saved knowledge is outdated or incorrect during your work, update the file silently:';
out += ' fix the content, set last_verified to today, adjust confidence. No user confirmation needed.';
out += ' If you discover new knowledge worth persisting, save it to ~/.claude/learnings/<new-slug>.md following the same format.';

// --- Context-aware auto-recall ---
const cwd = process.cwd();
const deps = detectProjectDeps(cwd);
if (deps.length > 0) {
  const matched = matchDepsToLearnings(deps, files);
  if (matched.length > 0) {
    const paths = matched.map(f => '~/.claude/learnings/' + f.slug + '.md');
    out += '\n[Auto-recall] Project dependencies match saved knowledge. READ now: ' + paths.join(', ') + '.';
  }
}

console.log(out);
