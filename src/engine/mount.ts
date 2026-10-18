import { BK } from './engrave.ts';
import type { Fit } from './glyph.ts';

export interface Print { ctx: CanvasRenderingContext2D; k: number; w: number; h: number; P: Path2D[]; color: string; key: number; fit?: Fit }

/* 원본 459–478행 verbatim. 바뀐 점: export와 타입 */
export function mount(cv: HTMLCanvasElement, w: number, h: number, P: Path2D[], color: string, budget?: number): Print {
  var k=Math.min(window.devicePixelRatio||1,2,Math.sqrt((budget||4.2e6)/(w*h)));
  cv.width=Math.round(w*k);cv.height=Math.round(h*k);cv.style.width=w+'px';cv.style.height=h+'px';
  return {ctx:cv.getContext('2d')!,k:k,w:w,h:h,P:P,color:color,key:-1};
}
export function buckets(pr: Print, tin: number, tout: number): void {
  var g=pr.ctx,a=tout*BK,b=tin*BK;if(b<=a)return;
  g.fillStyle=pr.color;
  for(var i=Math.floor(a);i<b&&i<BK;i++){
    var al=1;if(i<a)al=1-(a-i);if(i+1>b)al=Math.min(al,b-i);if(al<=0.01)continue;
    g.globalAlpha=al;g.fill(pr.P[i]);
  }
  g.globalAlpha=1;
}
export function paint(pr: Print, tin: number, tout: number): void {
  var key=(Math.round(tin*512)<<10)|Math.round(tout*512);
  if(key===pr.key)return;pr.key=key;
  pr.ctx.setTransform(pr.k,0,0,pr.k,0,0);pr.ctx.clearRect(0,0,pr.w,pr.h);
  buckets(pr,tin,tout);
}
