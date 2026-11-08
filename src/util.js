var C={Y:0xF7F4EC,YD:0xE6DFCF,ST:0xE3E0D8,HUB:0xA8A193,DK:0x8C8577,GR:0xD8D2C4,BELT:0x9A9384,SHOE:0x8C8577,TL:0xC9DCE0,CH:0xFFFFFF,GL:0xDCEBF0,SOIL:0x9C7B57};
function M(c,o){o=o||{};
  var m=new T.MeshStandardMaterial({color:c,roughness:o.r!==undefined?o.r:.85,metalness:o.m!==undefined?o.m:.04});
  if(o.op!==undefined){m.transparent=true;m.opacity=o.op;m.depthWrite=false}
  m.userData.bo=m.opacity;m.userData.bt=m.transparent;m.userData.bd=m.depthWrite;m.userData.bc=m.color.clone();return m}
function MB(c){var m=new T.MeshBasicMaterial({color:c});m.userData.bo=1;m.userData.bt=false;m.userData.bd=true;return m}
function edgeMat(){var m=new T.LineBasicMaterial({color:INK});m.userData.bo=1;m.userData.bt=false;m.userData.bd=true;m.userData.edge=true;return m}
var EC={};
function edgesOf(g){return EC[g.uuid]||(EC[g.uuid]=new T.EdgesGeometry(g,30))}
function noRay(){}

function rbox(w,h,d,r,m){
  var x=-w/2,y=-h/2,s=new T.Shape();r=Math.max(.005,Math.min(r,w/2-.002,h/2-.002));
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);
  s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  var b=Math.min(.03,d/2-.002),dd=Math.max(d-2*b,.002);
  var g=new T.ExtrudeGeometry(s,{depth:dd,bevelEnabled:true,bevelThickness:b,bevelSize:b*.8,bevelSegments:2,curveSegments:5});
  g.translate(0,0,-dd/2);return new T.Mesh(g,m)}
function rb(w,h,d,r,m,x,y,z){var o=rbox(w,h,d,r,m);o.position.set(x,y,z);return o}
function bx(w,h,d,m,x,y,z){var o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return o}
function cz(r,len,m,x,y,z,seg){var o=new T.Mesh(new T.CylinderGeometry(r,r,len,seg||24),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);return o}
function cy(r,len,m,x,y,z,seg){var o=new T.Mesh(new T.CylinderGeometry(r,r,len,seg||24),m);o.position.set(x,y,z);return o}
function cx(r,len,m,x,y,z,seg){var o=new T.Mesh(new T.CylinderGeometry(r,r,len,seg||24),m);o.rotation.z=Math.PI/2;o.position.set(x,y,z);return o}
function ext(shape,depth,m,bev){
  var b=bev||0,o={depth:Math.max(depth-2*b,.002),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:1,curveSegments:16};
  var g=new T.ExtrudeGeometry(shape,o);g.translate(0,0,-o.depth/2);return new T.Mesh(g,m)}
function beamShape(pts,hw){
  var n=pts.length,L=[],R=[],i;
  function dir(a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]}
  for(i=0;i<n;i++){
    var d1=i>0?dir(pts[i-1],pts[i]):dir(pts[0],pts[1]);
    var d2=i<n-1?dir(pts[i],pts[i+1]):d1;
    var n1=[-d1[1],d1[0]],n2=[-d2[1],d2[0]],nx=n1[0]+n2[0],ny=n1[1]+n2[1],l=Math.hypot(nx,ny)||1;
    nx/=l;ny/=l;var k=1/Math.max(.5,nx*n1[0]+ny*n1[1]);
    L.push([pts[i][0]+nx*hw[i]*k,pts[i][1]+ny*hw[i]*k]);
    R.push([pts[i][0]-nx*hw[i]*k,pts[i][1]-ny*hw[i]*k]);
  }
  var s=new T.Shape();s.moveTo(L[0][0],L[0][1]);
  for(i=1;i<n;i++)s.lineTo(L[i][0],L[i][1]);
  for(i=n-1;i>=0;i--)s.lineTo(R[i][0],R[i][1]);
  s.closePath();return s}
function beam(a,b,hw0,hw1,depth,m,z){var o=ext(beamShape([a,b],[hw0,hw1]),depth,m,.02);o.position.z=z;return o}
function trace(p,H,R){p.moveTo(-H,-R);p.lineTo(H,-R);p.absarc(H,0,R,-Math.PI/2,Math.PI/2,false);p.lineTo(-H,R);p.absarc(-H,0,R,Math.PI/2,Math.PI*1.5,false)}

