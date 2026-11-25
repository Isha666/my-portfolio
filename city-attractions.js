import * as T from './vendor/three.module.js';

export function createCityAttractions(scene,streetPoint,heading){
 const wheelSite=new T.Group();
 streetPoint(wheelSite.position,30,-15,0);
 wheelSite.rotation.y=-heading(30);
 scene.add(wheelSite);
 const frame=new T.MeshStandardMaterial({color:'#c3d7e6',metalness:.62,roughness:.32});
 const dark=new T.MeshStandardMaterial({color:'#232e4e',metalness:.48,roughness:.3});
 const glow=['#ff87d2','#83eeff','#bd9dff','#ffe09e'].map(color=>new T.MeshBasicMaterial({color,toneMapped:false}));
 const glass=new T.MeshPhysicalMaterial({color:'#a0e2ef',metalness:.18,roughness:.14,transparent:true,opacity:.62,clearcoat:1});
 const cylinder=new T.CylinderGeometry(1,1,1,10);
 const box=new T.BoxGeometry(1,1,1);
 const axis=new T.Vector3(0,1,0);
 function mesh(parent,geometry,material,position,scale){
  const object=new T.Mesh(geometry,material);
  object.position.set(...position);object.scale.set(...scale);parent.add(object);
  return object;
 }
 function beam(parent,a,b,radius,material){
  const start=new T.Vector3(...a),end=new T.Vector3(...b);
  const object=mesh(parent,cylinder,material,[0,0,0],[radius,start.distanceTo(end),radius]);
  object.position.copy(start).add(end).multiplyScalar(.5);
  object.quaternion.setFromUnitVectors(axis,end.sub(start).normalize());
 }
 const radius=11.2,centerY=13.5;
 mesh(wheelSite,box,dark,[0,.3,0],[14,.6,7]);
 for(const z of [-1.45,1.45]){
  for(const side of [-1,1])beam(wheelSite,[side*5.4,.55,z*1.6],[0,centerY,z],.24,frame);
 }
 const rotor=new T.Group();rotor.position.y=centerY;wheelSite.add(rotor);
 for(const z of [-.65,.65]){
  const ring=new T.Mesh(new T.TorusGeometry(radius,.14,8,120),frame);
  ring.position.z=z;rotor.add(ring);
  const trim=new T.Mesh(new T.TorusGeometry(radius+.21,.055,6,120),glow[1]);
  trim.position.z=z;rotor.add(trim);
 }
 beam(wheelSite,[0,centerY,-1.8],[0,centerY,1.8],.48,dark);
 const cabins=[];
 for(let i=0;i<20;i++){
  const angle=i*Math.PI*2/20,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
  for(const z of [-.65,.65])beam(rotor,[0,0,z],[x,y,z],.045,glow[i%4]);
  beam(rotor,[x,y,-.8],[x,y,.8],.10,frame);
  const cabin=new T.Group();wheelSite.add(cabin);
  beam(cabin,[0,0,0],[0,-.52,0],.065,frame);
  mesh(cabin,box,glow[i%4],[0,-.64,0],[1.45,.18,1.2]);
  mesh(cabin,box,glass,[0,-1.15,0],[1.35,.88,1.1]);
  mesh(cabin,box,dark,[0,-1.66,0],[1.48,.2,1.2]);
  for(const side of [-1,1]){
   beam(cabin,[side*.66,-.7,-.53],[side*.66,-1.6,-.53],.035,frame);
   beam(cabin,[side*.66,-.7,.53],[side*.66,-1.6,.53],.035,frame);
  }
  cabins.push({cabin,angle});
 }
 // Sample a compact text mask once. Each lit sample becomes one drone.
 const mask=document.createElement('canvas');mask.width=420;mask.height=70;
 const context=mask.getContext('2d',{willReadFrequently:true});
 context.font='bold 43px sans-serif';context.textAlign='center';context.textBaseline='middle';
 context.fillStyle='#fff';context.fillText('Isha Portfolio',210,35);
 const pixels=context.getImageData(0,0,420,70).data;
 const targets=[];
 for(let y=6;y<65;y+=3)for(let x=5;x<415;x+=3){
  if(pixels[(y*420+x)*4+3]>150)targets.push([(x-210)*.065,(35-y)*.065]);
 }
 const positions=new Float32Array(targets.length*3),colors=new Float32Array(targets.length*3);
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
 geometry.setAttribute('color',new T.BufferAttribute(colors,3).setUsage(T.DynamicDrawUsage));
 const drones=new T.Points(geometry,new T.ShaderMaterial({
  transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,
  uniforms:{},
  vertexShader:'varying vec3 tint;void main(){tint=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(340./-p.z,2.,7.);}',
  fragmentShader:'varying vec3 tint;void main(){float r=length(gl_PointCoord-.5)*2.;float halo=exp(-r*r*5.);float core=1.-smoothstep(.12,.4,r);gl_FragColor=vec4(tint*(1.+core),halo*.72+core*.28);}'
 }));
 drones.position.set(2,18,-40);
 drones.frustumCulled=false;
 scene.add(drones);
 const color=new T.Color();
 function tick(time){
  const rotation=time*.11;
  rotor.rotation.z=rotation;
  for(const {cabin,angle} of cabins){
   cabin.position.set(Math.cos(angle+rotation)*radius,centerY+Math.sin(angle+rotation)*radius,0);
   cabin.rotation.z=Math.sin(time*.7+angle)*.025;
  }
  const cycle=time%24;
  const formation=T.MathUtils.smoothstep(cycle,0,4)*(1-T.MathUtils.smoothstep(cycle,19,24));
  for(let i=0;i<targets.length;i++){
   const [x,y]=targets[i],angle=i*2.399963;
   const spread=1-formation;
   positions[i*3]=x+spread*Math.sin(angle+time*.14)*(6+i%11);
   positions[i*3+1]=y+spread*Math.cos(angle+time*.12)*(3+i%7)+Math.sin(time*1.2+i)*.025;
   positions[i*3+2]=spread*Math.sin(angle*1.7+time*.2)*5;
   color.setHSL((x*.013+time*.035+1)%1,.84,.68);
   colors.set([color.r,color.g,color.b],i*3);
  }
  geometry.attributes.position.needsUpdate=true;
  geometry.attributes.color.needsUpdate=true;
 }
 tick(6);
 return {tick};
}
