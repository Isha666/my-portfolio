import {createGardenButterflies} from './garden-butterflies.js';
import {organicGeometry} from './garden-plant-geometry.js';
import * as T from './vendor/three.module.js';

export function createGardenHome(){
 const scene=new T.Scene();
 scene.background=new T.Color('#a9d7e8');
 scene.fog=new T.FogExp2('#c4ddc5',.037);
 scene.add(new T.HemisphereLight('#fff5df','#74875d',2.1));
 const sun=new T.DirectionalLight('#ffe2ac',2.7);
 sun.position.set(-4,8,5);
 scene.add(sun);
 const camera=new T.PerspectiveCamera(38,1,.1,60);
 const ball=new T.SphereGeometry(1,24,16);
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.79});
 const rust=mat('#ba4e21'), amber=mat('#e07832'), cream=mat('#fff0d5'), bark=mat('#51372a');
 const ink=mat('#2a1819'), leaf=mat('#3d672f'), grass=mat('#789452');
 const shine=new T.MeshBasicMaterial({color:'#fff9e8'});
 function add(parent,geometry,material,x,y,z){
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  parent.add(mesh);
  return mesh;
 }
 function oval(parent,material,x,y,z,sx,sy,sz){
  const mesh=add(parent,ball,material,x,y,z);
  mesh.scale.set(sx,sy,sz);
  return mesh;
 }
 const floor=add(scene,new T.PlaneGeometry(90,90),grass,0,-.27,0);
 floor.rotation.x=-Math.PI/2;
 let seed=17;
 const random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
 const palette=['#d72e59','#fff8e7','#ef80b3','#9c86dd','#f3bd32','#f8c0d2'];
 const petal=organicGeometry(T,'petal'), rose=organicGeometry(T,'rose'), blade=organicGeometry(T,'leaf');
 const flowerCenters=[];
 const pieces=new Map(), blooming=[], dummy=new T.Object3D();
 function plant(geometry,color,x,y,z,size,rx,ry,rz,animate=false){
  if(!pieces.has(geometry))pieces.set(geometry,[]);
  pieces.get(geometry).push({color,x,y,z,size,rx,ry,rz,animate});
 }
 function flower(x,y,z,type,size,faceForward=false,animate=false){
  const geometry=type===0?rose:petal;
  const count=type===4?13:8;
  for(let layer=0;layer<(type===0?3:1);layer++){
   for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2+layer*.34;
    plant(geometry,palette[type],x,y,z,size*(1-layer*.19),faceForward?0:-1.35,angle*.28,angle,animate);
   }
  }
 }
 function beam(from,to,radius,material){
  const a=new T.Vector3(...from),b=new T.Vector3(...to),axis=b.clone().sub(a);
  const mesh=add(scene,new T.CylinderGeometry(radius*.72,radius,axis.length(),8),material,...a.lerp(b,.5).toArray());
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
 }
 const stone=mat('#c9b99a'), timber=mat('#92704b'), rail=mat('#594d38');
 const slab=new T.BoxGeometry(1,.085,1);
 const pathCenter=z=>Math.sin(z*.52)*.27;
 for(let row=0;row<27;row++){
  const z=8.3-row*.48;
  for(let col=-1;col<=1;col++){
   const tile=add(scene,slab,stone,pathCenter(z)+col*.68+(random()-.5)*.12,-.026,z);
   tile.scale.set(.64+random()*.06,1,.44);
   tile.rotation.y=(random()-.5)*.15;
  }
 }
 const arch=new T.TorusGeometry(2.6,.063,8,64,Math.PI);
 for(const [index,z] of [-1.4,-3.6,-5.7].entries()){
  add(scene,arch,timber,0,1.25,z);
  for(const side of [-1,1])beam([side*2.6,-.17,z],[side*2.6,1.3,z],.075,timber);
  for(let i=0;i<95;i++){
   const a=i/94*Math.PI;
   const x=2.6*Math.cos(a),y=1.25+2.6*Math.sin(a);
   plant(blade,'#477e39',x,y,z,.26+random()*.19,random(),random()*6,random()*6);
   if(i%2===0)flower(x+(random()-.5)*.22,y+(random()-.5)*.18,z+.08,index===0?0:index+1,.10+random()*.09,true);
  }
  for(const side of [-1,1])for(let i=0;i<16;i++){
   const y=i*.084;
   plant(blade,'#477e39',side*2.6,y,z,.31,random(),random()*6,random()*6);
   if(i%2===0)flower(side*2.6,y,z+.11,index===0?0:index+1,.15,true);
  }
 }
 for(const side of [-1,1])for(let i=0;i<465;i++){
  const foreground=i>=330;
  const z=foreground?3.15+random()*5.1:3.3-random()*9.3;
  const x=pathCenter(z)+side*(1.19+random()**1.65*(foreground?6.6:13));
  const type=(Math.floor((z+7)*1.3)+i%3)%5;
  const size=.09+random()*.11,y=type===4?.52+random()*.18:.13+random()*.31;
  for(let j=0;j<3;j++)plant(blade,'#477e39',x,-.11+j*.12,z,.21+y*.43,-.61,j*2.4,j-.9);
  flower(x,y,z,type,size,type===4,true);
  if(type!==0){
   const center=oval(scene,type===4?bark:timber,x,y,z,size*.28,size*.23,size*.28);
   flowerCenters.push({center,scale:center.scale.clone(),phase:x*.47+z*.54});
  }
 }

 // A low bridge spans the water left to right behind the garden path.
 const water=add(scene,new T.PlaneGeometry(180,5.8),new T.MeshStandardMaterial({
  color:'#398d88',roughness:.28,metalness:.24
 }),0,-.19,-9.3);
 water.rotation.x=-Math.PI/2;
 const deckY=x=>-.06+.96*Math.cos(x/5.5*Math.PI/2);
 for(let i=0;i<46;i++){
  const x=-5.5+i*11/45;
  const plank=add(scene,slab,timber,x,deckY(x),-8.4);
  plank.scale.set(.245,1,1.34);
  plank.rotation.z=Math.atan2(deckY(x+.1)-deckY(x-.1),.2);
 }
 for(const side of [-1,1]){
  const z=-8.4+side*.63;
  for(let i=0;i<=14;i++){
   const x=-5.5+i*11/14,y=deckY(x);
   beam([x,y,z],[x,y+.68,z],.043,rail);
   if(i===14)continue;
   const nextX=x+11/14,nextY=deckY(nextX);
   for(const height of [.13,.62])beam([x,y+height,z],[nextX,nextY+height,z],.045,timber);
   if(i%2===0)flower(x,y+.55,z+.07,2,.14,true);
  }
 }
 const ripple=mat('#8dc3b1');
 for(let i=0;i<38;i++){
  const line=add(scene,slab,ripple,(random()-.5)*16,-.18,-11+random()*4);
  line.scale.set(.10+random()*.5,.028,.024);
 }

 function cherryTree(x,z,height){
  const base=-.27;
  beam([x,base,z],[x+.14,base+height*.79,z],height*.073,bark);
  for(let i=0;i<8;i++){
   const angle=i*2.399;
   const end=[x+Math.cos(angle)*height*.35,base+height*(.68+random()*.36),z+Math.sin(angle)*height*.29];
   beam([x+.08,base+height*(.36+i*.041),z],end,height*.028,bark);
   for(let j=0;j<30;j++){
    const a=random()*Math.PI*2,r=Math.sqrt(random())*height*.24;
    const bx=end[0]+Math.cos(a)*r,by=end[1]+(random()-.5)*height*.27,bz=end[2]+Math.sin(a)*r;
    flower(bx,by,bz,j%4===0?1:5,.13+random()*.12,true);
   }
  }
 }
 for(const side of [-1,1]){
  cherryTree(side*4.25,-5.0,4.4);
  cherryTree(side*3.8,-11.8,4.9);
  cherryTree(side*6.4,-13.3,5.2);
  cherryTree(side*1.95,-14.6,4.0);
  for(let i=0;i<8;i++){
   const x=side*(7.8+i*2.25), z=-12.5-random()*10;
   cherryTree(x,z,3.5+random()*2.4);
  }
  cherryTree(side*7.9,-3.9,5.3);
  cherryTree(side*11,-6.6,5.6);
 }
 for(const [geometry,instances] of pieces){
  const mesh=new T.InstancedMesh(geometry,new T.MeshStandardMaterial({side:T.DoubleSide,roughness:.72}),instances.length);
  const tint=new T.Color();
  instances.forEach(({color,x,y,z,size,rx,ry,rz},i)=>{
   dummy.position.set(x,y,z);
   dummy.rotation.set(rx,ry,rz,'XYZ');
   dummy.scale.setScalar(size);
   dummy.updateMatrix();
   mesh.setMatrixAt(i,dummy.matrix);
   mesh.setColorAt(i,tint.set(color).multiplyScalar(.84+random()*.25));
  });
  scene.add(mesh);
  if(geometry!==blade){
   mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
   const groups=instances.map(({x,z},index)=>({index,phase:x*.47+z*.54}))
    .filter(({index})=>instances[index].animate);
   blooming.push({mesh,instances,groups});
  }
 }
 const fox=new T.Group();
 fox.position.set(0,0,1);
 scene.add(fox);
 oval(fox,new T.MeshBasicMaterial({color:'#526b3c',transparent:true,opacity:.38}),0,.02,0,1.3,.025,.69);
 oval(fox,rust,0,.82,0,.64,.77,.59);
 oval(fox,cream,0,.94,.41,.39,.55,.25);
 for(const x of [-.34,.34]){
  oval(fox,amber,x,.43,.43,.19,.41,.19);
  oval(fox,bark,x,.16,.58,.19,.14,.24);
 }
 const tail=new T.Group();
 tail.position.set(.4,.38,-.21);
 fox.add(tail);
 oval(tail,rust,.52,.02,.03,.73,.32,.35).rotation.z=.23;
 oval(tail,cream,1.04,.15,.10,.31,.25,.28).rotation.z=.25;
 const head=new T.Group();
 head.position.set(0,1.61,.23);
 fox.add(head);
 oval(head,amber,0,.17,0,.72,.59,.54);
 for(const x of [-.36,.36])oval(head,cream,x,-.035,.32,.35,.24,.28);
 oval(head,cream,0,-.04,.52,.33,.22,.31);
 oval(head,ink,0,.035,.78,.14,.10,.095);
 const eyes=[],ears=[];
 for(const side of [-1,1]){
  const ear=new T.Group();
  ear.position.set(side*.44,.51,-.04);
  head.add(ear);
  const outer=add(ear,new T.ConeGeometry(.265,.72,36),rust,0,.26,0);
  outer.scale.z=.58;
  oval(ear,cream,0,.17,.116,.123,.22,.04);
  ears.push({ear,side});
  const white=oval(head,cream,side*.30,.26,.445,.205,.223,.12);
  const pupil=oval(head,ink,side*.30,.26,.543,.109,.132,.072);
  oval(pupil,shine,-.032,.044,.062,.029,.031,.014);
  oval(pupil,shine,.038,-.027,.065,.012,.014,.01);
  eyes.push({pupil,white,x:side*.30});
 }
 const tag=document.createElement('canvas');
 tag.width=512;
 tag.height=256;
 const ctx=tag.getContext('2d');
 ctx.fillStyle='#fff1cb';
 ctx.fillRect(0,0,512,256);
 ctx.strokeStyle='#b68d54';
 ctx.lineWidth=9;
 ctx.strokeRect(12,12,488,232);
 ctx.textAlign='center';
 ctx.fillStyle='#483a2d';
 ctx.font='600 26px system-ui';
 ctx.fillText('HELLO, MY NAME IS',256,65);
 ctx.font='bold 53px Georgia';
 ctx.fillText('Isha',256,131);
 ctx.fillText('Venkataraman',256,197);
 const tagTexture=new T.CanvasTexture(tag);
 tagTexture.colorSpace=T.SRGBColorSpace;
 const nameTag=add(fox,new T.PlaneGeometry(.78,.39),new T.MeshStandardMaterial({map:tagTexture}),0,1.01,.68);
 nameTag.rotation.z=-.07;
 const butterflies=createGardenButterflies(T,scene,8,()=>[0,.7+random()*2.7,-4+random()*6]);
 const opening=(time,phase)=>T.MathUtils.smoothstep(.5+.5*Math.sin(time*.85+phase),.12,.86);
 let gazeX=0,gazeY=0;
 return {render(renderer,dt,time,x,y,portal,reduced,intro,idle){
  const aspect=innerWidth/innerHeight;
  camera.aspect=aspect;
  camera.position.set(0,3.05,aspect<1?11.5:9.2);
  camera.lookAt(0,1.65,-1.2);
  camera.updateProjectionMatrix();
  gazeX=T.MathUtils.damp(gazeX,reduced?0:portal?.95:x,12,dt);
  gazeY=T.MathUtils.damp(gazeY,reduced?0:y,12,dt);
  head.rotation.set(-gazeY*.12,gazeX*.23,-gazeX*.085);
  const wink=reduced||intro<2.65||idle<2.7?0:Math.pow(Math.max(0,Math.sin((idle-2.7)*2*Math.PI/3)),24);
  for(const [i,{pupil,white,x:base}] of eyes.entries()){
   white.scale.y=.223*(i===0?1-wink*.94:1);
   pupil.scale.y=.132*(i===0?1-wink*.98:1);
   pupil.position.x=base+gazeX*.071;
   pupil.position.y=.26+gazeY*.069;
  }
  for(const {ear,side} of ears)ear.rotation.z=-side*(portal?.11:.24)+gazeX*.09;
  const tagPop=reduced?1:T.MathUtils.smoothstep(intro,1.25,1.56);
  nameTag.visible=tagPop>0;
  nameTag.scale.setScalar(tagPop*(1+.10*Math.sin(tagPop*Math.PI)));
  const wag=time%2;
  tail.rotation.y=reduced?0:Math.sin(wag*25)*Math.sin(Math.PI*Math.min(1,wag/.68))*.32;
  if(!reduced)for(const {mesh,instances,groups} of blooming){
   for(const {index,phase} of groups){
    const {x,y,z,size,rx,ry,rz}=instances[index];
    const bloom=.23+.77*opening(time,phase);
    dummy.position.set(x,y,z);
    dummy.rotation.set(rx+(1-bloom)*.39,ry,rz,'XYZ');
    dummy.scale.setScalar(size*bloom);
    dummy.updateMatrix();
    mesh.setMatrixAt(index,dummy.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
  if(!reduced)for(const {center,scale,phase} of flowerCenters){
   const amount=opening(time,phase);
   center.visible=amount>.54;
   center.scale.copy(scale).multiplyScalar(T.MathUtils.smoothstep(amount,.54,.93));
  }
  butterflies.forEach(({group,wings,origin},i)=>{
   const phase=reduced?i:time*(.8+i*.035)+i;
   const spread=(camera.position.z-origin.z)*Math.tan(T.MathUtils.degToRad(camera.fov*.5))*aspect;
   group.position.set(Math.sin(phase)*spread*.99,origin.y+Math.sin(phase*1.7)*.74,origin.z+Math.cos(phase)*1.4);
   group.scale.setScalar(i%3===0?.49:.63);
   group.rotation.y=Math.cos(phase)*.67;
   const flap=reduced?.36:Math.sin(time*15+i)*.85;
   wings[0].rotation.y=flap;
   wings[1].rotation.y=-flap;
  });
  renderer.render(scene,camera);
 }};
}
