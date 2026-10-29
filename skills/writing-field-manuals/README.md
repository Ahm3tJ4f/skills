# Writing field manuals

Writes technical explanations as one HTML page that looks like a 1980s or 1990s field manual: numbered figures and tables, Caution and Note boxes, Mermaid diagrams, and light or dark vintage themes.

A build script checks the structure, the words and the diagrams. It tells the agent how to fix each error, so the page comes out clean.

For instance, ask: "Explain the N+1 query problem as a lesson. Use the microfilm theme."

It can write six types of documents: explainer, lesson, decision record, comparison, procedure, and incident report.

## Install

```bash
npx skills add ahm3tj4f/skills --skill writing-field-manuals --skill asd-ste100
```

The text is written in Simplified Technical English with the `asd-ste100` skill. Without it, the skill uses its own short rules.

## Requirements

- Node.js 20 or later
- [agent-browser](https://github.com/vercel-labs/agent-browser) CLI (optional, for the render check and screenshots)

## Credits

Diagrams are rendered by Pele by kepano (MIT). See [scripts/vendor/PELE-LICENSE](scripts/vendor/PELE-LICENSE).

## License

[MIT](../../LICENSE)
