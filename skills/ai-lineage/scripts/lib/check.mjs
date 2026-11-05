// 그리기 전 검사: 데이터 검사(validate)를 통과하면 배치를 돌려, 맞지 않는 것과 어느 글꼴에도 없는 글자를 오류로 더한다.
import { validate } from './schema.mjs';
import { loadFonts } from './fonts.mjs';
import { layout } from './layout.mjs';

/** @typedef {import('./styles.mjs').StyleId} StyleId */

/**
 * @param {unknown} data
 * @param {{ portrait?: boolean, style?: StyleId, credit?: boolean }} [opts]
 * @returns {Promise<{ errors: string[], warnings: string[] }>}
 */
export async function check(data, opts = {}) {
  const { errors, warnings } = validate(data);
  if (errors.length) return { errors, warnings };
  const d = /** @type {import('./schema.mjs').Lineage} */ (data);
  const out = layout(d, await loadFonts(), {
    style: opts.style ?? d.style ?? 'woodcut',
    credit: opts.credit ?? d.credit ?? true,
    portrait: opts.portrait ?? false,
  });
  return { errors: [...errors, ...out.errors], warnings };
}
