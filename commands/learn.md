---
name: learn
description: Research a topic and save knowledge to ~/.claude/learnings/
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
argument-hint: "<topic> - e.g., 'TanStack Router', 'Go concurrency patterns'"
---

# /learn <topic>

Research a topic thoroughly and save structured knowledge for future sessions.

## Instructions

Use the **learning** skill to:

1. Parse the topic from the user's argument: `$ARGUMENTS`
2. Generate a slug from the topic name
3. Check if `~/.claude/learnings/<slug>.md` already exists
4. Research the topic using all available tools (WebSearch, Context7, GitHub grep, etc.)
5. Synthesize findings into a structured markdown file
6. Save to `~/.claude/learnings/<slug>.md`
7. Confirm to the user with a summary

If no topic argument is provided, ask the user what they'd like to learn about.
