---
name: recall
description: Load saved knowledge from ~/.claude/learnings/ into the current session context.
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - mcp__memory__search_nodes
argument-hint: "<topic> - full name, slug, or partial match. Omit to list all."
---

# recall

Load saved knowledge from `~/.claude/learnings/` into the current session context.

## Instructions

### 1. Parse Query

Argument: `$ARGUMENTS`

If empty, list all available knowledge files:
```bash
ls ~/.claude/learnings/*.md 2>/dev/null
```
Display as a list with topic names extracted from frontmatter. Stop here.

### 2. Find Matching File

Search `~/.claude/learnings/` in this order:

1. **Exact slug**: `~/.claude/learnings/<slug>.md`
2. **Partial filename**: `~/.claude/learnings/*<query>*.md`
3. **Content search**: grep topic/tags inside files
4. **Knowledge graph** (if `mcp__memory__search_nodes` available): search for entities of type "learning"

If multiple matches, list them and ask the user to pick one.

If no matches, tell the user: no knowledge found, suggest `/learn <topic>`.

### 3. Load Knowledge

Read the matching file. Absorb the content into your working context. Use it to inform your responses for the rest of the session.

Do NOT recite the entire file back to the user. Instead, confirm briefly:

> Loaded knowledge on "<topic>" (verified <date>, confidence: <level>).

If the user asks for details, then share relevant sections.

### 4. Freshness Check

If `last_verified` is >90 days old, note it once:

> Note: Last verified <date>. Will cross-check key details as needed.

If you discover outdated content during the session, silently update the file (fix content, bump `last_verified`, adjust `confidence`). No user confirmation needed for routine maintenance.
