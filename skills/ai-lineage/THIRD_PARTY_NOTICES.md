# Third-party notices

This skill bundles the libraries and fonts below so it runs without an install step.

## Libraries (vendor/)

- harfbuzzjs 1.6.4, MIT. Source: https://github.com/harfbuzz/harfbuzzjs. License: `vendor/harfbuzzjs/LICENSE`. Files: `index.mjs`, `harfbuzz.js`, `harfbuzz.wasm`, copied unmodified from the npm package.
- @resvg/resvg-wasm 2.6.2, MPL-2.0. Source: https://github.com/thx/resvg-js (npm package `@resvg/resvg-wasm`). License text: `vendor/resvg/LICENSE-MPL-2.0.txt`. Files: `index.mjs`, `index_bg.wasm`, unmodified copies. The MPL-2.0 applies to these files; to get the corresponding source, use the repository above.

`npm run lineage:vendor` in the ai-timeline-log repository copies these files from `node_modules`.

## Fonts (fonts/)

All three fonts are licensed under the SIL Open Font License 1.1 and are not modified. The license text sits next to each font. They were downloaded from google/fonts at commit `eb20e9cf19d97cf579fa3867d729d4222d6c59e1`.

| File | Family | License text | Source URL | sha256 |
| --- | --- | --- | --- | --- |
| `BlackHanSans-Regular.ttf` | Black Han Sans | `OFL-BlackHanSans.txt` | https://raw.githubusercontent.com/google/fonts/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl/blackhansans/BlackHanSans-Regular.ttf | 31960809284026681774a8e52dc19ebcad26cf69b0ad9d560f288296fbb52739 |
| `Hahmlet-wght.ttf` | Hahmlet (variable) | `OFL-Hahmlet.txt` | https://raw.githubusercontent.com/google/fonts/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl/hahmlet/Hahmlet%5Bwght%5D.ttf | 892bffe530255770a7435226154a02f519055ff6bedf64254f37f21d15a59279 |
| `IBMPlexMono-Regular.ttf` | IBM Plex Mono | `OFL-IBMPlexMono.txt` | https://raw.githubusercontent.com/google/fonts/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl/ibmplexmono/IBMPlexMono-Regular.ttf | 6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46 |

`Hahmlet-wght.ttf` is the upstream file `Hahmlet[wght].ttf` with only its file name changed (brackets removed). The font data is identical.
