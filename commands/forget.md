---
name: forget
description: Delete saved knowledge on a topic
allowed-tools:
  - Bash
  - Read
  - Glob
  - mcp__memory__delete_entities
argument-hint: "<topic> - topic name or slug to delete"
---

# /forget <topic>

Delete previously saved knowledge on a topic.

## Instructions

### 1. Parse the Query

The user's argument is: `$ARGUMENTS`

If no argument is provided, list all available learnings and ask which to delete.

### 2. Find the File

Search for the topic in `~/.claude/learnings/`:

**Exact slug match:**
```bash
ls ~/.claude/learnings/<slug>.md 2>/dev/null
```

**Fuzzy match:**
```bash
ls ~/.claude/learnings/*<partial>*.md 2>/dev/null
```

### 3. Confirm Deletion

Show the user:
- File path
- Topic name (from frontmatter)
- Created date
- Brief TL;DR

Then ask for confirmation: **"Delete this knowledge? (yes/no)"**

### 4. Delete

If confirmed:

**Delete the file:**
```bash
rm ~/.claude/learnings/<slug>.md
```

**Clean up knowledge graph (if memory MCP available):**
Use `mcp__memory__delete_entities` to remove the corresponding entity.

**Confirm to the user:**
> "Deleted knowledge on '<topic>'. Use `/learn <topic>` to re-learn it later."

If not confirmed, cancel and inform the user.
