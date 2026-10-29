# ASD-STE100 Skill

I love using agents to learn things, whether I'm implementing something or just studying how it works. But models love throwing around fancy vocabulary that my brain has zero chance of processing at 2am.

Inspired by [a popular tweet](https://x.com/geogristle/status/2078492579511906771) and Matt Pocock's approach to writing great skills, I built this skill to fix that: it forces responses to stay plain, direct, and readable even when I'm half-asleep.

It follows the [ASD-STE100](https://www.asd-ste100.org/) Simplified Technical English specification: one approved meaning per word, one part of speech per word, one idea per sentence. No jargon dumps. No walls of text. Just flat, unambiguous sentences you can actually parse.

## What is ASD-STE100 anyway?

Think of it as a rulebook for writing instructions that nobody can misunderstand. It came out of the European Aerospace Industry (the ASD, or AeroSpace and Defence Industries Association of Europe), where a misread sentence can literally cost lives. But the same ideas work anywhere you need writing to be crystal clear.

The rules boil down to a few simple ideas: use short sentences, stick to one meaning per word, avoid jargon, and always say things the same way. If "start" means one thing on page 3, it shouldn't mean something else on page 12.

## What it does

- **Rewrite** mode takes dense, confusing writing and transforms it into flat, simple prose
- **Check** mode flags violations and suggests fixes without changing the original text

## Install

```bash
npx skills add Ahm3tJ4f/skills --skill asd-ste100
```

## License

[MIT](../../LICENSE)
