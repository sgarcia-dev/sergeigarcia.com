---
cover: "../../assets/covers/reddit-localization.jpg"
coverAlt: "Illustration: people around a globe trading paper planes, each marked with a different script"
coverKind: "illustration"
title: "Breaking Reddit's language barrier with AI translation"
summary: "As web lead for Reddit's translations team, I moved translation work to the server for speed, automated language launches with AI agents and built real-browser checks for AI changes."
period: "Nov 2023 to Sep 2026"
role: "Senior Software Engineer, web lead for the translations team"
company: "Reddit"
skills: ["Web performance", "Server-side rendering", "AI agent workflows", "TypeScript", "A/B testing", "Lit web components", "Playwright", "Localization"]
links: []
order: 10
confidential: true
draft: false
---

## The goal

Remove the language barrier between Reddit users. Someone who only reads Spanish, Hindi or Portuguese should be able to read a great English thread, and join it, in their own language. Reddit uses AI translation to make that possible across 40+ countries, 20+ languages and millions of users. My job was to make it work well on the web.

## My role

I was the web lead for Reddit's translations team, and I held that role until I left Reddit. I owned the whole web experience for translated posts and comments: the labels that show a post was translated, the controls to switch back to the original, the settings behind them, and the tests, guides and tools that keep it all working.

As lead, I set the technical direction for translations on the web. I wrote the plans, made the calls on trade-offs, brought product managers, engineering managers and senior engineers to agreement, and onboarded the engineers who joined the team after me.

Three pieces of work stand out. Each removed something slowing down our readers or our team.

## 1. Moving translation work to the server

This is the work I am proudest of, and it pushed me furthest outside my comfort zone.

### What was slow, and why

The translation experience on the web was first built for readers outside English-speaking countries, where almost every post might need translating. It assumed people would switch between translated and original text often, so every switch happened instantly in the browser.

When we brought translations to English-speaking readers, that assumption broke. About 90% of readers in the English rollout never saw a single post in another language, and only a small share ever touched the translation controls. Yet every one of them still downloaded and ran the translation code on every page: by our estimate, up to 250ms of extra browser work per page.

### Making the call to rethink

After several rounds of investigation, I concluded that more tuning would not get us there. An experience built for readers who see translations everywhere could not serve readers who almost never do, at the speed they deserved.

So I made the call to step back and rethink the approach. I wrote a doc for product and leadership that explained why the current approach could not serve these readers, backed by evidence, with a clear plan for what came next. It was a hard message to deliver, but it was well received, and the whole team finally shared the same understanding of the problem.

### Choosing the design

You can't just delete the code. The controls still have to work, a post and its comments must stay in sync, and feeds keep loading new posts as you scroll. So the core idea became: the page must arrive from the server already in the right translation state, so the browser has nothing to catch up on.

The hard part was getting each reader's setting to the server without slowing down every page. I compared four options on reader impact, speed, how much of the system each touched, and complexity:

- **Look up the setting before rendering.** Most correct, but every page waits for it.
- **Let the GraphQL layer return content in the right state.** Fast, but complex for that layer.
- **Render a default and correct it on the next visit.** Fastest, but the first visit can be wrong.
- **Give the website its own setting**, on by default and stored in a cookie. Simple and fast, but it can drift from the app.

I first leaned toward the GraphQL option. When I pressure-tested the options with senior backend engineers, they raised costs I had not fully weighed, so I changed course: the website's own setting became the first milestone, with syncing to the account setting as a follow-up.

### What I designed and built

I wrote a plan covering the product, the architecture, the problem and the fix, and shared it with engineering managers and senior web platform engineers before writing code, while changes were still cheap. Then I built it in steps:

- **Load the code only when it is needed.** The translation code now waits until the reader actually views translated content, and the server decides who is eligible. The settings dialog moved into a small piece that always loads, so menus never wait on the bigger code.
- **Find the last piece that loaded early.** I traced the comment translation code, which still started on every page, to how it was rendered on the server, and wrote down the safe ways to fix it.
- **Let the server own the state.** When a reader changes their translation setting, the page refreshes and the server renders the post and every comment in the same state. An instant reload felt jarring, so I added a short delay. Once the server owns the state, the browser no longer needs translation code just to keep things in sync.

### How I proved it

A change this size needed hard evidence, and senior engineers wanted it quickly. So I set up and ran a controlled experiment myself. My prototype turned off a large part of the browser translation code for returning readers who already had a translation setting. One version refreshed the page shortly after a reader changed their setting; the other applied the change on the next page.

Both versions made pages load faster, made comments usable sooner and reduced layout shift. That answered the big question: it was worth asking the small group who change their setting to wait for a refresh, so everyone else gets a much faster site. Product approved the plan.

### Planning the delivery

I split the work into three milestones: the cheapest win first (the website's own setting), then syncing with the account setting, then resilience. Each could merge on its own and be switched on through its own experiment, which kept risk low, results easy to read and the project from never ending.

The team adopted the plan and its staged rollout, and it shaped the next roadmap, including ideas of mine such as tiny translators that load only when a reader interacts with a post.

## 2. Automating language launches with AI agents

### The problem

Launching a new language looks simple: add it to the language picker. In practice it touched config, the translation build, QA, how logged-out readers get matched to a language, and translated legal pages.

That knowledge was spread across the code, overlapping wikis and a few people's heads. Every launch depended on someone remembering the steps.

### What I did

- **One source of truth.** I pulled every source into a single runbook: how text moves from code to translators and back, test versus live languages, how the right language is picked, and how to QA and release. When sources disagreed, the code won, and the runbook said so.
- **Written for people and agents.** I wrote it so both engineers and AI coding agents could follow it. Then I built an AI agent workflow that runs the release steps from the runbook. The team used it to deploy new languages.
- **Unblocking launches.** When one launch slipped because some test environments were quietly serving old builds, I traced it to a missing build setting, got the launch moving again and documented the fix so nobody would hit it twice.
- **Coordinating real launches.** I led the web side of a multi-language launch, including the status of the translated legal pages.

Launches stopped depending on anyone's memory.

## 3. A verification pipeline for AI-assisted work

### The problem

AI coding tools made changes fast to write, but not fast to trust. A change could pass every test and still break the page for a real reader. Translation is especially hard to check: what a reader sees depends on their language, whether they are logged in, their experiments and how they arrived.

### What I built

- **Real-browser checks.** Step-by-step runbooks that an AI agent runs against a local copy of the site in a real browser, covering the translation settings, labels and controls, and translated pages for visitors from search. To prove they worked, I gave an agent only the runbooks, with no other context, and it completed a full pass on its own.
- **Checks for "tests pass, product broken".** Quality rules that catch the cases where every test is green but the feature does not actually work.
- **Review with domain knowledge.** AI code review prompts that bring the team's translation knowledge to every change.
- **Spec-driven development.** A small, reversible pilot for keeping specs, decisions and code in step, written up for the team to adopt. Other senior engineers agreed with the problem it set out to fix.

I moved the browser checks into the shared codebase so anyone on the team could run them. The tools I built to speed up daily work are in a separate case study: [Tools that make the whole team faster](/projects/developer-tools/).

## Leading the team

A lot of my job as lead was helping everyone move fast in the same direction.

- **Decisions in the open.** I shared design docs before writing code and worked through options with senior engineers until we agreed.
- **Context for leadership.** I started a weekly status and decisions doc so senior leadership could catch up in minutes and make calls quickly.
- **Onboarding and mentoring.** I onboarded the front-end engineers who joined the team after me and wrote the domain guides that new engineers and AI agents learn the system from. The feedback was consistently positive.
- **Protecting quality.** When a large cleanup proposed deleting test coverage, including ours, I pushed back in review to keep the translation tests while agreeing to drop truly dead ones. Then I scoped a plan to make our end-to-end tests trustworthy: red means broken, green means working.

## Outcome

- **Faster pages.** In a controlled experiment I set up and ran, skipping the browser translation code made pages load faster, with less layout shift.
- **A new direction.** Product approved my plan, the team adopted it, and the next roadmap moved more translation work from the browser to the server.
- **Calmer launches.** New languages follow one runbook, and an agent workflow that the team used to deploy them.
- **Trusted AI changes.** AI-assisted changes get checked in a real browser, by a process anyone on the team can run.

This work is internal, so there are no screenshots or code to show.

## What I learned

- The fastest code is code the reader never downloads. Ask who actually needs it before you try to make it faster.
- When the browser struggles to keep state in sync, let the server own the state.
- A plan shared early, with its weak spots named, gets better feedback than a finished design.
- When something is heading the wrong way, say so early to the people who can change course, and agree on a stopping point before you start.
- Knowledge that lives in people's heads is a launch risk. Writing it down once, for people and agents, removes it.
- AI makes changes cheap. Checking them in a real browser is what makes them trustworthy.
