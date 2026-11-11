/* ===================== core: 렌더러 · 공용 도구 ===================== */
var cv=document.getElementById('gl');
var renderer=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
var PAPER=0xF3F0EA,SKY_D=new T.Color(PAPER),SKY_N=new T.Color(0x1a1c2e);
var scene=new T.Scene();scene.background=SKY_D.clone();scene.fog=new T.Fog(PAPER,260,560);
var camera=new T.PerspectiveCamera(30,1,.3,900);camera.position.set(-70,120,150);
var controls=new T.OrbitControls(camera,cv);controls.target.set(46,0,-2);controls.enableDamping=true;controls.dampingFactor=.08;
controls.maxPolarAngle=Math.PI*.47;controls.minDistance=6;controls.maxDistance=380;
/* 분해도와 같은 조명: 반구광 0.95 + 주광 0.7 + 보조광 0.28 */
var hemi=new T.HemisphereLight(0xffffff,0xd9cfbb,.95);scene.add(hemi);
var sun=new T.DirectionalLight(0xfffaf0,.7);sun.position.set(5,80,40);sun.target.position.set(50,0,0);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
(function(c){c.left=-125;c.right=125;c.top=75;c.bottom=-75;c.near=10;c.far=260})(sun.shadow.camera);sun.shadow.bias=-.0003;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
var fillL=new T.DirectionalLight(0xffffff,.28);fillL.position.set(50,30,-60);scene.add(fillL);
function mat(c,o){o=o||{};var m=new T.MeshStandardMaterial({color:c,roughness:o.r!==undefined?o.r:.85,metalness:o.m||0,emissive:o.e||0,emissiveIntensity:o.ei||0,vertexColors:!!o.vc,side:o.ds?T.DoubleSide:T.FrontSide});
  if(o.op!==undefined){m.transparent=true;m.opacity=o.op;m.depthWrite=false}return m}
function sh(o,par){o.castShadow=o.receiveShadow=true;if(par)par.add(o);return o}
function box(w,h,d,m,x,y,z,par){return sh(bx(w,h,d,m,x,y,z),par||scene)}
function rbx(w,h,d,r,m,x,y,z,par){return sh(rb(w,h,d,r,m,x,y,z),par||scene)}
function shape(pts){var s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return s}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sm(x){x=clamp(x,0,1);return x*x*(3-2*x)}
function lerp(a,b,t){return a+(b-a)*t}
function angDiff(a,b){var d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
/* 원통 부재: a→b 를 잇는 막대 (InstancedMesh 용 행렬) */
var UPV=new T.Vector3(0,1,0),_q=new T.Quaternion(),_v=new V3(),_s=new V3(),_m=new M4();
function memberMatrix(a,b,r,out){_v.subVectors(b,a);var L=_v.length();_q.setFromUnitVectors(UPV,_v.normalize());_s.set(r,L,r);out.compose(_v.copy(a).add(b).multiplyScalar(.5),_q,_s);return out}
function Lattice(mat,seg){this.list=[];this.mat=mat;this.seg=seg||6}
Lattice.prototype.add=function(a,b,r){this.list.push([a.clone?a.clone():new V3(a[0],a[1],a[2]),b.clone?b.clone():new V3(b[0],b[1],b[2]),r]);return this};
Lattice.prototype.build=function(par){var g=new T.CylinderGeometry(1,1,1,this.seg,1),im=new T.InstancedMesh(g,this.mat,this.list.length),m=new M4();
  this.list.forEach(function(e,i){im.setMatrixAt(i,memberMatrix(e[0],e[1],e[2],m))});im.castShadow=true;im.receiveShadow=true;par.add(im);return im};
/* 여러 지오메트리를 하나로 합치기 (인덱스 없는 위치·법선만) */
function mergeGeos(list){var n=0,arr=[];list.forEach(function(g){var q=g.index?g.toNonIndexed():g;arr.push(q);n+=q.attributes.position.count});
  var P=new Float32Array(n*3),N=new Float32Array(n*3),o=0;arr.forEach(function(g){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);o+=g.attributes.position.count});
  var r=new T.BufferGeometry();r.setAttribute('position',new T.BufferAttribute(P,3));r.setAttribute('normal',new T.BufferAttribute(N,3));return r}
function tg(g,x,y,z,rx,ry,rz){if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(rz)g.rotateZ(rz);g.translate(x||0,y||0,z||0);return g}

/* ===================== 높이 격자 (구덩이 바닥 · 사토장 · 적재함 흙) ===================== */
function HF(o){var s=this;s.x0=o.x0;s.z0=o.z0;s.nx=o.nx;s.nz=o.nz;s.dx=o.w/(o.nx-1);s.dz=o.d/(o.nz-1);s.ca=s.dx*s.dz;
  var N=o.nx*o.nz;s.h=new Float32Array(N);s.b=new Float32Array(N);s.hide=!!o.hide;s.col=o.col;s.cap=o.cap||null;
  for(var j=0;j<o.nz;j++)for(var i=0;i<o.nx;i++){var k=j*o.nx+i,x=s.x0+i*s.dx,z=s.z0+j*s.dz,b=o.base(x,z);s.b[k]=b;s.h[k]=o.init?o.init(x,z,b):b}
  var g=new T.PlaneGeometry(o.w,o.d,o.nx-1,o.nz-1);g.rotateX(-Math.PI/2);g.translate(s.x0+o.w/2,0,s.z0+o.d/2);
  g.setAttribute('color',new T.BufferAttribute(new Float32Array(N*3),3));s.geo=g;
  s.mesh=new T.Mesh(g,mat(0xffffff,{vc:true,r:.97}));s.mesh.receiveShadow=true;s.mesh.castShadow=!!o.cast;(o.par||scene).add(s.mesh);
  s.dirty=[0,0,o.nx-1,o.nz-1];s.vol=0;s.update(true)}
HF.prototype.k=function(i,j){return j*this.nx+i};
HF.prototype.sample=function(x,z){var fx=(x-this.x0)/this.dx,fz=(z-this.z0)/this.dz;if(fx<0||fz<0||fx>this.nx-1||fz>this.nz-1)return null;
  var i=Math.min(this.nx-2,Math.floor(fx)),j=Math.min(this.nz-2,Math.floor(fz)),u=fx-i,v=fz-j,h=this.h,n=this.nx,k=j*n+i;
  return (h[k]*(1-u)+h[k+1]*u)*(1-v)+(h[k+n]*(1-u)+h[k+n+1]*u)*v};
HF.prototype.mark=function(i0,j0,i1,j1){var d=this.dirty;i0=clamp(i0,0,this.nx-1);i1=clamp(i1,0,this.nx-1);j0=clamp(j0,0,this.nz-1);j1=clamp(j1,0,this.nz-1);
  if(!d)this.dirty=[i0,j0,i1,j1];else{d[0]=Math.min(d[0],i0);d[1]=Math.min(d[1],j0);d[2]=Math.max(d[2],i1);d[3]=Math.max(d[3],j1)}};
/* 바닥 아래 y 위쪽 흙을 (x,z) 중심, 진행방향 (ux,uz), 폭 hw, 길이 hl 직사각형 안에서 걷어낸다. 걷어낸 부피를 돌려준다 */
HF.prototype.carve=function(x,z,y,ux,uz,hw,hl,cap){var s=this,r=Math.max(hw,hl)+s.dx,i0=Math.floor((x-r-s.x0)/s.dx),i1=Math.ceil((x+r-s.x0)/s.dx),j0=Math.floor((z-r-s.z0)/s.dz),j1=Math.ceil((z+r-s.z0)/s.dz),V=0;
  for(var j=Math.max(0,j0);j<=Math.min(s.nz-1,j1);j++)for(var i=Math.max(0,i0);i<=Math.min(s.nx-1,i1);i++){var px=s.x0+i*s.dx-x,pz=s.z0+j*s.dz-z,a=px*ux+pz*uz,l=-px*uz+pz*ux;
    if(Math.abs(a)>hl||Math.abs(l)>hw)continue;var k=j*s.nx+i;if(s.h[k]>y){var dv=(s.h[k]-y)*s.ca;if(cap!==undefined&&V+dv>cap){var hh=(cap-V)/s.ca;s.h[k]-=hh;V=cap;s.mark(i0,j0,i1,j1);return V}V+=dv;s.h[k]=y}}
  if(V>0)s.mark(i0,j0,i1,j1);return V};
/* 가우스 모양으로 흙을 쌓는다 */
HF.prototype.deposit=function(x,z,V,sig){var s=this,r=sig*2.2,i0=Math.max(0,Math.floor((x-r-s.x0)/s.dx)),i1=Math.min(s.nx-1,Math.ceil((x+r-s.x0)/s.dx)),j0=Math.max(0,Math.floor((z-r-s.z0)/s.dz)),j1=Math.min(s.nz-1,Math.ceil((z+r-s.z0)/s.dz)),W=0,i,j,w=[];
  for(j=j0;j<=j1;j++)for(i=i0;i<=i1;i++){var px=s.x0+i*s.dx-x,pz=s.z0+j*s.dz-z,g=Math.exp(-(px*px+pz*pz)/(2*sig*sig));w.push(g);W+=g}
  if(W<1e-6)return 0;var n=0;for(j=j0;j<=j1;j++)for(i=i0;i<=i1;i++){s.h[j*s.nx+i]+=V*w[n++]/W/s.ca}
  s.mark(i0,j0,i1,j1);return V};
/* 안식각을 넘는 경사는 흙이 흘러내린다 (부피 보존) */
HF.prototype.relax=function(i0,j0,i1,j1,maxD,it){var s=this,h=s.h,n=s.nx;i0=Math.max(0,i0);j0=Math.max(0,j0);i1=Math.min(s.nx-1,i1);j1=Math.min(s.nz-1,j1);
  for(var t=0;t<it;t++)for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var k=j*n+i;
    for(var q=0;q<2;q++){var kk=q?(j<s.nz-1?k+n:-1):(i<s.nx-1?k+1:-1);if(kk<0)continue;var d=h[k]-h[kk];
      if(d>maxD){var m=(d-maxD)/2;if(s.cap){m=Math.min(m,s.cap[kk]-h[kk]);if(m<=0)continue}h[k]-=m;h[kk]+=m}else if(-d>maxD){var m2=(-d-maxD)/2;if(s.cap){m2=Math.min(m2,s.cap[k]-h[k]);if(m2<=0)continue}h[k]+=m2;h[kk]-=m2}}}
  s.mark(i0-1,j0-1,i1+1,j1+1)};
/* 직사각형(진행방향 ux,uz · 반폭 hw · 반길이 hl) 안에서 y보다 낮은 곳을 흙 V 한도로 메운다. 쓴 부피를 돌려준다 */
HF.prototype.fill=function(x,z,y,ux,uz,hw,hl,V){var s=this,r=Math.max(hw,hl)+s.dx,i0=Math.floor((x-r-s.x0)/s.dx),i1=Math.ceil((x+r-s.x0)/s.dx),j0=Math.floor((z-r-s.z0)/s.dz),j1=Math.ceil((z+r-s.z0)/s.dz),U=0;
  for(var j=Math.max(0,j0);j<=Math.min(s.nz-1,j1)&&U<V;j++)for(var i=Math.max(0,i0);i<=Math.min(s.nx-1,i1)&&U<V;i++){var px=s.x0+i*s.dx-x,pz=s.z0+j*s.dz-z;
    if(Math.abs(px*ux+pz*uz)>hl||Math.abs(-px*uz+pz*ux)>hw)continue;var k=j*s.nx+i;if(s.h[k]<y){var dv=Math.min((y-s.h[k])*s.ca,V-U);s.h[k]+=dv/s.ca;U+=dv}}
  if(U>0)s.mark(i0,j0,i1,j1);return U};
/* 같은 직사각형 안을 y 높이로 고른다 (k = 한 번에 다가가는 비율). 움직인 부피를 돌려준다 */
HF.prototype.level=function(x,z,y,ux,uz,hw,hl,k){var s=this,r=Math.max(hw,hl)+s.dx,i0=Math.floor((x-r-s.x0)/s.dx),i1=Math.ceil((x+r-s.x0)/s.dx),j0=Math.floor((z-r-s.z0)/s.dz),j1=Math.ceil((z+r-s.z0)/s.dz),U=0;
  for(var j=Math.max(0,j0);j<=Math.min(s.nz-1,j1);j++)for(var i=Math.max(0,i0);i<=Math.min(s.nx-1,i1);i++){var px=s.x0+i*s.dx-x,pz=s.z0+j*s.dz-z;
    if(Math.abs(px*ux+pz*uz)>hl||Math.abs(-px*uz+pz*ux)>hw)continue;var q=j*s.nx+i,d=(y-s.h[q])*k;if(Math.abs(d)>1e-4){s.h[q]+=d;U+=Math.abs(d)*s.ca}}
  if(U>0)s.mark(i0,j0,i1,j1);return U};
/* 축에 나란한 작은 상자 안에 흙 V를 고르게 얹는다 */
HF.prototype.addBox=function(x,z,hx,hz,V){var s=this,i0=Math.max(0,Math.ceil((x-hx-s.x0)/s.dx)),i1=Math.min(s.nx-1,Math.floor((x+hx-s.x0)/s.dx)),j0=Math.max(0,Math.ceil((z-hz-s.z0)/s.dz)),j1=Math.min(s.nz-1,Math.floor((z+hz-s.z0)/s.dz)),n=(i1-i0+1)*(j1-j0+1);
  if(n<=0)return 0;var d=V/n/s.ca;for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++)s.h[j*s.nx+i]+=d;s.mark(i0,j0,i1,j1);return V};
/* 상자 안에서 y 위쪽 흙의 부피 */
HF.prototype.above=function(x0,x1,z0,z1,y){var s=this,i0=Math.max(0,Math.ceil((x0-s.x0)/s.dx)),i1=Math.min(s.nx-1,Math.floor((x1-s.x0)/s.dx)),j0=Math.max(0,Math.ceil((z0-s.z0)/s.dz)),j1=Math.min(s.nz-1,Math.floor((z1-s.z0)/s.dz)),V=0;
  for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var e=s.h[j*s.nx+i]-y;if(e>0)V+=e}return V*s.ca};
HF.prototype.ij=function(x,z){return [Math.round((x-this.x0)/this.dx),Math.round((z-this.z0)/this.dz)]};
HF.prototype.update=function(force){var s=this,d=s.dirty;if(!d&&!force)return;if(!d)d=[0,0,s.nx-1,s.nz-1];
  var P=s.geo.attributes.position.array,Cc=s.geo.attributes.color.array,c=new T.Color();
  for(var j=d[1];j<=d[3];j++)for(var i=d[0];i<=d[2];i++){var k=j*s.nx+i,x=s.x0+i*s.dx,z=s.z0+j*s.dz,h=s.h[k],e=h-s.b[k];
    P[k*3+1]=(s.hide&&e<.012)?s.b[k]-.06:h;s.col(c,h,x,z,e);Cc[k*3]=c.r;Cc[k*3+1]=c.g;Cc[k*3+2]=c.b}
  s.geo.attributes.position.needsUpdate=true;s.geo.attributes.color.needsUpdate=true;s.geo.computeVertexNormals();s.dirty=null};
HF.prototype.total=function(){var V=0;for(var k=0;k<this.h.length;k++)V+=(this.h[k]-this.b[k]);return V*this.ca};

/* ===================== 길 (모서리를 둥글린 닫힌 고리) ===================== */
function Loop(corners,R){var pts=[],n=corners.length;
  for(var i=0;i<n;i++){var p=corners[(i+n-1)%n],c=corners[i],q=corners[(i+1)%n];
    var a=[p[0]-c[0],p[1]-c[1]],b=[q[0]-c[0],q[1]-c[1]],la=Math.hypot(a[0],a[1]),lb=Math.hypot(b[0],b[1]);a=[a[0]/la,a[1]/la];b=[b[0]/lb,b[1]/lb];
    var th=Math.acos(clamp(a[0]*b[0]+a[1]*b[1],-1,1)),t=R/Math.tan(th/2),s0=[c[0]+a[0]*t,c[1]+a[1]*t],s1=[c[0]+b[0]*t,c[1]+b[1]*t];
    for(var k=0;k<=12;k++){var u=k/12,x=(1-u)*(1-u)*s0[0]+2*u*(1-u)*c[0]+u*u*s1[0],z=(1-u)*(1-u)*s0[1]+2*u*(1-u)*c[1]+u*u*s1[1];pts.push([x,z])}}
  /* 0.25 m 간격으로 다시 나눔 */
  var S=[0];for(i=1;i<=pts.length;i++){var A=pts[i-1],B=pts[i%pts.length];S.push(S[i-1]+Math.hypot(B[0]-A[0],B[1]-A[1]))}
  var L=S[pts.length],M=Math.ceil(L/.25),X=new Float32Array(M),Z=new Float32Array(M),j=0;
  for(k=0;k<M;k++){var sv=k*L/M;while(S[j+1]<sv)j++;var f=(sv-S[j])/(S[j+1]-S[j]),A2=pts[j],B2=pts[(j+1)%pts.length];X[k]=A2[0]+(B2[0]-A2[0])*f;Z[k]=A2[1]+(B2[1]-A2[1])*f}
  this.L=L;this.M=M;this.X=X;this.Z=Z;this.ds=L/M;
  /* 곡률 → 허용 속도 */
  this.V=new Float32Array(M);for(k=0;k<M;k++){var h0=this.head(k*this.ds-2),h1=this.head(k*this.ds+2),cur=Math.abs(angDiff(h0,h1))/4;this.V[k]=cur>1e-3?Math.sqrt(1.3/cur):99}
  var V2=new Float32Array(M);for(k=0;k<M;k++){var mn=99;for(var q=-24;q<=24;q++)mn=Math.min(mn,this.V[(k+q+M)%M]);V2[k]=mn}this.V=V2}
Loop.prototype.at=function(s,o){var L=this.L;s=((s%L)+L)%L;var f=s/this.ds,i=Math.floor(f)%this.M,j=(i+1)%this.M,u=f-Math.floor(f);o=o||{};o.x=this.X[i]+(this.X[j]-this.X[i])*u;o.z=this.Z[i]+(this.Z[j]-this.Z[i])*u;return o};
Loop.prototype.head=function(s){var a=this.at(s-.5),b=this.at(s+.5);return Math.atan2(b.x-a.x,b.z-a.z)};
Loop.prototype.vmax=function(s){var L=this.L;s=((s%L)+L)%L;return this.V[Math.floor(s/this.ds)%this.M]};
Loop.prototype.fwd=function(a,b){var d=(b-a)%this.L;return d<0?d+this.L:d};
Loop.prototype.ribbon=function(w,m,y){var n=this.M,P=new Float32Array(n*6),I=[],o={},o2={};
  for(var k=0;k<n;k++){this.at(k*this.ds,o);var h=this.head(k*this.ds),nx=Math.cos(h),nz=-Math.sin(h);P.set([o.x+nx*w/2,y,o.z+nz*w/2,o.x-nx*w/2,y,o.z-nz*w/2],k*6);
    var a=k*2,b=((k+1)%n)*2;I.push(a,b,a+1,b,b+1,a+1)}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();var me=new T.Mesh(g,m);me.receiveShadow=true;scene.add(me);return me};
