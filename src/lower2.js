/* ===== 하부 주행부 · HX220A: 텀블러 중심 3,650 · 트랙 중심 2,390 · 슈 600(3바) · 롤러 상2/하8 ===== */
/* 트랙 체인: 링크 49개, 피치 190 mm(모델 가정). 링크는 피치원 위에서 직선 마디로 꺾이며 감긴다. */
var HX=1.825,PR=.3175,CY=.4485,TZ=1.195,RAIL=.17,NL=49,BY=CY,BR=PR;
var LKH=.17,SHO=.095,GRO=.118; /* 링크 높이, 슈 판 위치, 그라우저 위치 (피치선에서 바깥쪽) */
var IDL=[],SPH=0;
var MLK=M(0x5C5E62,{r:.55,m:.35}),MSH=M(0x3F4144,{r:.7,m:.25}),MBU=M(0x9A9DA1,{r:.4,m:.5}),MRL=M(0x55575B,{r:.55,m:.3}),MRH=M(0x3A3C3F,{r:.6,m:.3});
(function(){
  var p=def('idler','아이들러','lower',{off:[1.2,0,0],lat:1.2,anchor:[HX,CY+.2,-TZ-.3]});
  [-1,1].forEach(function(s){var z=s*TZ,g=new T.Group();g.position.set(HX,CY,z);IDL.push(g);p.sg[s].add(g);
    /* 링크 레일이 구르는 두 개의 트레드와 레일 사이로 들어가는 가운데 플랜지 */
    [-1,1].forEach(function(q){putG(p,g,cz(PR-LKH/2-.004,.07,MRL,0,0,q*RAIL))});
    putG(p,g,cz(.272,.2,MRL,0,0,0,40));
    for(var k=0;k<6;k++){var a=k/6*Math.PI*2;putG(p,g,cz(.045,.205,MRH,Math.cos(a)*.17,Math.sin(a)*.17,0,14),true)}
    putG(p,g,cz(.075,.62,MRH,0,0,0,20));
    /* 축을 받치는 요크 블록: 트랙 프레임 앞끝에 붙는다 */
    [-1,1].forEach(function(q){put(p,rb(.42,.16,.07,.02,MRH,HX-.2,CY,z+q*(RAIL+.09)),s)})})
})();
var TRK=[];
(function(){
  var p=def('track','트랙 체인','lower',{lat:2.6,anchor:[.2,CY-PR,-TZ-.32]});
  function lkGeo(){var g=rbox(.215,LKH,.038,.05,MLK).geometry;return g}
  var gL=lkGeo(),gS=new T.BoxGeometry(.186,.02,.6),gG=new T.BoxGeometry(.016,.028,.6),gB=new T.CylinderGeometry(.032,.032,2*RAIL-.02,14),gP=new T.CylinderGeometry(.021,.021,2*RAIL+.09,10);
  gS.translate(0,-SHO,0);gB.rotateX(Math.PI/2);gP.rotateX(Math.PI/2);
  var gg=[-.062,0,.062].map(function(x){var g=gG.clone();g.translate(x,-GRO,0);return g});
  [-1,1].forEach(function(s){
    var grp=new T.Group();grp.position.z=s*TZ;p.sg[s].add(grp);
    function IM(geo,mat,n,dz){var m=new T.InstancedMesh(geo,mat,n);m.frustumCulled=false;m.position.z=dz||0;m.castShadow=true;m.receiveShadow=true;m.userData.part='track';grp.add(m);p.meshes.push(m);if(p.mats.indexOf(mat)<0)p.mats.push(mat);return m}
    TRK.push({link:[IM(gL,MLK,NL,RAIL),IM(gL,MLK,NL,-RAIL),IM(gS,MSH,NL),IM(gg[0],MSH,NL),IM(gg[1],MSH,NL),IM(gg[2],MSH,NL)],joint:[IM(gB,MBU,NL),IM(gP,MBU,NL)]})})
})();
(function(){
  var p=def('uroll','상부롤러','lower',{off:[0,.9,0],lat:1.2,anchor:[.6,.72,-TZ-.3]});
  /* 캐리어 롤러 한쪽 2개: 위쪽 체인의 두 링크 레일 아래를 받친다. 축은 트랙 프레임 위 받침대에 고정 */
  [-1,1].forEach(function(s){[-.62,.62].forEach(function(x){var z=s*TZ,y=PR+CY-LKH/2-.06;
    [-1,1].forEach(function(q){put(p,cz(.06,.06,MRL,x,y,z+q*RAIL,22),s);put(p,cz(.078,.02,MRL,x,y,z+q*(RAIL+.04),22),s)});
    put(p,cz(.028,2*RAIL+.12,MRH,x,y,z,12),s);
    put(p,rb(.12,y-.56+.02,.1,.015,MRH,x,(y+.56)/2,z),s)})})
})();
(function(){
  var p=def('lroll','하부롤러','lower',{off:[0,-.5,0],lat:1.2,anchor:[.2,.31,-TZ-.32]});
  /* 트랙 롤러 한쪽 8개: 아래쪽 체인의 링크 레일 위를 구르며 차체 무게를 전한다. 싱글·더블 플랜지를 번갈아 배치 */
  var y=CY-PR+LKH/2+.095;
  [-1,1].forEach(function(s){for(var k=0;k<8;k++){var x=-1.4+k*.4,z=s*TZ;
    [-1,1].forEach(function(q){
      put(p,cz(.095,.05,MRL,x,y,z+q*RAIL,22),s);
      put(p,cz(.125,.025,MRL,x,y,z+q*(RAIL+.04),22),s);
      if(k%2)put(p,cz(.125,.025,MRL,x,y,z+q*(RAIL-.04),22),s);
      put(p,rb(.13,.42-y+.02,.05,.015,MRH,x,(y+.42)/2,z+q*(RAIL+.1)),s)});
    put(p,cz(.065,2*RAIL-.06,MRH,x,y,z,16),s)}})
})();
(function(){
  var p=def('sprocket','스프로켓','lower',{off:[-1.2,0,0],lat:1.2,anchor:[-HX,CY+.2,-TZ-.3]});
  var mt=M(0x6A6D71,{r:.5,m:.4});
  /* 이 21개가 반 피치 간격: 부시는 한 칸씩 걸러 이 사이 홈에 맞물린다 */
  var s_r=4*HX+Math.PI*PR,LP=(4*HX+2*Math.PI*PR)/NL,i0=Math.ceil(s_r/LP);SPH=Math.PI/2+(i0*LP-s_r)/PR;
  var DA=2*Math.PI/21;
  [-1,1].forEach(function(s){var z=s*TZ,tg=new T.Group();tg.position.set(-HX,CY,z);SPR.push(tg);p.sg[s].add(tg);
    putG(p,tg,cz(.262,.1,MRL,0,0,0,42));
    for(var k=0;k<21;k++){var a=SPH+(k+.5)*DA,t=bx(.11,.03,.1,mt,Math.cos(a)*.3,Math.sin(a)*.3,0);t.rotation.z=a;putG(p,tg,t)}
    putG(p,tg,cz(.17,.32,MRH,0,0,-s*.08,30));
    for(k=0;k<10;k++){var b=k/10*Math.PI*2;putG(p,tg,cz(.02,.34,MBU,Math.cos(b)*.13,Math.sin(b)*.13,-s*.08,8),true)}})
})();
(function(){
  var p=def('tmotor','주행모터','lower',{off:[-1.4,0,0],lat:-.35,anchor:[-HX,CY+.3,-TZ+.45]});
  var md=M(0x47494C),mc=M(0x5A5D61),mb=M(0x9A9DA1);
  /* 트랙 안쪽(차체 쪽), 스프로켓 뒤에 붙는 모터 + 최종 감속기 */
  [-1,1].forEach(function(s){
    put(p,cz(.29,.2,md,-HX,CY,s*(TZ-.3)),s);
    put(p,cz(.22,.16,mc,-HX,CY,s*(TZ-.48)),s);
    put(p,cz(.09,.06,mb,-HX,CY,s*(TZ-.58),12),s);
    for(var k=0;k<6;k++){var a=k/6*Math.PI*2;put(p,cz(.025,.05,mb,-HX+Math.cos(a)*.24,CY+Math.sin(a)*.24,s*(TZ-.39),8),s,true)}})
})();
(function(){
  var p=def('lower','하부 프레임','lower',{anchor:[.4,.72,-.9]});
  var m=M(0x47494C),md=M(0x3A3C3F);
  /* 트랙 프레임: 하부롤러 위, 상부롤러 아래의 상자 단면. 앞뒤 끝은 비스듬히 */
  [-1,1].forEach(function(s){
    put(p,rb(3.1,.14,.3,.04,m,0,.49,s*TZ));
    put(p,rb(3.1,.025,.42,.01,md,0,.57,s*TZ));
    put(p,rb(3.0,.025,.62,.01,md,0,.4325,s*TZ));
    [-1,1].forEach(function(q){var w=bx(.36,.12,.3,m,q*1.62,.47,s*TZ);w.rotation.z=q*.35;put(p,w)})});
  /* 중앙 X 프레임(카 바디): 최저지상고 475 */
  put(p,rb(2.2,.38,2.05,.12,m,0,.665,0));
  [-1,1].forEach(function(s){put(p,rb(.55,.3,2.3,.08,m,s*.95,.6,0))});
})();
(function(){
  var p=def('joint','센터조인트 · 선회 베어링','lower',{off:[0,.8,0],anchor:[0,.95,-.9]});
  var mr=M(0x5C5E62,{r:.5,m:.4}),mt=M(0x8C8F93);
  put(p,cy(.95,.14,mr,0,.925,0,72));
  var ring=new T.Mesh(new T.TorusGeometry(.95,.035,10,72),mt);ring.rotation.x=Math.PI/2;ring.position.set(0,.925,0);put(p,ring,null,true);
  put(p,cy(.24,.3,mt,0,.92,0,28));
})();
