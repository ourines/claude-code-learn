#!/usr/bin/env node
// claude-code-learn: PostToolUse hook for research tools
// Injects a knowledge capture reminder after research-type tool calls.
// Claude decides whether to save, ask, or skip based on the value of findings.

const fs = require('fs');
const path = require('path');

const LEARNINGS_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'learnings');

// Count existing learnings for context
let count = 0;
try {
  if (fs.existsSync(LEARNINGS_DIR)) {
    count = fs.readdirSync(LEARNINGS_DIR).filter(f => f.endsWith('.md')).length;
  }
} catch (e) {
  // ignore
}

const prompt = `[claude-code-learn: knowledge capture]
You just used a research tool. Evaluate whether the result contains knowledge worth persisting to ~/.claude/learnings/.

Decision levels:
1. **Auto-save** (no user confirmation): The result contains verified, reusable knowledge — API signatures, patterns, gotchas, config recipes — that you or future sessions will clearly benefit from. Save it silently to ~/.claude/learnings/<slug>.md following the standard format.
2. **Ask user**: The result is potentially valuable but you're unsure if it's worth persisting (e.g., niche topic, uncertain accuracy, might be too specific). Ask: "This looks worth saving — record to knowledge base?"
3. **Skip**: The result is routine, already known, too specific to this task, or not reusable. Do nothing.

Guidelines:
- Prefer saving if the topic came up naturally and the knowledge is generalizable.
- Don't save task-specific debugging output or one-off answers.
- If a learning on this topic already exists (${count} total in knowledge base), consider updating it instead of creating a new file.
- Keep saves concise. A small focused learning is better than a large vague one.
- This is a background evaluation — don't interrupt the user's workflow unless you chose level 2.`;

console.log(prompt);
