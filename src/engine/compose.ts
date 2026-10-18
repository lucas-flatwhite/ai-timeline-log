export type Sampler = (x: number, y: number) => number;

/* 밑그림을 그려 농도 샘플러로 바꾼다. 본문은 원본 338–352행 verbatim */
export function compose(w: number, h: number, fn: (g: CanvasRenderingContext2D) => void): Sampler {
  var ss=w*h>700000?0.5:0.75,sw=Math.ceil(w*ss),sh=Math.ceil(h*ss);
  var c=document.createElement('canvas');c.width=sw;c.height=sh;
  var g=c.getContext('2d',{willReadFrequently:true})!;
  g.fillStyle='#fff';g.fillRect(0,0,sw,sh);g.setTransform(ss,0,0,ss,0,0);
  fn(g);
  var im=g.getImageData(0,0,sw,sh).data,d=new Uint8Array(sw*sh);
  for(var i=0,j=0;i<d.length;i++,j+=4)d[i]=255-im[j];
  c.width=c.height=0;
  return function(x,y){
    var fx=x*ss-0.5,fy=y*ss-0.5;
    if(fx<0||fy<0||fx>=sw-1||fy>=sh-1)return 0;
    var ix=fx|0,iy=fy|0,ax=fx-ix,ay=fy-iy,o=iy*sw+ix;
    var a=d[o],b=d[o+1],cc=d[o+sw],e=d[o+sw+1];
    return ((a+(b-a)*ax)*(1-ay)+(cc+(e-cc)*ax)*ay)/255;
  };
}
