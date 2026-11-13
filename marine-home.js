import * as T from './vendor/three.module.js';
import {createMarineWorld} from './marine-world.js?v=home-reef-7';
import {createMarineVortex} from './marine-vortex.js';

export function createMarineHome(){
 const camera=new T.PerspectiveCamera(43,1,.1,140);
 const {scene,creature,tick}=createMarineWorld(T,camera,null,{preview:true});
 const vortex=createMarineVortex(T,camera,scene);
 const [tree,oyster,jelly]=creature.landmarks;
 const light=new T.DirectionalLight('#c8f5ff',2.5);
 light.position.set(-3,4,7);
 scene.add(light);
 const turtle=new T.Group();
 turtle.scale.setScalar(1.24);
 scene.add(turtle);
 const ball=new T.SphereGeometry(1,32,22);
 const matte=(color,roughness=.62)=>new T.MeshStandardMaterial({color,roughness});
 const skin=matte('#61a889'),belly=matte('#e6d49e'),shell=matte('#496950');
 const rim=matte('#b49557'),white=matte('#fff2d2'),iris=matte('#231a32',.22);
 const glint=new T.MeshBasicMaterial({color:'#ffffff'});
 function oval(parent,mat,x,y,z,sx,sy,sz){
  const m=new T.Mesh(ball,mat);
  m.position.set(x,y,z);
  m.scale.set(sx,sy,sz);
  parent.add(m);
  return m;
 }
 oval(turtle,belly,0,-.18,-.12,.73,.24,.94);
 oval(turtle,rim,0,-.055,-.12,.79,.26,1);
 oval(turtle,shell,0,.10,-.12,.77,.49,.98);
 const scutes=['#6a8c59','#839752','#587b53'].map(color=>matte(color));
 const tile=new T.CylinderGeometry(1,1,.15,6);
 for(let row=-1;row<=1;row++)for(let column=-1;column<=1;column++){
  const x=column*.36,z=row*.43-.12+(column===0?.04:-.04);
  const normal=new T.Vector3(x/.77,.9,(z+.12)/.98).normalize();
  const plate=new T.Mesh(tile,scutes[(row+column+4)%3]);
  plate.position.set(x,.10+.49*Math.sqrt(1-(x/.77)**2-((z+.12)/.98)**2),z);
  plate.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);
  plate.scale.set(.184,1,.216);
  turtle.add(plate);
 }
 oval(turtle,skin,0,-.16,-1.05,.12,.11,.25);
 const head=new T.Group();
 head.position.set(0,.17,.70);
 turtle.add(head);
 oval(head,skin,0,.15,.24,.49,.42,.49);
 oval(head,belly,0,.01,.55,.37,.20,.25);
 const flippers=[],eyes=[];
 for(const side of [-1,1]){
  const eye=oval(head,white,side*.261,.23,.606,.158,.18,.086);
  const pupil=oval(head,iris,side*.261,.23,.676,.103,.12,.047);
  oval(pupil,glint,-.28,.3,.87,.23,.21,.19);
  oval(pupil,glint,.27,-.25,.89,.10,.09,.14);
  eyes.push({eye,pupil,side});
  oval(head,shell,side*.07,.045,.785,.018,.012,.009);
  for(const front of [true,false]){
   const pivot=new T.Group();
   pivot.position.set(side*.60,-.18,front?.37:-.65);
   turtle.add(pivot);
   const fin=oval(pivot,skin,side*(front?.41:.26),0,-.19,front?.58:.35,.10,front?.25:.20);
   fin.rotation.y=side*.53;
   flippers.push({pivot,side,front});
  }
 }
 const smile=new T.CatmullRomCurve3([
  new T.Vector3(-.20,-.04,.754),new T.Vector3(0,-.10,.778),new T.Vector3(.20,-.04,.754)
 ]);
 head.add(new T.Mesh(new T.TubeGeometry(smile,20,.012,6,false),iris));

 const portalClock={value:0},portalOpening={value:0};
 const portalMesh=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({
  transparent:true,depthWrite:false,uniforms:{clock:portalClock,opening:portalOpening},
  vertexShader:`varying vec2 p;void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 p;uniform float clock,opening;
   void main(){
    float r=length(p),a=atan(p.y,p.x);
    float waves=pow(.5+.5*cos(26.*r-3.*a+clock*2.5),4.);
    float rimDistance=abs(r-.73);
    float edge=exp(-pow(rimDistance*23.,2.));
    float halo=exp(-pow(rimDistance*7.,2.))*.45;
    float mask=1.-smoothstep(.72,.79,r);
    vec3 color=mix(vec3(.015,.055,.16),vec3(.17,.78,.91),waves*.62+edge*.37);
    color+=vec3(.4,.62,.94)*edge;
    gl_FragColor=vec4(color,max(mask,halo)*opening*(1.-smoothstep(.91,1.,r)));
    #include <colorspace_fragment>
   }`
 }));
 oyster.add(portalMesh);
 const portalPoint=new T.Vector3(),portalEdge=new T.Vector3();
 let open=.93;
 const badge=new T.Vector3(),gazePoint=new T.Vector3();
 let gazeX=0,gazeY=0;
 return {render(renderer,dt,t,x,y,portal,reduced,intro,idle){
  const aspect=innerWidth/innerHeight;
  const time=reduced?0:t;
  camera.aspect=aspect;
  camera.position.set(0,1.05,aspect<1?10:7.7);
  camera.lookAt(0,1,-3);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const spread=Math.max(2.65,aspect*3.85);
  tree.position.set(-spread*(aspect<.8?1.22:.88),-4,-9);
  tree.scale.setScalar(aspect<.8?.91:1.22);
  const halfWidth=(camera.position.z+6.8)*Math.tan(T.MathUtils.degToRad(camera.fov*.5))*aspect;
  oyster.position.set(halfWidth*(aspect<1?.60:.54),aspect<.6?-2.48:-1.55,-6.8);
  oyster.scale.setScalar(aspect<.6?.72:aspect<1?.86:1);
  jelly.position.set(spread*.40,aspect<.8?3.8:3.0,-15);
  jelly.scale.setScalar(aspect<.6?.62:.85);
  const jellyViewHalfWidth=(camera.position.z+18)*Math.tan(T.MathUtils.degToRad(camera.fov*.5))*aspect;
  jelly.userData.rightOffset=(jellyViewHalfWidth*.84-jelly.position.x)/jelly.scale.x;
  const tide=.5-.5*Math.cos(time*1.32);
  const opening=reduced||portal||intro<3.25?.96:.22+.76*T.MathUtils.smoothstep(tide,.10,.83);
  open=reduced?opening:T.MathUtils.damp(open,opening,5,dt);
  creature.scrub(1,open);
  portalMesh.position.set(0,open*.60,1.24);
  portalMesh.scale.setScalar(.75+.39*open);
  portalClock.value=time;
  portalOpening.value=T.MathUtils.smoothstep(open,.37,.76);
  tick(reduced?0:dt,time);
  vortex.settle(time);

  gazeX=T.MathUtils.damp(gazeX,reduced?0:portal?1:x,11,dt);
  gazeY=T.MathUtils.damp(gazeY,reduced?0:y,11,dt);
  turtle.position.set(.16*Math.sin(time*.72),.39+.16*Math.sin(time*1.5),0);
  turtle.rotation.set(.10*Math.sin(time*1.5),.09+gazeX*.17,.075*Math.cos(time));
  head.rotation.set(-gazeY*.19,gazeX*.28,-gazeX*.08);
  const wink=reduced||intro<2.65||idle<2.7?0:Math.max(0,Math.sin((idle-2.7)*2*Math.PI/3))**24;
  for(const [i,{eye,pupil,side}] of eyes.entries()){
   eye.scale.y=.18*(1-(i===0?wink*.94:0));
   pupil.scale.y=.12*(1-(i===0?wink*.97:0));
   pupil.position.set(side*.261+gazeX*.065,.23+gazeY*.072,.676);
  }
  for(const {pivot,side,front} of flippers){
   const stroke=time*3.1+(front?0:1.1);
   pivot.rotation.z=side*(.12+Math.sin(stroke)*(front?.50:.26));
   pivot.rotation.y=side*Math.cos(stroke)*.25;
  }
  turtle.updateMatrixWorld(true);
  turtle.localToWorld(badge.set(0,-.29,.78)).project(camera);
  head.localToWorld(gazePoint.set(0,.23,.68)).project(camera);
  oyster.updateMatrixWorld(true);
  portalMesh.getWorldPosition(portalPoint).project(camera);
  portalMesh.localToWorld(portalEdge.set(.76,0,0)).project(camera);
  renderer.render(scene,camera);
  return {badge,gazePoint,portalPoint,portalSize:Math.abs(portalEdge.x-portalPoint.x)*innerWidth,portalReveal:portalOpening.value,scale:Math.min(.95,innerHeight/870)};
 }};
}
