---
cover: "../../assets/screenshots/learngenomics.png"
coverAlt: "The LearnGenomics.dev home page, one of the St. Jude related sites I worked on, captured in October 2026."
title: "St. Jude Cloud website rebuild"
summary: "Rebuilt the public website for St. Jude Cloud, a pediatric research data platform, as a Vue and Nuxt design system with accessibility and speed built in."
period: "2025"
role: "Frontend Developer"
company: "St. Jude Children's Research Hospital (via Toptal)"
skills: ["Vue 3", "Nuxt 3", "Tailwind CSS", "Storybook", "Accessibility"]
links:
  - label: "LearnGenomics.dev"
    url: "https://learngenomics.dev"
order: 50
confidential: false
draft: false
---

## The problem

St. Jude Cloud is a data and analysis platform that St. Jude Children's Research Hospital offers to the global pediatric research community. Its public website needed a rebuild from new Figma designs.

- The site had to be modern, responsive and accessible.
- It had to load fast on phones and desktops while still using rich animation.
- Announcements, publications and studies had to be easy to add without code changes.

## My role

I was a frontend developer on the team, hired through Toptal. I built the new site's components and pages in Vue 3 and Nuxt 3. This was a Vue and Nuxt project, not React. Later I helped with two related sites: the docs and homepage for Sprocket, a bioinformatics workflow tool, and the LearnGenomics.dev learning site.

## Key decisions

**Turn the design into tokens.** I translated the Figma theme into Tailwind design tokens for fonts, colors, sizes and breakpoints, then built a reusable component library with Storybook stories. Later I audited the semantic color tokens.

**Make content data, not code.** File-based JSON content, a block renderer and generated routes mean new announcements, publications and studies need no new code.

**Build the key pieces carefully.** These included a responsive navbar with scroll-aware theming, hero, timeline and carousel sections, a publications page with filters, debounced search and pagination, and a validated contact form.

**Keep animation light.** After testing animation libraries, I wrote a small reveal-animation component in-house to keep the bundle small.

**Treat accessibility and speed as part of the build.** I ran passes for image and font loading, Lighthouse checks, color contrast, keyboard access (for example rebuilding the timeline with real buttons), screen reader testing and ARIA fixes.

**On the sister sites:** a light theme with a custom icon set, a no-build tooltip web component, a layout refactor, and a move from Docusaurus to Next.js with MDX.

## Outcome

A rebuilt, design-system-driven website for St. Jude Cloud, with accessibility and performance treated as part of the work, plus updated docs and learning sites for the wider platform.

## What I learned

- Design tokens taken straight from Figma keep design and code from drifting apart.
- Putting content in data files lets non-developers add pages without a release.
- Starting with real HTML elements, like buttons, beats patching things up with ARIA later.
- Testing a lightweight option before reaching for a library kept the site fast.
