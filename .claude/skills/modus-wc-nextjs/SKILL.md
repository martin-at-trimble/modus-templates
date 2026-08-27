<!-- Claude Code: save as `.claude/skills/modus-wc-nextjs/SKILL.md` (see https://code.claude.com/docs/en/skills) or merge into CLAUDE.md. -->
# Modus Web Components — Next.js integration

Full integration contract for Modus Web Components in Next.js. Use this alongside [modus-essentials.mdc](../../rules/modus-essentials.md), [modus-wc-integration.mdc](../../rules/modus-wc-integration.md), and [modus-nextjs.mdc](../../rules/modus-nextjs.md). For slotted-host patterns see **[modus-wc-react-slotted-hosts](../modus-wc-react-slotted-hosts/SKILL.md)**.

## Scope

- **Next.js 13, 14, 15** — App Router and Pages Router, React 18 and React 19.
- **Build targets:** static export, server rendering, and streaming with React Server Components.
- **Covers:** bootstrap, theme, global CSS, icons, fonts, SSR/FOUC, upgrade gap, client boundaries, asset paths under `basePath`, React 19 + shadow DOM, DSD (Stencil **hydrate**), CSP, and production verification.

## Mental model

Modus Web Components are **Stencil custom elements**. Two facts drive the Next.js story:

1. **`modus-wc-styles.css` is plain CSS** — tokens, base layout, typography, utility classes. Imported from **`app/layout.tsx`** it ships **with the first HTML byte**. No client JS runs to produce those rules.
2. **Per-component shadow DOM markup and shadow styles** are defined when Stencil registers the element (`customElements.define(...)`) in the **client bundle**. Without Declarative Shadow DOM (DSD), there is a gap between **HTML arrival** and **custom-element upgrade**. Customers who say “WC don’t work with Next.js SSR” are describing that gap.

> The full contract closes that gap in five layers. Layers 1–4 are mandatory. Layer 5 (Stencil hydrate / DSD) is an additional, optional acceleration for server-rendered shadow styles.

## The five-layer contract

Each layer is independently shippable. Apply in order.

### L1 — FOUC theme bootstrap (before React hydration)

A script runs **before** interactive hydration, reads `localStorage.theme` + `modus-theme-config`, and sets on `<html>`:

- **`data-theme`** = `modus-modern-light` | `modus-modern-dark`
- **`data-mode`** = `light` | `dark` | `system`
- **`class`** includes `light` or `dark` for the **resolved** mode

**React 19 + Next.js App Router:** Do **not** add this IIFE as **`<script>`** in **`app/layout.tsx`** (including **`dangerouslySetInnerHTML`**) or as **`next/script`** **`beforeInteractive`** — all of those paths can hit *“Encountered a script tag while rendering React component…”* under **React 19.2+** with current Next.

**Preferred (Next 15.3+ / 16):** root **`instrumentation-client.ts`** imports a small **`applyModusThemeFromStorage()`** helper (see **[modus-nextjs.mdc](../../rules/modus-nextjs.md)** Layer 1). Next runs it **after document load** and **before React hydration** — no `<script>` in the React tree.

Mirror the same logic in **`public/theme-fouc.js`** for static / non-Next HTML; **change both together**.

Set **`suppressHydrationWarning`** on `<html>` when the bootstrap also adds theme classes alongside `next/font` or React-controlled `className`. See **[modus-nextjs.mdc](../../rules/modus-nextjs.md)** (CSP, hydration / **`useSyncExternalStore`**, `modus-wc-table` defer, Turbopack vs webpack, `setAssetPath` import).

Drift between this bootstrap and your React theme provider reintroduces FOUC — edit both in the same PR.

### L2 — Global CSS, icons, and fonts arrive in the SSR response

- Import **`@trimble-oss/moduswebcomponents/modus-wc-styles.css`** and app globals in **`app/layout.tsx`** (Server Component). Next.js inlines or streams CSS imports from server bundles, so tokens and base layout ship with the first HTML byte.
- Link a small **`/public/modus-web-components/modus-icons.css`** (or equivalent path) that `@font-face`s Modus icon fonts from jsDelivr. Preload the two **`modus-icons.woff2`** files with `<link rel="preload" as="font" type="font/woff2" crossOrigin="">` so chrome glyphs paint immediately.
- Preload **Open Sans** (or your chosen body font) to avoid a font swap under the first button label.
- **CSS order:** **Modus → your globals → Tailwind**. Reversing the order lets utilities clobber Modus base styles.

### L3 — `:not(:defined)` + SSR skeleton (cover the upgrade gap)

Between SSR and custom-element upgrade, unresolved `<modus-wc-*>` tags are **unknown elements** — they render inline and look broken. Two lines of global CSS plus a **dimensional skeleton** close the gap with zero layout shift:

```css
/* app/globals.css */
modus-wc-navbar:not(:defined),
modus-wc-side-navigation:not(:defined),
modus-wc-button:not(:defined),
modus-wc-card:not(:defined),
modus-wc-typography:not(:defined),
modus-wc-icon:not(:defined),
modus-wc-badge:not(:defined),
modus-wc-chip:not(:defined) {
  visibility: hidden;
}
```

For **above-the-fold chrome** (navbar, side nav rail), render a **plain HTML/CSS skeleton** at the same dimensions from a server component so the page has real boxes while Modus JS loads. Use Modus CSS variables (**`--modus-wc-color-base-page`**, **`--modus-wc-color-base-100`**) so the skeleton is theme-correct. When `customElements.whenDefined('modus-wc-navbar')` resolves, the `:not(:defined)` rule stops applying and the real navbar takes over **in place** — no flash, no CLS.

Gate the rule behind an `html.js` class (set by the theme bootstrap) if you need to stay readable in **no-JS crawlers**.

### L4 — Client boundary, providers, asset path, React 19 patch

Modus React wrappers are client-only. In App Router:

- Every Modus tag and anything importing from **`@trimble-oss/moduswebcomponents-react`** lives inside a file starting with **`'use client'`**.
- **Do not** wrap Modus imports in **`next/dynamic({ ssr: false })`**. `dynamic({ ssr: false })` adds a second waterfall and delays hydration; use the **Providers-level mount gate** below instead. (Note: `'use client'` does **not** prevent SSR — Client Components still render on the server. The package's `components.server.js` emits DSD on every Modus tag, which is why the mount gate is required.)
- Mount **one** **`ModusWcThemeProvider`** near the root of the client tree (usually **`app/providers.tsx`**). Call **`setAssetPath`** from **`useEffect`** on the client. **Import path:** confirm your Modus version — many **1.5.x** packages export **`setAssetPath`** from **`@trimble-oss/moduswebcomponents/components`**, not **`/loader`**.

  ```ts
  setAssetPath(`${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`);
  ```

  Mirror whatever **`basePath`** is set in **`next.config.js`**. Wrong paths break icons and lazy chunks **in production only**.
- Apply the **React 19 shadow DOM patch** (guarded `Node.prototype.removeChild` / `insertBefore` wrap — see the **React 19 & shadow DOM** section below). Import it **once** at the **top** of **`app/providers.tsx`**, above every Modus import. The patch is idempotent and global.
- **Do not** wrap Modus subtrees in **`React.StrictMode`**. Dev double-mount + named slots produces **`NotFoundError` on `removeChild`**. Put `StrictMode` around non-Modus parts if you want it.
- **Scroll ownership:** the Next.js equivalent of `#root > modus-wc-theme-provider` is **`body > modus-wc-theme-provider`** (Next does not wrap children in `#root`). Apply the flex chain from [modus-wc-integration.mdc](../../rules/modus-wc-integration.md) to `html`, `body`, and `modus-wc-theme-provider` when `<main>` must own scroll.

### L5 — Stencil `hydrate` app (optional DSD SSR)

When the package exposes Stencil’s **hydrate** app (subpath like **`@trimble-oss/moduswebcomponents/hydrate`** with **`renderToString`** / **`hydrateDocument`**), you can post-process server HTML so selected `<modus-wc-*>` tags carry **`<template shadowrootmode="open">`** — the browser attaches the shadow root while parsing, **before** JS runs. For Modus, that means navbar, side nav, card, button, and typography can arrive fully styled on the first paint.

```ts
// lib/modus-dsd.ts — per package docs; exact export names may vary by version.
import { renderToString as modusRenderToString } from "@trimble-oss/moduswebcomponents/hydrate";
import { cache } from "react";

export const renderModusDSD = cache(async (html: string) => {
  const { html: hydrated } = await modusRenderToString(html, {
    fullDocument: false,
    serializeShadowRoot: "declarative-shadow-dom",
  });
  return hydrated;
});
```

**Hydrate addresses inside-shadow markup for HTML you pass through it. It does not replace Layers 1–4:**

- **Layer 1** still sets `data-theme` / `data-mode` on `<html>` before hydration (via **`instrumentation-client`** on React 19 + Next).
- **Layer 2** still ships tokens, light-DOM chrome, and icon fonts.
- **Layer 3** stays useful on routes or subtrees that skip DSD, during migration, and as a safety net before client upgrade for any un-upgraded host.
- **Layer 4** stays required — `'use client'` boundaries, `setAssetPath`, React 19 patch. Hydrate improves the **server HTML string**; React still hydrates client components and wires events.

Not every route needs to opt in. Balance streaming cost and pipeline complexity against shell polish.

## App Router setup (file-level)

### `app/layout.tsx` — Server Component shell

**Theme bootstrap:** use **`instrumentation-client.ts`** at the project root (see **L1**) — **no** `<script>` in this file for FOUC on **React 19**. Optionally keep **`public/theme-fouc.js`** in sync for other hosts.

```tsx
import type { Metadata } from "next";
import { Providers } from "./providers";
import "@trimble-oss/moduswebcomponents/modus-wc-styles.css";
import "./globals.css";

export const metadata: Metadata = { title: "Acme" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/modus-web-components/modus-icons.css" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-outlined/fonts/modus-icons.woff2"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-solid/fonts/modus-icons.woff2"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Root `instrumentation-client.ts`:** `import { applyModusThemeFromStorage } from "./lib/modusThemeBootstrap"; applyModusThemeFromStorage();` (see **[modus-nextjs.mdc](../../rules/modus-nextjs.md)** for full helper).

**Client shells (`AppShell`, breakpoints):** drive **`matchMedia` / min-width** with **`useSyncExternalStore`** and a **`getServerSnapshot`** that matches SSR (usually **`() => false`**). See **[modus-nextjs.mdc](../../rules/modus-nextjs.md)** — *React 19 + App Router — hydration*.

### `app/providers.tsx` — one `'use client'` file at the top of the tree, with a **mount gate**

The Modus React wrapper ships **`stencil-generated/components.server.js`** that emits **Declarative Shadow DOM** (`<template shadowrootmode="open">`) for every `<modus-wc-*>` tag via `@stencil/react-output-target/ssr` + `@trimble-oss/moduswebcomponents/hydrate`. Under Next.js 16 + React 19, `'use client'` components **still SSR**, so the server response carries full shadow trees inside every Modus tag while the client wrapper emits a bare host — a structural hydration diff. The Providers-level mount gate ships zero `<modus-wc-*>` to the server (and zero to the first client render), then swaps in the real tree after `useEffect`. See [modus-nextjs.mdc](../../rules/modus-nextjs.md) → *Hydration mismatch from Modus React wrappers*.

```tsx
"use client";

import "@/lib/shadow-dom-patch";
import { useEffect, useState } from "react";
import { ModusWcThemeProvider } from "@trimble-oss/moduswebcomponents-react";
import { setAssetPath } from "@trimble-oss/moduswebcomponents/components";

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
  return (
    <div
      aria-hidden
      className="flex h-dvh min-h-0 flex-col overflow-hidden bg-(--modus-wc-color-base-page)"
    >
      <div className="h-14 w-full shrink-0 border-b border-(--modus-wc-color-base-200) bg-(--modus-wc-color-base-100)" />
      <div className="flex min-h-0 flex-1">
        <div
          className="hidden shrink-0 border-r border-(--modus-wc-color-base-200) bg-(--modus-wc-color-base-100) lg:block"
          style={{ width: 64 }}
        />
        <div className="min-h-0 min-w-0 flex-1">{/* page skeleton */}</div>
      </div>
    </div>
  );
}
```

- Import `shadow-dom-patch` **at the top of this file**, before every Modus import. Copy [`src/utils/shadow-dom-patch.ts`](../../../src/utils/shadow-dom-patch.ts) verbatim from modus-blueprint.
- Set **`NEXT_PUBLIC_BASE_PATH`** to whatever **`basePath`** is configured in `next.config.js` so `setAssetPath` resolves icons and lazy chunks in production.
- **Do not** move the gate down into **`AppShell`'s `<main>`** — navbar and side-nav are Modus components themselves; they SSR through `components.server.js` too. The gate has to live **above** `ModusWcThemeProvider`.

### `app/globals.css` — CSS order, upgrade gap, scroll ownership

```css
modus-wc-navbar:not(:defined),
modus-wc-side-navigation:not(:defined),
modus-wc-button:not(:defined),
modus-wc-card:not(:defined),
modus-wc-typography:not(:defined),
modus-wc-icon:not(:defined),
modus-wc-badge:not(:defined),
modus-wc-chip:not(:defined) {
  visibility: hidden;
}

html,
body {
  height: 100dvh;
  margin: 0;
  overflow: hidden;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--modus-wc-color-base-page);
  color: var(--modus-wc-color-base-content);
  font-family: "Open Sans", system-ui, sans-serif;
}

body > modus-wc-theme-provider {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
}
```

Keep Tailwind imports **after** the Modus CSS import so Modus utilities do not override Tailwind unexpectedly.

### Above-the-fold skeleton (no-JS-safe)

```tsx
// app/(shell)/layout.tsx — SSR skeleton matching navbar + side-nav dimensions
import { AppShell } from "./app-shell"; // "use client"

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          gridTemplateRows: "56px 1fr",
          gridTemplateColumns: "64px 1fr",
          pointerEvents: "none",
        }}
      >
        <div style={{ gridColumn: "1 / -1", background: "var(--modus-wc-color-base-100)" }} />
        <div style={{ background: "var(--modus-wc-color-base-100)" }} />
      </div>
      <AppShell>{children}</AppShell>
    </>
  );
}
```

Measure the **real** navbar and side-nav in the deployed app and match `grid-template-rows` / `grid-template-columns` exactly. Drift here is a common CLS source.

### Using Modus React wrappers in routes

```tsx
// app/dashboard/page.tsx (Server Component)
import { Dashboard } from "./dashboard"; // "use client"

export default function Page() {
  return <Dashboard />;
}
```

```tsx
// app/dashboard/dashboard.tsx
"use client";

import {
  ModusWcCard,
  ModusWcTypography,
  ModusWcButton,
} from "@trimble-oss/moduswebcomponents-react";

export function Dashboard() {
  return (
    <ModusWcCard padding="compact">
      <ModusWcTypography slot="title" hierarchy="h4" size="md" weight="semibold" label="Revenue" />
      <ModusWcButton size="sm" onButtonClick={() => console.log("click")}>
        Refresh
      </ModusWcButton>
    </ModusWcCard>
  );
}
```

- Every Modus tag must live inside a **`'use client'`** file. Placing them in a Server Component fails silently because the custom element class is only in the client bundle.
- Events follow Modus React wrapper conventions: **`onButtonClick`**, **`onInputChange`**, **`onMainMenuOpenChange`**, etc. (see [modus-essentials.mdc](../../rules/modus-essentials.md) → Custom elements / events).

## Pages Router

The contract is the same — only the file locations change:

- **`pages/_document.tsx`:** put the FOUC script, `modus-icons.css` link, font preloads, and the Modus stylesheet link here. Use `Html`, `Head`, `Main`, `NextScript` from `next/document`.
- **`pages/_app.tsx`:** wrap with the same providers file (`Providers` is still **`'use client'`** when your project uses the `'use client'` directive in Pages Router; otherwise it is a normal React component). Apply the **React 19 shadow DOM patch** at the top.
- **`styles/globals.css`:** same `:not(:defined)` rule and scroll ownership as App Router.

Both routers: Modus tags must live in files where the custom element class is available at runtime (the entire client bundle in Pages Router).

## SSR & FOUC — what actually reaches the server response

Split the **“no server-side styling”** claim into two parts:

| Arrives with the HTML (no JS required) | Waits on `customElements.define()` in the client bundle |
| --- | --- |
| `modus-wc-styles.css` (tokens, base layout, typography, utility classes) imported from `app/layout.tsx` | Per-component shadow DOM markup |
| `modus-icons.css` + preloaded woff2 fonts | Per-component shadow styles (inside `<style>` in each shadow root) |
| Your `app/globals.css` (including the `:not(:defined)` rule and SSR skeleton) | Event wiring, imperative APIs (e.g. autocomplete `items`), default prop resolution |
| `<html>` attributes set by the FOUC script: `data-theme`, `data-mode`, resolved class | |

Layer 3 covers the right column until Layer 5 (DSD) replaces the **shadow markup/style** half with server-emitted templates.

## React 19 & shadow DOM

React 19’s reconciler asserts DOM ownership that custom elements relocate into **shadow roots** and **named slots**. Under Next.js dev with HMR (or `StrictMode` double-mount), unmount paths hit:

- `Failed to execute 'removeChild' on 'Node'`
- `The node to be removed is not a child of this node`

**Fix:** a small, guarded wrap on `Node.prototype.removeChild` and `insertBefore` that **no-ops** when the parent/child relationship React assumes is wrong. Import it **once**, at the **top** of `app/providers.tsx`, above every Modus import.

**Rules for slotted Modus hosts (avoid re-entering the failure):**

- Do **not** mount/unmount children that use **`slot="…"`** on a Modus host for UI toggles. Keep them in the tree and toggle with **`hidden`** or CSS (**`display: none`**).
- In **`<main>`**, prefer **one** main content column and swap inner content (optionally **`key={route}`**) instead of several sibling full-page stacks toggled with `hidden`. See [modus-layout.mdc](../../rules/modus-layout.md) → Route views.
- **Do not** wrap Modus subtrees in **`React.StrictMode`**. Apply `StrictMode` to non-Modus parts if desired.
- Full patterns: **[modus-wc-react-slotted-hosts](../modus-wc-react-slotted-hosts/SKILL.md)**.

## `basePath` and subpath deploys

Stencil resolves its own chunks and icon fonts relative to `setAssetPath`. Under a Next.js **`basePath`** (e.g. `/admin`) or any subpath deploy:

1. Set `basePath` in `next.config.js` (e.g. `basePath: "/admin"`).
2. Mirror it via **`NEXT_PUBLIC_BASE_PATH="/admin"`** (or whatever env value you pass to the client bundle).
3. Call **`setAssetPath(`${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`)`** in `app/providers.tsx` — the **trailing slash is required** so relative paths resolve under the app root.
4. Confirm **`/admin/build/p-*.js`** (Stencil chunks) return **200** in production DevTools → Network.

Missing or wrong paths surface as **icon tofu** and **missing modals/popovers** **in production only**.

## CSP and nonces

Under a strict **Content-Security-Policy**:

- **`script-src 'self'`** — with **Layer 1** **`instrumentation-client`**, the theme bootstrap is **bundled application JS**, not a separate inline `<script>` in `layout.tsx`. Allow your **`'self'`** Next chunks (and **`nonce-*`** only if you nonce all scripts).
- **`style-src 'self' 'unsafe-inline' fonts.googleapis.com`** — Modus ships inline styles for some dynamic tokens.
- **`font-src 'self' cdn.jsdelivr.net fonts.gstatic.com`** — or self-host the woff2 files under `/public/fonts/` and update `modus-icons.css` to your origin for **`font-src 'self'`** only.
- **`connect-src 'self'`** — extend only if you call Modus Docs MCP or similar services from the client.

## Common myths

| Claim | Reality | Why |
| --- | --- | --- |
| Web Components are incompatible with Next.js SSR. | Myth | App Router with `'use client'` boundaries renders HTML on the server and hydrates custom elements on the client. The gap between HTML arrival and element upgrade is the real issue, and Layers 1–4 address it. |
| WC require client-side JS for styling. | Partly | The Modus global stylesheet (tokens, base layout, utilities) is plain CSS and ships in the SSR response. Per-component shadow styles either wait on `customElements.define()` or arrive via DSD (L5). Global tokens and icons still come from L1–L2. |
| You will always see pop-in with Modus in Next.js. | Myth | L1 (**`instrumentation-client`** + theme on `<html>`), L2 (CSS in response), and L3 (`:not(:defined)` + skeleton) tighten the upgrade gap. |
| React 19 breaks Modus components. | Partly | The React 19 reconciler asserts DOM ownership that WC move into shadow roots. The shadow-DOM patch is a small, well-scoped fix — not a fundamental incompatibility. |
| `next/dynamic({ ssr: false })` is required to use Modus. | Myth | A `'use client'` file already prevents server rendering of Modus internals. Adding `dynamic` doubles the waterfall and delays hydration. |

## Anti-patterns (do not ship)

- Using **`next/dynamic(() => import('@trimble-oss/moduswebcomponents-react').then(m => m.ModusWcCard), { ssr: false })`** — strictly worse than a `'use client'` file.
- Placing **`<modus-wc-*>`** tags directly inside a Server Component — the custom element class only lives in the client bundle.
- Re-declaring Modus CSS variables per page to “fix” theming — set them once via `data-theme` on `<html>` and let variables cascade.
- Shadow-piercing with **`::part`** / **`::slotted`** when a documented **`customClass`** or slot exists (see [modus-essentials.mdc](../../rules/modus-essentials.md) UX defaults).
- Relying on **`useEffect`** to set `data-theme` on `<html>` for **first paint** — use **L1** **`instrumentation-client`** (mirror **`public/theme-fouc.js`**) instead.
- Wrapping the Modus subtree in **`React.StrictMode`** — dev double-mount + named slots produces `NotFoundError` on `removeChild`.
- Duplicating the navbar with a parallel non-WC React component to “fix” the gap — the SSR skeleton plus `:not(:defined)` already does this, and a parallel navbar doubles the maintenance surface.
- **`app/layout.tsx` (React 19):** theme FOUC **`<script>`** (inline or **`next/script`**) — use **`instrumentation-client.ts`** ([modus-nextjs.mdc](../../rules/modus-nextjs.md) L1).
- Setting **`setAssetPath`** inside a **Server Component** or outside the client boundary — it must run in the browser because it references `window.location`.

## Verification checklist (copy into your PR template)

1. **Install:** `@trimble-oss/moduswebcomponents-react` tag matches your React major (e.g. `*-react19` for React 19). Confirm with `npm view @trimble-oss/moduswebcomponents-react versions --json`.
2. **Layer 1:** Theme bootstrap via **`instrumentation-client.ts`** + shared helper (mirror **`public/theme-fouc.js`**). **No** theme **`<script>`** in **`app/layout.tsx`** on **React 19**. `<html>` has `data-theme`, `data-mode`, and resolved `light`/`dark` before hydration. `suppressHydrationWarning` set on `<html>` when the bootstrap also sets theme classes.
3. **Layer 2:** DevTools → Network shows `modus-wc-styles.css` (or its bundled chunk) in the **initial document’s CSS**, not a late `chunk-*.css` fetch. `modus-icons.woff2` files return **200** before first paint (preload working).
4. **Layer 3:** `:not(:defined)` rule present in `app/globals.css`. SSR skeleton covers navbar + side-nav dimensions and uses Modus CSS variables (theme-correct).
5. **Layer 4:** `'use client'` at the top of `app/providers.tsx`. React 19 shadow DOM patch imported **once**, above every Modus import. `setAssetPath` called with `origin + basePath` before `ModusWcThemeProvider`. No `React.StrictMode` around the Modus tree. **Providers-level mount gate** wraps `ModusWcThemeProvider` and the entire Modus subtree (navbar, side-nav, page content) with a token-correct HTML skeleton — confirm `grep serializeShadowRoot node_modules/@trimble-oss/moduswebcomponents-react/stencil-generated/components.server.js` shows `"declarative-shadow-dom"`, then verify SSR HTML (View Source) contains **no `<modus-wc-*>` tags**. **`'use client'`** shells: **`matchMedia`** / breakpoints use **`useSyncExternalStore`** with **`getServerSnapshot`** aligned to SSR (see [modus-nextjs.mdc](../../rules/modus-nextjs.md)).
6. **Modus tags:** every `<modus-wc-*>` lives in a `'use client'` file. No `next/dynamic({ ssr: false })` wrapping.
7. **Runtime console:** `customElements.get('modus-wc-navbar')` returns a class. If it returns `undefined`, the tag is rendering inside a Server Component.
8. **Lighthouse:** **CLS ≤ 0.05** on pages with navbar + side nav. If higher, your skeleton dimensions drift from the real navbar.
9. **Layer 5 (if adopted):** DSD helper runs before streaming; spot-check View Source / Elements for `<template shadowrootmode="open">` on shell tags you post-process.

## Common problems

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Dark-mode flashes light before hydration | Theme runs too late | Use **L1** **`instrumentation-client`**; avoid layout **`<script>`** on React 19 |
| Hydration mismatch in **`AppShell`** / breakpoint layout | **`matchMedia`** / **`window`** in **`useState`** init or brittle **`useLayoutEffect`** + **`queueMicrotask`** | Use **`useSyncExternalStore`** + **`getServerSnapshot`** ([modus-nextjs.mdc](../../rules/modus-nextjs.md) hydration section) |
| Icons are tofu boxes in production | `setAssetPath` missing or wrong `basePath` | Set `NEXT_PUBLIC_BASE_PATH`; call `setAssetPath` before provider mounts. |
| `NotFoundError` on route change or HMR | `React.StrictMode` around Modus tree, or shadow-DOM patch missing | Remove `StrictMode` around Modus subtrees; import the patch at the top of `app/providers.tsx`. |
| Navbar renders with no styles for ~200ms | Missing `:not(:defined)` rule | Add the L3 rule to `app/globals.css`. |
| `<modus-wc-card>` silently blank in SSR HTML | Rendered inside a Server Component | Move it to a `'use client'` file (or import a `'use client'` wrapper from one). |
| CLS > 0.1 on home | Skeleton dimensions drift from real navbar | Measure the deployed navbar; match `grid-template-rows` / `grid-template-columns` exactly. |
| `<main>` never scrolls in the shell | Missing `min-height: 0` chain or `body > modus-wc-theme-provider` flex styling | Apply the scroll-ownership CSS in `app/globals.css` (see above). |
| `onButtonClick` never fires | Assumed native `click` payload | Use the Modus custom event (`onButtonClick`, `onInputChange`, `onMainMenuOpenChange`, etc.). |
| CSP blocks instrumentation / bundle | Overly strict **`script-src`** | Allow **`'self'`** for your Next **chunks** (`script-src 'self' …`); theme bootstrap is **compiled JS**, not a layout `<script>` tag |
| Text inputs do not update | Reading `e.detail` as the string value | Use `e.detail?.target?.value` for Modus text inputs. |
| Modus autocomplete list never appears | Setting `items` as prop only | Set `items` **imperatively** on the element instance (ref) as well — see [modus-wc-autocomplete](../modus-wc-autocomplete/SKILL.md). |

## Integration with other blueprint guidance

- **Rule:** [modus-nextjs.mdc](../../rules/modus-nextjs.md) — the canonical five-layer contract and anti-patterns.
- **Rule:** [modus-essentials.mdc](../../rules/modus-essentials.md) — packages, events, UX defaults, navbar chrome.
- **Rule:** [modus-wc-integration.mdc](../../rules/modus-wc-integration.md) — cross-stack pitfalls (React 19 + shadow DOM, scroll ownership, MCP).
- **Rule:** [modus-layout.mdc](../../rules/modus-layout.md) — route views, card composition, page rhythm.
- **Skill:** [modus-wc-react-slotted-hosts](../modus-wc-react-slotted-hosts/SKILL.md) — slot patterns and `removeChild` avoidance.
- **Skill:** [modus-wc-side-navigation](../modus-wc-side-navigation/SKILL.md) — push-layout rail in a `'use client'` shell.
- **Skill:** [modus-wc-icons-setup](../modus-wc-icons-setup/SKILL.md) — `@font-face` + preload pattern for `modus-icons.css`.
- **Skill:** [modus-wc-mcp](../modus-wc-mcp/SKILL.md) — verify props, events, and slots against the installed package version.

## Authoring note

The rule, skill, and the blueprint’s companion page were authored in a Vite + React SPA — not a Next.js app. In that host, `modus-wc-styles.css` is injected via the module graph rather than arriving in the initial HTML, so FOUC characteristics there do not mirror a Next.js consumer exactly. To verify end-to-end, copy the snippets into a real Next.js 14+ App Router project and run **`next build && next start`**. In DevTools → Network, confirm the initial document response includes the `modus-wc-styles.css` `<link>`, that theme attributes are applied **before hydration** via **`instrumentation-client`** (React 19: **not** a layout **`<script>`**), and the `:not(:defined)` skeleton CSS is present. Then run Lighthouse and target **CLS ≤ 0.05** on chrome-heavy routes.
