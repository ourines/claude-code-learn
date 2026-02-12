# claude-code-learn

Persistent knowledge base for Claude Code. Research topics, save structured knowledge, and let Claude maintain it automatically.

## What It Does

- **`/claude-code-learn:learn <topic>`** — Quick research using available tools, save to `~/.claude/learnings/`
- **`/claude-code-learn:deep-learn <topic>`** — Deep research using parallel agents (subagents or team), comprehensive coverage
- **`/claude-code-learn:recall <topic>`** — Load saved knowledge into session context (silent, no lecture)
- **`/claude-code-learn:forget <topic>`** — Remove saved knowledge
- **Auto-recall** — Detects project dependencies at session start, automatically loads matching knowledge
- **Autonomous capture** — Claude proactively saves knowledge before context compaction and after substantial sessions
- **Auto-maintenance** — Claude silently updates stale or incorrect knowledge during normal work

## Installation

### From GitHub (Remote)

**Step 1:** Add the marketplace in Claude Code:

```
/plugin marketplace add ourines/claude-code-learn
```

**Step 2:** Install the plugin:

```
/plugin
```

Navigate to **Discover** tab, find `claude-code-learn`, and enable it.

Or install via CLI:

```bash
claude plugin install claude-code-learn@ourines/claude-code-learn
```

**Step 3:** Create the knowledge directory:

```bash
mkdir -p ~/.claude/learnings
```

Restart Claude Code to activate.

### Local Development

Clone and install:

```bash
git clone https://github.com/ourines/claude-code-learn.git
cd claude-code-learn
chmod +x install.sh
./install.sh
```

Then start Claude Code with the plugin loaded:

```bash
claude --plugin-dir /path/to/claude-code-learn
```

`install.sh` does two things:
1. Creates `~/.claude/learnings/` for knowledge storage
2. Symlinks the plugin to `~/.claude/plugins/claude-code-learn`

### Manual Installation

```bash
# 1. Clone or download the repo
git clone https://github.com/ourines/claude-code-learn.git

# 2. Symlink to plugins directory
ln -s /path/to/claude-code-learn ~/.claude/plugins/claude-code-learn

# 3. Create knowledge directory
mkdir -p ~/.claude/learnings

# 4. Start with plugin flag
claude --plugin-dir /path/to/claude-code-learn
```

Hooks and MCP servers are auto-configured when the plugin is active — no manual `settings.json` editing needed.

## Skills

### /claude-code-learn:learn

Quick single-agent research. Adapts strategy based on topic type:

| Topic Type | Primary Tools | Focus |
|-----------|--------------|-------|
| Library/Framework | Context7, GitHub grep, WebSearch | APIs, patterns, pitfalls, versions |
| Concept/Pattern | WebSearch, WebFetch | Principles, tradeoffs, implementations |
| Tool/CLI | WebSearch, WebFetch | Commands, config, recipes |
| Language Feature | WebSearch, Context7 | Syntax, constraints, best practices |

### /claude-code-learn:deep-learn

Multi-agent deep research. Claude autonomously decides:

- **How many agents** to spawn (2–5, based on topic breadth)
- **Which strategy** to use:
  - **Subagents** — independent parallel research, best for well-defined topics
  - **Team agents** — coordinated research with shared task list, best for broad/unfamiliar topics where findings from one agent should influence others
- **What dimensions** each agent covers (docs, code patterns, gotchas, ecosystem, etc.)

Output includes an `Advanced Topics` section and `research_depth: "deep"` marker in frontmatter.

### /claude-code-learn:recall

Silently loads knowledge into session context. Does not recite the file — just confirms:

> Loaded knowledge on "TanStack Router" (verified 2026-02-11, confidence: high).

Shares details only when asked.

### /claude-code-learn:forget

Deletes knowledge file. If MCP memory is available, also cleans up the knowledge graph. If not, skips gracefully.

## How It Works

### SessionStart Hook

At session start, the hook scans `~/.claude/learnings/` and outputs a compact summary:

```
[claude-code-learn] 3 topic(s) in knowledge base: TanStack Router, Go concurrency, Redis Streams.
Stale (>90d): Go concurrency.
[Knowledge maintenance] When a topic above is relevant...
[Auto-recall] Project dependencies match saved knowledge. READ now: ~/.claude/learnings/tanstack-router.md.
```

The hook also detects project dependencies (`package.json`, `go.mod`, `requirements.txt`, `Cargo.toml`) and matches them against saved knowledge. When a match is found, Claude is instructed to load the relevant files immediately rather than waiting for the user to ask.

### Autonomous Knowledge Capture

Claude proactively saves knowledge without user intervention through two hooks:

- **PreCompact hook** — When context is about to be compacted (details will be lost to summarization), Claude is prompted to persist any valuable discoveries from the session. This is the highest-signal trigger: long sessions that fill the context window are most likely to contain knowledge worth saving.

- **Stop hook** — After substantial work sessions (transcript > 50KB), Claude is nudged to reflect on what it learned. Rate-limited to fire at most once per session to avoid noise.

Combined with the existing PostToolUse hook (fires after research tool calls), this gives Claude three autonomous opportunities to capture knowledge during normal work — without requiring `/learn`.

### Self-Maintenance

- **Stale detection** — flags topics where `last_verified` > 90 days
- **Silent updates** — when Claude finds outdated knowledge during work, it fixes the file automatically
- **Organic growth** — Claude saves new knowledge it discovers during normal sessions

### Knowledge Graph (Bundled)

The plugin bundles `@anthropic/mcp-memory` via `.mcp.json`. Auto-loaded when active — no separate configuration. No conflict if you already have the memory MCP server configured elsewhere.

## Knowledge File Format

```
~/.claude/learnings/
├── tanstack-router.md
├── go-concurrency-patterns.md
├── redis-streams.md
└── posix-shell-scripting.md
```

Each file has YAML frontmatter + structured sections:

```markdown
---
topic: "TanStack Router"
slug: "tanstack-router"
category: "library"
created: "2026-02-11"
last_verified: "2026-02-11"
confidence: "high"
tags: [tanstack, router, react, file-based-routing]
sources_count: 4
research_depth: "deep"        # only for /deep-learn output
agents_used: 3                # only for /deep-learn output
strategy: "subagents"         # only for /deep-learn output
---

# TanStack Router

## TL;DR
## Core APIs / Concepts
## Patterns & Recipes
## Gotchas
## Advanced Topics          # only for /deep-learn output
## Quick Reference
## Sources
```

## Requirements

- Claude Code CLI
- Node.js (required by Claude Code)

## License

MIT
