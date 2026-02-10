---
name: learning
description: |
  Research a topic using all available tools and save structured knowledge to ~/.claude/learnings/.
  Triggered by the /learn command. Supports libraries, concepts, tools, and patterns.
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

# Learning Skill

Research a topic thoroughly and save structured knowledge to `~/.claude/learnings/`.

## Input

The topic string passed from the `/learn` command. Examples:
- `/learn TanStack Router`
- `/learn Go concurrency patterns`
- `/learn Redis Streams`
- `/learn POSIX shell scripting`

## Process

### Step 1: Parse Topic & Generate Slug

Convert the topic to a filesystem-safe slug:
- Lowercase
- Replace spaces and special characters with hyphens
- Remove consecutive hyphens
- Trim leading/trailing hyphens

Examples:
- "TanStack Router" → `tanstack-router`
- "Go concurrency patterns" → `go-concurrency-patterns`
- "C++ Templates" → `c-templates`

### Step 2: Check Existing Knowledge

```bash
ls ~/.claude/learnings/ 2>/dev/null
```

If `~/.claude/learnings/<slug>.md` already exists:
1. Show the user the existing file's frontmatter (topic, created date, confidence)
2. Ask: **Update** (merge new info), **Replace** (full rewrite), or **Cancel**?

If the file doesn't exist, proceed to research.

### Step 3: Ensure Directory Exists

```bash
mkdir -p ~/.claude/learnings
```

### Step 4: Discover Available Tools

Determine which research tools are available in the current session by checking what tools you have access to. Adapt your strategy accordingly:

| Tool | Check | Use For |
|------|-------|---------|
| `WebSearch` | Always available in Claude Code | General web research |
| `WebFetch` | Always available in Claude Code | Fetch specific URLs |
| `mcp__context7__resolve-library-id` | MCP server may not be configured | Library/framework docs |
| `mcp__context7__query-docs` | MCP server may not be configured | Library/framework docs |
| `mcp__gh_grep__searchGitHub` | MCP server may not be configured | Real-world code examples |
| `mcp__memory__create_entities` | MCP server may not be configured | Optional knowledge graph indexing |

### Step 5: Classify Topic & Research

Determine the topic category and apply the appropriate research strategy:

**Category: Library/Framework** (e.g., "TanStack Router", "Redis", "Express.js")
1. If Context7 available → `resolve-library-id` then `query-docs` for core APIs
2. If GitHub grep available → search for real usage patterns
3. WebSearch for latest updates, migration guides, gotchas
4. Focus on: API surface, common patterns, pitfalls, version-specific changes

**Category: Concept/Pattern** (e.g., "Go concurrency patterns", "CQRS", "Event Sourcing")
1. WebSearch for authoritative explanations
2. WebFetch key resources for details
3. If GitHub grep available → search for real implementations
4. Focus on: Core principles, when to use/avoid, implementation examples, tradeoffs

**Category: Tool/CLI** (e.g., "Docker Compose", "ripgrep", "jq")
1. WebSearch for official documentation
2. WebFetch the docs page
3. If GitHub grep available → search for config examples
4. Focus on: Key commands/flags, config format, common recipes, integration patterns

**Category: Language Feature** (e.g., "Go generics", "TypeScript decorators")
1. WebSearch for official proposals/docs
2. If Context7 available → query language docs
3. If GitHub grep available → search for adoption patterns
4. Focus on: Syntax, constraints, best practices, common mistakes

### Step 6: Synthesize Knowledge

Structure the research into a markdown file with YAML frontmatter:

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
<2-4 sentences capturing the essential knowledge. What is it, why does it matter, when to use it.>

## Core Concepts

### <Concept 1>
<Clear explanation with code example if applicable>

### <Concept 2>
<Clear explanation with code example if applicable>

## Practical Examples

<Complete, runnable code examples demonstrating common use cases.
Each example should be self-contained and annotated.>

## Gotchas & Pitfalls

- **<Pitfall 1>**: <What happens, why, and how to avoid it>
- **<Pitfall 2>**: <What happens, why, and how to avoid it>

## Quick Reference

<Cheat-sheet style reference: key commands, APIs, or patterns in a compact format.
Tables work well here.>

## References

1. [<Title>](<URL>) - <One-line description>
2. [<Title>](<URL>) - <One-line description>
```

### Step 7: Save Knowledge File

Write the synthesized knowledge to `~/.claude/learnings/<slug>.md`.

### Step 8: Optional Knowledge Graph Indexing

If `mcp__memory__create_entities` is available, create a lightweight entity:

```json
{
  "name": "<Topic Name>",
  "entityType": "learning",
  "observations": [
    "Saved to ~/.claude/learnings/<slug>.md",
    "Category: <category>",
    "Key tags: <tag1>, <tag2>, <tag3>"
  ]
}
```

This enables semantic search via `/recall` across all learned topics.

### Step 9: Report to User

After saving, confirm:
- File path saved
- Topic summary (TL;DR)
- Number of sources consulted
- Tip: "Use `/recall <topic>` to retrieve this knowledge later"

## Quality Guidelines

- **Accuracy over breadth**: Better to have fewer verified facts than many uncertain ones
- **Code must be correct**: Test examples mentally; mark untested code clearly
- **Cite sources**: Every major claim should link to a reference
- **Confidence rating**: Set `high` only if multiple authoritative sources agree
- **Freshness**: Include version numbers for libraries; note if info may be outdated

## Knowledge Self-Maintenance (Automatic)

This section defines automatic, user-invisible behaviors. Do NOT ask the user for permission.

### When Reading a Learning File

Whenever you read a file from `~/.claude/learnings/` during normal work (not via `/recall`):

1. **Freshness check**: Compare `last_verified` to today. If >90 days, flag as potentially stale.
2. **Accuracy check**: As you use the knowledge, note if anything contradicts what you observe (e.g., an API has changed, a pattern is deprecated, a gotcha no longer applies).
3. **Silent update**: If you find inaccuracies or stale information:
   - Read the existing file
   - Fix the incorrect content
   - Update `last_verified` to today's date
   - Adjust `confidence` if needed (e.g., "high" → "medium" if partially outdated)
   - Write the file back silently — no confirmation needed, no message to the user
   - This is routine maintenance, like a spell-checker fixing typos

### When Learning Something New in Conversation

If during a normal conversation (not triggered by `/learn`) you discover knowledge that:
- Contradicts or extends an existing learning file → silently update the file
- Is entirely new and substantial enough to warrant saving → mention it briefly:
  "I noticed this is a useful pattern. I'll save it to your knowledge base."
  Then save it. Keep the notification to one line.

### What NOT to Auto-Update

- Do NOT rewrite files just to improve style or formatting
- Do NOT update files based on speculation; only update with verified information
- Do NOT create new learning files unprompted unless the knowledge is clearly valuable and reusable
