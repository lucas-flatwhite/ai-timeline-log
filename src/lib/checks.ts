import type { Content } from './content.ts';
import { glyphFor } from './grid.ts';

/** 스키마를 통과한 내용에 대한 빌드 검사. 오류는 빌드를 멈추고, 경고는 출력만 한다. */

const FORBIDDEN_KO = ['놀라운', '혁명적', '게임 체인저'];
const FORBIDDEN_EN = ['revolutionary', 'game-changer', 'groundbreaking', 'stunning', 'incredible'];
const RELATIVE_KO = ['오늘', '최근', '올해', '현재'];
const RELATIVE_EN = ['today', 'recently', 'this year'];

const HANGUL = /[ᄀ-ᇿㄱ-ㆎ가-힣]/;
const EMOJI = /\p{Extended_Pictographic}/u;

export function hasHangul(s: string): boolean {
  return HANGUL.test(s);
}

const escapeRe = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// 영어는 단어 경계 + 대소문자 무시, 한국어는 부분 문자열
function findWords(text: string, ko: string[], en: string[]): string[] {
  const hits = ko.filter(w => text.includes(w));
  for (const w of en) if (new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(w)}(?![\\p{L}\\p{N}])`, 'iu').test(text)) hits.push(w);
  return hits;
}

interface Piece { where: string; text: string; relative: boolean }

// 작은 판(사건 상자 1×1)에서 읽기 어려운 핵심어: 한 줄에 한글 4자 이상 또는 라틴 8자 이상
function tooLongForSmallBox(glyph: string): boolean {
  return glyph.split('\n').some(line => (line.match(/[가-힣]/g)?.length ?? 0) >= 4 || (line.match(/[A-Za-z]/g)?.length ?? 0) >= 8);
}

export function checkContent(c: Content): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const pieces: Piece[] = [];
  const add = (where: string, text: string | undefined, relative: boolean) => {
    if (text) pieces.push({ where, text, relative });
  };

  for (const s of c.scenes) {
    const sw = `scene ${s.id}`;

    // 영어로 해석되는 핵심어에는 한글이 없어야 한다(번역을 빠뜨린 경우)
    const g = s.en.glyph ?? s.print.glyph;
    if (hasHangul(g)) errors.push(`${sw}: en glyph "${g}" contains Hangul`);

    for (const loc of ['ko', 'en'] as const) {
      const t = s[loc];
      add(`${sw}: ${loc}.kicker`, t.kicker, true);
      add(`${sw}: ${loc}.title`, t.title, true);
      add(`${sw}: ${loc}.lede`, t.lede, true);
      add(`${sw}: ${loc}.glyph`, t.glyph, false);
    }
    add(`${sw}: print.glyph`, s.print.glyph, false);
    s.corrections.forEach((x, i) => { add(`${sw}: corrections.${i}.ko`, x.ko, false); add(`${sw}: corrections.${i}.en`, x.en, false); });

    s.items.forEach((it, i) => {
      const iw = `${sw}: items.${i}`;
      add(`${iw} ko`, it.ko, true);
      add(`${iw} en`, it.en, true);
      if (typeof it.glyph === 'string') add(`${iw} glyph`, it.glyph, false);
      else { add(`${iw} ko glyph`, it.glyph.ko, false); add(`${iw} en glyph`, it.glyph.en, false); }
      // 영어로 해석되는 핵심어(문자열이면 그대로, { ko, en }이면 en)에 한글이 없어야 한다
      const enGlyph = glyphFor(it.glyph, 'en');
      if (hasHangul(enGlyph)) errors.push(`${iw} en glyph "${enGlyph}" contains Hangul`);
      if (it.pic !== undefined && !(it.pic in c.pics)) errors.push(`${iw}: pic "${it.pic}" is not in pics.yaml`);

      const longOnes = new Set<string>();
      if (tooLongForSmallBox(glyphFor(it.glyph, 'ko'))) longOnes.add(glyphFor(it.glyph, 'ko'));
      if (typeof it.glyph !== 'string' && tooLongForSmallBox(it.glyph.en)) longOnes.add(it.glyph.en);
      for (const g of longOnes) warnings.push(`${iw}: glyph "${g.replaceAll('\n', '/')}" is hard to read in a small box`);
    });

    if (s.sources.length === 0 && s.items.every(it => it.sources.length === 0)) {
      warnings.push(`${sw}: has no source on the scene or on any item`);
    }

    // 주제: 모르는 id는 오류, 주제가 없는 장면은 경고(주제 목록이 비어 있으면 묻지 않는다)
    for (const t of s.topics) if (!(t in c.topics)) errors.push(`${sw}: topic "${t}" is not in topics.yaml`);
    if (s.topics.length === 0 && Object.keys(c.topics).length > 0) warnings.push(`${sw}: has no topic`);

    // 첫 판 이후에 더한 장면은 장면이나 사건에 출처가 하나는 있어야 한다.
    if (s.added > c.site.firstEdition && s.sources.length === 0 && s.items.every(it => it.sources.length === 0)) {
      errors.push(`${sw}: added ${s.added} after firstEdition ${c.site.firstEdition}, so it needs a source (scene or item)`);
    }
  }

  for (const [y, v] of Object.entries(c.years)) {
    for (const loc of ['ko', 'en'] as const) {
      add(`years.yaml ${y}.${loc}.title`, v[loc].title, true);
      add(`years.yaml ${y}.${loc}.body`, v[loc].body, true);
    }
  }
  c.arcs.forEach((a, i) => {
    for (const loc of ['ko', 'en'] as const) {
      add(`arcs.yaml ${i}.${loc}.title`, a[loc].title, true);
      add(`arcs.yaml ${i}.${loc}.body`, a[loc].body, true);
    }
  });
  // 주제는 장면이 셋 이상일 때 흐름이 된다
  for (const [id, v] of Object.entries(c.topics)) {
    const n = c.scenes.filter(s => s.topics.includes(id)).length;
    if (n < 3) warnings.push(`topics.yaml: ${id} has only ${n} scene(s)`);
    for (const loc of ['ko', 'en'] as const) add(`topics.yaml ${id}.${loc}`, v[loc], true);
  }

  // 판 기록: 1부터 빠짐없이, 날짜는 오름차순이고 asOf를 넘지 않는다. 첫 판은 firstEdition.
  // 한 번 포스터를 낸 뒤의 판은 모두 포스터가 있어야 한다(기록한 판에 포스터가 없는 일이 없게)
  const eds = c.editions;
  if (eds.some((e, i) => e.n !== i + 1)) errors.push(`editions.yaml: editions must be numbered 1..${eds.length} in order`);
  if (eds[0] && eds[0].date !== c.site.firstEdition) errors.push(`editions.yaml: edition 1 must be dated firstEdition ${c.site.firstEdition}`);
  let posterFrom: number | undefined;
  eds.forEach((e, i) => {
    if (i > 0 && e.date <= eds[i - 1].date) errors.push(`editions.yaml: edition ${e.n} date ${e.date} is not after edition ${eds[i - 1].n}`);
    if (e.date > c.site.asOf) errors.push(`editions.yaml: edition ${e.n} date ${e.date} is after asOf ${c.site.asOf}`);
    if (e.poster) posterFrom ??= e.n;
    else if (posterFrom !== undefined) errors.push(`editions.yaml: edition ${e.n} has no poster after edition ${posterFrom} had one`);
    for (const loc of ['ko', 'en'] as const) add(`editions.yaml ${e.n}.${loc}`, e[loc], true);
  });

  // 사이트 소개글은 "현재까지"처럼 상대 시간을 써도 된다(relative=false)
  for (const loc of ['ko', 'en'] as const) {
    const t = c.site[loc];
    for (const [k, v] of Object.entries(t)) {
      if (typeof v === 'string') add(`site.yaml ${loc}.${k}`, v, false);
      else for (const [k2, v2] of Object.entries(v)) add(`site.yaml ${loc}.${k}.${k2}`, v2 as string, false);
    }
  }

  for (const p of pieces) {
    for (const w of findWords(p.text, FORBIDDEN_KO, FORBIDDEN_EN)) errors.push(`${p.where}: forbidden "${w}"`);
    if (p.text.includes('!')) errors.push(`${p.where}: exclamation mark`);
    if (EMOJI.test(p.text)) errors.push(`${p.where}: emoji`);
    if (p.relative) for (const w of findWords(p.text, RELATIVE_KO, RELATIVE_EN)) errors.push(`${p.where}: relative time "${w}"`);
  }

  return { errors, warnings };
}
