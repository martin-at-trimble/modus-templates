# Modus templates

A showcase of UI templates built with **Modus Web Components**, generated with the
[`/modus-template`](.claude/commands/modus-template.md) command. Each template
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
| Portal | `/portal` | [`src/templates/Portal`](src/templates/Portal) |
| Usage dashboard | `/usage-dashboard` | [`src/templates/UsageDashboard`](src/templates/UsageDashboard) |
| Inbox | `/inbox` | [`src/templates/Inbox`](src/templates/Inbox) |

Run it locally to click through them:

```bash
npm install
npm run dev
```

Open the dev-server URL (usually `http://localhost:5173`) and use the template switcher at the
top, or go directly to a route — for example `http://localhost:5173/inbox`.

Each template is intentionally self-contained (one page file + colocated data/types + scoped
CSS) — see **Keep it copy-pasteable** in the command for why. Copy a `src/templates/<Name>/`
folder straight into another Modus app when you find one you want.

## The `/modus-template` command

[`.claude/commands/modus-template.md`](.claude/commands/modus-template.md) is a slash command:
give it a screenshot plus a name and title, and it builds a matching page using Modus
components, tokens, and events — not raw HTML or another component library. It works against
**any** Modus stack (React, Angular, Vue, vanilla); it detects your framework and installed
Modus version before writing anything.

```
/modus-template <template name> | <page title> | [optional notes] | [verify: disabled|minimal|high]
```

Attach a screenshot to the same message. For example:

```
/modus-template inbox | Inbox template | Gmail-style mail list | minimal
```

The command will:

- Detect your framework, installed `@trimble-oss/moduswebcomponents` version, bundler, CSS
  setup, and **existing routing** instead of assuming Vite + React + Tailwind.
- Load the matching `modus-wc-*` skill for any component it touches (tabs, modal, table, side
  navigation, form inputs, etc.) before reaching for generic MCP prop lookups.
- Rebuild the screenshot's layout and interactions with Modus components, slots, and CSS
  tokens — never static hex, never a second component library, never a guessed icon name.
- Implement **full narrow-screen responsiveness** (≤768px) even when you only attach a
  desktop screenshot — navbars, side rails, lists, and tables must not overlap or clip.
- **Wire the page into your app without breaking existing navigation:**
  - If the project already has a router or template gallery (like this repo), **add a new route**
    alongside the others and leave the default route / switcher unchanged.
  - If the project is greenfield with no routing, wire this template as the sole page.
- Ship the result as **one self-contained page** (page + colocated data + scoped CSS) — it does
  not merge other templates' code into yours.
- Apply small, framework-agnostic code style conventions (alphabetized props and hook
  dependency arrays, `&&` over null-ternaries, reusing existing helpers before inventing new
  ones) on top of whatever the target repo's lint/format conventions already require.
- Verify in the browser per the **verify level** you choose (see below), including a narrow
  viewport pass at `minimal` or `high`.

When the command finishes, it posts a **Completion summary** with what was built, file paths,
the **route to check** (e.g. `/inbox`), responsive breakpoints used, and which verification
level ran.

### Browser verification levels

| Level | What runs |
|---|---|
| `disabled` | No browser — static code review only. Summary notes that you should smoke-test. |
| `minimal` (default) | Dev server, one desktop snapshot, **resize to ~390px** to confirm no navbar/list overlap, console check. |
| `high` | Full interaction sweep (menus, modals, drag/resize) plus desktop **and** narrow viewport. |

Say `disabled`, `skip playwright`, or `no browser check` in notes to force `disabled`. Ask for
a thorough pass to get `high`.

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
4. Run `/modus-template <name> | <title> | [notes] | [verify level]` (Claude Code / Cursor) —
   or trigger the equivalent prompt in Copilot — with a screenshot attached.
5. Read the **Completion summary** at the end for the route and file paths to verify locally.
