---
cover: "../../assets/screenshots/vsc-ai-utilities.png"
coverAlt: "The public GitHub page of vsc-ai-utilities, my VS Code extension for AI-assisted coding."
title: "VS Code extensions for AI-assisted coding"
summary: "Two VS Code extensions that remove copy-paste busywork: a small public one for feeding context to AI tools, and a larger team one for running tests on changed files."
period: "2024 to 2025"
role: "Author and sole developer"
skills: ["TypeScript", "JavaScript", "VS Code Extension API", "webpack", "Git"]
links:
  - label: "vsc-ai-utilities on GitHub"
    url: "https://github.com/sgarcia-dev/vsc-ai-utilities"
order: 10
confidential: false
draft: false
---

## The problem

I spend most of my day in VS Code, and a lot of it pairing with AI coding tools. Three small chores kept slowing me down:

- Giving an AI assistant good context meant copying file paths and diffs by hand, one at a time.
- In a large monorepo, running the tests for "the files I changed" meant long CI waits or hand-typed commands.
- Small daily steps, like opening a file on GitHub, took a few clicks too many.

## My role

I was the only developer on both extensions. I wrote them, released them and decided what they should do.

- **vsc-ai-utilities** is a small public extension for my own AI workflow.
- The second extension is a larger one I built for a team of front end engineers on a big web codebase. That one is internal, so I describe it here without code.

## Key decisions

**Keep the public extension simple.** It is plain JavaScript with one module per command. Helpers return a result or an error object instead of throwing. Settings live in VS Code's normal configuration, so users can edit their own presets. Every choice goes through a QuickPick menu.

**Six commands, one job each.** They copy AI-ready context to the clipboard: file paths in several formats (GitHub link, Markdown link, relative or absolute), Aider commands, and git diffs for chosen files, a branch or a recent commit.

**Treat the team extension like a product.** It started as a single file and grew into strict TypeScript with a webpack build and a clear service layer for git, VS Code, task running and logging.

**Use native VS Code tasks and terminals.** Commands run tests for the current file (once, in watch mode or in the debugger), for every modified file (in sequence or in parallel), and for end-to-end runs by tag. The extension detects the project on its own.

**Move good ideas between the two.** The "copy git diff for AI" idea started in my personal tool and went into the team one.

## Outcome

The public extension became my daily way to hand context to AI assistants. The team extension reached a 1.0 release and then a 2.0 rewrite, shipped as versioned packages. Engineers got a one-command way to run the tests for their own changes locally instead of waiting on CI.

## What I learned

- Small tools win when each command does one thing and the menu is predictable.
- Returning errors as values made the code easier to test and easier to read than try and catch everywhere.
- The best features came from noticing my own repeated steps and automating them.
