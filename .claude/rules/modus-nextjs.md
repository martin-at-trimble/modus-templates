<!-- Claude Code: save as `.claude/rules/modus-nextjs.md` or merge sections into CLAUDE.md. -->
# Modus Web Components + Next.js — integration contract

Use this alongside [modus-essentials.md](./modus-essentials.md), [modus-wc-integration.md](./modus-wc-integration.md), [modus-setup.md](./modus-setup.md), [modus-typography.md](./modus-typography.md), [modus-layout.md](./modus-layout.md), and [modus-accessibility.md](./modus-accessibility.md). This rule is **Next.js-specific**—it does **not** duplicate the cross-stack integration guide, it only captures what changes under **App Router + React Server Components (RSC)**. For **new Next.js Modus apps**, follow [modus-essentials.md](./modus-essentials.md) **Scaffolding new apps** (navbar + side navigation in a `'use client'` shell) and the **modus-wc-side-navigation** skill.

Framework-agnostic mitigations for React + shadow DOM and scroll ownership live in [modus-wc-integration.md](./modus-wc-integration.md). Read that first, then apply this rule.

## Why customers see “pop-in” and how to stop it

Modus components are **Stencil custom elements**. Two facts drive the FOUC story:

1. **`modus-wc-styles.css` is just CSS**—tokens, base layout, typography. It **does** ship in the SSR response if you import it from `app/layout.tsx`. The only thing that is client-only is **shadow DOM markup** and **per-component shadow styles** that Stencil defines after `customElements.define(...)` runs.
2. So customers who say “WC don’t work with Next.js SSR” are usually describing a gap between **SSR HTML arriving** and **custom elements upgrading**. Close that gap in layers. With the Stencil **hydrate** app enabled in the package (**Layer 5**), you can also server-emit **Declarative Shadow DOM** for Modus tags you pass through `hydrateDocument`—but **Layers 1–4** remain required for theme, global CSS, React integration, and assets.

Recommend the **five-layer contract**, applied in order. Each layer is independently shippable.

## Layer 1 — FOUC theme bootstrap (before React hydration)

Run logic **before interactive hydration** that reads `localStorage.theme` + `modus-theme-config` and sets on `<html>`:

- **`data-theme`** = `modus-modern-light` | `modus-modern-dark`
- **`data-mode`** = `light` | `dark` | `system`
- **`class`** includes `light` or `dark` for the **resolved** mode

**React 19 + Next.js App Router — do not put a `<script>` in `app/layout.tsx` (including `dangerouslySetInnerHTML`) and do not use `next/script` for this IIFE.** Any of those paths still reconciles through the **client** in a way that triggers *“Encountered a script tag while rendering React component…”* — the same error surfaced with **inline head scripts**, **`next/script` `beforeInteractive`**, and **`src="/theme-fouc.js"`** in current **React 19.2+** + **Next 16** dev/prod.

**Preferred pattern (Next.js 15.3+, including 16):** use **[`instrumentation-client.js|ts`](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client)** at the **app root** (or under `src/`). Next runs it **after the document loads** and **before React hydration** — no `<script>` in the React tree.

1. **Shared helper** (keep in sync with **`public/theme-fouc.js`** for static / non-Next hosts):

```ts
// lib/modusThemeBootstrap.ts
export function applyModusThemeFromStorage(): void {
  if (typeof document === "undefined") return;
  try {
    const k = localStorage.getItem("theme") || "system";
    const sys = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const r = k === "system" ? sys : k;
    const t = r === "dark" ? "modus-modern-dark" : "modus-modern-light";
    const e = document.documentElement;
    e.dataset.theme = t;
    e.dataset.mode = k;
    e.classList.add(r);
    try {
      localStorage.setItem("modus-theme-config", JSON.stringify({ theme: t }));
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}
```

2. **Root `instrumentation-client.ts`:**

```ts
import { applyModusThemeFromStorage } from "./lib/modusThemeBootstrap";
applyModusThemeFromStorage();
```

3. **`app/layout.tsx`:** **omit** theme `<script>` tags entirely; keep **`suppressHydrationWarning`** on **`<html>`** when `light` / `dark` classes are applied by this bootstrap alongside `next/font` / other React-controlled classes.

**Tradeoff vs inline HTML:** the IIFE runs when the **client bundle** reaches `instrumentation-client` (after document load), not during the initial HTML parse. It is still **before hydration**, which removes the React 19 script warning and aligns theme with `ModusWcThemeProvider`. For the absolute earliest paint on very slow JS, pair with sensible **CSS** fallbacks (`color-scheme`, default surfaces) — not a second parallel `<script>` in the layout tree.

**CSP:** This path runs as **your app’s compiled JS**, not an extra `script-src` host tag—treat it like other bundle code. If you disallow all inline scripts but allow `'self'` JS, this still satisfies policy.

**Non-Next / static HTML:** keep a **`public/theme-fouc.js`** (or equivalent) **`<script src>`** in plain HTML only—no React involved.

## Layer 2 — Global CSS arrives in the SSR response

- Import **`@trimble-oss/moduswebcomponents/modus-wc-styles.css`** and app globals in **`app/layout.tsx`** (server component). Next.js inlines/streams CSS imports from the server bundle, so tokens and base layout ship **with the first HTML byte**—there is no client-JS dependency for these styles.
- Load Modus Icons the same way as the vanilla blueprint: a small `/public/modus-web-components/modus-icons.css` with `@font-face` to jsDelivr, linked via `<link rel="stylesheet">` in `<head>` of `app/layout.tsx`. Preload the two `modus-icons.woff2` files with `<link rel="preload" as="font" crossOrigin="">` so chrome glyphs paint immediately (see [.claude/skills/modus-wc-icons-setup/SKILL.md](../skills/modus-wc-icons-setup/SKILL.md)).
- Load **Open Sans** via **`next/font/google`** (preferred in App Router) or a **`<link>`** in `<head>` so body text does not swap under the first control labels.
- CSS order is the same as every other stack: **Modus → your globals → Tailwind**, never the reverse.

## Layer 3 — `:not(:defined)` + SSR skeleton (cover the upgrade gap)

Between SSR and custom-element upgrade, unresolved `<modus-wc-*>` tags are **unknown elements**—they render inline and look broken. Two lines of global CSS plus a **dimensional skeleton** close that gap with **zero layout shift**:

```css
/* app/globals.css */
modus-wc-navbar:not(:defined),
modus-wc-side-navigation:not(:defined),
modus-wc-button:not(:defined),
modus-wc-card:not(:defined),
modus-wc-typography:not(:defined),
modus-wc-icon:not(:defined) {
  visibility: hidden;
}
```

For **above-the-fold chrome** (navbar, side nav rail), render a **plain HTML/CSS skeleton** at the same dimensions from the server component so the page has real boxes while Modus JS is in flight. The skeleton uses the same Modus CSS variables (`--modus-wc-color-base-page`, `--modus-wc-color-base-100`) so it is theme-correct out of the gate. When `customElements.whenDefined('modus-wc-navbar')` resolves on the client, the `:not(:defined)` rule stops applying and the real navbar takes over **in place**—no flash, no CLS.

Gate the rule behind an `html.js` class (set by the theme bootstrap script) if you need to remain readable in **no-JS crawlers**.

## Layer 4 — Client boundary, providers, asset path, React 19 patch

Modus React wrappers (`ModusWcNavbar`, `ModusWcCard`, `ModusWcButton`, …) are **client-only**. In App Router:

- Put every Modus tag (and anything that imports from `@trimble-oss/moduswebcomponents-react`) inside a file starting with `'use client'`.
- Do **not** wrap those files in `next/dynamic({ ssr: false })`. The `'use client'` boundary already prevents server rendering of Modus internals; `dynamic({ ssr: false })` adds a second waterfall and delays hydration.
- Mount **one** `ModusWcThemeProvider` near the root of the client tree (e.g. in `app/providers.tsx`) **inside a client-mount gate** — see *Hydration mismatch from Modus React wrappers (server DSD + light-DOM upgrade)* below. Render a token-correct HTML skeleton on the first server + client tick; swap in `ModusWcThemeProvider` only after `useEffect` runs so SSR HTML contains no `<modus-wc-*>` tags. Call **`setAssetPath`** in the same `useEffect` (browser-only; cannot run on the server)—same trailing slash contract:

  ```ts
  setAssetPath(
    `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`,
  );
  ```

  **Import path depends on your Modus base version:** many **1.5.x** builds export **`setAssetPath`** from **`@trimble-oss/moduswebcomponents/components`** (not **`/loader`**). Grep the package or use **`exports`** in **`node_modules/@trimble-oss/moduswebcomponents/package.json`**—do not assume **`/loader`** without checking.

  Mirror whatever **`basePath`** is set in **`next.config.js`**. Wrong paths break icons and lazy chunks **in production only**.
- Apply the **React 19 shadow DOM patch** (same guarded `Node.prototype.removeChild` / `insertBefore` approach documented in [modus-wc-integration.md](./modus-wc-integration.md) — React 19 and shadow DOM section). Import it once from `app/providers.tsx`, above the provider.
- **Do not** wrap Modus subtrees in `React.StrictMode`. Dev double-mount + named slots produces **`removeChild`/NotFoundError**. Put `StrictMode` around non-Modus parts if you want it.
- Scroll ownership: the Next.js equivalent of `#root > modus-wc-theme-provider` is **`body > modus-wc-theme-provider`** (Next does not wrap children in `#root`). Apply the flex chain from [modus-wc-integration.md](./modus-wc-integration.md) (viewport height / scroll ownership section) to `html`, `body`, and `modus-wc-theme-provider` when `<main>` must own scroll.

## React 19 + App Router — hydration (mandatory for client shells)

**Symptom:** *Hydration failed because the server rendered HTML didn't match the client* on the first paint, often under **`'use client'`** shells (**`AppShell`**, nav, breakpoint-driven layout).

**Cause:** The **first client render** or **SSR output** disagree—common triggers:

- **`window` / `matchMedia` / `Date.now()`** in **`useState` initializers** (server has no `window`).
- **`useState(false)` + `useLayoutEffect` + `queueMicrotask(() => setMatch(…))`** for breakpoints: effect ordering and deferred updates can still produce a **tree** that does not match what React 19 expects for **external store**–style inputs.

**Do — canonical for `matchMedia` / min-width gates:** use **`useSyncExternalStore`**:

- **`subscribe`** — on **`window.matchMedia(\`(min-width: ${px}px)\`)`**, listen for **`change`**, call the store callback, return cleanup.
- **`getSnapshot`** — **`() => mq.matches`** on the client.
- **`getServerSnapshot`** — return a **fixed** boolean that matches SSR (**`false`** is the usual default: “narrow / until client confirms width”).

That keeps **server HTML**, **hydration**, and **post-hydration width** aligned without ad hoc **`queueMicrotask`**.

**Do — fallback:** fixed SSR-safe **`useState` default** + **`useLayoutEffect`** to **`setState`** from **`matchMedia`** / **`ResizeObserver`** (first paint must still match SSR). Prefer **`useSyncExternalStore`** for shell **`matchMedia`** so you do not rely on microtask deferrals.

**Do not:** `useState(() => window.matchMedia(…).matches)` (or any **`window` read in a `useState` initializer**) in components that SSR.

**Do not:** Put **any** theme bootstrap **`<script>`** in **`app/layout.tsx`** on **React 19 + Next 15.3+**—use **`instrumentation-client.ts`** (**Layer 1**).

## Hydration mismatch from Modus React wrappers (server DSD + light-DOM upgrade)

**Symptom:** *Hydration failed because the server rendered HTML didn't match the client* on **any** route that renders Modus tags — often surfacing at the **root** of the Modus subtree (e.g. **`<AppShell>`** → **`<div className="app-shell …">`** appears in the **client** column of the Next.js overlay diff but not the **server** column), or on a specific light-DOM host (**`modus-wc-typography`**, **`modus-wc-menu`**, **`modus-wc-menu-item`**) where the overlay shows a Stencil-rendered child the React tree never produced:

```
<ModusWCTypography hierarchy="h1" size="2xl" weight="bold" label="Overview">
  <modus-wc-typography suppressHydrationWarning={true} ref={function}>
-   <p className="modus-wc-typography modus-wc-text-md modus-wc-typography-weight-normal">
```

**Two compounding causes** — both addressed by the **same** Providers-level mount gate below:

### A. The Modus React wrapper ships a server module that emits DSD on every tag

**`@trimble-oss/moduswebcomponents-react`** publishes both **`stencil-generated/components.js`** (client) and **`stencil-generated/components.server.js`** (server). Next.js' **`react-server`** + browser exports resolve the **server** module during SSR. Each wrapper there is built with **`@stencil/react-output-target/ssr`** + **`hydrateModule: import('@trimble-oss/moduswebcomponents/hydrate')`** and **`serializeShadowRoot = { default: "declarative-shadow-dom" }`**:

```js
// node_modules/@trimble-oss/moduswebcomponents-react/stencil-generated/components.server.js
import { createComponent } from '@stencil/react-output-target/ssr';
export const serializeShadowRoot = { default: "declarative-shadow-dom" };
export const ModusWcNavbar = /*@__PURE__*/ createComponent({
  tagName: 'modus-wc-navbar',
  hydrateModule: import('@trimble-oss/moduswebcomponents/hydrate'),
  clientModule: clientComponents.ModusWcNavbar,
  serializeShadowRoot,
});
```

Result: under **Next.js 16 + React 19** every `'use client'` Modus tag still **SSRs**, and the server response carries a **full `<template shadowrootmode="open">` shadow tree** inside every `<modus-wc-*>`. The **client** wrapper renders only a bare host (Stencil's own `customElements.define` re-renders the shadow root). React's hydration walks both trees and sees a **massive structural diff** — typically reported at the **first stable parent** (e.g. the `AppShell` root `<div>`) because that is where the diff resolves.

### B. Client-side `customElements.define` upgrade race (light-DOM hosts)

`@stencil/react-output-target/runtime` calls **`customElements.define(...)` eagerly at module-load time** — once per component, as soon as the wrapper module is imported in the client bundle. The SSR HTML's bare `<modus-wc-*>` tags **upgrade immediately**; Stencil runs **`connectedCallback`** → **`render()`** and, for **light-DOM** hosts (`modus-wc-typography`, `modus-wc-menu`, `modus-wc-menu-item`, and similar), writes children into the element with **default props** — because **`@lit/react`'s `useLayoutEffect`** (which imperatively applies the React-passed `size` / `weight` / etc. onto the element instance) has not yet run. By the time React walks the DOM, it sees a tree it never generated. The rendered `<p>` carries **default prop classes** (`text-md`, `weight-normal`) instead of the **`size="2xl" weight="bold"`** the React tree passes.

### Neither A nor B is fixed by

- **`suppressHydrationWarning`** on the host — silences attribute/text diffs on a single element, **not** structural diffs (unexpected child where the React tree had none, or whole subtree missing).
- **Webpack-aliasing `@lit/react/node/*` → the browser entry on the server** — does not change the SSR wrapper output or the client-side upgrade race.
- **`next/dynamic({ ssr: false })`** — slower than a `'use client'` file + mount gate, blocks streaming, and is an anti-pattern below.
- Gating **only `<main>` page content** while leaving navbar / side-nav unguarded — the navbar and rail are themselves Modus subtrees and SSR through `components.server.js` too. The diff originates at whichever Modus tag SSRs **first**, which is usually shell chrome, not page content.

### Do — Providers-level client-mount gate around the entire Modus subtree

Hoist the gate **above** `ModusWcThemeProvider` so the SSR HTML contains **zero** `<modus-wc-*>` tags. Render a token-correct HTML/Tailwind skeleton during SSR + first client render; after mount, swap in the full Modus tree:

```tsx
// app/providers.tsx
"use client";
import "@/lib/shadow-dom-patch";
import { ModusWcThemeProvider } from "@trimble-oss/moduswebcomponents-react";
import { setAssetPath } from "@trimble-oss/moduswebcomponents/components";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    setAssetPath(`${window.location.origin}${base}/`);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return <SsrShellSkeleton />;
  return <ModusWcThemeProvider>{children}</ModusWcThemeProvider>;
}

function SsrShellSkeleton() {
  // Plain HTML (no modus-wc-* tags) at the same dimensions as the eventual
  // navbar + rail + main, using Modus CSS variables for theme-correct color.
  return (
    <div
      aria-hidden
      className="flex h-dvh min-h-0 flex-col overflow-hidden bg-(--modus-wc-color-base-page)"
    >
      <div className="h-14 w-full shrink-0 border-b border-(--modus-wc-color-base-200) bg-(--modus-wc-color-base-100)" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden shrink-0 border-r border-(--modus-wc-color-base-200) bg-(--modus-wc-color-base-100) lg:block" style={{ width: 64 }} />
        <div className="min-h-0 min-w-0 flex-1">{/* page skeleton */}</div>
      </div>
    </div>
  );
}
```

The SSR HTML now contains **no** Modus tags **anywhere** — nothing for the server wrapper to DSD-serialize, and nothing for Stencil's eager `customElements.define` to upgrade before hydration. After mount, React inserts the Modus subtree fresh; **`@lit/react`'s** `useLayoutEffect` and Stencil's first render both run on the **same** React tick against newly-created elements, with the right props. Hydration succeeds because the **first** client render matches the **server** render (both render the skeleton).

**Cost:** one skeleton frame on cold load. Match its dimensions to the real chrome (navbar height, rail width, `max-w-7xl` main column) to keep **CLS ≤ 0.05**.

**Pair with — Layer 3 `globals.css`:** keep the `:not(:defined)` rule for any **un-gated** above-the-fold Modus tags (Pages Router islands, partial migrations) so they do not flash unstyled before upgrade.

**Why not gate inside `<main>` only?** The navbar and side-nav are themselves Modus subtrees rendered in `'use client'` files. They SSR through `components.server.js` too. Gating `{clientShellReady ? children : skeleton}` inside **`AppShell`'s main** leaves the navbar + rail SSRing DSD — the structural diff still lands at the AppShell root or earlier. **The gate has to live above `ModusWcThemeProvider`.**

### Verify the package version actually emits DSD on the server

After upgrades / fresh installs, grep the package to confirm whether the server wrapper still ships DSD (it has since at least `1.5.0-react19`):

```bash
grep -l '@stencil/react-output-target/ssr' \
  node_modules/@trimble-oss/moduswebcomponents-react/stencil-generated/components.server.js
grep -m1 'serializeShadowRoot' \
  node_modules/@trimble-oss/moduswebcomponents-react/stencil-generated/components.server.js
```

If `serializeShadowRoot` is `"declarative-shadow-dom"`, the Providers-level gate is **required**. If a future Modus release ever drops to `serializeShadowRoot: false` (or removes `components.server.js` entirely), document the override in your repo before relaxing the gate.

### Heuristic for "is this host light-DOM?"

Open **`node_modules/@trimble-oss/moduswebcomponents/components/<tag>.js`** (or its **`p-*.js`** chunk) and check the Stencil **`render()`**: if it returns `h(Element, ...)` / `h(Host, ..., h("slot", ...))` **without `shadow: true`** on the component decorator, the output lands in light DOM and is a candidate for failure mode **B** as well as **A**. The Providers gate handles both; you do not need a separate per-tag mitigation.

### Do not

- Use **`suppressHydrationWarning`** as a fix for structural diffs from Stencil upgrade or server-wrapper DSD.
- Webpack-alias **`@lit/react`** entries to "fix" the hook-count diff — does not address either failure mode; remove if present.
- Gate **only `<main>` children** when navbar / side-nav are Modus components — they SSR through `components.server.js` too; hoist the gate to `Providers`.
- Mount **Modus subtrees** inside **`<main>`** without a **Providers-level mount gate** when SSR is enabled, expecting `'use client'` alone to suppress SSR (it does not — Client Components still render on the server unless explicitly excluded).
- Conditionally **mount / unmount** Modus hosts that use **`slot="…"`** while a parent is hydrating — combine with the skill **[modus-wc-react-slotted-hosts](../skills/modus-wc-react-slotted-hosts/SKILL.md)**.

## Stencil components with required props (`modus-wc-table`, and similar)

**Symptom:** Console errors such as **`ModusWcTable: columns is required`** / **`data is required`** on initial load.

**Cause:** The custom element **connects** (SSR HTML or early client DOM) **before** React has applied **`columns`** / **`data`** properties; Stencil runs validation in **`connectedCallback`**.

**Do (pick one):**

- **Defer mounting** the host until after mount: e.g. **`useState(false)`** + **`useEffect(() => { queueMicrotask(() => setReady(true)); }, [])`**, render a **skeleton** (`min-height`, tokens) until **`ready`**, then render **`ModusWcTable`** with **`columns`** and **`data`**.
- Or isolate the table in a small child component that only mounts when **`ready`**.

**Do not:** Rely on SSR emitting a fully-propped **`modus-wc-table`** without verifying runtime order for your Next + React version.

## Turbopack vs webpack (Modus / Stencil lazy chunks)

**Symptom:** **`next build` / `next dev`** fails with Stencil **`import(`** / **`.entry.js`** resolution errors under **Turbopack**.

**Do:** Run with **webpack** until the toolchain supports that pattern: **`next dev --webpack`** and **`next build --webpack`** (and set **`transpilePackages`** for **`@trimble-oss/moduswebcomponents`** and **`@trimble-oss/moduswebcomponents-react`** in **`next.config`** when needed).

## Layer 5 — Stencil `hydrate` app (DSD SSR)

**Declarative Shadow DOM (DSD)** SSR is when the browser receives `<template shadowrootmode="open">` already populated with a component’s shadow markup and styles. The Modus package is expected to expose Stencil’s **hydrate** app (e.g. subpath **`@trimble-oss/moduswebcomponents/hydrate`** with **`renderToString`** / **`hydrateDocument`**) so SSR frameworks can post-process HTML before streaming.

**What it unlocks in Next.js:** A `React.cache`-wrapped helper can run RSC output through **`hydrateDocument`** so above-the-fold chrome can arrive with **shadow styles on the wire**. Where you apply it consistently, **Layer 3** becomes belt-and-braces (hiding unresolved hosts) rather than the primary defense against **inside-shadow** pop-in.

**What you still need after hydrate is available — keep Layers 1–4:**

- **Layer 1 — FOUC bootstrap:** Hydrate does **not** set `<html>` theme. Use **`instrumentation-client.ts`** calling shared theme helpers (**Layer 1**). Do **not** rely on **`app/layout.tsx`** **`<script>`** or **`next/script`** on **React 19**—script-in-layout warnings and broken execution.
- **Layer 2 — Global CSS, icons, fonts:** Keep importing **`modus-wc-styles.css`** from `app/layout.tsx`, linking **`modus-icons.css`**, and preloading woff2 / body font. Those cover **layout tokens**, **light-DOM** surfaces, and **icon fonts**—not replaced by per-tag shadow serialization alone.
- **Layer 3 — `:not(:defined)` + skeleton (recommended fallback):** Use on routes or subtrees where you **do not** pass HTML through `hydrateDocument`, during migration, or as insurance for any **un-upgraded** host before client `customElements.define` runs. DSD does not remove the need for **`'use client'`** Modus trees—only the server string you choose to post-process is fully pre-styled in shadow.
- **Layer 4 — Client boundary:** **`ModusWcThemeProvider`**, **`setAssetPath`** (correct **import** for your Modus version, origin + `basePath`), and the **React 19 shadow DOM patch** stay required. Hydrate improves **server HTML**; React still hydrates client components, registers elements, and wires Modus events. **`setAssetPath`** remains mandatory for correct lazy chunks and icons under subpath deploys.

Confirm **`serializeShadowRoot`** / **`fullDocument`** options against the version you ship; not every route must opt into DSD post-processing if cost or pipeline constraints apply.

## Checklist (copy into your PR template)

- [ ] `@trimble-oss/moduswebcomponents/modus-wc-styles.css` imported from `app/layout.tsx` (server component).
- [ ] FOUC bootstrap: root **`instrumentation-client.ts`** applies theme from **`localStorage`** / `matchMedia` via a shared helper (mirror in **`public/theme-fouc.js`** for static hosts). **No** theme **`<script>`** in **`app/layout.tsx`** on **React 19**.
- [ ] `data-theme`, `data-mode`, and resolved `light`/`dark` class on `<html>` match the bootstrap + provider.
- [ ] `modus-icons.css` linked in `<head>`, woff2 preloaded.
- [ ] `:not(:defined)` rule + SSR skeleton for above-the-fold chrome.
- [ ] Modus tags only inside `'use client'` files (no `next/dynamic({ ssr: false })` wrapping).
- [ ] `setAssetPath` imported from the correct Modus entry for the installed version, called with `origin + basePath` in the client before `ModusWcThemeProvider` needs assets.
- [ ] Client shells: no `window` / `matchMedia` in `useState` initializers; breakpoint / **`matchMedia`** gates use **`useSyncExternalStore`** (`getServerSnapshot` matches SSR) or a fixed default + **`useLayoutEffect`**—avoid **`queueMicrotask`** workaround unless you have measured a specific lint/runtime need.
- [ ] **Providers-level mount gate** wraps `ModusWcThemeProvider` and **the entire Modus subtree** (navbar, side-nav, page content) with a token-correct HTML skeleton during SSR + first client render. The package's `stencil-generated/components.server.js` ships DSD via `@stencil/react-output-target/ssr` + `@trimble-oss/moduswebcomponents/hydrate` (`serializeShadowRoot = "declarative-shadow-dom"`); without the gate, every `'use client'` Modus tag SSRs a `<template shadowrootmode="open">` shadow tree that the client wrapper does not match → structural hydration diff (`suppressHydrationWarning` cannot suppress it). The same gate covers the client-side `customElements.define` upgrade race for light-DOM hosts (`modus-wc-typography`, `modus-wc-menu`, `modus-wc-menu-item`). See *Hydration mismatch from Modus React wrappers (server DSD + light-DOM upgrade)*.
- [ ] Gate is **above** `ModusWcThemeProvider` — never only inside `<main>` page content, because navbar + side-nav also SSR through `components.server.js`.
- [ ] No leftover **`@lit/react`** webpack aliases in **`next.config`** "to force the browser entry on the server" — that alias **does not** fix the light-DOM upgrade race; remove it.
- [ ] `modus-wc-table` (and similar required-prop Stencil hosts): deferred mount or skeleton until `columns`/`data` are applied, if you see *`columns`/`data` is required`* on load.
- [ ] If Turbopack fails on Stencil chunks: `next dev --webpack` / `next build --webpack` + `transpilePackages` as needed.
- [ ] React 19 shadow DOM patch imported once in `app/providers.tsx`.
- [ ] No `React.StrictMode` around Modus trees.
- [ ] DevTools → Network: Modus CSS lands in the initial document response, not a late chunk.
- [ ] Lighthouse: CLS ≤ 0.05 on pages with navbar + side nav.
- [ ] If using **Layer 5** (`hydrateDocument`): helper runs before streaming; spot-check **View Source** / Elements for DSD templates on shell tags you post-process.

## Anti-patterns (do not ship)

- Using `next/dynamic(() => import('@trimble-oss/moduswebcomponents-react').then(m => m.ModusWcCard), { ssr: false })`—strictly worse than a `'use client'` file.
- Putting `<modus-wc-*>` tags directly inside a Server Component—the tag is defined in a client bundle; the server has no way to know.
- **`app/layout.tsx` (React 19):** **any** theme **`<script>`** (inline or **`next/script`**) for the FOUC IIFE—triggers *“Encountered a script tag while rendering…”*; use **`instrumentation-client.ts`** (**Layer 1**).
- **`'use client'`** shells: `useState(() => window.matchMedia(...))` or any **`window`/`matchMedia`-based initial state** that differs from SSR—causes **hydration mismatch**.
- **Modus subtrees rendered through SSR without a Providers-level mount gate** — `@trimble-oss/moduswebcomponents-react` ships `stencil-generated/components.server.js` that emits **DSD** (`<template shadowrootmode="open">`) on every tag, **and** Stencil registers custom elements at module-load time on the client and upgrades SSR HTML before React hydrates. The structural diff (DSD shadow tree on server vs bare host on client, or unexpected `<p>` inside `<modus-wc-typography>` with default-prop classes) cannot be silenced by **`suppressHydrationWarning`**. Gate the **entire** Modus subtree behind a mount flag at the **`Providers`** level (see *Hydration mismatch from Modus React wrappers (server DSD + light-DOM upgrade)*).
- **Gating only `<main>` page content** while navbar / side-nav stay un-gated — those are Modus components too; they SSR through `components.server.js` and reproduce the same structural diff at the AppShell root or earlier. The gate must live above `ModusWcThemeProvider`, not inside `AppShell`'s `<main>`.
- **Assuming `'use client'` prevents SSR** — Client Components still render on the server under App Router; only `next/dynamic({ ssr: false })` opts out, and that is its own anti-pattern. Use the Providers-level mount gate.
- **Aliasing `@lit/react/node/*` → the browser entry in `next.config` webpack** to "fix" the hydration error — addresses a different (hook-count) symptom, leaves the **client-side upgrade race** intact, and complicates config; remove if present.
- **`modus-wc-table` / Stencil hosts with required props:** mounting on the server or on the client **before** props are set—triggers *`columns`/`data` is required`*; use a **deferred mount** + skeleton (see above).
- Assuming **`setAssetPath`** lives in **`@trimble-oss/moduswebcomponents/loader`** without checking **`package.json` `exports`** for your **semver**.
- Re-declaring Modus CSS variables per page to “fix” theming—set them once via `data-theme` on `<html>` and let component variables cascade.
- Shadow-piercing with `::part` / `::slotted` when a documented `customClass` or slot exists (see [modus-essentials.md](./modus-essentials.md) UX defaults).
- Relying on **`useEffect`** alone to set **`data-theme`** on `<html>` for **first paint**—that runs after paint; use the **Layer 1** bootstrap (**`instrumentation-client`**) so tokens are correct before hydration; layout stays script-free.

## Related

- **Skill:** [.claude/skills/modus-wc-nextjs/SKILL.md](../skills/modus-wc-nextjs/SKILL.md) — full Next.js integration contract: file-level snippets for `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`, the asset-path helper, Pages Router, CSP, anti-patterns, and common problems.
- **React + slotted hosts:** [.claude/skills/modus-wc-react-slotted-hosts/SKILL.md](../skills/modus-wc-react-slotted-hosts/SKILL.md) — slot patterns that avoid `removeChild` crashes under Next.js dev.
- **Side navigation + push layout:** [.claude/skills/modus-wc-side-navigation/SKILL.md](../skills/modus-wc-side-navigation/SKILL.md) — applies the same in a Next.js `'use client'` shell.
- **Icons setup:** [.claude/skills/modus-wc-icons-setup/SKILL.md](../skills/modus-wc-icons-setup/SKILL.md) — font `@font-face` + preload pattern.
- **MCP lookup:** [.claude/skills/modus-wc-mcp/SKILL.md](../skills/modus-wc-mcp/SKILL.md) — verify props/events/slots against the installed version.
