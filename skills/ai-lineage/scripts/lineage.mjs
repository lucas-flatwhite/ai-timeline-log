#!/usr/bin/env node
// 명령 줄: `check <file>`와 `draw <file>`. 모든 파일을 import.meta.url 기준으로 찾으므로 어느 폴더에서 돌려도 된다.
import { readFileSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { validate } from './lib/schema.mjs';
import { layout } from './lib/layout.mjs';
import { loadFonts } from './lib/fonts.mjs';
import { toSvg } from './lib/svg.mjs';
import { toPng } from './lib/png.mjs';
import { toPdf } from './lib/pdf.mjs';
import { toMermaid } from './lib/mermaid.mjs';
import { toSourcesMd } from './lib/sources.mjs';
import { STYLES } from './lib/styles.mjs';

const USAGE = `usage:
  node lineage.mjs check <file>
  node lineage.mjs draw <file> [--style woodcut|soft|proof] [--no-credit] [--portrait] [--out <dir>]`;

class UsageError extends Error {}

/** @param {string} file */
function readData(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    throw new UsageError(`cannot read ${file}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new UsageError(`${file} is not valid JSON: ${/** @type {Error} */ (e).message}`);
  }
}

/** @param {string} name */
const slugOf = (name) => name.replace(/\.lineage\.json$/, '').replace(/\.json$/, '');

/**
 * @param {string[]} argv arguments after the script name
 * @returns {Promise<number>} exit code
 */
export async function main(argv) {
  try {
    return await run(argv);
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`error: ${e.message}\n${USAGE}`);
      return 2;
    }
    // Not a data problem: exit 3 so it is not mistaken for check errors (exit 1).
    console.error(`internal error: ${/** @type {Error} */ (e)?.message ?? e}`);
    return 3;
  }
}

/** @param {string[]} argv */
async function run(argv) {
  /** @type {ReturnType<typeof parseArgs>} */
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        style: { type: 'string' },
        'no-credit': { type: 'boolean' },
        portrait: { type: 'boolean' },
        out: { type: 'string' },
      },
    });
  } catch (e) {
    throw new UsageError(/** @type {Error} */ (e).message);
  }
  const [command, file, ...extra] = parsed.positionals;
  const o = /** @type {Record<string, any>} */ (parsed.values);
  if (command !== 'check' && command !== 'draw') throw new UsageError(command ? `unknown command ${command}` : 'missing command');
  if (!file || extra.length) throw new UsageError('expected exactly one data file');
  if (command === 'check' && (o.style || o['no-credit'] || o.portrait || o.out)) {
    throw new UsageError('check takes no options');
  }
  // layout falls back to woodcut for an unknown style, so reject it here.
  if (o.style !== undefined && !Object.hasOwn(STYLES, o.style)) {
    throw new UsageError(`unknown style ${o.style} (use ${Object.keys(STYLES).join(', ')})`);
  }

  const path = resolve(file);
  const data = readData(path);
  const style = o.style ?? data?.style ?? 'woodcut';
  const credit = o['no-credit'] ? false : (data?.credit ?? true);
  const portrait = command === 'draw' && !!o.portrait;

  const { errors: valErrors, warnings } = validate(data);
  for (const w of warnings) console.error(`warning: ${w}`);
  if (valErrors.length) {
    for (const e of [...new Set(valErrors)]) console.error(`error: ${e}`);
    return 1;
  }

  const fonts = await loadFonts();
  const land = layout(data, fonts, { style, credit, portrait: false });
  const port = portrait && land.errors.length === 0 ? layout(data, fonts, { style, credit, portrait: true }) : null;
  const errors = [...land.errors, ...(port?.errors ?? [])];
  if (errors.length) {
    for (const e of [...new Set(errors)]) console.error(`error: ${e}`);
    return 1;
  }
  if (command === 'check') return 0;

  // Compute every output first, then write, so a failure leaves nothing behind.
  const scene = land.scene;
  const svg = toSvg(scene);
  const slug = slugOf(basename(path));
  /** @type {[string, string | Uint8Array][]} */
  const files = [
    [`${slug}.png`, await toPng(svg)],
    [`${slug}.svg`, svg],
    [`${slug}.pdf`, toPdf(scene)],
    [`${slug}.mmd`, toMermaid(data)],
    [`${slug}.sources.md`, toSourcesMd(data)],
  ];
  if (port) {
    files.push([`${slug}.portrait.png`, await toPng(toSvg(port.scene))]);
  }

  const dir = o.out ? resolve(o.out) : dirname(path);
  mkdirSync(dir, { recursive: true });
  for (const [name, body] of files) {
    writeFileSync(join(dir, name), body);
    console.log(join(dir, name));
  }
  return 0;
}

// Direct run: compare real paths so spaces and relative invocations work.
try {
  if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
    process.exitCode = await main(process.argv.slice(2));
  }
} catch (e) {
  console.error(`internal error: ${/** @type {Error} */ (e)?.message ?? e}`);
  process.exitCode = 3;
}
