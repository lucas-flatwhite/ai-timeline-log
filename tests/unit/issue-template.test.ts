import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

type Field = {
  type: string; id?: string;
  attributes?: { options?: string[] };
  validations?: { required?: boolean };
};
const form = parse(readFileSync('.github/ISSUE_TEMPLATE/correction.yml', 'utf8')) as {
  title: string; body: Field[];
};
const field = (id: string) => form.body.find(f => f.id === id);

describe('correction issue form', () => {
  test('field ids match the query parameters the site prefills', () => {
    expect(form.body.filter(f => f.id).map(f => f.id)).toEqual(['event', 'what', 'evidence', 'lang']);
  });
  test('event is an input, what is a required textarea', () => {
    expect(field('event')?.type).toBe('input');
    expect(field('what')?.type).toBe('textarea');
    expect(field('what')?.validations?.required).toBe(true);
  });
  test('lang is a dropdown with ko and en so lang=ko preselects', () => {
    expect(field('lang')?.type).toBe('dropdown');
    expect(field('lang')?.attributes?.options).toEqual(['ko', 'en']);
  });
  test('title starts with [Correction]', () => {
    expect(form.title.startsWith('[Correction] ')).toBe(true);
  });
  test('config keeps blank issues enabled', () => {
    const cfg = parse(readFileSync('.github/ISSUE_TEMPLATE/config.yml', 'utf8')) as { blank_issues_enabled: boolean };
    expect(cfg.blank_issues_enabled).toBe(true);
  });
});
