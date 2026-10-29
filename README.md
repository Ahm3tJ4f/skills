# Skills

My personal collection of agent skills.

## Skills

| Skill | What it does |
|---|---|
| [asd-ste100](skills/asd-ste100) | Makes dense, confusing AI writing readable. Rewrites text into ASD-STE100 Simplified Technical English. Two modes: rewrite or check. |
| [writing-field-manuals](skills/writing-field-manuals) | Writes technical explainers as one HTML page in the style of a 1980s field manual, with Mermaid diagrams and vintage themes. Diagrams are rendered by [Pele](https://github.com/obsidianmd/pele), which comes bundled with the skill. |

## Install

See all skills in this repo:

```bash
npx skills add ahm3tj4f/skills --list
```

Install one skill:

```bash
npx skills add ahm3tj4f/skills --skill asd-ste100
```

Install all skills:

```bash
npx skills add ahm3tj4f/skills --skill '*'
```

`writing-field-manuals` uses `asd-ste100` to write its text, so install both for the best results.

## License

[MIT](LICENSE)
