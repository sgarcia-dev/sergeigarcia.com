---
title: "The operating manual behind all my AI work"
summary: "A guided tour of the folder of plain-text rules, memory and procedures that every AI tool I use reads first, and how it runs my engineering, research and planning."
pubDate: 2026-10-12
skills: ["AI agents", "Spec-driven development", "Git", "Markdown", "Claude Code", "Codex", "OpenCode", "Gemini"]
cover: "../../assets/posts/agents-workspace/cover.jpg"
coverAlt: "Four cartoon helpers, a yellow one in a chef hat, a blue square, a red ball and a white capsule, circle one glowing folder like planets around a sun."
draft: false
---

Every AI session I start forgets what the last one learned. So for four months I have been building one folder of plain text files that every AI tool I use reads before it does anything. I call it the Agents workspace. It now runs most of my work, not just the coding.

Here is the whole thing at a glance:

```text
agents/
├── AGENTS.md     rules every agent reads first
├── INDEX.md      a map of what to read when
├── projects/     memory for each project
├── specs/        how things should work now
├── changes/      plans for work in progress
├── workflows/    plan, execute, reconcile
├── skills/       recipes, loaded on demand
├── roles/        what each worker may do
├── adapters/     one small mapping per tool
├── capabilities/ notes on outside tools
├── ai-models/    which model gets which job
├── conventions/  filing and memory rules
└── artifacts/    every report, filed by type
```

It is a git repository of Markdown files. No database, no app, no plugin. Here is what each part does, and why it exists.

## Why I built it: every session starts from zero

If you use AI tools for real work, you have hit this. You spend an hour with an agent on a hard problem. It learns why you picked one library over another, which approach failed and what "done" means. Then the session ends, and all of that is gone. The next session is a smart newcomer who knows nothing.

In 1985 the computer scientist Peter Naur wrote an essay called "Programming as Theory Building". His point: the real program is not the code. It is the understanding in the heads of the people who built it. The code is a lossy copy of that understanding, and when the people leave, the understanding leaves with them.

An AI session is the person who just left, every single time.

There is a second problem. AI tools change every few months. I use Claude Code, Codex, Gemini, OpenCode, Hermes and Cursor. Each keeps its instructions, memory and settings in its own format. If my rules live inside one tool, I lose them when I switch. If I copy them by hand, the copies drift apart.

Both problems are the same problem. Knowledge falls out at a boundary: the session ends, or the tool goes away. So the workspace has one job: keep the understanding of the work outside any single session and outside any single tool.

I think of it like a restaurant kitchen. A good kitchen keeps working when the chef on shift changes, because the recipes, rules and notes live in the kitchen, not in one person's head.

![Four different cartoon helpers lean over one open book on a table, all reading the same pages. Different AI tools, one shared set of rules.](../../assets/posts/agents-workspace/fig-one-rulebook.jpg)

## AGENTS.md: the house rules

Every session starts by reading one file, `AGENTS.md`. It is the house rules taped to the kitchen wall. It covers:

- **Why the workspace exists**, in a few paragraphs.
- **Where things live**: a short map of the folders.
- **Where work goes**: "for a research question, use this skill; for serious multi-step work, use that workflow".
- **Hard gates**: before writing any report, read the file that says where reports go. Before changing project memory, read the memory rules.
- **Boundaries**: what needs my explicit OK, what is private, and what must be committed before the session ends.

The important choice is that this file stays short. It works like a router: "for this kind of task, read that file". `INDEX.md` does the same one level down. One giant instruction file would waste context in every session, including the ones that only fix a typo.

How does each tool find `AGENTS.md`? With the cheapest trick available. In Claude Code, the global instruction file is a symbolic link (a file that points at another file) to `AGENTS.md`. Other tools load it through their own small adapter or a shared link in my home folder. I edit one file, and every tool sees the change in its next session.

There is a reading order too: global rules first, then the project's own rules. For this website, the code repository has a small link (ignored by git) to the website's folder inside the workspace. An agent that opens the code also finds the memory.

## projects/: memory that survives the session

Each project gets a small set of files, and each file has one job:

- **`STATE.md`**: what is true right now and where to resume. The first thing an agent reads.
- **`DECISIONS.md`**: each choice, what I rejected and why.
- **`SPEC.md`**: what we are building and how we will know it is done.
- A few optional files for sources, architecture and a map of the code.

These are the notes one kitchen shift leaves for the next. The rules are strict. `STATE.md` aims to stay under about 120 lines. Each fact has one home that other files link to. There is no hand-written changelog, because git already is one: every commit message has to say *why* a change was made.

A real example from this website. The research first recommended plain CSS. I pushed back: Tailwind lets me prototype faster, its default styles can be removed, and it likely costs fewer AI tokens. A second round of research checked my argument and agreed. `DECISIONS.md` now records the first recommendation, my pushback, the evidence and the final call. A fresh agent reads that and won't suggest plain CSS again.

The website's `STATE.md` opens with a section called "Resume here". It lists what is live, what is open in priority order, and the exact retry steps for a hosting error that kept coming back. If my laptop died right now, a new session could pick up from that file alone.

![Under a crescent moon, a red helper hands a folder across a line to a blue helper standing under a sun. The notes from one session carry over to the next.](../../assets/posts/agents-workspace/fig-two-memory-handoff.jpg)

## conventions/ and artifacts/: where everything gets filed

Agents produce a lot of writing. Without rules, it ends up scattered next to the code with names like `notes2_final.md`. So filing has its own rulebook in `conventions/`.

Generated documents go into one of two places: the shared `artifacts/` folder for work that spans projects, or a project's own `artifacts/` folder. Inside, there are fixed drawers: `investigations/` for research, `audits/`, `reviews/`, `handoffs/` for passing work to a future session, `docs/` for things people will read, and a few more. If nothing fits, there is `misc/`. Agents may not invent new drawers.

Every file name follows one pattern: date, time, document type, title and the model that wrote it. This site's research lives in a folder called:

```text
26-10-12_12-04__research__personal_website_foundations_opus-5-5/
```

Each file also starts with a small header: when it was made, which model made it, what it is for, and which other files it relates to, with a one-line reason for each link.

This sounds like bureaucracy. In practice I can find any report from months ago and see which model wrote it. And one written rule keeps agents from treating an old report as current truth: `artifacts/` holds evidence, while current truth lives in the memory files and specs.

## specs/, changes/ and workflows/: plan, execute, reconcile

For small jobs, I just ask. For serious work (several steps, several files, real risk), there is a three-step workflow. Spec-driven development means you write down what should be true before you change anything, then check the result against it. Mine borrows ideas from OpenSpec, an open-source tool for this style of work.

1. **Plan.** A strong model investigates until the unknowns are gone, then shows me a readable proposal. Nothing becomes an executable plan until I approve it. Then it creates a change folder.
2. **Execute.** A *fresh* session reads that folder and does the work, sending small jobs to workers and checking every result.
3. **Reconcile.** Another fresh session reads what happened and updates long-term memory: state, decisions, specs and the code map.

The change folder is the order ticket. It holds a `PLAN.md` with the scope, which files may be touched, what to verify and how workers are used. It also holds an execution log (decisions and failures, not a chat transcript), a result file and a list of memory updates for step three.

The rule that makes this work: **no step relies on chat history.** Each step starts from files and ends by writing files. If a session crashes, or I come back a week later, the next step picks up from the folder.

Specs live in two places. `specs/` says how things should behave now, written as "when this happens, then that must be true". A change folder holds proposed edits to those specs, and reconcile merges them in when the change lands. So the spec describes the system as it is, not as it was planned three months ago.

One more rule I like: **the lead writes the important words.** When the exact wording is the deliverable (a spec, a rule, a memory entry), the top-level agent writes it itself. Workers may paste it into place. They may never write or rephrase it.

![The yellow lead hands a ticket to three small helpers, their finished pages fly into an open book, and a big arrow loops back to the lead. Plan, do the work, then write what changed back into memory.](../../assets/posts/agents-workspace/fig-three-plan-execute-reconcile.jpg)

## skills/: the recipe book

A skill is a written procedure that an agent loads only when the task calls for it. There are 21 right now. A few examples:

- **research**: split a broad question into topics, send each to workers, and always finish with one saved report. A chat answer alone never counts.
- **memory-reconcile**: after ad hoc work, check whether long-term memory is now out of date, and fix it. If I didn't clearly ask for changes, it only reports and asks once.
- **plan-create, plan-execute, plan-reconcile**: the three steps above.
- **chatgpt-browser** and **claude-browser**: drive those websites to start research chats and export the results.
- **task-codex**, **task-opencode** and friends: hand a bounded job to a different AI tool.

Skills stay short. The facts they depend on (command-line flags, costs, known failures) live in `capabilities/`. When a tool changes, I fix one fact sheet instead of every recipe.

## roles/ and ai-models/: the kitchen brigade

Most of my sessions have one top-level agent that hands small jobs to workers. The top-level agent is the head chef. It owns the plan, the final checks and the long-term memory. Workers are line cooks with narrow stations.

The `roles/` folder defines them:

| Role | May do |
|---|---|
| Explore | Read sources and write a report. Nothing else. |
| Execute | Edit only the files named in its job. |
| Explore high, Execute high | The same, with a stronger model for harder jobs. |
| Orchestrator | Run one phase and hand jobs to workers. Nothing deeper. |

Each job goes out as a packet: one goal, the files to read, what may change, how to check the result and when to stop. A few rules hold everywhere:

- **Workers cannot start other workers.** One layer deep, always.
- **Workers stop after three serious failed attempts** and report "blocked" instead of guessing.
- **Packets have a size limit**: under half of the model's working memory.
- **Packets have a clock.** A regular worker gets checked at about three minutes and cancelled at four.

![The yellow lead holds a clipboard and points at three small helpers in a row, each holding up one small card. Each worker gets one narrow job.](../../assets/posts/agents-workspace/fig-four-lead-and-workers.jpg)

The part I didn't expect to matter is the "delegation briefing" in `ai-models/`. It labels every model by cost, skill, speed and *guessing*: how often a wrong answer was a confident guess instead of "I don't know". Some of my strongest models get a high guessing label. They know a lot, but when they are wrong, they rarely admit it.

That label changes what a model may do. A model that guesses a lot can still run in large numbers, but only on jobs I can check quickly: "does this file say X", "run this command". It never gets judgment calls or long-term memory. Cost decides how many run at once: a cheap model might run three to eight at a time, my most expensive ones one to three.

## adapters/: one rulebook, six tools

Here is the rule at the top of `AGENTS.md`, in short: **tools adapt to the workspace. The workspace never bends to a tool.**

Each AI tool gets an adapter: a small mapping that points the tool at the shared files and translates the rules into the format the tool expects. There are adapters for six tools today, one still provisional. For example, the worker roles above become real subagents in Claude Code, Codex and OpenCode, each running a model picked for that tool.

The adapter is only a loader. It may say "this subagent runs this model, now go read the role file". It may not copy the role's rules. Copied rules are how drift starts: someone updates the original and forgets the copy.

When a tool can do something the workspace doesn't cover, I either add it to the workspace or record it in that tool's list of approved differences. Nothing gets quietly ignored.

And one more rule: **one tool per session.** An agent may only inspect or change the settings of the tool it runs in. "Update all my tools" means six separate sessions, because only a tool running in its own session can see its real settings and confirm a change worked.

![Four helpers plug differently shaped cables into one tall folder, with a spare plug on the floor ready for a new tool. Any AI tool can connect to the same workspace.](../../assets/posts/agents-workspace/fig-five-tools-plug-in.jpg)

## capabilities/: borrowing another tool's strengths

Different tools are good at different things, and each runs on a different subscription. Codex gives me OpenAI's models. OpenCode gives me cheap models I can run in large batches. Claude is my pick for hard reasoning and review, but its usage limit is my tightest budget.

So there are skills for handing a bounded job from one tool to another through its command line, and fact sheets in `capabilities/` for how each one behaves.

The useful part of asking three providers isn't when they agree. It's when they don't. For this website, all three picked Astro for the framework: a good sign, not proof. On hosting, two followed Cloudflare's own advice to use Workers, and one preferred Pages. On one browser feature, one model claimed support that the official compatibility data didn't show, so I threw that claim out. The disagreements told me where to look closer.

Two limits keep this safe:

- **It never happens on its own.** Cross-tool handoffs only run when I ask. A skill suggesting one, or a tool failing, is not a reason.
- **Child sessions don't spawn crowds.** A session started this way can't start its own workers unless I allow it. Ten child sessions that each start ten workers is a hundred agents, so that budget is set before launch.

## How the writing style gets enforced

Agents have a recognizable voice: long dashes everywhere, the same handful of buzzwords, three adjectives where one would do. It is tiring to read.

So `AGENTS.md` has a section, marked critical, about writing style. It asks for plain English, simple explanations of complex terms and no jargon. It also says to assume every reader is incredibly busy. Because it lives in the file every session reads first, every tool gets the same rule without me repeating it.

The same idea shows up elsewhere:

- **Project rules.** The website's own rules ban private details on a public site and ban invented work history or results.
- **What reviewers see.** Commit messages, pull requests and review replies may not mention the workspace's internal plans, worker names or file paths. A coworker should see clean work, not my machinery.
- **Design rules.** For this site's design, a short list of what not to do ("no skill bars", "no invented results") worked better than asking an agent for good taste.

This is a rule, not a linter, and agents still slip. But a rule every session reads beats correcting the same habit in every chat. An agent helped draft this post under these same rules.

## Beyond code

This is the part I didn't plan. The same setup works for most of my work that involves thinking, not just typing.

- **Research.** When I need to understand something (a tool, a technology choice, a bigger decision), I run the same kind of fan-out and end up with a saved report and its sources, not a chat I'll never find again.
- **Choosing models.** `ai-models/` holds public benchmark data for the models I use, plus my notes on which model suits which job. The delegation briefing is the only place that picks a model for a role, and every adapter points to it.
- **Loose ends.** Unfinished threads get one shared list. Each entry has an ID, the goal, what I found so far, the exact next action and what would count as done. I can say "add this to my loose ends" in any tool, then weeks later say "resume" with that ID and pick it up cold.
- **Permissions.** Routine local work (reading files, running commands, public research) runs without asking me. Anything that touches an account, money or a public post needs my OK in the current chat.
- **Personal work.** Same pattern: written memory, small delegated tasks, me reviewing the result. Anything personal or sensitive lives in a separate private repository with the same structure, so that's all I'll say about it here.

In every case my job is the same. I'm the architect and the reviewer. I set the question, decide what matters, check the work and make the call. The agents do the reading, the comparing and much of the typing.

## A worked example: this website

I built this site today. Research started just after noon. The first version shipped about an hour and a half later, and a second version about 40 minutes after that. That sounds like a story about AI writing code fast. It isn't. The speed came from everything above.

1. **Research (about 9 minutes).** 21 AI runs worked in parallel. Six research questions each went to three models from three different companies, and three more runs checked my hosting account and gathered notes about my background. All saved as one bundle with a summary table.
2. **Decisions.** The summary became numbered decisions, each with the options I rejected. A ChatGPT review of the plan added more.
3. **Design.** Agents built three home page mockups. I picked one, they built variants, and I picked again.
4. **Build.** A strong model ran the work and did the visual pass, while cheaper models scaffolded pages. Work happened on a branch, I reviewed it, and it merged to go live.
5. **Trouble.** Production deploys kept timing out on the hosting provider's API. The fix is now a numbered decision, and the manual retry steps are in `STATE.md`. Agents could read my hosting dashboard, but DNS and domain changes were left to me, with exact click steps.

The website's memory folder now holds a spec, a dozen numbered decisions, a state file and every research report. The next session starts from "Resume here".

## What I've learned

**Agents guess.** Even good ones. A worker will tell you, with full confidence, that a file says something it doesn't. So every important claim gets checked against the source, and the more a model tends to guess, the narrower its jobs.

**Review is not optional.** I picked the design and pushed back on the CSS plan. Models are better at writing code than at judging how a page looks.

**Notes that disagree are worse than no notes.** When I changed my mind on Tailwind, older notes still said plain CSS. An agent that reads both gets confused. Updating memory after a change is part of the work, not a chore after it.

**Quota is a real limit.** The strongest model does the judgment work, like the visual pass on a design. Cheaper models do the scaffolding.

**Some things stay mine.** Anything that touches accounts or money, the final call on design and wording, and deciding what is worth doing at all.

## Start small

You don't need six tools or 1,400 commits. Here is how I would start:

1. **Make one folder and put it in git.** Add a short `AGENTS.md` with the rules you keep repeating to every AI session, and point your tool at it.
2. **Keep a `DECISIONS.md` for one project.** Each time you make a choice, write what you picked, what you rejected and why. Have the agent read it at the start of every session.
3. **Turn one repeated explanation into a skill.** Pick the thing you explain to agents most often and write it down as steps. Next time, just say "follow that file".

Then use it for a week and fix whatever annoys you. That's how mine grew. Not from a grand design, but from writing down the thing I had just explained for the third time.
