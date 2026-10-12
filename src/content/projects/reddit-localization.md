---
cover: "../../assets/covers/reddit-localization.jpg"
coverAlt: "Illustration: people around a globe trading paper planes, each marked with a different script"
coverKind: "illustration"
title: "Breaking Reddit's language barrier with AI translation"
summary: "Removing the language barrier between Reddit users: I moved translation work to the server for speed, automated language launches with AI agents and built real-browser checks for AI changes."
period: "2024 to 2026"
role: "Senior Software Engineer, web translation team (led it for a period)"
company: "Reddit"
skills: ["Web performance", "Server-side rendering", "AI agent workflows", "TypeScript", "A/B testing", "Lit web components", "Playwright", "Localization"]
links: []
order: 10
confidential: true
draft: false
---

## The goal

Remove the language barrier between Reddit users. Someone who only reads Spanish, Hindi or Portuguese should be able to read a great English thread, and join it, in their own language. Reddit uses AI translation to make that possible across 40+ languages and millions of users. My job was to make it work well on the web.

## My role

I was a key member of Reddit's web translation team, and for a period I led it. I owned the web experience for translated posts and comments: the labels that show a post was translated, the controls to switch back to the original, and the settings behind them.

Three pieces of work stand out. Each one removed something that was slowing down either our readers or our team.

## 1. Moving translation work to the server

This is the work I am proudest of.

### What was slow, and why

When a reader opens a page, Reddit's server already sends the translated text inside the HTML. The page is correct before any JavaScript runs.

But every reader in the translation rollout also downloaded and ran the translation code in their browser. That code only matters when someone clicks to switch between the translation and the original, and most people never do. In the English rollout, about 90% of readers never saw a single post in another language. All of them still paid for that code: by our estimate, up to 250ms of extra browser work per page.

### Why it was not a quick fix

You can't just delete the code. The controls still have to work, and a click has to feel instant. A few details made it tricky:

- If a reader clicks before the code has loaded, the click can be lost.
- Switching a post also switches all of its comments, and the two must stay in sync.
- Changing the global translation setting has to update the page, even if the code never loaded.
- Feeds keep loading new posts as you scroll, so the page can't know up front whether it will need translation.

### What I designed and built

I wrote a plan covering the product, the current architecture, the problem and a proposed fix. I presented it to engineering managers and senior web platform engineers so they could find the weak spots before we committed. Then I built it in steps:

- **Load the code only when it is needed.** The translation code now waits until the reader actually views translated content. The server decides who is eligible. I moved the translation settings dialog into a small piece that always loads, so menus never wait on the bigger code.
- **Find the last piece that loaded early.** One part, the comment translation code, still started on every page. I traced it to how that part was rendered on the server, and wrote down the cause and the safe ways to fix it.
- **Let the server own the state.** The hardest problem was keeping a post and its comments in sync inside the browser. So I turned it around. When a reader switches a post, the page reloads and the server renders the post and every comment in the same state. Once the server owns that, the browser no longer needs translation code just to keep things in sync.

### How I proved it

I checked each step in a real browser, logged in and logged out, before it shipped. Then I ran a controlled experiment. For returning readers who already had a translation setting, pages skipped the browser translation code entirely. One version applied a switch on the next page. The other refreshed the page right away.

The early results were clearly positive: pages loaded faster, comments became usable sooner and the layout jumped around less.

### What it changed

It changed the team's direction. The next roadmap started by moving more translation work from the browser to the server, the approach this work had tested.

## 2. Automating language launches with AI agents

### The problem

Launching a new language looks simple from the outside: add it to the language picker. In practice it touched config, the translation build, QA, how logged-out readers get matched to a language, and translated legal pages like the privacy policy.

That knowledge was spread across the code, several overlapping wikis, old workshop notes and a few people's heads. Every launch depended on someone remembering the steps.

### What I did

- **One source of truth.** I pulled every source into a single runbook: how text moves from code to translators and back, the difference between a test language and a live one, how the right language is picked, and how to QA and release it. When sources disagreed, the code won, and the runbook said so.
- **Written for people and agents.** I wrote it so both engineers and AI coding agents could follow it. Then I automated the release steps as an AI agent workflow that works from the runbook.
- **Used on a real launch.** I coordinated the web side of a multi-language launch, including the status of the translated legal pages.

Launches stopped depending on anyone's memory.

## 3. A verification pipeline for AI-assisted work

### The problem

AI coding tools made changes fast to write, but not fast to trust. A change could pass every test and still break the page for a real reader. Translation is especially hard to check: what a reader sees depends on their language, whether they are logged in, which experiments they are in and how they arrived. I wanted the team to move faster without guessing.

### What I built

- **Real-browser checks.** Step-by-step runbooks that an AI agent runs against a local copy of the site in a real browser. They cover the translation settings, the translation labels and controls, and translated pages for visitors from search. To prove they worked, I gave an agent only the written runbooks, with no other context, and it completed a full pass on its own.
- **Checks for "tests pass, product broken".** Quality rules that catch the cases where every test is green but the feature does not actually work.
- **Review with domain knowledge.** AI code review prompts that bring the team's translation knowledge to every change.
- **Spec-driven development.** A small, reversible pilot for keeping specs, decisions and code in step, written up so the team could adopt it.

I moved the browser checks out of my own notes and into the shared codebase, so anyone on the team could run them. The tools I built to speed up daily work are in a separate case study: [Tools that make the whole team faster](/projects/developer-tools/).

## Outcome

- **Faster pages.** In a controlled experiment, skipping the browser translation code made pages load faster, with less layout shift.
- **A new direction.** The team's next roadmap moved more translation work from the browser to the server.
- **Calmer launches.** New languages follow one runbook and an agent workflow instead of memory.
- **Trusted AI changes.** AI-assisted changes get checked in a real browser, by a process anyone on the team can run.

This work is internal, so there are no screenshots or code to show.

## What I learned

- The fastest code is code the reader never downloads. Ask who actually needs it before you try to make it faster.
- When the browser struggles to keep state in sync, let the server own the state.
- A plan shared early, with its weak spots named, gets better feedback than a finished design.
- Knowledge that lives in people's heads is a launch risk. Writing it down once, for people and agents, removes it.
- AI makes changes cheap. Checking them in a real browser is what makes them trustworthy.
