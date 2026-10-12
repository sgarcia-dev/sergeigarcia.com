---
cover: "../../assets/covers/developer-tools.jpg"
coverAlt: "Illustration: laying the last plank of a bridge while teammates cross"
coverKind: "illustration"
gallery:
  - src: "../../assets/screenshots/vsc-ai-utilities.png"
    alt: "The public GitHub page of vsc-ai-utilities, my VS Code extension for AI-assisted coding."
galleryCaption: "vsc-ai-utilities, the public extension, on GitHub."
title: "Tools that make the whole team faster"
summary: "When I spot daily friction for my teammates, I build the tool that removes it. Two VS Code extensions and a Chrome DevTools extension, all started without being asked."
period: "2024 to 2026"
role: "Author and lead developer"
company: "Reddit"
skills: ["TypeScript", "JavaScript", "Chrome extensions", "VS Code Extension API", "Vite"]
links:
  - label: "vsc-ai-utilities on GitHub"
    url: "https://github.com/sgarcia-dev/vsc-ai-utilities"
order: 10
confidential: false
draft: false
---

## The habit

I notice the small chores that slow people down, and I build a tool to remove them. Nobody asked for these. I saw the same steps repeated every day, by me and by my teammates, and I decided they should take one click instead of many. Three tools came out of that habit, and they are described below.

## The problem

I spend most of my day in VS Code and in the browser, and a lot of it pairing with AI coding tools. Front end engineers on a large web app, Reddit's web app, kept hitting the same chores:

- Giving an AI assistant good context meant copying file paths and diffs by hand, one at a time.
- In a large monorepo, running the tests for "the files I changed" meant long CI waits or hand-typed commands.
- Small daily steps, like opening a file on GitHub, took a few clicks too many.
- Testing a feature behind an experiment flag or a special request header meant editing requests by hand, then redoing it after every reload.
- Finding which data a part of the page used, and which fetched fields went unused, meant digging through network logs.
- Sharing an exact debug setup with a teammate had no easy path.

## My role

I designed, built and released all three tools, and decided what they should do. The first is public. The other two are internal, so this page describes them without code or screenshots.

## The public VS Code extension

**vsc-ai-utilities** is a small extension for my own AI workflow, and its code is on GitHub. It is plain JavaScript with one module per command. Helpers return a result or an error object instead of throwing. Settings live in VS Code's normal configuration, so users can edit their own presets. Every choice goes through a QuickPick menu.

It has six commands, one job each. They copy AI-ready context to the clipboard: file paths in several formats (GitHub link, Markdown link, relative or absolute), Aider commands, and git diffs for chosen files, a branch or a recent commit.

## The team VS Code extension

I built a larger extension for a team of front end engineers on a big web codebase. It started as a single file and grew into strict TypeScript with a webpack build and a clear service layer for git, VS Code, task running and logging.

- It runs tests for the current file (once, in watch mode or in the debugger), for every modified file (in sequence or in parallel), and for end-to-end runs by tag. It uses native VS Code tasks and terminals and detects the project on its own.
- It opens code on GitHub in one command.
- It copies a git diff for AI tools. That idea started in my personal extension and moved into the team one.

## The Chrome DevTools extension

I built this inside Chrome DevTools with Manifest V3, Vite, TypeScript and Vitest.

- **Header overrides.** They use Chrome's declarativeNetRequest API, so they survive reloads and do not need broad access to every page.
- **Experiment inspector.** Engineers can filter and edit variants inline.
- **GraphQL inspector.** It shows each operation's query, variables, response and timing, and whether each field was used on the server, on the client or not at all. It fills in as data arrives.
- **Shareable configs.** Overrides can be encoded into a link and imported with a confirmation step, so a teammate can reproduce a bug in one click.

Chrome APIs sit behind small interfaces (ports and adapters), so the main logic can be unit tested without a browser. The popup renders in two phases so it opens instantly, and permissions are limited to specific hosts.

## Outcome

The public extension became my daily way to hand context to AI assistants. The team extension reached a 1.0 release and then a 2.0 rewrite, shipped as versioned packages. Engineers got a one-command way to run the tests for their own changes locally instead of waiting on CI. The Chrome extension shipped as an internal 1.0 release and was demoed at an internal hackathon. I do not have adoption numbers, so I will not quote any.

## What I learned

- Small tools win when each command does one thing and the menu is predictable.
- Tools for other engineers need to feel instant. Small delays kill the habit of using them.
- Narrow permissions are a feature. They make a tool easier to approve and to trust.
- Returning errors as values, and putting browser APIs behind interfaces, made the code easier to test and read.
- The best features came from noticing repeated steps and automating them. Sharing a setup by link turns a debug session into something a teammate can reproduce.
