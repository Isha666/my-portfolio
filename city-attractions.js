import * as T from './vendor/three.module.js';

export function createCityAttractions(scene,streetPoint,heading){
 const wheelSite=new T.Group();
 streetPoint(wheelSite.position,67,-17,0);
 wheelSite.rotation.y=-heading(67);
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
  transparent:true,depthTest:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,
  uniforms:{},
  vertexShader:'varying vec3 tint;void main(){tint=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(2800./-p.z,1.,3.5);}',
  fragmentShader:'varying vec3 tint;void main(){float r=length(gl_PointCoord-.5)*2.;float halo=exp(-r*r*5.);float core=1.-smoothstep(.12,.4,r);gl_FragColor=vec4(tint*(1.+core),halo*.72+core*.28);}'
 }));
 // One fixed aerial stage above the distant skyline, facing the main boulevard.
 drones.position.set(100,420,-1600);
 drones.rotation.y=-.06;
 drones.scale.setScalar(14);
 drones.frustumCulled=false;
 scene.add(drones);
 const formations=Array.from({length:5},()=>new Float32Array(targets.length*3));
 for(let i=0;i<targets.length;i++){
  const t=i/targets.length,angle=t*Math.PI*2;
  const [x,y]=targets[i];
  formations[0].set([x,y,0],i*3);
  const heartScale=.88+(i%3)*.06;
  formations[1].set([
   9*Math.sin(angle)**3*heartScale,
   (13*Math.cos(angle)-5*Math.cos(2*angle)-2*Math.cos(3*angle)-Math.cos(4*angle))*.56*heartScale,
   Math.sin(angle*2)*.3
  ],i*3);
  if(i%3===0){
   const latitude=Math.acos(1-2*t),longitude=i*2.399963;
   formations[2].set([Math.sin(latitude)*Math.cos(longitude)*5.5,Math.cos(latitude)*5.5,Math.sin(latitude)*Math.sin(longitude)*5.5],i*3);
  }else{
   const ring=9+(i%5)*.14;
   formations[2].set([Math.cos(angle)*ring,Math.sin(angle)*ring*.35,Math.sin(angle)*ring*.65],i*3);
  }
  const edge=t*10,index=Math.floor(edge),along=edge-index;
  const startAngle=index*Math.PI/5+Math.PI/2,endAngle=(index+1)*Math.PI/5+Math.PI/2;
  const r1=index%2?4.1:9.5,r2=index%2?9.5:4.1;
  formations[3].set([
   T.MathUtils.lerp(Math.cos(startAngle)*r1,Math.cos(endAngle)*r2,along),
   T.MathUtils.lerp(Math.sin(startAngle)*r1,Math.sin(endAngle)*r2,along),
   Math.sin(angle*5)*.4
  ],i*3);
  const wing=2.8*Math.exp(Math.cos(angle))-4*Math.cos(4*angle)-Math.sin(angle/12)**5;
  formations[4].set([Math.sin(angle)*wing*1.35,Math.cos(angle)*wing,Math.abs(Math.sin(angle))*1.2],i*3);
 }
 // Assign each departure light a nearby destination rather than crossing the whole stage.
 const transitions=formations.map((source,index)=>{
  const destination=formations[(index+1)%formations.length];
  const assigned=new Float32Array(destination.length);
  const used=new Uint8Array(targets.length);
  for(let i=0;i<targets.length;i++){
   const at=i*3;
   let nearest=-1,best=Infinity;
   for(let candidate=0;candidate<targets.length;candidate++){
    if(used[candidate])continue;
    const next=candidate*3;
    const dx=source[at]-destination[next],dy=source[at+1]-destination[next+1],dz=source[at+2]-destination[next+2];
    const squared=dx*dx+dy*dy+dz*dz;
    if(squared<best){best=squared;nearest=candidate;}
   }
   used[nearest]=1;
   assigned.set(destination.subarray(nearest*3,nearest*3+3),at);
  }
  return assigned;
 });
 const color=new T.Color();
 const themes=[.56,.94,.61,.11,.77];
 function tick(time,showTime=time){
  const rotation=time*.11;
  rotor.rotation.z=rotation;
  for(const {cabin,angle} of cabins){
   cabin.position.set(Math.cos(angle+rotation)*radius,centerY+Math.sin(angle+rotation)*radius,0);
   cabin.rotation.z=Math.sin(time*.7+angle)*.025;
  }
  // The same drones fly between formations along staggered curved paths.
  const phase=showTime/14,from=Math.floor(phase)%formations.length,to=(from+1)%formations.length;
  const stage=phase%1;

  for(let i=0;i<targets.length;i++){
   const stagger=(Math.sin(i*3.71)*.5+.5)*.07;
   const progress=T.MathUtils.smoothstep(stage,.46+stagger,.91+stagger);
   const arc=Math.sin(progress*Math.PI);
   const a=formations[from],b=transitions[from],at=i*3;
   const lane=(i%7-3)*.28;
   positions[at]=T.MathUtils.lerp(a[at],b[at],progress);
   positions[at+1]=T.MathUtils.lerp(a[at+1],b[at+1],progress)+arc*.22;
   positions[at+2]=T.MathUtils.lerp(a[at+2],b[at+2],progress)+arc*lane;
   const hue=T.MathUtils.lerp(themes[from],themes[to],progress);
   color.setHSL((hue+positions[at+1]*.003+1)%1,.72,.73);
   colors.set([color.r,color.g,color.b],at);
  }
  geometry.attributes.position.needsUpdate=true;
  geometry.attributes.color.needsUpdate=true;
 }
 tick(0);
 return {tick};
}
