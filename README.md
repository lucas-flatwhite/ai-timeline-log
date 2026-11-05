# AI Timeline Log

English | [한국어](README.ko.md)

A timeline of generative AI since ChatGPT launched on November 30, 2022. Events appear in date order with links to their sources, so you can read what happened and check the original material.

[Read the timeline](https://lucasflatwhite.com/ai-timeline-log/) · [한국어로 읽기](https://lucasflatwhite.com/ai-timeline-log/ko/)

## What you'll find

- A wall of black-and-white woodcut boxes, newest first. Open a box for the story and its sources, or follow a topic across scenes.
- Each scene is written in English and Korean. Factual corrections are recorded in the scene.
- Printable edition posters in [Releases](https://github.com/lucas-flatwhite/ai-timeline-log/releases), plus JSON, RSS and plain-text exports for reading elsewhere.

The timeline focuses on events that shaped generative AI. Dates and claims are checked against company announcements, papers and other primary sources. Found a mistake or a missing event? [Open an issue](https://github.com/lucas-flatwhite/ai-timeline-log/issues/new/choose) with a source.

## Lineage skill

The `ai-lineage` skill is a separate, installable agent skill. It researches where an AI technique came from and draws a sourced lineage chart (PNG, SVG, PDF, Mermaid and a source list). Every box carries a source, and a source the agent could not open is marked "not verified".

```bash
npx skills add lucas-flatwhite/ai-timeline-log --skill ai-lineage -g
```

Details are in [`skills/ai-lineage`](skills/ai-lineage).

## Run locally

Built with Astro and TypeScript, with scenes stored as YAML. Requires Node.js 22.22 or later.

```sh
npm install
npm run dev          # http://localhost:4321/ai-timeline-log/
```

```sh
npm run check
npm test
npm run build
npm run budget
npx playwright install chromium webkit
npm run test:e2e
```

English lives at `/ai-timeline-log/`, Korean at `/ai-timeline-log/ko/`. The site remembers your language choice. GitHub Actions runs the checks and browser tests on PRs. See [AGENTS.md](AGENTS.md) for content editing, corrections and research, and `.agents/skills/` for the poster and picture steps.

## License

Code: [MIT](LICENSE). Timeline content in `content/`: [CC BY 4.0](content/LICENSE).
