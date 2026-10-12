---
cover: "../../assets/covers/typing-com-react-rewrite.jpg"
coverAlt: "Illustration: a builder swapping cracked grey keyboard keys for bright new ones"
coverKind: "illustration"
gallery:
  - src: "../../assets/screenshots/typing-com.png"
    alt: "The Typing.com home page, captured in October 2026."
galleryCaption: "Typing.com today, October 2026."
title: "Typing.com React rewrite"
summary: "Led the move of Typing.com's teacher tools from Backbone.js to React, with a shared component library and quality checks built in."
period: "2021 to 2023"
role: "Lead Frontend Engineer"
company: "Teaching.com (Typing.com)"
skills: ["React", "TanStack Query", "Storybook", "Chakra UI", "Tailwind CSS"]
links:
  - label: "Typing.com"
    url: "https://www.typing.com"
order: 40
confidential: false
draft: false
---

## The problem

Typing.com teaches typing and digital literacy. Schools and districts use its teacher portal to manage classes, assignments and student progress. The front end had grown over many years on Backbone.js inside a PHP and Laravel app.

- The teacher portal carried heavy mixins and years of tech debt.
- UI patterns were inconsistent, and there was no shared design system.
- There was little automated quality checking, so changes were risky and slow.

## My role

I was the Lead Frontend Engineer, working remotely. I led the move of the company's main front end surfaces to React. That meant planning the migration, choosing the architecture, setting team standards, writing technical proposals and mentoring teammates.

## Key decisions

**Start small.** I began with the internal customer support portal as a first React migration, then led the full teacher portal rewrite. The small project showed what would work before the big one began.

**Replace the front end without a big-bang cutover.** The new React app ships as a bundle mounted inside the existing Laravel pages. It replaced the old front end without a new server or a risky switch-over day.

**Keep server state simple.** I chose React Query for data fetching and caching. When an early architecture turned out too complex, I re-planned the app around this simpler model.

**Build a shared component library.** Components live in Storybook and follow the Figma designs, using Chakra UI, Tailwind and Headless UI.

**Add guardrails.** ESLint with accessibility rules, pre-commit hooks, a pull request template and Storybook interaction tests made quality part of the normal flow.

**Write the reasoning down.** I wrote proposals, including the case for React Hooks and an evaluation of GraphQL for the API, and started weekly demo-style status updates.

## Outcome

The teacher portal moved from Backbone.js to a modern React codebase with a shared design system and a consistent look. Teachers across schools use it. The team also got shared standards for review and testing.

## What I learned

- A gradual migration inside the existing app is less exciting than a rewrite, and much safer.
- Changing course early is cheaper than defending a plan that is too complex.
- A component library only works when it stays close to the design files and has tests.
- Demos and short written proposals helped the team agree on direction faster than long discussions.
