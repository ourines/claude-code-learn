---
name: learn
description: Research a topic and save structured knowledge to ~/.claude/learnings/ for use in future sessions.
argument-hint: "<topic> - e.g., 'TanStack Router', 'Go concurrency patterns'"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - WebFetch
  - Task
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
  - mcp__gh_grep__searchGitHub
  - mcp__memory__create_entities
  - mcp__memory__search_nodes
---

# learn

Research a topic and save structured knowledge to `~/.claude/learnings/` for future session use.

## Input

Topic string from `$ARGUMENTS`. Examples:
- `TanStack Router`
- `Go concurrency patterns`
- `Redis Streams`

## Process

### 1. Generate Slug

Convert topic to filesystem-safe slug: lowercase, replace non-alphanumeric with hyphens, collapse consecutive hyphens, trim.

- "TanStack Router" -> `tanstack-router`
- "Go concurrency patterns" -> `go-concurrency-patterns`

### 2. Check Existing Knowledge

```bash
ls ~/.claude/learnings/<slug>.md 2>/dev/null
```

If the file exists, read its frontmatter. Ask the user: **Update** (merge new findings), **Replace** (full rewrite), or **Cancel**?

### 3. Ensure Directory

```bash
mkdir -p ~/.claude/learnings
```

### 4. Research

Use available tools based on topic category. Adapt if MCP tools are unavailable.

**Library/Framework** (e.g., "TanStack Router", "Express.js"):
1. Context7 `resolve-library-id` + `query-docs` for API surface
2. GitHub grep for real-world usage patterns
3. WebSearch for version-specific changes, migration notes, known issues

**Concept/Pattern** (e.g., "CQRS", "Go concurrency patterns"):
1. WebSearch for authoritative sources
2. WebFetch key references
3. GitHub grep for real implementations

**Tool/CLI** (e.g., "Docker Compose", "jq"):
1. WebSearch for official docs
2. WebFetch documentation pages
3. GitHub grep for config/usage examples

**Language Feature** (e.g., "Go generics", "TypeScript decorators"):
1. WebSearch for official specs/proposals
2. Context7 for language docs if available
3. GitHub grep for adoption patterns

### 5. Save Knowledge File

Write to `~/.claude/learnings/<slug>.md` using this format:

```markdown
---
topic: "<Original Topic Name>"
slug: "<slug>"
category: "<library|concept|tool|language-feature>"
created: "<YYYY-MM-DD>"
last_verified: "<YYYY-MM-DD>"
confidence: "<high|medium|low>"
tags: [<relevant, tags>]
sources_count: <N>
---

# <Topic Name>

## TL;DR
<2-4 sentences: what it is, key capabilities, primary use case.>

## Core APIs / Concepts

### <Name>
- **Signature/Usage**: `<code>`
- **Purpose**: <one line>
- **Example**:
```<lang>
<minimal working example>
```

### <Name>
...

## Patterns & Recipes

<Common usage patterns as self-contained code blocks. Annotate sparingly -- only non-obvious details.>

## Gotchas

- **<Issue>**: <What happens + fix/workaround>
- **<Issue>**: <What happens + fix/workaround>

## Quick Reference

<Compact table or list: key APIs, flags, commands. Optimized for fast lookup.>

## Sources

1. [<Title>](<URL>)
2. [<Title>](<URL>)
```

### 6. Knowledge Graph Indexing (Optional)

If `mcp__memory__create_entities` is available, create an entity:

```json
{
  "name": "<Topic Name>",
  "entityType": "learning",
  "observations": [
    "Saved to ~/.claude/learnings/<slug>.md",
    "Category: <category>",
    "Tags: <tag1>, <tag2>"
  ]
}
```

### 7. Confirm

Tell the user: file path, topic name, source count, and that `/recall <topic>` retrieves it.

## Quality Rules

- Accuracy over breadth. Fewer verified facts > many uncertain ones.
- Code examples must be correct and minimal. Mark untested code with `// untested`.
- Set confidence `high` only when multiple authoritative sources agree.
- Include version numbers for libraries. Note if info may become outdated quickly.

## Self-Maintenance

When reading any `~/.claude/learnings/` file during normal work:

1. If `last_verified` is >90 days old, treat content as potentially stale.
2. If you find inaccuracies during use, silently update the file: fix content, bump `last_verified`, adjust `confidence`. No user confirmation needed.
3. Do NOT rewrite files for style. Only update with verified corrections.
