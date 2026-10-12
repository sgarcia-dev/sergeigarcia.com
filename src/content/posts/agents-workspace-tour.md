---
title: "My AI tools are replaceable. My workspace is not."
summary: "A tour of the plain-text, git-tracked workspace every AI tool I use plugs into, and how I use it for research, planning and delegating work."
pubDate: 2026-10-12
skills: ["AI agents", "Git", "Markdown", "Claude Code", "Codex", "Gemini"]
draft: true
---

This morning I decided to build a personal website. By the afternoon it was live at this address.

In between, about 20 AI agents researched it at the same time. I split the work into six questions: framework, hosting, design, motion, search visibility and how to work with agents. Each question went to three models from three providers: Claude, Codex and Gemini. Two more agents checked my Cloudflare setup and gathered my background notes. Follow-up rounds challenged the plan, drafted case studies and built design mockups. I picked a design by looking at real pages, and I reviewed the work before it went live.

That sounds like a story about AI writing code. It isn't, really. What made it work was something I had built months earlier: a folder of plain text files that every AI tool I use reads before it starts. I call it the Agents workspace. This post is a tour of it.

## The problem: every session starts from zero

If you use AI tools for real work, you have hit this. You spend an hour with an agent on a tricky problem. It learns why you picked one library over another, which approach failed and what "done" means. Then the session ends, and all of that is gone. The next session is a smart newcomer who knows nothing about your project.

In 1985 the Danish computer scientist Peter Naur wrote an essay called "Programming as Theory Building". His point was that the real program is not the code. It is the understanding in the heads of the people who built it: what the code is for, why it has this shape, and what would need to change if the world changed. The code is a lossy copy of that understanding. When the people leave, it leaves with them.

An AI session is the person who just left, every single time. It gets the code and whatever fits in its context window, and nothing more.

There is a second problem. AI tools change every few months. I use Claude Code, Codex, Gemini, OpenCode, Hermes and Cursor. Each keeps its own instructions, memory and settings in its own format. If my rules live inside one tool, I lose them when I switch or when the tool changes under me. If I copy them by hand between tools, the copies drift apart.

These turn out to be the same problem: knowledge falls out at a boundary. Either the session ends, or the tool goes away.

## The idea: one workspace, many thin adapters

So I flipped it. Instead of learning each tool's way of storing things, I keep one source of truth and make every tool adapt to it.

The workspace is a git repository of Markdown files. Each tool gets a thin adapter: a small piece of tool-specific setup that points the tool at the shared files and translates the rules into the format that tool expects. Today there are adapters for six tools.

The rule at the top of the main file is short: tools converge to this system, and the system never bends to a tool. When a tool can do something the workspace doesn't cover, I either add it to the workspace or write down that the difference is fine. Nothing gets quietly ignored.

Since mid-June the repository has grown to about 1,400 commits. Git is the changelog, and each commit message says why a change was made, not just what changed. Sensitive material lives in a separate private repository, so this one stays safe to show a coworker.

Here is the top level:

```text
agents/
  AGENTS.md      short rules every session reads first
  INDEX.md       a map of where to look for what
  skills/        step-by-step procedures, loaded when needed
  roles/         how AI workers should behave
  adapters/      one mapping per AI tool
  capabilities/  notes on outside tools and bridges
  workflows/     bigger multi-step processes
  projects/      memory for each project
  artifacts/     research reports, mockups, old outputs
```

## A quick tour

### Memory files

Each project gets a small set of files with fixed jobs. `STATE.md` says what is true right now. `DECISIONS.md` lists each choice, what I rejected and why. A spec says what we are building. A few more cover sources, architecture and a map of the code.

These files are what make work resumable. For this website, `DECISIONS.md` gained ten entries today alone. One records that the research first recommended plain CSS, that I pushed back in favor of Tailwind, and the evidence that changed the recommendation. Tomorrow a fresh agent will read that and won't suggest plain CSS again.

### Skills

A skill is a written procedure that an agent loads only when the task calls for it. There are 21 right now. A few examples: run a research investigation and save a report, update project memory after a change, export a ChatGPT conversation from the browser, and hand a task to another AI tool.

The always-on rules stay short on purpose. They work like a router: for this kind of task, read that file. One giant instruction file wastes context in every session. A short one plus detail on demand doesn't.

### Roles and worker tiers

Most of my sessions have one top-level agent that hands small jobs to workers. The `roles/` folder defines them: explorers that only read, executors that only edit what they are told to, and stronger "high" versions of both.

The rules are strict, because workers guess. Each job goes out as a packet: one goal, the files to read, what may be edited, how to check the result and when to stop. Workers can't start other workers. The top-level agent keeps the architecture and checks every important claim.

I also keep a delegation briefing that labels each model I use by cost, skill, speed and how often it guesses when it's wrong. That last label matters more than I expected. Some of the strongest models rarely say "I don't know". So the label decides which jobs a model may get and how hard I check its work, not just how many copies I run.

### Borrowing another tool

Different tools are good at different things. Codex is my route for some kinds of web research. Claude is my pick for hard reasoning and review. OpenCode gives me cheap models I can run in large batches. There are skills for handing a bounded task from one tool to another through its command line.

One rule matters a lot here: this never happens on its own. Cross-tool handoffs only run when I ask for them. A session started this way also can't launch its own crowd of agents unless I allow it. Ten child sessions that each start ten agents is a hundred agents, so that limit gets set before launch.

### Research fan-out

The research skill is what ran this morning. It splits a broad question into topics, sends each topic to several workers and writes one final report with the evidence behind it.

The useful part of asking three providers the same question isn't when they agree. It's when they don't. All three picked Astro, which was a good sign but not proof. On hosting, one preferred Cloudflare Pages and two followed Cloudflare's own advice to use Workers. That split is where I looked closer and checked the official docs.

### Plan, execute, reconcile

Serious work uses a three-step workflow. Plan writes a reviewed plan to disk. Execute does the work in a fresh session, starting from that plan. Reconcile updates the memory files to match what actually happened.

Each step talks to the next only through files. None of them rely on chat history. If a session crashes, or I come back a week later, the next step picks up from the folder.

## It isn't just for code

This is the part I didn't expect. The same setup works for most of my work that involves thinking, not just typing.

Research is the biggest one. When I need to understand something, whether it's a tool, a technology choice or a bigger decision, I run the same kind of fan-out. I end up with a report and its sources instead of a chat I'll never find again. The workspace even has a folder for comparing AI models, which is how I decide which model gets which job.

Decisions work the same way. I write down the options, what I rejected and why. Months later I can read my own reasoning instead of guessing at it.

Loose ends have one home too. Each unfinished thread gets enough context that I, or an agent, can pick it up cold.

Then there is the everyday admin that has nothing to do with software. The pattern is the same: written memory, small delegated tasks, and me reviewing the result. Anything personal or sensitive goes in the private repository, so that's all I'll say about it here.

In every case my job is the same. I'm the architect and the reviewer. I set the question, decide what matters, check the work and make the call. The agents do the reading, the comparing and much of the typing.

## What I've learned

**Agents guess.** Even good ones. A worker will tell you, with full confidence, that a file says something it doesn't. So every important claim gets checked against the source. The more a model tends to guess, the narrower its jobs.

**Review is not optional.** Today the agents researched and built, but I picked the design (my wife had a vote too) and pushed back on the CSS plan. Models are better at writing code than at judging how a page looks.

**Notes that disagree are worse than no notes.** When I changed my mind on Tailwind, older notes still said plain CSS. An agent that reads both gets confused. Updating memory after a change is part of the work, not a chore after it.

**Quota is a real limit.** My Claude usage limit is the tightest budget I have. So the strongest model does the judgment work, like the visual pass on a design, and cheaper models do the scaffolding.

**Things still break.** Today I got stuck in a sign-in loop and had to sort it out myself, and one GitHub app install had to be redone by hand. Some things I still do myself on purpose: anything that touches accounts or money, the final call on design and wording, and deciding what is worth doing at all.

**Say what not to do.** A short list like "no purple gradients, no invented numbers" gets better results than asking an agent for good taste.

## Start small

You don't need six tools or a thousand commits. Here is how I would start:

1. **Make one folder and put it in git.** Add a short `AGENTS.md` with the rules you keep repeating to every AI session, and point your tool at it.
2. **Keep a `DECISIONS.md` for one project.** Each time you make a choice, write what you picked, what you rejected and why. Have the agent read it at the start of every session.
3. **Turn one repeated explanation into a skill.** Pick the thing you explain to agents most often and write it down as steps. Next time, just say "follow that file".

Then use it for a week and fix whatever annoys you. That's how mine grew. Not from a grand design, but from writing down the thing I had just explained for the third time.
