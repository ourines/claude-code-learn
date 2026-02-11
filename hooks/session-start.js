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

console.log(out);
