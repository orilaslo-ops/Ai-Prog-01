# Instructions

**Goal:** find out what a coding agent can actually do. In one hour you and a partner will describe something in English — a game, a visualization, a simulation, a tool — and put it on the internet, working, at a real URL. At the end of class, we will vote on the coolest demo. The winners will have their demo linked on the course website; if you would rather not, tell your lab instructor in advance. Good luck.

An agent isn't autocomplete and it isn't a chat window you copy out of. It runs on your machine: you describe what you want, it writes and edits real files, runs commands, and you look and ask for more. Aim for something live and interactive; first-lab grading is lenient (see below).

## Before the session — setup

Check Moodle on Monday for your assigned section and room. Attend that section; don't assume you can switch rooms.

Do this before class; setup is what eats the room's time. You'll work in a pair on one laptop, but you won't know whose until you get there, so everyone needs a working setup.

- **A Unix-style command line** — macOS Terminal, Linux, or WSL on Windows. (Native cmd/PowerShell won't work, and installing WSL can need a reboot — do it a few days early.)
- **An agent account you register yourself** — Claude or OpenAI/Codex. No invites are sent.
- **The agent as a CLI** — Claude Code (`npm i -g @anthropic-ai/claude-code`) or Codex. Launch it once to log in. The VS Code extension is optional; the lab works in the terminal.
- **A GitHub account + git.** Recommended: `gh auth login` — one step makes `git push` work and lets the agent create your repo and turn on Pages with no clicking. Without `gh` you'll do both in the GitHub website. It stores a key that reaches every repository you own and keeps it until you remove it; that's fine for now, and in Week 8 you'll narrow it down.

**Before class:** start your agent in a new empty folder. Ask it to create a simple web page, then open it in your browser. Make sure you're signed in to GitHub too. Everyone should do this, even though you'll work in pairs.

## Phase 1 — Pair up and choose an idea (5 min)

Work in pairs on one laptop; both partners help direct the agent. Only the last unpaired student works solo. Groups of three or more are not allowed.

Choose a game, visualization, simulation, or tool. Three rules:

1. **It runs entirely in the browser.** No server, no backend, no database, no API keys — just HTML, CSS and JavaScript. Say this in your first prompt — GitHub Pages cannot run a backend.
2. **Neither of you knows how to build it by hand.** Aim above your own level. That's the experiment.
3. **You can show it in 90 seconds.** Everyone demos at the end.

Stuck? Ask the agent for five ideas and pick one. Agree on your idea in one sentence.

## Phase 2 — Build, publish, and improve (60 min)

**Get something on screen.** Give the agent your idea, let it work, and open the result in a browser. Notice what it does without being asked: files, commands, and decisions.

**Publish early, before polishing.** Ask the agent to create the repository, push the code, and switch on GitHub Pages. GitHub Pages allows you to have a repository with HTML or web content that is just live online. Open your live URL: `https://<username>.github.io/<repo>/`. Let the agent work out the steps; ask the lab instructor if you get stuck.

**Share your URL.** Your lab instructor will share the section's spreadsheet during class. One partner adds a new row with your demo title, live URL, and both partners' student ID numbers and Hebrew University emails; leave other pairs' rows alone.

**Submit it on Moodle too, each of you.** Open Lab 1 site and paste the URL on the first line of the text box. Anything you want to tell us about the lab can go below it (optional). Your grade is entered there.

Publishing early exposes deployment problems while you still have time to fix them.

*If github.com doesn't work for you — the school's own GitHub*

**Build it up.** Ask for something you have no idea how to implement: collision physics, sound, an animated chart, or an opponent. Keep it browser-only.

**Publish as you go.** After each change you're happy with, ask the agent to commit and push, then check the live URL.

- **Describe the behaviour you want, not the code.** "The ball should bounce off the walls and speed up each time" beats trying to name a function.
- **When it gets something wrong, say what's wrong and ask again.** Don't go fix it yourself. See how far you get by only talking.
- **You can stop it mid-run with Esc**, then re-prompt with a correction. Interrupting early beats waiting for something you'll throw away.
- **Try typing while it's still working** and see what your tool does with your text.
- **Keep track of the moments that surprised you**, the things it got wrong, and any difficulty that came up. You'll want one of them for the demo.
