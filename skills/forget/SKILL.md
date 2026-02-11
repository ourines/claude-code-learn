---
name: forget
description: Delete saved knowledge from ~/.claude/learnings/ and optionally clean up knowledge graph.
allowed-tools:
  - Bash
  - Read
  - Glob
  - mcp__memory__search_nodes
  - mcp__memory__delete_entities
argument-hint: "<topic> - topic name or slug to delete. Omit to list all."
---

# forget

Delete saved knowledge from `~/.claude/learnings/`.

## Instructions

### 1. Parse Query

Argument: `$ARGUMENTS`

If empty, list all knowledge files and ask which to delete.

### 2. Find the File

Search `~/.claude/learnings/`:

1. **Exact slug**: `~/.claude/learnings/<slug>.md`
2. **Partial match**: `~/.claude/learnings/*<query>*.md`

If multiple matches, list them and ask the user to pick.

### 3. Confirm Deletion

Show the user:
- File path
- Topic name (from frontmatter)
- Created date

Ask: **"Delete this knowledge? (yes/no)"**

### 4. Delete

If confirmed:

**Delete the file:**
```bash
rm ~/.claude/learnings/<slug>.md
```

**Clean up knowledge graph (graceful fallback):**
- If `mcp__memory__search_nodes` and `mcp__memory__delete_entities` are available: search for a "learning" entity matching the topic and delete it.
- If MCP memory tools are NOT available: skip this step silently. The file deletion is sufficient.

**Confirm:**
> Deleted knowledge on "<topic>".
