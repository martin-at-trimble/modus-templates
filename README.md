# Modus templates

A showcase of UI templates built with **Modus Web Components**, generated with the
[`/modus-template`](.claude/commands/modus-template.md) command. Each template
in [`src/templates/`](src/templates/) started from a **reference** (usually a screenshot)
handed to that command, which turns it into a copy-paste page you can drop into your own Modus
app.

This repo has two jobs:

1. **Showcase** what `/modus-template` produces — browse the gallery, copy a page you like.
2. **Host the command + skill** so you can pull them into your own project and point them at
   your own references.

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
CSS) — see **Keep it copy-pasteable** in the skill for why. Copy a `src/templates/<Name>/`
folder straight into another Modus app when you find one you want.

## The `/modus-template` command

[`/modus-template`](.claude/commands/modus-template.md) is a **thin entry point** (reference,
inputs, verify level, workflow). The **implementation playbook** lives in the
[**modus-template** skill](.claude/skills/modus-template/SKILL.md) — discovery, routing,
reference rules, Modus contract, quality bar, and completion summary. The agent **reads the
full skill file before coding** when the command runs.

Together they build a matching page from a reference using Modus components, tokens, and
events — not raw HTML or another component library. Targets **any** Modus stack (React,
Angular, Vue, vanilla).

### Inputs

**Required:** reference + template name + page title. The agent asks rather than guesses if
anything is missing or the target stack is unclear.

**Reference** is normally a **screenshot** (preferred). When no image is available, accept a
design-tool link, URL to an existing page, or a **detailed** written layout spec. Vague text
("a dashboard with charts") is not enough.

**Invocation examples** (pipe syntax is optional; notes may contain `|`):

```
/modus-template inbox | Inbox template | Gmail-style mail list | minimal
```

Or paste a **canonical handoff block** in the message:

```text
Reference: screenshot attached
Template name: Inbox
Page title: Inbox template
Notes: Gmail-style mail list
Verify: minimal
```

Attach the screenshot when using an image reference. **Verify level:** `disabled`, `minimal`
(default), or `high`. Use `skip playwright` / `no browser check` in notes for `disabled`; ask
for a thorough pass for `high`.

Full input rules, defaults, and verify semantics: skill **Inputs contract** section.

### What the skill does (invoked by the command)

- **Authority ladder** — project `modus-*.md` rules → `modus-wc-*` skills → Modus Docs MCP →
  skill deltas (so team rules win over generic prompt text).
- **Discovery-first** — framework package, Modus semver, dev scripts, CSS stack, bootstrap
  (`modus-wc-styles.css`, icon font, theme on `<html>`), existing page patterns, routing and
  any central nav/registry (route table, template gallery, switcher).
- **Framework branches** when relevant — Next.js (`modus-wc-nextjs`), charts
  (`modus-wc-chart-colors`), Modus Blueprint URLs (`modus-blueprint-llm-context`).
- **Skills before MCP** — loads the matching `modus-wc-*` skill per component (tabs, modal,
  table, form inputs, side navigation, pagination, etc.) before generic prop lookups.
- **Reference fidelity** — layout, hierarchy, and interactions with Modus APIs; ignores
  non-configurable shell paint; validated icon names; no parallel component libraries.
- **Full narrow-screen responsiveness** (≤768px) even with only a desktop reference.
- **Routing without breaking the app** — adds a route/entry alongside existing ones; updates
  central gallery or nav registries when the project uses them; preserves default route and
  switcher (greenfield: sole page only).
- **Copy-pasteable output** — one main UI file with region comments, colocated data + scoped
  CSS; reuses existing project helpers when present; does not add new shared modules solely
  for one template.
- **Quality bar** — icon validation, repo lint/format, optional build/lint, browser check per
  verify level (Playwright/browser MCP when available).

### Browser verification levels

| Level | What runs |
|---|---|
| `disabled` | No browser (or no browser MCP). Static markup/events/icon review. Summary says you should smoke-test. |
| `minimal` (default) | Dev server, one desktop snapshot, **resize to ~390px** (no navbar/list overlap), console check. |
| `high` | Full interaction sweep (menus, modals, drag/resize at every nesting level), desktop + narrow viewport, **accessibility spot-check**, and **light/dark theme** verification. |

Accessibility and theme checks are **`high` only** — not part of `minimal`.

### Completion summary

Every run ends with a **Completion summary** covering:

1. What was built
2. Files changed (page, data/CSS, routing/registry)
3. Route to check (+ dev-server URL when known)
4. Responsive notes (breakpoints, what collapses on narrow)
5. Verification (level, narrow viewport, build/lint; a11y + theme only when `high`)
6. **Shared project assets** — what was **reused** from the project, what stayed **local to
   the template** for copy-paste purity, and what is **suggested for promotion** to a shared
   lib if the user adopts the template permanently
7. Stack notes (framework, Modus semver, MCP version)
8. **Reference gaps** — reference type used and accepted Modus/API limitations
9. Icons (new names and how they were validated)
10. Naming convention (matched repo precedent or default stated)
11. **Modus adoption** — estimated %, non-Modus inventory, and why each remains (report only)
12. **Accessibility** — issues found and possible fixes (static at all levels; browser tree at `high`; report only)

### Command + skill locations

| Piece | Cursor | Claude Code |
|---|---|---|
| **Command** (inputs, verify, workflow) | [`.cursor/commands/modus-template.md`](.cursor/commands/modus-template.md) | [`.claude/commands/modus-template.md`](.claude/commands/modus-template.md) |
| **Skill** (implementation playbook) | [`.cursor/skills/modus-template/SKILL.md`](.cursor/skills/modus-template/SKILL.md) | [`.claude/skills/modus-template/SKILL.md`](.claude/skills/modus-template/SKILL.md) |

GitHub Copilot: [`.github/prompts/modus-template.prompt.md`](.github/prompts/modus-template.prompt.md)
(thin command, same as above).

Keep **command** copies in sync for inputs/verify; keep **skill** copies in sync for
implementation (`npm run check:modus-template-sync`). Each file notes sibling paths at the top.

### Using it in your own project

Copy this **distribution bundle** into your repo (create folders as needed):

| Asset | Cursor | Claude Code |
|---|---|---|
| Command | `.cursor/commands/modus-template.md` | `.claude/commands/modus-template.md` |
| Skill | `.cursor/skills/modus-template/SKILL.md` | `.claude/skills/modus-template/SKILL.md` |
| Modus rules (optional, recommended) | `.cursor/rules/modus-*.md` | `.claude/rules/modus-*.md` |
| MCP config (optional) | — | `.mcp.json` (Playwright + Modus Docs MCP) |

Steps:

1. Copy the command and **modus-template** skill for your tool.
2. Install `@trimble-oss/moduswebcomponents` (or the matching framework wrapper) — see
   [Modus packages guidance](.claude/rules/modus-essentials.md#packages) if needed.
3. Optionally copy Modus rules — the skill's authority ladder prefers them over generic text.
4. Optionally copy `.mcp.json` or wire Playwright + Modus Docs MCP in your client for browser
   verification and component lookups.
5. Run `/modus-template` with a reference and name/title (slash args, Copilot prompt fields, or
   the canonical handoff block). The agent reads **modus-template** before coding.
6. Read the **Completion summary** — especially **Shared project assets** and **Route to
   check** — before verifying locally.
