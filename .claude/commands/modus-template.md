---
description: "Build a copy-paste Modus Web Components template page from a screenshot or written reference spec"
argument-hint: "<template name> | <page title> | [optional notes] | [verify: disabled|minimal|high]"
---

<!-- Thin entry point for /modus-template. Canonical Inputs contract + browser verification levels
     live in the skill's "Inputs contract" section — do not duplicate them here.
     Implementation playbook: .claude/skills/modus-template/SKILL.md + REFERENCE.md
     (Cursor copy: .cursor/skills/modus-template/).
     Sibling command copies: .cursor/commands/modus-template.md, .github/prompts/modus-template.prompt.md.
     Keep only tool-specific argument syntax in sync across the three; input rules and implementation live in the skill. -->

# Modus template page from a screenshot or reference

You are a staff frontend engineer building a **copy-paste Modus template page** for **any** Modus stack (React, Angular, Vue, or vanilla).

## Reference (required)

Attach a **screenshot** to the message, or supply a design-tool/URL link or **detailed** written layout spec. Vague descriptions are not enough — see the skill **Inputs contract** for what counts as sufficient.

## Parsing `$ARGUMENTS`

This command accepts pipe-separated positional args: `<template name> | <page title> | [optional notes] | [verify: disabled|minimal|high]`. Pipe syntax is optional — notes may contain `|`; use a `Verify:` line or the canonical handoff block (see skill) when notes are long or pipes are ambiguous. Also accept the canonical handoff block or freeform message fields.

For the full **Inputs contract** — required fields, defaults, the handoff block format, and browser verification levels — see the **modus-template** skill's **Inputs contract** section: [.claude/skills/modus-template/SKILL.md](.claude/skills/modus-template/SKILL.md). Do not proceed to code until it is satisfied.

## Workflow

**Do not write code until steps 1–2 are complete.**

1. **Read REFERENCE.md first** — read [.claude/skills/modus-template/REFERENCE.md](.claude/skills/modus-template/REFERENCE.md) (Cursor: `.cursor/skills/modus-template/REFERENCE.md`). Read the **entire** file before any file edits.
2. **Read SKILL.md second** — read [.claude/skills/modus-template/SKILL.md](.claude/skills/modus-template/SKILL.md) (Cursor: `.cursor/skills/modus-template/SKILL.md`). Read the **entire** file before any file edits.
3. Validate inputs per the skill's **Inputs contract** — do not code until a usable design reference, name, and title are confirmed.
4. Execute the skill from discovery through **Completion summary**. Apply **REFERENCE.md** for all Modus contract rules. Load per-component `modus-wc-*` skills as the playbook directs.
5. End with the skill's mandatory **Completion summary** (including **Shared project assets**).

Do not duplicate the skill or reference in your response — execute them.
