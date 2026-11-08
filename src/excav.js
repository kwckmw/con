/* ===================== 굴삭기: 역기구학 · 굴착 계획 · 사이클 ===================== */
var D2R=Math.PI/180,Z0E=.25,BANKCAP=.92/1.25,SWELL=1.25;   /* 버킷 0.92 m³(흐트러진 상태) = 본바닥 약 0.74 m³ */
var KIN=(function(){
  var F=HXD.F,Tp=HXD.T,Bp=HXD.B,TIP=HXD.tip,MO=HXD.mouth,LIM=HXD.lim;
  function hy(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1])}function an(a,b){return Math.atan2(b[1]-a[1],b[0]-a[0])}
  var L1=hy(F,Tp),L2=hy(Tp,Bp),L3=hy(Bp,TIP),Lm=hy(Bp,MO),phi0=an(F,Tp),psi0=an(Tp,Bp),chi0=an(Bp,TIP),dm=an(Bp,MO)-chi0;
  function wrap(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a}
  function fk(p,o){o=o||{};var phi=phi0+p.b,psi=psi0+p.b+p.a,chi=chi0+p.b+p.a+p.k;o.tx=F[0]+L1*Math.cos(phi);o.ty=F[1]+L1*Math.sin(phi);
    o.bx=o.tx+L2*Math.cos(psi);o.by=o.ty+L2*Math.sin(psi);o.x=o.bx+L3*Math.cos(chi);o.y=o.by+L3*Math.sin(chi);o.mx=o.bx+Lm*Math.cos(chi+dm);o.my=o.by+Lm*Math.sin(chi+dm);o.chi=chi;return o}
  function ikB(bx,by,chi){var dx=bx-F[0],dy=by-F[1],D=Math.hypot(dx,dy);if(D>L1+L2-.03||D<Math.abs(L1-L2)+.05)return null;
    var phi=Math.atan2(dy,dx)+Math.acos((L1*L1+D*D-L2*L2)/(2*L1*D)),tx=F[0]+L1*Math.cos(phi),ty=F[1]+L1*Math.sin(phi),psi=Math.atan2(by-ty,bx-tx);
    var b=wrap(phi-phi0),a=wrap(psi-psi0-b),k=wrap(chi-chi0-b-a);return {b:b,a:a,k:k}}
  function ok(p){return !!p&&p.b>=LIM[0][0]&&p.b<=LIM[0][1]&&p.a>=LIM[1][0]&&p.a<=LIM[1][1]&&p.k>=LIM[2][0]&&p.k<=LIM[2][1]}
  function lim(p){p.b=clamp(p.b,LIM[0][0],LIM[0][1]);p.a=clamp(p.a,LIM[1][0],LIM[1][1]);p.k=clamp(p.k,LIM[2][0],LIM[2][1]);return p}
  function ikTip(x,y,chi){var p=ikB(x-L3*Math.cos(chi),y-L3*Math.sin(chi),chi);return ok(p)?p:null}
  function ikTipAny(x,y,chis){for(var i=0;i<chis.length;i++){var p=ikTip(x,y,chis[i]*D2R);if(p)return p}return null}
  function ikMouth(x,y,chi){var c=chi+dm,p=ikB(x-Lm*Math.cos(c),y-Lm*Math.sin(c),chi);return ok(p)?p:null}
  return {fk:fk,ikTip:ikTip,ikTipAny:ikTipAny,ikMouth:ikMouth,lim:lim,LIM:LIM,wrap:wrap}})();

function Excavator(id,name,st,yaw,loop,zlim){var E=this,x=st[0][0],z=st[0][2];E.st=st.map(function(s){return {x:s[0],y:s[1],z:s[2]}});E.k=0;E.dir=Math.cos(yaw)>0?1:-1;E.zlim=zlim;E.y=0;E.trk=0;E.id=id;E.name=name;E.kind='ex';E.api=makeExcavator();E.root=E.api.root;scene.add(E.root);
  E.root.position.set(x,0,z);E.root.rotation.y=yaw;E.root.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  E.x=x;E.z=z;E.yaw=yaw;E.target=-2.4;E.loop=loop;E.p={b:HXD.KF[6][0],a:HXD.KF[6][1],k:HXD.KF[6][2],sw:0};E.fill=0;E.q=[];E.seg=null;E.state='대기';
  E.cycles=0;E.cycT=[];E.cycStart=0;E.dug=0;E.fuel=0;E.pass=0;E.truck=null;E.done=false;E.manual=false;E.press=4;E.dug0=0;
  E.fkO={};E.dumpSw=90*D2R;E.tipW=new V3();E.mouthW=new V3();E.lastTip=null;E.obj=E.root}
/* (선회각, 붐 평면 x, y) → 세계 좌표 */
Excavator.prototype.w=function(sw,lx,ly,o){var yw=this.yaw+sw,c=Math.cos(yw),s=Math.sin(yw);o=o||{};o.x=this.x+c*lx+s*Z0E;o.z=this.z-s*lx+c*Z0E;o.y=ly+this.y;return o};
/* 설계면: 지금 자리(k)에서 파야 할 높이. 앞쪽 띠는 다음 자리로 내려가는 경사로(1.6 m)와 받침면을 남긴다 */
Excavator.prototype.design=function(x,z){var E=this,s=E.st[E.k],n=E.st[E.k+1],u=(x-s.x)*E.dir,T=s.y-2.4;
  if(Math.abs(z-s.z)<=2.6){if(u<2.2)return s.y;if(n){if(u<3.8)return lerp(s.y,n.y,(u-2.2)/1.6);if(u<8.4)return n.y}}return T};
function groundH(x,z){var h=PITF.sample(x,z);return h===null?0:h}
/* 세계 점 → (선회각, 붐 평면 x) */
Excavator.prototype.inv=function(px,pz){var dx=px-this.x,dz=pz-this.z,c=Math.cos(-this.yaw),s=Math.sin(-this.yaw),lx=c*dx+s*dz,lz=-s*dx+c*dz,r=Math.hypot(lx,lz),x=Math.sqrt(Math.max(.01,r*r-Z0E*Z0E));
  return {sw:Math.atan2(-lz,lx)-Math.atan2(-Z0E,x),x:x}};
var _o1={},_o2={};
Excavator.prototype.plan=function(){var E=this,best=null;
  for(var si=-11;si<=4;si++){var sig=si*7.5*D2R;for(var rc=3.6;rc<=7.81;rc+=.4){var w=E.w(sig,rc,0,_o1),h=PITF.sample(w.x,w.z);if(h===null||(w.z-E.zlim[0])*(w.z-E.zlim[1])>0||h<=E.design(w.x,w.z)+.06)continue;
    var sc=h*4-Math.abs(si)*.12-Math.abs(rc-6)*.25+Math.random()*.2;if(best&&sc<=best.sc)continue;var P=E.build(sig,rc);if(P){P.sc=sc;best=P}}}
  return best};
Excavator.prototype.build=function(sig,rc){var E=this,r0=rc+1.25,r1=Math.max(2.6,rc-1.25),prof=[],i;
  for(i=0;i<=8;i++){var r=lerp(r0,r1,i/8),w=E.w(sig,r,0,_o1),h=PITF.sample(w.x,w.z);if(h===null){if(i===0)return null;h=prof[prof.length-1].hs+E.y}
    var y=Math.max(E.design(w.x,w.z),h-.34)-E.y;h-=E.y;var p=null,ch=[lerp(-95,-150,i/8),lerp(-80,-135,i/8),lerp(-110,-165,i/8),lerp(-70,-120,i/8)];
    for(var yy=y;yy<=h+.05&&!p;yy+=.12){p=KIN.ikTipAny(r,yy,ch);if(p)y=yy}if(!p)return null;prof.push({r:r,y:y,hs:h,p:p})}
  if(prof.every(function(q){return q.y>=q.hs-.05}))return null;var A0=prof[0],A8=prof[8];
  var A=KIN.ikTipAny(r0+.3,prof[0].hs+.85,[-70,-80,-60,-90]),D=KIN.ikTipAny(r1-.2,Math.max(prof[8].hs+.6,prof[8].y+1.0),[-205,-195,-185,-175,-165]);if(!A||!D)return null;
  return {sig:sig,rc:rc,prof:prof,A:A,D:D}};
Excavator.prototype.push=function(kind,o){o.kind=kind;this.q.push(o)};
Excavator.prototype.newCycle=function(){var E=this,P=E.plan();if(!P){if(E.k<E.st.length-1){E.startMove();return false}E.done=true;E.state='최종 심도 도달';return false}
  var dsw=Math.abs(angDiff(E.p.sw,P.sig));
  E.push('접근',{to:{b:P.A.b,a:P.A.a,k:P.A.k,sw:P.sig},dur:Math.max(2.4,dsw/.95+1.2),pr:9});
  var B=P.prof[0].p;E.push('관입',{to:{b:B.b,a:B.a,k:B.k,sw:P.sig},dur:1.0,pr:24});
  E.push('굴착',{drag:P,dur:2.8,pr:31});
  E.push('버킷 오므리기',{to:{b:P.D.b,a:P.D.a,k:P.D.k,sw:P.sig},dur:1.4,pr:27});
  E.push('들며 선회',{lift:true,dur:0,pr:20});E.push('트럭 정렬',{align:true,dur:.9,pr:14});E.push('덤프',{dump:true,dur:1.7,pr:12});
  E.cycStart=simT;return true};
/* 버킷을 비울 지점: 트럭이 있으면 적재함 위, 없으면 정차 위치 위 */
Excavator.prototype.dumpPose=function(exact){var E=this,t=E.truck,pt;
  if(t&&exact){var xs=[2.0,.75,-.5];pt=t.api.bedWorld(xs[E.pass%3],new V3())}else{pt=E.loadSpot}
  var iv=E.inv(pt.x,pt.z),p=null;
  for(var c=-168;c<=-92&&!p;c+=4)for(var yi=0;yi<4&&!p;yi++)for(var xi=0;xi<4&&!p;xi++)p=KIN.ikMouth(iv.x+[0,-.35,.35,-.7][xi],[4.3,4.0,4.7,3.75][yi]-E.y,c*D2R);
  p=p||{b:.45,a:-.5,k:-1.9};
  return {b:p.b,a:p.a,k:p.k,sw:iv.sw}};
var _fk={};
Excavator.prototype.step=function(dt){var E=this;if(E.moving){E.travel(dt);return}
  E.fuel+=dt*(E.seg||E.manual?17:4.5)/3600;
  if(E.manual){E.press=lerp(E.press,E.mPress||5,.2);E.apply();E.dig(dt);return}
  if(!E.seg){if(!E.q.length){
      if(E.done){E.state='목표 심도 도달';E.press=3;if(E.truck&&E.truck.load>0){E.truck.go('운반');E.truck=null}return}
      var ready=E.truck||E.loop.trucks.some(function(t){return t.ex===E&&t.load===0&&t.state!=='덤프 중'&&E.loop.fwd(t.s,t.sLoad)<45});
      if(!ready){E.state='트럭 대기';E.press=lerp(E.press,3,.1);return}
      if(!E.newCycle())return}
    E.seg=E.q.shift();E.seg.t=0;E.seg.from={b:E.p.b,a:E.p.a,k:E.p.k,sw:E.p.sw};
    if(E.seg.lift){var to=E.dumpPose(false);E.seg.to=to;E.seg.dur=Math.max(3.2,Math.abs(angDiff(E.p.sw,to.sw))/1.0+1.4)}
    if(E.seg.align){if(!(E.truck&&E.truck.state==='적재 중')){E.q.unshift(E.seg);E.seg=null;E.state='트럭 대기 (버킷 적재)';E.press=lerp(E.press,6,.1);return}
      E.seg.to=E.dumpPose(true)}
    if(E.seg.dump){var o=E.seg.from;E.seg.to={b:o.b-.05,a:o.a+.12,k:Math.min(KIN.LIM[2][1]-.02,o.k+2.15),sw:o.sw};E.seg.dumped=false}}
  var s=E.seg;s.t+=dt;var u=Math.min(1,s.t/s.dur);E.state=s.kind;E.press=lerp(E.press,s.pr+Math.sin(simT*3)*1.2,.15);
  if(s.drag){var P=s.drag.prof,f=u*8,i=Math.min(7,Math.floor(f)),g=f-i,a=P[i].p,b=P[i+1].p;E.p.b=lerp(a.b,b.b,g);E.p.a=lerp(a.a,b.a,g);E.p.k=lerp(a.k,b.k,g);E.p.sw=s.drag.sig}
  else{var k=sm(u),fr=s.from,to=s.to;E.p.b=lerp(fr.b,to.b,k);E.p.a=lerp(fr.a,to.a,k);E.p.k=lerp(fr.k,to.k,k);E.p.sw=fr.sw+angDiff(fr.sw,to.sw)*k}
  if(s.dump&&!s.dumped&&u>.45){s.dumped=true;E.release()}
  E.apply();E.dig(dt);
  if(u>=1){E.seg=null;if(s.move){E.moving={x0:E.x,x1:E.st[E.k+1].x,d:0};return}if(s.dump){E.cycles++;E.pass++;E.cycT.push(simT-E.cycStart);if(E.cycT.length>30)E.cycT.shift();
      var t=E.truck;if(t&&t.load+.92>ADT.CAP+.05){t.go('운반');E.truck=null;E.pass=0}}}};
Excavator.prototype.apply=function(){var E=this;E.api.setPose(E.p.b,E.p.a,E.p.k,E.p.sw,Math.min(1,E.fill/BANKCAP));
  KIN.fk(E.p,_fk);E.w(E.p.sw,_fk.x,_fk.y,_o2);E.tipW.set(_o2.x,_o2.y,_o2.z);E.w(E.p.sw,_fk.mx,_fk.my,_o2);E.mouthW.set(_o2.x,_o2.y,_o2.z);E.chi=_fk.chi};
/* 버킷 날이 바닥보다 아래로 들어가면 흙을 깎는다 */
Excavator.prototype.dig=function(){var E=this,t=E.tipW,h=PITF.sample(t.x,t.z);if(h===null||t.y>=h-.01||E.fill>=BANKCAP-.002){E.lastTip=null;return}
  var yw=E.yaw+E.p.sw,ux=Math.cos(yw),uz=-Math.sin(yw),V=PITF.carve(t.x,t.z,t.y,ux,uz,.54,.24,BANKCAP-E.fill);
  if(V>0){E.fill+=V;E.dug+=V;var ij=PITF.ij(t.x,t.z);PITF.relax(ij[0]-7,ij[1]-7,ij[0]+7,ij[1]+7,.36,2);if(Math.random()<.35)emit(t,3,.6,1.2,1.0,0)}};
Excavator.prototype.release=function(){var E=this,V=E.fill;if(V<.01){E.fill=0;return}E.fill=0;var m=E.mouthW;emit(m,30,1.1,-.6,1.3,0);
  for(var i=0;i<TRUCKS.length;i++){var tr=TRUCKS[i];if(tr.state!=='적재 중')continue;tr.api.root.updateMatrixWorld(true);var lp=tr.api.body.children[0].worldToLocal(m.clone());
    if(lp.x>-1.9&&lp.x<3.3&&Math.abs(lp.z)<1.35&&lp.y>1.4&&lp.y<6.5&&tr.api.tip<.05){tr.addLoad(lp.x,lp.z,V*SWELL);return}}
  /* 트럭 밖이면 바닥에 쏟는다 */
  var G=PITF.sample(m.x,m.z)!==null?PITF:(YARDP.sample(m.x,m.z)!==null?YARDP:null);
  if(G){G.deposit(m.x,m.z,V*SWELL,.7);var q=G.ij(m.x,m.z);G.relax(q[0]-8,q[1]-8,q[0]+8,q[1]+8,.3,6);if(G===PITF)E.dug-=V}};
/* 안전 반경 표시 */
function swingRings(E){var g=new T.Group();g.position.set(E.x,.05,E.z);scene.add(g);
  var r1=new T.Mesh(new T.RingGeometry(0,2.95,48),new T.MeshBasicMaterial({color:0xe0573a,transparent:true,opacity:.22,depthWrite:false}));r1.rotation.x=-Math.PI/2;g.add(r1);
  var e1=new T.Mesh(new T.RingGeometry(2.85,2.95,64),new T.MeshBasicMaterial({color:0xe0573a,transparent:true,opacity:.8,depthWrite:false}));e1.rotation.x=-Math.PI/2;g.add(e1);
  var pts=[];for(var i=0;i<=120;i++){var a=i/120*Math.PI*2;pts.push(new V3(Math.cos(a)*10,0,Math.sin(a)*10))}
  var dash=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:0xf0a41f,dashSize:.7,gapSize:.45}));dash.computeLineDistances();g.add(dash);
  g.visible=false;return g}

/* 다음 자리로: 버킷을 접고 선회를 0으로 돌린 뒤 경사로를 따라 주행 (트랙 링크가 실제로 돈다) */
Excavator.prototype.startMove=function(){var E=this;if(E.truck){if(E.truck.load>0)E.truck.go('운반');else E.truck.state='복귀';E.truck=null}
  E.q=[{kind:'이동 준비',to:{b:HXD.KF[6][0]+.25,a:HXD.KF[6][1]-.25,k:HXD.KF[6][2]-.5,sw:0},dur:3.5,pr:8,move:true}];E.pass=0;E.state='이동 준비'};
Excavator.prototype.travel=function(dt){var E=this,M=E.moving,L=Math.abs(M.x1-M.x0);M.d=Math.min(L,M.d+dt*.75);var u=M.d/L;
  E.x=M.x0+(M.x1-M.x0)*u;var c=E.dir,hf=groundH(E.x+c*1.6,E.z),hb=groundH(E.x-c*1.6,E.z),hm=groundH(E.x,E.z);
  E.y=Math.max(hm,(hf+hb)/2);E.root.position.set(E.x,E.y,E.z);E.root.rotation.z=Math.atan2(hf-hb,3.2);
  E.trk+=dt*.75;E.api.layTracks(E.trk);E.state='경사로 주행';E.press=lerp(E.press,15,.1);E.fuel+=dt*19/3600;
  if(E.rings)E.rings.position.set(E.x,E.y+.05,E.z);E.apply();
  if(M.d>=L){E.k++;var s=E.st[E.k];E.x=s.x;E.y=s.y;E.z=s.z;E.root.position.set(E.x,E.y,E.z);E.root.rotation.z=0;E.moving=null;E.target=s.y-2.4;
    if(E.rings)E.rings.position.set(E.x,E.y+.05,E.z);E.relocate();if(typeof addAlert==='function')addAlert('mv'+E.id+E.k+Math.floor(simT/60),E.id+' '+E.k+'단('+s.y.toFixed(1)+' m)으로 내려와 굴착 시작')}};
/* 자리에 맞춰 트럭 정차점을 다시 잡는다 */
Excavator.prototype.relocate=function(){var E=this;E.loadSpot=E.loadSpot||new V3();E.w(90*D2R,6.0,0,_o1);E.loadSpot.set(_o1.x,3,_o1.z);
  E.sLoad=bestS(E.loop,function(o){var c=Math.cos(o.yr),s=Math.sin(o.yr),bx=o.gx+c*.75,bz=o.gz-s*.75;return Math.hypot(bx-E.loadSpot.x,bz-E.loadSpot.z)});
  if(E.loop.trucks)E.loop.trucks.forEach(function(t){if(t.ex===E){t.sLoad=E.sLoad;if(t.state==='적재 중'&&t.s!==E.sLoad){t.state=t.load>0?'운반':'복귀';if(E.truck===t)E.truck=null}}})};
Excavator.prototype.resetTo0=function(){var E=this,s=E.st[0];E.k=0;E.x=s.x;E.y=s.y;E.z=s.z;E.moving=null;E.q=[];E.seg=null;E.done=false;E.target=-2.4;E.root.position.set(E.x,E.y,E.z);E.root.rotation.z=0;if(E.rings)E.rings.position.set(E.x,E.y+.05,E.z);E.relocate()};
