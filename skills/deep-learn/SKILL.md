---
name: deep-learn
description: Deep research a topic using parallel agents, then synthesize and save comprehensive knowledge to ~/.claude/learnings/.
argument-hint: "<topic> - e.g., 'TanStack Router', 'Kubernetes networking', 'Rust ownership'"
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
  - TeamCreate
  - SendMessage
  - TaskCreate
  - TaskUpdate
  - TaskList
  - TaskGet
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
  - mcp__gh_grep__searchGitHub
  - mcp__memory__create_entities
  - mcp__memory__search_nodes
---

# deep-learn

Deep research a topic using parallel agents. Each agent explores a different dimension simultaneously, then results are synthesized into a comprehensive knowledge file.

## Input

Topic string from `$ARGUMENTS`.

## Process

### 1. Generate Slug & Check Existing

Convert topic to slug (lowercase, hyphens). Check `~/.claude/learnings/<slug>.md`.
If exists, read frontmatter. Ask user: **Update**, **Replace**, or **Cancel**.

```bash
mkdir -p ~/.claude/learnings
```

### 2. Analyze Topic & Choose Strategy

Determine the topic category, research dimensions, and agent count. Then decide **how** to orchestrate.

**You have two orchestration modes — choose based on the situation:**

#### Mode A: Subagents (Task tool, no team)

Fire-and-forget parallel agents. Each works independently, you synthesize after all return.

**Best for:**
- Independent research dimensions that don't build on each other
- Well-defined topics where you know what to look for upfront
- 2-4 agents with clear, non-overlapping assignments

#### Mode B: Team Agents (TeamCreate + coordinated tasks)

Create a team with shared task list. Agents can communicate, report partial findings, and you can dynamically assign follow-up work.

**Best for:**
- Broad or unfamiliar topics where initial research may reveal unexpected subtopics
- Iterative deepening: first wave scouts the landscape, second wave digs into what matters
- Complex topics where one agent's findings should influence another's direction
- 4+ agents or multi-round research

**Decision guideline:**

| Signal | → Mode |
|--------|--------|
| You can enumerate all research dimensions upfront | Subagents |
| Topic is well-scoped (e.g., "React useEffect cleanup") | Subagents |
| Topic is broad or vague (e.g., "Kubernetes networking") | Team |
| You might need a second research round based on findings | Team |
| Agent findings may overlap or conflict and need real-time coordination | Team |

**Agent count guideline:**

| Topic Type | Suggested Agents |
|-----------|-----------------|
| Library/Framework | 3-4: docs, code patterns, gotchas, ecosystem |
| Concept/Pattern | 2-3: theory, implementations, comparisons |
| Tool/CLI | 2-3: official docs, config recipes, troubleshooting |
| Language Feature | 2-3: spec/docs, adoption patterns, edge cases |
| Complex/Broad Topic | 4-5: split by subtopic areas |

You are NOT locked into these. Use your judgment. Scale up or down as needed.

### 3. Execute Research

#### If using Subagents (Mode A):

Use the `Task` tool with `subagent_type: "general-purpose"` to spawn agents **in parallel** (multiple Task calls in a single message). Each gets a focused prompt and returns structured findings.

#### If using Team Agents (Mode B):

1. `TeamCreate` — create a research team
2. `TaskCreate` — create tasks for each research dimension
3. `Task` with `team_name` — spawn named agents, assign tasks
4. Monitor progress via `TaskList`. When an agent reports interesting findings via `SendMessage`, decide whether to:
   - Create follow-up tasks for deeper investigation
   - Redirect other agents to explore related areas
   - Spawn additional agents for newly discovered subtopics
5. When all tasks are complete, shut down agents and delete the team

#### Agent prompt template (both modes):

```
Research "<topic>" focusing on: <specific dimension>.

Use these tools as needed:
- WebSearch / WebFetch for web sources
- mcp__context7__resolve-library-id + query-docs for library docs
- mcp__gh_grep__searchGitHub for real-world code

Return your findings as structured markdown:
## <Dimension Name>
### Key Findings
- ...
### Code Examples
```lang
...
```
### Sources
1. [Title](URL)

Be thorough but concise. Prioritize accuracy and code correctness.
Focus ONLY on your assigned dimension — other agents cover the rest.
```

### 4. Synthesize Results

After all agents return, merge their findings:

1. **Deduplicate** — remove overlapping content, keep the better version
2. **Cross-validate** — if agents disagree, flag the conflict or verify
3. **Organize** — structure into the standard knowledge format
4. **Attribute** — collect all sources from all agents

### 5. Save Knowledge File

Write to `~/.claude/learnings/<slug>.md`:

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
research_depth: "deep"
agents_used: <N>
strategy: "<subagents|team>"
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

## Patterns & Recipes

<Common usage patterns as self-contained code blocks.>

## Gotchas

- **<Issue>**: <What happens + fix/workaround>

## Advanced Topics

<Deeper material that basic /learn would skip: internals, performance, edge cases, architecture decisions.>

## Quick Reference

<Compact table or list for fast lookup.>

## Sources

1. [<Title>](<URL>) — <which agent found this>
```

### 6. Knowledge Graph Indexing (Optional)

If `mcp__memory__create_entities` is available:

```json
{
  "name": "<Topic Name>",
  "entityType": "learning",
  "observations": [
    "Saved to ~/.claude/learnings/<slug>.md",
    "Category: <category>",
    "Research depth: deep (<N> agents)",
    "Tags: <tag1>, <tag2>"
  ]
}
```

### 7. Report

Tell the user:
- File path
- How many agents were used and their dimensions
- Source count
- Key highlights (3-5 bullet points of most valuable findings)

## Quality Rules

- Each agent's findings are cross-checked during synthesis. Conflicting info is resolved or flagged.
- Code examples must be correct. Mark untested code with `// untested`.
- Set confidence `high` only when multiple agents' sources agree.
- Include version numbers for libraries.
- The `research_depth: "deep"` and `agents_used` fields in frontmatter distinguish deep-learn output from regular /learn.
