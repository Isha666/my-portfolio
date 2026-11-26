import * as T from './vendor/three.module.js';
import {skyParkDeckRise} from './city-skypark-levels.js?v=clear-city-sites-1';

export function addSkyParkDetails(tower){
 const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,12,8),column=new T.CylinderGeometry(1,1,1,16);
 const gold=new T.MeshStandardMaterial({color:'#c9a16c',metalness:.75,roughness:.23});
 const marble=new T.MeshStandardMaterial({color:'#d9cec2',roughness:.24,metalness:.14});
 const dark=new T.MeshStandardMaterial({color:'#29303c',roughness:.43});
 const velvet=new T.MeshStandardMaterial({color:'#70566e',roughness:.85});
 const warm=new T.MeshBasicMaterial({color:'#ffe2ad',toneMapped:false});
 const ice=new T.MeshBasicMaterial({color:'#a8e7ff',toneMapped:false});
 const glazing=new T.MeshStandardMaterial({color:'#b7d0d7',transparent:true,opacity:.13,depthWrite:false,roughness:.18,side:T.DoubleSide});
 function mesh(parent,geo,material,x,y,z,w,h,d){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.layers.enable(1);parent.add(m);return m;}
 const part=(parent,material,x,y,z,w,h,d)=>mesh(parent,box,material,x,y,z,w,h,d);
 const lobby=new T.Group();lobby.position.z=15.8;lobby.scale.z=.8;lobby.updateMatrix();tower.add(lobby);
 // Double-height porte-cochere and marble reception hall, clear of the road.
 part(lobby,marble,-7.7,.13,-11,9.3,.3,18.5);
 part(tower,dark,-7.7,7.4,8,9.3,.3,12.8);
 part(tower,dark,-9.225,7.4,.6,6.25,.3,2);
 part(lobby,marble,-3.1,3.7,-11,.18,7.3,18.4);
 for(const z of [-18,-14,-10,-6,-3])part(lobby,gold,-3.21,3.7,z,.035,6.4,.055);
 for(const z of [-20.2,-1.8]){
  part(lobby,marble,-7.7,3.7,z,9.3,7.3,.22);
  part(lobby,gold,-7.7,1.1,z+.15,9.1,.045,.08);
  for(const x of [-11.2,-8.8,-6.4,-4])part(lobby,warm,x,5.4,z+(z<-10?.15:-.15),.08,2,.1);
 }
 for(const z of [-19.6,-15,-7,-2.4]){
  mesh(lobby,column,gold,-12,3.7,z,.21,7.4,.21);
  part(lobby,gold,-12,.45,z,.65,.35,.65);
  part(lobby,warm,-12,7.1,z,.65,.12,.65);
 }
 for(const [z,depth] of [[-17.4,4.1],[-4.6,4.1]])part(lobby,glazing,-12,3.7,z,.04,6.6,depth);
 // A broad illuminated doorway and generous carpet lead to the existing lift.
 part(lobby,gold,-12,6.75,-11,.4,.32,8.3);
 for(const z of [-14.8,-7.2])part(lobby,gold,-12,3.3,z,.32,6.6,.28);
 part(lobby,velvet,-8.2,.32,-11,7.2,.035,2.6);
 for(const z of [-12.35,-9.65])part(lobby,gold,-8.2,.345,z,7.2,.018,.05);
 for(const x of [-11,-9,-7,-5])for(const z of [-18,-16,-6,-4]){
  part(lobby,gold,x,.295,z,.018,.014,1.9);
  part(lobby,gold,x,.295,z,1.9,.014,.018);
 }
 const crystals=new T.InstancedMesh(new T.OctahedronGeometry(1),new T.MeshStandardMaterial({color:'#e5f5ff',emissive:'#847459',emissiveIntensity:.27,metalness:.3,roughness:.12}),288);
 const bulbs=new T.InstancedMesh(ball,warm,72);
 const model=new T.Object3D();let crystalIndex=0,bulbIndex=0;
 for(const z of [-17,-11,-5]){
  mesh(lobby,column,gold,-8.2,6.7,z,.035,1.3,.035);
  for(let tier=0;tier<3;tier++){
   const radius=1.35-tier*.34,y=5.95-tier*.48,count=40-tier*8;
   const ring=new T.Mesh(new T.TorusGeometry(radius,.035,6,40),gold);ring.rotation.x=Math.PI/2;ring.position.set(-8.2,y,z);ring.layers.enable(1);lobby.add(ring);
   for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2,length=.24+(i%3)*.075;
    model.position.set(-8.2+Math.cos(angle)*radius,y-length*.75,z+Math.sin(angle)*radius);
    model.scale.set(.064,length,.064);model.rotation.set(0,angle,0);model.updateMatrix();crystals.setMatrixAt(crystalIndex++,model.matrix);
   }
   for(let i=0;i<8;i++){
    const angle=i/8*Math.PI*2;model.position.set(-8.2+Math.cos(angle)*radius,y+.05,z+Math.sin(angle)*radius);
    model.scale.setScalar(.07);model.updateMatrix();bulbs.setMatrixAt(bulbIndex++,model.matrix);
   }
  }
 }
 crystals.layers.enable(1);bulbs.layers.enable(1);lobby.add(crystals,bulbs);
 const lobbyLight=new T.PointLight('#ffdfb0',35,20,2);lobbyLight.position.set(-8.2,5.5,-11);lobbyLight.layers.enable(1);lobby.add(lobbyLight);
 // Reception is offset beside the walking route, facing the front doors.
 part(lobby,dark,-5.1,.92,-5.6,1.9,1.45,4.4);
 part(lobby,marble,-5.1,1.69,-5.6,2.15,.13,4.65);
 part(lobby,warm,-6.08,.7,-5.6,.035,.05,4.1);
 for(const z of [-7.4,-5.6,-3.8])part(lobby,gold,-6.07,1.02,z,.04,1.2,.04);
 part(lobby,dark,-4.9,1.9,-6.5,.12,.44,.55);
 const sign=document.createElement('canvas');sign.width=768;sign.height=128;const context=sign.getContext('2d');
 context.fillStyle='#25313a';context.fillRect(0,0,768,128);context.fillStyle='#f1d3a0';context.font='bold 43px Georgia';context.textAlign='center';context.fillText('SKYPARK · CONCIERGE',384,79);
 const label=new T.Mesh(new T.PlaneGeometry(3.3,.55),new T.MeshBasicMaterial({map:new T.CanvasTexture(sign)}));label.rotation.y=-Math.PI/2;label.position.set(-6.09,1.1,-5.6);label.layers.enable(1);lobby.add(label);
 const coats=['#444e72','#a76c82','#558478','#b6a38e','#d4bd9b','#795689'].map(color=>new T.MeshStandardMaterial({color,roughness:.8}));
 const skins=['#c29275','#8c604e','#e2b897'].map(color=>new T.MeshStandardMaterial({color,roughness:.85}));
 const people=[];
 const hair=new T.MeshStandardMaterial({color:'#302932',roughness:.9});
 function person(parent,index){
  const group=new T.Group();parent.add(group);const coat=coats[index%coats.length];
  mesh(group,ball,coat,0,1.03,0,.23,.34,.15);
  mesh(group,ball,skins[index%3],0,1.52,0,.125,.16,.115);
  mesh(group,ball,hair,0,1.61,-.025,.13,.11,.12);
  const legs=[],arms=[];
  for(const side of [-1,1]){
   legs.push(mesh(group,column,dark,side*.092,.4,0,.065,.7,.065));
   arms.push(mesh(group,column,coat,side*.24,1.01,0,.047,.51,.047));
   mesh(group,ball,dark,side*.092,.065,.045,.075,.065,.135);
  }
  const person={group,legs,arms};people.push(person);return person;
 }
 const receptionist=person(lobby,4);receptionist.group.position.set(-4, .3,-5.4);receptionist.group.rotation.y=-Math.PI/2;
 receptionist.arms.forEach(arm=>{arm.rotation.x=-.72;});
 const deckRoot=new T.Group();deckRoot.position.y=skyParkDeckRise;deckRoot.updateMatrix();tower.add(deckRoot);
 const guests=[];
 for(let i=0;i<7;i++){
  const guest=person(lobby,i);guest.deck=false;guest.index=i;guests.push(guest);
 }
 for(let i=0;i<12;i++){
  const guest=person(deckRoot,i+2);guest.deck=true;guest.index=i;guests.push(guest);
 }
 // Warm rooftop lounge seating and low-level lighting keep the skyline clear.
 for(const z of [-8,0,8]){
  part(deckRoot,dark,4.05,28.91,z,.85,.62,2.3);
  part(deckRoot,velvet,3.9,29.2,z,.78,.18,2.1);
  part(deckRoot,velvet,4.43,29.55,z,.13,.78,2.3);
  part(deckRoot,gold,3.13,29.02,z,.6,.08,.7);
 }
 for(const z of [-13,-8,-3,2,7,12])for(const x of [-1.9,4.7]){
  part(deckRoot,gold,x,28.95,z,.11,.72,.11);
  part(deckRoot,warm,x,29.29,z,.16,.1,.16);
 }
 for(const z of [-13,-5.3])part(deckRoot,warm,-4.7,28.62,z,4.2,.025,.045);
 // Share draw calls across guests while keeping independent walking skeletons.
 const batches=new Map();
 for(const {group} of people)for(const part of group.children){
  const key=part.geometry.uuid+part.material.uuid;
  if(!batches.has(key))batches.set(key,{geometry:part.geometry,material:part.material,parts:[]});
  batches.get(key).parts.push({part,group});part.visible=false;
 }
 for(const batch of batches.values()){
  batch.mesh=new T.InstancedMesh(batch.geometry,batch.material,batch.parts.length);
  batch.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);batch.mesh.layers.enable(1);
  batch.mesh.frustumCulled=false;tower.add(batch.mesh);
 }
 const instanceMatrix=new T.Matrix4();
 function tick(time,visitor=null){
  receptionist.group.rotation.y=-Math.PI/2+Math.sin(time*.42)*.13;
  for(const guest of guests){
   const {group,legs,arms,index:i,deck}=guest;
   if(deck){
    if(i<10){
     const phase=(time*(.46+i*.018)+i*5.3)%58.5;
     // A rectangular promenade, with trees in the central strip.
     if(phase<26){group.position.set(-.85,28.6,-13+phase);group.rotation.y=0;}
     else if(phase<29.25){group.position.set(-.85+(phase-26),28.6,13);group.rotation.y=Math.PI/2;}
     else if(phase<55.25){group.position.set(2.4,28.6,13-(phase-29.25));group.rotation.y=Math.PI;}
     else{group.position.set(2.4-(phase-55.25),28.6,-13);group.rotation.y=-Math.PI/2;}
    }else{
     const phase=(time*.42+(i-10)*6+4)%12,z=phase<6?-12+phase:-6-(phase-6);
     group.position.set(-5.1,28.6,z+11);group.rotation.y=phase<6?0:Math.PI;
    }
   }else{
    const phase=(time*(.48+i*.035)+i*2.2)%12,along=phase<6?phase:12-phase;
    group.position.set(-10.8+along,.3,[-17.5,-14.3,-8.3][i%3]);
    group.rotation.y=phase<6?Math.PI/2:-Math.PI/2;
   }
   if(deck&&visitor){
    const dx=group.position.x-visitor.x,dz=group.position.z-visitor.y,distance=Math.hypot(dx,dz);
    if(distance<.95){
     const push=.95-distance,denominator=Math.max(.001,distance);
     group.position.x+=(distance?dx/denominator:1)*push;
     group.position.z+=(distance?dz/denominator:0)*push;
     group.position.x=T.MathUtils.clamp(group.position.x,i<10?-1.9:-6.3,i<10?2.7:-3.6);
     group.position.z=T.MathUtils.clamp(group.position.z,i<10?-13.4:-1.8,i<10?13.4:5.4);
    }
   }
   const gait=time*(deck?4.2:4.8)+i;
   legs.forEach((leg,j)=>{leg.rotation.x=Math.sin(gait+j*Math.PI)*.38;arms[j].rotation.x=-leg.rotation.x*.7;});
   group.position.y+=Math.sin(gait*2)*.012;
  }
  for(const {group} of people)group.updateMatrix();
  for(const batch of batches.values()){
   batch.parts.forEach(({part,group},index)=>{
    part.updateMatrix();instanceMatrix.multiplyMatrices(group.matrix,part.matrix);if(group.parent===lobby)instanceMatrix.premultiply(lobby.matrix);else if(group.parent===deckRoot)instanceMatrix.premultiply(deckRoot.matrix);batch.mesh.setMatrixAt(index,instanceMatrix);
   });
   batch.mesh.instanceMatrix.needsUpdate=true;
  }
 }
 tick(0);
 return {tick,deckGuests:guests.filter(guest=>guest.deck)};
}
