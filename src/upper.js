/* ===== 상부 선회부 · HX220A: 상부폭 2,740 · 후단 반경 2,890 · 카운터웨이트 하단 1,115 · 운전석 3,035 · 핸드레일 3,245 ===== */
var MY=M(0xF0C33C,{r:.6}),MYD=M(0xD9A72B,{r:.65}),MK=M(0x47494C,{r:.7}),MKD=M(0x2E3033,{r:.7}),MGL=M(0x9FB8C4,{r:.15,op:.42});
/* 평면 모양(x, z)을 y0~y1로 세운 덩어리 */
function planExt(pts,y0,y1,m,bev){var s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();
  var b=bev||0,g=new T.ExtrudeGeometry(s,{depth:Math.max(y1-y0-2*b,.002),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:1,curveSegments:8});
  g.rotateX(Math.PI/2);g.translate(0,y1-b,0);return new T.Mesh(g,m)}
/* 단면 모양(z, y)을 x0~x1로 민 덩어리 */
function crossExt(pts,x0,x1,m,bev){var s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();
  var b=bev||0,g=new T.ExtrudeGeometry(s,{depth:Math.max(x1-x0-2*b,.002),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:1,curveSegments:8});
  g.rotateY(-Math.PI/2);g.translate(x1-b,0,0);return new T.Mesh(g,m)}
/* 옆모양(x, y)을 z 중심으로 두께 d만큼 민 덩어리 */
function sideExt(pts,z,d,m,bev){var s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();var o=ext(s,d,m,bev||0);o.position.z=z;return o}
/* 꼭짓점마다 모서리 반경 [x, y, r] */
function rnd(pts,n){n=n||5;var out=[],N=pts.length;
  for(var i=0;i<N;i++){var x=pts[i][0],y=pts[i][1],r=pts[i][2]||0;if(!r){out.push([x,y]);continue}
    var a=pts[(i-1+N)%N],b=pts[(i+1)%N],ax=a[0]-x,ay=a[1]-y,bx2=b[0]-x,by2=b[1]-y,la=Math.hypot(ax,ay),lb=Math.hypot(bx2,by2),t=Math.min(r,la*.45,lb*.45);
    var p0=[x+ax/la*t,y+ay/la*t],p1=[x+bx2/lb*t,y+by2/lb*t];
    for(var j=0;j<=n;j++){var u=j/n,q0=[p0[0]+(x-p0[0])*u,p0[1]+(y-p0[1])*u],q1=[x+(p1[0]-x)*u,y+(p1[1]-y)*u];out.push([q0[0]+(q1[0]-q0[0])*u,q0[1]+(q1[1]-q0[1])*u])}}
  return out}
function tubeOf(pts,r,m){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(function(q){return new V3(q[0],q[1],q[2])}),false,'catmullrom',.15),64,r,8,false),m)}
var HALF=1.37,DK0=1.0,DK1=1.2;
(function(){
  var p=def('upper','상부 프레임 · 커버','upper',{off:[0,1.7,0],anchor:[-.6,2.45,HALF]});
  put(p,rb(3.85,DK1-DK0,2*HALF-.1,.05,MK,-.375,(DK0+DK1)/2,0));
  /* 엔진 후드(운전석 뒤, 왼쪽부터 중앙까지): 바깥 윗모서리가 둥글다 */
  put(p,crossExt(rnd([[-HALF,DK1],[.45,DK1],[.45,2.42],[-HALF,2.42,.18]]),-1.95,-.5,MY,.01));
  for(var i=0;i<8;i++)put(p,bx(.07,.012,.8,MKD,-1.85+i*.13,2.426,-.6),null,true);
  /* 오른쪽 탱크 커버(연료·작동유 탱크 위): 문 두 짝과 뒤쪽 루버 그릴 */
  put(p,crossExt(rnd([[.45,DK1],[HALF,DK1],[HALF,2.42,.22],[.45,2.42]]),-1.95,.5,MY,.01));
  put(p,bx(.95,.9,.008,MYD,-1.455,1.75,HALF+.004));put(p,bx(1.3,.9,.008,MYD,-.24,1.75,HALF+.004));
  for(i=0;i<9;i++)put(p,bx(.05,.42,.01,MKD,-1.82+i*.1,1.88,HALF+.01),null,true);
  /* 오른쪽 앞 공구함: 바깥 앞모서리가 둥근 노란 상자, 작업등과 미러 */
  put(p,planExt(rnd([[.5,.6],[1.55,.6],[1.55,HALF,.35],[.5,HALF]]),DK1,1.95,MY,.01));
  put(p,cy(.07,.12,MKD,1.42,2.01,.95,16));
  put(p,tubeOf([[1.35,1.95,1.22],[1.35,2.4,1.22],[1.6,2.62,1.45]],.02,MKD),null,true);
  put(p,bx(.06,.3,.24,MKD,1.62,2.62,1.47));
  /* 탱크 커버 위 핸드레일: 지면에서 3,245 */
  put(p,tubeOf([[.25,2.42,1.28],[.25,3.05,1.28],[.22,3.17,1.28],[.1,3.2,1.28],[-1.35,3.2,1.28],[-1.47,3.17,1.28],[-1.5,3.05,1.28],[-1.5,2.42,1.28]],.025,MY),null,true);
  /* 배기관과 프리클리너 */
  put(p,cy(.06,.42,MKD,-1.25,2.63,-.12,16));put(p,cy(.11,.26,MK,-.75,2.55,-.7,24));
  /* 붐 풋 브래킷 */
  put(p,sideExt([[-.3,DK1],[.95,DK1],[.45,2.22],[-.05,2.22]],.25,.84,MK,.02));
})();
(function(){
  var p=def('smotor','선회모터','upper',{off:[.4,2.3,-1.2],anchor:[.25,1.6,.3]});
  var mm=M(0x5A5D61),mg=M(0x47494C),mb=M(0x9A9DA1);
  put(p,cy(.17,.18,mg,.25,1.09,.3,22));
  put(p,cy(.13,.4,mm,.25,1.38,.3,22));
  put(p,cy(.07,.08,mb,.25,1.62,.3,14));
})();
(function(){
  var p=def('cw','카운터웨이트','upper',{off:[-2.2,1.7,0],anchor:[-2.7,2.2,-.9]});
  /* 후단 반경 2,890의 원호, 하단은 지면에서 1,115 */
  var pts=[],h=Math.asin(HALF/2.89);
  for(var i=0;i<=24;i++){var a=Math.PI-h+i/24*2*h;pts.push([2.89*Math.cos(a),2.89*Math.sin(a)])}
  pts.push([-1.95,-HALF],[-1.95,HALF]);
  /* 원호 쪽이 바깥이 되게 순서 정리 */
  pts=[[-1.95,HALF]].concat(pts.slice(0,25)).concat([[-1.95,-HALF]]);
  put(p,planExt(pts,1.115,2.42,MK,.03));
  [-1,1].forEach(function(s){put(p,cy(.07,.08,MKD,-2.45,2.46,s*.75,16));put(p,bx(.04,.1,.24,MB(0xC2410C),-2.85,2.15,s*.6))});
})();
(function(){
  var p=def('cab','캐빈','upper',{off:[.2,3.2,-.3],anchor:[.5,2.6,-HALF]});
  var z0=-.87,mseat=M(0x3A3C3F,{r:.9});
  /* 옆모양: 앞유리가 뒤로 기울고 지붕(3,035)으로 둥글게 넘어간다 */
  var prof=rnd([[-.45,DK1],[1.4,DK1],[1.4,1.62],[1.22,2.9,.18],[1.08,3.035,.12],[-.4,3.035,.1],[-.45,2.9]]);
  /* 프레임만 노랗고 창은 유리: 기둥과 지붕, 아래 패널을 따로 만든다 */
  put(p,sideExt([[-.45,DK1],[1.4,DK1],[1.4,1.62],[-.45,1.62]],z0,1.0,MY,.01));
  put(p,sideExt(prof.filter(function(q){return q[1]>=2.86}).concat([[-.45,2.86]]),z0,1.0,MY,.01));
  [[-.45,-.33],[.22,.32],[1.24,1.4]].forEach(function(xx,j){
    var x0=xx[0],x1=xx[1],top=j===2?2.86:2.86;
    var poly=j===2?[[1.33,1.62],[1.4,1.62],[1.24,2.86],[1.17,2.86]]:[[x0,1.62],[x1,1.62],[x1,top],[x0,top]];
    [-1,1].forEach(function(q){put(p,sideExt(poly,z0+q*.47,.06,MY,.005))})});
  /* 유리: 양옆, 앞 */
  [-1,1].forEach(function(q){var g=sideExt([[-.33,1.64],[1.36,1.64],[1.2,2.85],[-.33,2.85]],z0+q*.475,.012,MGL);g.castShadow=false;put(p,g,null,true)});
  var fg=bx(.012,1.25,.86,MGL,1.3,2.24,z0);fg.rotation.z=Math.atan2(.16,1.24);fg.castShadow=false;put(p,fg,null,true);
  /* 경광등 */
  put(p,cy(.06,.1,MB(0xE07B00),-.2,3.085,z0-.3,16));
  /* 실내: 시트와 좌우 조이스틱 */
  put(p,rb(.45,.12,.48,.04,mseat,.2,1.55,z0));put(p,rb(.1,.6,.46,.04,mseat,-.05,1.9,z0));
  [-.3,.3].forEach(function(dz){put(p,bx(.3,.3,.13,MKD,.5,1.48,z0+dz));put(p,cy(.025,.28,MKD,.5,1.76,z0+dz,10));put(p,cy(.05,.07,mseat,.5,1.92,z0+dz,12))});
})();

/* ===== 엔진룸 내부 (커버 안쪽: 투시·분해로 보인다) ===== */
(function(){
  var p=def('engine','엔진','upper',{off:[-.8,4.4,0],anchor:[-1.25,2.0,-.45]});
  var m=M(0x8FA7AE),mh=M(0x7B949B),mf=M(0x3A3C3F),mr=M(0xC9A27E);
  put(p,rb(.95,.55,.85,.06,m,-1.2,1.62,-.45));
  for(var i=0;i<4;i++)put(p,rb(.16,.14,.75,.03,mh,-1.45+i*.22,1.97,-.45));
  put(p,rb(.1,.7,1.15,.03,mr,-1.85,1.75,-.45));
  put(p,cx(.32,.05,mf,-1.78,1.75,-.45,22));
})();
(function(){
  var p=def('pump','유압펌프','upper',{off:[-.4,3.7,-1.6],anchor:[-.5,1.62,.15]});
  var m=M(0xC9A27E),ms=M(0x8C8F93);
  put(p,cx(.22,.36,m,-.5,1.55,.15,24));put(p,cx(.13,.2,ms,-.3,1.55,.15,18));put(p,rb(.2,.3,.3,.04,m,-.5,1.73,.15));
})();
(function(){
  var p=def('valve','컨트롤 밸브','upper',{off:[-.1,2.4,2.3],anchor:[.2,1.62,.85]});
  var m=M(0xB8C4D6),ms=M(0xEEF0F2);
  put(p,rb(.5,.36,.42,.05,m,.2,1.45,.85));
  for(var i=0;i<5;i++)put(p,rb(.06,.16,.3,.02,ms,.02+i*.09,1.71,.85));
})();
(function(){
  var p=def('tank','유압 탱크','upper',{off:[-.2,2.6,2.2],anchor:[-.8,1.95,.95]});
  var m=M(0xA9ADB2),mc=M(0xEEF0F2);
  put(p,rb(.8,.75,.6,.06,m,-.8,1.62,.95));put(p,cy(.08,.1,mc,-.6,2.05,.95,16));
})();
