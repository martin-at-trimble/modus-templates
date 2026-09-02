# Agent instructions

When building a new Modus template page from a screenshot or other reference, run
**`/modus-template`** (or equivalent) and follow the workflow in:

- Command: `.cursor/commands/modus-template.md` or `.claude/commands/modus-template.md`
- Skill (read **before coding**): `.cursor/skills/modus-template/SKILL.md` or
  `.claude/skills/modus-template/SKILL.md`

The skill's **Inputs contract** is canonical for required inputs and verify levels. Project
`modus-*.md` rules outrank generic prompt text when they conflict.

After editing command or skill copies, run `npm run check:modus-template-sync`.
