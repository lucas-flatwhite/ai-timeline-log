import { describe, test, expect } from 'vitest';
import {
  parts, normalizeDate, daysBetween, fraction, formatDot, formatYYMM, formatDate, formatLong,
  formatMonthLong, formatSpan, formatItemDate, parseLegacyWhen, parseLegacyItemDate,
} from '../../src/lib/dates.ts';

const ORIGINAL_WHENS = [
  '2022.11.30', '2023.02', '2023.03.14', '2023.05', '2023.07–08', '2023.10–11', '2023.12–2024.02',
  '2024.03', '2024.05', '2024.06', '2024.09–10', '2024.10–12', '2025.01', '2025.02', '2025.03',
  '2025.05', '2025.06–08', '2025.09–10', '2025.10.31', '2025.11–12', '2026.01', '2026.02',
  '2026.02–03', '2026.03–05', '2026.06', '2026.07', '2026.07–09', '2026.09',
];

describe('parts / normalizeDate', () => {
  test('accepts year, month and day precision', () => {
    expect(parts('2023')).toEqual({ y: 2023, m: undefined, d: undefined });
    expect(parts('2023-01')).toEqual({ y: 2023, m: 1, d: undefined });
    expect(parts('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
  });
  test('rejects impossible dates', () => {
    expect(() => parts('2023-13')).toThrow(/month/);
    expect(() => parts('2023-02-30')).toThrow(/day/);
    expect(() => parts('2023/01/01')).toThrow(/Invalid date/);
  });
  test('normalizes YAML values', () => {
    expect(normalizeDate(new Date('2022-11-30T00:00:00Z'))).toBe('2022-11-30');
    expect(normalizeDate(2023)).toBe('2023');
    expect(normalizeDate('2023-01')).toBe('2023-01');
    expect(() => normalizeDate('2023-02-30')).toThrow();
    expect(() => normalizeDate(null)).toThrow();
  });
});

describe('arithmetic', () => {
  test('day count of the first edition', () => {
    expect(daysBetween('2022-11-30', '2026-10-05')).toBe(1405);
  });
  test('fraction spans start..end', () => {
    expect(fraction('2022-11-30', '2022-11-30', '2026-10-05')).toBe(0);
    expect(fraction('2026-10-05', '2022-11-30', '2026-10-05')).toBe(1);
    expect(fraction('2023-01', '2022-11-30', '2026-10-05')).toBeCloseTo(32 / 1405, 6);
  });
});

describe('formatting', () => {
  test('short forms', () => {
    expect(formatDot('2022-11-30')).toBe('2022.11.30');
    expect(formatYYMM('2022-11-30')).toBe('22.11');
    expect(formatYYMM('2026-04')).toBe('26.04');
    expect(formatDate('ko', '2022-11')).toBe('2022.11');
    expect(formatDate('ko', '2023')).toBe('2023');
    expect(formatDate('en', '2022-11')).toBe('Nov 2022');
  });
  test('long forms', () => {
    expect(formatLong('ko', '2026-10-05')).toBe('2026년 10월 5일');
    expect(formatLong('en', '2026-10-05')).toBe('October 5, 2026');
    expect(formatMonthLong('ko', '2026-10-05')).toBe('2026년 10월');
    expect(formatMonthLong('en', '2026-10-05')).toBe('October 2026');
  });
  test('spans (spec section 7)', () => {
    expect(formatSpan('ko', { from: '2025-01' })).toBe('2025.01');
    expect(formatSpan('ko', { from: '2024-09', to: '2024-10' })).toBe('2024.09–10');
    expect(formatSpan('ko', { from: '2023-12', to: '2024-02' })).toBe('2023.12–2024.02');
    expect(formatSpan('ko', { from: '2022-11-30' })).toBe('2022.11.30');
    expect(formatSpan('en', { from: '2025-01' })).toBe('Jan 2025');
    expect(formatSpan('en', { from: '2024-09', to: '2024-10' })).toBe('Sep–Oct 2024');
    expect(formatSpan('en', { from: '2023-12', to: '2024-02' })).toBe('Dec 2023 – Feb 2024');
    expect(formatSpan('en', { from: '2022-11-30' })).toBe('Nov 30, 2022');
  });
  test('item dates (spec section 7)', () => {
    expect(formatItemDate('ko', '2025-01-20', 2025)).toBe('01.20');
    expect(formatItemDate('ko', '2023-01-23', 2022)).toBe('2023.01.23');
    expect(formatItemDate('ko', '2023-01', 2022)).toBe('2023.01');
    expect(formatItemDate('ko', '2023-01', 2023)).toBe('2023.01');
    expect(formatItemDate('en', '2025-01-20', 2025)).toBe('Jan 20');
    expect(formatItemDate('en', '2023-01-23', 2022)).toBe('Jan 23, 2023');
    expect(formatItemDate('en', '2023-01', 2022)).toBe('Jan 2023');
  });
});

describe('legacy parsing', () => {
  test('every original "when" round-trips', () => {
    for (const w of ORIGINAL_WHENS) expect(formatSpan('ko', parseLegacyWhen(w))).toBe(w);
  });
  test('item shorthands', () => {
    expect(parseLegacyItemDate('12.05', 2022)).toBe('2022-12-05');
    expect(parseLegacyItemDate('23.01', 2022)).toBe('2023-01');
    expect(parseLegacyItemDate('23.01.23', 2022)).toBe('2023-01-23');
    expect(() => parseLegacyItemDate('2023', 2022)).toThrow();
  });
  test('rejects unknown when', () => {
    expect(() => parseLegacyWhen('2023년 2월')).toThrow();
  });
});
