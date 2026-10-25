/* 첫 화면 성능을 잰다: 느린 휴대폰 흉내(CPU 4배 느리게, 지연 150ms, 1.6Mbps)에서
   화면 안 .box:not(.off)가 모두 .carved가 된 시각(performance.now())을 390×844, 1440×900에서 3회씩 재고 중앙값을 낸다.
   기기 배율은 2다(휴대폰은 2배 이상이고 판은 기기 화소로 새긴다). 목표를 넘으면 OVER를 적되 종료 코드는 0이다.
   기본은 미리보기 서버(npx astro preview --port 4321, HTTP/1.1)를 잰다.
   --h2: dist/를 자체 서명 인증서의 HTTP/2 서버로 직접 내주고 잰다(실제 호스팅처럼). 인증서는 임시 폴더에 만들고 지운다.
   사용: node scripts/perf.ts [--locale ko|en] [--h2] */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createSecureServer, type Http2SecureServer } from 'node:http2';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { chromium, type Browser } from '@playwright/test';

const BASE = '/ai-timeline-log/';
const PREVIEW = 'http://localhost:4321';
const H2_PORT = 4322;
const RUNS = 3;
const DPR = 2;
const NET = { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 };
const CPU = 4;
const VIEWS = [
  { width: 390, height: 844, target: 1500 },
  { width: 1440, height: 900, target: 2000 },
];

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const locale = opt('--locale') ?? 'ko';
const h2 = args.includes('--h2');
if (locale !== 'ko' && locale !== 'en') { console.error(`--locale은 ko 또는 en입니다: ${locale}`); process.exit(2); }

const root = new URL('..', import.meta.url);
const dist = fileURLToPath(new URL('dist/', root));   // 끝이 /로 끝난다

/* 영어 사이트 글이 아직 없으면 /en/은 한국어로 보내는 페이지일 뿐이다. 잴 것이 없다 */
if (locale === 'en') {
  const plate = new URL('src/generated/plate.json', root);
  const has = existsSync(plate) && 'en' in JSON.parse(readFileSync(plate, 'utf8'));
  if (!has) { console.log('en 판 글꼴이 없습니다(site.en 없음). /en/은 한국어로 보내기만 하므로 재지 않습니다.'); process.exit(0); }
}

/* --h2: base 경로를 벗겨 dist/의 파일로 매핑한다. 폴더는 index.html, dist 밖으로 나가는 경로는 404.
   실제 호스팅과 미리보기 서버처럼 글(html·js·css·json·svg)은 gzip으로 보낸다 */
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon',
};
const TEXT = new Set(['.html', '.js', '.css', '.json', '.svg']);
function serveH2(): { server: Http2SecureServer; cleanup: () => void } {
  if (!existsSync(join(dist, 'index.html'))) { console.error('dist/가 없습니다. 먼저 npm run build를 실행하세요.'); process.exit(2); }
  const dir = mkdtempSync(join(tmpdir(), 'perf-h2-'));
  const key = join(dir, 'key.pem'), cert = join(dir, 'cert.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1',
    '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost'], { stdio: 'ignore' });
  const server = createSecureServer({ key: readFileSync(key), cert: readFileSync(cert) }, (req, res) => {
    const miss = () => { res.writeHead(404); res.end(); };
    let url: string;
    try { url = decodeURIComponent((req.url ?? '/').split('?')[0]!); } catch { return miss(); }
    if (!url.startsWith(BASE)) return miss();
    let f = normalize(join(dist, url.slice(BASE.length)));
    if (!f.startsWith(dist)) return miss();
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
    if (!existsSync(f)) return miss();
    const gz = TEXT.has(extname(f)) && /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? ''));
    res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-store', ...(gz && { 'content-encoding': 'gzip' }) });
    res.end(gz ? gzipSync(readFileSync(f)) : readFileSync(f));
  });
  return { server, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

interface Run { first: number; ready: number; bytes: number; font: number; proto: string; gzip: boolean }

/* 페이지 안에서 잰다: 요소마다 .carved가 처음 붙은 시각과 data-ready="1"이 된 시각을 적어 둔다(폴링 지연이 섞이지 않게) */
function stamp(): void {
  const w = window as unknown as { __carved: Map<Element, number>; __ready: number };
  w.__carved = new Map();
  new MutationObserver(ms => {
    const t = performance.now();
    for (const m of ms) {
      const el = m.target as Element;
      if (m.attributeName === 'class' && el.classList.contains('carved') && !w.__carved.has(el)) w.__carved.set(el, t);
      if (m.attributeName === 'data-ready' && !w.__ready && document.documentElement.dataset.ready === '1') w.__ready = t;
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class', 'data-ready'] });
}

/* 화면 안 .box:not(.off)가 있고 모두 새겨졌으면, 그중 가장 늦게 새겨진 시각을 낸다 */
function firstScreen(): { first: number; ready: number; bytes: number; font: number; proto: string; gzip: boolean } | false {
  const w = window as unknown as { __carved: Map<Element, number>; __ready: number };
  if (document.documentElement.dataset.ready !== '1') return false;
  const on = [...document.querySelectorAll('.box:not(.off)')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  });
  if (!on.length || !on.every(el => w.__carved.has(el))) return false;
  const first = Math.max(...on.map(el => w.__carved.get(el)!));
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const bytes = [nav, ...res].filter(e => e.responseEnd <= first).reduce((n, e) => n + (e.encodedBodySize || 0), 0);
  const font = Math.max(0, ...res.filter(e => e.name.includes('/plate/')).map(e => e.responseEnd));
  return { first, ready: w.__ready, bytes, font, proto: nav.nextHopProtocol, gzip: nav.encodedBodySize < nav.decodedBodySize };
}

async function measure(b: Browser, url: string, v: { width: number; height: number }): Promise<Run> {
  const ctx = await b.newContext({ viewport: v, deviceScaleFactor: DPR, ignoreHTTPSErrors: h2 });
  try {
    const page = await ctx.newPage();
    await page.addInitScript(stamp);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', NET);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await page.goto(url, { waitUntil: 'commit' });
    const r = await (await page.waitForFunction(firstScreen, undefined, { timeout: 60_000, polling: 200 })).jsonValue();
    if (!r) throw new Error('첫 화면을 재지 못했습니다');
    return r;
  } finally { await ctx.close(); }
}

const s = (ms: number) => (ms / 1000).toFixed(2) + 's';
const med = (a: number[]) => a.slice().sort((x, y) => x - y)[a.length >> 1]!;

let h2srv: ReturnType<typeof serveH2> | undefined;
let origin = PREVIEW;
if (h2) {
  h2srv = serveH2();
  await new Promise<void>(r => h2srv!.server.listen(H2_PORT, r));
  origin = `https://localhost:${H2_PORT}`;
} else {
  const up = await fetch(PREVIEW + BASE).then(r => r.ok, () => false);
  if (!up) { console.error(`미리보기 서버가 없습니다: ${PREVIEW + BASE}\nnpm run build && npx astro preview --port 4321 --ignore-lock`); process.exit(2); }
}
const url = origin + BASE + (locale === 'en' ? 'en/' : '');

const b = await chromium.launch();
try {
  const rows: { v: (typeof VIEWS)[number]; runs: Run[] }[] = [];
  for (const v of VIEWS) {
    const runs: Run[] = [];
    for (let i = 0; i < RUNS; i++) runs.push(await measure(b, url, v));
    rows.push({ v, runs });
  }
  const { proto, gzip } = rows[0]!.runs[0]!, packed = gzip ? '압축 gzip' : '압축 없음';
  console.log(h2
    ? `로컬 HTTP/2 서버(자체 서명 인증서, dist/를 직접)로 쟀다. 관측: ${proto || '?'}, ${packed}.`
    : `미리보기 서버는 HTTP/1.1이라 실제 호스팅(HTTP/2)보다 불리하다. 관측: ${proto || '?'}, ${packed}.`);
  console.log(`${url}  locale ${locale}  dpr ${DPR}  CPU ${CPU}x  지연 ${NET.latency}ms  ${NET.downloadThroughput * 8 / 1e6}Mbps  ${RUNS}회 중앙값`);
  console.log(['폭', '첫 화면', '각 회', '준비', '판 글꼴 도착', '그때까지 받은 양', '목표', ''].join('\t'));
  for (const { v, runs } of rows) {
    const first = med(runs.map(r => r.first));
    console.log([
      v.width, s(first), runs.map(r => s(r.first)).join('/'), s(med(runs.map(r => r.ready))),
      s(med(runs.map(r => r.font))), Math.round(med(runs.map(r => r.bytes)) / 1024) + 'KB', s(v.target), first > v.target ? 'OVER' : 'ok',
    ].join('\t'));
  }
} finally {
  await b.close();
  if (h2srv) { h2srv.server.close(); h2srv.cleanup(); }
}
