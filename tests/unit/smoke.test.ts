import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';

test('reference original is kept in the repo', () => {
  expect(existsSync('reference/original/index.html')).toBe(true);
  expect(existsSync('reference/original/ai-timeline-prompt.md')).toBe(true);
});
