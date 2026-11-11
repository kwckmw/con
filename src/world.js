/* ===================== world: 현장 지형 · 길 · 시설 ===================== */
var PIT={x0:2,x1:30,z0:-6,z1:12};
/* 동측 확장 구역: 성토장 · 토사 적치장 · 노반 정지 구간 · 관로 굴착 구간 */
var Z2={PAD:{x0:62,x1:96,z0:-36,z1:0},BOR:{x0:128,x1:150,z0:-36,z1:-4},BED:{x0:62,x1:148,z0:6,z1:18},TRN:{x0:62,x1:148,z0:22,z1:32},X1:160};
/* 두 운반로 모두 크레인 앞 공용 덤프로(z=3, x -8 ~ -30)를 지난다. 합류 구간은 한 번에 한 운반로만 진입 */
var LN=new Loop([[28,-9.4],[-8,-9.4],[-8,3],[-30,3],[-30,-32],[28,-32]],6.2);LN.id='N';   /* 북측: EX-01 적재 → 남하 → 덤프로 → 북상 */
var LS=new Loop([[46,15.4],[-4,15.4],[-4,3],[-30,3],[-30,37],[46,37]],6.2);LS.id='S';     /* 남측: EX-02 적재 → 북상 → 덤프로 → 남하 */
var STRATA=[[.3,0x9F907A],[-.25,0x6b5440],[-.7,0x8f6646],[-2.2,0xa88a62],[-3.6,0x837765],[-5.2,0x726b62],[-6.6,0x615d58]];
var _ca=new T.Color(),_cb=new T.Color();
function strata(c,y,j){var i=0;while(i<STRATA.length-1&&y<STRATA[i+1][0])i++;c.setHex(STRATA[i][1]);
  if(i<STRATA.length-1){var d=y-STRATA[i+1][0];if(d<.18){_cb.setHex(STRATA[i+1][1]);c.lerp(_cb,(.18-d)/.36)}}
  c.offsetHSL(0,0,(j||0));return c}
function noise2(x,z){return Math.sin(x*1.7+z*.9)*.5+Math.sin(x*.37-z*1.3)*.35+Math.sin(x*4.1+z*3.7)*.15}
(function(){
  /* 바깥 땅: 구덩이를 둘러싼 네 조각 (색 얼룩을 넣으려고 잘게 나눔) */
  /* 높이 격자가 땅 아래로 내려가는 자리(구덩이 · 노반 · 관로)는 바깥 땅에서 오려 낸다 */
  var G=[[-130,-100,230,100]];[PIT,Z2.BED,Z2.TRN].forEach(function(h){var N=[];G.forEach(function(r){if(h.x0>=r[2]||h.x1<=r[0]||h.z0>=r[3]||h.z1<=r[1]){N.push(r);return}
    if(h.x0>r[0])N.push([r[0],r[1],h.x0,r[3]]);if(h.x1<r[2])N.push([h.x1,r[1],r[2],r[3]]);var a=Math.max(r[0],h.x0),b=Math.min(r[2],h.x1);if(h.z0>r[1])N.push([a,r[1],b,h.z0]);if(h.z1<r[3])N.push([a,h.z1,b,r[3]])});G=N});
  G.forEach(function(r){var w=r[2]-r[0],d=r[3]-r[1],g=new T.PlaneGeometry(w,d,Math.max(1,Math.round(w/4)),Math.max(1,Math.round(d/4)));g.rotateX(-Math.PI/2);g.translate((r[0]+r[2])/2,0,(r[1]+r[3])/2);
    var P=g.attributes.position,C=new Float32Array(P.count*3),c=new T.Color();for(var i=0;i<P.count;i++){var x=P.getX(i),z=P.getZ(i);c.setHex(0x9F907A);c.offsetHSL(0,0,noise2(x*.15,z*.15)*.025);C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b}
    g.setAttribute('color',new T.BufferAttribute(C,3));var m=new T.Mesh(g,mat(0xffffff,{vc:true,r:.98}));m.receiveShadow=true;scene.add(m)});
  /* 구덩이 벽: 지층 띠 (위에서 -8 m 까지) */
  function wall(x0,z0,x1,z1){var L=Math.hypot(x1-x0,z1-z0),g=new T.PlaneGeometry(L,8,Math.round(L/1.5),48);g.translate(0,-4,0);
    var P=g.attributes.position,C=new Float32Array(P.count*3),c=new T.Color();
    for(var i=0;i<P.count;i++){var y=P.getY(i),u=P.getX(i);P.setZ(i,Math.sin(u*1.3)*.06+Math.sin(u*.41+y)*.08);strata(c,y+Math.sin(u*.8)*.12,noise2(u*.6,y*2)*.03);C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b}
    g.setAttribute('color',new T.BufferAttribute(C,3));g.computeVertexNormals();var m=new T.Mesh(g,mat(0xffffff,{vc:true,r:.97}));
    m.position.set((x0+x1)/2,0,(z0+z1)/2);m.rotation.y=-Math.atan2(z1-z0,x1-x0);m.receiveShadow=true;scene.add(m)}
  wall(PIT.x0,PIT.z0,PIT.x1,PIT.z0);wall(PIT.x0,PIT.z1,PIT.x0,PIT.z0);wall(PIT.x1,PIT.z0,PIT.x1,PIT.z1);
  /* 남측 흙막이: 강널말뚝 + 띠장 */
  var spg=new T.BoxGeometry(.6,9.5,.1),spm=mat(0x6f7684,{r:.55,m:.35}),n=Math.round((PIT.x1-PIT.x0)/.58),spi=new T.InstancedMesh(spg,spm,n),dm=new T.Object3D();
  for(var i=0;i<n;i++){dm.position.set(PIT.x0+.29+i*.58,-4.0,PIT.z1+((i%2)?.12:-.02));dm.rotation.set(0,(i%2)?.35:-.35,0);dm.updateMatrix();spi.setMatrixAt(i,dm.matrix)}spi.castShadow=spi.receiveShadow=true;scene.add(spi);
  [-1.6,-3.6].forEach(function(y){box(PIT.x1-PIT.x0,.35,.3,mat(0x3d5bd9,{r:.5,m:.3}),(PIT.x0+PIT.x1)/2,y,PIT.z1-.2)});
  box(PIT.x1-PIT.x0,.25,.25,mat(0xe0b020,{r:.6}),(PIT.x0+PIT.x1)/2,1.05,PIT.z1+.3);
  for(var x=PIT.x0+.2;x<PIT.x1;x+=2)box(.08,1.1,.08,mat(0x9aa0ad),x,.55,PIT.z1+.3);
  /* 북측 단부 표지 */
  var coneG=new T.ConeGeometry(.2,.7,12),cim=new T.InstancedMesh(coneG,mat(0xff7a1a,{r:.6}),24);
  for(var c=0;c<24;c++){dm.position.set(PIT.x0+.6+c*1.18,.35,PIT.z0-.7);dm.rotation.set(0,0,0);dm.updateMatrix();cim.setMatrixAt(c,dm.matrix)}cim.castShadow=true;scene.add(cim);
})();
/* 구덩이 바닥 높이 격자: 1단 -2.4 m, 2단 -4.8 m, 2단으로 내려가는 경사로 */
var PITF=new HF({x0:PIT.x0,z0:PIT.z0,w:PIT.x1-PIT.x0,d:PIT.z1-PIT.z0,nx:95,nz:61,base:function(){return -8},
  init:function(x,z){return noise2(x*.7,z*.7)*.03-.03},
  col:function(c,h,x,z){return strata(c,h,noise2(x*.9,z*.9)*.03)}});
/* 운반로 · 진입로 */
var ROADM=mat(0x948a7a,{r:.98,ds:true});
LN.ribbon(7.5,ROADM,.025);LS.ribbon(7.5,ROADM,.025);
box(19,.04,6,ROADM,-42.5,.02,-26.5);box(6,.04,52,ROADM,-41,.02,2);
(function(){var pm=mat(0xf2f2f2),rm=mat(0xe0573a),o={},list=[];[LN,LS].forEach(function(L){for(var s=0;s<L.L;s+=11){L.at(s,o);var h=L.head(s),px=o.x+Math.cos(h)*4.4,pz=o.z-Math.sin(h)*4.4,ok=true,q={};[LN,LS].forEach(function(K){for(var u=0;u<K.L;u+=1){K.at(u,q);if(Math.hypot(q.x-px,q.z-pz)<4.1)ok=false}});if(ok)list.push([px,pz])}});
  var p=new T.InstancedMesh(new T.CylinderGeometry(.06,.06,1.1,8),pm,list.length),r=new T.InstancedMesh(new T.CylinderGeometry(.065,.065,.18,8),rm,list.length),d=new T.Object3D();
  list.forEach(function(q,i){d.position.set(q[0],.55,q[1]);d.updateMatrix();p.setMatrixAt(i,d.matrix);d.position.y=.95;d.updateMatrix();r.setMatrixAt(i,d.matrix)});p.castShadow=true;scene.add(p,r)})();
/* 사토장 (높이 격자) */
var SOILC=function(c,h,x,z,e){c.setHex(0x9a7b58);c.offsetHSL(0,0,noise2(x*1.3,z*1.3)*.03-Math.min(e,6)*.006);return c};
/* 크레인 옆 사토 야적장: 덤프로 북쪽, x -26 ~ -12, z -28 ~ -1 에 능선 모양으로 쌓인다 */
var YARDP=new HF({x0:-29,z0:-30,w:20,d:38,nx:41,nz:77,base:function(){return 0},hide:true,cast:true,col:SOILC,
  init:function(x,z){var d=Math.hypot((x+19)/1.3,z+7);return Math.max(0,2.2-d*.6)}});
YARDP.road=function(x,z){return Math.abs(z-3)<4.2||Math.abs(x+30)<4.2||(Math.abs(x+8)<4.2&&z<3)||Math.abs(z+32)<4.2};YARDP.ctr=[-19,-5];YARDP.fed=0;
var YARD0=Float32Array.from(YARDP.h);
/* 펜스 · 정문 */
(function(){var fence=mat(0xc7ccd6,{r:.5,m:.2,op:.85}),post=mat(0x7d8496,{r:.5,m:.3}),FP=[],fx,fz;
  for(fx=-50.75;fx<=Z2.X1-1;fx+=2.5){FP.push([fx,-40,0]);FP.push([fx,40,0])}for(fz=-38.75;fz<=39;fz+=2.5){FP.push([Z2.X1,fz,1]);if(fz>-31&&fz<-21)continue;FP.push([-52,fz,1])}
  var fim=new T.InstancedMesh(new T.BoxGeometry(2.45,2.0,.04),fence,FP.length),pim=new T.InstancedMesh(new T.CylinderGeometry(.05,.05,2.1,6),post,FP.length),bim=new T.InstancedMesh(new T.BoxGeometry(.5,.18,.32),mat(0xe8e4dc),FP.length),d=new T.Object3D();
  FP.forEach(function(p,i){d.position.set(p[0],1.12,p[1]);d.rotation.set(0,p[2]?Math.PI/2:0,0);d.updateMatrix();fim.setMatrixAt(i,d.matrix);d.position.set(p[0]+(p[2]?0:1.25),1.05,p[1]+(p[2]?1.25:0));d.updateMatrix();pim.setMatrixAt(i,d.matrix);d.position.y=.09;d.updateMatrix();bim.setMatrixAt(i,d.matrix)});
  scene.add(fim,pim,bim);
  [-31,-21].forEach(function(z){box(.35,3.2,.35,mat(0xf0a41f),-52,1.6,z)});box(.14,.14,9,mat(0xe0573a),-52,1.25,-26);
  box(2.4,2.6,2.4,mat(0xf6f4ef),-48.5,1.3,-34.2);box(2.7,.18,2.7,mat(0x3d5bd9),-48.5,2.7,-34.2);box(1.6,.9,.05,M(0x34444f,{r:.1,op:.6}),-48.5,1.7,-33);
  /* 세륜기 */
  box(7,.12,4.4,mat(0x88a9b8,{r:.25}),-44,.07,-26.5);[-46.8,-41.2].forEach(function(x){box(.25,.5,4.4,mat(0x9aa0ad,{m:.3}),x,.3,-26.5)});
  for(var i=0;i<9;i++)box(.12,.12,4.2,mat(0x6f7684,{m:.4}),-47+i*.75,.2,-26.5);box(1.5,1.2,1.2,mat(0x3d5bd9),-44,.6,-29.5)})();
/* 현장사무소: 2층 컨테이너 + 계단 */
(function(){var walls=[0xf6f4ef,0xdfe6f2,0xf6f4ef],rib=mat(0xcfd3da);
  for(var i=0;i<3;i++)for(var j=0;j<2;j++){var x=-48.2+i*6.15,y=1.3+j*2.65;box(6,2.6,2.44,mat(walls[(i+j)%3]),x,y,31,scene);
    for(var r=0;r<11;r++)box(.06,2.4,.04,rib,x-2.7+r*.54,y,29.76);box(1.7,1.0,.05,M(0x34444f,{r:.1,op:.6}),x-1.3,y+.3,29.75);box(.9,2.0,.05,mat(0x3d5bd9),x+1.6,y-.25,29.75);box(.7,.45,.35,mat(0xe8e8e8),x+.3,y+.85,29.6)}
  box(18.6,.12,1.25,mat(0x7d8496,{m:.3}),-42,2.62,29.2);for(var p=0;p<8;p++)box(.05,1.0,.05,mat(0x7d8496),-51+p*2.6,3.15,28.6);box(18.6,.05,.05,mat(0x7d8496),-42,3.65,28.6);
  for(var s=0;s<9;s++)box(1.0,.08,.3,mat(0x7d8496),-52.4+1.0,.29*s+.15,29.2-s*.3+1.2)})();
/* 조명탑 (밤에 켜짐) */
var TOWERS=[],towerMat=new T.MeshStandardMaterial({color:0xfff4cf,emissive:0xffe39a,emissiveIntensity:0});towerMat.userData.lamp=true;
[[-3,-16,8,-2],[38,0,24,4],[16,-20,4,-8],[16,26,22,10],[112,2,104,-14],[104,20,112,26]].forEach(function(p){var g=new T.Group();g.position.set(p[0],0,p[1]);g.rotation.y=Math.atan2(-(p[3]-p[1]),p[2]-p[0]);scene.add(g);
  rbx(2.4,1.1,1.4,.08,mat(0xf0a41f,{r:.6}),0,.85,0,g);[-.8,.8].forEach(function(x){sh(cz(.28,.2,TM.TIRE,x,.28,.7),g);sh(cz(.28,.2,TM.TIRE,x,.28,-.7),g)});
  sh(cy(.1,8.6,mat(0xb8bcc4,{m:.4}),0,5.6,0,10),g);box(.2,.2,2.2,mat(0x7d8496),0,9.8,0,g);
  [-.8,-.27,.27,.8].forEach(function(z){var h=sh(rb(.35,.45,.48,.05,mat(0x3b3e42),.1,9.55,z),g);h.rotation.z=-.5;box(.04,.38,.4,towerMat,.3,9.45,z,g).rotation.z=-.5});
  var L=new T.SpotLight(0xffe6b0,0,90,Math.PI/3.6,.55,1.2);L.position.set(p[0],10,p[1]);L.target.position.set(p[2],0,p[3]);scene.add(L,L.target);TOWERS.push(L)});
/* 나무 · 바깥 도로 · 차 */
(function(){var TR=[];for(var t=0;t<120;t++){var a=t/120*Math.PI*2;TR.push([54+Math.cos(a)*124+Math.sin(t*7.1)*4,Math.sin(a)*58+Math.cos(t*3.3)*4])}
  var crown=new T.InstancedMesh(new T.IcosahedronGeometry(2,1),mat(0xa9c493,{r:.95}),TR.length),trunk=new T.InstancedMesh(new T.CylinderGeometry(.2,.26,1.8,6),mat(0x9a7d61),TR.length),d=new T.Object3D();
  TR.forEach(function(p,i){var s=.8+((i*37)%10)/20;d.position.set(p[0],2.6*s,p[1]);d.rotation.set(0,i,0);d.scale.set(s,s*1.15,s);d.updateMatrix();crown.setMatrixAt(i,d.matrix);d.position.y=.9;d.scale.set(s,s,s);d.updateMatrix();trunk.setMatrixAt(i,d.matrix)});
  crown.castShadow=true;scene.add(crown,trunk);
  box(11,.03,220,mat(0xcbc6bf),-60,.012,0);box(360,.03,11,mat(0xcbc6bf),60,.012,48);
  for(var k=-100;k<100;k+=6)box(.15,.035,2.5,mat(0xf6f4ef),-60,.02,k)})();
var cars=[];for(var ci=0;ci<6;ci++){var cg=new T.Group(),cc=mat([0xf6f4ef,0x3d5bd9,0xe0573a,0x2e3135][ci%4],{r:.45,m:.2});rbx(1.85,.7,4.3,.15,cc,0,.6,0,cg);rbx(1.65,.6,2.3,.2,M(0x34444f,{r:.1,op:.75}),0,1.2,-.25,cg);
  [[-.8,1.4],[.8,1.4],[-.8,-1.4],[.8,-1.4]].forEach(function(w){sh(cx(.32,.22,TM.TIRE,w[0],.32,w[1]),cg)});scene.add(cg);cars.push({g:cg,s:ci*37,lane:ci%2})}
function stepCars(dt){cars.forEach(function(c){c.s=(c.s+dt*12)%220;var s=c.s-110;if(c.lane){c.g.position.set(-62.5,0,-s);c.g.rotation.y=Math.PI}else{c.g.position.set(-57.5,0,s);c.g.rotation.y=0}})}
/* 작업자 (안전모 · 조끼) */
var WORKERS=[];
function worker(x,z,y,par,face){var g=new T.Group();g.position.set(x,y||0,z);g.rotation.y=face||0;(par||scene).add(g);
  var pant=mat(0x3a4152),vest=mat(0xF5D20F,{e:0x332a00,ei:.2}),skin=mat(0xd9a77f),hat=mat(0xffffff,{r:.4});
  [-.11,.11].forEach(function(s){box(.14,.8,.16,pant,0,.42,s,g)});rbx(.3,.62,.44,.08,vest,0,1.12,0,g);sh(new T.Mesh(new T.SphereGeometry(.13,12,10),skin),g).position.set(0,1.58,0);
  var h=sh(new T.Mesh(new T.SphereGeometry(.16,12,8,0,Math.PI*2,0,Math.PI/2),hat),g);h.position.set(0,1.62,0);box(.36,.03,.36,hat,0,1.62,0,g);
  [-1,1].forEach(function(s){box(.1,.56,.1,vest,0,1.1,s*.28,g)});g.traverse(function(o){o.castShadow=true});WORKERS.push(g);return g}
worker(-4,-14,0,null,.6);worker(41,21,0,null,2.6);worker(-26.6,13.5,0,null,1.2);worker(-34,13,0,null,-.4);
