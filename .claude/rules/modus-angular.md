<!-- Claude Code: save as `.claude/rules/modus-angular.md` or merge sections into CLAUDE.md. -->
# Modus Web Components — Angular

Use this alongside [.cursor/rules/modus-essentials.md](./modus-essentials.md) (packages, theme, Modus-only surface) and [.cursor/rules/modus-wc-integration.md](./modus-wc-integration.md) (bootstrap, `setAssetPath`, MCP). For **Vue**, see [modus-vue.md](./modus-vue.md).

Do **not** assume **React** wrapper props (**`onInputChange`** on **`ModusWc*`**), **`ModusWcThemeProvider`**, or **Next.js** setup—use Angular + Modus package docs for your **semver**.

## App shell — layout and scroll (non-negotiable)

When you **scaffold**, **refactor**, or **touch** the app shell ( **`html`/`body`**, **`app-root`**, **`modus-wc-theme-provider`**, viewport wrapper, navbar + side nav + **`<main>`** scroll), you **must** complete this section. [modus-wc-integration.md](./modus-wc-integration.md) often illustrates **React + `#root`**; **translate** every flex/scroll rule to **`app-root` → `modus-wc-theme-provider` → … → `main`**. For **side nav + `targetContent` + navbar `mainMenuOpen`**, follow [**modus-wc-side-navigation**](../skills/modus-wc-side-navigation/SKILL.md) and the essentials **Side navigation shell** checklist.

### `modus-wc-navbar` with `modus-wc-side-navigation` (Angular pitfalls)

The navbar **always** renders a **Trimble (or `logo-name`)** control in the toolbar **start** when **`visibility.logo`** is not **`false`**. Do **not** also project **`modus-wc-logo`** into **`slot="start"`** unless you have set **`visibility.logo: false`** and intentionally own the whole start cluster — otherwise you ship **two logos** (“Trimble Trimble”).

When the hamburger should **toggle the left rail** but you are **not** using **`slot="main-menu"`** for real content, do **not** mirror **`[mainMenuOpen]="sideNavExpanded"`** (or similar). An “open” main menu turns on the navbar’s **empty** **`.main-menu`** flyout (full-height **`display: block`** in Modus CSS), which stacks beside **`modus-wc-side-navigation`** and reads as a **second chrome bar** on narrow breakpoints. Prefer:

- **`[mainMenuOpen]="false"`** so that flyout never opens, and
- **`(mainMenuOpenChange)`** → toggle your **`expanded`** / drawer state (or set it from **`detail`** on overlay-only flows **only** if you populate **`slot="main-menu"`** or otherwise avoid the empty panel).

**`collapseOnClickOutside` vs navbar hamburger:** With **`collapseOnClickOutside="true"`**, **`modus-wc-side-navigation`** registers **`document.addEventListener('click', …, true)`** and treats any click whose **`composedPath()`** does not include its inner **`<nav>`** ref as outside. Clicks on **`modus-wc-navbar`** (hamburger, logo, utilities) are **outside** that ref, so **capture runs before** the button handler: the side nav **sets `expanded = false`**, then **`(mainMenuOpenChange)`** may **toggle** your Angular **`expanded`** back **open** — one tap looks like collapse + glitch or broken layout. If the navbar drives the same overlay, set **`[collapseOnClickOutside]="false"`** and dismiss from **`#main-content` `(click)`** (and/or a full-viewport backdrop), or add **`composedPath`-safe exclusions** if you customize.

If product needs the **menu control on desktop** as well as overlay, keep **`visibility.mainMenu: true`** at desktop widths — do **not** gate **`mainMenu`** with **`!isDesktop`** unless the rail is opened **only** from the rail itself and the spec says to hide the navbar control.

### Where styles live (prevents collapse + drift)

With **default emulated encapsulation**, **`app.component.scss`** rules on **`:host`** target **`app-root`** and typically **override** global **`styles.scss`** rules that also select **`app-root`**. **Never split** the viewport flex contract across two files in a conflicting way.

| Concern | `styles.scss` (global) | `app.component.scss` (`:host` / same view) |
|---------|-------------------------|---------------------------------------------|
| **`html`, `body`** — height cap, **`overflow: hidden`** when **`main`** scrolls | yes | no |
| **`#root-viewport`**, **`.app-shell`**, **`.app-body-row`**, **`#main-content`**, rail wrappers, navbar slot **`[hidden]`** overrides | yes | only if you accept duplication |
| **`app-root`** — **`display: flex`**, **`flex-direction: column`**, **`height`/`max-height`**, **`min-height: 0`**, **`overflow: hidden`** | **avoid** (loses to **`:host`**) | **yes** — **authoritative** |
| **Direct child** **`modus-wc-theme-provider`** — flex column, **`flex: 1 1 0`**, **`min-height: 0`** | **avoid duplicating** | **yes** — **`:host > modus-wc-theme-provider`** |
| **Routed** KPI grids, page stacks, card bands | no | **feature** **`*.component.scss`** |

**Anti-patterns (do not ship):**

- **`:host { display: block; }`** (or any **`display`** on **`:host`** that is not the shell flex column) while the shell expects **`app-root`** to be a **flex** container — **collapses** height/`flex` for children.
- **`overflow: auto`** on **`main`** only, without **`html`/`body`** lock and without **`min-height: 0`** + **`flex: 1 1 0`** on **every** link from **`app-root`** down to **`main`** — **no `main` scrollbar** or **document** scroll steals the wheel.
- **`flex: 1`** alone on critical flex children where **`min-height: auto`** blocks shrinking — prefer **`flex: 1 1 0`** **and** **`min-height: 0`** on that chain (see mandatory list below).

**Reference shape** (adapt class names; keep **`:host`** and **`:host > modus-wc-theme-provider`** on the root component that owns the shell template):

```scss
// app.component.scss — shell host (authoritative for app-root)
:host {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100dvh;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

:host > modus-wc-theme-provider {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
}
```

```scss
// styles.scss — document + inner shell (example; extend with your rail/navbar rules)
html,
body {
  height: 100%;
  max-height: 100dvh;
  margin: 0;
  overflow: hidden;
}

#main-content {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
```

### Viewport and flex chain (mandatory when `<main>` scrolls)

DOM chain: **`html` → `body` → `app-root` → `modus-wc-theme-provider` → viewport wrapper (e.g. `#root-viewport`) → row with chrome + `<main>`**. There is **no** React **`#root`** — map [modus-wc-integration.md](./modus-wc-integration.md) **scroll ownership** to this tree.

1. **Lock document scroll:** **`html` and `body`** — **`height: 100%`** (or **`100dvh`**), **`max-height: 100dvh`**, **`overflow: hidden`** when **`main`** owns vertical scroll.
2. **Cap `app-root`:** **`display: flex`**, **`flex-direction: column`**, **`height` / `max-height: 100dvh`**, **`min-height: 0`**, **`overflow: hidden`** — author on **`app.component.scss` `:host`** (see table above). A global **`app-root { … }`** in **`styles.scss`** alone is **not** enough if **`:host`** overrides **`display`**.
3. **`modus-wc-theme-provider`:** **`display: flex; flex-direction: column; flex: 1 1 0; min-height: 0; min-width: 0`** — use **`:host > modus-wc-theme-provider`** on the root shell component.
4. **Every flex link down to `main`:** **`min-height: 0`** on flex children in the chain; **`flex: 1 1 0`** on segments that must absorb height (**not** only **`flex: 1`** where **`min-height: auto`** blocks shrink).
5. **Scroll surface:** **`#main-content`** / **`main`** — **`flex: 1 1 0`**, **`min-width: 0`**, **`overflow: auto`**; optional **`overscroll-behavior: contain`**.
6. **Browser verify:** **`main.scrollHeight > main.clientHeight`**, wheel updates **`main.scrollTop`**; the document must not act as the primary vertical scroller for app content.
7. **Encapsulation:** do not negate the shell with **`:host { display: block; }`** or other **`display`** values that are not the flex column contract (see **Anti-patterns**).

These rules **do not** run at compile time — **`ng build`** passes even when scroll or flex is wrong. Re-check in the browser after any shell or **`:host`** style change.

### Page layout and spacing (dense dashboards, no Tailwind)

[modus-layout.md](./modus-layout.md) often assumes **Tailwind** or blueprint **`globals.css`**. Without them, match the same rhythm in plain CSS.

1. **Dense `gap` / grids** — prefer **feature** **`*.component.scss`** over a lone fragile global in **`styles.scss`**; **`modus-wc-styles.css`** preflight/globals can make **`gap`** look missing in the browser.
2. **One vertical stack wrapper** per page with explicit **`gap`**; avoid relying **only** on **`.a + .b { margin-top }`** (fragile when Angular inserts comments or wrappers between siblings).
3. **`var(--modus-wc-spacing-*)`** with **readable fallbacks** (e.g. `var(--modus-wc-spacing-md, 0.75rem)`).
4. **`modus-wc-card`** on analytics-style pages: start **`padding="comfortable"`** unless the row is intentionally toolbar-dense ([modus-layout.md](./modus-layout.md)).
5. **Shell** (**`#main-content`**, gutters, rail) in **`styles.scss`** when global; **route-specific** bands in **routed** **`*.component.scss`**.

### Shell + route layout — PR checklist

**Bootstrap (if Modus looks unstyled — see [Bootstrap — greenfield contract](#bootstrap--greenfield-contract-non-negotiable))**

- [ ] **`await defineCustomElements`** in **`APP_INITIALIZER`**; **`importProvidersFrom(ModusAngularComponentsModule)`** in **`app.config.ts`**.
- [ ] **`<modus-wc-theme-provider>`** wraps shell; boolean props use **`[…]="`**, not **`prop="false"`** strings.

**Scroll / flex**

- [ ] **`html`/`body`** locked when **`main`** scrolls.
- [ ] **`:host`** = viewport flex column; **no** conflicting **`display: block`** (or other non-flex **`display`**) on the root shell.
- [ ] **`:host > modus-wc-theme-provider`** = flex column + **`flex: 1 1 0`** + **`min-height: 0`**.
- [ ] **`#root-viewport` → … → `main`**: **`min-height: 0`**, **`flex: 1 1 0`** where appropriate; **`main`** has **`overflow: auto`**.
- [ ] **`ng serve`**: tall route scrolls inside **`main`**, not **`window`**.

**Navbar + side nav**

- [ ] **One logo** — not **`visibility.logo`** (default on) **and** **`slot="start"`** **`modus-wc-logo`** unless **`logo: false`** and a deliberate custom start row.
- [ ] **No empty `main-menu` flyout** while **`modus-wc-side-navigation`** owns the drawer — avoid **`mainMenuOpen`** mirroring **`expanded`** with an unused **`main-menu`** slot; use **`[mainMenuOpen]="false"`** + **`(mainMenuOpenChange)`** to toggle the rail (or fill **`slot="main-menu"`**).
- [ ] **`collapseOnClickOutside`** — if **`false`**, document capture no longer races the navbar hamburger; close overlay from **`#main-content`** **`(click)`** / backdrop instead. If **`true`**, navbar clicks are still “outside” the side-nav **`<nav>`** ref and can fight **`(mainMenuOpenChange)`** toggles.
- [ ] **`visibility.mainMenu`** matches product: if the hamburger must work **above** the push/overlay breakpoint, do **not** hide **`mainMenu`** only on “desktop”.

**Spacing**

- [ ] KPI / multi-card **`gap`** in **component SCSS** (or Tailwind), not only an unscoped global one-liner.
- [ ] Stacked sections use a **column stack + `gap`**, not only adjacent-sibling margins.
- [ ] Chart/table cards: **`padding="comfortable"`** or a documented exception.
- [ ] **Light + dark**: sections and cards visibly separated (not edge-to-edge).

**Canvas charts (Chart.js)**

- [ ] FOUC **`modus-theme-config`** includes **`mode`**; initial + toggle **`dispatchModusChartThemeSync()`** — see **Theme + canvas charts (Chart.js)**.
- [ ] Hard refresh: chart palette matches theme **before** any theme-switcher interaction.

## Packages

- **`@trimble-oss/moduswebcomponents`** + **`@trimble-oss/moduswebcomponents-angular`** at **paired** semver (see essentials **Packages** table: `MVC=…` then `…-ng{17|18|19}` matching your Angular major).
- Run **`npm view`** so base and **`-angular`** stay on the same **MVC** line.

## Bootstrap — greenfield contract (non-negotiable)

`ng build` and TypeScript can pass while Modus hosts render as **unstyled light DOM** (plain button text, missing navbar chrome, cards without surfaces). The failures below are **runtime** Stencil/Angular integration gaps — treat this section as mandatory on every new Angular + Modus app and when Modus “looks broken” in the browser.

### Symptom → likely cause

| What you see in the browser | Likely mistake |
|----------------------------|----------------|
| Button/link **label text only** (no Modus button chrome) | **`defineCustomElements()`** not **finished** before first paint |
| **No navbar / side nav** in the a11y tree; only page regions | Same + missing **`modus-wc-theme-provider`** wrapper |
| Cards/charts on a **flat white page** with no **`base-page`** shell | Theme provider missing; boolean props as **string attributes** (see below) |
| Logo/icons 404 in prod or Vite subpath | **`setAssetPath`** not set to **`origin + base + assets/`** |
| Blank page / `NG0908` with Vite | **`zone.js`** not imported in **`main.ts`** before **`bootstrapApplication`** |

### 1. Register Stencil **before** first paint — **await** `defineCustomElements`

`@trimble-oss/moduswebcomponents-angular`’s **`ModusAngularComponentsModule`** calls **`defineCustomElements(window)`** from **`@trimble-oss/moduswebcomponents/loader`** inside **`provideAppInitializer`**. That function is **`async`**; if the initializer does **not** return the resulting **`Promise`**, Angular can bootstrap and render templates **before** custom elements upgrade — slots show as raw text, shadow styles never apply.

**Do:** In **`app.config.ts`**, register Modus at the **application** level and **await** registration in **one** initializer (even if the module also registers — idempotent):

```ts
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { ModusAngularComponentsModule } from '@trimble-oss/moduswebcomponents-angular';
import { defineCustomElements } from '@trimble-oss/moduswebcomponents/loader';
import { setAssetPath } from '@trimble-oss/moduswebcomponents/components';

function initModus(): () => Promise<void> {
  return async () => {
    if (typeof window === 'undefined') return;
    const base = import.meta.env?.BASE_URL ?? '/'; // Vite; use deployUrl/base href in CLI-only apps
    setAssetPath(`${window.location.origin}${base}assets/`);
    await defineCustomElements(window);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ModusAngularComponentsModule),
    { provide: APP_INITIALIZER, useFactory: initModus, multi: true },
    // …router, zone, etc.
  ],
};
```

**Do not:** Rely only on importing **`ModusAngularComponentsModule`** inside a standalone component’s **`imports: []`** and assume registration ran in time. **Always** use **`importProvidersFrom(ModusAngularComponentsModule)`** in **`app.config.ts`** (or root **`AppModule`**) **and** the awaited initializer above.

**Do not:** Call **`defineCustomElements()`** without **`await`** (or without returning the promise from **`APP_INITIALIZER`**).

### 2. Wrap the shell in **`modus-wc-theme-provider`**

React apps use **`ModusWcThemeProvider`**; in Angular the equivalent is the **host** **`modus-wc-theme-provider`** wrapping **all** Modus chrome and routed content (navbar, side nav, **`<main>`**). Without it, theme store sync and the documented flex chain are incomplete.

**Root shell template (minimal shape):**

```html
<modus-wc-theme-provider>
  <div id="root-viewport" class="app-shell">
  <modus-wc-navbar customClass="app-shell-navbar" …>…</modus-wc-navbar>
  <!-- side nav + #main-content -->
  </div>
</modus-wc-theme-provider>
```

Pair with **`:host > modus-wc-theme-provider`** flex rules in **`app.component.scss`** (see **App shell — layout and scroll** above). Do **not** skip the provider because “styles are imported globally.”

### 3. Boolean and object inputs — **property binding**, not string attributes

With **`modus-wc-*`** / **`ModusWc*`** hosts, HTML attributes are strings. **`bordered="false"`**, **`zebra="true"`**, and bare **`decorative`** are a common greenfield bug: the string **`"false"`** is still **truthy** for boolean props, so cards stay bordered, zebra/table flags mis-set, etc.

| Wrong (string attribute) | Correct (Angular binding) |
|--------------------------|-----------------------------|
| `bordered="false"` | `[bordered]="false"` or omit when default is desired |
| `zebra="true"` | `[zebra]="true"` |
| `decorative` (ambiguous) | `[decorative]="true"` |
| `selected` on menu item | `[selected]="true"` / bind to route state |

Use **`[visibility]="navbarVisibility"`** (object), **`[options]="dateRangeOptions"`** (array), **`[columns]`** / **`[data]`** on **`modus-wc-table`** — never rely on stringified JSON in attributes.

### 4. Host layout: **`customClass`**, not only `class`

For **`modus-wc-navbar`**, **`modus-wc-side-navigation`**, **`modus-wc-card`**, etc., layout utilities (**`sticky`**, **`z-index`**, width caps) must use the documented **`customClass`** input so classes land on the **inner** surface the component styles. A bare **`class="…"`** on the host often **does not** apply where Modus CSS expects.

### 5. Styles, assets, and zone

1. Import **`@trimble-oss/moduswebcomponents/modus-wc-styles.css`** in **`main.ts`** or first global SCSS **before** app CSS ([modus-essentials.md](./modus-essentials.md)).
2. Copy **`node_modules/@trimble-oss/moduswebcomponents/assets`** → **`public/assets`** (or **`angular.json`** assets); keep **`setAssetPath`** aligned with that URL.
3. Link **`modus-icons.css`** from **`index.html`** ([**modus-wc-icons-setup**](../skills/modus-wc-icons-setup/SKILL.md)).
4. Theme on **`<html>`** before first paint (`data-theme`, `data-mode`, `light`/`dark` class) — inline script or **`public/theme-bootstrap.js`** linked from **`index.html`**; see [modus-wc-integration.md](./modus-wc-integration.md) and **Theme bootstrap + `modus-wc-theme-provider`** below.
5. **Vite / Analog:** `import 'zone.js'` at the top of **`main.ts`** before **`bootstrapApplication`** (Angular still expects Zone unless you explicitly go zoneless).
6. Standalone components: **`imports: [ModusAngularComponentsModule]`** (or individual **`ModusWc*`** standalones) on any component whose template uses Modus tags. **`CUSTOM_ELEMENTS_SCHEMA`** is optional when using the generated **`ModusWc*`** wrappers from the module; follow **`get_modus_implementation_data`** → **`angular`** for your version.

### Bootstrap — PR checklist (agent: run before calling Modus UI “done”)

- [ ] **`app.config.ts`**: **`importProvidersFrom(ModusAngularComponentsModule)`** + **`APP_INITIALIZER`** that **`await defineCustomElements(window)`** and sets **`setAssetPath`** with **`origin + base + assets/`**.
- [ ] **Root template**: entire shell inside **`<modus-wc-theme-provider>`**; **`:host > modus-wc-theme-provider`** flex in **`app.component.scss`**.
- [ ] **No** boolean Modus props as string attributes — grep templates for `bordered="`, `zebra="`, `disabled="`, `expanded="` and convert to **`[prop]="…"`**.
- [ ] **Navbar / card / rail**: **`customClass`** for layout; **`[mainMenuOpen]="false"`** when side nav owns the drawer (see shell section above).
- [ ] **`main.ts`**: **`zone.js`** + global Modus CSS import order correct.
- [ ] **Browser smoke**: navbar buttons are real controls (not bare text); KPI/content inside **`modus-wc-card`** surfaces; light/dark toggle works.
- [ ] **FOUC script + charts:** **`modus-theme-config`** stores **`{ theme: 'modus-modern', mode: resolved }`** (not a combined **`modus-modern-dark`** string); canvas charts get an **initial** theme sync after shell mount (see **Theme + canvas charts**).

### Theme bootstrap + `modus-wc-theme-provider` (non-negotiable when both ship)

Angular shells typically use **both** a pre-paint FOUC script and **`<modus-wc-theme-provider>`**. The provider’s **`initializeThemeStore()`** reads **`localStorage.modus-theme-config`** for **`mode`** (falls back to **system** `prefers-color-scheme` when **`mode` is missing**). A mismatched FOUC script causes **`data-theme`** to flip **after** Chart.js reads tokens — charts look correct only after the user toggles the theme switcher once.

**FOUC script must:**

1. Set **`document.documentElement`**: **`data-theme`** = `modus-modern-light` | `modus-modern-dark`, **`data-mode`** = user key (`light` | `dark` | `system`), **`class`** = resolved `light` | `dark`.
2. Persist **`localStorage.theme`** (user preference key) when you use it elsewhere.
3. Persist **`modus-theme-config`** in the **same shape the theme store expects** — **`theme`** is the **family name**, **`mode`** is the **resolved** light/dark:

```js
// public/theme-bootstrap.js (excerpt)
var resolved = /* from localStorage 'theme' or system */;
localStorage.setItem(
  'modus-theme-config',
  JSON.stringify({ theme: 'modus-modern', mode: resolved }),
);
```

**Do not** store only `{ theme: 'modus-modern-dark' }` (combined string, no **`mode`**) — the provider will ignore **`mode`**, default to **OS** preference, and **`updateThemeClasses()`** can overwrite the FOUC **`data-theme`** on first boot.

**Symptom → cause:** Dashboard chrome is dark/light as expected, but **Chart.js** series/axes/legend use the **wrong** palette on first load; **one theme-switcher toggle** fixes it → missing **`mode`** in **`modus-theme-config`**, and/or charts never received an **initial** sync after **`modus-wc-theme-provider`** applied classes.

### Reference — do not copy React-only bootstrap

- Do **not** use **`ModusWcThemeProvider`** JSX from React docs — use **`<modus-wc-theme-provider>`** in Angular templates.
- Do **not** use **`onInputChange`** / **`onButtonClick`** prop names — use **`(inputChange)`** / **`(buttonClick)`** ([Custom events in templates](#custom-events-in-templates) below).
- Confirm APIs via **`get_modus_implementation_data`** → **`angular`** and **`version`** from **`package.json`** ([**modus-wc-mcp**](../skills/modus-wc-mcp/SKILL.md)).

## Custom events in templates

Stencil uses **camelCase** event names on the host. In Angular templates bind with parentheses:

| Host event | Angular binding |
|------------|-------------------|
| **`inputChange`** | **`(inputChange)="…"`** |
| **`buttonClick`** | **`(buttonClick)="…"`** |

Confirm **`$event`** / **`detail`** typing for your wrapper version via MCP **`get_modus_implementation_data`** → **`angular`** — do not mirror React’s **`onInputChange`** prop naming unless the Angular docs explicitly expose it.

## Theme + canvas charts (Chart.js)

**Canvas** libraries (e.g. **Chart.js**) need **parseable** colors (`rgb()` / hex), not raw `getPropertyValue` on tokens that use **`light-dark()`** — see [**modus-wc-chart-colors**](../skills/modus-wc-chart-colors/SKILL.md) **§6** (`colorFromVar`, `chart.update()`).

**Angular-specific:** Do **not** rely on **`MutationObserver`** on `<html>` and/or **`document.addEventListener('themeChange')`** alone to refresh charts. With **Stencil + Angular**, those hooks are easy to miss or race. Ship an **app-level sync event** plus an **initial** dispatch after the shell (and **`modus-wc-theme-provider`**) has applied **`data-theme`**.

### Why first load breaks without this

Typical boot order:

1. **FOUC script** sets **`data-theme`** on **`<html>`**.
2. Angular boots; **`modus-wc-theme-provider`** runs **`initializeThemeStore()`** → **`updateThemeClasses()`** (may change **`data-theme`** if **`modus-theme-config`** lacked **`mode`** — see **Theme bootstrap + `modus-wc-theme-provider`** above).
3. Routed **Chart.js** components run **`ngAfterViewInit`** and **`colorFromVar()`** once.
4. If step 2 runs **after** step 3, or step 2 changes the theme, canvas colors stay **stale** until something calls **`chart.update()`** with re-resolved colors. **`(themeChange)`** on the switcher fixes it because you already dispatch the sync event there — **first paint** needs the same refresh.

### Required wiring

1. **Shared event module** — e.g. `src/app/modus-chart-theme-sync.event.ts`:

```ts
export const MODUS_CHART_THEME_SYNC_EVENT = 'modus-chart-theme-sync';

export function dispatchModusChartThemeSync(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(MODUS_CHART_THEME_SYNC_EVENT, { bubbles: true }),
  );
}
```

2. **Shell `AppComponent`** (hosts **`modus-wc-theme-switcher`** + **`modus-wc-theme-provider`**):
   - **`(themeChange)`** → keep **`localStorage.theme`** aligned with resolved **`light`/`dark`**, then **`dispatchModusChartThemeSync()`** (provider has already updated **`document.documentElement`**).
   - **`ngAfterViewInit`** → schedule **one** initial sync **after** the provider applies classes (double **`requestAnimationFrame`** is enough):

```ts
private scheduleInitialChartThemeSync(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dispatchModusChartThemeSync());
  });
}
```

3. **Base chart (or each Chart.js component):** in **`ngAfterViewInit`**, after **`new Chart(…)`**, **`window.addEventListener(MODUS_CHART_THEME_SYNC_EVENT, …)`**; in **`ngOnDestroy`**, **`removeEventListener`**. Handler: rebuild config with **`colorFromVar`**, assign **`chart.data`** / **`chart.options`**, **`chart.update()`**.
4. **Belt-and-suspenders on first mount:** one **`requestAnimationFrame`** that runs **`void document.documentElement.offsetHeight`** then **`refreshTheme()`** immediately after creating the chart (covers charts that mount in the same frame as the provider).

**Do not** assume **`ngAfterViewInit`** on the chart runs **after** **`modus-wc-theme-provider`** has finished **`updateThemeClasses()`** — sibling/child order and Stencil lifecycle do not guarantee that.

5. **Optional:** **`MutationObserver`** on **`document.documentElement`** (`data-theme` / `class`); **`matchMedia('(prefers-color-scheme: dark)')`** when **`data-mode`** is **`system`** — secondary only; keep the **window `CustomEvent`** as the primary contract.

6. **Stale `getComputedStyle`:** after **`colorProbe.style.color = \`var(${name})\``**, run **`void colorProbe.offsetHeight`** before **`getComputedStyle(colorProbe).color`**; before batch palette reads, **`void document.documentElement.offsetHeight`** once after a theme flip ([**modus-wc-chart-colors**](../skills/modus-wc-chart-colors/SKILL.md) **§6**).

### PR checklist (canvas charts + Modus theme)

- [ ] **`colorFromVar`** (or equivalent) for all series, grid, tick, legend, tooltip colors — not raw **`getPropertyValue`** on **`light-dark()`** tokens.
- [ ] FOUC **`modus-theme-config`**: **`{ theme: 'modus-modern', mode: resolved }`** — see **Theme bootstrap + `modus-wc-theme-provider`**.
- [ ] **`dispatchModusChartThemeSync()`** from **`(themeChange)`** on **`modus-wc-theme-switcher`**.
- [ ] **Initial** **`dispatchModusChartThemeSync()`** from shell **`ngAfterViewInit`** (double **`requestAnimationFrame`**).
- [ ] Chart components **listen on `window`**; **remove** listener in **`ngOnDestroy`**; **`refreshTheme()`** after create via **`requestAnimationFrame`**.
- [ ] **Hard refresh** in light and dark: chart colors match shell **without** toggling the theme switcher.
- [ ] Theme toggle still updates charts **without** full page reload.

## Reading values

- Text-like controls: **`$event.detail?.target?.value`** where MCP defines **`InputEvent`** — **not** **`String($event.detail)`**.
- **Select:** **`options`** property API — **not** slotted **`<option>`** (see [**modus-wc-form-inputs**](../skills/modus-wc-form-inputs/SKILL.md)).
- Checkbox/switch/radio: **`detail`** is also a native **`InputEvent`** in 2.x — read **`$event.detail?.target?.checked`** (not `$event.detail.newValue`, which was the 1.0 shape).

## Slots and conditional content

- Use **`slot="..."`** as documented. Heavy mount/unmount toggling next to slotted Modus hosts can fight projection — prefer stable structures or visibility toggles consistent with your Angular patterns; the underlying issue matches what [**modus-wc-react-slotted-hosts**](../skills/modus-wc-react-slotted-hosts/SKILL.md) describes for React.

## Do not import from React-only docs

- Theme: use **`get_modus_implementation_data`** **Angular** guidance. React’s **`ModusWcThemeProvider`** JSX maps to **`<modus-wc-theme-provider>`** in Angular — that **host is required** in the root shell; it is not optional “React-only” chrome.
- **Next.js** FOUC / **`'use client'`** — only if you embed Angular oddly; default SPA Angular ignores [modus-nextjs.md](./modus-nextjs.md).

## Docs lookup

- **`get_modus_implementation_data`** — **`angular`**, **`form-inputs`**, **`accessibility`**.
- **`get_modus_component_data`** — always pass installed **`version`**.
- **Charts (tokens, Chart.js, Recharts):** [**modus-wc-chart-colors**](../skills/modus-wc-chart-colors/SKILL.md) — Angular **canvas** theme sync: **Theme + canvas charts (Chart.js)** above.

See [**modus-wc-mcp**](../skills/modus-wc-mcp/SKILL.md).
