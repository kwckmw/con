/* ===== HX220A 굴삭기 팩토리: 분해도 모델의 형상 코드를 그대로 쓰고, 자세만 바깥에서 준다 ===== */
var LDM=new T.Object3D(),GTMP=new T.Matrix4();
function rotAbout(out,p,th){var Tm=new T.Matrix4();out.makeTranslation(p.x,p.y,p.z);Tm.makeRotationZ(th);out.multiply(Tm);Tm.makeTranslation(-p.x,-p.y,-p.z);out.multiply(Tm);return out}
function makeExcavator(){
  var P={},LIST=[],SPR=[];
  function def(id,name,grp,o){o=o||{};var p={id:id,name:name,grp:grp,g:new T.Group(),lat:o.lat||0,fk:o.fk||0,dyn:!!o.dyn,meshes:[],mats:[]};
    if(p.lat){p.sg={'-1':new T.Group(),'1':new T.Group()};p.g.add(p.sg['-1'],p.sg['1'])}P[id]=p;LIST.push(p);return p}
  function putG(p,g,mesh){mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);p.meshes.push(mesh);return mesh}
  function put(p,mesh,side){return putG(p,side?p.sg[side]:p.g,mesh)}
/*@@LOWER@@*/
/*@@UPPER@@*/
/*@@WORK@@*/
  var root=new T.Group(),lowerG=new T.Group(),upperG=new T.Group(),boomG=new T.Group(),armG=new T.Group(),bktG=new T.Group(),dynG=new T.Group();
  root.add(lowerG,upperG);upperG.add(boomG,armG,bktG,dynG);
  [boomG,armG,bktG].forEach(function(g){g.matrixAutoUpdate=false});
  LIST.forEach(function(p){(p.grp==='lower'?lowerG:p.dyn?dynG:p.fk===1?boomG:p.fk===2?armG:p.fk===3?bktG:upperG).add(p.g)});
  /* 트랙 체인 배치 */
  var LPATH=4*HX+2*Math.PI*PR,LPT=LPATH/NL,JA=new V3(),JB=new V3();
  function chainAt(s,o){s=((s%LPATH)+LPATH)%LPATH;var f;
    if(s<2*HX){o.x=-HX+s;o.y=CY-PR}else if(s<2*HX+Math.PI*PR){f=-Math.PI/2+(s-2*HX)/PR;o.x=HX+PR*Math.cos(f);o.y=CY+PR*Math.sin(f)}
    else if(s<4*HX+Math.PI*PR){o.x=HX-(s-2*HX-Math.PI*PR);o.y=CY+PR}else{f=Math.PI/2+(s-4*HX-Math.PI*PR)/PR;o.x=-HX+PR*Math.cos(f);o.y=CY+PR*Math.sin(f)}return o}
  function layTracks(d){for(var i=0;i<NL;i++){chainAt(i*LPT-d,JA);chainAt((i+1)*LPT-d,JB);
      LDM.position.set((JA.x+JB.x)/2,(JA.y+JB.y)/2,0);LDM.rotation.set(0,0,Math.atan2(JB.y-JA.y,JB.x-JA.x));LDM.scale.set(1,1,1);LDM.updateMatrix();GTMP.makeTranslation(JA.x,JA.y,0);
      TRK.forEach(function(t){t.link.forEach(function(m){m.setMatrixAt(i,LDM.matrix)});t.joint.forEach(function(m){m.setMatrixAt(i,GTMP)})})}
    TRK.forEach(function(t){t.link.concat(t.joint).forEach(function(m){m.instanceMatrix.needsUpdate=true})});
    SPR.forEach(function(g){g.rotation.z=-d/PR});IDL.forEach(function(g){g.rotation.z=-d/PR})}
  layTracks(0);
  /* 기구학 */
  var Mb=new T.Matrix4(),Ma=new T.Matrix4(),Mk=new T.Matrix4(),Rt=new T.Matrix4(),UPV=new V3(0,1,0);
  var AaR=new V3(HXD.S[0],HXD.S[1],Z0),LbR=new V3(HXD.K[0],HXD.K[1],Z0),JR=new V3(HXD.R[0],HXD.R[1],Z0);
  var L1=AaR.distanceTo(JR),L2=JR.distanceTo(LbR),SG=((LbR.x-AaR.x)*(JR.y-AaR.y)-(LbR.y-AaR.y)*(JR.x-AaR.x))>=0?1:-1;
  var vA=new V3(),vB=new V3(),vC=new V3(),vD=new V3(),vE=new V3(),vJ=new V3(),tA=new V3(),tB=new V3();
  function solveJ(a,b,o){var dx=b.x-a.x,dy=b.y-a.y,ln=Math.hypot(dx,dy)||.001,ux=dx/ln,uy=dy/ln,d=Math.min(Math.max(ln,Math.abs(L1-L2)+.01),L1+L2-.01),aa=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(L1*L1-aa*aa,0));return o.set(a.x+aa*ux-SG*h*uy,a.y+aa*uy+SG*h*ux,a.z)}
  function updCyl(r,a,b){vC.subVectors(b,a);var len=Math.max(vC.length(),.05);vC.normalize();var lb=Math.min(r.lb,len*.7);
    r.barrel.position.copy(a).addScaledVector(vC,lb/2);r.barrel.scale.set(1,lb,1);r.barrel.quaternion.setFromUnitVectors(UPV,vC);
    var rl=Math.max(len-lb,.02);r.rod.position.copy(a).addScaledVector(vC,lb+rl/2);r.rod.scale.set(1,rl,1);r.rod.quaternion.setFromUnitVectors(UPV,vC);
    r.col.position.copy(a).addScaledVector(vC,lb);r.col.quaternion.setFromUnitVectors(UPV,vC);r.ea.position.copy(a);r.eb.position.copy(b)}
  function updBar(m,a,b){vC.subVectors(b,a);var len=Math.max(vC.length(),.02);vC.normalize();m.position.copy(a).addScaledVector(vC,len/2);m.scale.set(1,len,1);m.quaternion.setFromUnitVectors(UPV,vC)}
  function place(p,a,b){var r=p.rig;if(r.pair){tA.copy(a);tB.copy(b);tA.z+=r.dz;tB.z+=r.dz;updCyl(r,tA,tB);tA.z-=2*r.dz;tB.z-=2*r.dz;updCyl(r.pair,tA,tB)}else updCyl(r,a,b)}
  var tipL=new V3(HXD.tip[0],HXD.tip[1],Z0),mouthL=new V3(HXD.mouth[0],HXD.mouth[1],Z0);
  var api={root:root,upper:upperG,parts:P,
    setPose:function(b,a,k,sw,fill){
      rotAbout(Mb,B0,b);rotAbout(Rt,P2,a);Ma.copy(Mb).multiply(Rt);rotAbout(Rt,A1,k);Mk.copy(Ma).multiply(Rt);
      boomG.matrix.copy(Mb);armG.matrix.copy(Ma);bktG.matrix.copy(Mk);[boomG,armG,bktG].forEach(function(g){g.matrixWorldNeedsUpdate=true});
      upperG.rotation.y=sw;
      vA.set(HXD.bBase[0],HXD.bBase[1],Z0);vB.set(HXD.bRod[0],HXD.bRod[1],Z0).applyMatrix4(Mb);place(P.bmcyl,vA,vB);
      vA.set(HXD.aBase[0],HXD.aBase[1],Z0).applyMatrix4(Mb);vB.set(HXD.tail[0],HXD.tail[1],Z0).applyMatrix4(Ma);place(P.acyl,vA,vB);
      vD.copy(AaR).applyMatrix4(Ma);vE.copy(LbR).applyMatrix4(Mk);solveJ(vD,vE,vJ);
      vA.set(HXD.kBase[0],HXD.kBase[1],Z0).applyMatrix4(Ma);place(P.bcyl,vA,vJ);
      var r=P.link.rig;[[r.b1,r.dz1,vD,vJ],[r.b2,r.dz2,vJ,vE]].forEach(function(q){q[0].forEach(function(m,i){var o=(i?1:-1)*q[1];tA.copy(q[2]);tA.z+=o;tB.copy(q[3]);tB.z+=o;updBar(m,tA,tB)})});
      r.p1.position.copy(vD);r.p2.position.copy(vJ);r.p3.position.copy(vE);
      soilMesh.visible=fill>.03;var l=.35+.65*fill;soilMesh.scale.set(.34*l,.24*l,.42*Math.min(1,.5+fill))},
    tipWorld:function(o){root.updateMatrixWorld(true);return o.copy(tipL).applyMatrix4(Mk).applyMatrix4(upperG.matrixWorld)},
    mouthWorld:function(o){root.updateMatrixWorld(true);return o.copy(mouthL).applyMatrix4(Mk).applyMatrix4(upperG.matrixWorld)},
    M:{b:Mb,a:Ma,k:Mk,B0:B0,P2:P2,A1:A1,tip:tipL},
    layTracks:layTracks,
    lamps:[]};
  /* 작업등(밤에 켜짐)과 경광등 */
  var lampMat=new T.MeshStandardMaterial({color:0xfff3c4,emissive:0xffe9a0,emissiveIntensity:0});
  [[1.42,2.06,.95],[1.25,2.95,-.45],[1.25,2.95,-1.25]].forEach(function(q){var m=new T.Mesh(new T.SphereGeometry(.07,10,8),lampMat);m.position.set(q[0],q[1],q[2]);upperG.add(m)});
  api.lampMat=lampMat;
  return api}
