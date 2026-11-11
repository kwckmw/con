/* ===================== fleet: 분해도에서 만든 장비 모델을 현장용으로 옮긴 팩토리 =====================
   휠로더 · 스키드로더 · 도저 · 모터 그레이더는 분해도의 형상 코드와 기구학을 그대로 쓰고, 색과 크기만 현장에 맞춘다.
   모델 단위 → 미터: 휠로더 1.25, 스키드로더 0.714, 도저 0.71, 그레이더 1.4 (공개 제원의 전장·궤간에 맞춘 값)
   휠 굴삭기는 HX220A 상부·작업장치에 바퀴식 하부(복륜, 도저 블레이드, 아웃트리거)를 붙인다. */
/* 휠로더 Z바 링크 기구학 (차체 옆면 2D). 틸트 실린더 길이 c와 리프트 각 th로 버킷 각을 구한다 */
var WK=(function(){
  var Bp=[.30,1.55],Kp0=[2.95,.40],Lf=[.5,.95],Tf=[.78,1.61];
  var L=Math.hypot(Kp0[0]-Bp[0],Kp0[1]-Bp[1]),u=[(Kp0[0]-Bp[0])/L,(Kp0[1]-Bp[1])/L],n=[-u[1],u[0]];
  function on(a,b){return [Bp[0]+a*u[0]+b*n[0],Bp[1]+a*u[1]+b*n[1]]}
  var Cp0=on(1.8,.5),Lp0=on(1.35,-.05),RU=.7,RD=.5,LK=1.15,RB=.5,G0=95*Math.PI/180,BE=170*Math.PI/180;
  function ci(a,ra,b,rb,sg,out){
    var dx=b[0]-a[0],dy=b[1]-a[1],ln=Math.hypot(dx,dy)||1e-3,ux=dx/ln,uy=dy/ln;
    var d=Math.min(Math.max(ln,Math.abs(ra-rb)+.005),ra+rb-.005);
    var q=(ra*ra-rb*rb+d*d)/(2*d),h=Math.sqrt(Math.max(ra*ra-q*q,0));
    out[0]=a[0]+q*ux-sg*h*uy;out[1]=a[1]+q*uy+sg*h*ux;return ln>Math.abs(ra-rb)+.02&&ln<ra+rb-.02}
  function side(a,b,p){return ((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))>=0?1:-1}
  var Bq0=[Kp0[0]+RB*Math.cos(G0),Kp0[1]+RB*Math.sin(G0)],D0=[0,0];ci(Cp0,RD,Bq0,LK,-1,D0);
  var AD=Math.atan2(D0[1]-Cp0[1],D0[0]-Cp0[0]),AU=AD+BE,U0=[Cp0[0]+RU*Math.cos(AU),Cp0[1]+RU*Math.sin(AU)];
  var C0=Math.hypot(U0[0]-Tf[0],U0[1]-Tf[1]),SU=side(Tf,Cp0,U0),SB=side(D0,Kp0,Bq0);
  function rot(p,th,out){var c=Math.cos(th),s=Math.sin(th),x=p[0]-Bp[0],y=p[1]-Bp[1];out[0]=Bp[0]+x*c-y*s;out[1]=Bp[1]+x*s+y*c;return out}
  var S={c:0,Cp:[0,0],Kp:[0,0],Lp:[0,0],U:[0,0],D:[0,0],Bq:[0,0],g:0,ca:0,ok:true,lift:0};
  function fk(th,c){
    rot(Cp0,th,S.Cp);rot(Kp0,th,S.Kp);rot(Lp0,th,S.Lp);
    var dc=Math.hypot(S.Cp[0]-Tf[0],S.Cp[1]-Tf[1]);c=Math.max(Math.abs(dc-RU)+.04,Math.min(dc+RU-.04,c));S.c=c;
    var ok1=ci(Tf,c,S.Cp,RU,SU,S.U);
    var a=Math.atan2(S.U[1]-S.Cp[1],S.U[0]-S.Cp[0]);S.ca=a-AU;
    S.D[0]=S.Cp[0]+RD*Math.cos(a-BE);S.D[1]=S.Cp[1]+RD*Math.sin(a-BE);
    var ok2=ci(S.D,LK,S.Kp,RB,SB,S.Bq);
    var g=Math.atan2(S.Bq[1]-S.Kp[1],S.Bq[0]-S.Kp[0])-G0;while(g>Math.PI)g-=2*Math.PI;while(g<-Math.PI)g+=2*Math.PI;
    S.g=g;S.ok=ok1&&ok2;S.lift=Math.hypot(S.Lp[0]-Lf[0],S.Lp[1]-Lf[1]);return S}
  return {Bp:Bp,Kp0:Kp0,Cp0:Cp0,Lp0:Lp0,Lf:Lf,Tf:Tf,U0:U0,D0:D0,Bq0:Bq0,C0:C0,u:u,n:n,on:on,fk:fk,S:S};
})();

/* 분해도의 종이색 팔레트 → 현장 팔레트. 같은 색은 재질 하나를 모든 장비가 같이 쓴다 */
var RIGC={0xF7F4EC:0xF0A41F,0xE6DFCF:0xD48C12,0xD8D2C4:0x45484D,0xA8A193:0x3B3E42,0x8C8577:0x2E3135,0xB9B2A3:0x9A9DA1,0xF0EDE6:0xF2A51C,0x6E685D:0x26282B,
  0xFFFFFF:0xC9CCD0,0xC9DCE0:0x5d6b78,0xA9C3C9:0x4c5964,0xF0D2B8:0x8a6a4a,0xDAD6CC:0x4a4d52,0xD3DCEB:0x4a5f8a,0x9A9384:0x3F4144,0xE3E0D8:0x55575B,0xEDEAE2:0x55575B,0xC9C2B4:0x3A3C3F,
  0xCFC9BC:0x55575B,0x4A453D:0x1E1F21,0x9C7B57:0x9b7a55,0xDCEBF0:0x34444f,0xC2410C:0xe0573a},RIGM={};
function rigMat(c,o){o=o||{};var k=c+'|'+(o.r===undefined?'':o.r)+'|'+(o.op===undefined?'':o.op)+(o.basic?'b':''),m=RIGM[k];if(m)return m;
  var hex=RIGC[c]!==undefined?RIGC[c]:c,tire=(c===0x8C8577&&o.r===.95);
  if(o.basic){m=new T.MeshStandardMaterial({color:hex,emissive:hex,emissiveIntensity:.6});m.userData.lamp=true}
  else if(o.op!==undefined)m=TM.GL;
  else m=new T.MeshStandardMaterial({color:tire?0x1E1F21:hex,roughness:tire?.95:(hex===0xC9CCD0?.28:hex===0xF0A41F||hex===0xD48C12?.55:.65),metalness:hex===0xC9CCD0?.7:(hex===0xF0A41F||hex===0xD48C12?.05:.25)});
  return RIGM[k]=m}
var RG={gBar:new T.CylinderGeometry(.12,.12,1,14),gRod:new T.CylinderGeometry(.065,.065,1,10),gCol:new T.CylinderGeometry(.155,.155,.1,14),gEye:new T.CylinderGeometry(.1,.1,.34,12)};RG.gEye.rotateX(Math.PI/2);
function makeRig(kind){
  var WL=kind==='wl',SL=kind==='sl',DZ=kind==='dz',MG=kind==='mg',EX=false,WX=false,DT=false,S={wl:1.25,sl:.714,dz:.71,mg:1.4}[kind];
  var root=new T.Group(),body=new T.Group();body.scale.setScalar(S);root.add(body);
  var P={},LIST=[],WSP=[],TRK=[],SPR=[],soilMesh=null,HX=1.95,BR=.55,BY=.55,TZ=1.15,Z0=.3,UP=new V3(0,1,0);
  function M(c,o){return rigMat(c,o)}function MB(c){return rigMat(c,{basic:1})}function addEdge(){}
  function def(id,name,grp,o){o=o||{};var p={id:id,g:new T.Group(),lat:o.lat||0,fk:o.fk||0,dyn:!!o.dyn,sw:o.sw!==undefined?o.sw:grp!=='lower',sg:null,rig:null,meshes:[],mats:[]};
    p.g.matrixAutoUpdate=false;if(p.lat){p.sg={'-1':new T.Group(),'1':new T.Group()};p.g.add(p.sg['-1'],p.sg['1'])}P[id]=p;LIST.push(p);body.add(p.g);return p}
  function putG(p,g,mesh){g.add(mesh);return mesh}
  function put(p,mesh,side){return putG(p,side?p.sg[side]:p.g,mesh)}
  var gBar=RG.gBar,gRod=RG.gRod,gCol=RG.gCol,gEye=RG.gEye;
  function cylSet(p,mb,mr,me){return {barrel:put(p,new T.Mesh(gBar,mb)),rod:put(p,new T.Mesh(gRod,mr)),col:put(p,new T.Mesh(gCol,me)),ea:put(p,new T.Mesh(gEye,me)),eb:put(p,new T.Mesh(gEye,me))}}
  function cylPart(id,name,off,lb,pair,grp,sw){
    var p=def(id,name,grp||'work',{dyn:true,sw:sw}),mb=M(0xD8D2C4),mr=M(C.CH,{r:.4}),me=M(0xB9B2A3);
    p.rig=cylSet(p,mb,mr,me);p.rig.lb=lb;if(pair){p.rig.pair=cylSet(p,mb,mr,me);p.rig.pair.lb=lb;p.rig.dz=pair}return p}
if(DZ){
/* ===== 하부 주행부 ===== */
(function(){
  var p=def('idler','아이들러','lower',{off:[1.2,0,0],lat:1.2,anchor:[HX,.62,-1.5]});
  var mw=M(0xE3E0D8),mh=M(C.HUB),mf=M(0xF0EDE6);
  [-1,1].forEach(function(s){var z=s*TZ;
    put(p,cz(.42,.4,mw,HX,BY,z),s);put(p,cz(.47,.07,mf,HX,BY,z-.2),s);put(p,cz(.47,.07,mf,HX,BY,z+.2),s);put(p,cz(.18,.58,mh,HX,BY,z,16),s)})
})();
(function(){
  var p=def('track','트랙','lower',{lat:2.6,anchor:[1.1,1.14,-1.15]});
  var mb=M(C.BELT,{r:.9}),ms=M(C.SHOE,{r:.8}),mg=M(0x6E685D,{r:.8}),N=54;
  [-1,1].forEach(function(s){
    var sh=new T.Shape();trace(sh,HX,BR);var hole=new T.Path();trace(hole,HX,.42);sh.holes.push(hole);
    var g=new T.ExtrudeGeometry(sh,{depth:.62,bevelEnabled:false,curveSegments:20});g.translate(0,0,-.31);
    var belt=new T.Mesh(g,mb);belt.position.set(0,BY,s*TZ);put(p,belt,s);
    var im=new T.InstancedMesh(new T.BoxGeometry(.17,.07,.7),ms,N);
    var gm=new T.InstancedMesh(new T.BoxGeometry(.04,.05,.7),mg,N);
    [im,gm].forEach(function(m){m.frustumCulled=false;m.position.set(0,BY,s*TZ);put(p,m,s)});
    TRK.push({s:im,g:gm})})
})();
(function(){
  var p=def('uroll','상부롤러','lower',{off:[0,.9,0],lat:1.2,anchor:[.6,.88,-1.4]});
  var m=M(0xEDEAE2),mh=M(C.HUB);
  [-1,1].forEach(function(s){[-.5,.6].forEach(function(x){var z=s*TZ;
    put(p,cz(.12,.34,m,x,.85,z,18),s);put(p,cz(.15,.06,mh,x,.85,z-.15,18),s);put(p,cz(.15,.06,mh,x,.85,z+.15,18),s)})})
})();
(function(){
  var p=def('lroll','하부롤러','lower',{off:[0,-.5,0],lat:1.2,anchor:[.6,.3,-1.4]});
  var m=M(0xEDEAE2),mf=M(0xC9C2B4);
  [-1,1].forEach(function(s){[-1.2,-.6,0,.6,1.2].forEach(function(x){var z=s*TZ;
    put(p,cz(.17,.32,m,x,.3,z,18),s);put(p,cz(.21,.07,mf,x,.3,z-.19,18),s);put(p,cz(.21,.07,mf,x,.3,z+.19,18),s)})})
})();
(function(){
  var p=def('sprocket','스프로켓','lower',{off:[-1.2,0,0],lat:1.2,anchor:[-HX,.62,-1.45]});
  var m=M(0xD8D2C4),mt=M(0xF0EDE6),mh=M(C.HUB);
  [-1,1].forEach(function(s){var z=s*TZ,x0=-HX;
    put(p,cz(.34,.4,m,x0,BY,z),s);put(p,cz(.17,.6,mh,x0,BY,z,16),s);
    var tg=new T.Group();tg.position.set(x0,BY,z);SPR.push(tg);p.sg[s].add(tg);
    for(var k=0;k<14;k++){var a=k/14*Math.PI*2,t=bx(.16,.14,.42,mt,Math.cos(a)*.4,Math.sin(a)*.4,0);t.rotation.z=a;putG(p,tg,t)}})
})();
(function(){
  var p=def('tmotor','주행모터','lower',{off:[-1.4,0,0],lat:-.35,anchor:[-HX,.3,-.62]});
  var md=M(C.YD),mc=M(0xC9DCE0),mb=M(C.HUB);
  /* 트랙 안쪽(차체 쪽), 스프로켓 뒤에 붙는 모터 + 최종 감속기 */
  [-1,1].forEach(function(s){
    put(p,cz(.3,.2,md,-HX,BY,s*.69),s);
    put(p,cz(.23,.16,mc,-HX,BY,s*.51),s);
    put(p,cz(.08,.06,mb,-HX,BY,s*.41,12),s);
    for(var k=0;k<6;k++){var a=k/6*Math.PI*2;put(p,cz(.025,.05,mb,-HX+Math.cos(a)*.24,BY+Math.sin(a)*.24,s*.58,8),s,true)}})
})();
(function(){
  var p=def('lower','하부 프레임','lower',{anchor:[1.15,.8,-.75]});
  var m=M(C.GR);
  [-1,1].forEach(function(s){put(p,rb(3.1,.26,.3,.06,m,0,.61,s*TZ))});
  [-1,1].forEach(function(s){put(p,rb(.5,.34,2.3,.08,m,s*1.0,.65,0))});
  put(p,rb(2.4,.46,1.5,.12,m,0,.8,0));
})();
}
/* ===== 휠로더 ===== */
var WR=.62,WZ=.87,FAX=1.0,RAX=-1.4,PVX=-.2,KX,KY;
if(WL){(function(){
  KX=WK.Kp0[0];KY=WK.Kp0[1];
  /* 재질은 부품마다 따로 만든다 (같이 쓰면 선택 강조가 다른 부품까지 번진다) */
  var MC={},p,i;
  function pm(c){var k=LIST[LIST.length-1].id+'|'+c;return MC[k]||(MC[k]=M(c))}
  function wheels(id,name,grp,ax,sw){
    var p=def(id,name,grp,{lat:1.0,anchor:[ax,WR+.35,-WZ-.26],sw:sw});
    var mt=M(0x8C8577,{r:.95}),mr=M(0xF0EDE6),ml=M(0x6E685D,{r:.9});
    [-1,1].forEach(function(s){
      var g=new T.Group();g.position.set(ax,WR,s*WZ);p.sg[s].add(g);WSP.push(g);
      putG(p,g,cz(WR-.03,.5,mt,0,0,0,32));putG(p,g,cz(.36,.52,mr,0,0,0,24));putG(p,g,cz(.15,.58,pm(C.HUB),0,0,0,16));
      var k,a,t;
      for(k=0;k<16;k++){a=k/16*Math.PI*2;t=bx(.1,.07,.5,ml,Math.cos(a)*(WR-.01),Math.sin(a)*(WR-.01),0);t.rotation.z=a+Math.PI/2;putG(p,g,t,true)}
      for(k=0;k<8;k++){a=k/8*Math.PI*2;putG(p,g,cz(.03,.6,pm(C.HUB),Math.cos(a)*.25,Math.sin(a)*.25,0,8),true)}})}
  function axle(id,name,grp,ax,sw){
    var p=def(id,name,grp,{anchor:[ax,WR,-.45],sw:sw});
    put(p,cz(.15,1.36,pm(C.GR),ax,WR,0,18));put(p,cx(.27,.42,pm(C.GR),ax,WR,0,22));put(p,cx(.12,.2,pm(C.HUB),ax+(ax>0?-.3:.3),WR,0,14));
    [-1,1].forEach(function(s){put(p,cz(.24,.12,pm(C.HUB),ax,WR,s*.6,20))})}

  /* 프런트 차체 */
  wheels('fwheel','앞바퀴','front',FAX,true);
  axle('faxle','앞차축','front',FAX,true);
  p=def('fframe','프런트 프레임','front',{off:[0,1.0,0],anchor:[.55,1.6,-.3],sw:true});
  put(p,rb(1.25,.46,.6,.08,pm(C.Y),.6,.98,0));
  put(p,rb(.34,.56,.5,.06,pm(C.YD),PVX+.22,1.0,0));
  put(p,bx(.2,.1,.95,pm(C.YD),PVX+.45,.95,0));
  [-1,1].forEach(function(s){
    var sh=new T.Shape();sh.moveTo(0,1.15);sh.lineTo(.12,1.8);sh.lineTo(.5,1.8);sh.lineTo(1.05,1.76);sh.lineTo(1.12,1.15);sh.closePath();
    var pl=ext(sh,.08,pm(C.Y),.01);pl.position.z=s*.3;put(p,pl)});
  put(p,cz(.1,1.14,pm(0xB9B2A3),WK.Bp[0],WK.Bp[1],0,16));
  put(p,cz(.08,.5,pm(0xB9B2A3),WK.Tf[0],WK.Tf[1],0,14));
  put(p,cz(.08,1.1,pm(0xB9B2A3),WK.Lf[0],WK.Lf[1],0,14));
  p=def('valve','컨트롤 밸브','front',{off:[.3,1.9,-2.0],anchor:[.72,1.34,-.2],sw:true});
  put(p,rb(.42,.26,.4,.05,M(0xD3DCEB),.72,1.34,0));
  for(i=0;i<4;i++)put(p,cz(.03,.52,M(0xFFFFFF),.58+i*.09,1.34,0,8),null,true);
  p=def('joint','센터 핀','front',{off:[0,1.0,-1.7],anchor:[PVX,1.3,0],sw:false});
  put(p,cy(.08,.26,pm(0xB9B2A3),PVX,1.2,0,16));put(p,cy(.08,.26,pm(0xB9B2A3),PVX,.8,0,16));
  put(p,cy(.15,.06,M(C.TL),PVX,1.35,0,20));put(p,cy(.15,.06,M(C.TL),PVX,.65,0,20));
  cylPart('stcyl','조향 실린더',[0,.3,0],.7,.42,'front',false);
  p=def('shaft','구동축','front',{off:[0,.35,0],dyn:true,sw:false});
  (function(){var gs=new T.CylinderGeometry(.055,.055,1,12),ms=M(0xD8D2C4);
    p.rig={type:'shaft',b1:put(p,new T.Mesh(gs,ms)),b2:put(p,new T.Mesh(gs,ms)),b3:put(p,new T.Mesh(gs,ms)),j:put(p,new T.Mesh(new T.SphereGeometry(.09,12,8),pm(0xB9B2A3)),null,true)}})();

  /* 리어 차체 */
  wheels('rwheel','뒷바퀴','rear',RAX,false);
  axle('raxle','뒷차축','rear',RAX,false);
  p=def('rframe','리어 프레임','rear',{off:[0,1.0,0],anchor:[-1.9,.95,-.5],sw:false});
  put(p,rb(2.0,.36,1.0,.08,pm(C.GR),-1.9,.95,0));
  put(p,rb(.75,.34,.5,.06,pm(C.GR),-.56,.95,0));
  put(p,rb(.3,.7,.56,.06,pm(C.YD),PVX-.2,1.0,0));
  [-1,1].forEach(function(s){put(p,rb(1.4,.07,.52,.03,pm(C.YD),RAX,1.36,s*WZ))});
  [.55,.85].forEach(function(y){put(p,bx(.34,.04,.24,pm(C.DK),-.72,y,-.7))});
  [-.56,-.88].forEach(function(x){put(p,bx(.04,.8,.04,pm(C.DK),x,.86,-.8),null,true)});
  p=def('trans','변속기','rear',{off:[-.2,2.0,-2.4],anchor:[-1.15,1.0,-.3],sw:false});
  put(p,rb(.5,.44,.6,.06,M(0xC9DCE0),-1.15,1.0,0));
  put(p,cx(.26,.2,M(0xA9C3C9),-1.45,1.3,0,22));
  put(p,rb(.3,.36,.4,.04,M(0xC9DCE0),-1.05,.8,0));
  p=def('engine','엔진','rear',{off:[-.9,3.7,0],anchor:[-2.05,1.7,-.36],sw:false});
  put(p,rb(1.0,.55,.7,.06,M(0xC9DCE0),-2.05,1.52,0));
  for(i=0;i<4;i++)put(p,rb(.16,.14,.6,.03,M(0xA9C3C9),-2.38+i*.22,1.87,0));
  put(p,rb(.1,.75,1.2,.03,M(0xF0D2B8),-2.85,1.66,0));
  put(p,cx(.32,.05,M(0x6E685D),-2.75,1.66,0,22));
  p=def('pump','유압펌프','rear',{off:[-.5,3.0,-2.2],anchor:[-1.38,1.72,-.17],sw:false});
  put(p,cx(.17,.3,M(0xF0D2B8),-1.38,1.72,0,20));put(p,rb(.18,.24,.26,.04,M(0xF0D2B8),-1.38,1.88,0));
  p=def('tank','유압 탱크','rear',{off:[-.6,2.9,2.6],anchor:[-1.4,1.75,.34],sw:false});
  put(p,rb(.5,.6,.36,.06,M(0xDAD6CC),-1.4,1.75,.52));put(p,cy(.07,.08,M(0xFFFFFF),-1.4,2.08,.52,14));
  p=def('hood','엔진 후드','rear',{off:[-.5,2.3,0],anchor:[-2.05,2.13,-.75],sw:false});
  put(p,rb(1.75,.9,1.5,.14,pm(C.Y),-2.05,1.68,0));
  put(p,cy(.06,.5,pm(C.DK),-1.6,2.38,.35,12));put(p,cy(.1,.22,pm(C.DK),-2.2,2.24,-.35,14));
  put(p,cx(.025,1.2,M(0x6E685D),-2.05,2.5,.7,8),null,true);
  [-2.6,-2.05,-1.5].forEach(function(x){put(p,cy(.022,.38,M(0x6E685D),x,2.31,.7,8),null,true)});
  p=def('cab','캐빈','rear',{off:[-.2,3.3,0],anchor:[-.7,2.1,-.58],sw:false});
  (function(){var ms=M(0x6E685D,{r:.9}),mg=M(C.GL,{r:.2,op:.35});
    put(p,rb(1.0,.12,1.15,.04,pm(C.Y),-.7,1.3,0));
    [-1.15,-.25].forEach(function(x){[-.52,.52].forEach(function(z){put(p,rb(.08,1.15,.08,.02,pm(C.Y),x,1.93,z))})});
    put(p,rb(1.12,.1,1.3,.04,pm(C.Y),-.7,2.55,0));
    var g=new T.Mesh(new T.BoxGeometry(.86,1.1,1.0),mg);g.position.set(-.7,1.93,0);put(p,g,null,true);g.castShadow=false;
    put(p,rb(.4,.12,.42,.04,ms,-.85,1.6,0));put(p,rb(.1,.5,.4,.04,ms,-1.05,1.87,0));
    var col=cy(.03,.45,pm(C.DK),-.44,1.6,0,10);col.rotation.z=-.3;put(p,col);
    var wh=new T.Mesh(new T.TorusGeometry(.14,.022,8,24),ms);wh.position.set(-.5,1.84,0);wh.rotation.y=Math.PI/2;wh.rotation.z=.3;put(p,wh,null,true);
    put(p,cy(.025,.26,pm(C.DK),-.72,1.78,.36,8));put(p,cy(.05,.06,ms,-.72,1.93,.36,10))})();
  p=def('cw','카운터웨이트','rear',{off:[-1.9,1.0,0],anchor:[-3.13,1.3,-.95],sw:false});
  put(p,rb(.4,.8,1.9,.15,pm(C.GR),-3.13,1.2,0));
  [-1,1].forEach(function(s){put(p,bx(.05,.12,.22,MB(0xC2410C),-3.34,1.42,s*.7))});

  /* 작업장치 */
  p=def('arm','리프트 암','work',{off:[.9,2.3,0],fk:1,anchor:[1.5,1.6,-.45],sw:true});
  (function(){var Bp=WK.Bp,mid=WK.on(1.5,.14),pts=[Bp,mid,WK.Kp0],hw=[.19,.25,.15],C0=WK.Cp0,br=WK.on(1.8,.15),lo=WK.on(2.45,0);
    [-1,1].forEach(function(s){
      var b=ext(beamShape(pts,hw),.12,pm(C.Y),.015);b.position.z=s*.45;put(p,b);
      put(p,cz(.2,.14,pm(C.YD),Bp[0],Bp[1],s*.45,22));put(p,cz(.17,.14,pm(C.YD),KX,KY,s*.45,20));
      put(p,beam(br,C0,.15,.12,.12,pm(C.YD),s*.45));
      put(p,cz(.1,.16,pm(0xB9B2A3),WK.Lp0[0],WK.Lp0[1],s*.45,14))});
    put(p,cz(.1,1.0,pm(C.YD),C0[0],C0[1],0,16));put(p,cz(.09,.9,pm(C.YD),lo[0],lo[1],0,14));put(p,cz(.08,1.06,pm(0xB9B2A3),KX,KY,0,12))})();
  cylPart('lcyl','리프트 실린더',[.6,1.0,-2.4],.7,.45,'work',true);
  p=def('crank','벨크랭크','work',{off:[1.2,3.2,0],fk:4,anchor:[WK.Cp0[0],WK.Cp0[1]+.1,-.07],sw:true});
  put(p,ext(beamShape([WK.U0,WK.Cp0,WK.D0],[.09,.16,.09]),.14,pm(C.Y),.015));
  put(p,cz(.14,.2,pm(C.YD),WK.Cp0[0],WK.Cp0[1],0,18));put(p,cz(.08,.3,pm(0xB9B2A3),WK.U0[0],WK.U0[1],0,12));put(p,cz(.08,.3,pm(0xB9B2A3),WK.D0[0],WK.D0[1],0,12));
  cylPart('tcyl','틸트 실린더',[.5,3.0,1.8],1.0,0,'work',true);
  p=def('blink','버킷 링크','work',{off:[2.0,1.7,2.0],dyn:true,sw:true});
  (function(){var gb=new T.BoxGeometry(.12,1,.14),gp=new T.CylinderGeometry(.08,.08,.26,12);gp.rotateX(Math.PI/2);
    p.rig={type:'blink',b1:put(p,new T.Mesh(gb,M(0xD8D2C4))),p1:put(p,new T.Mesh(gp,M(C.CH,{r:.4}))),p2:put(p,new T.Mesh(gp,M(C.CH,{r:.4})))}})();
  p=def('bucket','버킷','work',{off:[2.6,.5,0],fk:3,anchor:[KX+.9,KY+.55,-1.15],sw:true});
  (function(){var m=M(0xE6DFCF),mt=M(0xFFFFFF);
    var Cp=[[.37,.98],[.07,.80],[0,.35],[.12,-.15],[.42,-.33],[1.3,-.35]];
    var c3=new T.CatmullRomCurve3(Cp.map(function(q){return new V3(q[0],q[1],0)}),false,'catmullrom',.5).getPoints(30);
    var xy=c3.map(function(v){return[v.x,v.y]});
    var shell=ext(beamShape(xy,xy.map(function(){return .04})),2.3,m,.015);shell.position.set(KX,KY,0);put(p,shell);
    var ps=new T.Shape();ps.moveTo(xy[0][0],xy[0][1]);for(var i=1;i<xy.length;i++)ps.lineTo(xy[i][0],xy[i][1]);ps.closePath();
    [-1.15,1.15].forEach(function(dz){var pl=ext(ps,.06,m,.01);pl.position.set(KX,KY,dz);put(p,pl)});
    [-.45,.45].forEach(function(dz){var e=ext(beamShape([[-.04,0],[.16,.2]],[.16,.12]),.2,pm(C.YD),.01);e.position.set(KX,KY,dz);put(p,e)});
    var bq=[WK.Bq0[0]-KX,WK.Bq0[1]-KY],e2=ext(beamShape([bq,[.14,.62]],[.11,.1]),.3,pm(C.YD),.01);e2.position.set(KX,KY,0);put(p,e2);
    put(p,cz(.07,.36,pm(0xB9B2A3),WK.Bq0[0],WK.Bq0[1],0,12));
    put(p,bx(.18,.05,2.3,pm(C.YD),KX+1.24,KY-.355,0));
    for(var k=0;k<8;k++)put(p,rb(.22,.07,.12,.02,mt,KX+1.38,KY-.355,-1.0+k*2/7));
    soilMesh=new T.Mesh(new T.IcosahedronGeometry(1,1),M(C.SOIL,{r:1}));
    soilMesh.position.set(KX+.62,KY+.12,0);soilMesh.scale.set(.1,.1,.1);soilMesh.visible=false;put(p,soilMesh,null,true)})();
})()}

/* ===== 스키드로더 ===== */
var SAP=[-1.35,2.2],SK0=[1.75,.42],SKR=[SK0[0]-SAP[0],SK0[1]-SAP[1]],SKC=[0,0],SLF=[-1.45,1.2],SLA=[-.1,1.9],STA=[1.28,1.38],STQ=[SK0[0]+.06,SK0[1]+.42],SLL=[1,2],TIPS=[1.38,-.4],HEELS=[.5,-.42],SOILS=[.5,.3,1.02];
if(SL){(function(){
  KX=SK0[0];KY=SK0[1];SOILS=[.4,.24,.95];
  var XR=.5,p,i,MC={};
  function pm(c){var k=LIST[LIST.length-1].id+'|'+c;return MC[k]||(MC[k]=M(c))}
  [['fwheel','앞바퀴',.75],['rwheel','뒷바퀴',-.75]].forEach(function(w){
    var p=def(w[0],w[1],'drive',{lat:1.1,anchor:[w[2],XR+.3,-1.22],sw:true});
    var mt=M(0x8C8577,{r:.95}),mr=M(0xF0EDE6),ml=M(0x6E685D,{r:.9}),mh=M(C.HUB);
    [-1,1].forEach(function(s){
      var g=new T.Group();g.position.set(w[2],XR,s*1.0);g.userData.s=s;p.sg[s].add(g);WSP.push(g);
      var k,a,t;
      putG(p,g,cz(XR-.03,.44,mt,0,0,0,28));putG(p,g,cz(.27,.46,mr,0,0,0,22));putG(p,g,cz(.11,.5,mh,0,0,0,14));
      for(k=0;k<14;k++){a=k/14*Math.PI*2;t=bx(.1,.07,.44,ml,Math.cos(a)*(XR-.01),Math.sin(a)*(XR-.01),0);t.rotation.z=a+Math.PI/2;putG(p,g,t,true)}
      for(k=0;k<8;k++){a=k/8*Math.PI*2;putG(p,g,cz(.025,.52,mh,Math.cos(a)*.18,Math.sin(a)*.18,0,8),true)}})});
  p=def('chain','체인 케이스','drive',{lat:.45,anchor:[0,.62,-.71],sw:true});
  [-1,1].forEach(function(s){
    put(p,rb(2.0,.34,.1,.04,pm(C.GR),0,.5,s*.71),s);
    [-.75,0,.75].forEach(function(x){put(p,cz(x?.15:.1,.14,pm(0xF0EDE6),x,.5,s*.71,x?16:12),s)});
    [-.75,.75].forEach(function(x){put(p,cz(.07,.2,pm(C.HUB),x,.5,s*.82,10),s)})});
  p=def('dmotor','주행모터','drive',{off:[0,1.3,0],lat:.0,anchor:[0,.5,-.5],sw:true});
  [-1,1].forEach(function(s){put(p,cz(.16,.26,pm(0xC9DCE0),0,.5,s*.5,18));put(p,cz(.1,.1,pm(C.YD),0,.5,s*.32,14))});
  p=def('frame','메인 프레임','drive',{anchor:[-.4,.9,-.66],sw:true});
  put(p,rb(2.9,.7,1.32,.1,pm(C.GR),-.15,.7,0));
  [-1,1].forEach(function(s){
    put(p,rb(2.7,.08,.5,.03,pm(C.YD),-.2,1.09,s*1.0));
    put(p,rb(.5,1.32,.2,.05,pm(C.Y),-1.35,1.72,s*.9));
    put(p,cz(.09,.3,pm(0xB9B2A3),SAP[0],SAP[1],s*.9,14));put(p,cz(.07,.3,pm(0xB9B2A3),SLF[0],SLF[1],s*.9,12))});
  put(p,rb(.12,.3,1.9,.04,pm(C.DK),-1.62,.55,0));
  p=def('engine','엔진','body',{off:[-2.3,.5,0],anchor:[-1.3,1.3,-.45],sw:true});
  put(p,rb(.55,.7,.9,.06,pm(0xC9DCE0),-1.3,1.0,0));
  for(i=0;i<4;i++)put(p,rb(.4,.12,.16,.03,pm(0xA9C3C9),-1.3,1.41,-.33+i*.22));
  put(p,cz(.16,.06,pm(0x6E685D),-1.3,.95,.5,16));
  p=def('hstat','주행 펌프(HST)','body',{off:[-.9,2.0,0],anchor:[-.75,.62,-.15],sw:true});
  put(p,cx(.15,.26,pm(0xF0D2B8),-.86,.62,0,18));put(p,cx(.15,.26,pm(0xF0D2B8),-.58,.62,0,18));put(p,rb(.5,.12,.22,.03,pm(0xD8D2C4),-.72,.8,0));
  p=def('pump','작업 펌프','body',{off:[-.4,2.5,-1.6],anchor:[-.33,.62,-.11],sw:true});
  put(p,cx(.11,.2,pm(0xF0D2B8),-.33,.62,0,16));put(p,rb(.14,.2,.2,.03,pm(0xF0D2B8),-.33,.76,0));
  p=def('valve','컨트롤 밸브','body',{off:[.5,2.3,2.0],anchor:[.6,.62,.3],sw:true});
  put(p,rb(.3,.22,.36,.04,pm(0xD3DCEB),.6,.62,.3));
  for(i=0;i<3;i++)put(p,cx(.03,.4,pm(0xFFFFFF),.6,.62,.2+i*.1,8),null,true);
  p=def('tank','유압 탱크','body',{off:[.6,2.0,-2.2],anchor:[.6,.7,-.45],sw:true});
  put(p,rb(.4,.4,.3,.05,pm(0xDAD6CC),.6,.7,-.3));put(p,cy(.05,.06,pm(0xFFFFFF),.6,.93,-.3,12));
  p=def('hood','리어 도어·냉각기','body',{off:[-3.2,.4,0],anchor:[-1.68,1.5,-.75],sw:true});
  put(p,rb(.12,1.3,1.5,.05,pm(C.Y),-1.68,1.3,0));put(p,rb(.62,.1,1.5,.04,pm(C.Y),-1.33,2.0,0));
  put(p,rb(.5,.07,1.1,.02,pm(0xF0D2B8),-1.33,1.88,0));
  for(i=0;i<5;i++)put(p,bx(.02,.05,1.1,pm(C.DK),-1.745,.95+i*.16,0),null,true);
  p=def('cab','캐빈(ROPS)','body',{off:[.2,3.0,0],anchor:[.1,2.3,-.62],sw:true});
  (function(){var ms=M(0x6E685D,{r:.9}),mg=M(C.GL,{r:.2,op:.3});
    put(p,rb(2.1,.1,1.24,.04,pm(C.Y),.1,1.1,0));
    [-.95,1.15].forEach(function(x){[-.58,.58].forEach(function(z){put(p,rb(.09,1.2,.09,.02,pm(C.Y),x,1.75,z))})});
    put(p,rb(2.3,.1,1.3,.04,pm(C.Y),.1,2.38,0));
    var g=new T.Mesh(new T.BoxGeometry(2.0,1.1,1.1),mg);g.position.set(.1,1.75,0);put(p,g,null,true);g.castShadow=false;
    put(p,rb(.45,.12,.5,.04,ms,-.3,1.4,0));put(p,rb(.1,.6,.48,.04,ms,-.55,1.72,0));
    [-.36,.36].forEach(function(z){put(p,cy(.025,.3,pm(C.DK),.25,1.55,z,8));put(p,cy(.05,.06,ms,.25,1.72,z,10))});
    put(p,cz(.03,1.1,pm(C.DK),.55,1.62,0,8))})();
  p=def('arm','리프트 암','work',{off:[0,1.9,0],lat:.5,fk:1,anchor:[0,2.15,-.9],sw:true});
  (function(){var pts=[SAP,[.3,2.0],[1.2,1.5],SK0],hw=[.13,.12,.13,.1];
    [-1,1].forEach(function(s){
      var b=ext(beamShape(pts,hw),.14,pm(C.Y),.015);b.position.z=s*.9;put(p,b,s);
      put(p,cz(.17,.16,pm(C.YD),SAP[0],SAP[1],s*.9,18),s);put(p,cz(.13,.16,pm(C.YD),SK0[0],SK0[1],s*.9,16),s);
      put(p,cz(.08,.2,pm(0xB9B2A3),SLA[0],SLA[1],s*.9,12),s)});
    put(p,cz(.07,1.8,pm(C.YD),1.5,.9,0,12))})();
  cylPart('lcyl','리프트 실린더',[-.6,1.2,-2.2],.9,.9,'work',true);
  cylPart('tcyl','틸트 실린더',[1.0,1.9,-2.0],.45,.68,'work',true);
  p=def('coupler','퀵 커플러','work',{off:[1.6,.9,0],fk:3,anchor:[SK0[0]+.1,SK0[1]+.5,-.75],sw:true});
  put(p,rb(.07,.8,1.5,.03,pm(C.YD),SK0[0]+.1,SK0[1]+.25,0));
  [-1,1].forEach(function(s){put(p,rb(.16,.6,.08,.03,pm(C.YD),SK0[0]+.03,SK0[1]+.2,s*.68));put(p,cz(.06,.2,pm(0xB9B2A3),STQ[0],STQ[1],s*.68,10))});
  put(p,cz(.05,1.7,pm(0xB9B2A3),SK0[0],SK0[1],0,10));
  p=def('bucket','버킷','work',{off:[2.6,.3,0],fk:3,anchor:[KX+.8,KY+.6,-1.15],sw:true});
  (function(){var m=M(0xE6DFCF),mt=M(0xFFFFFF);
    var Cp=[[.5,.78],[.2,.66],[.18,.2],[.26,-.22],[.5,-.38],[1.25,-.4]];
    var c3=new T.CatmullRomCurve3(Cp.map(function(q){return new V3(q[0],q[1],0)}),false,'catmullrom',.5).getPoints(30);
    var xy=c3.map(function(v){return[v.x,v.y]});
    var shell=ext(beamShape(xy,xy.map(function(){return .035})),2.3,m,.012);shell.position.set(KX,KY,0);put(p,shell);
    var ps=new T.Shape();ps.moveTo(xy[0][0],xy[0][1]);for(var i=1;i<xy.length;i++)ps.lineTo(xy[i][0],xy[i][1]);ps.closePath();
    [-1.15,1.15].forEach(function(dz){var pl=ext(ps,.05,m,.01);pl.position.set(KX,KY,dz);put(p,pl)});
    put(p,bx(.16,.045,2.3,pm(C.YD),KX+1.2,KY-.405,0));
    for(var k=0;k<7;k++)put(p,rb(.2,.06,.1,.02,mt,KX+1.32,KY-.405,-1.02+k*.34));
    soilMesh=new T.Mesh(new T.IcosahedronGeometry(1,1),M(C.SOIL,{r:1}));
    soilMesh.position.set(KX+.7,KY+.05,0);soilMesh.scale.set(.1,.1,.1);soilMesh.visible=false;put(p,soilMesh,null,true)})();
  /* 리프트 실린더 길이 범위 */
  (function(){function ll(th){var c=Math.cos(th),s=Math.sin(th),x=SLA[0]-SAP[0],y=SLA[1]-SAP[1];return Math.hypot(SAP[0]+x*c-y*s-SLF[0],SAP[1]+x*s+y*c-SLF[1])}SLL=[ll(0),ll(1.1)]})();
})()}

/* ===== 크롤러 도저 (하부 주행부는 크롤러 굴삭기와 같은 부품을 쓴다) ===== */
var ZTP=[1.3,.8],ZBC=[3.4,.6],ZRP=[-2.0,1.15],ZLA=[2.05,1.75],ZLB=[2.9,.68],ZRA=[-1.95,1.75],ZRB=[-2.8,1.15],ZL=[1,2],ZR=[1,2],ripGoal=0,ripW=new V3();
if(DZ){(function(){
  var p,i,MC={};
  function pm(c){var k=LIST[LIST.length-1].id+'|'+c;return MC[k]||(MC[k]=M(c))}
  p=def('mframe','메인 프레임','body',{off:[0,1.3,0],anchor:[-.6,1.4,-.75]});
  put(p,rb(3.7,.5,1.5,.1,pm(C.GR),-.1,1.27,0));
  [-1,1].forEach(function(s){put(p,rb(3.3,.07,.72,.03,pm(C.YD),-.2,1.25,s*1.16));
    put(p,rb(.26,.34,.1,.04,pm(C.YD),1.97,1.7,s*.62));put(p,cz(.07,.22,pm(0xB9B2A3),ZLA[0],ZLA[1],s*.62,12));
    put(p,cz(.08,.2,pm(0xB9B2A3),ZTP[0],ZTP[1],s*.72,12))});
  put(p,rb(.3,.5,.9,.06,pm(C.YD),-1.98,1.25,0));
  p=def('engine','엔진','body',{off:[.9,4.2,0],anchor:[1.15,2.0,-.3],sw:true});
  put(p,rb(1.0,.52,.62,.06,pm(0xC9DCE0),1.15,1.85,0));
  for(i=0;i<4;i++)put(p,rb(.16,.13,.54,.03,pm(0xA9C3C9),.82+i*.22,2.17,0));
  put(p,rb(.1,.66,.95,.03,pm(0xF0D2B8),1.92,1.9,0));put(p,cx(.28,.05,pm(0x6E685D),1.83,1.9,0,20));
  p=def('hstat','주행 펌프(HST)','body',{off:[0,1.3,-2.3],anchor:[.1,1.27,-.16]});
  put(p,cx(.16,.26,pm(0xF0D2B8),.24,1.27,0,18));put(p,cx(.16,.26,pm(0xF0D2B8),-.04,1.27,0,18));
  p=def('pump','작업 펌프','body',{off:[-.3,1.3,2.3],anchor:[-.32,1.27,.11]});
  put(p,cx(.11,.2,pm(0xF0D2B8),-.32,1.27,0,16));
  p=def('valve','컨트롤 밸브','body',{off:[-.6,2.2,2.4],anchor:[-.7,1.27,.5]});
  put(p,rb(.3,.22,.36,.04,pm(0xD3DCEB),-.7,1.27,.35));
  for(i=0;i<3;i++)put(p,cx(.03,.4,pm(0xFFFFFF),-.7,1.27,.25+i*.1,8),null,true);
  p=def('tank','연료·유압 탱크','body',{off:[-1.7,1.7,0],anchor:[-1.68,2.2,-.67]});
  put(p,rb(.55,.75,1.35,.08,pm(0xDAD6CC),-1.68,1.92,0));put(p,cy(.06,.07,pm(0xFFFFFF),-1.68,2.32,.4,12));put(p,cy(.06,.07,pm(0xFFFFFF),-1.68,2.32,-.4,12));
  p=def('hood','엔진 후드','body',{off:[1.0,2.6,0],anchor:[1.25,2.3,-.55]});
  put(p,rb(1.6,.78,1.1,.12,pm(C.Y),1.25,1.92,0));put(p,cy(.06,.55,pm(C.DK),.9,2.55,.3,12));put(p,cy(.09,.2,pm(C.DK),1.5,2.4,-.3,14));
  for(i=0;i<5;i++)put(p,bx(.02,.05,.85,pm(C.DK),2.06,1.68+i*.12,0),null,true);
  p=def('cab','캐빈(ROPS)','body',{off:[-.2,3.4,0],anchor:[-.4,2.6,-.65]});
  (function(){var ms=M(0x6E685D,{r:.9}),mg=M(C.GL,{r:.2,op:.35});
    put(p,rb(1.7,.1,1.3,.04,pm(C.Y),-.42,1.57,0));
    [-1.2,.36].forEach(function(x){[-.6,.6].forEach(function(z){put(p,rb(.09,1.3,.09,.02,pm(C.Y),x,2.27,z))})});
    put(p,rb(1.85,.1,1.42,.04,pm(C.Y),-.42,2.95,0));
    var g=new T.Mesh(new T.BoxGeometry(1.52,1.22,1.16),mg);g.position.set(-.42,2.27,0);put(p,g,null,true);g.castShadow=false;
    put(p,rb(.45,.12,.48,.04,ms,-.6,1.92,0));put(p,rb(.1,.6,.46,.04,ms,-.85,2.25,0));
    [-.36,.36].forEach(function(z){put(p,cy(.025,.3,pm(C.DK),-.25,2.05,z,8));put(p,cy(.05,.06,ms,-.25,2.22,z,10))})})();
  p=def('cframe','C프레임(푸시 프레임)','work',{off:[1.5,.3,0],fk:1,anchor:[2.2,.72,-.68]});
  [-1,1].forEach(function(s){put(p,beam(ZTP,[3.2,.6],.1,.09,.12,pm(C.Y),s*.68));put(p,cz(.13,.14,pm(C.YD),ZTP[0],ZTP[1],s*.68,14));
    put(p,cz(.07,.2,pm(0xB9B2A3),ZLB[0],ZLB[1],s*.62,10));put(p,cz(.06,.2,pm(0xB9B2A3),2.2,.72,s*.6,10))});
  put(p,rb(.22,.2,1.5,.05,pm(C.Y),3.2,.6,0));put(p,new T.Mesh(new T.SphereGeometry(.13,14,10),pm(0xB9B2A3)),null,true).position.set(ZBC[0]-.02,ZBC[1],0);
  cylPart('lcyl','블레이드 리프트 실린더',[.8,1.6,0],.55,.62,'work',true);
  cylPart('acyl','앵글 실린더',[1.9,.4,0],.6,.6,'work',true);
  p=def('blade','블레이드','work',{off:[2.8,.3,0],fk:3,anchor:[3.5,1.2,-1.68]});
  (function(){var pr=[[3.55,1.22],[3.45,.86],[3.48,.42],[3.63,.07]];
    put(p,ext(beamShape(pr,[.035,.035,.035,.035]),3.36,pm(C.Y),.012));
    put(p,bx(.1,.06,3.36,pm(C.DK),3.64,.05,0));
    [-1.66,1.66].forEach(function(z){var sh=new T.Shape();sh.moveTo(3.55,1.22);sh.lineTo(3.45,.86);sh.lineTo(3.48,.42);sh.lineTo(3.63,.07);sh.lineTo(3.78,.07);sh.lineTo(3.7,1.22);sh.closePath();
      var w=ext(sh,.05,pm(C.YD),.008);w.position.z=z;put(p,w)});
    [-1.25,0,1.25].forEach(function(z){put(p,rb(.1,.7,.12,.03,pm(C.YD),3.41,.62,z))});
    soilMesh=new T.Mesh(new T.IcosahedronGeometry(1,1),M(C.SOIL,{r:1}));
    soilMesh.position.set(3.95,.22,0);soilMesh.scale.set(.1,.1,.1);soilMesh.visible=false;put(p,soilMesh,null,true)})();
  p=def('ripper','리퍼','work',{off:[-1.8,.3,0],fk:2,anchor:[-2.85,1.1,-1.1]});
  [-1,1].forEach(function(s){put(p,beam(ZRP,[-2.85,.95],.09,.09,.12,pm(C.Y),s*.5));put(p,cz(.1,.14,pm(C.YD),ZRP[0],ZRP[1],s*.5,12))});
  put(p,rb(.3,.3,2.2,.06,pm(C.Y),-2.85,.95,0));put(p,cz(.06,.3,pm(0xB9B2A3),ZRB[0],ZRB[1],0,10));
  [-.85,0,.85].forEach(function(z){var sh=new T.Shape();sh.moveTo(-2.75,.85);sh.lineTo(-2.95,.85);sh.lineTo(-3.0,.5);sh.lineTo(-3.02,.3);sh.lineTo(-2.84,.42);sh.closePath();
    var t=ext(sh,.1,pm(C.DK),.01);t.position.z=z;put(p,t)});
  cylPart('rcyl','리퍼 실린더',[-1.2,1.6,0],.5,0,'work',true);
  function rl(o,b,a,th){var c=Math.cos(th),s=Math.sin(th),x=b[0]-o[0],y=b[1]-o[1];return Math.hypot(o[0]+x*c-y*s-a[0],o[1]+x*s+y*c-a[1])}
  ZL=[rl(ZTP,ZLB,ZLA,.3),rl(ZTP,ZLB,ZLA,-.08)];ZR=[rl(ZRP,ZRB,ZRA,0),rl(ZRP,ZRB,ZRA,.55)];
  if(ZR[0]>ZR[1])ZR.reverse();if(ZL[0]>ZL[1])ZL.reverse();
  LIST.forEach(function(q){q.sw=true});
})()}

/* ===== 모터 그레이더 ===== */
var GPV=.2,GDB=[4.05,.95],GCC=[2.3,.72],GLA=[2.6,1.7],GLB=[2.15,.8],GL=[1,2],MGS=[];
if(MG){(function(){
  var XR=.5,p,i,MC={};
  function pm(c){var k=LIST[LIST.length-1].id+'|'+c;return MC[k]||(MC[k]=M(c))}
  function wheels(id,name,grp,ax,sw,wd,steer){
    var p=def(id,name,grp,{lat:.9,anchor:[ax,XR+.3,-.85-wd/2],sw:sw});
    var mt=M(0x8C8577,{r:.95}),mr=M(0xF0EDE6),ml=M(0x6E685D,{r:.9}),mh=M(C.HUB);
    [-1,1].forEach(function(s){
      var h=new T.Group();h.position.set(ax,XR,s*.85);p.sg[s].add(h);if(steer)MGS.push(h);
      var g=new T.Group();h.add(g);WSP.push(g);
      var k,a,t;
      putG(p,g,cz(XR-.03,wd,mt,0,0,0,28));putG(p,g,cz(.27,wd+.02,mr,0,0,0,22));putG(p,g,cz(.11,wd+.08,mh,0,0,0,14));
      for(k=0;k<14;k++){a=k/14*Math.PI*2;t=bx(.09,.06,wd,ml,Math.cos(a)*(XR-.01),Math.sin(a)*(XR-.01),0);t.rotation.z=a+Math.PI/2;putG(p,g,t,true)}
      for(k=0;k<8;k++){a=k/8*Math.PI*2;putG(p,g,cz(.025,wd+.1,mh,Math.cos(a)*.18,Math.sin(a)*.18,0,8),true)}})}
  /* 앞차 (굴절하는 쪽) */
  wheels('fwheel','앞바퀴','front',4.4,true,.3,true);
  p=def('faxle','앞차축','front',{anchor:[4.4,.62,-.4],sw:true});
  put(p,rb(.16,.14,1.5,.04,pm(C.GR),4.4,.6,0));put(p,cx(.07,.3,pm(0xB9B2A3),4.4,.72,0,12));
  [-1,1].forEach(function(s){put(p,rb(.12,.3,.1,.03,pm(C.YD),4.4,.56,s*.68));put(p,cz(.04,.5,pm(0xFFFFFF),4.22,.62,s*.4,10))});
  put(p,cz(.03,1.3,pm(C.HUB),4.2,.5,0,8),null,true);
  p=def('fframe','프런트 프레임','front',{off:[0,1.3,0],anchor:[2.8,1.75,-.15],sw:true});
  put(p,ext(beamShape([[GPV+.1,1.0],[1.0,1.7],[4.2,1.5],[4.45,.82]],[.17,.16,.13,.1]),.3,pm(C.Y),.02));
  put(p,rb(.3,.5,.5,.06,pm(C.YD),GPV+.2,1.0,0));put(p,rb(.4,.16,.9,.05,pm(C.YD),GLA[0],GLA[1]+.02,0));
  [-1,1].forEach(function(s){put(p,cz(.06,.16,pm(0xB9B2A3),GLA[0],GLA[1],s*.42,10))});
  put(p,new T.Mesh(new T.SphereGeometry(.1,12,8),pm(0xB9B2A3)),null,true).position.set(GDB[0],GDB[1],0);
  put(p,rb(.3,.3,.16,.04,pm(C.YD),GDB[0],GDB[1]+.22,0));put(p,rb(.5,.5,1.3,.1,pm(C.GR),4.95,.8,0));
  p=def('drawbar','드로바','work',{off:[.4,-.0,2.6],fk:1,anchor:[3.2,.86,0],sw:true});
  [-1,1].forEach(function(s){
    var sh=ext(beamShape([[GDB[0]-.05,GDB[1]-.02],[GCC[0]+.3,GCC[1]+.1]],[.06,.07]),.1,pm(C.Y),.015);
    sh.position.set(0,0,0);var g=new T.Group();g.position.set(GDB[0],0,0);g.rotation.y=s*.34;sh.position.x=-GDB[0];g.add(sh);p.g.add(g);
    sh.castShadow=true;sh.receiveShadow=true;sh.userData.part=p.id;p.meshes.push(sh);addEdge(p,sh);if(p.mats.indexOf(sh.material)<0)p.mats.push(sh.material);
    put(p,cz(.06,.14,pm(0xB9B2A3),GLB[0],GLB[1],s*.62,10))});
  put(p,rb(.3,.1,1.5,.03,pm(C.Y),GLB[0],GLB[1]+.02,0));put(p,cy(.5,.08,pm(C.YD),GCC[0],GCC[1]+.1,0,28));
  p=def('cmotor','서클 회전 모터','work',{off:[.2,1.0,-2.4],fk:1,anchor:[2.85,1.0,0],sw:true});
  put(p,cy(.1,.26,pm(0xC9DCE0),2.85,.98,0,16));put(p,cy(.13,.08,pm(C.YD),2.85,.82,0,16));
  p=def('circle','서클','work',{off:[-.3,-.0,2.6],fk:2,anchor:[GCC[0],GCC[1],-.62],sw:true});
  (function(){var r=new T.Mesh(new T.TorusGeometry(.62,.06,10,44),pm(C.YD));r.rotation.x=Math.PI/2;r.position.set(GCC[0],GCC[1],0);put(p,r,null,true);
    for(var k=0;k<24;k++){var a=k/24*Math.PI*2;put(p,bx(.05,.08,.1,pm(0xB9B2A3),GCC[0]+Math.cos(a)*.68,GCC[1],Math.sin(a)*.68),null,true).rotation.y=-a}
    [-1,1].forEach(function(s){put(p,rb(.14,.46,.1,.03,pm(C.YD),GCC[0],GCC[1]-.2,s*.62));put(p,rb(.5,.08,.1,.03,pm(C.YD),GCC[0]+.1,GCC[1]-.4,s*.62))})})();
  p=def('blade','몰드보드(블레이드)','work',{off:[-.2,-.0,3.6],fk:2,anchor:[GCC[0]+.25,.5,-1.45],sw:true});
  (function(){var pr=[[2.5,.6],[2.42,.42],[2.45,.2],[2.58,.06]];
    put(p,ext(beamShape(pr,[.03,.03,.03,.03]),2.9,pm(C.Y),.01));put(p,bx(.08,.05,2.9,pm(C.DK),2.59,.045,0));
    put(p,rb(.08,.1,2.6,.03,pm(C.YD),2.38,.36,0));put(p,cz(.035,1.2,pm(0xFFFFFF),2.34,.36,.5,10));
    soilMesh=new T.Mesh(new T.IcosahedronGeometry(1,1),M(C.SOIL,{r:1}));
    soilMesh.position.set(2.3,.12,-1.6);soilMesh.scale.set(.1,.1,.1);soilMesh.visible=false;put(p,soilMesh,null,true)})();
  cylPart('lcyl','블레이드 리프트 실린더',[.2,1.5,-2.2],.5,.5,'work',true);
  /* 가운데 */
  p=def('joint','굴절 조인트','center',{off:[0,1.3,-1.6],anchor:[GPV,1.3,0],sw:false});
  put(p,cy(.08,.26,pm(0xB9B2A3),GPV,1.2,0,14));put(p,cy(.08,.26,pm(0xB9B2A3),GPV,.8,0,14));put(p,cy(.15,.06,pm(C.TL),GPV,1.35,0,18));put(p,cy(.15,.06,pm(C.TL),GPV,.65,0,18));
  cylPart('artcyl','굴절 실린더',[0,.4,0],.55,.4,'center',false);
  /* 뒤차 (고정) */
  wheels('mwheel','가운데 바퀴','rear',-.9,false,.4,false);
  wheels('rwheel','뒷바퀴','rear',-1.9,false,.4,false);
  p=def('tandem','탠덤 케이스','rear',{lat:.45,anchor:[-1.4,.62,-.56],sw:false});
  [-1,1].forEach(function(s){put(p,rb(1.5,.36,.14,.06,pm(C.GR),-1.4,.52,s*.56),s);put(p,cz(.1,.2,pm(0xB9B2A3),-1.4,.6,s*.44,12),s);
    [-.9,-1.9].forEach(function(x){put(p,cz(.08,.2,pm(C.HUB),x,XR,s*.62,10),s)})});
  p=def('rframe','리어 프레임','rear',{off:[0,1.3,0],anchor:[-1.6,.95,-.4],sw:false});
  put(p,rb(3.0,.34,.8,.08,pm(C.GR),-1.4,.95,0));put(p,rb(.3,.7,.5,.06,pm(C.YD),GPV-.2,1.0,0));
  put(p,cz(.12,.96,pm(C.GR),-1.4,.68,0,14));put(p,rb(.3,.6,1.6,.1,pm(C.GR),-3.02,1.05,0));
  p=def('trans','변속기','rear',{off:[-.2,1.3,-2.4],anchor:[-1.0,.95,-.28],sw:false});
  put(p,rb(.55,.44,.55,.06,pm(0xC9DCE0),-1.0,1.0,0));put(p,cx(.24,.2,pm(0xA9C3C9),-1.38,1.2,0,20));put(p,rb(.3,.3,.4,.04,pm(0xC9DCE0),-1.4,.78,0));
  p=def('engine','엔진','rear',{off:[-.9,4.0,0],anchor:[-2.05,1.75,-.32],sw:false});
  put(p,rb(1.0,.52,.64,.06,pm(0xC9DCE0),-2.05,1.5,0));
  for(i=0;i<4;i++)put(p,rb(.16,.13,.56,.03,pm(0xA9C3C9),-2.38+i*.22,1.82,0));
  put(p,rb(.1,.7,1.05,.03,pm(0xF0D2B8),-2.8,1.6,0));put(p,cx(.3,.05,pm(0x6E685D),-2.7,1.6,0,20));
  p=def('pump','유압펌프','rear',{off:[-.4,3.0,2.2],anchor:[-1.0,1.36,0],sw:false});
  put(p,cx(.14,.28,pm(0xF0D2B8),-1.0,1.36,0,18));
  p=def('valve','컨트롤 밸브','rear',{off:[.1,2.6,-2.4],anchor:[-.3,1.14,-.18],sw:false});
  put(p,rb(.34,.2,.36,.04,pm(0xD3DCEB),-.3,1.24,0));
  for(i=0;i<4;i++)put(p,cz(.03,.46,pm(0xFFFFFF),-.42+i*.08,1.24,0,8),null,true);
  p=def('tank','유압 탱크','rear',{off:[-.6,2.8,2.6],anchor:[-1.35,1.75,.3],sw:false});
  put(p,rb(.4,.5,.34,.05,pm(0xDAD6CC),-1.35,1.6,.45));put(p,cy(.05,.06,pm(0xFFFFFF),-1.35,1.88,.45,12));
  p=def('hood','엔진 후드','rear',{off:[-.5,2.4,0],anchor:[-2.0,2.05,-.7],sw:false});
  put(p,rb(1.85,.85,1.4,.14,pm(C.Y),-2.0,1.62,0));put(p,cy(.06,.5,pm(C.DK),-1.5,2.3,.4,12));put(p,cy(.1,.2,pm(C.DK),-2.2,2.14,-.35,14));
  p=def('cab','캐빈(ROPS)','rear',{off:[-.1,3.3,0],anchor:[-.45,2.2,-.58],sw:false});
  (function(){var ms=M(0x6E685D,{r:.9}),mg=M(C.GL,{r:.2,op:.35});
    put(p,rb(1.0,.12,1.15,.04,pm(C.Y),-.45,1.4,0));
    [-.9,0].forEach(function(x){[-.52,.52].forEach(function(z){put(p,rb(.08,1.35,.08,.02,pm(C.Y),x,2.12,z))})});
    put(p,rb(1.12,.1,1.3,.04,pm(C.Y),-.45,2.84,0));
    var g=new T.Mesh(new T.BoxGeometry(.86,1.28,1.0),mg);g.position.set(-.45,2.12,0);put(p,g,null,true);g.castShadow=false;
    put(p,rb(.4,.12,.42,.04,ms,-.6,1.72,0));put(p,rb(.1,.5,.4,.04,ms,-.8,2.0,0));
    var col=cy(.03,.45,pm(C.DK),-.2,1.72,0,10);col.rotation.z=-.3;put(p,col);
    var wh=new T.Mesh(new T.TorusGeometry(.14,.022,8,24),ms);wh.position.set(-.26,1.97,0);wh.rotation.y=Math.PI/2;wh.rotation.z=.3;put(p,wh,null,true);
    for(i=0;i<4;i++)put(p,cy(.018,.22,pm(C.DK),-.1,1.75,-.3+i*.2,6),null,true)})();
  function ll(th){var c=Math.cos(-th),s=Math.sin(-th),x=GLB[0]-GDB[0],y=GLB[1]-GDB[1];return Math.hypot(GDB[0]+x*c-y*s-GLA[0],GDB[1]+x*s+y*c-GLA[1])}
  GL=[ll(.22),ll(-.04)];if(GL[0]>GL[1])GL.reverse();
})()}

  /* ---------- 자세 계산 (분해도의 기구학을 그대로 쓴다) ---------- */
  var ID=new M4(),Mb=new M4(),Ma=new M4(),Mk=new M4(),Mc=new M4(),Rs=new M4(),Tm=new M4(),Fin=new M4(),B0w=new V3();
  var vA=new V3(),vB=new V3(),vC=new V3(),tA=new V3(),tB=new V3(),dzv=new V3(),q1=new V3(),q2=new V3(),q3=new V3(),q4=new V3();
  var tipL=new V3(),mouthL=new V3(),pose={b:0,a:0,k:0},api={root:root,body:body,kind:kind,S:S,pose:pose,art:0,P:P};
  function place(out,ref,cur,ang){out.makeTranslation(cur[0],cur[1],0);Tm.makeRotationZ(ang);out.multiply(Tm);Tm.makeTranslation(-ref[0],-ref[1],0);out.multiply(Tm);return out}
  function updCyl(r,a,b){
    vC.subVectors(b,a);var len=Math.max(vC.length(),.05);vC.normalize();var lb=Math.min(r.lb,len*.7);
    r.barrel.position.copy(a).addScaledVector(vC,lb/2);r.barrel.scale.set(1,lb,1);r.barrel.quaternion.setFromUnitVectors(UP,vC);
    var rl=Math.max(len-lb,.02);r.rod.position.copy(a).addScaledVector(vC,lb+rl/2);r.rod.scale.set(1,rl,1);r.rod.quaternion.setFromUnitVectors(UP,vC);
    r.col.position.copy(a).addScaledVector(vC,lb);r.col.quaternion.setFromUnitVectors(UP,vC);r.ea.position.copy(a);r.eb.position.copy(b)}
  function updBar(m,a,b){vC.subVectors(b,a);var len=Math.max(vC.length(),.02);vC.normalize();m.position.copy(a).addScaledVector(vC,len/2);m.scale.set(1,len,1);m.quaternion.setFromUnitVectors(UP,vC)}
  function setM(p,m){p.g.matrix.copy(m);p.g.matrixWorldNeedsUpdate=true}
  function placeStatic(){LIST.forEach(function(p){if(p.dyn)return;var base=p.fk===1?Mb:p.fk===2?Ma:p.fk===3?Mk:p.fk===4?Mc:ID;Fin.copy(base);if(p.sw)Fin.premultiply(Rs);setM(p,Fin)})}
  function dynPlace(p,a,b){
    if(p.rig.pair){dzv.set(0,0,p.rig.dz);tA.copy(a).add(dzv);tB.copy(b).add(dzv);updCyl(p.rig,tA,tB);tA.copy(a).sub(dzv);tB.copy(b).sub(dzv);updCyl(p.rig.pair,tA,tB)}else updCyl(p.rig,a,b);
    setM(p,Rs)}
  function pairWorld(p,a1,b1,a2,b2,m){updCyl(p.rig,a1,b1);updCyl(p.rig.pair,a2,b2);setM(p,m)}
  var TIPR=[1.48,-.36],HEELR=[.42,-.38];
  function relY(Sx,r){return Sx.Kp[1]+r[0]*Math.sin(Sx.g)+r[1]*Math.cos(Sx.g)}
  if(WL){pose.k=WK.C0;api.lim={b:[0,.98],k:[1.3,2.2]};api.wb=2.4*S;api.rad=4.6;
    api.update=function(){
      var th=pose.b,Sx,it,ym=0;
      for(it=0;it<8;it++){Sx=WK.fk(th,pose.k);ym=Math.min(relY(Sx,TIPR),relY(Sx,HEELR));if(ym>=-.005||th>=.98)break;th=Math.min(.98,th+(-ym)/2.4)}
      api.th=th;api.g=Sx.g;api.contact=ym<.09;
      B0w.set(WK.Bp[0],WK.Bp[1],0);rotAbout(Mb,B0w,th);place(Mc,WK.Cp0,Sx.Cp,Sx.ca);place(Mk,WK.Kp0,Sx.Kp,Sx.g);
      Rs.makeTranslation(PVX,0,0);Tm.makeRotationY(api.art);Rs.multiply(Tm);Tm.makeTranslation(-PVX,0,0);Rs.multiply(Tm);
      placeStatic();
      tipL.set(KX+TIPR[0],KY+TIPR[1],0).applyMatrix4(Mk).applyMatrix4(Rs);mouthL.set(KX+1.0,KY+.25,0).applyMatrix4(Mk).applyMatrix4(Rs);
      vA.set(WK.Lf[0],WK.Lf[1],0);vB.set(Sx.Lp[0],Sx.Lp[1],0);dynPlace(P.lcyl,vA,vB);
      vA.set(WK.Tf[0],WK.Tf[1],0);vB.set(Sx.U[0],Sx.U[1],0);dynPlace(P.tcyl,vA,vB);
      var r=P.blink.rig;tA.set(Sx.D[0],Sx.D[1],0);tB.set(Sx.Bq[0],Sx.Bq[1],0);updBar(r.b1,tA,tB);r.p1.position.copy(tA);r.p2.position.copy(tB);setM(P.blink,Rs);
      q1.set(PVX-.8,.95,.42);q2.set(PVX+.45,.95,.42).applyMatrix4(Rs);q3.set(PVX-.8,.95,-.42);q4.set(PVX+.45,.95,-.42).applyMatrix4(Rs);pairWorld(P.stcyl,q1,q2,q3,q4,ID);
      var sh=P.shaft.rig;q1.set(-.9,.7,0);q2.set(PVX,.68,0);q3.set(FAX-.4,.62,0).applyMatrix4(Rs);updBar(sh.b1,q1,q2);updBar(sh.b2,q2,q3);sh.j.position.copy(q2);
      q1.set(-1.2,.7,0);q4.set(RAX+.4,.62,0);updBar(sh.b3,q1,q4);setM(P.shaft,ID)};
    api.setLoad=function(f){soilMesh.visible=f>.03;var l=.35+.65*f;soilMesh.scale.set(.5*l,.3*l,1.02*Math.min(1,.5+f))};
    api.setRoll=function(d){for(var k=0;k<WSP.length;k++)WSP[k].rotation.z=-d/S/WR}}
  if(SL){api.lim={b:[0,1.1],k:[-1.9,.55]};api.wb=1.5*S;api.rad=2.0;
    api.update=function(){
      var th=pose.b,g=0,it,ym=0,kx=0,ky=0,c,s;
      for(it=0;it<8;it++){c=Math.cos(th);s=Math.sin(th);kx=SAP[0]+SKR[0]*c-SKR[1]*s;ky=SAP[1]+SKR[0]*s+SKR[1]*c;g=th+pose.k;
        ym=Math.min(ky+TIPS[0]*Math.sin(g)+TIPS[1]*Math.cos(g),ky+HEELS[0]*Math.sin(g)+HEELS[1]*Math.cos(g));if(ym>=-.005||th>=1.1)break;th=Math.min(1.1,th+(-ym)/3)}
      api.th=th;api.g=g;api.contact=ym<.09;
      B0w.set(SAP[0],SAP[1],0);rotAbout(Mb,B0w,th);SKC[0]=kx;SKC[1]=ky;place(Mk,SK0,SKC,g);Rs.identity();
      placeStatic();
      tipL.set(KX+TIPS[0],KY+TIPS[1],0).applyMatrix4(Mk);mouthL.set(KX+.95,KY+.25,0).applyMatrix4(Mk);
      vA.set(SLF[0],SLF[1],0);vB.set(SLA[0],SLA[1],0).applyMatrix4(Mb);dynPlace(P.lcyl,vA,vB);
      vA.set(STA[0],STA[1],0).applyMatrix4(Mb);vB.set(STQ[0],STQ[1],0).applyMatrix4(Mk);dynPlace(P.tcyl,vA,vB)};
    api.setLoad=function(f){soilMesh.visible=f>.03;var l=.35+.65*f;soilMesh.scale.set(SOILS[0]*l,SOILS[1]*l,SOILS[2]*Math.min(1,.5+f))};
    api.setRoll=function(d,dl,dr){for(var k=0;k<WSP.length;k++)WSP[k].rotation.z=-((WSP[k].userData.s>0?(dr===undefined?d:dr):(dl===undefined?d:dl))/S)/.5}}
  if(DZ){api.lim={b:[-.08,.3],a:[-.4,.4],k:[0,.55]};api.wb=3.9*S;api.rad=2.4;
    var NSH=54,GOFF=new M4().makeTranslation(0,-.05,0);
    api.update=function(){
      var th=pose.b;api.th=th;api.contact=th<.02;
      B0w.set(ZTP[0],ZTP[1],0);rotAbout(Mb,B0w,th);
      Mk.copy(Mb);Tm.makeTranslation(ZBC[0],ZBC[1],0);Mk.multiply(Tm);Tm.makeRotationY(pose.a);Mk.multiply(Tm);Tm.makeTranslation(-ZBC[0],-ZBC[1],0);Mk.multiply(Tm);
      B0w.set(ZRP[0],ZRP[1],0);rotAbout(Ma,B0w,pose.k);Rs.identity();
      placeStatic();
      tipL.set(3.74,.1,0).applyMatrix4(Mk);mouthL.set(3.9,.4,0).applyMatrix4(Mk);
      vA.set(ZLA[0],ZLA[1],0);vB.set(ZLB[0],ZLB[1],0).applyMatrix4(Mb);dynPlace(P.lcyl,vA,vB);
      vA.set(ZRA[0],ZRA[1],0);vB.set(ZRB[0],ZRB[1],0).applyMatrix4(Ma);dynPlace(P.rcyl,vA,vB);
      q1.set(2.2,.72,.6).applyMatrix4(Mb);q2.set(3.4,.62,1.25).applyMatrix4(Mk);q3.set(2.2,.72,-.6).applyMatrix4(Mb);q4.set(3.4,.62,-1.25).applyMatrix4(Mk);pairWorld(P.acyl,q1,q2,q3,q4,ID)};
    api.setLoad=function(f){soilMesh.visible=f>.03;var l=.3+.7*f;soilMesh.scale.set(.55*l,.42*l,1.45)};
    api.setRoll=function(d){d=d/S;var H=HX,R=BR+.03,Lp=4*H+2*Math.PI*R,i,k,s0,x,y,a,f,ph;
      for(k=0;k<TRK.length;k++){var im=TRK[k].s,gm=TRK[k].g;
        for(i=0;i<NSH;i++){s0=(((i/NSH)*Lp-d)%Lp+Lp)%Lp;
          if(s0<2*H){x=-H+s0;y=-R;a=0}else if(s0<2*H+Math.PI*R){f=(s0-2*H)/R;ph=-Math.PI/2+f;x=H+R*Math.cos(ph);y=R*Math.sin(ph);a=ph+Math.PI/2}
          else if(s0<4*H+Math.PI*R){x=H-(s0-2*H-Math.PI*R);y=R;a=Math.PI}else{f=(s0-4*H-Math.PI*R)/R;ph=Math.PI/2+f;x=-H+R*Math.cos(ph);y=R*Math.sin(ph);a=ph+Math.PI/2}
          LDM.position.set(x,y,0);LDM.rotation.set(0,0,a);LDM.scale.set(1,1,1);LDM.updateMatrix();im.setMatrixAt(i,LDM.matrix);GTMP.copy(LDM.matrix).multiply(GOFF);gm.setMatrixAt(i,GTMP)}
        im.instanceMatrix.needsUpdate=true;gm.instanceMatrix.needsUpdate=true}
      for(k=0;k<SPR.length;k++)SPR[k].rotation.z=-d/.4}}
  if(MG){pose.a=.5;api.lim={b:[-.04,.22],a:[-.9,.9]};api.wb=5.8*S;api.rad=5.6;
    api.update=function(){
      var th=pose.b;api.th=th;api.contact=th<.015;
      B0w.set(GDB[0],GDB[1],0);rotAbout(Mb,B0w,-th);
      Ma.copy(Mb);Tm.makeTranslation(GCC[0],GCC[1],0);Ma.multiply(Tm);Tm.makeRotationY(pose.a);Ma.multiply(Tm);Tm.makeTranslation(-GCC[0],-GCC[1],0);Ma.multiply(Tm);
      Rs.makeTranslation(GPV,0,0);Tm.makeRotationY(api.art);Rs.multiply(Tm);Tm.makeTranslation(-GPV,0,0);Rs.multiply(Tm);
      for(var k=0;k<MGS.length;k++)MGS[k].rotation.y=api.art*1.2;
      placeStatic();
      var sg=pose.a>0?-1:1;soilMesh.position.z=sg*1.6;
      tipL.set(2.55,.1,0).applyMatrix4(Ma).applyMatrix4(Rs);mouthL.set(2.4,.3,sg*1.55).applyMatrix4(Ma).applyMatrix4(Rs);
      vA.set(GLA[0],GLA[1],0);vB.set(GLB[0],GLB[1],0).applyMatrix4(Mb);dynPlace(P.lcyl,vA,vB);
      q1.set(GPV-.65,.95,.4);q2.set(GPV+.4,1.0,.4).applyMatrix4(Rs);q3.set(GPV-.65,.95,-.4);q4.set(GPV+.4,1.0,-.4).applyMatrix4(Rs);pairWorld(P.artcyl,q1,q2,q3,q4,ID)};
    api.setLoad=function(f){soilMesh.visible=f>.03;var l=.3+.7*f;soilMesh.scale.set(.7*l,.22*l,.3*l)};
    api.setRoll=function(d){for(var k=0;k<WSP.length;k++)WSP[k].rotation.z=-d/S/.5}}
  api.tipWorld=function(o){return o.copy(tipL).applyMatrix4(body.matrixWorld)};
  api.mouthWorld=function(o){return o.copy(mouthL).applyMatrix4(body.matrixWorld)};
  /* ---------- 그리기 호출을 줄이려고 움직이지 않는 조각을 재질별로 합친다 ---------- */
  if(soilMesh)soilMesh.userData.dyn=true;
  LIST.forEach(function(p){if(p.dyn)p.g.traverse(function(o){o.userData.dyn=true})});
  function bake(g){var byM={},keep=[],kids=g.children.slice();
    kids.forEach(function(o){if(o.isMesh&&!o.isInstancedMesh&&!o.userData.dyn&&o.children.length===0){o.updateMatrix();var q=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();q.applyMatrix4(o.matrix);var k=o.material.uuid;(byM[k]||(byM[k]={m:o.material,l:[]})).l.push(q);g.remove(o)}
      else if(o.isGroup)bake(o)});
    Object.keys(byM).forEach(function(k){var me=new T.Mesh(mergeGeos(byM[k].l),byM[k].m);me.castShadow=true;me.receiveShadow=true;g.add(me)})}
  LIST.forEach(function(p){if(!p.dyn)bake(p.g)});
  root.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  api.update();api.setRoll(0);api.setLoad(0);
  return api}

/* ===== 휠 굴삭기: HX220A 상부 · 작업장치 + 바퀴식 하부 (복륜 4축단, 앞 도저 블레이드, 뒤 아웃트리거) ===== */
function makeWheelEx(){
  var api=makeExcavator(),P=api.parts,g=new T.Group(),WS=[],legs=[],R=.52,AX=1.45;api.root.add(g);
  ['idler','track','uroll','lroll','sprocket','tmotor','lower'].forEach(function(k){if(P[k]&&P[k].g.parent)P[k].g.parent.remove(P[k].g)});
  sh(rb(3.9,.34,.9,.08,TM.DK2,0,.68,0),g);sh(rb(1.7,.1,1.7,.04,TM.DK2,0,.87,0),g);sh(rb(.4,.34,.44,.05,TM.YD,-.4,.42,0),g);
  [AX,-AX].forEach(function(x){sh(cz(.12,2.0,TM.FR,x,R,0,14),g);sh(cx(.2,.34,TM.FR,x,R,0,16),g);
    [-1,1].forEach(function(s){var w=new T.Group();w.position.set(x,R,s*.98);g.add(w);WS.push(w);
      [-.16,.16].forEach(function(dz){sh(cz(R,.27,TM.TIRE,0,0,dz,24),w)});sh(cz(.29,.62,TM.RIM,0,0,0,18),w);
      for(var k=0;k<6;k++){var a=k/6*Math.PI*2;sh(cz(.035,.66,TM.HUB,Math.cos(a)*.19,Math.sin(a)*.19,0,8),w)}})});
  sh(cx(.05,2.6,TM.CH,0,R,0,10),g);
  /* 도저 블레이드 (주행할 때 들어 올린다) */
  var bl=new T.Group();bl.position.set(1.95,.68,0);g.add(bl);
  sh(ext(beamShape([[.72,-.02],[.8,-.2],[.8,-.46],[.7,-.62]],[.03,.035,.035,.03]),2.5,TM.Y,.01),bl);sh(bx(.08,.05,2.5,TM.DK,.68,-.64,0),bl);
  [-1,1].forEach(function(s){sh(beam([0,0],[.74,-.4],.07,.06,.1,TM.YD,s*.55),bl)});
  /* 아웃트리거 */
  sh(rb(.34,.3,1.9,.05,TM.YD,-2.25,.66,0),g);
  [-1,1].forEach(function(s){var lg=new T.Group();lg.position.set(-2.25,.62,s*.92);g.add(lg);sh(bx(.16,.78,.18,TM.Y,0,-.39,0),lg);sh(cx(.07,.38,TM.CH,0,0,0,10),lg);
    var pd=new T.Group();pd.position.set(0,-.78,0);lg.add(pd);sh(bx(.46,.07,.42,TM.DK,0,0,0),pd);legs.push({g:lg,pad:pd,s:s})});
  api.chassis=g;
  api.setStow=function(v){api.stow=v;var a=.714+(1.92-.714)*v;legs.forEach(function(l){l.g.rotation.x=-l.s*a;l.pad.rotation.x=l.s*a});bl.rotation.z=.3*v};
  api.setRoll=function(d){for(var k=0;k<WS.length;k++)WS[k].rotation.z=-d/R};
  api.setStow(0);return api}
