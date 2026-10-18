import { mulberry, nz } from './random.ts';
import type { Sampler } from './compose.ts';

export const BK = 64;
export interface PathLike { moveTo(x: number, y: number): void; lineTo(x: number, y: number): void; closePath(): void }
export interface EngraveOptions {
  w: number; h: number; s: number; src: Sampler; mode: 'lines' | 'rings';
  ang?: number; wave?: { f: number; g: number; ph: number } | null;
  cx?: number; cy?: number; maxR?: number; seed: number; sweep?: number;
}

/* 원본 380–458행. 바뀐 점: Path2D 생성을 makePath()로 주입(테스트용) */
export function engrave(o: EngraveOptions, makePath: () => PathLike = () => new Path2D()): PathLike[] {
  var w=o.w,h=o.h,s=o.s,smp=o.src,rng=mulberry(o.seed*9973+17);
  var P:PathLike[]=[];for(var q=0;q<BK;q++)P.push(makePath());
  var step=2,minT=0.45,maxT=s*0.97,mr=o.maxR||0.9,so=o.seed*13.37;
  var scx=Math.cos(o.sweep||0),scy=Math.sin(o.sweep||0);
  var cc=[0,w*scx,h*scy,w*scx+h*scy],pm=Math.min.apply(null,cc),pr=(Math.max.apply(null,cc)-pm)||1;
  var cap=4096,X=new Float32Array(cap),Y=new Float32Array(cap),NX=new Float32Array(cap),NY=new Float32Array(cap),T=new Float32Array(cap);
  function grow(n){if(n<=X.length)return;var m=Math.ceil(n*1.4);X=new Float32Array(m);Y=new Float32Array(m);NX=new Float32Array(m);NY=new Float32Array(m);T=new Float32Array(m);}
  function emit(a,b,ca,cb,n){
    var m=(a+b)>>1,sw=((X[m]*scx+Y[m]*scy)-pm)/pr,dl=0.58*sw+0.42*rng();
    if(dl>0.999)dl=0.999;if(dl<0)dl=0;
    var p=P[(dl*BK)|0],k,ht,qq;
    if(ca){qq=a+1<n?a+1:a;p.moveTo(X[a]-(X[qq]-X[a])*0.6,Y[a]-(Y[qq]-Y[a])*0.6);}
    for(k=a;k<=b;k++){ht=T[k]*0.5;if(k===a&&!ca)p.moveTo(X[k]+NX[k]*ht,Y[k]+NY[k]*ht);else p.lineTo(X[k]+NX[k]*ht,Y[k]+NY[k]*ht);}
    if(cb){qq=b-1>=0?b-1:b;p.lineTo(X[b]+(X[b]-X[qq])*0.6,Y[b]+(Y[b]-Y[qq])*0.6);}
    for(k=b;k>=a;k--){ht=T[k]*0.5;p.lineTo(X[k]-NX[k]*ht,Y[k]-NY[k]*ht);}
    p.closePath();
  }
  function run(n,k){
    for(var i=0;i<n;i++){
      var d=smp(X[i],Y[i]),t=0;
      if(d>0.02){
        t=s*mr*Math.pow(d,0.85)*(0.78+0.44*nz(i*0.026+k*7.31+so));
        if(d<0.9&&nz(i*0.19+k*3.7+so*2)>0.88)t=0;
        if(t>maxT)t=maxT;
      }
      T[i]=t>=minT?t:0;
    }
    var a,b,j;i=0;
    while(i<n){
      if(!T[i]){i++;continue;}
      j=i;while(j<n&&T[j])j++;
      a=i;
      while(true){
        b=Math.min(j-1,a+14+((rng()*26)|0));
        if(j-1-b<6)b=j-1;
        emit(a,b,a===i,b===j-1,n);
        if(b>=j-1)break;
        a=b;
      }
      i=j;
    }
  }
  var k=0,i,n;
  if(o.mode==='rings'){
    var cx=o.cx!,cy=o.cy!;
    var Rm=Math.max(Math.hypot(cx,cy),Math.hypot(w-cx,cy),Math.hypot(cx,h-cy),Math.hypot(w-cx,h-cy))+s;
    for(var r=s*0.8;r<=Rm;r+=s,k++){
      var rj=r+(rng()-0.5)*s*0.16;
      n=Math.max(12,Math.ceil(6.2832*rj/step));grow(n);
      var ph=rng()*6.2832,dth=6.2832/n;
      for(i=0;i<n;i++){
        var th=ph+i*dth,c=Math.cos(th),sn=Math.sin(th),rr=rj+s*0.11*(nz(i*step*0.012+k*1.7+so)-0.5);
        X[i]=cx+c*rr;Y[i]=cy+sn*rr;NX[i]=c;NY[i]=sn;
      }
      run(n,k);
    }
  }else{
    var ang=o.ang||0,ca=Math.cos(ang),sa=Math.sin(ang),mx=w/2,my=h/2,R=Math.hypot(w,h)/2+s*2;
    var wv=o.wave,A=wv?s*1.5:0,mg=A+3;
    for(var v=-R;v<=R;v+=s,k++){
      var vj=v+(rng()-0.5)*s*0.16,u0=-R,u1=R,t1,t2,tmp;
      if(Math.abs(ca)>1e-4){t1=(-mg-mx+sa*vj)/ca;t2=(w+mg-mx+sa*vj)/ca;if(t1>t2){tmp=t1;t1=t2;t2=tmp;}u0=Math.max(u0,t1);u1=Math.min(u1,t2);}
      else{tmp=mx-sa*vj;if(tmp<-mg||tmp>w+mg)continue;}
      if(Math.abs(sa)>1e-4){t1=(-mg-my-ca*vj)/sa;t2=(h+mg-my-ca*vj)/sa;if(t1>t2){tmp=t1;t1=t2;t2=tmp;}u0=Math.max(u0,t1);u1=Math.min(u1,t2);}
      else{tmp=my+ca*vj;if(tmp<-mg||tmp>h+mg)continue;}
      if(u1<=u0)continue;
      n=Math.ceil((u1-u0)/step)+1;grow(n);
      for(i=0;i<n;i++){
        var u=u0+i*step,off=s*0.11*(nz(u*0.012+k*1.7+so)-0.5);
        if(wv)off+=A*Math.sin(u*wv.f+vj*wv.g+wv.ph);
        var vv=vj+off;
        X[i]=mx+ca*u-sa*vv;Y[i]=my+sa*u+ca*vv;NX[i]=-sa;NY[i]=ca;
      }
      run(n,k);
    }
  }
  return P;
}
