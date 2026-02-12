#!/usr/bin/env node
// claude-code-learn: Stop hook
// After substantial sessions, nudges Claude to reflect on knowledge worth saving.
// Rate-limited: fires at most once per session, only for sessions with enough content.

const fs = require('fs');
const path = require('path');
const os = require('os');

const LEARNINGS_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'learnings');
const MARKER_DIR = path.join(os.tmpdir(), 'claude-code-learn');
const TRANSCRIPT_THRESHOLD = 50000; // ~50KB transcript = substantial session

// Read stdin for hook data
let data;
try {
  const input = fs.readFileSync(0, 'utf-8');
  data = JSON.parse(input);
} catch (e) {
  process.exit(0);
}

// Prevent infinite loops
if (data.stop_hook_active) process.exit(0);

const sessionId = data.session_id;
if (!sessionId) process.exit(0);

// Rate limit: one reflection per session
const markerFile = path.join(MARKER_DIR, `reflected-${sessionId}`);
try {
  if (fs.existsSync(markerFile)) process.exit(0);
} catch (e) {
  // ignore
}

// Check if session is substantial enough to warrant reflection
const transcriptPath = data.transcript_path;
if (!transcriptPath) process.exit(0);

try {
  const stat = fs.statSync(transcriptPath);
  if (stat.size < TRANSCRIPT_THRESHOLD) process.exit(0);
} catch (e) {
  process.exit(0);
}

// Write marker to prevent re-triggering
try {
  fs.mkdirSync(MARKER_DIR, { recursive: true });
  fs.writeFileSync(markerFile, Date.now().toString());
} catch (e) {
  // ignore, still output the prompt
}

// Count existing learnings
let count = 0;
try {
  if (fs.existsSync(LEARNINGS_DIR)) {
    count = fs.readdirSync(LEARNINGS_DIR).filter(f => f.endsWith('.md')).length;
  }
} catch (e) {
  // ignore
}

const prompt = `[claude-code-learn: session reflection]
This has been a substantial work session. Before moving on, consider:
- Did you discover any reusable knowledge (patterns, gotchas, API behaviors)?
- Did you solve a problem whose solution future sessions should know about?

If yes: save to ~/.claude/learnings/<slug>.md (${count} files currently in knowledge base).
If nothing notable: ignore this message entirely.`;

console.log(prompt);
