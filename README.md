# Modus templates

A showcase of UI templates built with **Modus Web Components**, generated with the
[`/modus-template`](.claude/commands/modus-template.md) Claude Code command. Each template
in [`src/templates/`](src/templates/) started as a single screenshot handed to that command,
which turns it into a copy-paste page you can drop into your own Modus app.

This repo has two jobs:

1. **Showcase** what `/modus-template` produces — browse the gallery, copy a page you like.
2. **Host the command itself** so you can pull it into your own project and point it at your
   own screenshots.

## Templates in this repo

| Template | Route | Source |
|---|---|---|
| GitHub dashboard | `/github-dashboard` | [`src/templates/GithubDashboard`](src/templates/GithubDashboard) |
| Resizable panels | `/resizable-panels` | [`src/templates/ResizablePanelsPlayground`](src/templates/ResizablePanelsPlayground) |
| Code editor | `/code-editor` | [`src/templates/CodeEditor`](src/templates/CodeEditor) |
| Music streaming | `/music-streaming` | [`src/templates/MusicStreaming`](src/templates/MusicStreaming) |

Run it locally to click through them:

```bash
npm install
npm run dev
```

Each template is intentionally self-contained (one page file + a colocated data/types file) —
see **Keep it copy-pasteable** in the command below for why, and copy a `src/templates/<Name>/`
folder straight into another Modus app when you find one you want.

## The `/modus-template` command

[`.claude/commands/modus-template.md`](.claude/commands/modus-template.md) is a Claude Code
slash command: give it a screenshot plus a name and title, and it builds a matching page using
Modus components, tokens, and events — not raw HTML or another component library. It works
against **any** Modus stack (React, Angular, Vue, vanilla); it detects your framework and
installed Modus version before writing anything.

```
/modus-template <template name> | <page title> | [optional notes] | <browser checks level: disabled | minimal | high>
```

Attach a screenshot to the same message. For example:

```
/modus-template github-dashboard | GitHub dashboard | keep the left sidebar collapsed by default | disabled
```

The command will:

- Detect your framework, installed `@trimble-oss/moduswebcomponents` version, bundler, and CSS
  setup instead of assuming Vite + React + Tailwind.
- Load the matching `modus-wc-*` skill for any component it touches (tabs, modal, table, side
  navigation, form inputs, etc.) before reaching for generic MCP prop lookups.
- Rebuild the screenshot's layout and interactions with Modus components, slots, and CSS
  tokens — never static hex, never a second component library, never a guessed icon name.
- Ship the result as **one page**, wired as the sole route in your app (it won't merge itself
  into an existing nav or template gallery unless you ask).
- Apply small, framework-agnostic code style conventions (alphabetized props and hook
  dependency arrays, `&&` over null-ternaries, no `!important`, reusing an existing shared
  layout/utility stylesheet before inventing one) on top of whatever the target repo's own
  lint/format conventions already require.
- Start (or reuse) your dev server and actually exercise the page in a browser — clicking
  menus, opening modals, dragging resizable panes — before calling the job done.

### Available everywhere, not just Claude Code

The command is kept as three synced copies so it works with whichever tool you're using:

| Tool | Path |
|---|---|
| Claude Code | [`.claude/commands/modus-template.md`](.claude/commands/modus-template.md) |
| Cursor | [`.cursor/commands/modus-template.md`](.cursor/commands/modus-template.md) |
| GitHub Copilot | [`.github/prompts/modus-template.prompt.md`](.github/prompts/modus-template.prompt.md) |

All three carry the same instructions — only the invocation syntax and input-prompting
mechanism differ per tool. If you edit one, edit all three (each file says so at the top).

### Using it in your own project

1. Copy the command file matching your tool (see table above) into the equivalent folder in
   your project — e.g. `.claude/commands/`, `.cursor/commands/`, or `.github/prompts/` (create
   the folder if it doesn't exist).
2. Make sure your project has `@trimble-oss/moduswebcomponents` (or the matching framework
   wrapper) installed — see the [Modus packages guidance](.claude/rules/modus-essentials.md#packages)
   if not.
3. Copying the `.claude/rules/modus-*.md` files from this repo alongside the command is
   optional but recommended — they encode the Modus conventions (cards, buttons, forms, layout,
   accessibility, per-framework integration) the command follows, and it will read them
   automatically if present.
4. Run `/modus-template <name> | <title> | [notes] | <browser checks level>` (Claude Code /
   Cursor) — or trigger the equivalent prompt in Copilot — with a screenshot attached.

