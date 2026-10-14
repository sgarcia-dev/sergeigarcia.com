---
cover: "../../assets/covers/developer-tools.jpg"
coverAlt: "Illustration: a builder at a workbench handing tools to teammates"
coverKind: "illustration"
title: "Tools that make the whole team faster"
summary: "When I spot daily friction for my teammates, ==I build the tool that removes it==. A VS Code extension and a Chrome DevTools extension, both ==started without being asked==."
period: "2024 to 2026"
role: "Author and lead developer"
company: "Reddit"
skills: ["TypeScript", "VS Code Extension API", "Chrome extensions", "Vite", "Vitest"]
links: []
order: 20
confidential: false
draft: false
---

## The habit

I notice the small chores that slow people down, and I build a tool to remove them. Nobody asked for these. I saw the same steps repeated every day, by me and by my teammates, and I decided they should take one click instead of many. Two tools came out of that habit, and they are described below.

## The problem

I spend most of my day in VS Code and in the browser, and a lot of it pairing with AI coding tools. Front end engineers on a large web app, Reddit's web app, kept hitting the same chores:

- Giving an AI assistant good context meant copying file paths and diffs by hand, one at a time.
- In a large monorepo, running the tests for "the files I changed" meant long CI waits or hand-typed commands.
- Small daily steps, like opening a file on GitHub, took a few clicks too many.
- Testing a feature behind an experiment flag or a special request header meant editing requests by hand, then redoing it after every reload.
- Finding which data a part of the page used, and which fetched fields went unused, meant digging through network logs.
- Sharing an exact debug setup with a teammate had no easy path.

## My role

I designed, built and released both tools, and decided what they should do. Both are internal, so this page describes what they do, without code or screenshots.

## The VS Code extension

One extension that puts the team's everyday commands one click away, inside the editor. It started as a single file and grew into strict TypeScript with a clear service layer for git, VS Code, task running and logging. It detects the project on its own, so there is nothing to set up.

- **Run scripts for the file you are in.** Pick a script and it runs against the current file, no typing paths.
- **Run tests.** For the current file (once, in watch mode or in the debugger), for every file you changed (one after another or in parallel), or end-to-end tests by tag.
- **Set up the debugger for you.** It writes the debug configuration automatically, so stepping through a test or the app takes one command.
- **Switch environments.** Common environment commands live in one menu instead of a wiki page.
- **Hand context to AI tools.** Copy file paths and git diffs in a format an AI assistant can use.
- **Open the code on GitHub** in one command.

## The Chrome DevTools extension

I built this inside Chrome DevTools with Manifest V3, Vite, TypeScript and Vitest.

- **Header overrides.** They use Chrome's declarativeNetRequest API, so they survive reloads and do not need broad access to every page.
- **Experiment inspector.** Engineers can filter and edit variants inline.
- **GraphQL inspector.** It shows each operation's query, variables, response and timing, and whether each field was used on the server, on the client or not at all. It fills in as data arrives.
- **Shareable configs.** Overrides can be encoded into a link and imported with a confirmation step, so a teammate can reproduce a bug in one click.

Chrome APIs sit behind small interfaces (ports and adapters), so the main logic can be unit tested without a browser. The popup renders in two phases so it opens instantly, and permissions are limited to specific hosts.

## Outcome

The VS Code extension reached a <span class="lv-mark">1.0 release and then a 2.0 rewrite</span>, shipped as versioned packages. Engineers got a one-command way to run the tests for their own changes locally <span class="lv-mark">instead of waiting on CI</span>. The Chrome extension shipped as an internal 1.0 release and was <span class="lv-mark">demoed at an internal hackathon</span>. I do not have adoption numbers, so I will not quote any.

## What I learned

- Small tools win when each command does one thing and the menu is predictable.
- Tools for other engineers need to feel instant. Small delays kill the habit of using them.
- Narrow permissions are a feature. They make a tool easier to approve and to trust.
- Returning errors as values, and putting browser APIs behind interfaces, made the code easier to test and read.
- The best features came from noticing repeated steps and automating them. Sharing a setup by link turns a debug session into something a teammate can reproduce.
