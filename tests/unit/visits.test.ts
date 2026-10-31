import { describe, test, expect } from 'vitest';
import { isNew, sinceFor } from '../../src/lib/visits.ts';

describe('sinceFor', () => {
  test('first visit marks nothing', () => {
    expect(sinceFor(null, null, '2026-10-31')).toEqual({ since: null, session: null });
  });
  test('returning visit uses the stored date', () => {
    expect(sinceFor(null, '2026-10-18', '2026-10-31')).toEqual({ since: '2026-10-18', session: '2026-10-18' });
  });
  test('reload in the same tab keeps marks', () => {
    expect(sinceFor('2026-10-18', '2026-10-31', '2026-10-31').since).toBe('2026-10-18');
  });
  test('stored date in the future is ignored', () => {
    expect(sinceFor(null, '2027-01-01', '2026-10-31')).toEqual({ since: null, session: null });
  });
  test('garbage in storage is ignored', () => {
    expect(sinceFor('nope', 'also nope', '2026-10-31')).toEqual({ since: null, session: null });
  });
});

describe('isNew', () => {
  test('only boxes added after the stored date', () => {
    expect(isNew('2026-10-31', '2026-10-27')).toBe(true);
    expect(isNew('2026-10-27', '2026-10-27')).toBe(false);
    expect(isNew(undefined, '2026-10-01')).toBe(false);
    expect(isNew('2026-10-31', null)).toBe(false);
  });
});
