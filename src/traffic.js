/* ===================== 운반: 트럭 6대 · 두 운반로 · 차간거리 제어 ===================== */
var TRUCKS=[];
var _pa={},_ph={},_pg={};
function Truck(id,loop,ex,pile,tag,s0){var t=this;t.id=id;t.name='덤프트럭 '+id;t.kind='truck';t.loop=loop;t.ex=ex;t.pile=pile;t.tag=tag;
  t.api=makeADT(id,tag);scene.add(t.api.root);t.obj=t.api.root;t.s=s0;t.v=0;t.load=0;t.state='진입';t.trips=0;t.wait=0;t.tipT=0;t.relV=0;t.odo=0;t.waitAcc=0;t.loadStart=0;
  t.sLoad=ex.sLoad;t.sDump=pile.sDump;t.pose();loop.trucks.push(t);TRUCKS.push(t)}
/* 앞축 = 경로 위 s, 굴절점 = s-1.63, 보기 중심 = s-5.23 (뒤 유닛은 앞 유닛 궤적을 따라감) */
function adtPose(loop,s,out){loop.at(s,_pa);loop.at(s-ADT.AH,_ph);loop.at(s-ADT.AH-ADT.HB,_pg);
  out.ax=_pa.x;out.az=_pa.z;out.gx=_pg.x;out.gz=_pg.z;out.yf=Math.atan2(-(_pa.z-_ph.z),_pa.x-_ph.x);out.yr=Math.atan2(-(_ph.z-_pg.z),_ph.x-_pg.x);return out}
Truck.prototype.pose=function(){var t=this,o=adtPose(t.loop,t.s,{});t.api.F.position.set(o.ax,0,o.az);t.api.F.rotation.y=o.yf;t.api.R.position.set(o.gx,0,o.gz);t.api.R.rotation.y=o.yr;t.yf=o.yf;t.yr=o.yr;t.po=o};
Truck.prototype.go=function(st){this.state=st;if(st==='운반'){this.loadEnd=simT}};
Truck.prototype.addLoad=function(x,z,V){var t=this,H=t.api.heap;H.deposit(clamp(x,-1.4,3.0),clamp(z,-.9,.9),V,.6);H.relax(0,0,H.nx-1,H.nz-1,.14,10);t.load+=V};
Truck.prototype.target=function(){return (this.load>0||this.state==='운반')?this.sDump:this.sLoad};
Truck.prototype.step=function(dt){var t=this,L=t.loop;
  if(t.state==='적재 중'){t.v=0;if(t.s!==t.sLoad&&t.load===0){t.state='복귀'}else{if(!t.ex.truck&&!exBusy(t.ex))t.ex.truck=t;return}}
  if(t.state==='덤프 중'){t.v=0;t.dumpStep(dt);return}
  /* 앞차 */
  var gap=1e9;L.trucks.forEach(function(o){if(o===t)return;var d=L.fwd(t.s,o.s);if(d<gap)gap=d});gap-=ADT.LEN;
  var sT=t.target(),dS=L.fwd(t.s,sT);if(dS>L.L-2)dS=0;
  var vmax=t.load>0?5.2:6.4,b=1.4,a=.7;
  var vs=Math.sqrt(2*b*Math.max(0,dS-.02)),vg=Math.sqrt(2*b*Math.max(0,gap-5)),vc=Math.min(L.vmax(t.s+2),L.vmax(t.s+6));
  /* 합류 구간: 다른 운반로 트럭이 안에 있으면 진입점에서 정지 */
  var Z=t.loop.zone;
  if(!t.inZ){var dIn=L.fwd(t.s,Z.sIn);if(dIn<18&&dS>dIn){if(zoneCan(t)){t.inZ=true;ZONE.n++;ZONE.loop=L;ZONE.last=L;ZONE.wait[L.id]=false}
      else{vs=Math.min(vs,Math.sqrt(2*b*Math.max(0,dIn-.02)));if(dIn<1.5&&t.v<.2){ZONE.wait[L.id]=true;t.zWait=true}}}}
  else if(L.fwd(Z.sIn,t.s)>=L.fwd(Z.sIn,Z.sOut)&&L.fwd(Z.sIn,t.s)<L.L-30){t.inZ=false;ZONE.n=Math.max(0,ZONE.n-1);if(!ZONE.n)ZONE.loop=null}
  var vt=Math.min(vmax,vs,vg,vc);t.v=clamp(vt,t.v-b*1.8*dt,t.v+a*dt);if(t.v<0)t.v=0;
  var ds=t.v*dt;t.s=(t.s+ds)%L.L;t.odo+=ds;t.api.wheels.forEach(function(w){w.rotation.z-=ds/ADT.WR});
  if(t.v<.05&&gap<6.5)t.waitAcc+=dt;
  if(dS<.12&&t.v<.08){t.s=sT;t.v=0;
    if(sT===t.sLoad&&t.load===0){if(!exBusy(t.ex)){t.state='적재 중';t.loadStart=simT;t.ex.truck=t}}
    else if(sT===t.sDump&&t.load>0){t.state='덤프 중';t.tipT=0;t.relV=0;t.H0=Float32Array.from(t.api.heap.h)}}
  else if(t.load>0)t.state=(!t.inZ&&t.v<.2&&L.fwd(t.s,Z.sIn)<2)?'합류 대기':'운반';else t.state=(gap<7&&t.v<.3)?'대기':(dS<45?'진입':'복귀');
  t.pose()};
/* 적재함 들기 11 s → 3 s 유지 → 내리기 10 s. 25° 넘으면 흙이 흘러나간다 */
var _tw=new V3();
Truck.prototype.dumpStep=function(dt){var t=this,A=t.api;t.tipT+=dt;var a;
  if(t.tipT<11)a=sm(t.tipT/11)*ADT.TIP;else if(t.tipT<14)a=ADT.TIP;else a=ADT.TIP*(1-sm((t.tipT-14)/10));
  A.setTip(a);
  var p=clamp((Math.min(a,ADT.TIP)-25*D2R)/(40*D2R),0,1);if(t.tipT>=11)p=1;var want=t.load*Math.pow(p,1.2);
  if(want>t.relV+.05){var dv=want-t.relV;t.relV=want;A.root.updateMatrixWorld(true);_tw.set(-3.2-p*.8,.4,0).applyMatrix4(A.R.matrixWorld);
    var G=YARDP;G.deposit(_tw.x+(Math.random()-.5),_tw.z+(Math.random()-.5),dv,1.0);var q=G.ij(_tw.x,_tw.z);G.relax(q[0]-9,q[1]-9,q[0]+9,q[1]+9,.33,4);
    if(Math.random()<.6)emit(_tw,10,1.6,1.4,1.6,1)}
  var H=A.heap;for(var k=0;k<H.h.length;k++)H.h[k]=H.b[k]+(t.H0[k]-H.b[k])*(1-p);H.mark(0,0,H.nx-1,H.nz-1);H.mesh.position.x=-p*1.4;
  if(t.tipT>=24){A.setTip(0);H.mesh.position.x=0;for(k=0;k<H.h.length;k++)H.h[k]=H.b[k];H.mark(0,0,H.nx-1,H.nz-1);
    DELIV+=t.load;t.load=0;t.trips++;t.state='복귀';t.turn=t.turn||[];if(t.loadStart)t.turn.push((simT-t.loadStart)/60)}};
function exBusy(E){return !!(E.moving||(E.seg&&E.seg.move)||(E.q[0]&&E.q[0].move))}
var DELIV=0,ZONE={n:0,loop:null,last:null,wait:{}};
function zoneCan(t){var L=t.loop,o=L===LN?'S':'N';if(ZONE.n===0)return !(ZONE.wait[o]&&ZONE.last===L);return ZONE.loop===L&&!ZONE.wait[o]}
/* 적재 정차점: 적재함 중심이 굴삭기 기준 덤프 반경(6.4 m) 위에 오도록 탐색 */
function bestS(loop,fn){var best=0,bd=1e9,o={};for(var s=0;s<loop.L;s+=.25){adtPose(loop,s,o);var d=fn(o);if(d<bd){bd=d;best=s}}return best}
function setupSite(){
  EX1.relocate();EX2.relocate();
  [LN,LS].forEach(function(L){L.sDump=bestS(L,function(o){return Math.hypot(o.ax+23.5,o.az-3)+(Math.abs(Math.cos(o.yf)+1)<.05?0:50)})});
  function near(L,x,z){return bestS(L,function(o){return Math.hypot(o.ax-x,o.az-z)})}
  LN.zone={sIn:near(LN,-8,-7.5),sOut:near(LN,-30,-12)};LS.zone={sIn:near(LS,-2.2,11.6),sOut:near(LS,-30,18.5)};
  LN.trucks=[];LS.trucks=[];
  var cols=[0x3d5bd9,0xe0573a,0x2f9e6b,0x8e5bd0,0x0fa3b1,0xd4a017];
  for(var i=0;i<3;i++){new Truck('DT-0'+(i+1),LN,EX1,LN,cols[i],(EX1.sLoad-22-i*17+LN.L)%LN.L)}
  for(i=0;i<3;i++){new Truck('DT-0'+(i+4),LS,EX2,LS,cols[i+3],(EX2.sLoad-22-i*17+LS.L)%LS.L)}}
/* 사토장 정리 (도저 작업으로 가정): 길 위에 쏟은 흙은 천천히 야적 더미 쪽으로 옮겨진다 */
var spreadT=0;
function spreadPiles(dt){spreadT+=dt;if(spreadT<1)return;var k0=spreadT;spreadT=0;var G=YARDP,moved=0;
  for(var j=0;j<G.nz;j++)for(var i=0;i<G.nx;i++){var x=G.x0+i*G.dx,z=G.z0+j*G.dz;if(!G.road(x,z))continue;var k=j*G.nx+i,e=G.h[k]-G.b[k];if(e<.01)continue;var m=e*Math.min(.5,.05*k0);G.h[k]-=m;moved+=m*G.ca;G.mark(i,j,i,j)}
  if(moved>.001){G.fed+=moved;var zc=-4-Math.min(19,G.fed/40),cx=-19+(Math.random()-.5)*4.5,cz=zc+(Math.random()-.5)*4;G.deposit(cx,cz,moved,1.4);var q=G.ij(cx,cz);G.relax(q[0]-12,q[1]-12,q[0]+12,q[1]+12,.33,5)}}
/* 겹침 검사 (시험용): 앞·뒤 유닛을 각각 직사각형으로 보고 분리축 검사 */
function obbOf(cx,cz,yaw,hl,hw,off){var c=Math.cos(yaw),s=Math.sin(yaw),x=cx+c*off,z=cz-s*off;return {x:x,z:z,ax:[c,-s],ay:[s,c],hl:hl,hw:hw}}
function obbHit(A,B){var axes=[A.ax,A.ay,B.ax,B.ay],dx=B.x-A.x,dz=B.z-A.z;for(var i=0;i<4;i++){var n=axes[i];
  var ra=A.hl*Math.abs(A.ax[0]*n[0]+A.ax[1]*n[1])+A.hw*Math.abs(A.ay[0]*n[0]+A.ay[1]*n[1]),rb=B.hl*Math.abs(B.ax[0]*n[0]+B.ax[1]*n[1])+B.hw*Math.abs(B.ay[0]*n[0]+B.ay[1]*n[1]);
  if(Math.abs(dx*n[0]+dz*n[1])>ra+rb)return false}return true}
function truckBoxes(t){var o=t.po;return [obbOf(o.ax,o.az,t.yf,2.05,1.5,.07),obbOf(o.gx,o.gz,t.yr,2.85,1.5,.6)]}
function collisions(){var n=0;for(var i=0;i<TRUCKS.length;i++)for(var j=i+1;j<TRUCKS.length;j++){var A=truckBoxes(TRUCKS[i]),B=truckBoxes(TRUCKS[j]);A.forEach(function(a){B.forEach(function(b){if(obbHit(a,b))n++})})}return n}
