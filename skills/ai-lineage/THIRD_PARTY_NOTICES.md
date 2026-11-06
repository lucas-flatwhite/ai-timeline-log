# Third-party notices

This skill bundles the libraries and fonts below so it runs without an install step.

## Libraries (vendor/)

- harfbuzzjs 1.6.4, MIT. Source: https://github.com/harfbuzz/harfbuzzjs. License: `vendor/harfbuzzjs/LICENSE`. Files: `index.mjs`, `harfbuzz.js`, `harfbuzz.wasm`, copied unmodified from the npm package. `vendor/harfbuzzjs/package.json` (`{ "type": "module" }`) is added by this skill so that `harfbuzz.js` loads as an ES module on every supported Node version.
- HarfBuzz, "Old MIT". `harfbuzz.wasm` is HarfBuzz compiled to WebAssembly. Source: https://github.com/harfbuzz/harfbuzz. License text (its `COPYING`): `vendor/harfbuzzjs/LICENSE-HarfBuzz.txt`.
- @resvg/resvg-wasm 2.6.2, MPL-2.0. Source: https://github.com/thx/resvg-js at tag `v2.6.2` (https://github.com/thx/resvg-js/tree/v2.6.2), npm package `@resvg/resvg-wasm`. License text: `vendor/resvg/LICENSE-MPL-2.0.txt`. Files: `index.mjs`, `index_bg.wasm`, unmodified copies. The MPL-2.0 applies to these files; the corresponding source is at that tag, with the `resvg` fork named below.
- `index_bg.wasm` is Rust compiled to WebAssembly and contains the crates below. The list is read from the source paths stored in the binary; each license is the `license` field that crates.io gives for that exact version. The upstream repository does not commit a `Cargo.lock` at `v2.6.2` (the file is absent from the tag), so no lock file was available to cross-check.

| Crate | Version | License (crates.io) |
| --- | --- | --- |
| adler32 | 1.2.0 | Zlib |
| alloc-no-stdlib | 2.0.4 | BSD-3-Clause |
| arrayvec | 0.7.4 | MIT OR Apache-2.0 |
| base64 | 0.21.7 | MIT OR Apache-2.0 |
| bitvec | 1.0.1 | MIT |
| brotli-decompressor | 2.5.1 | BSD-3-Clause/MIT |
| bytemuck | 1.15.0 | Zlib OR Apache-2.0 OR MIT |
| bytes | 1.6.0 | MIT |
| data-url | 0.2.0 | MIT OR Apache-2.0 |
| deflate | 1.0.0 | MIT/Apache-2.0 |
| flate2 | 1.0.28 | MIT OR Apache-2.0 |
| fontdb | 0.14.1 | MIT |
| gif | 0.12.0 | MIT/Apache-2.0 |
| imagesize | 0.12.0 | MIT |
| jpeg-decoder | 0.3.1 | MIT OR Apache-2.0 |
| kurbo | 0.9.5 | MIT/Apache-2.0 |
| miniz_oxide | 0.5.4 | MIT OR Zlib OR Apache-2.0 |
| miniz_oxide | 0.7.2 | MIT OR Zlib OR Apache-2.0 |
| pathfinder_content | 0.5.0 | MIT/Apache-2.0 |
| png | 0.17.5 | MIT OR Apache-2.0 |
| rctree | 0.5.0 | MIT |
| roxmltree | 0.18.1 | MIT OR Apache-2.0 |
| rustybuzz | 0.7.0 | MIT |
| serde_json | 1.0.115 | MIT OR Apache-2.0 |
| simplecss | 0.2.1 | MIT/Apache-2.0 |
| slotmap | 1.0.7 | Zlib |
| smallvec | 1.13.2 | MIT OR Apache-2.0 |
| svgtypes | 0.11.0 | MIT/Apache-2.0 |
| svgtypes | 0.14.0 | MIT/Apache-2.0 |
| tiny-skia | 0.10.0 | BSD-3-Clause |
| tiny-skia-path | 0.10.0 | BSD-3-Clause |
| tinyvec | 1.6.0 | Zlib OR Apache-2.0 OR MIT |
| ttf-parser | 0.18.1 | MIT OR Apache-2.0 |
| unicode-bidi | 0.3.15 | MIT OR Apache-2.0 |
| unicode-general-category | 0.6.0 | Apache-2.0 |
| weezl | 0.1.8 | MIT OR Apache-2.0 |
| woff2 | 0.3.0 (git 88cce4c) | Apache-2.0 |
| xmlparser | 0.13.6 | MIT/Apache-2.0 |
| xmlwriter | 0.1.0 | MIT |

Not confirmed from a registry:

- `resvg` (with its `usvg` crates): taken from the git fork https://github.com/zimond/resvg at commit `3495d87`, as named in the `[patch.crates-io]` section of the upstream `Cargo.toml`. The fork's `crates/resvg/Cargo.toml` and its repository state MPL-2.0 (version 0.34.1). I did not check every sub-crate of the fork one by one.
- `woff2`: linked from the git fork https://github.com/yisibl/woff2-rs at commit `88cce4c` (branch `fix-total-compressed-size` in `[patch.crates-io]`), licensed under Apache-2.0.
- `wasm-bindgen`, `js-sys`, `log`, `thiserror`, `serde` and the Rust standard library (MIT OR Apache-2.0 upstream) appear in the dependency list or the binary, but their exact versions were not read from the binary, so they are not in the table.
- License texts and copyright notices for the crates in `index_bg.wasm`: `vendor/resvg/LICENSE-MPL-2.0.txt` (MPL-2.0), `vendor/resvg/LICENSE-Apache-2.0.txt` (Apache-2.0), `vendor/resvg/LICENSE-tiny-skia.txt` (tiny-skia BSD-3-Clause, taken from https://github.com/RazrFalcon/tiny-skia at tag `v0.10.0`), and `vendor/resvg/LICENSE-MIT-BSD-Zlib.txt` (MIT, BSD-3-Clause, and Zlib license texts and copyright notices).

`npm run lineage:vendor` in the ai-timeline-log repository copies these files from `node_modules`.

## Fonts (fonts/)

All three fonts are licensed under the SIL Open Font License 1.1 and are not modified. The license text sits next to each font. They were downloaded from google/fonts at commit `eb20e9cf19d97cf579fa3867d729d4222d6c59e1`.

| File | Family | License text | Source URL | sha256 |
| --- | --- | --- | --- | --- |
| `BlackHanSans-Regular.ttf` | Black Han Sans | `OFL-BlackHanSans.txt` | https://raw.githubusercontent.com/google/fonts/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl/blackhansans/BlackHanSans-Regular.ttf | 31960809284026681774a8e52dc19ebcad26cf69b0ad9d560f288296fbb52739 |
| `Hahmlet-wght.ttf` | Hahmlet (variable) | `OFL-Hahmlet.txt` | https://raw.githubusercontent.com/google/fonts/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl/hahmlet/Hahmlet%5Bwght%5D.ttf | 892bffe530255770a7435226154a02f519055ff6bedf64254f37f21d15a59279 |
| `IBMPlexMono-Regular.ttf` | IBM Plex Mono | `OFL-IBMPlexMono.txt` | https://raw.githubusercontent.com/google/fonts/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl/ibmplexmono/IBMPlexMono-Regular.ttf | 6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46 |

`Hahmlet-wght.ttf` is the upstream file `Hahmlet[wght].ttf` with only its file name changed (brackets removed). The font data is identical.
