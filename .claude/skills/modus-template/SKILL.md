<!-- Claude Code: save as `.claude/skills/modus-template/SKILL.md`. Cursor copy: `.cursor/skills/modus-template/SKILL.md`. -->

Use this skill after **`/modus-template`** (or equivalent) has supplied a **design reference** (screenshot, design-tool link, or detailed written layout spec), **template name**, **page title**, optional **notes**, and a **verify level** (`disabled` / `minimal` / `high`). Do not start implementation until those inputs are present and the target stack is known.

**Mandatory read order (before any file edits):**

1. **[REFERENCE.md](./REFERENCE.md)** — stable template contract (events, Modus API rules, copy-paste structure, do-not list). **Read the full file first.**
2. **This skill** — workflow from discovery through completion summary.

Sibling copies: [.claude/skills/modus-template/SKILL.md](../../.claude/skills/modus-template/SKILL.md). Reference: [.claude/skills/modus-template/REFERENCE.md](../../.claude/skills/modus-template/REFERENCE.md). Keep in sync with [.cursor/commands/modus-template.md](../../commands/modus-template.md). Run `npm run check:modus-template-sync` after edits.

## Inputs contract

Canonical source for what `/modus-template` (or equivalent) must collect before this skill runs. The command files for each tool (Claude Code, Cursor, GitHub Copilot) point here instead of repeating this section — only tool-specific argument syntax (pipe args, `${input:...}` fields, etc.) stays in the command file. If a command file's parsing text ever disagrees with this section, this section wins.

**Required before coding:** a concrete design reference + template name + page title. If any are missing, or there is no `package.json` and the target stack is unclear, ask before proceeding — do not guess framework or install packages silently.

**Design reference** is normally a **screenshot** (preferred — it's the only input format precise enough for pixel-level layout, spacing, and density fidelity). When no screenshot exists, accept an equally concrete substitute: a design-tool link (Figma, etc.), a URL to an existing page to emulate, or a **detailed** written layout/structure spec (regions, hierarchy, key controls, approximate density). A vague text description ("a dashboard with some charts") is **not** sufficient — ask clarifying questions or request a screenshot instead of guessing layout from thin air. Note which reference type was used in the **Completion summary**.

Accept input however the calling tool supplies it — slash-command arguments, prompt input fields, a pasted handoff block, or freeform message text.

**Canonical handoff block** (any tool, user or agent may paste):

```text
Reference: screenshot attached | design-tool/URL link | detailed written layout spec
Template name: …
Page title: …
Notes: …
Verify: minimal
```

- **Reference (required):** the screenshot attached to the message, a design-tool/URL link, or a detailed written layout spec.
- **Template name:** e.g. Portal, Inbox, Project home.
- **Page title:** browser tab title + primary page `h1` — use for `document.title` / framework head APIs.
- **Optional notes:** anything the reference doesn't make obvious.
- **Verify level:** `disabled` / `minimal` / `high`. Default `minimal` if unspecified. An explicit `Verify:` line (or a dedicated verify input field) is the reliable signal — free-text phrases like "skip playwright" / "no browser check" → `disabled`, or "thorough" / "full verification" → `high` are a fallback only when no structured field is given, not something to search for in unrelated notes.

If template name or page title is missing, or no usable reference is provided, ask before proceeding.

### Browser verification level

Pass the resolved level into **Quality bar** below. Use whatever Playwright MCP server is configured for the project (check `.mcp.json` or your client's MCP list for the exact name — do not assume a specific server name). Its tools typically surface as `browser_navigate`, `browser_resize`, `browser_snapshot`, `browser_console_messages` regardless of the server's registered name. If no browser MCP is available, treat as `disabled` and note that in the **Completion summary**.

| Level | Summary |
|---|---|
| `disabled` | Static markup, events, and icon review only. |
| `minimal` (default) | Dev server, desktop snapshot, **~390px resize**, console check. |
| `high` | Full interaction sweep (menus, modals, drag/resize at every nesting level) + narrow viewport + **accessibility spot-check** + **light/dark theme** verification. |

## Goal

Ship **one self-contained template page** a developer can copy into another app. Match the design reference's **information architecture, density, and interactions** using Modus components and tokens (see **[REFERENCE.md](./REFERENCE.md)**). Implement **full narrow-screen responsiveness** even when no mobile reference is provided. Do **not** pixel-clone chrome Modus does not support.

## Before you start: discover the target repo

Do not assume Vite + React. Spend a few tool calls up front:

**Monorepo check:** if the root `package.json` has no Modus deps and no obvious app code, look for `pnpm-workspace.yaml`, `nx.json`, `turbo.json`, or a root `workspaces` field, then search `apps/*/package.json` and `packages/*/package.json` for the app that actually renders UI (has a `dev`/`start`/`serve` script and a framework dependency). Treat that nested `package.json` — not the workspace root — as the target for every step below.

1. **Framework** — target `package.json` deps: `@trimble-oss/moduswebcomponents-react` / `-angular` / `-vue`, or base `@trimble-oss/moduswebcomponents` (vanilla). Determines wrapper API and event-binding syntax (see **REFERENCE.md**).
2. **Installed Modus semver** — read base `@trimble-oss/moduswebcomponents` from the target `package.json` (strip `-react19` / `-ng19` / `-vue` suffixes). If Modus is not installed, resolve with `npm view @trimble-oss/moduswebcomponents version` and install **into the target app's package** — use the workspace tool's scoped install (`pnpm --filter <app> add …`, `yarn workspace <app> add …`, `npm install --workspace <app> …`) rather than a bare install at the repo root — per the framework package table before writing components.
3. **Bundler / dev command** — read the target app's `package.json` scripts (`dev`, `start`, `serve`); do not assume Vite. In a monorepo, run it through the workspace tool from the repo root (e.g. `pnpm --filter <app> dev`, `nx serve <app>`, `turbo run dev --filter=<app>`) rather than `cd`-ing into the package.
4. **CSS approach** — Tailwind, plain CSS, SCSS, CSS modules, etc. Adapt class usage; Modus tokens, `customClass`, and scoped CSS apply regardless.
5. **Bootstrap sanity** — confirm `modus-wc-styles.css` is imported **before** app CSS; icon font (`modus-icons.css` or equivalent) is linked/served; theme bootstrap on `<html>` (`data-theme`, `data-mode`) if the project already uses it.
6. **Project Modus rules** — see **REFERENCE.md → Authority ladder**. If absent, still apply Modus 2.x conventions from skills and MCP.
7. **Skills before MCP** — for each component visible in the reference, load the matching `modus-wc-*` skill first (tabs, modal, table, form-inputs, dropdown-menu, side-navigation, chart-colors, pagination, breadcrumbs, date-time, tooltip, toast, utility-panel, file-dropzone, stepper, accordion-collapse, react-slotted-hosts, icons-setup, button, etc.). Use MCP to confirm prop/version drift, not as the sole source.
8. **Existing conventions** — sample 1–2 existing pages: folder layout, file naming, state patterns, shared helpers. **Match repo naming** when precedent exists; if none, use one folder per template, one main UI file with region comments, colocated data/types + scoped CSS under a page-root class — state the chosen convention in the **Completion summary**.
9. **Routing and registries** — router present? template gallery? central nav config? hash routing? multi-page static HTML? Plan to **add** alongside existing entries (see **Routing and integration**).
10. **Existing template check** — if a folder, route, or registry entry matching the requested template name already exists, stop and ask whether to overwrite/rebuild it from the new reference, create a differently-named variant alongside it, or iterate in place (apply the new notes/reference as a targeted diff rather than a full rewrite). Do not silently overwrite or silently rename.

### Framework branches (discovery only)

Branch during discovery — do not embed stack-specific implementation here:

- **`next` in dependencies** → `modus-wc-nextjs` skill + project `modus-nextjs` rules before client shell work.
- **Charts / dashboards in the reference** → `modus-wc-chart-colors` before chart markup (Recharts `ResponsiveContainer` sizing, token colors).
- **modus.trimble.com URL or named Blueprint template** → `modus-blueprint-llm-context` skill: fetch companion `.md` first, then use the reference for visual delta.

## Routing and integration (mandatory)

Discover how the target repo wires pages **before** changing entry points or navigation:

1. **Existing routing or page registry** (React Router, Vue Router, Angular routes, template gallery, sidebar link list, nav config module, hash routing, multi-page static site):
   - **Add** the new template as an **additional route/entry** alongside existing ones. Do **not** replace, remove, or redirect existing routes.
   - **Preserve** default route, catch-all, and gallery/switcher behavior unless the user explicitly asks to change it.
   - Register using the repo's path conventions (e.g. `/inbox`, `/usage-dashboard`).
   - If a **central registry** exists (route table, `TEMPLATE_LINKS`, nav config), add the new page there using the same pattern — not only the router file.

2. **Greenfield / no routing yet** (single `index.html`, no router, no other pages):
   - Wire the entry so this template is the sole page — standard empty-shell behavior.

3. **Vanilla / static:** match sibling pages (new HTML file, query-param tab, etc.) — discover don't invent.

4. **In all cases:**
   - The template page stays **self-contained and copy-pasteable** — do not merge other templates' data, CSS, or components into it.
   - **Shell chrome:** follow the **design reference**. Do **not** add `modus-wc-side-navigation` or `modus-wc-navbar` unless the reference shows that chrome. If project rules define greenfield shell defaults **and** the user did not scope to a chrome-free surface, prefer workspace rules; when the reference clearly omits chrome, do not add navbar/rail anyway.

## Split / resizable layouts (when applicable)

- Flip split direction at a breakpoint (match repo convention or ~768px default) — do not shrink panes indefinitely on narrow viewports.
- Nested splits: verify inner/outer handles are independent (drag-test at `high` verify).
- Re-test dragging after `flex` overrides on panes — shorthand can fight drag-applied inline styles.

## Responsive layout (mandatory)

Fully responsive on narrow screens even with only a desktop reference.

- Verify at **≤768px** (or repo breakpoint). No desktop-only layouts waiting for a mobile reference.
- **Navbars:** `min-width: 0` on slots; `condensed` on narrow; hide `slot="center"` via stable root + `hidden`, not conditional mount; progressive hide of nonessential `slot="end"` actions.
- **Side rails, folder panes, utility columns:** collapse/hide; main content scrollable.
- **Tables, lists, toolbars, splits:** stack, reflow, hide secondary columns, or controlled horizontal scroll — no overlap or clipped controls.
- **Page gutters:** inset at every breakpoint.
- Match repo responsive patterns (`useMediaQuery`, breakpoint constants, etc.) when present.

## Quality bar

Before you finish:

1. **MCP efficiently** — one `get_modus_component_data` per unfamiliar tag; do not spam MCP. Use `_all_components` only when choosing primitives from the catalog.
2. **Validate every new icon `name`** (package gallery, filesystem, or MCP).
3. **Match repo lint/format** conventions.
4. **Build/lint** — run the project's build or lint script when available (`npm run build`, `ng build`, etc.). Note in the summary if run, skipped, or not available.
5. **Browser check** per the verify level from the command invocation (default `minimal` if unspecified):
   - `disabled`: static markup/events/icon review only.
   - `minimal`: dev server, desktop snapshot, **~390px resize**, console check (use browser/Playwright MCP when available: `browser_navigate`, `browser_resize`, `browser_snapshot`, `browser_console_messages`).
   - `high`: full interaction sweep including drag/resize at every nesting level; desktop + narrow; **accessibility spot-check** (item 8) and **light/dark theme** check (item 9).
6. **Console** — no errors/warnings from your markup at `minimal`/`high` (slot remount, list nesting, nested buttons).
7. **Narrow viewport** — mandatory at `minimal`/`high`; at `disabled`, state narrow layout was implemented but not browser-verified.
8. **Accessibility spot-check** (`high` only) — one logical `h1`; icon-only buttons have `shape="square"` (or `circle`) + an accessible name; primary interactions keyboard-reachable in a sensible tab order. At `high`, use `browser_snapshot`'s accessibility tree to confirm no unlabeled interactive controls. At `disabled`/`minimal`, implement per project `modus-accessibility` rules and state in the **Completion summary** that live a11y tree review was skipped (not part of `minimal`).
9. **Light + dark theme** (`high` only) — toggle (or simulate) the project's theme switcher and confirm the template re-tones with no new console errors. At `disabled`/`minimal`, implement against Modus tokens and state that both modes were not browser-verified.
10. **Modus adoption audit (report only)** — before finishing, estimate **Modus adoption %** on the template page (see **[REFERENCE.md](./REFERENCE.md) → Modus adoption audit**). List remaining non-Modus interactive primitives. **Do not auto-fix** to hit a target percentage — report in the **Completion summary**.
11. **Accessibility audit (report only)** — review the template for a11y issues (static markup at all verify levels; add browser a11y tree findings at `high`). List each issue with a **recommended Modus-first fix**. **Do not auto-fix** solely to clear the list — report in the **Completion summary**.

## Completion summary (mandatory)

End every run with a **Completion summary**:

1. **What was built** — template + key interactions.
2. **Files** — page UI, colocated data/CSS, routing/registry/export changes.
3. **Route to check** — exact path and dev-server URL when known.
4. **Responsive notes** — breakpoints; what hides, stacks, or collapses on narrow screens.
5. **Verification** — verify level; narrow viewport checked in browser or not; accessibility spot-check and light/dark theme check done or not (**`high` only**); build/lint run or not.
6. **Shared project assets** — **Reused:** paths/helpers/patterns adopted from the project (form readers, media-query hooks, shell layout, cell helpers, etc.). **Local to template:** colocated helpers kept for copy-paste purity and why. **Suggested for promotion:** helpers that would benefit other pages if the user adopts this template permanently (suggest typical project lib path if one exists).
7. **Stack notes** — framework, installed Modus semver, MCP `version` used.
8. **Reference gaps** — reference type used (screenshot, link, or written spec) and intentional Modus/API limitations accepted (not pixel-cloned).
9. **Icons** — new `name` values added and how they were validated.
10. **Naming convention** — file/folder/export pattern chosen (matched repo precedent or default stated).
11. **Modus adoption** — estimated **adoption %** for interactive/data UI on the template page; inventory of any remaining hand-rolled primitives (tag/pattern + location) and why each remains. **Report only — do not auto-fix** to raise the percentage.
12. **Accessibility** — **issues found** (static review at all levels; include browser a11y tree findings when verify is `high`) and **possible fixes** for each (prefer Modus patterns: accessible names, `shape="square"` icon buttons, real links, one `h1`, keyboard reachability). Note whether fixes were already applied during implementation or are follow-ups. **Report only — do not auto-fix** solely to clear the list.
