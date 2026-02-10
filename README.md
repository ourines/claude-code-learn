# claude-code-learn

A Claude Code plugin that lets you research topics and build a persistent, self-maintaining knowledge base.

## What It Does

- `/learn <topic>` — Research a topic using all available tools (WebSearch, Context7, GitHub grep) and save structured knowledge to `~/.claude/learnings/`
- `/recall <topic>` — Retrieve saved knowledge with fuzzy matching
- `/forget <topic>` — Delete saved knowledge
- **Auto-maintenance** — Claude silently updates stale or incorrect knowledge during normal work, without user intervention

## Installation

```bash
git clone https://github.com/ourines/claude-code-learn.git
cd claude-code-learn
chmod +x install.sh
./install.sh
```

Then restart Claude Code.

### Manual Installation

1. Symlink the plugin:
   ```bash
   ln -s /path/to/claude-code-learn ~/.claude/plugins/claude-code-learn
   ```

2. Create the learnings directory:
   ```bash
   mkdir -p ~/.claude/learnings
   ```

3. Add the SessionStart hook to `~/.claude/settings.json`:
   ```json
   {
     "hooks": {
       "SessionStart": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "node ~/.claude/plugins/claude-code-learn/hooks/session-start.js",
               "timeout": 5
             }
           ]
         }
       ]
     }
   }
   ```

## How It Works

### Research Strategy

The `/learn` skill adapts its research based on the topic type:

| Topic Type | Primary Tools | Focus Areas |
|-----------|--------------|-------------|
| Library/Framework | Context7 → GitHub grep → WebSearch | APIs, patterns, pitfalls, versions |
| Concept/Pattern | WebSearch → WebFetch | Principles, tradeoffs, implementations |
| Tool/CLI | WebSearch → WebFetch | Commands, config, recipes |
| Language Feature | WebSearch → Context7 | Syntax, constraints, best practices |

### SessionStart Hook

At the start of each session, the hook scans `~/.claude/learnings/` and outputs:

```
[Knowledge Base] 3 saved learning(s): TanStack Router, Go concurrency, Redis Streams.
Stale (>90d): Go concurrency.
[Auto-maintenance] Read ~/.claude/learnings/<slug>.md when a topic is relevant...
```

This costs ~200 tokens. Claude reads full files only when a topic becomes relevant.

### Self-Maintenance (Automatic)

This is the key feature: knowledge stays fresh without manual effort.

- **Stale detection**: The hook flags topics where `last_verified` is >90 days old
- **Silent updates**: When Claude uses saved knowledge and discovers it's outdated (API changed, pattern deprecated, etc.), it silently fixes the file — no confirmation dialog, no interruption
- **Organic growth**: If Claude discovers valuable knowledge during normal work, it may save a new learning with a one-line notification

You never need to manually maintain your knowledge files. They evolve as you work.

### Knowledge Graph Integration (Optional)

If the `mcp__memory` MCP server is available, `/learn` also creates entities in the knowledge graph for semantic search. Entirely optional — the plugin works with just markdown files.

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
---

# TanStack Router

## TL;DR
<2-4 sentence summary>

## Core Concepts
<Key concepts with code examples>

## Practical Examples
<Runnable code>

## Gotchas & Pitfalls
<Common mistakes and how to avoid them>

## Quick Reference
<Cheat sheet>

## References
<Cited sources with URLs>
```

## Requirements

- Claude Code CLI
- Node.js (already required by Claude Code)
- No other external dependencies
- Works on macOS, Linux, and Windows

## License

MIT
