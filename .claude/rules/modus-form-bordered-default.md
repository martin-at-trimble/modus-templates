<!-- Claude Code: save as `.claude/rules/modus-form-bordered-default.md` or merge sections into CLAUDE.md. -->
# Modus form fields — bordered by default

Modus form components use the boolean prop **`bordered`** (HTML / Lit: **`bordered`**; React wrappers: **`bordered={true}`**). **Always treat visible bordered chrome as the default** for **`modus-wc-text-input`**, **`modus-wc-textarea`**, **`modus-wc-number-input`**, **`modus-wc-select`**, **`modus-wc-date`**, **`modus-wc-time-input`**, and any other control that exposes **`bordered`** in **Modus Docs MCP** for your installed **`version`**.

- **Omit** **`bordered`** (package default is **`true`**) or set **`bordered={true}`** so the control boundary and focus ring stay clear everywhere: forms, dialogs, settings, **dashboard / analytics pages**, card headers and toolbars, filter rows, and page heroes.
- **Do not** set **`bordered={false}`** on these controls **to reduce visual weight or save space** in dense layouts, dashboard toolbars, KPI bands, or “signals & filters” rows. Density should come from **`size`**, spacing, grouping, and composition—not borderless fields.

## Inline editing (allowed exception)

Inside **`modus-wc-table`** cells and other **dense grid / inline edit** rows, **`modus-wc-text-input`**, **`modus-wc-select`**, and peers **may** use **`bordered={false}`** when it prevents **double-stacked** field chrome on top of row or cell lines. Prefer **`bordered={true}`** (or omit) when the inline field still reads clearly with borders. **Do not** stretch this pattern to standalone pickers (**`modus-wc-date`**, **`modus-wc-time-input`**, primary form columns, or dashboard filter toolbars)—those stay bordered per above.

**Related:** **`modus-wc-card`** uses a **parent vs child** border default — **parent** cards **`bordered={true}`**, **nested child** cards **`bordered={false}`** — that is **cards**, not inputs (see below).

## Distinct from cards

**`modus-wc-card`** also has **`bordered`**, but card scaffolding follows **parent `bordered={true}` / nested child `bordered={false}`** per [modus-components-patterns.md](./modus-components-patterns.md) → **Cards**. Do not reuse card border defaults for form controls.

For events, options, and **`inputChange`** handling, still follow [modus-components-patterns.md](./modus-components-patterns.md) → **Form Elements** and the **modus-wc-form-inputs** skill.
