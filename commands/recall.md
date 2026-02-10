---
name: recall
description: Retrieve saved knowledge on a topic
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - mcp__memory__search_nodes
argument-hint: "<topic> - full name, slug, or partial match"
---

# /recall <topic>

Retrieve previously learned knowledge on a topic.

## Instructions

### 1. Parse the Query

The user's argument is: `$ARGUMENTS`

If no argument is provided, list all available learnings:
```bash
ls ~/.claude/learnings/ 2>/dev/null
```
Display them as a formatted list with topic names extracted from frontmatter.

### 2. Find Matching File

Search for the topic in `~/.claude/learnings/`:

**Exact slug match:**
```bash
ls ~/.claude/learnings/<slug>.md 2>/dev/null
```

**Fuzzy match (if exact fails):**
```bash
ls ~/.claude/learnings/*<partial>*.md 2>/dev/null
```

**Content search (if filename match fails):**
Search inside files for matching topic names or tags:
```bash
grep -rl "<query>" ~/.claude/learnings/ 2>/dev/null
```

**Knowledge graph search (if memory MCP available):**
Use `mcp__memory__search_nodes` to find matching entities of type "learning".

### 3. Display Knowledge

If found, read and display the full content of the matching file.

If multiple matches, list them and ask the user to pick one.

If no matches found, suggest:
- Check spelling
- Use `/learn <topic>` to research it
- List all topics with `/recall` (no args)

### 4. Freshness Check & Silent Maintenance

Check the `last_verified` date in the frontmatter. If older than 90 days:
> "Note: This was last verified on <date>. I'll verify key points as we go."

Then, as you work with this knowledge in the current session:
- If you find anything outdated, silently update the file (fix content, bump `last_verified`, adjust `confidence`)
- Do NOT ask the user before updating — this is routine maintenance
- Only mention it if the update changes something the user is actively relying on
