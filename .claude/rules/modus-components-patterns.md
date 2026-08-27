<!-- Claude Code: save as `.claude/rules/modus-components-patterns.md` or merge sections into CLAUDE.md. -->
# Modus Web Components — component configuration patterns

Use this alongside [modus-essentials.md](./modus-essentials.md) (UX defaults, component selection), [modus-setup.md](./modus-setup.md) (theme, color variables, scaffolding), [modus-layout.md](./modus-layout.md) (multi-card page layout, card slots), [modus-events-and-overrides.md](./modus-events-and-overrides.md) (event handling, CSS overrides), and [modus-accessibility.md](./modus-accessibility.md) (semantics, focus, contrast). **This file** is the reference for **per-component scaffolding**: defaults, slot conventions, and the minimum-viable JSX/HTML pattern to copy into a new view.

For deep per-component contracts (events, slots, interactions, edge cases), follow the matching skill (e.g. **modus-wc-modal**, **modus-wc-tabs**, **modus-wc-form-inputs**, **modus-wc-side-navigation**, **modus-wc-table**) — confirm props with **Modus Docs MCP** for your installed **`version`** before adding new ones.

## Cards

**Blueprint [`src/styles/globals.css`](../../src/styles/globals.css):** **`:root`** defines **`--padding-card: 1rem`** (card rhythm), app **text scale** **`--text-xs`**…**`--text-3xl`**, and theme-aware **`--app-elevation-sm`** / **`--app-elevation-md`**. **`@theme inline`** maps Modus CSS variables to **Tailwind v4** theme tokens (semantic **`--color-*`**, **`--color-chart-1`…5**, **`--shadow-sm/md`**, **`--radius-*`**) so utilities stay on the same tokens as Modus—reuse that layer instead of introducing a parallel hex map.

For slot placement (title / default body / **`slot="footer"`** actions), title-row **`xs`** controls, body **`gap-1`**, and parent **`gap-3`** vs nested **`gap-2`**, use [modus-layout.md](./modus-layout.md). **Title row:** use **`justify-content: space-between`** only when the title has **trailing** actions **in addition to** the leading **icon + typography** cluster; for **icon + title only**, use **`justify-start`** (see **Title row** in [modus-layout.md](./modus-layout.md)). When that row includes **`ModusWcBadge`** or **`ModusWcButton`** and the card lives in a **narrow multi-column grid** (KPI tiles, etc.), use the **lead / trail** flex pattern (**`flex-1 min-w-0`** on the leading cluster, **`shrink-0`** wrapper on each trailing control) so labels do not wrap—see **Title row** → **Trailing badges / buttons must not `flex-shrink`** in [modus-layout.md](./modus-layout.md).

**Default Configuration:**
- **Parent cards** (page-level sections, sibling cards in **`main`**, homogeneous KPI/metric grids): use **`bordered={true}`** — set it explicitly on new parent cards.
- **Child cards** nested **inside** a parent **`modus-wc-card`** body (metric tiles, sub-panels, nested grids): use **`bordered={false}`** — the parent border defines the section; nested tiles stay unbordered.
- Use `padding="compact"` by default; switch to `comfortable` only when content needs more air ([modus-layout.md](./modus-layout.md) → **Card defaults**)
- Child cards within parent cards use `base-100` background
- **Recharts 3 chart bodies:** use [.claude/skills/modus-wc-chart-colors/SKILL.md](../skills/modus-wc-chart-colors/SKILL.md) **§4b** (`ResponsiveContainer` **`initialDimension`**, pixel **`height`** on wrapper, **`minWidth`/`minHeight`**; avoid **`hidden`** on ancestors for inactive full-page tabs)—prevents **`width(-1) height(-1)`** console noise in Modus dashboards

```tsx
<ModusWcCard bordered={true} padding="compact">
  <ModusWcTypography slot="title" hierarchy="h4" size="md" weight="semibold" label="Card Title" />
  {/* Content */}
</ModusWcCard>
```

**Card with icon + title only (no trailing actions):**
```tsx
<ModusWcCard bordered={true} padding="compact">
  <div slot="title" className="flex w-full min-w-0 items-center justify-start gap-2">
    <ModusWcIcon name="dashboard" decorative />
    <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Title" />
  </div>
  {/* Content */}
</ModusWcCard>
```

**Card with title + trailing actions** (`justify-between` on the outer row; **lead / trail** so badges and buttons do not shrink-wrap in narrow grids):
```tsx
<ModusWcCard bordered={true} padding="compact">
  <div slot="title" className="flex w-full min-w-0 items-center justify-between gap-3">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ModusWcIcon name="dashboard" decorative />
      <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Title" />
    </div>
    <div className="shrink-0">
      <ModusWcButton variant="borderless" color="tertiary" size="xs">
        Action
      </ModusWcButton>
    </div>
  </div>
  {/* Content */}
</ModusWcCard>
```

**Nested child cards inside a parent card:**
```tsx
<ModusWcCard bordered={true} padding="compact">
  <ModusWcTypography slot="title" hierarchy="h4" size="md" weight="semibold" label="Key metrics" />
  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
    <ModusWcCard bordered={false} padding="compact">…</ModusWcCard>
    <ModusWcCard bordered={false} padding="compact">…</ModusWcCard>
    <ModusWcCard bordered={false} padding="compact">…</ModusWcCard>
  </div>
</ModusWcCard>
```

**Child Card Background Override:**
```css
/* Child cards within parent cards use base-100 background */
modus-wc-card modus-wc-card article {
  background-color: var(--modus-wc-color-base-100) !important;
}
```

## Buttons

**Button Hierarchy:**
- **Primary** (`variant="filled"` + `color="primary"`): Main action, **one per section**; include a **leading `modus-wc-icon`** whose **`name`** matches the action (see [modus-essentials.md](./modus-essentials.md) → **UX defaults** → **Primary (`filled` + `primary`) actions and icons**). Validate **`name`** against **`@trimble-oss/modus-icons`**.
- **Secondary** (`variant="outlined"`): Alternative actions
- **Tertiary** (`variant="borderless"` or `color="tertiary"`): Default for most actions

**Two-button horizontal pairs:** When a **primary** and a **de-emphasized** button sit **side by side** (heroes, split footers, toolbars), order **`outlined`/`borderless` + `tertiary`** (or equivalent quiet control) **first**, then **`filled` + `primary`** — **secondary left, primary right** (LTR). See [modus-essentials.md](./modus-essentials.md) → **UX defaults** → **Paired actions in one horizontal row**.

**Default `size="sm"` for compact UI** (toolbars, card title rows, dense rows, table actions). Move to `md` for **navbar slots** and `lg` only when density / touch / spec requires it (see [modus-essentials.md](./modus-essentials.md) → **UX defaults**). When the button contains a **`modus-wc-icon`**, set the icon **one size smaller** than the button (`sm` button → `xs` icon, `md` button → `sm` icon).

**Icon-only (no label text):** If the button shows **only** an icon (no visible label string), set **`shape="square"`** and provide **`aria-label`** on the button (or an accessible icon) per [modus-essentials.md](./modus-essentials.md) → **UX defaults** → **Icon-only buttons**.

```tsx
// Hero / toolbar pair — de-emphasized left, primary right (use flex + gap)
<div className="flex flex-wrap items-center gap-2">
  <ModusWcButton variant="outlined" color="tertiary" size="sm">
    Schedule report
  </ModusWcButton>
  <ModusWcButton variant="filled" color="primary" size="sm">
    <ModusWcIcon name="export" size="xs" decorative />
    Export
  </ModusWcButton>
</div>

// Primary action alone (icon matches verb — export.svg → name "export")
<ModusWcButton variant="filled" color="primary" size="sm">
  <ModusWcIcon name="export" size="xs" decorative />
  Export
</ModusWcButton>

// Secondary action (single quiet control)
<ModusWcButton variant="outlined" color="tertiary" size="sm">Cancel</ModusWcButton>

// Tertiary/default action
<ModusWcButton variant="borderless" color="tertiary" size="sm">View more</ModusWcButton>

// Icon-only button — no label text: shape="square" + aria-label (required)
<ModusWcButton variant="borderless" color="tertiary" shape="square" size="sm" aria-label="Settings">
  <ModusWcIcon name="settings" size="xs" decorative />
</ModusWcButton>

// Navbar slot button — bump to md
<ModusWcButton slot="end" variant="borderless" color="tertiary" size="md">Sign in</ModusWcButton>
```

## Icons

**Always use `decorative` prop for visual-only icons:**
```tsx
// Decorative icon (no aria-label needed)
<ModusWcIcon name="home" decorative />

// Accessible icon (needs aria-label)
<ModusWcIcon name="close" decorative={false} aria-label="Close dialog" />
```

**Focus — decorative icons must not hold focus:** **`decorative`** icons use **`aria-hidden`** on the inner glyph. Do not **`focus()`** slotted icons or rely on focus resting on **`i.modus-wc-icon`**; send focus to the parent control (**`modus-wc-menu-item`**, **`modus-wc-button`**, etc.). For **collapsed overlay **`side-rail-wrapper`**, use **`inert`** and relocate focus before hiding — **do not** put **`aria-hidden="true"`** on the wrapper while the rail subtree still holds focus (see [modus-accessibility.md](./modus-accessibility.md) → **Collapsed overlay rail shell** and **Decorative icons and focus (`aria-hidden`)**).

**Icon sizing:**
- Icons use `fit-content` by default
- Remove padding when inside buttons

```css
/* Base icon styles */
i.modus-wc-icon {
  width: fit-content !important;
  height: fit-content !important;
}

/* Remove icon padding when inside buttons */
button i.modus-wc-icon,
modus-wc-button i.modus-wc-icon {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

**Validate `name` for the chosen `variant`** (outlined vs solid) against `@trimble-oss/modus-icons` — see [modus-essentials.md](./modus-essentials.md) **Icons** and the [**modus-wc-icons-setup** skill](../skills/modus-wc-icons-setup/SKILL.md). Loading `modus-icons.css` does not substitute for invalid `name` values (symptom: blank glyph beside label).

## Form Elements

**Bordered field chrome:** Always use **`bordered={true}`** or **omit** **`bordered`** (package default **`true`**) on form controls that support it — **`modus-wc-text-input`**, **`modus-wc-textarea`**, **`modus-wc-number-input`**, **`modus-wc-select`**, **`modus-wc-date`**, **`modus-wc-time-input`**, etc. **Do not** use **`bordered={false}`** to compress dashboard toolbars, filter rows, or card headers; see [modus-form-bordered-default.mdc](./modus-form-bordered-default.mdc).

**Wire events with the form-inputs skill, not inline guesses.** Every Modus 2.x input emits **`inputChange`** with **`detail: InputEvent`**. Read text-like values from **`e.detail?.target?.value`** and boolean values (checkbox / switch / radio) from **`e.detail?.target?.checked`** — `detail` is **never** the value itself, and **`detail.newValue`** was a 1.0 shape that was removed. Use the [**modus-wc-form-inputs** skill](../skills/modus-wc-form-inputs/SKILL.md) helpers (`readInputString`, `readInputChecked`). Per-control event examples live in [modus-events-and-overrides.md](./modus-events-and-overrides.md).

**Select uses an `options` prop, not slotted children.** See the **Select** example in [modus-events-and-overrides.md](./modus-events-and-overrides.md); never pass `<option>` children.

**Background color (optional):**
Modus form controls already follow theme tokens. Only override when the design **explicitly** wants the input chrome on `--modus-wc-color-base-page` (e.g. inside a `base-100` card). Scope to a wrapper class so the override does not bleed across the whole shell, and target the **inner control** (text inputs use a real `<input>` in light DOM via the React wrapper; the browser's native `<select>` / `<textarea>` exist in shadow DOM and cannot be reached from light-DOM CSS).

```css
/* Scope to a section that opted in, not the whole document */
.app-form modus-wc-text-input input {
  background-color: var(--modus-wc-color-base-page);
}
.app-form modus-wc-textarea::part(textarea),
.app-form modus-wc-select::part(select) {
  /* Use ::part only if the public prop / token does not cover the case;
     confirm part names with Modus Docs MCP for your version. */
  background-color: var(--modus-wc-color-base-page);
}
```

**Form Layout Pattern:**
```tsx
<div className="grid grid-cols-4 items-center gap-4">
  <ModusWcInputLabel forId="name" labelText="Name" customClass="text-right" />
  <ModusWcTextInput id="name" value={value} customClass="col-span-3" />
</div>
```

## Navigation

**Side Navigation:**
```tsx
<ModusWcSideNavigation
  expanded={sidebarOpen}
  maxWidth="256px"
  mode="push"
  targetContent="#main-content"
  collapseOnClickOutside={false}
>
  <ModusWcMenu size="lg">
    <ModusWcMenuItem label="Home" value="home" selected={isActive}>
      <ModusWcIcon slot="start-icon" name="home" decorative />
    </ModusWcMenuItem>
  </ModusWcMenu>
</ModusWcSideNavigation>
```

Full responsive shell (push ≥ 1024 / overlay below, hamburger wiring, first-paint races, `targetContent` ↔ `<main id="main-content">` sync): see the [**modus-wc-side-navigation** skill](../skills/modus-wc-side-navigation/SKILL.md) and [modus-wc-integration.md](./modus-wc-integration.md) → **App shell**. **Do not** layer decorative **`background-image`** / blueprint pattern SVGs on the rail—the component’s default **`base-page`** fill is the scaffolding default (skill **Reference implementation**).

**Menu item styling (side nav):**

**Do not** add **horizontal** `padding` (or `padding-inline`) on the **`modus-wc-menu-item` host** inside **`modus-wc-side-navigation`**. Modus already applies horizontal inset on the inner **`.modus-wc-menu-item button`** (e.g. `1.25rem` plus vertical spacing). Extra host padding **stacks** and looks like a doubled left/right gutter.

- Prefer **`padding-inline: 0`** on the host and only **`margin-block`** if you need vertical rhythm between rows.
- To **tighten** the rail visually, override **button** padding (selector below), not the custom element host.

```css
/* Host: no horizontal padding — Modus owns left/right inset on the button */
modus-wc-side-navigation modus-wc-menu-item {
  padding-inline: 0;
  margin-block: var(--modus-wc-spacing-2xs);
}

/* Hover states with rounded corners */
modus-wc-side-navigation modus-wc-menu-item .modus-wc-menu-item button:hover {
  border-radius: var(--radius-button, 8px) !important;
  background-color: var(--modus-wc-color-base-200) !important;
}

/* Active menu item */
modus-wc-side-navigation modus-wc-menu-item .modus-wc-menu-item button.modus-wc-menu-item-selected {
  background-color: var(--modus-wc-color-blue-pale) !important;
  border-radius: var(--radius-button, 8px) !important;
  color: var(--modus-wc-color-primary) !important;
}
```

**Navbar:** Prefer **full standard `visibility`** on large viewports (matches **Modus Docs MCP** / Storybook default for `modus-wc-navbar`); wire each exposed control's events. **`ModusWcTypography`** and **`ModusWcButton`** in **`start` / `center` / `end`** slots: default **`size="md"`**. Below **`md`**, you may hide **`apps`**, **`search`**, **`notifications`**, **`help`**, **`ai`**, **`searchInput`** and keep **`mainMenu`** + **`user`** (see [modus-essentials.md](./modus-essentials.md)). **`slot="center"`:** hide center-slot children **by default on narrow widths**—same breakpoint band as **`condensed`** / overlay **`mode`**—so **`start`** + **`end`** do not squeeze breadcrumbs or inline titles between tray icons ([modus-layout.md](./modus-layout.md) → **App shell navbar — `condensed` on narrow viewports**).

```tsx
<ModusWcNavbar
  mainMenuOpen={menuOpen}
  condensed={isNarrow}
  visibility={{
    logo: true,
    mainMenu: true,
    apps: true,
    search: true,
    searchInput: false,
    notifications: true,
    help: true,
    user: true,
    ai: false,
  }}
  customClass="sticky top-0 z-[120]"
>
  {/* start / end unchanged */}
  <div slot="center" className="hidden min-w-0 items-center gap-2 md:flex">
    {/* Breadcrumbs / inline title — narrow: hidden; md+: flex */}
  </div>
</ModusWcNavbar>
```

## Modal Dialog

**`modus-wc-modal` is a thin wrapper around the native HTML `<dialog>` element.** It does **not** expose `visible` / `open` props or an `onClose` event — open and close it imperatively with `dialog.showModal()` / `dialog.close()` against the inner dialog identified by **`modal-id`**. Slots are **`header`**, **`content`**, **`footer`** (not `body`). `header-text` and built-in primary/secondary buttons from 1.0 are gone — compose them in the slots. Full pattern (state sync, focus trap, React/Next.js client boundaries, z-index next to navbar/side nav): [**modus-wc-modal** skill](../skills/modus-wc-modal/SKILL.md).

```tsx
const modalId = "confirm-action-modal";

const open = () =>
  (document.getElementById(modalId) as HTMLDialogElement | null)?.showModal();
const close = () =>
  (document.getElementById(modalId) as HTMLDialogElement | null)?.close();

<>
  <ModusWcButton onButtonClick={open}>Open dialog</ModusWcButton>

  <ModusWcModal
    modalId={modalId}
    backdrop="default"
    position="center"
    showClose
    aria-label="Confirm action"
  >
    <span slot="header">Confirm action</span>
    <span slot="content">Are you sure you want to continue?</span>
    <div slot="footer" className="flex justify-end gap-2">
      <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={close}>
        Cancel
      </ModusWcButton>
      <ModusWcButton variant="filled" color="primary" size="sm" onButtonClick={() => { handleConfirm(); close(); }}>
        Confirm
      </ModusWcButton>
    </div>
  </ModusWcModal>
</>
```

To react to dismiss, listen for the native `<dialog>` **`close`** event on the inner `dialog` (e.g. via a ref + `addEventListener('close', ...)`); see the [**modus-wc-modal** skill](../skills/modus-wc-modal/SKILL.md).
