---
title: "The operating manual behind all my AI work"
summary: "A guided tour of the folder of plain-text rules, memory and procedures that every AI tool I use reads first, and how it runs my engineering, research and planning."
pubDate: 2026-10-12
skills: ["AI agents", "Spec-driven development", "Git", "Markdown", "Claude Code", "Codex", "OpenCode", "Gemini"]
draft: true
---

Today I built this website. Research started just after noon. The first version went live about an hour and a half later, and a second version 40 minutes after that.

In the first nine minutes, 21 AI runs worked in parallel. Six research questions each went to three models from three different companies, and three more runs checked my hosting account and gathered notes about my background. Later rounds challenged the plan, drafted case studies and built design mockups.

That sounds like a story about AI writing code fast. It isn't. The speed came from something I had been building for four months: a folder of plain text files that every AI tool I use reads before it does anything. I call it the Agents workspace.

It started as a place to keep coding instructions. It has become the operating manual for most of my work: how I plan, research, decide, delegate and keep track of loose ends. This post is a guided tour.

## The short version

If you only read one section, read this one. The workspace is a git repository of Markdown files, organized by job:

| Part | What it does | Kitchen version |
|---|---|---|
| `AGENTS.md` | Short rules every AI session reads first | House rules on the wall |
| Memory files | What is true now, and why we decided things | Notes left for the next shift |
| Specs and changes | What we are building, and the plan to get there | The order ticket |
| Skills | Step-by-step procedures, loaded only when needed | The recipe book |
| Roles and workers | Who may do what, and how big a job can be | The kitchen brigade |
| Adapters | One small mapping per AI tool | Any trained chef can walk in |
| Capabilities | Notes on outside tools: search, browsers, other AIs | The supplier list |

The kitchen column is the analogy I'll use for the rest of the post. A good restaurant keeps working when the chef on shift changes, because the recipes, rules and notes live in the kitchen, not in one person's head. I wanted the same thing for AI sessions.

## Why I built it: every session starts from zero

If you use AI tools for real work, you have hit this. You spend an hour with an agent on a hard problem. It learns why you picked one library over another, which approach failed and what "done" means. Then the session ends, and all of that is gone. The next session is a smart newcomer who knows nothing.

In 1985 the computer scientist Peter Naur wrote an essay called "Programming as Theory Building". His point: the real program is not the code. It is the understanding in the heads of the people who built it. What the code is for, why it has this shape, what would need to change if the world changed. The code is a lossy copy of that understanding, and when the people leave, the understanding leaves with them.

An AI session is the person who just left, every single time.

There is a second problem. AI tools change every few months. I use Claude Code, Codex, Gemini, OpenCode, Hermes and Cursor. Each keeps its own instructions, memory and settings in its own format. If my rules live inside one tool, I lose them when I switch. If I copy them by hand between tools, the copies drift apart.

These are really the same problem. Knowledge falls out at a boundary: either the session ends, or the tool goes away. So the workspace has one job, written at the top of its main file: keep the understanding of the work outside any single session and outside any single tool.

<!-- FIGURE 1: Several different AI agents (robots of different shapes) all reading from one big open rulebook on a table. Explains: one source of truth, many tools. -->

## 1. How agents get their rules

Every session starts by reading one file, `AGENTS.md`. Think of it as the house rules taped to the kitchen wall. It covers:

- **Why the workspace exists**, in a few paragraphs.
- **Where things live**, as a short map of the folders.
- **Where work goes**: "for a research question, use this skill; for serious multi-step work, use that workflow".
- **Hard gates**: before writing any report, read the file that says where reports go. Before changing project memory, read the memory rules.
- **Boundaries**: what needs my explicit OK, what is private, and what must be committed before the session ends.

The important choice is that this file stays short. It works like a router: "for this kind of task, read that file". One giant instruction file wastes context in every session, including the ones that only need to fix a typo.

There is a reading order, too: global rules first, then the project's own rules. For this website, the code repository has a small link (ignored by git) to the website's folder inside the workspace, so an agent that opens the code also finds the memory.

How does each tool find `AGENTS.md`? Through the cheapest trick available. In Claude Code, the global instruction file is a symbolic link (a file that points at another file) to `AGENTS.md`. Other tools read a shared link in my home folder. Edit one file, and every tool sees the change in its next session.

## 2. Memory that survives the session

The second part is memory. Each project gets a small set of files, and each file has one job:

- **`STATE.md`** says what is true right now and where to resume. It is the first thing an agent reads.
- **`DECISIONS.md`** lists each choice, what I rejected and why.
- **`SPEC.md`** says what we are building and how we will know it is done.
- A few optional files cover sources and how much to trust them, architecture, and a map of the code.

These are the notes one kitchen shift leaves for the next, and the rules are strict. `STATE.md` should stay under about 120 lines. Each fact has one home that other files link to. There is no hand-written changelog, because git already is one: every commit message has to say *why* a change was made.

Here is a real example from today. The research first recommended plain CSS for this site. I pushed back: Tailwind lets me prototype faster, its default styles can be removed, and it likely costs fewer AI tokens. A second round of research checked my argument and agreed. `DECISIONS.md` now records the first recommendation, my pushback, the evidence and the final call. Tomorrow, a fresh agent will read that and won't suggest plain CSS again.

The website's `STATE.md` opens with a section called "Resume here". It lists what is live, what is open in priority order, and even the exact retry steps for a hosting error that kept coming back this afternoon. If my laptop died right now, a new session could pick up from that file alone.

<!-- FIGURE 2: A notebook being handed from one robot to another across a line on the floor, with a moon on one side and a sun on the other. Explains: memory survives between sessions. -->

## 3. Where everything gets filed

Agents produce a lot of writing. Without rules, it ends up scattered next to the code, with names like `notes2_final.md`. So filing has its own rulebook.

Generated documents go into one of two places: a shared `artifacts/` folder for work that spans projects, or a project's own `artifacts/` folder. Inside, there are fixed drawers: `investigations/` for research, `audits/`, `reviews/`, `handoffs/` for passing work to a future session, `docs/` for things people will read, and a few more. If nothing fits, there is `misc/`. Agents may not invent new drawers.

Every file name follows the same pattern: date, time, document type, title and the model that wrote it. Today's research lives in a folder called:

```text
26-10-12_12-04__research__personal_website_foundations_opus-5-5/
```

Each file also starts with a small header listing when it was made, which model made it, what it is for, and which other files it relates to (with a one-line reason for each link).

This sounds like bureaucracy. In practice I can find any report from months ago and see which model wrote it. And a written rule keeps agents from mistaking an old report for current truth: `artifacts/` holds evidence, while current truth lives in the memory files and specs.

## 4. Spec-driven development: plan, execute, reconcile

For small jobs, I just ask. For serious work (several steps, several files, real risk), there is a three-step workflow. Spec-driven development means you write down what should be true before you change anything, then check the result against it. Mine borrows ideas from an open-source tool called OpenSpec.

1. **Plan.** A strong model investigates until the unknowns are gone, then shows me a readable proposal. Nothing gets written as an executable plan until I approve it. Then it creates a change folder.
2. **Execute.** A *fresh* session reads that folder and does the work, sending small jobs to workers and checking every result.
3. **Reconcile.** Another fresh session reads what happened and updates the long-term memory: state, decisions, specs and the code map.

The change folder is the order ticket. It holds a `PLAN.md` with scope, which files may be touched, what to verify and how workers are used. It also holds an execution log (decisions and failures, not a chat transcript), a result file and a list of memory updates for step three.

The rule that makes this work: **no step relies on chat history.** Each step starts from files and ends by writing files. If a session crashes, or I come back a week later, the next step picks up from the folder.

Specs live in two places. `specs/` holds how things should behave now, written as "when this happens, then that must be true" scenarios. A change folder holds proposed edits to those specs, and reconcile merges them in when the change lands. So the spec describes the system as it is, not as it was planned three months ago.

One more rule I like: **the lead writes the important words.** When the exact wording is the deliverable (a spec, a rule, a memory entry), the top-level agent writes it itself and saves it word for word. Workers may paste it into place. They may never write or rephrase it.

<!-- FIGURE 3: A paper ticket going from one large robot to three small robots, then three small reports flowing back into a filing cabinet. Explains: plan, execute with workers, reconcile into memory. -->

## 5. Skills: the recipe book

A skill is a written procedure that an agent loads only when the task calls for it. There are 21 right now. Some examples:

- **research**: split a broad question into topics, send each to workers, and always finish with one saved report. A chat answer alone never counts.
- **memory-reconcile**: after ad hoc work, check whether long-term memory is now out of date, and fix it. If I didn't clearly ask for changes, it only reports and asks once.
- **plan-create, plan-execute, plan-reconcile**: the three steps above.
- **chatgpt-browser** and **claude-browser**: drive those websites to start research chats and export the results.
- **task-codex**, **task-opencode** and friends: hand a bounded job to a different AI tool.

Skills are short. The facts they depend on (command-line flags, costs, known failures) live in a separate `capabilities/` folder, so when a tool changes, I fix one fact sheet instead of every recipe.

## 6. Roles and workers: the kitchen brigade

Most of my sessions have one top-level agent that hands small jobs to workers. The top-level agent is the head chef. It owns the plan, the architecture, the final checks and the long-term memory. Workers are line cooks with narrow stations.

The `roles/` folder defines them:

| Role | May do |
|---|---|
| Explore | Read sources and write a report. Nothing else. |
| Execute | Edit only the files named in its job. |
| Explore high, Execute high | The same, with a stronger model for harder bounded jobs. |
| Orchestrator | Run one phase and hand jobs to workers. Nothing deeper. |

Each job goes out as a packet: one goal, the files to read, what may be changed, how to check the result and when to stop. A few rules hold everywhere:

- **Workers cannot start other workers.** One layer deep, always.
- **Workers get three serious attempts**, then report "blocked" instead of guessing.
- **Packets have a size limit**, roughly under half of the model's working memory.
- **Packets have a clock.** A regular worker gets checked at three minutes and cancelled at four.

The part I didn't expect to matter is a "delegation briefing" that labels every model by cost, skill, speed and *guessing*: how often a wrong answer was a confident guess instead of "I don't know". Some of my strongest models get a high guessing label. They know a lot, but when they are wrong, they rarely admit it.

That label changes what a model is allowed to do. A model that guesses a lot can still run in large numbers, but only on jobs I can check quickly: "does this file say X", "run this command". It never gets judgment calls or long-term memory. Cost decides how many run at once. A cheap model might run three to eight at a time. My most expensive ones run one to three.

<!-- FIGURE 4: One large robot holding a clipboard, pointing at three small robots, each holding a single small card. Explains: a lead agent handing narrow job packets to workers. -->

## 7. One rulebook, six tools

Here is the rule at the top of `AGENTS.md`, in short: **tools adapt to the workspace. The workspace never bends to a tool.**

Each AI tool gets an adapter: a small mapping that points the tool at the shared files and translates the rules into the format the tool expects. Today there are adapters for six tools. For example, the worker roles above become real subagents in Claude Code, Codex and OpenCode, each running a model picked for that tool.

The adapter is only a loader. It may say "this subagent runs this model, now go read the role file". It may not copy the role's rules. Copied rules are how drift starts: someone updates the original and forgets the copy.

When a tool can do something the workspace doesn't cover, I either add it to the workspace or record it in that tool's list of approved differences. Nothing gets quietly ignored, and approved differences are shown again on every check.

One more rule: **one tool per session.** An agent may only inspect or change the settings of the tool it is running in. "Update all my tools" means six separate sessions, because only a tool running in its own session can see its real settings and confirm a change worked.

<!-- FIGURE 5: A single open folder in the middle with five different plugs (different shapes) plugged into it from all sides. Explains: many AI tools connect to one shared folder. -->

## 8. Borrowing another tool's strengths

Different tools are good at different things, and each runs on a different subscription. Codex gives me OpenAI's models. OpenCode gives me cheap models I can run in large batches. Claude is my pick for hard reasoning and review, but its usage limit is the tightest budget I have.

So there are skills for handing a bounded job from one tool to another through its command line. Today's research is an example: each topic went to Claude, to Codex and to Gemini at the same time.

The useful part of asking three providers isn't when they agree. It's when they don't. All three picked Astro for the framework, which was a good sign but not proof. On hosting, two followed Cloudflare's own advice to use Workers, and one preferred Pages. On one browser feature, one model claimed support that the official compatibility data didn't show, so I threw that claim out. The disagreements told me where to look closer.

Two limits keep this safe:

- **It never happens on its own.** Cross-tool handoffs only run when I ask for them. A skill suggesting one, or a tool failing, is not a reason.
- **Child sessions don't spawn crowds.** A session started this way is blocked from starting its own workers unless I allow it. Ten child sessions that each start ten workers is a hundred agents, so that budget is set before launch.

## 9. How the writing style gets enforced

Agents have a recognizable voice: long dashes everywhere, the same handful of buzzwords, three adjectives where one would do. It is tiring to read.

So `AGENTS.md` has a section, marked critical, about writing style. It asks for plain English, simple explanations of complex terms, and no jargon-filled, AI-sounding vocabulary. It also says to assume every reader is incredibly busy. Because it lives in the file every session reads first, every tool gets the same rule without me repeating it.

The same idea shows up in other places:

- **Project rules.** The website's own rules ban putting private details on a public site and ban invented work history or results.
- **What reviewers see.** Commit messages, pull requests and review replies may not mention the workspace's internal plans, worker names or file paths. A coworker should see clean work, not my machinery.
- **Design rules.** For this site's design, a short list of what not to do ("no skill bars", "no invented results") worked better than asking an agent for good taste.

This is a rule, not a linter, and agents still slip. But a rule every session reads beats correcting the same habit in every chat. An agent helped draft this post under these same rules.

## 10. Beyond code

This is the part I didn't plan. The same setup works for most of my work that involves thinking, not just typing.

**Research.** When I need to understand something (a tool, a technology choice, a bigger decision), I run the same kind of fan-out and end up with a saved report and its sources, instead of a chat I'll never find again.

**Choosing models.** A folder holds public benchmark data for the models I use, plus my notes on which model suits which job. The delegation briefing is the only place that picks a model for a role, and every adapter points to it.

**Loose ends.** Unfinished threads get one shared list. Each entry has an ID, the goal, what I found so far, the exact next action, what would count as done, and a short handoff file with the history. I can say "add this to my loose ends" in any tool, and weeks later say "resume" with that ID and pick it up cold.

**Permissions.** Routine local work (reading files, running commands, public research) runs without asking me. Anything that touches an account, money or a public post needs my OK in the current chat. For this site, agents could read my hosting dashboard, but DNS and domain changes were left to me, with exact click steps.

**Personal work.** The pattern is the same: written memory, small delegated tasks, and me reviewing the result. Anything personal or sensitive lives in a separate private repository with the same structure, so that's all I'll say about it here.

In every case my job is the same. I'm the architect and the reviewer. I set the question, decide what matters, check the work and make the call. The agents do the reading, the comparing and much of the typing.

## A worked example: this website

Here is how today went, in order:

1. **Research (about 9 minutes).** 21 parallel runs, saved as one bundle with a summary table.
2. **Decisions.** The summary became numbered decisions, each with rejected options. A ChatGPT review of the plan added more.
3. **Design.** Agents built three home page mockups. I picked one, they built variants, and I picked again.
4. **Build.** A strong model orchestrated and did the visual pass, while cheaper models scaffolded pages. Work happened on a branch, I reviewed it, and it merged to go live.
5. **Trouble.** Production deploys kept timing out on the hosting provider's API. The fix is now decision D11, and the manual retry steps are in `STATE.md`.

The website's memory folder now holds a spec, eleven decisions, a state file and every research report. The next session starts from "Resume here".

## What I've learned

**Agents guess.** Even good ones. A worker will tell you, with full confidence, that a file says something it doesn't. So every important claim gets checked against the source, and the more a model tends to guess, the narrower its jobs.

**Review is not optional.** I picked the design and pushed back on the CSS plan. Models are better at writing code than at judging how a page looks.

**Notes that disagree are worse than no notes.** When I changed my mind on Tailwind, older notes still said plain CSS. An agent that reads both gets confused. Updating memory after a change is part of the work, not a chore after it.

**Quota is a real limit.** The strongest model does the judgment work, like the visual pass on a design, and cheaper models do the scaffolding.

**Some things stay mine.** Anything that touches accounts or money, the final call on design and wording, and deciding what is worth doing at all.

## Start small

You don't need six tools or 1,400 commits. Here is how I would start:

1. **Make one folder and put it in git.** Add a short `AGENTS.md` with the rules you keep repeating to every AI session, and point your tool at it.
2. **Keep a `DECISIONS.md` for one project.** Each time you make a choice, write what you picked, what you rejected and why. Have the agent read it at the start of every session.
3. **Turn one repeated explanation into a skill.** Pick the thing you explain to agents most often and write it down as steps. Next time, just say "follow that file".

Then use it for a week and fix whatever annoys you. That's how mine grew. Not from a grand design, but from writing down the thing I had just explained for the third time.
