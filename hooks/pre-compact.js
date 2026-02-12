#!/usr/bin/env node
// claude-code-learn: PreCompact hook
// Before context compaction, reminds Claude to persist valuable knowledge.
// This is the last chance to save discoveries before details are lost to summarization.

const fs = require('fs');
const path = require('path');

const LEARNINGS_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'learnings');

let count = 0;
try {
  if (fs.existsSync(LEARNINGS_DIR)) {
    count = fs.readdirSync(LEARNINGS_DIR).filter(f => f.endsWith('.md')).length;
  }
} catch (e) {
  // ignore
}

const prompt = `[claude-code-learn: pre-compaction knowledge save]
Context is about to be compacted. Details from this session will be summarized and may be lost.

Evaluate what you learned in this session:
1. Any gotchas, patterns, or API behaviors worth persisting?
2. Any tricky bug fixes whose root cause + solution should be remembered?
3. Any library/tool/concept knowledge that future sessions would benefit from?

If YES to any: save to ~/.claude/learnings/<slug>.md NOW (${count} files currently in knowledge base).
If nothing worth saving: proceed normally.`;

console.log(prompt);
