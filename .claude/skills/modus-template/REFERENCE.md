<!-- Claude Code: save as `.claude/skills/modus-template/REFERENCE.md`. Cursor copy: `.cursor/skills/modus-template/REFERENCE.md`. -->


Stable rules for building copy-paste Modus template pages. **Read this file before coding** whenever the **modus-template** skill runs (`/modus-template` or equivalent).

Sibling copies: [.cursor/skills/modus-template/REFERENCE.md](../../../.cursor/skills/modus-template/REFERENCE.md). Keep in sync with [.cursor/skills/modus-template/SKILL.md](./SKILL.md). Run `npm run check:modus-template-sync` after edits.

## Authority ladder

When guidance conflicts, follow this order:

1. **Project Modus rules** — `.cursor/rules/modus-*.md`, `.claude/rules/modus-*.md`, `AGENTS.md`, or equivalent.
2. **`modus-wc-*` skills** for components you implement (events, slots, edge cases).
3. **Modus Docs MCP** (`get_modus_component_data`, `get_modus_implementation_data`) at the installed semver.
4. **This reference** — template-build contract deltas; do not duplicate long rule text when project rules or component skills already cover it.
5. **modus-template skill** — workflow, discovery, routing procedure, quality bar, completion summary.

## Framework event bindings

Modus emits the same custom events everywhere; binding syntax varies by stack:

| Stack | Button | Text-like `inputChange` | Boolean `inputChange` |
|---|---|---|---|
| React | `onButtonClick` | `onInputChange` → `e.detail?.target?.value` | `onInputChange` → `e.detail?.target?.checked` |
| Angular | `(buttonClick)` | `(inputChange)` → `$event.detail?.target?.value` | `(inputChange)` → `$event.detail?.target?.checked` |
| Vue | `@button-click` | `@input-change` → `$event.detail?.target?.value` | `@input-change` → `$event.detail?.target?.checked` |
| Vanilla | `addEventListener('buttonClick', …)` | `addEventListener('inputChange', …)` + `e.detail?.target?.value` | same + `e.detail?.target?.checked` |

Never treat `detail` as the value (`String(e.detail)` → `"[object InputEvent]"`). Never use removed 1.0 `detail.newValue`. For tabs, pagination, chips, navbar, dropdowns, and other events, use the matching skill + MCP — do not guess `detail` shapes.

## Code style conventions

Match the repo's lint/format rules when present. Otherwise:

- **Conditional rendering (outside Modus slotted hosts):** prefer `condition && <X />` over ternary-to-`null` when one branch is empty; reserve `? A : B` when both branches render meaningful UI.
- **Inside `modus-wc-*` / framework slotted hosts:** never mount/unmount slot roots (including `&&` that removes the node). Use **stable wrappers + `hidden` / `aria-hidden`**. See `modus-wc-react-slotted-hosts` (React) and project rules for slot stability.
- **CSS `!important`:** avoid by default. **Exceptions** when Modus unlayered styles beat utilities: page-scoped `[hidden]` for widget hide, navbar `slot="center"` hide patterns — prefer higher specificity first; see project `modus-layout` / `modus-events-and-overrides` if present.
- **Reuse before invent:** reuse existing form-event readers, media-query hooks, layout wrappers, and shared stylesheets from the project — do not duplicate into the template when the project already ships them.

## Design reference fidelity

When the user's design reference is not an image (design link, URL, or written spec), apply the same rules below to whatever visual/structural detail it provides — missing pixel-level detail is an accepted gap (see **Reference gaps** in the skill's Completion summary), not a blocker.

- Recreate **layout, hierarchy, and behavior** with documented Modus props, slots, `customClass`, and CSS variables (`--modus-wc-color-base-page`, `base-100`, `base-200`, `base-content`, `base-content-low-contrast`, semantic colors).
- **Never** use static hex for UI chrome.
- **Ignore** non-configurable shell fills (custom-colored navbar, tinted rail, marketing mesh on rail). Keep Modus default chrome and theme on `<html>`.
- Accept styling gaps Modus cannot do with public props / tokens / host `customClass`. Do **not** shadow-pierce or add global tag hacks to match pixels.
- Prefer **`customClass`** (or framework host-class API) over inline `style`. Move long utility dumps into **scoped CSS**.
- Copy: sentence case. One primary (`filled` + `primary`) action per section; quiet actions `color="tertiary"` with `outlined` or `borderless`. **`color="secondary"` on buttons is not "the second button."** Primary CTAs: leading `modus-wc-icon` with **validated** `name`. Paired horizontal actions: quiet left, primary right (LTR). Icon-only buttons: `shape="square"` (or `circle` if circular) + accessible name. Interactive controls default `size="sm"`; navbar-slot buttons `md` when a navbar is used.

## Keep it copy-pasteable

Do **not** split into presentational component files for structure alone. Do **not** add global store (Context, Redux, Pinia, NgRx, etc.) unless the design reference requires it.

- **State:** local UI state for interactions is expected. Avoid `useReducer` / heavy memo primitives for performance-only reasons. **Derived data** (filtered lists, table rows) may use the framework's memo helper when filtering is non-trivial.
- **Files:** one main UI file with **brief region comments** (header, hero, filters, list, modals, …). Colocated types + sample data + scoped CSS are **required** and travel with the template — no real backend calls.
- **Scoped CSS** under a page-root class (e.g. `.{name}-page`); do not leak unprefixed rules onto other pages.
- **Shared project assets:** reuse existing helpers when present. Do **not** add new shared modules solely for one template — keep helpers colocated in the template folder unless the project already uses a shared lib pattern. Document reuse vs local-only helpers in **Completion summary → Shared project assets**.

Set **page title** from the **Page title** input (`document.title`, Angular `Title`/`Meta`, Vue `useHead`, etc.). Update shared `index.html` only when the app has a single static title for all routes.

**React:** avoid `React.StrictMode` around Modus-heavy trees unless verified — dev double-mount + slots can cause `removeChild` / NotFoundError.

## Modus implementation contract

- **Catalog first:** badges, avatars, progress, chips, tables, tabs, tooltips, inputs, modals, switches, cards, alerts, dividers, selects, dropdowns — use Modus, not raw interactive primitives and not shadcn/Radix/MUI or parallel libraries.
- **Events:** stack bindings above + per-component skills/MCP — never guess `detail`.
- **Select:** `options` array prop (framework-equivalent), not slotted `<option>`.
- **Dropdown:** `slot="button"` is **icon/text markup only** — never nest a full button inside. Set host `buttonVariant`/`buttonColor`/`buttonSize`/`buttonShape`/accessible-name props. Close after select by clearing menu visibility.
- **Modal:** open/close via native `<dialog>` (`showModal()`/`close()` on the inner dialog), not a `visible`/`open` prop. Footer: Cancel outlined tertiary left, Save/Add filled primary + icon right.
- **Cards:** parent bordered, compact padding unless comfortable is justified. Nested child cards unbordered. Do **not** ternary-swap default-slot bodies inside a slotted host — stable wrappers + visibility toggle. Page-level widget hide: stable wrapper + page-scoped `[hidden]` rule (see CSS `!important` exceptions above).
- **Lists:** `<ul>` contains only `<li>`. Clickable rows must be real links or Modus controls — no dead `cursor: pointer` rows.
- **Tables:** `modus-wc-table` with zebra; nested Modus components in cells via a small cell-render helper when needed.
- **Icons:** `name` must exist in `@trimble-oss/modus-icons` for the chosen `variant`. Hyphens → underscores in `name`. Invalid names render blank. `decorative` when the control already has an accessible name.
- **Theme:** keep existing app theme bootstrap. Design reference's theme control → Modus theme switcher, not a second system.
- **Forms:** bordered field chrome on (package default), including dense toolbars.
- **Typography:** Modus typography for headings/body; one logical `h1` per page.
- **Canvas:** page background = `base-page` token; not `base-200` for the page field.
- **Gutters:** horizontal inset at every breakpoint; do not zero padding for "mobile."
- **Shadow DOM refs:** native elements are an acceptable documented exception when a Modus component cannot expose the needed ref — do not use `shadowRoot.querySelector` hacks.
- **Adoption scanners:** verify suggested replacements preserve semantics (e.g. navigation stays links, not buttons).

## Modus adoption audit (summary only)

Before finishing, estimate **Modus adoption %** for the **template page** (not the whole app shell unless the template owns shell chrome). **Report in the Completion summary — do not auto-fix** to hit a target percentage.

**Count toward Modus:** `modus-wc-*` hosts and framework wrappers (`ModusWcButton`, `ModusWcCard`, etc.) used for interactive UI or data presentation (buttons, inputs, selects, tables, badges, chips, avatars, progress, modals, tabs, tooltips, alerts, dividers, dropdowns).

**Exclude from denominator (do not penalize):** semantic structure (`main`, `nav`, `section`, `header`, `footer`, `article`), layout-only wrappers (`div`/`span` with flex/grid/spacing only), text nodes, `modus-wc-typography` and non-interactive typography hosts, colocated data/type files, scoped CSS.

**Count as non-Modus (lowers %):** raw interactive or data primitives where Modus ships an equivalent — e.g. `<button>`, `<input>`, `<select>`, `<textarea>`, hand-rolled `<table>`, badge/chip/progress built from styled `<span>`/`div`, shadcn/Radix/MUI controls, icon-only affordances on raw `<button>` without Modus.

**Formula:** `adoption % = Modus interactive/data primitives / (Modus + non-Modus interactive/data primitives) × 100`, rounded to whole percent. If denominator is zero, state **N/A** and why.

**Summary must include:** the percentage, a short **non-Modus inventory** (element + region/line hint), and **why** each remains (no catalog equivalent, semantic exception, inherited shell outside template scope, intentional deferral).

## Do not

- Replace, remove, or redirect existing routes or navigation — **add** the new template instead.
- Register only in the router but omit a central gallery/nav registry when the project uses one.
- Extract header/search/list/modals into separate files "for cleanliness."
- Add global store or memoization for performance only, or lift state one control uses, unless the design reference requires it.
- Add new shared project modules solely for one template.
- Install deprecated Modus (`@trimble-oss/modus-web-components`, Modus 1.0) — use `@trimble-oss/moduswebcomponents`.
- Mix in another component library.
- Guess icon names or event `detail` shapes.
- Mount/unmount Modus slotted slot roots for UI toggles.
