---
description: Build a copy-paste Modus Web Components template page from a screenshot or written reference spec
argument-hint: "<template name> | <page title> | [optional notes] | [verify: disabled|minimal|high]"
---

<!-- Thin entry point for /modus-template. Canonical Inputs contract + browser verification levels
     live in the skill's "Inputs contract" section — do not duplicate them here.
     Implementation playbook: .cursor/skills/modus-template/SKILL.md + REFERENCE.md
     (Claude copy: .claude/skills/modus-template/).
     Sibling command copies: .claude/commands/modus-template.md, .github/prompts/modus-template.prompt.md.
     Keep only tool-specific argument syntax in sync across the three; input rules and implementation live in the skill. -->

# Modus template page from a screenshot or reference

You are a staff frontend engineer building a **copy-paste Modus template page** for **any** Modus stack (React, Angular, Vue, or vanilla).

## Reference (required)

Attach a **screenshot** to the message, or supply a design-tool/URL link or **detailed** written layout spec. Vague descriptions are not enough — see the skill **Inputs contract** for what counts as sufficient.

## Parsing input

Accept whatever the tool provides: freeform message text, or the canonical handoff block pasted into the message body:

```text
Reference: screenshot attached | design-tool/URL link | detailed written layout spec
Template name: …
Page title: …
Notes: …
Verify: minimal
```

Pipe-separated args (`name | title | notes`) are also accepted but **not required** — notes may contain `|`; use an explicit `Verify:` line when notes are long or pipes are ambiguous.

For the full **Inputs contract** — required fields, defaults, and browser verification levels — see the **modus-template** skill's **Inputs contract** section: [.cursor/skills/modus-template/SKILL.md](.cursor/skills/modus-template/SKILL.md) (or `.claude/skills/modus-template/SKILL.md` in Claude Code). Do not proceed to code until it is satisfied.

## Workflow

**Do not write code until steps 1–2 are complete.**

1. **Read REFERENCE.md first** — use the Read tool on [.cursor/skills/modus-template/REFERENCE.md](.cursor/skills/modus-template/REFERENCE.md) (Claude Code: `.claude/skills/modus-template/REFERENCE.md`). Read the **entire** file before any file edits.
2. **Read SKILL.md second** — use the Read tool on [.cursor/skills/modus-template/SKILL.md](.cursor/skills/modus-template/SKILL.md) (Claude Code: `.claude/skills/modus-template/SKILL.md`). Read the **entire** file before any file edits.
3. Validate inputs per the skill's **Inputs contract** — do not code until a usable design reference, name, and title are confirmed.
4. Execute the skill from discovery through **Completion summary**. Apply **[REFERENCE.md](.cursor/skills/modus-template/REFERENCE.md)** for all Modus contract rules. Load per-component `modus-wc-*` skills as the playbook directs.
5. End with the skill's mandatory **Completion summary** (including **Shared project assets**).

Do not duplicate the skill or reference in your response — execute them.
