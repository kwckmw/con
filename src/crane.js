/* ===================== 타워크레인 + PC(프리캐스트) 골조 ===================== */
var CR={x:-22,z:10,H:30,J:40};
var CRY=mat(0xF2C230,{r:.55,m:.15}),CRD=mat(0x3b3e42,{r:.6,m:.3}),CONC=mat(0xbcb7ae,{r:.9}),CONC2=mat(0xa49f96,{r:.9});
var CRANE=(function(){
  var g=new T.Group();g.position.set(CR.x,0,CR.z);scene.add(g);
  box(6,1.0,6,CONC,0,.2,0,g);[[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]].forEach(function(p){box(.6,.4,.6,CRD,p[0],.85,p[1],g)});
  var L=new Lattice(CRY,6),a=.8,y0=.7,i,y;
  [[-a,-a],[a,-a],[a,a],[-a,a]].forEach(function(p){L.add([p[0],y0,p[1]],[p[0],CR.H,p[1]],.07)});
  for(i=0,y=y0;y<CR.H-.1;i++,y+=2){var y1=Math.min(CR.H,y+2),f=[[-a,-a],[a,-a],[a,a],[-a,a]];
    for(var k=0;k<4;k++){var p=f[k],q=f[(k+1)%4];L.add([p[0],y,p[1]],[q[0],y,q[1]],.04);if((i+k)%2)L.add([p[0],y,p[1]],[q[0],y1,q[1]],.035);else L.add([q[0],y,q[1]],[p[0],y1,p[1]],.035)}}
  L.build(g);
  /* 승강 사다리 · 쉼터 */
  for(y=y0+1;y<CR.H;y+=6)box(1.4,.06,1.4,CRD,0,y,0,g);
  sh(cy(1.3,.6,CRD,0,CR.H+.2,0,28),g);
  var top=new T.Group();top.position.y=CR.H+.5;g.add(top);
  box(2.6,.25,2.6,CRD,0,0,0,top);
  var J=new Lattice(CRY,6),zj=.65,yt=1.7;
  J.add([1,0,-zj],[CR.J,0,-zj],.06).add([1,0,zj],[CR.J,0,zj],.06).add([1,yt,0],[CR.J-1,yt,0],.06);
  for(var x=1;x<CR.J-1;x+=2){J.add([x,0,-zj],[x,0,zj],.03);J.add([x,0,-zj],[x+1,yt,0],.03).add([x+2,0,-zj],[x+1,yt,0],.03).add([x,0,zj],[x+1,yt,0],.03).add([x+2,0,zj],[x+1,yt,0],.03);J.add([x,0,-zj],[x+2,0,zj],.025)}
  /* 캣헤드 · 펜던트 */
  [[-a,-a],[a,-a],[a,a],[-a,a]].forEach(function(p){J.add([p[0],0,p[1]],[0,7,0],.07)});
  J.add([0,7,0],[16,yt,0],.03).add([0,7,0],[30,yt,0],.03).add([0,7,0],[-11,.6,-.7],.03).add([0,7,0],[-11,.6,.7],.03);
  /* 카운터 지브 */
  J.add([-1,0,-.75],[-12.5,0,-.75],.07).add([-1,0,.75],[-12.5,0,.75],.07);for(x=-1;x>-12.5;x-=1.5){J.add([x,0,-.75],[x,0,.75],.035);J.add([x,0,-.75],[x-1.5,0,.75],.03)}
  J.build(top);
  box(11.5,.05,1.4,mat(0x8f949c,{m:.4,r:.5}),-6.7,.12,0,top);
  for(i=0;i<4;i++)box(.55,2.4,2.0,CONC2,-9.9-i*.6,-.6,0,top);
  rbx(2.4,1.6,1.6,.1,mat(0xe6e3dd),-5.5,.95,0,top);
  rbx(1.8,1.9,1.5,.12,CRY,.9,-.4,1.85,top);box(1.5,1.1,.05,M(0x34444f,{r:.1,op:.55}),.95,-.15,2.61,top);
  var trolley=new T.Group();top.add(trolley);box(1.3,.45,1.5,CRD,0,-.15,0,trolley);[-.45,.45].forEach(function(x2){sh(cz(.2,.12,CRD,x2,-.45,0,16),trolley)});
  var hook=new T.Group();top.add(hook);
  rbx(.75,.95,.5,.08,CRY,0,0,0,hook);[-.2,.2].forEach(function(yy){box(.77,.12,.52,CRD,0,yy,0,hook)});
  var hk=sh(new T.Mesh(new T.TorusGeometry(.18,.06,8,16,Math.PI*1.4),CRD),hook);hk.position.set(0,-.75,0);hk.rotation.z=-.4;sh(cy(.06,.3,CRD,0,-.55,0),hook);
  var ropes=[-.12,.12].map(function(z){var r=new T.Mesh(new T.CylinderGeometry(.018,.018,1,6),CRD);top.add(r);r.position.z=z;return r});
  return {g:g,top:top,trolley:trolley,hook:hook,ropes:ropes,th:Math.PI*.5,r:14,h:12,name:'타워크레인 TC-01',id:'TC-01',phase:'대기',load:null,lifts:0}})();
function craneHookWorld(o){var c=CRANE;return o.set(CR.x+Math.cos(c.th)*c.r,c.h,CR.z-Math.sin(c.th)*c.r)}
function craneApply(){var c=CRANE,yTop=CR.H+.5,drop=yTop-c.h;c.top.rotation.y=c.th;c.trolley.position.set(c.r,0,0);c.hook.position.set(c.r,-drop,0);
  c.ropes.forEach(function(r){r.scale.y=Math.max(.1,drop-.6);r.position.set(c.r,-(drop-.6)/2-.3,r.position.z)})}
/* ---------- 건물: 기둥 5×4 · 슬래브 2×3, 층고 3.6 m, 6층 ---------- */
var BLD={xs:[-24,-20,-16,-12,-8],zs:[16,20,24,28],FL:6,FH:3.6,y0:.6,els:[],next:0,floorsDone:0};
box(17,.6,13,CONC2,-16,.3,22);
(function(){var colG=new T.BoxGeometry(.45,BLD.FH-.25,.45),slabG=new T.BoxGeometry(7.98,.25,3.98),rail=mat(0xF5D20F,{r:.6}),rail2=mat(0xe0573a,{r:.6});
  for(var f=0;f<BLD.FL;f++){var base=BLD.y0+f*BLD.FH;
    BLD.zs.forEach(function(z){BLD.xs.forEach(function(x){var m=sh(new T.Mesh(colG,CONC),scene);m.position.set(x,base+(BLD.FH-.25)/2,z);m.visible=false;BLD.els.push({kind:'col',mesh:m,f:f,x:x,z:z,y:base,len:BLD.FH-.25})})});
    [-20,-12].forEach(function(x){[18,22,26].forEach(function(z){var m=sh(new T.Mesh(slabG,CONC),scene);m.position.set(x,base+BLD.FH-.125,z);m.visible=false;BLD.els.push({kind:'slab',mesh:m,f:f,x:x,z:z,y:base+BLD.FH-.25,len:.25})})});
    /* 작업층 안전난간 */
    var gr=new T.Group();gr.visible=false;scene.add(gr);var yy=base+BLD.FH;
    [[-24.1,15.9,-7.9,15.9],[-7.9,15.9,-7.9,28.1],[-7.9,28.1,-24.1,28.1],[-24.1,28.1,-24.1,15.9]].forEach(function(s){var L=Math.hypot(s[2]-s[0],s[3]-s[1]),n=Math.round(L/2);
      for(var i=0;i<=n;i++){var t=i/n;box(.06,1.1,.06,rail,lerp(s[0],s[2],t),yy+.55,lerp(s[1],s[3],t),gr)}
      [.5,1.05].forEach(function(h,j){var b=box(L,.05,.05,j?rail:rail2,(s[0]+s[2])/2,yy+h,(s[1]+s[3])/2,gr);b.rotation.y=-Math.atan2(s[3]-s[1],s[2]-s[0])})});
    BLD['rail'+f]=gr;
    /* 계단 비계 (서측) */
    var sc=new T.Group();sc.visible=false;scene.add(sc);var SL=new Lattice(mat(0x9aa0ad,{m:.4,r:.4}),5);
    [[-26.6,19],[-24.6,19],[-26.6,22.2],[-24.6,22.2]].forEach(function(p){SL.add([p[0],base,p[1]],[p[0],base+BLD.FH,p[1]],.04)});
    [0,1.8,3.6].forEach(function(h){SL.add([-26.6,base+h,19],[-24.6,base+h,19],.03).add([-26.6,base+h,22.2],[-24.6,base+h,22.2],.03).add([-26.6,base+h,19],[-26.6,base+h,22.2],.03)});
    SL.add([-26.6,base,19],[-26.6,base+3.6,22.2],.03);SL.build(sc);var st=box(1.9,.06,1.0,mat(0x7d8496),-25.6,base+1.8,20.6,sc);st.rotation.x=.55;BLD['sc'+f]=sc}
})();
/* 야적장: 기둥 거치대, 슬래브 적치 */
var YARD={col:[],slab:[]};
(function(){var colG=new T.BoxGeometry(.45,BLD.FH-.25,.45),slabG=new T.BoxGeometry(7.98,.25,3.98),tim=mat(0x9a7d61);
  box(7.6,.12,1.4,mat(0x7d8496,{m:.3}),-36,.06,7.6);[-39.6,-32.4].forEach(function(x){box(.12,2.6,1.4,mat(0x7d8496,{m:.3}),x,1.3,7.6)});box(7.4,.1,.1,mat(0x7d8496),-36,2.6,7.0);box(7.4,.1,.1,mat(0x7d8496),-36,2.6,8.2);
  for(var i=0;i<10;i++){var m=sh(new T.Mesh(colG,CONC),scene);m.position.set(-39.1+i*.68,(BLD.FH-.25)/2+.12,7.6);YARD.col.push(m)}
  for(var j=0;j<6;j++){[-3,0,3].forEach(function(x){box(.2,.12,4.2,tim,-36+x,.06+j*.37,16)});var s=sh(new T.Mesh(slabG,CONC),scene);s.position.set(-36,.245+j*.37,16);YARD.slab.push(s)}})();
function yardTake(kind){var a=YARD[kind];for(var i=a.length-1;i>=0;i--)if(a[i].visible){return a[i]}
  a.forEach(function(m){m.visible=true});return a[a.length-1]}
/* ---------- 양중 상태기계 ---------- */
var CRS={ph:-1,t:0,dur:1,from:null,to:null,el:null,src:null,carry:null};
var slingGeo=new T.BufferGeometry();slingGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(24),3));
var slings=new T.LineSegments(slingGeo,new T.LineBasicMaterial({color:0x2a2a2a}));slings.frustumCulled=false;slings.visible=false;scene.add(slings);
var carryCol=sh(new T.Mesh(new T.BoxGeometry(.45,BLD.FH-.25,.45),CONC),scene),carrySlab=sh(new T.Mesh(new T.BoxGeometry(7.98,.25,3.98),CONC),scene);carryCol.visible=carrySlab.visible=false;
function crTarget(x,z,h){var th=Math.atan2(-(z-CR.z),x-CR.x),r=clamp(Math.hypot(x-CR.x,z-CR.z),4,CR.J-1);return {th:th,r:r,h:h}}
function crMove(to,vh){var c=CRANE,dth=Math.abs(angDiff(c.th,to.th));to.th=c.th+angDiff(c.th,to.th);
  CRS.from={th:c.th,r:c.r,h:c.h};CRS.to=to;CRS.t=0;CRS.dur=Math.max(dth/.075,Math.abs(to.r-c.r)/.9,Math.abs(to.h-c.h)/(vh||.9))+2.5}
function bldTop(){var e=BLD.els[BLD.next];return BLD.y0+((e?e.f:BLD.FL-1)+1)*BLD.FH}
function slingLen(k){return k==='col'?1.3:3.2}
function stepCrane(dt){var c=CRANE;
  if(CRS.ph===-1){if(BLD.next>=BLD.els.length){c.phase='골조 완료 · 대기';return}
    CRS.el=BLD.els[BLD.next];CRS.src=yardTake(CRS.el.kind);CRS.ph=0;crMove({th:c.th,r:c.r,h:bldTop()+6})}
  var e=CRS.el,safe=bldTop()+e.len+slingLen(e.kind)+4;
  if(CRS.to){CRS.t+=dt;var u=sm(CRS.t/CRS.dur),f=CRS.from,to=CRS.to;c.th=lerp(f.th,to.th,u);c.r=lerp(f.r,to.r,u);c.h=lerp(f.h,to.h,CRS.ph===6?Math.pow(u,.8):u);
    if(CRS.t<CRS.dur)return;CRS.to=null}
  else{CRS.t+=dt}
  switch(CRS.ph){
    case 0:CRS.ph=1;var s=CRS.src.position;crMove(crTarget(s.x,s.z,safe));c.phase='빈 훅 이동';break;
    case 1:CRS.ph=2;s=CRS.src.position;var topY=s.y+(e.kind==='col'?(BLD.FH-.25)/2:.125);crMove({th:c.th,r:c.r,h:topY+slingLen(e.kind)+.75});c.phase='훅 하강';break;
    case 2:CRS.ph=3;CRS.t=0;c.phase='줄걸이';break;
    case 3:if(CRS.t<9)return;CRS.src.visible=false;CRS.carry=e.kind==='col'?carryCol:carrySlab;CRS.carry.visible=true;slings.visible=true;CRS.ph=4;crMove({th:c.th,r:c.r,h:safe},.6);c.phase='인양';c.load=e.kind==='col'?'PC 기둥 1.7 t':'PC 슬래브 19.6 t';break;
    case 4:CRS.ph=5;crMove(crTarget(e.x,e.z,safe),.6);c.phase='선회 · 횡행';break;
    case 5:CRS.ph=6;crMove({th:c.th,r:c.r,h:e.y+e.len+slingLen(e.kind)+.75},.35);c.phase='거치 하강';break;
    case 6:CRS.ph=7;CRS.t=0;c.phase='고정 · 줄 해체';break;
    case 7:if(CRS.t<12)return;e.mesh.visible=true;CRS.carry.visible=false;CRS.carry=null;slings.visible=false;c.load=null;c.lifts++;BLD.next++;
      var nf=BLD.next<BLD.els.length?BLD.els[BLD.next].f:BLD.FL;
      for(var f2=0;f2<BLD.FL;f2++){BLD['rail'+f2].visible=(f2===nf-1)||(f2===nf&&BLD.els[BLD.next]&&BLD.els[BLD.next].kind==='slab'&&false);BLD['sc'+f2].visible=f2<=Math.min(nf,BLD.FL-1)&&f2<=nf}
      BLD.floorsDone=nf;CRS.ph=-1;break}}
var _hw=new V3();
function craneRender(t){craneApply();if(!CRS.carry)return;craneHookWorld(_hw);var e=CRS.el,L=slingLen(e.kind),sw=CRS.to&&(CRS.ph===5||CRS.ph===4)?Math.sin(t*1.3)*.18:0;
  var cy0=_hw.y-.75-L,P=slingGeo.attributes.position.array,o=CRS.carry;
  if(e.kind==='col'){o.position.set(_hw.x+sw,cy0-(BLD.FH-.25)/2,_hw.z);for(var i=0;i<4;i++){P.set([_hw.x,_hw.y-.75,_hw.z,o.position.x+(i%2?.2:-.2),cy0,o.position.z+(i>1?.2:-.2)],i*6)}}
  else{o.position.set(_hw.x+sw,cy0-.125,_hw.z);[[-3,-1.6],[3,-1.6],[3,1.6],[-3,1.6]].forEach(function(q,i){P.set([_hw.x,_hw.y-.75,_hw.z,o.position.x+q[0],cy0,o.position.z+q[1]],i*6)})}
  slingGeo.attributes.position.needsUpdate=true}
/* 슬래브 위 작업자 2명: 작업층을 따라 올라간다 */
var topCrew=[worker(-20,18,0,null,0),worker(-13,25,0,null,2.4)];
function crewUpdate(){var f=Math.max(0,Math.min(BLD.FL,BLD.floorsDone)),y=BLD.y0+f*BLD.FH;topCrew.forEach(function(w,i){w.position.y=y;if(CRS.el&&CRS.ph>=5){w.position.x=lerp(w.position.x,CRS.el.x+(i?1.8:-1.8),.02);w.position.z=lerp(w.position.z,CRS.el.z+(i?1.5:-1.5),.02)}})}
