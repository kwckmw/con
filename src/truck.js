/* ===================== HA30A 굴절식 덤프트럭 =====================
   공개 사양: 적재 28 t, 적재함 16.8 m³(테일게이트 17.8 m³), 최대 덤프각 70°, 회전반경 7.68 m, 타이어 23.5R25.
   나머지 치수는 측면 사진 비례로 추정: 전장 9.3 m, 앞축↔굴절점 1.63 m, 굴절점↔후방 보기 중심 3.6 m, 보기 축간 1.73 m.
   좌표: 앞 유닛 원점 = 앞축 중심 지면, 뒤 유닛 원점 = 보기 중심 지면, x 앞쪽 · y 위 · z 오른쪽 */
var ADT={FO:2.12,RO:7.19,AH:1.63,HB:3.6,BG:.865,WR:.81,WZ:1.175,LEN:9.31,CAP:16.8,CAP_T:28,RHO:1.6,PIV:[-1.25,1.85],TIP:70*Math.PI/180};
var TM={Y:M(0xF0A41F,{r:.55}),YD:M(0xD48C12,{r:.6}),DK:M(0x2E3135,{r:.6,m:.2}),DK2:M(0x45484D,{r:.55,m:.25}),FR:M(0x26282B,{r:.7,m:.2}),
  TIRE:M(0x1E1F21,{r:.95}),RIM:M(0xF2A51C,{r:.5,m:.2}),HUB:M(0x3B3E42,{r:.5,m:.4}),CH:M(0xC9CCD0,{r:.25,m:.7}),
  GL:M(0x34444f,{r:.08,m:.1,op:.62}),SEAT:M(0x2a2b2d,{r:.9}),OR:M(0xF07A1A,{r:.6}),
  LAMP:new T.MeshStandardMaterial({color:0xfff6d8,emissive:0xfff0c0,emissiveIntensity:.2}),BEACON:new T.MeshStandardMaterial({color:0xffa21a,emissive:0xff8a00,emissiveIntensity:0}),
  SOIL:M(0x9b7a55,{r:.95})};
TM.LAMP.userData.lamp=TM.BEACON.userData.lamp=true;
/* 타이어: 둥근 단면을 돌린 몸통 + 쉐브론 러그 */
var TIRE_GEO=(function(){var R=ADT.WR,W=.6,r=.16,pts=[],i;
  pts.push(new T.Vector2(.42,-W/2+.02));
  for(i=0;i<=6;i++){var a=-Math.PI/2+i/6*Math.PI/2;pts.push(new T.Vector2(R-.05-r+Math.cos(a)*r,-W/2+r+Math.sin(a)*r))}
  for(i=0;i<=6;i++){var b=i/6*Math.PI/2;pts.push(new T.Vector2(R-.05-r+Math.cos(b)*r,W/2-r+Math.sin(b)*r))}
  pts.push(new T.Vector2(.42,W/2-.02));
  var body=new T.LatheGeometry(pts,40);body.rotateX(Math.PI/2);
  var lugs=[],N=26;for(i=0;i<N;i++){var a2=i/N*Math.PI*2;[-1,1].forEach(function(s){var g=new T.BoxGeometry(.13,.07,.27);g.rotateY(s*.5);g.translate(0,R-.03,s*(.15+(i%2)*.02));g.rotateZ(a2+(s>0?Math.PI/N:0));lugs.push(g)})}
  return {body:body,lugs:mergeGeos(lugs)}})();
var RIM_GEO=(function(){var a=[],h=[];var g=new T.CylinderGeometry(.43,.43,.5,32,1,true);g.rotateX(Math.PI/2);a.push(g);
  var d=new T.CylinderGeometry(.4,.4,.05,32);d.rotateX(Math.PI/2);d.translate(0,0,.12);a.push(d);
  var lip=new T.TorusGeometry(.43,.025,6,32);lip.translate(0,0,.25);a.push(lip);
  var hb=new T.CylinderGeometry(.16,.2,.18,18);hb.rotateX(Math.PI/2);hb.translate(0,0,.2);h.push(hb);
  for(var i=0;i<10;i++){var n=new T.CylinderGeometry(.022,.022,.06,6);n.rotateX(Math.PI/2);var ang=i/10*Math.PI*2;n.translate(Math.cos(ang)*.24,Math.sin(ang)*.24,.16);h.push(n)}
  return {rim:mergeGeos(a),hub:mergeGeos(h)}})();
function adtWheel(par,x,z){var g=new T.Group();g.position.set(x,ADT.WR,z);par.add(g);var w=new T.Group();g.add(w);if(z<0)w.rotation.y=Math.PI;
  [new T.Mesh(TIRE_GEO.body,TM.TIRE),new T.Mesh(TIRE_GEO.lugs,TM.TIRE),new T.Mesh(RIM_GEO.rim,TM.RIM),new T.Mesh(RIM_GEO.hub,TM.HUB)].forEach(function(m){sh(m,w)});return g}
function tube(par,pts,r,m){var c=new T.CatmullRomCurve3(pts.map(function(p){return new V3(p[0],p[1],p[2])}));return sh(new T.Mesh(new T.TubeGeometry(c,Math.max(4,pts.length*6),r,8,false),m),par)}
function adtCyl(par,m1,m2){var b=sh(new T.Mesh(new T.CylinderGeometry(.11,.11,1,14),m1),par),r=sh(new T.Mesh(new T.CylinderGeometry(.06,.06,1,10),m2),par);return {b:b,r:r,lb:2.2}}
function setCyl(c,a,b){_v.subVectors(b,a);var L=_v.length();_v.normalize();var lb=Math.min(c.lb,L-.15);c.b.position.copy(a).addScaledVector(_v,lb/2);c.b.scale.set(1,lb,1);c.b.quaternion.setFromUnitVectors(UPV,_v);
  var rl=L-lb+.1;c.r.position.copy(b).addScaledVector(_v,-rl/2);c.r.scale.set(1,rl,1);c.r.quaternion.copy(c.b.quaternion)}

function makeADT(id,tag){
  var root=new T.Group(),F=new T.Group(),R=new T.Group();root.add(F,R);
  /* ---------- 앞 유닛 (트랙터) ---------- */
  box(3.6,.42,1.0,TM.FR,.2,1.05,0,F);                                    /* 프레임 */
  rbx(.36,.55,2.62,.05,TM.DK,1.96,1.22,0,F);                             /* 범퍼 */
  [-.9,.9].forEach(function(z){sh(cz(.05,.18,TM.CH,2.18,1.05,z),F)});
  box(1.6,.6,2.2,TM.DK2,1.2,1.3,0,F);                                    /* 엔진 하부 */
  var hood=sh(ext(shape([[2.08,1.55],[2.14,2.3],[1.98,2.5],[.55,2.8],[.45,2.8],[.45,1.6]]),2.12,TM.Y,.04),F);
  sh(ext(shape([[2.15,1.62],[2.19,2.24],[2.04,2.4],[2.0,1.62]]),1.6,TM.DK,.01),F);             /* 그릴 */
  [-1,1].forEach(function(s){var z=s*1.065;
    sh(rb(1.15,.4,.03,.08,TM.DK,1.3,2.05,z),F);                                                  /* 측면 흡기구 */
    sh(ext(shape([[1.95,2.45],[1.75,2.5],[.6,2.76],[.55,2.66],[1.7,2.4]]),.02,TM.DK,0),F).position.z=s*1.07; /* 사선 띠 */
    sh(bx(.14,.1,.04,TM.LAMP,2.12,2.12,s*.82),F);                                                /* 전조등 */
    var fd=new T.Shape();fd.absarc(0,0,1.0,0,Math.PI,false);fd.absarc(0,0,.9,Math.PI,0,true);var fe=sh(ext(fd,.72,TM.DK,.01),F);fe.position.set(0,.81,s*1.18);
    tube(F,[[2.02,2.62,s*.98],[1.6,2.78,s*1.0],[.62,3.02,s*1.02]],.025,TM.DK);                     /* 보닛 손잡이 */
    [1.9,1.2,.7].forEach(function(x){sh(cy(.02,.32,TM.DK,x,2.62+(.2-x*.06),s*.99),F)})});
  /* 승강 사다리 (왼쪽) */
  [1.2,1.55].forEach(function(x){box(.04,1.1,.05,TM.DK,x,.95,-1.42,F)});[.55,.85,1.15].forEach(function(y){box(.36,.04,.18,TM.DK,1.38,y,-1.42,F)});
  /* 캐빈 */
  box(2.1,.38,2.3,TM.DK,-.55,2.1,0,F);
  sh(rb(1.98,1.2,1.92,.06,TM.GL,-.55,2.88,0),F);
  [[.42,.94],[.42,-.94],[-1.52,.94],[-1.52,-.94]].forEach(function(p){box(.09,1.28,.09,TM.DK,p[0],2.88,p[1],F)});
  [-.94,.94].forEach(function(z){box(1.98,.07,.08,TM.DK,-.55,2.62,z,F);box(.07,1.2,.06,TM.DK,-.3,2.88,z,F)});
  box(.08,1.2,1.92,TM.DK,-1.5,2.88,0,F);
  rbx(2.2,.14,2.1,.05,TM.Y,-.55,3.56,0,F);rbx(2.05,.06,1.95,.02,TM.YD,-.55,3.65,0,F);
  box(.6,.55,.55,TM.SEAT,-.9,2.45,0,F);box(.12,.6,.55,TM.SEAT,-1.18,2.75,0,F);sh(new T.Mesh(new T.TorusGeometry(.17,.02,6,18),TM.DK),F).position.set(-.3,2.75,0);
  tube(F,[[.4,3.66,-.95],[.4,3.82,-.95],[-1.5,3.82,-.95],[-1.5,3.66,-.95]],.022,TM.DK);tube(F,[[.4,3.66,.95],[.4,3.82,.95],[-1.5,3.82,.95],[-1.5,3.66,.95]],.022,TM.DK);
  var bcn=sh(cy(.09,.14,TM.BEACON,-1.2,3.78,.6,12),F);
  var tagM=M(tag,{r:.5});box(.5,.05,.08,tagM,-.55,3.6,1.06,F);box(.5,.05,.08,tagM,-.55,3.6,-1.06,F);   /* 차량 식별 띠 */
  [-1,1].forEach(function(s){tube(F,[[.38,3.0,s*.96],[.65,3.0,s*1.25],[.75,3.0,s*1.38]],.02,TM.DK);box(.06,.42,.2,TM.DK,.76,2.85,s*1.42,F);
    sh(rb(.8,.2,.02,.05,TM.OR,-.3,2.08,s*1.16),F).rotation.z=.12});
  /* 배기관 · 히치 */
  sh(cy(.1,1.15,TM.DK,.62,3.0,-.92,14),F);sh(cy(.13,.5,TM.DK2,.62,2.4,-.92,14),F);
  rbx(.75,.75,1.05,.06,TM.DK,-1.35,1.25,0,F);sh(cy(.32,.7,TM.DK2,-1.63,1.25,0,20),F);
  var wF=[adtWheel(F,0,ADT.WZ),adtWheel(F,0,-ADT.WZ)];
  /* ---------- 뒤 유닛 ---------- */
  [-.55,.55].forEach(function(z){box(4.9,.36,.26,TM.FR,1.0,1.18,z,R)});
  rbx(.75,.72,1.0,.06,TM.DK,3.25,1.25,0,R);sh(cy(.28,.75,TM.DK2,3.6,1.25,0,20),R);
  [-ADT.BG,ADT.BG].forEach(function(x){sh(cz(.17,2.0,TM.DK,x,ADT.WR,0,16),R)});box(2.1,.3,.5,TM.DK,0,1.0,0,R);sh(cy(.32,.4,TM.DK2,0,.85,0,18),R);
  [-1,1].forEach(function(s){box(2.2,.22,.18,TM.DK,0,ADT.WR+.05,s*.8,R);box(.06,.6,.6,TM.DK,-1.85,.9,s*1.18,R)});
  var wR=[adtWheel(R,ADT.BG,ADT.WZ),adtWheel(R,ADT.BG,-ADT.WZ),adtWheel(R,-ADT.BG,ADT.WZ),adtWheel(R,-ADT.BG,-ADT.WZ)];
  /* 적재함: 회전축(PIV) 기준 그룹 */
  var body=new T.Group(),bodyIn=new T.Group();body.position.set(ADT.PIV[0],ADT.PIV[1],0);bodyIn.position.set(-ADT.PIV[0],-ADT.PIV[1],0);body.add(bodyIn);R.add(body);
  var prof=[[2.75,1.55],[3.4,2.25],[3.4,3.3],[3.32,3.56],[2.95,3.56],[2.25,3.02],[-1.0,3.02],[-1.95,3.12],[-1.98,2.9],[-1.62,2.0],[.5,1.55]];
  [-1,1].forEach(function(s){var p=sh(ext(shape(prof),.08,TM.Y,.015),bodyIn);p.position.z=s*1.41;
    tube(bodyIn,[[2.25,3.04,s*1.43],[-1.0,3.04,s*1.43],[-1.95,3.14,s*1.43]],.065,TM.Y);
    [[2.0,1.62,3.0],[1.0,1.58,3.0],[0,1.6,3.0],[-1.0,1.78,3.0]].forEach(function(r){box(.1,r[2]-r[1],.08,TM.YD,r[0],(r[1]+r[2])/2,s*1.47,bodyIn)});
    sh(ext(shape([[3.36,2.5],[3.36,2.98],[2.32,2.98],[2.32,2.5]]),.01,TM.DK,0),bodyIn).position.z=s*1.455;   /* 무지 데칼 띠 */
    sh(ext(shape([[2.2,2.62],[2.2,2.74],[.8,2.74],[.65,2.62]]),.01,TM.DK,0),bodyIn).position.z=s*1.455;
    box(.5,.22,.16,TM.DK,.55,2.5,s*1.52,bodyIn)});
  sh(ext(beamShape([[-1.62,2.0],[.5,1.55],[2.75,1.55],[3.4,2.25],[3.4,3.3]],[.045,.045,.045,.045,.045]),2.82,TM.Y,0),bodyIn);
  box(.45,.06,2.9,TM.Y,3.15,3.56,0,bodyIn);
  [-.55,.55].forEach(function(z){sh(ext(beamShape([[-1.4,1.92],[.5,1.48],[2.6,1.48]],[.09,.09,.09]),.2,TM.DK,0),bodyIn).position.z=z});
  /* 적재함 흙 (높이 격자) */
  var floorY=function(x){return x<.5?lerp(2.0,1.55,(x+1.62)/2.12)+.05:x<2.75?1.6:lerp(1.6,2.3,(x-2.75)/.65)};
  var heap=new HF({x0:-1.85,z0:-1.33,w:5.1,d:2.66,nx:27,nz:15,base:function(x){return floorY(x)},hide:true,par:bodyIn,cast:true,
    col:function(c,h,x,z,e){c.setHex(0x9b7a55);c.offsetHSL(0,0,(Math.sin(x*7.1+z*5.3)*.025)-e*.03)}});
  heap.cap=new Float32Array(heap.h.length);for(var k=0;k<heap.cap.length;k++){var hx=heap.x0+(k%heap.nx)*heap.dx;heap.cap[k]=(hx<2.25?3.02:lerp(3.02,3.5,(hx-2.25)/1.0))+.55}
  /* 호이스트 실린더 */
  var cyl=[-1,1].map(function(s){var c=adtCyl(R,TM.DK2,TM.CH);c.s=s;return c});
  var api={id:id,root:root,F:F,R:R,body:body,heap:heap,wheels:wF.concat(wR),beacon:bcn,tip:0,
    setTip:function(a){body.rotation.z=a;api.tip=a;body.updateMatrix();
      cyl.forEach(function(c){var A=new V3(2.95,1.15,c.s*1.33),B=new V3(1.8,.65,c.s*1.52).applyMatrix4(body.matrix);setCyl(c,A,B)})},
    bedWorld:function(x,o){R.updateMatrixWorld(true);return (o||new V3()).set(x,3.0,0).applyMatrix4(R.matrixWorld)}};
  api.setTip(0);
  root.traverse(function(o){o.userData.truck=api});
  return api}
