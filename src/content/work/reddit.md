---
title: "Senior Software Engineer"
company: "Reddit"
role: "Senior Software Engineer, web lead for the translations team"
summary: "==Web lead for Reddit's translations team==: owned the web experience for ==machine-translated posts across 40+ countries and 20+ languages==, made it faster and built its tests, tools and AI workflows."
period: "Nov 2023 to Sep 2026"
startDate: 2023-11-01
endDate: 2026-09-30
skills: ["TypeScript", "Lit", "GraphQL", "Playwright", "Node.js", "Web Components", "BigQuery", "Chrome extensions"]
links: []
order: 10
cover: "../../assets/screenshots/companies/reddit.png"
coverAlt: "Reddit's home page, October 2026"
---

At Reddit I was the web lead for the translations team, and I held that role until I left Reddit. Our work helps people find and read conversations in their own language, across <span class="lv-mark">40+ countries, 20+ languages and millions of users</span>. I started by building translation features on the web and grew into owning the whole web translation experience: setting its technical direction, planning the work and making the calls on trade-offs.

### What I did

- Redesigned the reading experience for translated content: translation indicators, language controls, the switch between translated and original text, a compact view, feedback dialogs and translation settings.
- <span class="lv-mark">Designed the move of translation work from the browser to the server</span>, so readers who never see a translation do not load that code, and proved the approach with a controlled experiment I set up and ran myself.
- Built the server side of new features in Reddit's in-house server-rendering framework: consuming GraphQL endpoints, request middleware, partial-page endpoints and passing data from server to client. I wrote BigQuery SQL to measure the results.
- Partnered with other engineers on features that serve translated content to people arriving from search.
- Created the first Playwright end-to-end tests for translated content across post pages, feeds and search, and scoped ways to make them more reliable.
- Built two developer tools, one in VS Code and one in Chrome DevTools, that turn error-prone manual setup into one click: run targeted tests, reproduce an exact experiment or user state, see what the server rendered, and share a working setup with a teammate.
- Built AI-assisted development workflows: code-review prompts that carry domain knowledge onto every change, quality checks that catch cases where tests pass but the product is broken, and real-browser checks for AI-made changes, all guided by a spec-driven way of working.
- Consolidated scattered localization knowledge into one runbook and built <span class="lv-mark">an AI agent workflow for language launches</span>, which the team used to deploy new languages.

### Leadership

- Set the technical direction for translations on the web: showed why the existing design did not fit English-speaking readers, wrote the plan to move the work to the server and got product and senior engineers behind it.
- Ran decisions in the open: shared design docs for review before writing code, weighed the options with senior backend engineers and changed course when their feedback warranted it.
- Split large work into small milestones, each switched on through its own experiment, so risk stayed low and results stayed easy to read.
- Started a weekly status and decisions doc so leadership could catch up quickly and make calls.
- Protected quality: pushed back on a large cleanup that would have deleted our test coverage, and scoped a plan to make our end-to-end tests trustworthy.

### Mentoring and teamwork

- Onboarded the front end contractors who joined the team after me.
- Wrote the domain guides that new engineers and AI coding assistants use to learn the system.
- Wrote a practical AI course for colleagues, including people who do not write code, and built the documentation site that hosts it.

Read the case studies: [Breaking Reddit's language barrier with AI translation](/projects/reddit-localization/) and [Tools that make the whole team faster](/projects/developer-tools/).
