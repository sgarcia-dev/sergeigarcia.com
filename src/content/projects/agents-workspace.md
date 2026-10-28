---
cover: "../../assets/posts/agents-workspace/cover-system-map.png"
coverAlt: "A diagram of the system: me, then a root AI session in any tool, then one folder of rules, skills, roles, models and specs, with search, checks, reports and traces underneath."
coverKind: "screenshot"
title: "The Agents workspace"
summary: "A ==plain-text, git-tracked system== for running AI agents: shared memory, a local search engine, cheap workers with strong checks, and ==rules enforced by code==."
period: "2026 to now"
role: "Creator and sole maintainer"
skills: ["AI agents", "Agent orchestration", "LLM evals", "Observability", "Python", "Git"]
links: []
order: 30
confidential: false
draft: false
---

## The problem

I run most of my work through AI agents in Claude Code, Codex, OpenCode and Gemini. Three problems kept showing up:

- **Lost context.** Every new session starts from zero, so long tasks get rebuilt instead of resumed.
- **Tool lock-in.** Rules stored inside one vendor's tool are lost when I switch tools.
- **Unchecked work.** Agents report success with full confidence, right or wrong.

## My role

I designed and built the system and I am its only maintainer. On 19 October 2026 I rebuilt it from scratch. The repositories are private, so this is a write-up of the design. The [full tour](/writing/agents-workspace-tour/) has diagrams of every part.

## Key decisions

**One rulebook for every tool.** Every session loads one short `AGENTS.md`, linked into each tool's own instruction file. Rules, skills and roles load only when the task needs them, so context stays small.

**Memory as specs in git.** Each topic has one spec that says what is true now, with its decisions, research and task folders beside it. Each fact has one home, and git records why every change was made.

**A search engine built for agents.** A local index combines full-text search with a local embedding model. Each result gives the exact lines and a file hash, so agents can cite sources and notice when a file has changed.

**One work loop.** Plan, write a packet, send it to a worker, check the result against evidence, then accept it and update the spec. Workers report. Only the root accepts.

**Strong models for judgment, cheap ones for checkable work.** One file picks the model and effort for every role in every tool. Workers never start workers.

**Rules enforced by code.** Hooks guard private data, block nested workers, stop overspending and validate every changed file when a session ends. No model decides whether a rule applies.

**Measured, not guessed.** Traces, cost reports and context reports show what agents did. Evals follow one recipe: set the default first, score with code where possible, and report the gap with a range.

## Outcome

Since the rebuild the system and its specs have grown <span class="lv-mark">past 800 commits</span>. The migration moved every spec with <span class="lv-mark">zero files lost</span>. The search tool finds the right file in the top five for 62% of benchmark questions, against about 49% for word or meaning search alone.

<span class="lv-mark">This website was built with it</span>, and so was the rebuild itself.

## What I learned

- Agents read rules. They obey checks. The rules that must always hold belong in code.
- A worker's word is not evidence. Every result needs a command output or the lines it read.
- Short always-on rules plus on-demand detail work better than one giant instruction file.
- Plain text in git outlasts any single tool.
