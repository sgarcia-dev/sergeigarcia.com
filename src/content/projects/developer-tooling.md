---
title: "Developer tooling for Chrome and VS Code"
summary: "A Chrome DevTools extension and a VS Code companion that turned daily debugging chores for front end engineers into one click."
period: "2024 to 2026"
role: "Author and lead developer"
company: "Reddit"
skills: ["Chrome extensions", "TypeScript", "Vite", "Vitest", "VS Code Extension API"]
links: []
order: 30
confidential: true
draft: false
---

## The problem

Front end engineers on a large web app repeated the same chores every day:

- Testing a feature behind an experiment flag or a special request header meant editing requests by hand, then redoing it after every reload.
- Finding which data a part of the page used, and which fetched fields went unused, meant digging through network logs.
- Sharing an exact debug setup with a teammate had no easy path.

## My role

I designed and built both tools and led the work. They live where engineers already work, the browser and the editor. They are internal, so this page describes them without code or screenshots.

## Key decisions

**Build inside Chrome DevTools.** The extension uses Manifest V3 with Vite, TypeScript and Vitest. Header overrides use Chrome's declarativeNetRequest API, so they survive reloads and do not need broad access to every page.

**Show the data, not just the network log.** An experiment inspector lets engineers filter and edit variants inline. A GraphQL inspector shows each operation's query, variables, response and timing, and whether each field was used on the server, on the client or not at all. It fills in as data arrives.

**Make setups shareable.** Overrides can be encoded into a link and imported with a confirmation step, so a teammate can reproduce a bug in one click.

**Keep the core testable.** Chrome APIs sit behind small interfaces (ports and adapters), so the main logic can be unit tested without a browser.

**Stay fast and narrow.** The popup renders in two phases so it opens instantly, and permissions are limited to specific hosts.

**Pair it with the editor.** The VS Code companion runs tests for changed files and jumps from code to its GitHub source. It is the team extension described in the VS Code extensions case study.

## Outcome

Engineers got one place in the browser to set up and inspect debug states, and a matching set of editor commands. The Chrome extension shipped as an internal 1.0 release and was demoed at an internal hackathon. I do not have adoption numbers, so I will not quote any.

## What I learned

- Tools for other engineers need to feel instant. Small delays kill the habit of using them.
- Narrow permissions are a feature. They make a tool easier to approve and to trust.
- Putting browser APIs behind interfaces keeps the core logic easy to test and easy to change.
- Sharing a setup by link turns a debug session into something a teammate can reproduce, so I treat "send this to a teammate" as a first-class use case.
