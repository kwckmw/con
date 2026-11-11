/* ===================== site2: 동측 확장 구역 · 토공 장비 자동 작업 =====================
   성토장(휠로더가 적치장 흙을 실어다 붓고 도저가 층마다 펴 고른다) · 노반 구간(그레이더 정지) ·
   관로 구간(휠 굴삭기 터파기, 스키드로더 모래 기초 부설). 장비 대수는 화면 위 장비 막대에서 바꾼다. */
var PADR=Z2.PAD,BORR=Z2.BOR,BEDR=Z2.BED,TRNR=Z2.TRN,TRZ=28;
var PADF=new HF({x0:PADR.x0,z0:PADR.z0,w:PADR.x1-PADR.x0,d:PADR.z1-PADR.z0,nx:69,nz:73,base:function(){return 0},hide:true,cast:true,col:SOILC});
function borInit(x,z){var e=Math.min(x-BORR.x0,BORR.x1-x,z-BORR.z0,BORR.z1-z);return clamp(e*.75-.2,0,3.4)+(e>1?noise2(x*.8,z*.8)*.18:0)}
var BORF=new HF({x0:BORR.x0,z0:BORR.z0,w:BORR.x1-BORR.x0,d:BORR.z1-BORR.z0,nx:45,nz:65,base:function(){return 0},hide:true,cast:true,col:SOILC,init:borInit});
var BOR0=Float32Array.from(BORF.h);
/* 노반: 거친 면(±12 cm)을 그레이더가 0 높이로 고른다. 고른 자리는 색이 밝아진다 */
var bedSeed=0;
function bedRough(x,z){var e=Math.min(x-BEDR.x0,BEDR.x1-x,z-BEDR.z0,BEDR.z1-z);return clamp(e/1.5,0,1)*(noise2(x*.9+bedSeed,z*1.1)*.09+Math.sin(x*.55+bedSeed*3)*.035+Math.max(0,Math.sin(z*2.4+x*.13))*.05)}
var BEDF=new HF({x0:BEDR.x0,z0:BEDR.z0,w:BEDR.x1-BEDR.x0,d:BEDR.z1-BEDR.z0,nx:173,nz:25,base:function(){return -1},init:bedRough,
  col:function(c,h,x,z){var r=Math.min(1,Math.abs(h)/.05);c.setHex(0xb6a88f);_cb.setHex(0x86735a);c.lerp(_cb,r);c.offsetHSL(0,0,noise2(x*1.7,z*1.7)*.02);return c}});
var TRNF=new HF({x0:TRNR.x0,z0:TRNR.z0,w:TRNR.x1-TRNR.x0,d:TRNR.z1-TRNR.z0,nx:216,nz:26,base:function(){return -4},init:function(){return 0},
  col:function(c,h,x,z){if(h>.04){c.setHex(0x9a7b58);c.offsetHSL(0,0,noise2(x*1.3,z*1.3)*.03);return c}return strata(c,h,noise2(x*.9,z*.9)*.03)}});
var HF2=[PADF,BORF,BEDF,TRNF];
/* ---------- 구역 시설물 ---------- */
(function(){
  box(32,.04,40,ROADM,112,.02,-18);box(104,.04,4,ROADM,108,.02,3);box(104,.04,3,ROADM,108,.02,20);box(100,.04,7,ROADM,110,.02,35.8);box(6,.04,78,ROADM,57,.02,0);
  /* 성토장 경계 말뚝과 규준틀 */
  var st=[],x,z;for(x=PADR.x0;x<=PADR.x1;x+=8.5){st.push([x,PADR.z0-.6]);st.push([x,PADR.z1+.6])}for(z=PADR.z0+6;z<PADR.z1;z+=6)st.push([PADR.x0-.6,z]);
  for(x=BEDR.x0;x<=BEDR.x1;x+=10.75){st.push([x,BEDR.z0-.5]);st.push([x,BEDR.z1+.5])}
  var pm=new T.InstancedMesh(new T.BoxGeometry(.07,1.3,.07),mat(0xf2f2f2),st.length),fm=new T.InstancedMesh(new T.BoxGeometry(.3,.2,.02),mat(0xe0573a),st.length),d=new T.Object3D();
  st.forEach(function(p,i){d.position.set(p[0],.65,p[1]);d.rotation.set(0,i,0);d.updateMatrix();pm.setMatrixAt(i,d.matrix);d.position.y=1.2;d.updateMatrix();fm.setMatrixAt(i,d.matrix)});pm.castShadow=true;scene.add(pm,fm);
  /* 모래 야적 칸 3개 (스키드로더가 퍼 간다) */
  var cb=mat(0xb9bcc2,{r:.8}),sand=mat(0xd9c49a,{r:.97});
  [33.4,35.7,38.0].forEach(function(zz,i){if(i===0)box(7.2,1.3,.4,cb,154,.65,32.25);box(7.2,1.3,.3,cb,154,.65,zz+1.15);
    var s=sh(new T.Mesh(new T.IcosahedronGeometry(1,1),sand),scene);s.position.set(153.4,.25,zz);s.scale.set(3.2,1.0,.8)});box(.4,1.3,7.2,cb,157.8,.65,35.7);
  /* 관 야적 · 안내판 */
  var pp=mat(0x5f9cc4,{r:.6}),k;for(k=0;k<7;k++){var p=sh(new T.Mesh(new T.CylinderGeometry(.32,.32,6,16,1,true),pp),scene);p.material.side=T.DoubleSide;p.rotation.z=Math.PI/2;p.position.set(57.5,.33+(k>3?.56:0),23.5+(k>3?(k-4)*.66+.33:k*.66))}
  [[98,2.2,'성토장'],[110,4.6,'토사 적치장'],[60,5.2,'노반 정지 구간'],[60,21,'관로 굴착 구간']].forEach(function(q){box(.08,2.2,.08,mat(0x7d8496),q[0],1.1,q[1]);box(2.2,.8,.06,mat(0x3d5bd9),q[0],2.3,q[1])});
  worker(100.5,2.6,0,null,2.2);worker(126,-2.5,0,null,-2.4);worker(70,20.2,0,null,1.6);worker(118,20.4,0,null,1.2);worker(146,31.2,0,null,3.0);
})();

/* ---------- 성토장: 6개 띠(폭 6 m) · 층 두께 0.3 m ---------- */
var STRIPS=[],PADLVL=.3,PADDONE=0;for(var si2=0;si2<6;si2++)STRIPS.push({k:si2,zc:PADR.z0+3+si2*6,lock:null});
function tipVol(s){return PADF.above(PADR.x1-6,PADR.x1,s.zc-3,s.zc+3,PADLVL)}
function padFrac(){var n=0,m=0,h=PADF.h;for(var k=0;k<h.length;k+=3){m++;if(h[k]>=PADLVL-.05)n++}return n/m}
function padCheck(){var f=padFrac();if(f>.93){if(PADLVL>=1.15){PADF.h.fill(0);PADF.mark(0,0,PADF.nx-1,PADF.nz-1);PADLVL=.3;PADDONE++;addAlert('pad'+PADDONE,'성토 블록 완료 (4층 1.2 m) → 다음 블록 (시연용으로 성토장을 비움)')}
    else{PADLVL+=.3;addAlert('lift'+PADDONE+PADLVL.toFixed(1),'성토 '+Math.round(PADLVL/.3)+'층 시작 (계획고 '+PADLVL.toFixed(1)+' m)')}}}
/* 적치장: 외부 반입을 가정해 조금씩 다시 채운다 */
function borFeed(dt){var V=BORF.total(),V0=1650;if(V<V0*.55){var k=Math.min(1,dt*.02);for(var i=0;i<BORF.h.length;i++)BORF.h[i]+=(BOR0[i]-BORF.h[i])*k;BORF.mark(0,0,BORF.nx-1,BORF.nz-1)}}
/* 노반: 고른 비율 */
function bedFrac(){var n=0,m=0,h=BEDF.h,nx=BEDF.nx;for(var j=2;j<BEDF.nz-2;j+=2)for(var i=3;i<nx-3;i+=3){m++;if(Math.abs(h[j*nx+i])<.012)n++}return n/m}
var BEDN=0,bedWait=0;
function bedReset(){bedSeed+=7.3;BEDN++;for(var j=0;j<BEDF.nz;j++)for(var i=0;i<BEDF.nx;i++)BEDF.h[j*BEDF.nx+i]=bedRough(BEDF.x0+i*BEDF.dx,BEDF.z0+j*BEDF.dz);BEDF.mark(0,0,BEDF.nx-1,BEDF.nz-1);
  FLEET.forEach(function(A){if(A.kind==='mg'){A.lane=0;A.bedDone=false}});addAlert('bed'+BEDN,'노반 정지 구간 완료 → 다음 구간 (시연용으로 노면을 다시 거칠게 되돌림)')}
/* 관로: 장비마다 26 m 구간 */
var TSEG=[];for(var ts=0;ts<3;ts++)TSEG.push({i:ts,x0:64+ts*28,x1:90+ts*28,bedX:0,xm:0,ex:null,n:0});
function trDepth(x){var h=TRNF.sample(x,TRZ);return h===null?0:h}
function segReset(g){var i0=Math.max(0,Math.floor((g.x0-1.5-TRNF.x0)/TRNF.dx)),i1=Math.min(TRNF.nx-1,Math.ceil((g.x1+1.5-TRNF.x0)/TRNF.dx));for(var j=0;j<TRNF.nz;j++)for(var i=i0;i<=i1;i++)TRNF.h[j*TRNF.nx+i]=0;TRNF.mark(i0,0,i1,TRNF.nz-1);g.bedX=g.x1-1;g.n++}
TSEG.forEach(function(g){g.bedX=g.x1-1});

/* ---------- 장비 공통: 구간 큐 · 경로 주행 ---------- */
var FLEET=[],FNAME={wl:'휠로더',sl:'스키드로더',dz:'도저',mg:'모터 그레이더',wx:'휠 굴삭기'},FMODEL={wl:'HL960A급',sl:'HSL850-7A',dz:'HD100',mg:'HG170-3',wx:'HW155A+'};
function Agent(kind,idx){var A=this;A.kind=kind;A.idx=idx;A.id=kind.toUpperCase()+'-0'+(idx+1);A.name=FNAME[kind]+' '+A.id+' ('+FMODEL[kind]+')';
  A.rig=kind==='wx'?makeWheelEx():makeRig(kind);A.root=A.obj=A.rig.root;A.rad=kind==='wx'?3.6:A.rig.rad;A.wb=A.rig.wb||3;
  A.x=0;A.y=0;A.z=0;A.yaw=0;A.v=0;A.odo=0;A.oL=0;A.oR=0;A.load=0;A.count=0;A.vol=0;A.fuel=0;A.state='대기';A.q=[];A.seg=null;A.blockT=0;A.blockBy=null;A.gone=false;A.dist=0;
  scene.add(A.root);FLEET.push(A)}
Agent.prototype.put=function(x,z,yaw){this.x=x;this.z=z;this.yaw=yaw;this.sync()};
Agent.prototype.sync=function(){this.root.position.set(this.x,this.y,this.z);this.root.rotation.y=this.yaw};
Agent.prototype.fx=function(){return Math.cos(this.yaw)};Agent.prototype.fz=function(){return -Math.sin(this.yaw)};
Agent.prototype.move=function(x,z,yaw,o){o=o||{};this.q.push({t:'move',x:x,z:z,yaw:yaw,rev:!!o.rev,v:o.v||2.6,on:o.on,st:o.st||(o.rev?'후진':'이동'),nb:o.nb});return this};
Agent.prototype.spin=function(yaw,st){this.q.push({t:'spin',yaw:yaw,st:st||'제자리 회전'});return this};
Agent.prototype.pose=function(to,dur,st,on){this.q.push({t:'pose',to:to,dur:dur,st:st||'작업',on:on});return this};
Agent.prototype.wait=function(dur,st,until){this.q.push({t:'wait',dur:dur,st:st||'대기',until:until});return this};
Agent.prototype.call=function(fn){this.q.push({t:'call',fn:fn});return this};
/* 앞쪽 예측 지점에 다른 장비가 있고 가까워지는 중이면 멈춘다. 서로 막으면 번호가 빠른 쪽이 먼저 간다 */
function blockedBy(A,dx,dz){var la=Math.min(A.rad+1.2,6),px=A.x+dx*la,pz=A.z+dz*la;for(var i=0;i<FLEET.length;i++){var o=FLEET[i];if(o===A)continue;var d1=Math.hypot(o.x-A.x,o.z-A.z);if(d1>A.rad+o.rad+la+1)continue;
    var d2=Math.hypot(o.x-px,o.z-pz);if(d2<o.rad*.9+A.rad*.45+.4&&d2<d1){if(o.blockBy===A&&A.id<o.id)continue;return o}}return null}
var _hp={},_ht={};
function herm(s,u,o,t){var u2=u*u,u3=u2*u,a=2*u3-3*u2+1,b=u3-2*u2+u,c=-2*u3+3*u2,d=u3-u2;o.x=a*s.x0+b*s.mx0+c*s.x+d*s.mx1;o.z=a*s.z0+b*s.mz0+c*s.z+d*s.mz1;
  var da=6*u2-6*u,db=3*u2-4*u+1,dc=-6*u2+6*u,dd=3*u2-2*u;t.x=da*s.x0+db*s.mx0+dc*s.x+dd*s.mx1;t.z=da*s.z0+db*s.mz0+dc*s.z+dd*s.mz1}
Agent.prototype.stepSeg=function(dt){var A=this,s=A.seg,R=A.rig,k,i;
  if(s.t==='call'){s.fn(A);return true}
  if(s.t==='wait'){s.e=(s.e||0)+dt;A.state=s.st;A.v=0;return s.until?!!s.until(A):s.e>=s.dur}
  if(s.t==='pose'){if(s.e===undefined){s.e=0;s.from={};for(k in s.to)s.from[k]=R.pose[k]}s.e+=dt;var u=Math.min(1,s.e/s.dur),w=sm(u);for(k in s.to)R.pose[k]=lerp(s.from[k],s.to[k],w);A.state=s.st;A.v=0;if(s.on)s.on(u,A,dt);A.dirty=true;return u>=1}
  if(s.t==='spin'){var dy=angDiff(A.yaw,s.yaw),st=Math.min(Math.abs(dy),(A.kind==='dz'?.55:1.2)*dt)*(dy<0?-1:1);A.yaw+=st;var hw=A.kind==='dz'?1.0:.75;A.oL-=st*hw;A.oR+=st*hw;A.state=s.st;A.v=0;A.roll();A.sync();return Math.abs(dy)<.012}
  /* move: 시작·끝 방향을 접선으로 하는 3차 곡선을 따라간다. 조향각은 곡률에서 나온다 */
  if(!s.init){s.init=true;s.x0=A.x;s.z0=A.z;var sg=s.rev?-1:1,L=Math.hypot(s.x-A.x,s.z-A.z),m=Math.max(1.5,L*1.15);
    s.mx0=Math.cos(A.yaw)*sg*m;s.mz0=-Math.sin(A.yaw)*sg*m;s.mx1=Math.cos(s.yaw)*sg*m;s.mz1=-Math.sin(s.yaw)*sg*m;
    s.tab=[0];var px=A.x,pz=A.z;for(i=1;i<=40;i++){herm(s,i/40,_hp,_ht);s.tab.push(s.tab[i-1]+Math.hypot(_hp.x-px,_hp.z-pz));px=_hp.x;pz=_hp.z}s.L=s.tab[40];s.d=0}
  if(s.L<.06){A.x=s.x;A.z=s.z;A.yaw=s.yaw;A.sync();return true}
  var vt=Math.min(s.v,Math.sqrt(2*1.1*Math.max(0,s.L-s.d)+.04)),dx=Math.cos(A.yaw)*(s.rev?-1:1),dz=-Math.sin(A.yaw)*(s.rev?-1:1),b=s.nb?null:blockedBy(A,dx,dz);
  if(b){A.blockBy=b;A.blockT+=dt;if(A.blockT<(b.blockBy===A?10:45)){A.v=Math.max(0,A.v-3*dt);A.state='양보 대기';if(A.v<=0)return false}}else{A.blockBy=null;A.blockT=0}
  A.v=clamp(vt,A.v-2.2*dt,A.v+1.1*dt);var ds=A.v*dt;s.d=Math.min(s.L,s.d+ds);
  i=0;while(i<39&&s.tab[i+1]<s.d)i++;var uu=(i+(s.d-s.tab[i])/Math.max(1e-6,s.tab[i+1]-s.tab[i]))/40;herm(s,uu,_hp,_ht);
  var y0=A.yaw,yw=Math.atan2(-_ht.z,_ht.x)+(s.rev?Math.PI:0);if(Math.hypot(_ht.x,_ht.z)<1e-4)yw=y0;var dyw=angDiff(y0,yw);
  A.x=_hp.x;A.z=_hp.z;A.yaw=y0+dyw;var sd=s.rev?-ds:ds;A.odo+=sd;A.dist+=ds;var hw2=A.kind==='dz'?1.0:.75;A.oL+=sd-dyw*hw2;A.oR+=sd+dyw*hw2;
  if(R.art!==undefined&&(A.kind==='wl'||A.kind==='mg')){var ta=ds>1e-4?clamp(dyw/ds*A.wb*(s.rev?-.55:.55),-.6,.6):0;if(A.kind==='mg')ta=clamp(ta,-.35,.35);R.art+=(ta-R.art)*Math.min(1,dt*3);A.dirty=true}
  A.state=s.st;if(s.on&&s.on(s.d/s.L,A,ds,dt)===true){A.sync();A.roll();return true}
  A.roll();A.sync();
  if(s.d>=s.L-.005){A.x=s.x;A.z=s.z;A.yaw=s.yaw;A.v=0;A.sync();return true}return false};
Agent.prototype.roll=function(){var A=this,R=A.rig;if(A.kind==='sl')R.setRoll(A.odo,A.oL,A.oR);else R.setRoll(A.odo)};
Agent.prototype.step=function(dt){var A=this;if(A.gone)return;A.fuel+=dt*(A.v>.1||A.seg&&A.seg.t==='pose'?11:3)/3600;
  var guard=0;while(guard++<6){if(!A.seg){if(!A.q.length){A.plan();if(!A.q.length){A.state='대기';break}}A.seg=A.q.shift()}
    if(A.stepSeg(dt)){var imm=A.seg.t==='call';A.seg=null;if(imm)continue}break}
  if(A.dirty&&A.kind!=='wx'){A.rig.update();A.rig.setLoad(A.loadF||0);A.dirty=false}};
var _w=new V3(),_w2=new V3();
function dustAt(v,n){if(Math.random()<.5)emit(v,n||3,1.0,1.1,1.0,0)}

/* ---------- 휠로더: 적치장에서 퍼서 성토장 띠 끝에 붓는다 (후진 → 방향 전환 → 전진의 Y자 주행) ---------- */
var WLZ=[-31,-16,-23.5,-8.5],WLCAP=3.0,WLSW=6;   /* 1·2호기는 떨어진 줄을 써서 동시에 돌 수 있다 */
function faceX(z){for(var x=BORR.x0;x<BORR.x1-1;x+=.5){var h=BORF.sample(x,z);if(h!==null&&h>.7)return x}return BORR.x1-3}
/* Y자 주행이 쓸고 가는 z 범위(선회 띠). 다른 휠로더의 범위와 겹치면 출발하지 않는다 */
function wlTurn(zj,zs){var W=WLSW,sg=zj>=zs?1:-1;if(zj+W*sg>-2)sg=-1;if(zj+W*sg<-34.5)sg=1;var s2=zs>=zj?1:-1;if(zs+W*s2>-2)s2=-1;if(zs+W*s2<-34.5)s2=1;
  var a=[zj,zs,zj+W*sg,zs+W*s2];return {sg:sg,s2:s2,lo:Math.min.apply(0,a)-3.1,hi:Math.max.apply(0,a)+3.1}}
function pickStrip(A){var zj=WLZ[A.idx],c=[];STRIPS.forEach(function(s){if(s.lock)return;var v=tipVol(s);if(v>9)return;c.push({s:s,v:v+Math.abs(s.zc-zj)*.25})});c.sort(function(a,b){return a.v-b.v});
  for(var i=0;i<c.length;i++){var t=wlTurn(zj,c[i].s.zc),ok=true;FLEET.forEach(function(o){if(o!==A&&o.band&&o.band.lo<t.hi&&t.lo<o.band.hi)ok=false});if(ok){A.band=t;return c[i].s}}return null}
function wlPlan(A){var zj=WLZ[A.idx],C0=WK.C0,fx=faceX(zj);
  A.pose({b:.02,k:C0},1.0,'접근').move(fx-7.8,zj,0,{v:4.2,st:'적치장으로'});
  A.move(fx-4.6,zj,0,{v:1.0,st:'퍼 담기',nb:true,on:function(u,A,ds){A.band=null;A.rig.update();A.root.updateMatrixWorld(true);A.rig.tipWorld(_w);var V=BORF.carve(_w.x,_w.z,.06,1,0,1.5,.8,WLCAP-A.load);
    if(V>0){A.load+=V;A.loadF=A.load/WLCAP;A.dirty=true;var q=BORF.ij(_w.x,_w.z);BORF.relax(q[0]-8,q[1]-8,q[0]+8,q[1]+8,.34,3);_w.y=.5;dustAt(_w,4)}}});
  A.pose({k:2.07},1.0,'버킷 젖히기').pose({b:.3,k:2.07},1.4,'들어 올리기');
  A.wait(0,'성토장 · 진로 대기',function(A){var s=pickStrip(A);if(!s)return false;s.lock=A;A.strip=s;return true});
  A.call(function(A){var s=A.strip,zs=s.zc,sg=A.band.sg,s2=A.band.s2;
    var dump=function(u,A){if(u>.5&&A.load>0){A.root.updateMatrixWorld(true);A.rig.mouthWorld(_w);var x=Math.min(_w.x,PADR.x1-1.0),V=A.load*1.12;PADF.deposit(x,zs+(Math.random()-.5)*1.6,V,1.1);var q=PADF.ij(x,zs);PADF.relax(q[0]-9,q[1]-9,q[0]+9,q[1]+9,.3,5);
        A.vol+=A.load;A.load=0;A.loadF=0;A.count++;A.dirty=true;_w.x=x;_w.y=1.2;emit(_w,16,1.6,.6,1.3,0)}};
    A.q.unshift(
      {t:'move',x:111.5,z:zj+WLSW*sg,yaw:sg*Math.PI/2,rev:true,v:2.8,st:'후진 선회'},
      {t:'pose',to:{b:.55},dur:.1,st:'운반'},
      {t:'move',x:PADR.x1+3.9,z:zs,yaw:Math.PI,v:4.2,st:'성토장으로'},
      {t:'pose',to:{b:.62,k:1.38},dur:1.7,st:'덤프',on:dump},
      {t:'pose',to:{b:.3,k:C0},dur:1.2,st:'버킷 복귀'},
      {t:'move',x:106.5,z:zs+WLSW*s2,yaw:s2*Math.PI/2,rev:true,v:2.8,st:'후진 선회'},
      {t:'call',fn:function(A){if(A.strip&&A.strip.lock===A)A.strip.lock=null;A.strip=null}})})}

/* ---------- 도저: 띠 끝의 흙더미를 계획고에 맞춰 서쪽으로 펴 나간다 ---------- */
var DZCAP=3.4;
function dzStrips(A){var ds=FLEET.filter(function(o){return o.kind==='dz'}).sort(function(a,b){return a.idx-b.idx}),me=ds.indexOf(A);return STRIPS.filter(function(s){return Math.floor(s.k*ds.length/6)===me})}   /* 이웃한 띠끼리 묶어 맡아서 도저끼리 길이 엇갈리지 않는다 */
function padY(A){var a=PADF.sample(A.x+A.fx()*1.2,A.z+A.fz()*1.2),b=PADF.sample(A.x-A.fx()*1.2,A.z-A.fz()*1.2);return Math.max(0,((a||0)+(b||0))/2)}
function dzPlan(A){
  if(!A.strip){var c=dzStrips(A).filter(function(s){return !s.lock&&tipVol(s)>1.4}).sort(function(a,b){return tipVol(b)-tipVol(a)})[0];
    if(!c){A.pose({b:.25},.6,'대기').wait(2.5,'흙 대기');return}c.lock=A;A.strip=c;A.pass=0}
  var s=A.strip,zl=s.zc+(A.pass%2?1.45:-1.45),xs=PADR.x1+4.4,xe=PADR.x0+3.8,G=PADLVL;
  A.pose({b:.25,a:0},.6,'블레이드 올림');if(Math.abs(A.z-zl)>.3&&A.x<xs-14)A.move(A.x+9,zl,Math.PI,{rev:true,v:1.6,st:'후진 · 줄 바꿈',on:function(u,A){A.y=padY(A)}});
  A.move(xs,zl,Math.PI,{rev:true,v:1.9,st:'후진 복귀',on:function(u,A){A.y=padY(A)}});
  A.pose({b:0,a:(A.pass%2?-.18:.18)},.9,'블레이드 내림');
  A.move(xe,zl,Math.PI,{v:1.25,st:'펴 고르기',on:function(u,A,ds){A.y=padY(A);A.rig.pose.b=clamp((G-A.y)/1.63-.02,-.06,.28);A.rig.update();A.root.updateMatrixWorld(true);A.rig.tipWorld(_w);
    var V=PADF.carve(_w.x,_w.z,G,-1,0,1.25,.45,DZCAP-A.load);if(V>0){A.load+=V;A.vol+=V;_w.y=G+.3;dustAt(_w,3)}
    if(A.load>0){var U=PADF.fill(_w.x-1.0,_w.z,G,-1,0,1.25,.6,A.load);A.load-=U}
    A.loadF=A.load/DZCAP;A.dirty=true;
    if(A.load<.04&&_w.x<PADR.x1-9){var mx=0;for(var k=1;k<=5;k++){var h=PADF.sample(_w.x-k*1.3,_w.z);if(h!==null&&h>mx)mx=h}if(mx<G+.04)return true}}});
  A.call(function(A){if(A.load>0){A.root.updateMatrixWorld(true);A.rig.tipWorld(_w);PADF.deposit(clamp(_w.x-.6,PADR.x0+.6,PADR.x1),_w.z,A.load,.9);A.load=0;A.loadF=0;A.dirty=true}
    A.pass++;A.count++;if(A.pass>=2&&tipVol(A.strip)<1.4||A.pass>=6){A.strip.lock=null;A.strip=null}});
  A.pose({b:.25},.6,'블레이드 올림')}

/* ---------- 그레이더: 노반을 줄지어 왕복하며 0 높이로 고른다 ---------- */
var MGZ=[8.2,10.8,13.2,15.8];
function mgLanes(A){var gs=FLEET.filter(function(o){return o.kind==='mg'}).sort(function(a,b){return a.idx-b.idx});return gs.length>1?(gs.indexOf(A)===0?[MGZ[0],MGZ[1]]:[MGZ[2],MGZ[3]]):MGZ}
function mgPlan(A){var L=mgLanes(A);A.lane=A.lane||0;
  if(A.bedDone||A.lane>=L.length*2){A.bedDone=true;A.pose({b:.2},.5,'대기').wait(3,'구간 완료 대기');return}
  var z=L[A.lane%L.length],x0=BEDR.x0-3.2,x1=BEDR.x1-3.7,an=(A.lane%2?-.5:.5);
  A.pose({b:.2,a:an},.8,'블레이드 올림');if(Math.abs(A.z-z)>.3&&A.x>x0+20)A.move(A.x-16,z,0,{rev:true,v:2.6,st:'후진 · 줄 바꿈'});A.move(x0,z,0,{rev:true,v:3.4,st:'후진 복귀'});
  A.pose({b:-.01},.9,'블레이드 내림');
  A.move(x1,z,0,{v:1.9,st:'노반 정지',on:function(u,A,ds){A.root.updateMatrixWorld(true);A.rig.tipWorld(_w);var c=Math.cos(an),s=Math.sin(an);
    var U=BEDF.level(_w.x,_w.z,0,c,s,1.85,.55,.9);if(U>.002){A.vol+=U;A.loadF=.7;_w.y=.2;if(Math.random()<.3)emit(_w,2,1.6,.5,.9,0)}else A.loadF=Math.max(0,(A.loadF||0)-.02);A.dirty=true}});
  A.call(function(A){A.lane++;A.count++;A.loadF=0;A.dirty=true})}

/* ---------- 스키드로더: 모래 칸에서 퍼다가 파 놓은 관로 바닥에 기초 모래를 깐다 ---------- */
var SLZ=[33.4,35.7,38.0];
function slTarget(A){var g=TSEG[A.idx%3],x=g.bedX;if(x<g.x0+1)return null;var xm=g.ex&&!g.ex.gone?g.ex.x:-999;if(x<xm+11)return null;if(trDepth(x)>-1.0)return null;return {g:g,x:x}}
function slPlan(A){var z=SLZ[A.idx],H=Math.PI/2;
  if(A.load<=0){A.pose({b:0,k:0},.6,'접근');if(Math.abs(angDiff(A.yaw,0))>.1)A.spin(0);A.move(145.8,z,0,{v:2.6,st:'모래 칸으로'}).move(148.3,z,0,{v:.8,st:'퍼 담기',nb:true});
    A.call(function(A){A.load=.45;A.loadF=1;A.dirty=true;_w.set(150.3,.5,z);emit(_w,6,.8,.8,.9,0)}).pose({k:.5},.7,'버킷 젖히기').pose({b:.12,k:.45},.6,'들어 올리기').move(145.8,z,0,{rev:true,v:1.6});return}
  var t=slTarget(A);if(!t){if(A.x>143){A.spin(Math.PI).move(141-A.idx*3.2,z,Math.PI,{v:2.2})}A.wait(3,'부설 대기 (굴착 진행 중)');return}
  A.spin(Math.PI).move(t.x,z,Math.PI,{v:2.8,st:'운반'}).spin(H).move(t.x,TRZ+2.55,H,{v:1.1,st:'관로로 접근'});
  A.pose({b:.3,k:-.75},1.1,'모래 부설',function(u,A){if(u>.55&&A.load>0){TRNF.addBox(t.x,TRZ,.75,.45,A.load*1.0);t.g.bedX=t.x-1.5;A.vol+=A.load;A.load=0;A.loadF=0;A.count++;A.dirty=true;_w.set(t.x,-.6,TRZ);emit(_w,8,.8,.3,1.0,0)}});
  A.pose({b:.05,k:0},.8,'버킷 복귀').move(t.x,z,H,{rev:true,v:1.3}).spin(0)}

/* ---------- 휠 굴삭기: 관로 터파기 (깊이 1.6 m, 폭 약 1.1 m). 파면서 2.2 m씩 물러난다 ---------- */
var TRD=-1.6,WXCAP=.72;
function wxW(A,sw,lx,ly,o){var yw=A.yaw+sw,c=Math.cos(yw),s=Math.sin(yw);o.x=A.x+c*lx+s*Z0E;o.z=A.z-s*lx+c*Z0E;o.y=ly;return o}
function wxApply(A){var p=A.p;A.rig.setPose(p.b,p.a,p.k,p.sw,Math.min(1,A.load/WXCAP));KIN.fk(p,A.fk);wxW(A,p.sw,A.fk.x,A.fk.y,A.tipW);wxW(A,p.sw,A.fk.mx,A.fk.my,A.mouthW)}
function wxBuild(A){var prof=[],r0=7.9,r1=4.5,o={},i;
  for(i=0;i<=8;i++){var r=lerp(r0,r1,i/8);wxW(A,0,r,0,o);var h=TRNF.sample(o.x,o.z);if(h===null)h=0;if(o.x>A.seg0.x1)h=TRD;
    var y=Math.max(TRD,h-.36),p=null,ch=[lerp(-95,-150,i/8),lerp(-80,-135,i/8),lerp(-110,-165,i/8),lerp(-70,-120,i/8)];
    for(var yy=y;yy<=h+.05&&!p;yy+=.12){p=KIN.ikTipAny(r,yy,ch);if(p)y=yy}if(!p)return null;prof.push({r:r,y:y,hs:h,p:p})}
  if(prof.every(function(q){return q.y>=q.hs-.05}))return null;
  var Ap=KIN.ikTipAny(r0+.3,prof[0].hs+.85,[-70,-80,-60,-90]),Dp=KIN.ikTipAny(r1-.2,Math.max(prof[8].hs+.6,prof[8].y+1.0),[-205,-195,-185,-175,-165]);if(!Ap||!Dp)return null;return {prof:prof,A:Ap,D:Dp}}
function wxDump(){var p=null;for(var c=-168;c<=-92&&!p;c+=4)for(var yi=0;yi<3&&!p;yi++)p=KIN.ikMouth(4.8,[2.3,2.7,2.0][yi],c*D2R);return p||{b:.3,a:-.6,k:-1.9}}
function wxSeg(A,kind,to,dur,extra){var s={t:'ex',st:kind,to:to,dur:dur};if(extra)for(var k in extra)s[k]=extra[k];A.q.push(s)}
function wxPlan(A){var g=A.seg0,P=wxBuild(A);
  if(!P){if(A.x-2.2>=g.x0-.5){A.q.push({t:'stow',v:1,dur:2.2,st:'아웃트리거 올림'});A.move(A.x-2.2,TRZ,0,{rev:true,v:.7,st:'후진 이동',nb:true});A.q.push({t:'stow',v:0,dur:2.2,st:'아웃트리거 내림'});return}
    A.wait(25,'구간 굴착 완료');A.call(function(A){segReset(g);addAlert('trn'+g.i+'-'+g.n,A.id+' 관로 '+(g.i+1)+'구간 완료 → 되메우기 후 다음 구간 (시연용으로 되돌림)')});
    A.q.push({t:'stow',v:1,dur:2.2,st:'아웃트리거 올림'});A.move(g.x1-7.9,TRZ,0,{v:1.6,st:'다음 구간으로',nb:true});A.q.push({t:'stow',v:0,dur:2.2,st:'아웃트리거 내림'});return}
  var d0=Math.abs(angDiff(A.p.sw,0)),B=P.prof[0].p,D=wxDump(),H=Math.PI/2;
  wxSeg(A,'접근',{b:P.A.b,a:P.A.a,k:P.A.k,sw:0},Math.max(2.2,d0/.95+1.1));wxSeg(A,'관입',{b:B.b,a:B.a,k:B.k,sw:0},1.0);
  A.q.push({t:'ex',st:'굴착',drag:P,dur:2.8});wxSeg(A,'버킷 오므리기',{b:P.D.b,a:P.D.a,k:P.D.k,sw:0},1.4);
  wxSeg(A,'들며 선회',{b:D.b,a:D.a,k:D.k,sw:H},3.4);
  A.q.push({t:'ex',st:'덤프',dump:true,dur:1.7})}
function wxStep(A,dt){if(A.gone)return;A.fuel+=dt*(A.seg?15:4)/3600;
  var guard=0;while(guard++<6){if(!A.seg){if(!A.q.length){wxPlan(A);if(!A.q.length)break}A.seg=A.q.shift()}var s=A.seg,done=false;
    if(s.t==='ex'){if(s.e===undefined){s.e=0;s.from={b:A.p.b,a:A.p.a,k:A.p.k,sw:A.p.sw};if(s.dump){var o=s.from;s.to={b:o.b-.05,a:o.a+.12,k:Math.min(KIN.LIM[2][1]-.02,o.k+2.15),sw:o.sw}}}
      s.e+=dt;var u=Math.min(1,s.e/s.dur);A.state=s.st;
      if(s.drag){var Pp=s.drag.prof,f=u*8,i=Math.min(7,Math.floor(f)),gk=f-i,a=Pp[i].p,b=Pp[i+1].p;A.p.b=lerp(a.b,b.b,gk);A.p.a=lerp(a.a,b.a,gk);A.p.k=lerp(a.k,b.k,gk);A.p.sw=0}
      else{var k=sm(u),fr=s.from,to=s.to;A.p.b=lerp(fr.b,to.b,k);A.p.a=lerp(fr.a,to.a,k);A.p.k=lerp(fr.k,to.k,k);A.p.sw=fr.sw+angDiff(fr.sw,to.sw)*k}
      wxApply(A);
      /* 날이 바닥보다 아래로 들어가면 깎는다 */
      var t=A.tipW,h=TRNF.sample(t.x,t.z);if(h!==null&&t.y<h-.01&&A.load<WXCAP-.002&&Math.abs(t.z-TRZ)<1.2){var V=TRNF.carve(t.x,t.z,t.y,1,0,.54,.24,WXCAP-A.load);if(V>0){A.load+=V;A.vol+=V;if(Math.random()<.35)emit(t,3,.6,1.2,1.0,0)}}
      if(s.dump&&!s.dumped&&u>.45){s.dumped=true;var m=A.mouthW;if(A.load>.01){TRNF.deposit(m.x,Math.max(TRNR.z0+1.2,m.z),A.load*1.25,.7);var q=TRNF.ij(m.x,m.z);TRNF.relax(q[0]-6,0,q[0]+6,Math.min(q[1]+5,9),.3,5);emit(m,22,1.1,-.6,1.3,0)}A.load=0;A.count++}
      done=u>=1}
    else if(s.t==='stow'){if(s.e===undefined){s.e=0;s.v0=A.rig.stow||0;s.p0={b:A.p.b,a:A.p.a,k:A.p.k,sw:A.p.sw}}s.e+=dt;var uu=Math.min(1,s.e/s.dur),kk=sm(uu);A.rig.setStow(lerp(s.v0,s.v,kk));A.state=s.st;
      if(s.v===1){A.p.b=lerp(s.p0.b,.2,kk);A.p.a=lerp(s.p0.a,-.75,kk);A.p.k=lerp(s.p0.k,-1.3,kk);A.p.sw=s.p0.sw+angDiff(s.p0.sw,0)*kk;wxApply(A)}done=uu>=1}
    else{done=A.stepSeg(dt);if(s.t==='move'){A.rig.setRoll(A.odo);wxApply(A);A.seg0.xm=A.x}}
    if(done){var imm=s.t==='call';A.seg=null;if(imm)continue}break}}

/* ---------- 대수 조정 ---------- */
var PLAN={wl:wlPlan,dz:dzPlan,mg:mgPlan,sl:slPlan};
function spawn(kind,idx){var A=new Agent(kind,idx);
  if(kind==='wl'){A.put(119,WLZ[idx],0);A.plan=function(){wlPlan(A)}}
  else if(kind==='dz'){A.put(PADR.x0+7,PADR.z0+5+idx*12,Math.PI);var ms=dzStrips(A);if(ms.length)A.put(PADR.x0+7,ms[0].zc,Math.PI);A.rig.pose.b=.25;A.plan=function(){dzPlan(A)}}
  else if(kind==='mg'){A.put(BEDR.x0-3.2,MGZ[idx*2],0);A.rig.pose.b=.2;A.lane=0;A.plan=function(){mgPlan(A)}}
  else if(kind==='sl'){A.put(144-idx*3.2,SLZ[idx],0);A.plan=function(){slPlan(A)}}
  else{var g=TSEG[idx];A.seg0=g;g.ex=A;A.put(g.x1-7.9,TRZ,0);A.p={b:HXD.KF[6][0],a:HXD.KF[6][1],k:HXD.KF[6][2],sw:0};A.fk={};A.tipW=new V3();A.mouthW=new V3();A.plan=function(){};A.step=function(dt){wxStep(A,dt)};wxApply(A)}
  if(kind!=='wx'){A.rig.update();A.dirty=true}
  if(kind==='mg')FLEET.forEach(function(o){if(o.kind==='mg'){o.lane=0;o.bedDone=false}});
  return A}
function despawn(A){A.gone=true;A.band=null;if(A.kind==='mg')FLEET.forEach(function(o){if(o.kind==='mg'){o.lane=0;o.bedDone=false}});STRIPS.forEach(function(s){if(s.lock===A)s.lock=null});TSEG.forEach(function(g){if(g.ex===A)g.ex=null});scene.remove(A.root);FLEET.splice(FLEET.indexOf(A),1)}
function fleetCount(kind){return FLEET.filter(function(A){return A.kind===kind}).length}
function setFleet(kind,n){var cur=FLEET.filter(function(A){return A.kind===kind}).sort(function(a,b){return a.idx-b.idx}),made=[],gone=[];
  while(cur.length>n)gone.push(cur.pop());gone.forEach(despawn);
  for(var i=cur.length;i<n;i++)made.push(spawn(kind,i));return {made:made,gone:gone}}
var site2T=0;
function stepSite2(dt){for(var i=0;i<FLEET.length;i++)FLEET[i].step(dt);borFeed(dt);site2T+=dt;if(site2T>4){site2T=0;padCheck();
    var gs=FLEET.filter(function(A){return A.kind==='mg'});if(gs.length&&(bedFrac()>.965||gs.every(function(A){return A.bedDone}))){bedWait+=4;if(bedWait>90){bedWait=0;bedReset()}}else bedWait=0}}
