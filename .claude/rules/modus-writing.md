<!-- Claude Code: save as `.claude/rules/modus-writing.md` or merge sections into CLAUDE.md. -->
# Modus — writing guidelines

Use this alongside [modus-essentials.md](./modus-essentials.md) (UX defaults, button labels) and [modus-typography.md](./modus-typography.md) (visual hierarchy). **This file** is the reference for **words**: voice, tone, style, and microcopy. Source: Foundations → **Writing Style** (`/foundations/writing-style`).

Every word counts. Users scan more than they read. Visual components and text support each other.

## Principles

Write copy that is:

- **Clear** — Simple language and sentence structure. No jargon or discriminatory language.
- **Concise** — Meaningful, laconic, focused on the goal. Avoid redundancy, deadwood phrases, phrasal verbs, and extra modifiers.
- **Useful** — Give users the information they need to complete the interaction.
- **Consistent** — Same style, tone, voice, and terminology throughout the product.

Before writing, know the audience: who the users are, what they know, how they will use the information, and what they will ask. Prefer language they already use. Support mixed cognitive styles (text, graphics, or both).

Organize content so users can find functions, menus, commands, and fields without hunting.

## Voice

Brand voice is **what** you say. Tone is **how** you say it. Trimble’s voice comes from **Life’s Work**: speak about the **user first**, Trimble second as enabling support. Listen first, then solve.

Voice projects **empathy**, **confidence**, and **pride**.

| Attribute | Our voice is | Our voice is not |
|---|---|---|
| **Empathy** | Humane and generous; forthcoming with knowledge; that of a partner | Pitying; judgemental; too technical |
| **Confidence** | Benefit-driven; knowledgeable; humble | Boastful; over-promising; dismissive |
| **Pride** | Celebratory of customer success; supportive; encouraging | Self-congratulatory; condescending; detached |

Persona: a trusted expert who is approachable—authoritative, never condescending. Explain complex ideas simply.

## Tone

Voice stays consistent. Tone adapts to context and the user’s emotional state.

| Context | Tone | Example |
|---|---|---|
| Informational | Clear, direct, and helpful | To save your changes, click the Save button. |
| Success | Positive and encouraging | Your changes have been saved successfully. |
| Warning | Cautious but not alarming | This action will permanently delete your data. |
| Error | Empathetic and solution-focused | We couldn't save your changes. Please check your connection and try again. |

### Product content

- Focus on user benefits, not features.
- Use active voice and present tense.
- Be direct and get to the point quickly.
- Avoid marketing language in UI copy.
- Test content with real users.

### Microcopy

Button labels, **form labels** (field names, `label` / `labelText` on inputs, select options used as labels), errors, helper text, tooltips, and similar short strings:

- Be specific and actionable.
- Use plain language.
- Keep it short—every word should earn its place.
- Match the user’s mental model.
- Provide context when needed.
- **Use sentence case** — capitalize only the first word and proper nouns or acronyms (Modus, Trimble, GitHub, AI, JSON). Do not use title case on multi-word labels.

**Button and form labels — sentence case (required)**

| Do | Don't |
|---|---|
| Save changes | Save Changes |
| Start course | Start Course |
| Email address | Email Address |
| Browse components | Browse Components |
| Open modal | Open Modal |

- **Buttons:** `ModusWcButton` children, modal footer actions, CTAs (`ctaLabel`), and icon-only `aria-label` values on buttons.
- **Forms:** `modus-wc-text-input` / `ModusWcTextInput` `label`, `ModusWcInputLabel` `labelText`, checkbox/switch/radio labels, and comparable props on other form controls — same sentence-case rule as buttons.
- **Single-word labels** still capitalize the first letter: **Save**, **Cancel**, **Delete**.
- **Proper nouns and product names** stay capitalized mid-label: **Browse Modus AI**, **Log in with Trimble ID**, **Export JSON**.

Headings, page titles, and navigation group titles may use title case per **Capitalization** below; that does not apply to button or form field labels.

## Style guide

### Abbreviations

Use only common abbreviations, or ones you are sure readers will understand. Spell out the term on first use and put the abbreviation in parentheses after it. Choose **a** / **an** by how the abbreviation is spoken. Use recognized abbreviations; do not invent them.

### Ampersand

Do not replace **and** with **&** in paragraph text. Ampersands are allowed in titles, navigation, or tables to save space.

### Capitalization

Avoid unnecessary capitals. Do not capitalize words unless they start sentences, list items, headings, subheads, captions, or similar. All capitals may distinguish copy in a **designed document**.

**Do capitalize**

- The first letter of a line in a bulleted list, unless the item continues the stem (intro) phrase
- Proper nouns and proper names
- **Modus Design System** — title case when naming the product (headings, hero titles, official references). In running prose you may still write “the Modus design system” when describing the concept generically.
- Formal titles that come **before** a name: Trimble CEO, Rob Painter

**Do not capitalize**

- Email addresses or website URLs: `first.last@trimble.com`, `trimble.com`
- Before noon / after noon: **7 am**, **12 pm**
- Job descriptions: “Trimble Novapoint helps civil engineers build complex models efficiently.”
- Formal titles on their own or **after** a name: The project manager said to schedule a meeting; Ellen Ripley is the chief operating officer.
- Former proper nouns that are now common: email, website, internet, online
- Words that are important but not proper nouns (marketing department, a genius idea, our new sales strategy). A proper noun must explicitly refer to a person, place, or thing.
- **Mid-word capitals on button or form labels** — use sentence case instead (see **Button and form labels — sentence case** under Microcopy): **Save changes**, not **Save Changes**; **Project name**, not **Project Name**.

### Colons

A colon introduces a series. Use a colon to separate elements in a title or heading. Do not use a colon if a preposition or verb already precedes the series. After a colon inside a sentence, the next word is lowercase unless it is a proper noun.

### Commas

- Separate introductory phrases or clauses from the rest of the sentence.
- Use a comma between independent clauses joined by a conjunction when they have separate subjects.
- Use the Oxford (serial) comma when listing three or more elements.
- Comma before a nonrestrictive clause introduced by **which**.
- No comma before a restrictive clause introduced by **that**.

### Compound words

Open (ice cream), closed (flowchart), or hyphenated (left-hand).

- Open: adverb ending in **-ly** + participle (poorly organized plan)
- Closed: most nouns with out, off, down, or up (backup, readout)
- Hyphenated: compound adjectives before a noun (real-time data)

### Currency

Symbol before the number, no space: **$100**, **€100**. Thousands separators: **$1,000,000**.

### Dashes

- Em dash (—) sets off an interrupting phrase or clause.
- En dash (–) marks a range of numbers, dates, or times (2020–2023).
- No spaces around em or en dashes.

### Dates

Stay consistent in a product. US: Month Day, Year (January 15, 2024). International: Day Month Year (15 January 2024) or ISO (`2024-01-15`). Spell out months in running text; abbreviate only when space is limited.

### Ellipses

Use an ellipsis (…) for an ongoing process (**Loading…**) or a menu item that opens a dialog. Do not overuse in UI text.

### Lists

Bullets for unordered items; numbers for steps or ranked items. Keep items parallel. Punctuate consistently.

### Parentheses

Supplementary or explanatory information. Period **outside** when the parenthetical is part of a larger sentence; **inside** when the parenthetical is a complete sentence on its own. Avoid nested parentheses.

### Quotation marks

Enclose direct quotations and titles of short works. Commas and periods **inside**; colons and semicolons **outside**. Single quotes for quotes within quotes.

### Semicolons

Join two independent clauses not connected by a conjunction. Separate list items that already contain commas. Do not use a semicolon before a conjunction.

## Microcopy examples

| Element | Do | Don't | Why |
|---|---|---|---|
| Button labels | Save changes | Save Changes; Click Here to Save | Sentence case; specific and action-oriented |
| Form field labels | Email address | Email Address | Sentence case; plain field names |
| Error messages | Enter a valid email address | Error: Invalid input | Tell users what to do |
| Empty states | No projects yet. Create your first project to get started. | No data available | Guide the next step |
| Confirmations | Delete this file? This action cannot be undone. | Are you sure? | Name the consequences |

**Form validation:** not “Error 422: The value entered in the field does not conform to the expected format specifications.” → “Please enter a valid phone number (e.g., 555-123-4567).”

**Success:** not “Operation completed successfully.” → “Your project has been saved. You can find it in your Projects folder.”

## Also consider

- Plan for localization and translation from the start.
- Avoid idioms, slang, and culturally specific references.
- Use inclusive language.
- Meet accessibility needs for screen readers ([modus-accessibility.md](./modus-accessibility.md)).
- Test copy across devices and screen sizes.
- Stay consistent with existing product terminology.
