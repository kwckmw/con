/* ===================== main: 장비 배치 · 화면 · 조작 ===================== */
/* 먼지 입자 */
var NP=700,pGeo=new T.BufferGeometry(),pPos=new Float32Array(NP*3),pVel=new Float32Array(NP*3),pAge=new Float32Array(NP),pLife=new Float32Array(NP),pIdx=0;
pGeo.setAttribute('position',new T.BufferAttribute(pPos,3));
var pMat=new T.PointsMaterial({color:0xb79a74,size:.42,sizeAttenuation:true,transparent:true,opacity:.7,depthWrite:false}),pts=new T.Points(pGeo,pMat);pts.frustumCulled=false;scene.add(pts);
for(var q0=0;q0<NP;q0++)pPos[q0*3+1]=-999;
function emit(p,n,spread,up,life){for(var i=0;i<n;i++){var k=pIdx++%NP;pPos[k*3]=p.x+(Math.random()-.5)*spread;pPos[k*3+1]=p.y+(Math.random()-.5)*spread*.4;pPos[k*3+2]=p.z+(Math.random()-.5)*spread;
  pVel[k*3]=(Math.random()-.5)*1.4;pVel[k*3+1]=up*(.4+Math.random());pVel[k*3+2]=(Math.random()-.5)*1.4;pAge[k]=0;pLife[k]=life*(.6+Math.random()*.6)}}
function stepParticles(dt){for(var k=0;k<NP;k++){if(pPos[k*3+1]<-900)continue;pAge[k]+=dt;if(pAge[k]>pLife[k]){pPos[k*3+1]=-999;continue}
  pVel[k*3+1]-=(pVel[k*3+1]<0?1.2:3.5)*dt;pPos[k*3]+=pVel[k*3]*dt;pPos[k*3+1]+=pVel[k*3+1]*dt;pPos[k*3+2]+=pVel[k*3+2]*dt}pGeo.attributes.position.needsUpdate=true}

/* 굴삭기 2대: 서측 EX-01은 1단을 -4.8 m까지, 동측 EX-02는 2단을 -6.2 m까지 */
/* 굴삭기 2대: 지상에서 시작해 0.9 m씩 3번 경사로를 따라 내려간다 (단마다 2.4 m 아래까지 판다).
   더 내려가면 지상 트럭까지 덤프 높이가 모자란다 (HX220A 최대 덤프 높이 6.9 m) */
var EX1=new Excavator('EX-01','굴삭기 EX-01 (HX220A)',[[-1.5,0,-3],[4.5,-.9,-3],[10.5,-1.8,-3],[16.5,-2.7,-3]],0,LN,[-99,3]);
var EX2=new Excavator('EX-02','굴삭기 EX-02 (HX220A)',[[32.6,0,9],[26.6,-.9,9],[20.6,-1.8,9],[14.6,-2.7,9]],Math.PI,LS,[3,99]);
var PIT0=Float32Array.from(PITF.h);
var EXS=[EX1,EX2];EXS.forEach(function(E){E.apply();E.rings=swingRings(E)});
setupSite();
/* ---------- 장비 대수 (화면 위 장비 막대에서 조정) ---------- */
var FC={ex:2,dt:6,wx:2,wl:2,sl:2,dz:2,mg:1};
var FDEF=[['ex','크롤러 굴삭기',1,2],['dt','덤프트럭',2,8],['wx','휠 굴삭기',0,3],['wl','휠로더',0,4],['sl','스키드로더',0,3],['dz','도저',0,3],['mg','그레이더',0,2]];
var DTSEQ=6,DTCOL=[0x3d5bd9,0xe0573a,0x2f9e6b,0x8e5bd0,0x0fa3b1,0xd4a017,0xc2528b,0x6b8e23];
function truckSpot(L){var best=-1,bd=15,z0=(L.zone.sIn-20+L.L)%L.L,zl=L.fwd(z0,L.zone.sOut)+6;
  for(var s=0;s<L.L;s+=3){if(L.fwd(z0,s)<zl)continue;var m=1e9;L.trucks.forEach(function(o){m=Math.min(m,L.fwd(s,o.s),L.fwd(o.s,s))});
    [L.sDump].concat(L.trucks.length?[L.trucks[0].sLoad]:[]).forEach(function(q){m=Math.min(m,Math.max(9,Math.min(L.fwd(s,q),L.fwd(q,s)))+(Math.min(L.fwd(s,q),L.fwd(q,s))<10?-99:0))});
    if(m>bd){bd=m;best=s}}return best}
function truckRemove(t){if(t.ex.truck===t)t.ex.truck=null;scene.remove(t.api.root);t.loop.trucks.splice(t.loop.trucks.indexOf(t),1);TRUCKS.splice(TRUCKS.indexOf(t),1);selDel(t)}
function fleetTrucks(){var two=!EX2.off,want={N:two?Math.ceil(FC.dt/2):FC.dt,S:two?Math.floor(FC.dt/2):0};
  [[LN,EX1],[LS,EX2]].forEach(function(q){var L=q[0],E=q[1],live=L.trucks.filter(function(t){return !t.retire}),w=want[L.id];
    while(live.length>w){var t=live.filter(function(t){return t.load===0})[0]||live[live.length-1];t.retire=true;live.splice(live.indexOf(t),1)}
    while(live.length<w){var r=L.trucks.filter(function(t){return t.retire})[0];if(r){r.retire=false;live.push(r);continue}
      var s=truckSpot(L);if(s<0)break;DTSEQ++;var nt=new Truck('DT-'+(DTSEQ<10?'0':'')+DTSEQ,L,E,L,DTCOL[DTSEQ%DTCOL.length],s);selAdd('truck',nt,nt.api.root);live.push(nt)}
    L.trucks.slice().forEach(function(t){if(!t.retire)return;if(t.state==='적재 중'&&t.load>0){if(t.ex.truck===t)t.ex.truck=null;t.go('운반')}
      if(t.load===0&&!t.inZ&&t.state!=='덤프 중')truckRemove(t)})})}
function setCount(k,n){var d=FDEF.filter(function(q){return q[0]===k})[0];n=clamp(n,d[2],k==='dt'&&FC.ex<2?Math.min(4,d[3]):d[3]);FC[k]=n;
  if(k==='ex'){EX2.off=n<2;if(EX2.off){var t=EX2.truck;if(t){if(t.load>0)t.go('운반');else t.state='복귀';EX2.truck=null}if(!EX2.moving){EX2.q=[];EX2.seg=null}EX2.state='운휴';if(driving===EX2)stopDrive();FC.dt=Math.min(FC.dt,4)}else EX2.state='대기';fleetTrucks()}
  else if(k==='dt')fleetTrucks();
  else{var r=setFleet(k,n);r.gone.forEach(selDel);r.made.forEach(function(A){selAdd('fleet',A,A.root)})}
  renderFleet()}
function progress(){return EXS.reduce(function(a,E){return a+(E.k+(E.done?1:sectorPct(E)))/E.st.length},0)/EXS.length}
worker(.6,-6.9,0,null,-.6);worker(36.5,5,0,null,2.4);

/* ---------- 선택 · 호버 ---------- */
var SEL=[];
function selAdd(kind,ref,obj){var s={kind:kind,ref:ref,obj:obj};SEL.push(s);obj.traverse(function(o){o.userData.sel=s});return s}
function selDel(ref){for(var i=SEL.length-1;i>=0;i--)if(SEL[i].ref===ref){if(selected===SEL[i])select(null);if(hover===SEL[i])hover=null;SEL.splice(i,1)}}
EXS.forEach(function(E){selAdd('ex',E,E.root)});TRUCKS.forEach(function(t){selAdd('truck',t,t.api.root)});selAdd('crane',CRANE,CRANE.g);
var ray=new T.Raycaster(),ndc=new T.Vector2(),hover=null,selected=null,label=document.getElementById('label');
var ring=new T.Mesh(new T.RingGeometry(5.2,5.8,56),new T.MeshBasicMaterial({color:0xf08a1c,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
var pin=new T.Mesh(new T.ConeGeometry(.6,1.4,16),new T.MeshStandardMaterial({color:0xf08a1c,emissive:0xf08a1c,emissiveIntensity:.4}));pin.rotation.x=Math.PI;pin.visible=false;scene.add(pin);
function tint(s,on){s.obj.traverse(function(o){var m=o.material;if(!o.isMesh||!m||!m.emissive||m.userData.lamp)return;if(on){if(m.userData.e0===undefined){m.userData.e0=m.emissive.getHex();m.userData.ei0=m.emissiveIntensity}m.emissive.setHex(0x6a4512);m.emissiveIntensity=.35}
  else if(m.userData.e0!==undefined){m.emissive.setHex(m.userData.e0);m.emissiveIntensity=m.userData.ei0}})}
function pick(e){var r=cv.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);
  var h=ray.intersectObjects(SEL.map(function(s){return s.obj}),true);for(var i=0;i<h.length;i++){var s=h[i].object.userData.sel;if(s)return s}return null}
cv.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||driving)return;var s=pick(e);if(s!==hover){if(hover&&hover!==selected)tint(hover,false);hover=s;if(s&&s!==selected)tint(s,true)}
  if(s){label.style.display='block';label.textContent=s.ref.name;label.style.left=e.clientX+'px';label.style.top=e.clientY+'px'}else label.style.display='none'});
var downAt=null;cv.addEventListener('pointerdown',function(e){downAt={x:e.clientX,y:e.clientY};if(tour.on)stopTour()});
cv.addEventListener('pointerup',function(e){if(!downAt||driving)return;var d=Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y);downAt=null;if(d>6)return;select(pick(e))});
var camGoal=null,distGoal=null,follow=true;
function select(s){if(selected)tint(selected,false);selected=s;if(s){tint(s,true);camGoal=true;follow=true;distGoal=s.kind==='crane'?95:s.kind==='ex'?34:s.kind==='fleet'&&s.ref.kind==='mg'?40:30}ring.visible=pin.visible=!!s;renderPanel(true)}
document.getElementById('search').addEventListener('change',function(){var q=this.value.trim().toUpperCase();var s=SEL.find(function(s){return (s.ref.id||'').indexOf(q)>=0});if(s)select(s)});

/* ---------- 패널 · 트래커 · KPI ---------- */
var panel=document.getElementById('panel'),diag=null;
function fmtT(t){var h=Math.floor(t/3600)%24,m=Math.floor(t/60)%60;return (h<10?'0':'')+h+':'+(m<10?'0':'')+m}
function avg(a){return a.length?a.reduce(function(x,y){return x+y},0)/a.length:0}
function sectorPct(E){var V=0,W=0,s=E.st[E.k];for(var si=-11;si<=4;si++)for(var rc=3.6;rc<=7.81;rc+=.4){var w=E.w(si*7.5*D2R,rc,0,{}),h=PITF.sample(w.x,w.z);if(h===null||(w.z-E.zlim[0])*(w.z-E.zlim[1])>0)continue;var d=E.design(w.x,w.z);if(d>=s.y+.3)continue;V+=1;W+=clamp((s.y-h)/(s.y-d),0,1)}return V?W/V:1}
function renderPanel(full){
  if(!selected){panel.classList.add('empty');if(full||!panel.firstChild)panel.innerHTML='<h2>장비를 선택해 보세요</h2><p>장비를 누르면 상태와 실시간 값이 나옵니다. 위쪽 장비 막대의 − / + 로 종류별 대수를 바꿀 수 있고, 크롤러 굴삭기를 고르면 <b>직접 운전</b>도 할 수 있어요.</p>';return}
  panel.classList.remove('empty');var s=selected,r=s.ref,html;
  if(s.kind==='ex'){KIN.fk(r.p,_fk);var depth=r.tipW.y;
    html='<h2>'+r.name+'</h2><span class="st">'+(r.manual?'직접 운전':r.state)+'</span><div class="prog"><i style="width:'+(r.seg?Math.min(100,r.seg.t/(r.seg.dur||1)*100):0).toFixed(0)+'%"></i></div>'+
    '<dl><div><dt>펌프 압력</dt><dd>'+r.press.toFixed(1)+' MPa</dd></div><div><dt>선회각</dt><dd>'+Math.round(r.p.sw/D2R)+'°</dd></div>'+
    '<div><dt>버킷 적재</dt><dd>'+Math.round(r.fill/BANKCAP*100)+'%</dd></div><div><dt>날 끝 높이</dt><dd>'+depth.toFixed(2)+' m</dd></div>'+
    '<div><dt>완료 사이클</dt><dd>'+r.cycles+'</dd></div><div><dt>평균 사이클</dt><dd>'+(avg(r.cycT)||0).toFixed(1)+' 초</dd></div>'+
    '<div><dt>굴착량</dt><dd>'+r.dug.toFixed(1)+' m³</dd></div><div><dt>구간 완료</dt><dd>'+Math.round(sectorPct(r)*100)+'%</dd></div>'+
    '<div><dt>위치 · 목표</dt><dd>'+r.k+'단 '+r.y.toFixed(1)+' → '+r.target.toFixed(1)+' m</dd></div><div><dt>연료</dt><dd>'+r.fuel.toFixed(1)+' L</dd></div></dl><canvas id="diag" width="560" height="220"></canvas>'+
    '<div class="act">'+(r.done?'<button id="bReset">구덩이 초기화</button>':'')+'<button id="bDrive">'+(r.manual?'자동으로 돌아가기':'직접 운전')+'</button><button class="ghost" id="bRing">안전반경 '+(r.rings.visible?'끄기':'보기')+'</button></div>'+
    '<p>지상(0단)에서 시작해 자기 앞에 경사로와 받침면을 파 놓고, 구간을 다 파면 경사로를 따라 0.9 m 아래 다음 단으로 내려간다. 3단(-2.7 m)까지 내려가며 단마다 2.4 m 아래까지 판다. 트럭은 계속 지상에서 받는다.</p>'}
  else if(s.kind==='truck'){var art=Math.round(angDiff(r.yr||0,r.yf||0)/D2R);
    html='<h2>'+r.name+' (HA30A)</h2><span class="st">'+r.state+'</span><div class="prog"><i style="width:'+(r.load/ADT.CAP*100).toFixed(0)+'%"></i></div>'+
    '<dl><div><dt>적재 (흐트러진)</dt><dd>'+r.load.toFixed(1)+' m³</dd></div><div><dt>적재 중량</dt><dd>'+(r.load*ADT.RHO).toFixed(1)+' / 28 t</dd></div>'+
    '<div><dt>속도</dt><dd>'+(r.v*3.6).toFixed(1)+' km/h</dd></div><div><dt>굴절각</dt><dd>'+art+'°</dd></div>'+
    '<div><dt>덤프각</dt><dd>'+Math.round(r.api.tip/D2R)+'°</dd></div><div><dt>운반 횟수</dt><dd>'+r.trips+'</dd></div>'+
    '<div><dt>대기 누적</dt><dd>'+(r.waitAcc/60).toFixed(1)+' 분</dd></div><div><dt>ETA</dt><dd>'+eta(r)+'</dd></div></dl>'+
    '<p>'+(r.loop===LN?'북측':'남측')+' 운반로. '+(r.loop===LN?'EX-01':'EX-02')+'에서 16.8 m³까지 받고 크레인 앞 공용 덤프로에서 뒤로 쏟는다. 합류 구간은 한 번에 한 운반로만 들어가고, 앞차와 정지 간격은 5 m 이상. 조향은 굴절식.</p>'}
  else if(s.kind==='fleet'){var K=r.kind,ld=K==='wl'?r.load.toFixed(1)+' / 3.0 m³':K==='dz'?r.load.toFixed(1)+' m³ (블레이드 앞)':K==='sl'?r.load.toFixed(2)+' m³':K==='wx'?Math.round(r.load/.72*100)+'%':'-';
    html='<h2>'+r.name+'</h2><span class="st">'+r.state+'</span><div class="prog"><i style="width:'+Math.round((r.loadF!==undefined?r.loadF:r.load/.72)*100)+'%"></i></div>'+
    '<dl><div><dt>속도</dt><dd>'+(r.v*3.6).toFixed(1)+' km/h</dd></div><div><dt>적재</dt><dd>'+ld+'</dd></div>'+
    '<div><dt>'+(K==='mg'||K==='dz'?'작업 횟수(패스)':'작업 횟수(사이클)')+'</dt><dd>'+r.count+'</dd></div><div><dt>누적 작업량</dt><dd>'+r.vol.toFixed(1)+' m³</dd></div>'+
    '<div><dt>주행 거리</dt><dd>'+(r.dist/1000).toFixed(2)+' km</dd></div><div><dt>연료</dt><dd>'+r.fuel.toFixed(1)+' L</dd></div>'+
    '<div><dt>'+({wl:'성토 계획고',dz:'성토 계획고',mg:'노반 정지율',sl:'관로 구간',wx:'관로 구간'})[K]+'</dt><dd>'+(K==='wl'||K==='dz'?PADLVL.toFixed(1)+' m ('+Math.round(padFrac()*100)+'%)':K==='mg'?Math.round(bedFrac()*100)+'%':(K==='wx'?r.seg0.i+1:r.idx%3+1)+'구간')+'</dd></div>'+
    '<div><dt>위치</dt><dd>'+r.x.toFixed(0)+', '+r.z.toFixed(0)+'</dd></div></dl>'+
    '<p>'+({wl:'토사 적치장에서 3 m³씩 퍼서 후진 → 방향 전환 → 전진하는 Y자 주행으로 성토장 띠 끝에 붓는다. 도저가 작업 중인 띠는 피한다.',
      dz:'맡은 띠 끝에 쌓인 흙을 블레이드로 밀며 계획고(층 두께 0.3 m)에 맞춰 낮은 곳을 메운다. 한 층이 차면 다음 층으로 올라간다.',
      mg:'거친 노반을 줄지어 왕복하며 0 높이로 고른다. 블레이드를 비스듬히 돌려 흙을 옆으로 흘린다. 고른 자리는 색이 밝아진다.',
      sl:'모래 칸에서 0.45 m³씩 퍼서 휠 굴삭기가 파 놓은 관로 바닥에 기초 모래를 깐다. 굴삭기 작업 반경 밖(11 m 이상)에서만 접근한다.',
      wx:'아웃트리거와 블레이드를 내리고 깊이 1.6 m 관로를 판다. 흙은 옆에 쌓고, 앞을 다 파면 다리를 접고 2.2 m 물러난다.'})[K]+'</p>'}
  else{var e=CRS.el;html='<h2>'+r.name+'</h2><span class="st">'+r.phase+'</span><div class="prog"><i style="width:'+(BLD.next/BLD.els.length*100).toFixed(0)+'%"></i></div>'+
    '<dl><div><dt>작업 반경</dt><dd>'+r.r.toFixed(1)+' m</dd></div><div><dt>훅 높이</dt><dd>'+r.h.toFixed(1)+' m</dd></div><div><dt>선회각</dt><dd>'+Math.round(((r.th/D2R)%360+360)%360)+'°</dd></div>'+
    '<div><dt>인양물</dt><dd style="font-size:12px">'+(r.load||'-')+'</dd></div><div><dt>현재 층</dt><dd>'+Math.min(BLD.FL,(e?e.f:BLD.FL-1)+1)+' / '+BLD.FL+'층</dd></div><div><dt>거치 부재</dt><dd>'+BLD.next+' / '+BLD.els.length+'</dd></div></dl>'+
    '<p>야적장의 PC 기둥(층당 20개)과 슬래브(층당 6장)를 들어 올려 골조를 쌓는다. 줄걸이 → 인양 → 선회·횡행 → 거치 하강 → 고정 순서.</p>'}
  if(full||!panel.firstChild){panel.innerHTML=html;diag=document.getElementById('diag');var bd=document.getElementById('bDrive');if(bd)bd.onclick=function(){if(r.manual)stopDrive();else startDrive(r)};
    var bz=document.getElementById('bReset');if(bz)bz.onclick=function(){PITF.h.set(PIT0);PITF.mark(0,0,PITF.nx-1,PITF.nz-1);EXS.forEach(function(E){E.resetTo0()});renderPanel(true)};var br=document.getElementById('bRing');if(br)br.onclick=function(){r.rings.visible=!r.rings.visible;renderPanel(true)}}
  else{var tmp=document.createElement('div');tmp.innerHTML=html;var a=panel.querySelectorAll('dd,.st,.prog i'),b=tmp.querySelectorAll('dd,.st,.prog i');for(var i=0;i<a.length&&i<b.length;i++){if(a[i].tagName==='I')a[i].style.width=b[i].style.width;else if(a[i].textContent!==b[i].textContent)a[i].textContent=b[i].textContent}}
  if(s.kind==='ex'&&diag)drawDiag(r)}
function eta(t){if(t.state==='적재 중')return Math.ceil((ADT.CAP-t.load)/.92*avgCyc()/60)+'분 후 출발';if(t.state==='대기')return '줄 서는 중';if(t.state==='덤프 중')return Math.ceil((24-t.tipT)/60*10)/10+'분';
  var d=t.loop.fwd(t.s,t.target());return Math.max(0,d/Math.max(2.5,t.v||4)/60).toFixed(1)+'분'}
function avgCyc(){var a=[].concat(EX1.cycT,EX2.cycT);return avg(a)||18}
function drawDiag(E){var c=diag.getContext('2d'),W=diag.width,H=diag.height,f=KIN.fk(E.p,{}),oy=E.y;c.clearRect(0,0,W,H);
  var sx=Math.min(W/14,H/11),X=function(x){return 40+(x+2.5)*sx},Y=function(y){return H*.62-y*sx};
  /* 붐 평면을 따라 현재 바닥 단면 */
  c.beginPath();c.moveTo(X(-2.5),Y(0));for(var x=-2.5;x<=11;x+=.2){var w=E.w(E.p.sw,x,0,{}),h=PITF.sample(w.x,w.z);c.lineTo(X(x),Y((h===null?0:h)-oy))}c.lineTo(X(11),H);c.lineTo(X(-2.5),H);c.closePath();
  c.fillStyle='rgba(143,111,77,.35)';c.fill();c.strokeStyle='#8a7a6a';c.lineWidth=2;c.stroke();
  c.strokeStyle='rgba(224,87,58,.7)';c.setLineDash([6,5]);c.beginPath();c.moveTo(X(3),Y(E.target-oy));c.lineTo(W,Y(E.target-oy));c.stroke();c.setLineDash([]);
  c.fillStyle='#3f4146';c.fillRect(X(-2.2),Y(1),X(2.2)-X(-2.2),Y(0)-Y(1));c.fillStyle='#f0b12e';c.fillRect(X(-2.7),Y(3),X(1.3)-X(-2.7),Y(1.05)-Y(3));
  c.lineCap='round';c.lineJoin='round';c.strokeStyle='#4a4c51';c.lineWidth=9;c.beginPath();c.moveTo(X(HXD.F[0]),Y(HXD.F[1]));c.lineTo(X(f.tx),Y(f.ty));c.lineTo(X(f.bx),Y(f.by));c.stroke();
  c.strokeStyle='#f08a1c';c.lineWidth=7;c.beginPath();c.moveTo(X(f.bx),Y(f.by));c.lineTo(X(f.x),Y(f.y));c.stroke();
  c.fillStyle=getComputedStyle(document.body).color;c.font='600 19px system-ui';c.fillText('붐 방향 단면 · 빨간 점선 = 이 단의 목표 '+E.target.toFixed(1)+' m',12,26)}
var COLS=[['대기 · 진입',['진입','대기','복귀']],['적재 중',['적재 중']],['운반',['운반','합류 대기']],['덤프 중',['덤프 중']],['굴삭기',[]],['토공 · 정지',[]]];
var colsEl=document.getElementById('cols');colsEl.innerHTML=COLS.map(function(c,i){return '<div class="col"><h3>'+c[0]+'</h3><div id="col'+i+'"></div></div>'}).join('');
colsEl.addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(b)select(SEL.find(function(s){return s.ref.id===b.dataset.t}))});
function hex(c){return '#'+c.toString(16).padStart(6,'0')}
function renderTracker(){var mob=innerWidth<900;COLS.forEach(function(c,i){var h;
  if(i===4)h=EXS.map(function(E){return '<div class="tk" data-t="'+E.id+'"><i style="background:#f0a41f"></i>'+(mob?E.id.slice(3):E.id)+'<span>'+(E.manual?'직접':E.state)+'</span></div>'}).join('');
  else if(i===5)h=FLEET.map(function(A){return '<div class="tk" data-t="'+A.id+'"><i style="background:#d48c12"></i>'+(mob?A.id.replace('-0',''):A.id)+'<span>'+A.state+'</span></div>'}).join('');
  else h=TRUCKS.filter(function(t){return c[1].indexOf(t.state)>=0}).map(function(t){return '<div class="tk" data-t="'+t.id+'"><i style="background:'+hex(t.tag)+'"></i>'+(mob?t.id.slice(3):t.id)+'<span>'+eta(t)+'</span></div>'}).join('');
  var el=document.getElementById('col'+i);if(el.innerHTML!==h)el.innerHTML=h})}
function setV(id,v,u){var el=document.getElementById(id),s=v+'<small> '+u+'</small>';if(el.innerHTML!==s)el.innerHTML=s}
function renderKPI(){var dug=EX1.dug+EX2.dug,pg=progress();setV('k1',dug.toFixed(1),'m³');document.getElementById('k1b').style.width=(pg*100)+'%';
  setV('k2',DELIV.toFixed(1),'m³');setV('k3',(avgCyc()).toFixed(1),'초');
  setV('k4',(TRUCKS.reduce(function(a,t){return a+t.waitAcc},0)/60).toFixed(1),'분');setV('k5',BLD.next,'/ '+BLD.els.length+' 부재');document.getElementById('k5b').style.width=(BLD.next/BLD.els.length*100)+'%';
  setV('k6',(EX1.fuel+EX2.fuel+TRUCKS.reduce(function(a,t){return a+t.odo},0)/1000*1.9).toFixed(1),'L');
  var d=pg;document.querySelector('#depth i').style.width=(d*100)+'%';document.getElementById('depthV').textContent=(d*100).toFixed(1)+'%';
  document.getElementById('clock').textContent=fmtT(simT)}
var alerts=[],seen={};
function addAlert(key,msg){if(seen[key])return;seen[key]=1;alerts.unshift({t:simT,msg:msg});alerts=alerts.slice(0,12);renderAlerts()}
function renderAlerts(){document.getElementById('alertN').textContent=alerts.length;document.getElementById('alertBox').innerHTML=alerts.length?alerts.map(function(a){return '<p><b style="font-family:var(--mono)">'+fmtT(a.t)+'</b> '+a.msg+'</p>'}).join(''):'<p>알림 없음</p>'}
document.getElementById('alertBtn').addEventListener('click',function(){document.getElementById('alertBox').classList.toggle('open')});renderAlerts();
var doneT=0;function autoReset(dt){if(EXS.every(function(E){return E.done||E.off})&&EXS.some(function(E){return E.done})){doneT+=dt;if(doneT>180){doneT=0;PITF.h.set(PIT0);PITF.mark(0,0,PITF.nx-1,PITF.nz-1);YARDP.h.set(YARD0);YARDP.fed=0;YARDP.mark(0,0,YARDP.nx-1,YARDP.nz-1);EXS.forEach(function(E){if(E.truck){E.truck.state='복귀';E.truck=null}E.resetTo0()});
    alerts.unshift({t:simT,msg:'굴착 블록 완료 → 다음 블록으로 (시연용으로 구덩이와 야적장을 처음 상태로 되돌림)'});renderAlerts()}}else doneT=0}
function checkAlerts(){TRUCKS.forEach(function(t){if(t.state==='대기'){t.qT=(t.qT||0)+.2*speedX;if(t.qT>300)addAlert('q'+t.id+Math.floor(simT/1800),t.id+' 5분 넘게 적재 대기 중 (굴삭기가 병목)')}else t.qT=0});
  EXS.forEach(function(E){if(E.done)addAlert('done'+E.id+Math.floor(simT/3600),E.id+' 마지막 단('+E.y.toFixed(1)+' m)까지 굴착 완료');
    TRUCKS.forEach(function(t){var d=Math.hypot(t.po.gx-E.x,t.po.gz-E.z);if(d<2.95+1.5)addAlert('sw'+E.id+t.id+Math.floor(simT/600),t.id+'이(가) '+E.id+' 후방 선회 반경에 근접')})});
  if(BLD.next>0&&BLD.next%26===0)addAlert('fl'+BLD.next,'골조 '+(BLD.next/26)+'층 완료')}

/* ---------- 속도 · 주야간 · 안전반경 ---------- */
var speedX=4;
document.querySelectorAll('[data-sp]').forEach(function(b){b.addEventListener('click',function(){speedX=+b.dataset.sp;document.querySelectorAll('[data-sp]').forEach(function(x){x.classList.toggle('on',x===b)})})});
var night=false,nightK=0;
/* ---------- 장비 막대 ---------- */
var FICON={ex:'<rect x="3" y="14" width="17" height="5" rx="2.5"/><rect x="6" y="8" width="9" height="6" rx="1"/><path d="M13 10 22 3 29 9 27 15 23 15 25 10 21.5 6.5 15 12Z"/>',
  dt:'<rect x="24" y="7" width="7" height="8" rx="1"/><path d="M2 6h21l-2 9H5Z"/><circle cx="7" cy="16.5" r="3"/><circle cx="15" cy="16.5" r="3"/><circle cx="27" cy="16.5" r="3"/>',
  wx:'<circle cx="6" cy="16.5" r="3"/><circle cx="17" cy="16.5" r="3"/><rect x="3" y="12" width="17" height="3"/><rect x="6" y="6.5" width="9" height="6" rx="1"/><path d="M13 9 22 2.5 29 8.5 27 14.5 23 14.5 25 9.5 21.5 6 15 11Z"/>',
  wl:'<circle cx="8" cy="15.5" r="4"/><circle cx="20" cy="15.5" r="4"/><rect x="3" y="8" width="11" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/><path d="M14 9 25 11 26 7 32 9 30 17 25 17 24 13 14 12Z"/>',
  sl:'<circle cx="9" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><rect x="6" y="5" width="13" height="9" rx="1.5"/><path d="M7 6 21 6 24 12 30 13 29 18 24 18 21 9 7 8Z"/>',
  dz:'<rect x="7" y="14" width="20" height="5" rx="2.5"/><rect x="10" y="8" width="14" height="6" rx="1"/><rect x="13" y="3" width="7" height="6" rx="1"/><path d="M29 7h2.5v12H29Z"/><path d="M24 14h6v2h-6Z"/><path d="M3 10h4v2H5v6H3Z"/>',
  mg:'<circle cx="5" cy="16.5" r="3"/><circle cx="12" cy="16.5" r="3"/><circle cx="30" cy="16.5" r="2.6"/><rect x="2" y="9" width="10" height="5" rx="1"/><rect x="9" y="3" width="6" height="7" rx="1"/><path d="M14 7 31 10v3L14 10Z"/><path d="M18 13 24 13 25 18 17 18Z"/>'};
var fleetEl=document.getElementById('fleet');
function renderFleet(){fleetEl.innerHTML=FDEF.map(function(d){var k=d[0],n=FC[k],mx=k==='dt'&&FC.ex<2?4:d[3];return '<div class="fl" data-k="'+k+'" title="'+d[1]+'"><svg viewBox="0 0 34 20" aria-hidden="true">'+FICON[k]+'</svg><span>'+d[1]+'</span><button data-d="-1" aria-label="'+d[1]+' 한 대 줄이기"'+(n<=d[2]?' disabled':'')+'>−</button><b>'+n+'</b><button data-d="1" aria-label="'+d[1]+' 한 대 늘리기"'+(n>=mx?' disabled':'')+'>+</button></div>'}).join('')}
fleetEl.addEventListener('click',function(e){var b=e.target.closest('button[data-d]');if(!b||b.disabled)return;var k=b.parentNode.dataset.k;setCount(k,FC[k]+(+b.dataset.d))});
['wx','wl','sl','dz','mg'].forEach(function(k){setCount(k,FC[k])});renderFleet();document.getElementById('night').addEventListener('click',function(){night=!night;this.classList.toggle('on',night);this.textContent=night?'주간':'야간';document.body.classList.toggle('night',night)});
document.getElementById('ringBtn').addEventListener('click',function(){var on=!EX1.rings.visible;EXS.forEach(function(E){E.rings.visible=on});this.classList.toggle('on',on);if(selected&&selected.kind==='ex')renderPanel(true)});
function applyNight(dt){nightK+=((night?1:0)-nightK)*Math.min(1,dt*2);var n=nightK;
  scene.background.copy(SKY_D).lerp(SKY_N,n);scene.fog.color.copy(scene.background);hemi.intensity=.95-.72*n;sun.intensity=.7-.62*n;fillL.intensity=.28-.24*n;
  TOWERS.forEach(function(L){L.intensity=2.4*n});towerMat.emissiveIntensity=2*n;EXS.forEach(function(E){E.api.lampMat.emissiveIntensity=3*n});TM.LAMP.emissiveIntensity=.2+2.2*n}

/* ---------- 직접 운전 (3단계) ---------- */
var driving=null,cabView=false,keys={},stick={l:[0,0],r:[0,0]};
function startDrive(E){if(driving)stopDrive();driving=E;E.manual=true;E.q=[];E.seg=null;E.mPress=5;document.getElementById('drive').classList.add('on');document.body.classList.add('driving');
  document.getElementById('dName').textContent=E.id+' 직접 운전';if(tour.on)stopTour();select(SEL.find(function(s){return s.ref===E}));renderPanel(true)}
function stopDrive(){if(!driving)return;var E=driving;E.manual=false;driving=null;cabView=false;document.getElementById('dView').textContent='운전석 시점';document.getElementById('drive').classList.remove('on');document.body.classList.remove('driving');
  controls.enabled=true;camGoal=true;distGoal=34;renderPanel(true)}
document.getElementById('dExit').onclick=stopDrive;
document.getElementById('dView').onclick=function(){cabView=!cabView;this.textContent=cabView?'관찰 시점':'운전석 시점';controls.enabled=!cabView;if(!cabView){camGoal=true;distGoal=26}};
document.getElementById('dSend').onclick=function(){var E=driving;if(E&&E.truck&&E.truck.load>0){E.truck.go('운반');E.truck=null;E.pass=0}};
addEventListener('keydown',function(e){if(!driving||e.target.tagName==='INPUT')return;keys[e.key.toLowerCase()]=1;if(e.key.indexOf('Arrow')===0)e.preventDefault()});
addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=0});
['l','r'].forEach(function(side){var el=document.getElementById(side==='l'?'stL':'stR'),kn=el.querySelector('.knob'),id=null;
  function mv(e){var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2-20,dx=e.clientX-cx,dy=e.clientY-cy,l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}
    kn.style.transform='translate('+dx+'px,'+dy+'px)';stick[side]=[dx/R,dy/R]}
  el.addEventListener('pointerdown',function(e){id=e.pointerId;el.setPointerCapture(id);mv(e);e.stopPropagation()});
  el.addEventListener('pointermove',function(e){if(e.pointerId===id)mv(e)});
  function up(e){if(e.pointerId!==id)return;id=null;kn.style.transform='';stick[side]=[0,0]}el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
function driveStep(dt){var E=driving;if(!E)return;
  /* ISO 방식: 왼손 앞뒤=암, 좌우=선회 / 오른손 앞뒤=붐, 좌우=버킷 */
  var sw=stick.l[0]+((keys.d?1:0)-(keys.a?1:0)),arm=-stick.l[1]+((keys.w?1:0)-(keys.s?1:0)),boom=stick.r[1]+((keys.arrowdown?1:0)-(keys.arrowup?1:0)),bk=stick.r[0]+((keys.arrowright?1:0)-(keys.arrowleft?1:0));
  sw=clamp(sw,-1,1);arm=clamp(arm,-1,1);boom=clamp(boom,-1,1);bk=clamp(bk,-1,1);
  var L=KIN.LIM,p=E.p;p.sw-=sw*.75*dt;p.a=clamp(p.a+arm*.45*dt,L[1][0],L[1][1]);p.b=clamp(p.b+boom*.3*dt,L[0][0],L[0][1]);p.k=clamp(p.k+bk*.8*dt,L[2][0],L[2][1]);
  E.mPress=4+Math.abs(sw)*14+Math.abs(arm)*20+Math.abs(boom)*22+Math.abs(bk)*16+(E.tipW.y<(PITF.sample(E.tipW.x,E.tipW.z)||-99)?8:0);
  E.state=Math.abs(sw)>.1?'선회':Math.abs(boom)+Math.abs(arm)+Math.abs(bk)>.1?'작업':'정지';
  if(E.fill>.02&&E.chi>-60*D2R)E.release();
  document.getElementById('dFill').textContent=Math.round(E.fill/BANKCAP*100)+'%';var hs=PITF.sample(E.tipW.x,E.tipW.z);document.getElementById('dDepth').textContent=(E.tipW.y).toFixed(2)+' m'+(hs!==null&&E.tipW.y<hs?' (굴착 중)':'')}

/* ---------- 투어 (3단계) ---------- */
var tour={on:false,i:0,t:0,cp:new V3(),ct:new V3()};
var tourTag=document.getElementById('tourTag');
var SHOTS=[
  {n:'현장 전경',d:9,f:function(u,p,t){p.set(-80+u*40,70-u*10,90-u*30);t.set(8,0,0)}},
  {n:'EX-01 · 서측 굴착',d:9,f:function(u,p,t){var a=-.6+u*1.4;p.set(EX1.x+Math.cos(a)*15,8,EX1.z+Math.sin(a)*15);t.set(EX1.x+3,0,EX1.z-2)}},
  {n:'HA30A 운반 따라가기',d:9,f:function(u,p,t){var tr=TRUCKS.filter(function(x){return x.loop===LN}).sort(function(a,b){return b.v-a.v})[0];var o=tr.po,yaw=tr.yr;p.set(o.gx-Math.cos(yaw)*14+Math.sin(yaw)*6,7,o.gz+Math.sin(yaw)*14+Math.cos(yaw)*6);t.set(o.ax,1.5,o.az)}},
  {n:'크레인 앞 덤프로 · 사토 야적장',d:8,f:function(u,p,t){p.set(-4-u*8,13,16);t.set(-19,1,-4)}},
  {n:'타워크레인 · PC 골조',d:10,f:function(u,p,t){var h=new V3();craneHookWorld(h);p.set(-2-u*6,h.y+6,40);t.set(h.x*.5-8,h.y*.6+4,h.z*.5+11)}},
  {n:'EX-02 · 동측 2단 굴착',d:9,f:function(u,p,t){var a=2.2+u*1.2;p.set(EX2.x+Math.cos(a)*16,9,EX2.z+Math.sin(a)*16);t.set(EX2.x-3,-1,EX2.z+2)}},
  {n:'구덩이 위로',d:8,f:function(u,p,t){p.set(lerp(36,-2,u),9,-14);t.set(lerp(30,4,u),-3,4)}},
  {n:'동측 확장 구역 전경',d:9,f:function(u,p,t){p.set(lerp(60,150,u),62,74);t.set(lerp(84,118,u),0,0)}},
  {n:'성토장 · 휠로더와 도저',d:10,f:function(u,p,t){p.set(lerp(128,96,u),15,lerp(8,-46,u));t.set(100,1,-18)}},
  {n:'노반 정지 · 그레이더',d:9,f:function(u,p,t){var g=FLEET.filter(function(A){return A.kind==='mg'})[0],x=g?g.x:100,z=g?g.z:12;p.set(x+16,8,z+15);t.set(x+2,.8,z)}},
  {n:'관로 굴착 · 휠 굴삭기와 스키드로더',d:10,f:function(u,p,t){var g=FLEET.filter(function(A){return A.kind==='wx'})[0],x=g?g.x:80;p.set(x+lerp(20,6,u),9,45);t.set(x+5,0,28)}}];
function startTour(){tour.on=true;document.body.classList.add('touring');tour.i=0;tour.t=0;controls.enabled=false;select(null);document.getElementById('tourBtn').classList.add('on');tourTag.style.display='block'}
function stopTour(){tour.on=false;document.body.classList.remove('touring');controls.enabled=!cabView;document.getElementById('tourBtn').classList.remove('on');tourTag.style.display='none'}
document.getElementById('tourBtn').addEventListener('click',function(){if(tour.on)stopTour();else startTour()});
var _tp=new V3(),_tt=new V3();
function tourStep(dt){var S=SHOTS[tour.i];tour.t+=dt;var u=Math.min(1,tour.t/S.d);S.f(u,_tp,_tt);var k=tour.t<1.6&&tour.i+tour.t>0?sm(tour.t/1.6):1;
  if(tour.t<dt*1.5&&tour.first!==false){camera.position.copy(_tp);controls.target.copy(_tt);tour.first=false}
  camera.position.lerp(_tp,k<1?.06:.2);controls.target.lerp(_tt,k<1?.06:.2);camera.lookAt(controls.target);tourTag.textContent='투어 '+(tour.i+1)+'/'+SHOTS.length+' · '+S.n;
  if(tour.t>=S.d){tour.i=(tour.i+1)%SHOTS.length;tour.t=0}}

/* ---------- 루프 ---------- */
function resize(){var w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?42:30;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
controls.addEventListener('start',function(){camGoal=null;distGoal=null;follow=false});
var fleetT=0;
function simAdvance(dt){var n=Math.ceil(dt/.05),sdt=dt/n;for(var i=0;i<n;i++){simT+=sdt;EXS.forEach(function(E){if(!E.off)E.step(sdt)});autoReset(sdt);TRUCKS.slice().forEach(function(t){t.step(sdt)});stepCrane(sdt);spreadPiles(sdt);stepSite2(sdt);
    fleetT+=sdt;if(fleetT>1){fleetT=0;fleetTrucks()}}}
function surfaces(){PITF.update();YARDP.update();TRUCKS.forEach(function(t){t.api.heap.update()});HF2.forEach(function(h){h.update()})}
var last=performance.now(),uiT=0,bl=0,dv=new V3(),cpos=new V3(),surfT=0,_cab=new V3(),_fw=new V3();
function frame(now){requestAnimationFrame(frame);var rdt=Math.min(.05,(now-last)/1000);last=now;var dt=driving?rdt:rdt*speedX;
  if(driving)driveStep(rdt);
  simAdvance(dt);applyNight(rdt);stepCars(rdt);stepParticles(rdt);craneRender(now/1000);crewUpdate();
  surfT+=rdt;if(surfT>.12){surfT=0;surfaces()}
  bl+=rdt;TM.BEACON.emissiveIntensity=(Math.sin(bl*8)>0?2.2:0)*Math.max(.35,nightK);
  if(driving&&cabView){var E=driving,yw=E.yaw+E.p.sw,c=Math.cos(yw),s=Math.sin(yw);_cab.set(E.x+c*.35+s*-.87,2.42+E.y,E.z-s*.35+c*-.87);camera.position.copy(_cab);
    _fw.set(E.x+c*8+s*-.3,E.y-.6,E.z-s*8+c*-.3);controls.target.copy(_fw);camera.lookAt(_fw);if(camera.fov!==62){camera.fov=62;camera.updateProjectionMatrix()}}
  else if(camera.fov===62){resize()}
  else if(tour.on)tourStep(rdt);
  else if(selected){selected.obj.getWorldPosition(cpos);if(selected.kind==='truck'){cpos.set(selected.ref.po.ax*.4+selected.ref.po.gx*.6,0,selected.ref.po.az*.4+selected.ref.po.gz*.6)}
    ring.position.set(cpos.x,.08,cpos.z);ring.material.opacity=.55+.3*Math.sin(now/300);pin.position.set(cpos.x,(selected.kind==='crane'?38:selected.kind==='ex'||selected.kind==='fleet'&&selected.ref.kind==='wx'?6.5:5.4)+Math.sin(now/400)*.3,cpos.z);
    if(follow&&selected.kind!=='crane'){var tgt=cpos.clone();tgt.y=1.5;var prev=controls.target.clone();controls.target.lerp(tgt,Math.min(1,rdt*(camGoal?3:2)));camera.position.add(dv.subVectors(controls.target,prev))}
    if(camGoal){dv.copy(camera.position).sub(controls.target);var cd=dv.length();dv.setLength(cd+(distGoal-cd)*Math.min(1,rdt*3));camera.position.copy(controls.target).add(dv);if(Math.abs(distGoal-cd)<.3)camGoal=null}}
  if(!tour.on&&!(driving&&cabView))controls.update();
  renderer.render(scene,camera);
  uiT+=rdt;if(uiT>.2){uiT=0;renderKPI();renderTracker();renderPanel(false);checkAlerts()}}
requestAnimationFrame(frame);
window.GL={tpos:function(i){var o=TRUCKS[i].po;return [o.ax,o.az,o.gx,o.gz,TRUCKS[i].yf]},step:function(s){simAdvance(s);surfaces();renderKPI();renderTracker();renderPanel(false)},speed:function(x){speedX=x},night:function(){document.getElementById('night').click()},
  cam:function(p,q){camera.position.set(p[0],p[1],p[2]);controls.target.set(q[0],q[1],q[2]);controls.update()},select:function(id){select(SEL.find(function(s){return s.ref.id===id})||null)},
  fleet:function(k,n){setCount(k,n);return FC},fc:function(){return {fc:FC,trucks:TRUCKS.length,fleet:FLEET.map(function(A){return A.id+':'+A.state+':'+A.count+':'+A.vol.toFixed(1)+':'+A.x.toFixed(1)+','+A.z.toFixed(1)}),pad:[PADLVL,+padFrac().toFixed(2),+PADF.total().toFixed(0)],bor:+BORF.total().toFixed(0),bed:+bedFrac().toFixed(3),tr:TSEG.map(function(g){return +g.bedX.toFixed(1)})}},
  state:function(){return {k:EXS.map(function(E){return E.k}),zn:ZONE.n+(ZONE.loop?ZONE.loop.id:''),t:fmtT(simT),dug:+(EX1.dug+EX2.dug).toFixed(2),deliv:+DELIV.toFixed(1),ex:EXS.map(function(E){return E.id+':'+E.state+':'+E.cycles+':'+E.fill.toFixed(2)}),
    trucks:TRUCKS.map(function(t){return t.id+':'+t.state+':'+t.load.toFixed(1)}),crane:CRANE.phase+':'+BLD.next,col:collisions()}},
  collisions:collisions,drive:function(id){startDrive(EXS.find(function(E){return E.id===id}))},stick:function(l,r){stick.l=l;stick.r=r},stopDrive:stopDrive,tour:startTour,stopTour:stopTour,cab:function(){document.getElementById('dView').click()},
  minGap:function(){var m=1e9;[LN,LS].forEach(function(L){L.trucks.forEach(function(a){L.trucks.forEach(function(b){if(a!==b)m=Math.min(m,L.fwd(a.s,b.s)-ADT.LEN)})})});return m},
  dbg:function(){return {sLoad:[EX1.sLoad,EX2.sLoad],L:[LN.L,LS.L],zone:[LN.zone,LS.zone,LN.sDump,LS.sDump],ld:EXS.map(function(E){return [E.loadSpot.x,E.loadSpot.z]}),mouth:EXS.map(function(E){return [E.mouthW.x,E.mouthW.y,E.mouthW.z].map(function(v){return +v.toFixed(2)})})}}};
