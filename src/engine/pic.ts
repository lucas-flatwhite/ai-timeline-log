import type { Rect } from './glyph.ts';

/** 그림 상자의 밑그림. 100×100 좌표의 윤곽선(SVG path)과 그림의 무게중심 */
export interface Pic { d: string; cx: number; cy: number }

/* 시안 drawPic. pic.d를 R 안 정사각형에 맞추고, (cx, cy)를 가운데로 rot만큼 기울여 칠한다 */
export function drawPic(g: CanvasRenderingContext2D, pic: Pic, R: Rect, rot = -0.12, scale = 1.1): void {
  const k = Math.min(R.w, R.h) / 100 * scale;
  g.save(); g.translate(R.x + R.w / 2, R.y + R.h / 2); g.rotate(rot); g.scale(k, k); g.translate(-pic.cx, -pic.cy);
  g.fill(new Path2D(pic.d)); g.restore();
}
