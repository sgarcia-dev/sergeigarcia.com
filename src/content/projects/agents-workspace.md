---
cover: "../../assets/covers/agents-workspace.jpg"
coverAlt: "Illustration: a conductor directing four robot helpers"
coverKind: "illustration"
title: "The Agents workspace"
summary: "A plain-text, git-tracked home for how I work with AI coding tools, so context, decisions and rules carry over between sessions and between tools."
period: "2026 to now"
role: "Creator and sole maintainer"
skills: ["Git", "Markdown", "Shell scripting", "Model Context Protocol", "AI agents"]
links: []
order: 60
confidential: false
draft: false
---

## The problem

I use several AI coding tools every day, including Claude Code, Codex, Cursor, Gemini CLI, OpenCode and Hermes. Each keeps its own instructions, memory and settings. Three problems kept showing up:

- **Lost context.** Code and docs do not capture why a decision was made. Every new AI session starts from zero, so long tasks get rebuilt instead of resumed.
- **Tool lock-in.** Rules stored inside one vendor's product are lost when the product changes or a better one appears.
- **Drift.** Instructions copied by hand across tools quietly fall out of sync.

## My role

I created the workspace and I am its only maintainer. The repository is private, so this is a write-up of the design.

## Key decisions

**One source of truth.** The guiding rule is that tools adapt to the workspace, never the other way round. Each tool gets a thin adapter. Any difference between a tool and the workspace is recorded and either fixed or approved on purpose.

**Organize by purpose.** Reusable procedures (skills), specialist behaviors (roles), tool bridges, per-tool mappings and larger workflows each have a home. A short always-on file and an index load more detail only when needed, which keeps each session's context small.

**Plan, execute, reconcile in fresh phases.** For serious work, each phase talks to the next only through files on disk. Any phase can restart in a new session without relying on chat history.

**Durable memory with owners.** State, decisions, specs and a code map each have clear update rules. The git log is the changelog, and each commit message says why a change was made.

**Rules for AI workers.** Tasks go out in bounded packets. Workers cannot start other workers. The top-level agent keeps architecture and final checks.

**Safety boundaries.** One tool's configuration changes per session, routine permissions are defined up front, and sensitive material lives in a separate private repository.

## Outcome

Since June 2026 the workspace has grown past 1,400 commits, with adapters for six AI tools. Work now carries over between sessions and between tools. Switching to or adding a tool means writing an adapter, not starting over.

This website was built with it. Research, planning and decisions for the site are recorded in the same workspace.

## What I learned

- The reasons behind a decision are worth more than the code that came from it, and they are the first thing lost.
- Short always-on rules plus on-demand detail work better than one giant instruction file.
- Giving AI workers a narrow, written task gets far better results than a vague one.
- Plain text in git outlasts any single tool.
