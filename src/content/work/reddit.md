---
title: "Senior Software Engineer"
company: "Reddit"
role: "Senior Software Engineer"
summary: "Owned Reddit's web experience for machine-translated posts across 40+ languages, improved its performance, wrote its first end-to-end tests and built developer tools."
period: "Nov 2023 to Sep 2026"
startDate: 2023-11-01
endDate: 2026-09-30
skills: ["TypeScript", "Lit", "GraphQL", "Playwright", "Node.js", "Web Components", "BigQuery", "Chrome extensions"]
links: []
order: 10
cover: "../../assets/screenshots/companies/reddit.png"
coverAlt: "Reddit's home page, October 2026"
---

At Reddit I worked on the web experience for machine-translated posts and comments. It helps people find and read conversations in their own language, across 40+ languages and millions of users. I started by building translation features on the web and later became the engineering owner of the whole web translation experience.

### What I did

- Redesigned the reading experience for translated content: translation indicators, language controls, the switch between translated and original text, a compact view, feedback dialogs and translation settings.
- Designed and built a server-side version of translation delivery, so readers who never see a translation do not download that code, and tested the approach with controlled prototypes.
- Built the server side of new features in Reddit's in-house server-rendering framework: consuming GraphQL endpoints, request middleware, partial-page endpoints and passing data from server to client. I wrote BigQuery SQL to measure the results.
- Partnered with other engineers on features that serve translated content to people arriving from search.
- Created the first Playwright end-to-end tests for translated content across post pages, feeds and search, and scoped ways to make them more reliable.
- Built two developer tools, one in VS Code and one in Chrome DevTools, that turn error-prone manual setup into one click: run targeted tests, reproduce an exact experiment or user state, see what the server rendered, and share a working setup with a teammate.
- Built AI-assisted development workflows: code-review prompts that carry domain knowledge onto every change, quality checks that catch cases where tests pass but the product is broken, and real-browser checks for AI-made changes, all guided by a spec-driven way of working.
- Consolidated localization runbooks, helped coordinate new language launches and reviewed build changes for translation risk.

### Mentoring and teamwork

- Onboarded the front end contractors who joined the team after me.
- Wrote the domain guides that new engineers and AI coding assistants use to learn the system.
- Wrote a practical AI course for colleagues, including people who do not write code, and built the documentation site that hosts it.

Read the case studies: [Reddit localization and machine translation checks](/projects/reddit-localization/) and [Tools that make the whole team faster](/projects/developer-tools/).
