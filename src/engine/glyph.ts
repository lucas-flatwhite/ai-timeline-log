export interface Rect { x: number; y: number; w: number; h: number }
export interface Fit { F: number; lines: { t: string; x: number; y: number }[]; box: Rect }

/* 원본 354–361행. 바뀐 점: 전역 FONT 대신 font 인자 */
export function fitGlyph(g: CanvasRenderingContext2D, text: string, R: Rect, frac: number, font: string): Fit {
  var lines=text.split('\n');g.font='400 100px '+font;
  var M=lines.map(function(t){var m=g.measureText(t);var L=m.actualBoundingBoxLeft||0;var Rt=m.actualBoundingBoxRight!=null?m.actualBoundingBoxRight:m.width;var A=m.actualBoundingBoxAscent!=null?m.actualBoundingBoxAscent:76;var D=m.actualBoundingBoxDescent!=null?m.actualBoundingBoxDescent:4;return {t:t,L:L,W:L+Rt,A:A,D:D};});
  var gap=9,tot=0,mw=0;M.forEach(function(m,i){tot+=m.A+m.D+(i?gap:0);mw=Math.max(mw,m.W);});
  var k=Math.min(R.w*frac/mw,R.h*frac/tot),bw=mw*k,bh=tot*k,y=R.y+(R.h-bh)/2,out:Fit['lines']=[];
  M.forEach(function(m,i){if(i)y+=gap*k;var base=y+m.A*k;out.push({t:m.t,x:R.x+(R.w-m.W*k)/2+m.L*k,y:base});y=base+m.D*k;});
  return {F:100*k,lines:out,box:{x:R.x+(R.w-bw)/2,y:R.y+(R.h-bh)/2,w:bw,h:bh}};
}

/* 원본 362행. 바뀐 점: font 인자 */
export function drawGlyph(g: CanvasRenderingContext2D, fit: Fit, font: string): void {
  g.font='400 '+fit.F+'px '+font;g.textAlign='left';g.textBaseline='alphabetic';fit.lines.forEach(function(L){g.fillText(L.t,L.x,L.y);});
}
