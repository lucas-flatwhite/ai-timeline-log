/* 원본 294–299행. pad()는 쓰지 않아 뺐다 */
export function clamp(x: number): number { return x < 0 ? 0 : x > 1 ? 1 : x; }
export function ease(t: number): number { t = clamp(t); return t * t * (3 - 2 * t); }
export function mulberry(a: number): () => number { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function hsh(n: number): number { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function nz(x: number): number { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hsh(i) * (1 - u) + hsh(i + 1) * u; }
