# AI Timeline Log

English | [한국어](README.ko.md)

An ongoing log of the moments that shaped generative AI, starting with ChatGPT's launch on November 30, 2022. It keeps events and their sources in one place, so you can follow how things unfolded without piecing together old announcements.

[Read the timeline](https://www.lucasflatwhite.com/ai-timeline-log/) · [한국어로 읽기](https://www.lucasflatwhite.com/ai-timeline-log/ko/)

## What you'll find

- A wall of black-and-white woodcut boxes, newest first. Open a box for the story and its sources, or follow a topic across scenes.
- English and Korean editions, written together from the same facts. Factual corrections stay recorded with each scene.
- Printable edition posters in [Releases](https://github.com/lucas-flatwhite/ai-timeline-log/releases), plus JSON, RSS and plain-text exports for reading elsewhere.

Events are chosen for how they changed the course of generative AI. Dates and claims are checked against company announcements, papers and other primary sources. Found a mistake or a missing event? [Open an issue](https://github.com/lucas-flatwhite/ai-timeline-log/issues/new/choose) with a source.

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

English lives at `/ai-timeline-log/`, Korean at `/ai-timeline-log/ko/`. The site remembers your language choice. GitHub Actions runs the checks and browser tests on PRs. See [CLAUDE.md](CLAUDE.md) for content editing, corrections and poster commands.

## License

Code: [MIT](LICENSE). Timeline content in `content/`: [CC BY 4.0](content/LICENSE).
