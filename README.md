# claude-code-learn

Persistent knowledge base for Claude Code. Research topics, save structured knowledge, and let Claude maintain it automatically.

## What It Does

- **`/claude-code-learn:learn <topic>`** — Quick research using available tools, save to `~/.claude/learnings/`
- **`/claude-code-learn:deep-learn <topic>`** — Deep research using parallel agents (subagents or team), comprehensive coverage
- **`/claude-code-learn:recall <topic>`** — Load saved knowledge into session context (silent, no lecture)
- **`/claude-code-learn:forget <topic>`** — Remove saved knowledge
- **Auto-maintenance** — Claude silently updates stale or incorrect knowledge during normal work

## Installation

### From GitHub (Remote)

```bash
claude install-plugin github:ourines/claude-code-learn
```

Or add to your `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "claude-code-learn": {
      "source": {
        "source": "github",
        "repo": "ourines/claude-code-learn"
      }
    }
  },
  "enabledPlugins": {
    "claude-code-learn@claude-code-learn": true
  }
}
```

Then create the knowledge directory:

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
```

~200 tokens. Claude reads full files only when relevant.

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
