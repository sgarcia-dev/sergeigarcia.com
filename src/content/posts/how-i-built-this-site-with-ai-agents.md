---
title: "How I built this site with AI agents"
summary: "How I used AI agents to research, design and build this site, what I decided myself, and what went wrong along the way."
pubDate: 2026-10-12
skills: ["Astro", "Tailwind CSS", "AI agents", "Cloudflare"]
draft: true
---

I wanted a personal site that shows my work through case studies and gives me a place to write. I also wanted it to be fast, readable and easy to maintain. This post is how I built it with AI agents, what I chose myself, and where things did not go smoothly.

Short version: the agents did much of the research and typing. I made the calls.

## Start with questions, not a framework

Before picking any tools, I split the work into six questions: framework, hosting, design, motion, search visibility and how to work with agents.

For each question I asked three different models to research it on their own: Claude Sonnet 5.5, Codex with GPT-6.1 Sol and Gemini 3.8 Flash. I did not want one model's habits to decide for me. I also had one agent do a read-only check of my Cloudflare setup, and I gathered my own background notes to feed in.

Then I compared the answers. Where the three agreed, I treated it as a good sign, not as proof. All three picked Astro, for example, and that matched what I wanted: static pages, typed content and no JavaScript unless I ask for it. Where they disagreed, I looked at why. Hosting was one case. One model preferred Cloudflare Pages for ease of use. The other two followed Cloudflare's own advice to use Workers with static assets. I went with Workers.

The lesson I took from this: agreement between models is a hint. When a claim mattered, such as browser support for a feature, I checked the primary docs.

## Get a second opinion

Once I had a draft plan, I asked ChatGPT to review it. The review kept the overall plan and changed a few things that mattered:

- Write content as plain Markdown, and use MDX only when a post really needs components.
- Skip the Cloudflare adapter, because a fully static site does not need it.
- Check production separately from preview URLs, since the two can behave differently.
- Give the site one clear visual signature.
- Put the strongest evidence first: good case studies matter more than extra features.

## Where I pushed back: Tailwind

The first research round recommended plain CSS with design tokens. The main reason was that Tailwind's defaults are a big source of that generic AI look.

I disagreed. Tailwind lets me prototype faster, and I thought its defaults could be removed. I also suspected it would cost the agents fewer tokens.

So I asked for another check. Two models now recommended Tailwind v4. The official docs show how to reset the default theme so every default color, font, radius, shadow and spacing value is gone, and only my own tokens remain. I also already had Tailwind v4 tokens from my Figma-based work on another project.

One practitioner test claimed big token savings. I could not verify it, and it did not check rendered quality, so I do not lean on it. The decision stands on the docs and on a plan to guard against the risks. Agents trained on older Tailwind sometimes write the old syntax, so I wrote rules for the repo to forbid it. I also banned arbitrary values, because those bring the clichés back.

Plain scoped CSS stays for long-form text. Not every part of the site needs utility classes.

## Pick the design by looking

I did not choose the design from a description. I asked for three home page mockups: quiet editorial, Swiss grid and light neo-brutalist.

My wife and I both disliked the Swiss grid. I found the editorial one generic. I picked the neo-brutalist one, and she agreed.

Then came a round of four variations on it: a refined version, an editorial one, a color-block one and a spec-sheet one. After a final round of options, I chose one with a display serif font and a yellow, cobalt and tomato palette taken from the color-block variation. I liked the new fonts and preferred blue and yellow. The grotesque-font option was the worst of the lot. I said to use the winner as is and iterate later.

An Opus orchestrator ran those rounds, with Sonnet agents as builders. I set one rule for design work: Sonnet scaffolds, and Opus does the visual pass. Cheaper models are fine for building blocks, but the judgment about how a page looks needs the stronger one.

## Build on a branch and review the preview

The build happens on a branch with its own preview URL. I review the preview, and only then does it merge to `main` and go live. That means no half-finished page is ever the live site.

The rules live in a short file the agents read before they touch anything: how to use Astro 7 (not the old patterns they remember), Tailwind rules, and a list of banned design patterns. Telling agents what not to do is more concrete than asking for taste. No purple gradients, no centered hero with two buttons, no invented metrics.

I also made one structure call: every work role and every project gets its own page, not a modal. Full pages can be linked and indexed, and they work without JavaScript.

## What worked, and what did not

What worked:

- **Parallel research.** Three models answering the same question made blind spots visible.
- **Looking at mockups.** I reacted much more clearly to real pages than to words.
- **Written rules.** A file of what not to do cut a lot of generic output.
- **A branch and a preview.** Review happens before anything is public.

What did not:

- Early recommendations were not final. My own notes had to be updated after I changed my mind on Tailwind, and notes that disagree with each other confuse agents.
- Some research claims could not be verified, like the Tailwind token savings, so I left them out of the reasoning.
- Models are better at writing the code than at judging the page. That is why the visual pass goes to the stronger model, and why I still review the result myself.

## Who did what

The agents researched, compared options and built pages. I set the brief, challenged the plan, picked the design and reviewed the result. The site is not finished, and I will keep changing it.

If you want to see how it is put together, I plan to make the site source public. Next I plan to write about the Tailwind decision in more detail, and about how I keep agent work resumable between sessions.
