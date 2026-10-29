# Skills

My personal collection of agent skills. I use them every day with Claude Code, Codex, Pi and other agents.

## Skills

| Skill | What it does |
|---|---|
| [asd-ste100](skills/asd-ste100) | Makes dense, confusing AI writing readable. Rewrites text into ASD-STE100 Simplified Technical English. Two modes: rewrite or check. |
| [writing-field-manuals](skills/writing-field-manuals) | Writes technical explainers as one HTML page in the style of a 1980s field manual, with Mermaid diagrams and vintage themes. |

## Install

See all skills in this repo:

```bash
npx skills add Ahm3tJ4f/skills --list
```

Install one skill:

```bash
npx skills add Ahm3tJ4f/skills --skill asd-ste100
```

Install all skills:

```bash
npx skills add Ahm3tJ4f/skills --skill '*'
```

Add `-g` to install for your user, not only for the current project.

`writing-field-manuals` uses `asd-ste100` to write its text, so install both for the best results.

## License

[MIT](LICENSE)
