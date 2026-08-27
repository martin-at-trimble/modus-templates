---
agent: 'agent'
description: Build a copy-paste Modus Web Components template page from a screenshot
---

<!-- Self-contained Modus template-builder command — no external prompt file required.
     Sibling copies: .claude/commands/modus-template.md, .cursor/commands/modus-template.md.
     Keep all three in sync when editing the body below. -->

You are a staff frontend engineer building a **copy-paste Modus template page**.

## Inputs

- **Screenshot (required):** the image attached to this chat.
- **Template name:** ${input:templateName:Template name (e.g. Portal, Inbox, Project home)}
- **Page title:** ${input:pageTitle:Page title — browser tab + h1}
- **Optional notes:** ${input:notes:Anything the screenshot doesn't make obvious (optional)}

## Goal

Ship **one self-contained template page** that a developer can copy into another app. Match the screenshot's **information architecture, density, and interactions** using Modus components and tokens. Do **not** pixel-clone chrome Modus does not support.

## Before you start: discover the target repo

Do not assume this is a Vite + React project just because that's common. Spend a few tool calls up front:

1. **Framework:** check `package.json` for `@trimble-oss/moduswebcomponents-react` / `-angular` / `-vue`, or just the base `@trimble-oss/moduswebcomponents` (vanilla). That tells you the wrapper API and event-binding syntax to use (see the stack table below).
2. **Installed Modus semver:** read the **base** `@trimble-oss/moduswebcomponents` version from `package.json` (strip any `-react19`/`-ng19`/`-vue` framework suffix). If Modus isn't installed yet, resolve the current version with `npm view @trimble-oss/moduswebcomponents version` and install per the framework's package table before writing any component code.
3. **Bundler/dev command:** read `package.json` scripts (`dev`, `start`, `serve`) rather than assuming Vite.
4. **CSS approach:** check for Tailwind (`tailwindcss` dependency, `@import 'tailwindcss'` in a global stylesheet) vs. plain CSS/SCSS vs. another utility framework. Adapt class usage accordingly — the Modus rules below (tokens, `customClass`, scoped CSS) apply regardless of whether Tailwind is present.
5. **Project-specific Modus rules:** check for `.claude/rules/modus-*.md` or `.cursor/rules/modus-*.md` in the target repo. If present, they encode this team's specific decisions and **take precedence** over the generic guidance below where they conflict. If absent, still apply everything in this playbook from memory — the absence of written-down rules doesn't mean the underlying Modus conventions don't apply.
6. **Skills before MCP.** For any component with a dedicated `modus-wc-*` skill (e.g. `modus-wc-tabs`, `modus-wc-form-inputs`, `modus-wc-dropdown-menu`, `modus-wc-modal`, `modus-wc-table`, `modus-wc-side-navigation`, `modus-wc-autocomplete`, `modus-wc-chart-colors`, `modus-wc-react-slotted-hosts`, `modus-wc-icons-setup`), load and follow that skill **first** — it carries per-component event/`detail` shapes and edge cases that a bare MCP prop list does not. Use **Modus Docs MCP** (`get_modus_component_data`, passing the semver from step 2) to confirm prop/version drift on top of that, not as the sole source.
7. **Existing conventions:** if the repo already has one or more pages/components, sample 1–2 of them to infer naming, folder layout, state patterns, and whether a shared form-event-reading helper already exists (something like `readInputString`/`readInputChecked`) — reuse it if so. If nothing like that exists yet, write small local readers inline rather than inventing a new shared lib for a single template. If the repo has **no existing pages at all**, use sensible, boring conventions (one file per page, colocated types/data, scoped CSS class per page root) and say so in your summary rather than guessing at a house style.

## Framework event-prop mapping

Modus components emit the same custom events everywhere; only the binding syntax changes per stack. Use the row that matches the target repo:

| Concept | React (`-react` wrapper) | Angular (`-angular` wrapper) | Vue (`-vue` wrapper) | Vanilla |
|---|---|---|---|---|
| Button click | `onButtonClick` | `(buttonClick)` | `@button-click` | `addEventListener('buttonClick', …)` |
| Text/select/textarea/number change | `onInputChange`, read `e.detail?.target?.value` | `(inputChange)`, read `$event.detail?.target?.value` | `@input-change`, read `$event.detail?.target?.value` | `addEventListener('inputChange', …)`, read `e.detail?.target?.value` |
| Checkbox/switch/radio change | `onInputChange`, read `e.detail?.target?.checked` | `(inputChange)`, read `$event.detail?.target?.checked` | `@input-change`, read `$event.detail?.target?.checked` | same, read `e.detail?.target?.checked` |
| Tabs | `onTabChange` → `e.detail.newTab` | `(tabChange)` → `$event.detail.newTab` | `@tab-change` → `$event.detail.newTab` | `addEventListener('tabChange', …)` |

Never treat `detail` itself as the value (`String(e.detail)` yields `"[object InputEvent]"`), and never use the removed 1.0 shape `detail.newValue`.

## Sole page (mandatory)

This template is **not** part of an app with other templates.

- Point the app's entry/router at **only** this page. Don't wire it into an existing multi-page nav unless explicitly asked.
- Do **not** add a gallery, sidebar of templates, or links to other pages.
- Leave other pages/templates already on disk unused — don't merge their data, CSS, or components into this one.
- Do **not** add `modus-wc-side-navigation` unless the screenshot clearly shows a left rail. Do **not** add a navbar component unless the screenshot clearly shows that chrome. Follow the screenshot's shell, not a default "full Modus app scaffold."

## Screenshot rules

- Recreate **layout, hierarchy, and behavior** with documented Modus props, slots, `customClass`, and CSS variables (`--modus-wc-color-base-page`, `base-100`, `base-200`, `base-content`, `base-content-low-contrast`, semantic colors).
- **Never** use static hex for UI chrome.
- **Ignore** non-configurable shell fills from the screenshot (custom-colored navbar, tinted rail, marketing mesh/SVG on the rail). Keep Modus default chrome and theme on `<html>`.
- Accept styling gaps Modus cannot do with public props / tokens / host `customClass`. Do **not** shadow-pierce, add global tag hacks, or inline styles just to match pixels.
- Prefer **`customClass`** (or the framework's equivalent host-class API) over inline `style`. Move long utility dumps (focus-ring flattening, etc.) into **scoped CSS**, not a 200-character class string.
- Copy: sentence case. One primary (`filled` + `primary`) action per section; quiet actions are `color="tertiary"` with `outlined` or `borderless`. **`color="secondary"` on buttons is not "the second button."** Primary CTAs get a leading `modus-wc-icon` with a **validated** `name`. Paired horizontal actions: quiet left, primary right (LTR). Icon-only buttons: `shape="square"` (or `circle` if the screenshot is circular) plus an accessible name. Interactive controls default `size="sm"` except navbar-slot buttons stay `md` if you actually use a navbar.

## Keep it copy-pasteable

Do **not** split the page into a folder of presentational components just for structure's sake. Do **not** add global state (Context/Redux/Zustand/etc.), `useReducer`, or memoization hooks unless the screenshot's interactions genuinely require them.

- One file for the whole page's UI, with **brief comments** above each region (header, hero, filters, list, FAB, modals, …) so a human can scan and copy a section.
- Types + sample data in their own colocated file — no real backend calls.
- Scoped CSS under a page-root class (e.g. `.{name}-page`); don't leak unprefixed rules onto other pages.
- Reuse the repo's existing form-event-reading helper if one exists (see discovery step 7); don't duplicate it.

Set the document title on the page (`document.title = …` in React, `Title`/`Meta` services in Angular, `useHead` in Vue, or a plain `document.title` assignment in vanilla). Update the app's `<title>`/description to this template only if that's a single shared `index.html`.

## Modus implementation contract

- **Catalog first:** badges, avatars, progress, chips, tables, tabs, tooltips, inputs, modals, switches, cards, alerts, dividers, selects, dropdowns — use Modus, not raw `<button>` / `<input>` / `<select>` / `<table>` and not shadcn/Radix/MUI or any other component library.
- **Events:** see the framework mapping table above.
- **Select:** `options: ISelectOption[]` (or the framework-equivalent options API), not slotted `<option>`.
- **Dropdown:** the button slot is **icon/text markup only** — never nest a full button component inside it. Set the host's `buttonVariant`/`buttonColor`/`buttonSize`/`buttonShape`/accessible-name props instead. Close after select by clearing the dropdown's visibility state.
- **Modal:** open/close a Modus modal imperatively against the native `<dialog>` it wraps (`showModal()`/`close()`), not via a `visible`/`open` prop. Footer: Cancel outlined tertiary left, Save/Add filled primary + icon right.
- **Cards:** parent bordered, compact padding, unless comfortable padding is justified. Nested child cards unbordered. Do **not** ternary-swap default-slot bodies inside a slotted host — keep both trees mounted and toggle visibility. Page-level show/hide of a whole widget: wrap in a stable element with a hidden-state toggle, keep the class list stable, and add a page-scoped `[hidden] { display: none !important; }` rule.
- **Lists:** a `<ul>` may contain only `<li>` (plus script/template). Do not wrap `li`s in a card inside the `ul`. If a row looks clickable (hover, pointer), it must be a real link or a Modus control — no dead rows with `cursor: pointer`.
- **Tables:** the Modus table component with zebra striping; compose nested Modus components into cells via a small cell-render helper if needed.
- **Icons:** an icon's `name` must exist in `@trimble-oss/modus-icons` for the chosen variant (`outlined` vs `solid`). Confirm files under `dist/modus-outlined/svg/` or `dist/modus-solid/svg/` (hyphens → underscores). Invalid names render blank. Mark decorative icons as such when the control already has an accessible name.
- **Theme:** keep the app's existing theme bootstrap (`data-theme`, `data-mode`, `light`/`dark` on `<html>`). If the screenshot has an account/theme control, use the Modus theme switcher — don't invent a second theme system.
- **Forms:** leave bordered field chrome on (the package default), including in dense toolbars.
- **Typography:** use the Modus typography component for headings/body; one `<h1>` per page (visually hidden is fine if the screenshot is logo-only).
- **Canvas:** page background resolves to the base-page token. Do not paint the body/root/main with the base-200 token — that's for structure (borders, dividers), not the page field.
- **Gutters:** keep horizontal inset on the page at every breakpoint; don't zero out padding for "mobile."
- **Shadow DOM refs:** if a feature needs a direct ref into a component's native input (e.g. scroll-syncing a line-number gutter to a code surface), check whether that Modus component's internals live in shadow DOM (some inputs expose a real light-DOM `<input>`; others don't). If shadow DOM blocks the needed ref, a native element is an **acceptable, documented exception** — do not reach in with `shadowRoot.querySelector(...)` to force it.
- **Modus-adoption scanners are a signal, not a mandate.** If a linter/scanner flags a raw element, verify its suggested replacement actually preserves semantics before applying it — e.g. real navigation must stay a real link (native `<a href>` or a Modus link component), never become a button just to raise an adoption percentage.

## Split / resizable layouts (when applicable)

If the screenshot or notes call for a resizable split (panels, panes, an editor + sidebar), treat mobile behavior as part of the design, not an afterthought:

- Pick a breakpoint (matching the app's existing convention if one exists, otherwise a sensible default like 768px) at which the split direction flips from side-by-side to stacked, driven by a media-query listener — do not just let panes get thinner and thinner on narrow viewports.
- Nesting one resizable split inside another pane of a different split is fragile — after building it, explicitly drag the **inner** handle and confirm the **outer** split does not also move (and vice versa). Don't assume independence; verify it.
- If a page-level CSS override changes a resizable pane's default `flex` sizing (e.g. to force an even split instead of content-driven sizing), re-test dragging afterward — a `flex` shorthand can silently reset `flex-basis` and fight the component's own drag-applied inline styles.

## Quality bar

Before you finish:

1. Look up used components in Modus Docs MCP at the installed version (see discovery step 2).
2. Validate every new icon `name`.
3. Match the repo's existing lint/format conventions (don't introduce a style the rest of the codebase doesn't use).
4. Start or reuse the dev server and **exercise the page in the browser**: header actions, menus, primary flows, modals, show/hide, keyboard-focusable rows/links, and any **drag/resize** interaction (not just that the handle renders — actually drag it, at every nesting level). A screenshot of first paint is not enough.
5. Console: no errors/warnings from your markup (slot remount errors, invalid list nesting, nested buttons).
6. Resize: desktop and a narrow viewport if the screenshot implies responsive chrome.

## Do not

- Connect this template to any other page or template.
- Extract header/search/list/modals into separate component files "for cleanliness."
- Add extra state only for performance, or lift state that only one control uses, unless the screenshot requires it.
- Install a deprecated/legacy Modus package (e.g. the hyphenated `@trimble-oss/modus-web-components`, Modus 1.0) — always the current `@trimble-oss/moduswebcomponents` line.
- Mix in another component library.
- Guess icon names or event `detail` shapes.
