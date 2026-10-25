import type { Rect } from './glyph.ts';

/* 원본 363–377행 verbatim. 바뀐 점: export와 타입 */
export function vignette(g: CanvasRenderingContext2D, w: number, h: number, a: number){var gr=g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.28,w/2,h/2,Math.hypot(w,h)/2);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,'+a+')');g.fillStyle=gr;g.fillRect(0,0,w,h);}
export function border(g: CanvasRenderingContext2D, w: number, h: number, s: number){
  /* 위쪽 여백은 고정 표시줄 자리라 비워 두고, 판 테두리는 그 아래부터 새긴다 */
  var m=8+s,t=46;
  g.fillStyle='#fff';g.fillRect(0,0,w,t-s*1.6);
  g.strokeStyle='rgba(0,0,0,.95)';g.lineWidth=s*2.2;g.strokeRect(m,t,w-2*m,h-t-m);
}
export function motif(g: CanvasRenderingContext2D, kind: string, box: Rect, R: Rect, w: number, h: number, rng: () => number){
  var cx=box.x+box.w/2,cy=box.y+box.h/2,i,x,y;
  if(kind==='disc'){g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.arc(cx,cy,Math.max(box.w,box.h)*0.6,0,7);g.fill();}
  else if(kind==='rays'){g.fillStyle='rgba(0,0,0,.28)';var L=Math.hypot(w,h),N=30;for(i=0;i<N;i++){var a=i/N*6.2832+0.05,da=6.2832/N*0.42;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);g.lineTo(cx+Math.cos(a+da)*L,cy+Math.sin(a+da)*L);g.closePath();g.fill();}}
  else if(kind==='grid'){var c=Math.max(16,Math.min(R.w,R.h)/8),gp=c*0.3;g.fillStyle='rgba(0,0,0,.3)';for(y=R.y;y<R.y+R.h-c*0.5;y+=c+gp)for(x=R.x;x<R.x+R.w-c*0.5;x+=c+gp){if(rng()<0.8)g.fillRect(x,y,c,c);}}
  else if(kind==='fall'){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.moveTo(R.x,R.y+R.h);g.lineTo(R.x,R.y+R.h*0.1);var N2=10;for(i=1;i<=N2;i++){x=R.x+R.w*i/N2;y=R.y+R.h*(0.1+0.82*i/N2)+(rng()-0.5)*R.h*0.2*(1-i/N2);g.lineTo(x,Math.min(y,R.y+R.h));}g.lineTo(R.x+R.w,R.y+R.h);g.closePath();g.fill();}
  else if(kind==='rise'){var N3=8,bw=R.w/N3;g.fillStyle='rgba(0,0,0,.26)';for(i=0;i<N3;i++){var hh=R.h*(0.16+0.8*Math.pow((i+1)/N3,1.6));g.fillRect(R.x+i*bw+bw*0.18,R.y+R.h-hh,bw*0.64,hh);}}
}
/* 상자 판의 사각 테두리(시안 frame). 위 막대 자리를 비우는 border와 달리 네 변이 같다 */
export function frame(g: CanvasRenderingContext2D, w: number, h: number, s: number){var m=s*1.3;g.strokeStyle='rgba(0,0,0,.95)';g.lineWidth=s*1.5;g.strokeRect(m,m,w-2*m,h-2*m);}
