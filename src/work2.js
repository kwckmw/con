/* ===== 작업장치 (순기구학) · HX220A: 붐 5.7 m · 암 2.9 m · 버킷 0.92 m³(폭 1,085) ===== */
/* 핀 좌표와 윤곽은 기구학 모델의 기본 자세에서 뽑은 값(HX). 붐 평면은 차체 중심에서 오른쪽(+z)으로 0.25 m */
var B0=new V3(HXD.F[0],HXD.F[1],0),P2=new V3(HXD.T[0],HXD.T[1],0),A1=new V3(HXD.B[0],HXD.B[1],0);
var Z0=.25;
var MWK=M(0x47494C,{r:.65}),MWD=M(0x3A3C3F,{r:.65}),MPIN=M(0x9A9DA1,{r:.4,m:.5}),MHOSE=M(0x232425,{r:.7});
function shp(pts){var s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return s}
function slab(pts,d,m,z,bev){var o=ext(shp(pts),d,m,bev===undefined?.01:bev);o.position.z=z;return o}
function pinAt(q,r,len,m){return cz(r,len,m||MPIN,q[0],q[1],Z0,18)}
function hose(pts,dz){return tubeOf(pts.map(function(q){return [q[0],q[1],Z0+dz]}),.024,MHOSE)}
(function(){
  var p=def('boom','붐','work',{off:[0,2.6,.8],fk:1,anchor:[(HXD.F[0]+HXD.T[0])/2,(HXD.F[1]+HXD.T[1])/2+.9,Z0]});
  /* 가운데가 깊고 휜 상자형 붐 */
  put(p,slab(HXD.boom,.62,MWK,Z0,.02));
  put(p,slab(HXD.boomLug,1.04,MWD,Z0));
  put(p,slab(HXD.boomTop,.34,MWD,Z0));
  put(p,slab(HXD.boomClevis,.72,MWD,Z0));
  put(p,pinAt(HXD.F,.075,.96));put(p,pinAt(HXD.bRod,.06,1.16));put(p,pinAt(HXD.aBase,.06,.44));put(p,pinAt(HXD.T,.08,.84));
  /* 붐 윗면을 따라가는 유압 호스 네 가닥: 암 회로 두 가닥은 암 실린더 뒤끝까지, 버킷 회로 두 가닥은 붐 끝 벌크헤드까지 */
  [.15,.23].forEach(function(o){put(p,hose(HXD.hoseArm,-o-0),null,true)});
  [-.23,-.15].forEach(function(o){put(p,hose(HXD.hoseBkt,o+.38),null,true)});
  HXD.hoseBlocks.forEach(function(b){put(p,slab(b,.6,MWD,Z0))});
})();
(function(){
  var p=def('arm','암','work',{off:[1.4,1.4,1.9],fk:2,anchor:[(HXD.T[0]+HXD.B[0])/2+.25,(HXD.T[1]+HXD.B[1])/2,Z0]});
  /* 위가 깊고 버킷 쪽으로 가늘어지는 암 */
  put(p,slab(HXD.arm,.42,MWK,Z0,.02));
  put(p,slab(HXD.armLug,.3,MWD,Z0));put(p,slab(HXD.armLinkLug,.5,MWD,Z0));
  put(p,pinAt(HXD.tail,.07,.52));put(p,pinAt(HXD.kBase,.055,.4));put(p,pinAt(HXD.S,.055,.6));
  [.1,.18].forEach(function(dz){put(p,hose(HXD.armHose,dz),null,true)});
})();
var soilMesh=null;
(function(){
  var p=def('bucket','버킷','work',{off:[2.4,.5,2.9],fk:3,anchor:[HXD.mouth[0],HXD.mouth[1],Z0-.6]});
  var BH=.5425;
  /* 옆판 두 장, 둥근 뒷판(조각), 립바, 커팅 엣지, 어댑터·이빨 5개, 사이드 커터, 귀 */
  [-1,1].forEach(function(q){put(p,slab(HXD.bucketSide,.03,MWK,Z0+q*(BH-.015)))});
  var bb=HXD.bucketBack,tk=HXD.tk;
  for(var i=0;i<bb.length-1;i++){
    var a=bb[i],b=bb[i+1],dx=b[0]-a[0],dy=b[1]-a[1],ln=Math.hypot(dx,dy),ox=dy/ln*.06,oy=-dx/ln*.06;
    /* 안쪽(입 쪽)으로 두께를 준다: 로컬 법선을 월드로 돌린 값 */
    var lx=HXD.bucketBackLocal[i+1][0]-HXD.bucketBackLocal[i][0],ly=HXD.bucketBackLocal[i+1][1]-HXD.bucketBackLocal[i][1],ll=Math.hypot(lx,ly);
    var nx=-ly/ll*.06,ny=lx/ll*.06,c=Math.cos(tk),s=Math.sin(tk);ox=nx*c-ny*s;oy=nx*s+ny*c;
    put(p,slab([a,b,[b[0]+ox,b[1]+oy],[a[0]+ox,a[1]+oy]],2*BH-.06,MWK,Z0,.005))}
  put(p,cz(.06,2*BH,MWD,HXD.bucketLip[0],HXD.bucketLip[1],Z0,16));
  put(p,slab(HXD.bucketEdge,2*BH,MWD,Z0));
  for(var k=0;k<5;k++){var z=Z0-.42+k*.21;put(p,slab(HXD.adapter,.11,MWD,z));put(p,slab(HXD.tooth,.09,MWD,z))}
  [-1,1].forEach(function(q){put(p,slab(HXD.cutter,.025,MWD,Z0+q*(BH+.0125)));put(p,slab(HXD.ear,.04,MWD,Z0+q*.22))});
  put(p,pinAt(HXD.B,.07,1.12));put(p,pinAt(HXD.K,.05,.52));
  soilMesh=new T.Mesh(new T.IcosahedronGeometry(1,1),M(C.SOIL,{r:1}));
  soilMesh.position.set(HXD.soil[0],HXD.soil[1],Z0);soilMesh.scale.set(.1,.1,.1);soilMesh.visible=false;put(p,soilMesh,null,true);
})();

/* ===== 유압 실린더 · 링크 (동적) ===== */
var UP=new V3(0,1,0);
var gEye=new T.CylinderGeometry(.1,.1,.34,14);gEye.rotateX(Math.PI/2);
function cylSet(p,mb,mr,me,d){return {barrel:put(p,new T.Mesh(d.gb,mb)),rod:put(p,new T.Mesh(d.gr,mr)),col:put(p,new T.Mesh(d.gc,me)),ea:put(p,new T.Mesh(d.ge,me)),eb:put(p,new T.Mesh(d.ge,me))}}
/* 보어/로드 지름(m), 배럴 길이: 서비스 매뉴얼급 값 */
function cylPart(id,name,off,lb,pair,bore,rod){
  var p=def(id,name,'work',{off:off,dyn:true});
  var rB=bore/2+.022,d={gb:new T.CylinderGeometry(rB,rB,1,22),gr:new T.CylinderGeometry(rod/2,rod/2,1,16),gc:new T.CylinderGeometry(rB+.014,rB+.014,.07,22),ge:new T.CylinderGeometry(rod*.75,rod*.75,rB*2.6,14)};
  d.ge.rotateX(Math.PI/2);
  var mb=M(0x3A3C3F,{r:.55,m:.3}),mr=M(C.CH,{r:.25,m:.6}),me=M(0x55575B);
  p.rig=cylSet(p,mb,mr,me,d);p.rig.type='cyl';p.rig.lb=lb;
  if(pair){p.rig.pair=cylSet(p,mb,mr,me,d);p.rig.pair.lb=lb;p.rig.dz=pair}
  return p}
cylPart('bmcyl','붐 실린더',[.6,1.3,-2.6],1.76,.42,.12,.085);
cylPart('acyl','암 실린더',[1.2,1.6,-2.7],1.94,0,.14,.1);
cylPart('bcyl','버킷 실린더',[2.0,.9,-2.7],1.36,0,.12,.085);
(function(){
  var p=def('link','버킷 링크','work',{off:[3.4,.3,-.6],dyn:true});
  var mb=M(0x47494C),mp=M(0x9A9DA1,{r:.4,m:.5});
  var gb=new T.BoxGeometry(.15,1,.04),gp=new T.CylinderGeometry(.06,.06,.6,14);gp.rotateX(Math.PI/2);
  /* 사이드 링크 두 장(암 → 로드 끝), H 링크 두 장(로드 끝 → 버킷) */
  p.rig={type:'link',b1:[put(p,new T.Mesh(gb,mb)),put(p,new T.Mesh(gb,mb))],b2:[put(p,new T.Mesh(gb,mb)),put(p,new T.Mesh(gb,mb))],dz1:.22,dz2:.17,
    p1:put(p,new T.Mesh(gp,mp)),p2:put(p,new T.Mesh(gp,mp)),p3:put(p,new T.Mesh(gp,mp))};
})();
