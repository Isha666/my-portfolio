import * as T from './vendor/three.module.js';
import {disposeScene} from './scene-resources.js';

export const towerDistance=85;
export const driveLength=107;
const avenue=d=>Math.sin(d*.022)*3.2;

export function createCityScene(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.23;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(51,1,.1,335);
 scene.background=new T.Color('#141a38');
 scene.fog=new T.FogExp2('#22213e',.009);
 scene.add(new T.HemisphereLight('#a8b8ff','#745a81',2.15));
 scene.add(new T.AmbientLight('#a790bf',.40));
 const sky=new T.Mesh(new T.SphereGeometry(1,32,16),new T.ShaderMaterial({
  side:T.BackSide,depthTest:false,depthWrite:false,
  vertexShader:`varying vec3 ray;void main(){ray=position;vec4 p=projectionMatrix*viewMatrix*vec4(position,0.);gl_Position=p.xyww;}`,
  fragmentShader:`varying vec3 ray;
   float hash(vec2 p){return fract(sin(dot(p,vec2(112.2,312.5)))*43758.54);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
   void main(){
    vec3 d=normalize(ray);
    vec3 color=mix(vec3(.18,.13,.26),vec3(.028,.043,.13),smoothstep(0.,.68,d.y));
    vec2 p=d.xz/sqrt(.045+d.y*d.y)*4.;
    float clouds=smoothstep(.43,.78,noise(p)*.63+noise(p*2.)*.25+noise(p*4.)*.12);
    color+=vec3(.10,.11,.16)*clouds*smoothstep(-.05,.28,d.y);
    gl_FragColor=vec4(color,1.);
   }
  `
 }));
 sky.renderOrder=-1000;sky.frustumCulled=false;scene.add(sky);
 const moon=new T.DirectionalLight('#a4beff',2.3);
 moon.position.set(-15,36,14);scene.add(moon);
 let seed=119;
 const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const range=(a,b)=>a+(b-a)*random();
 const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,12,8),wheel=new T.CylinderGeometry(1,1,1,20);
 const standard=(color,roughness=.62,metalness=.12)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const lit=color=>new T.MeshBasicMaterial({color,toneMapped:false});
 function part(parent,geometry,material,x,y,z,w,h,d){
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
 }
 const slab=standard('#3b3649'),road=standard('#29273a',.30,.30),walk=standard('#565169',.5),roof=standard('#303047');
 const neon=['#ed60cf','#67e3ff','#c091ff','#ffd08a'].map(lit);
 const litWindows=neon.map(()=>[]),frames=[];
 const darkGlass=standard('#273b57',.21,.65);
 const white=lit('#dddbff'),amber=lit('#ffd08a'),red=lit('#ff405e');
 const reflectionGeo=new T.PlaneGeometry(1,1);
 const wash=neon.map(m=>new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tint:{value:m.color}},vertexShader:`
  varying vec2 coords;void main(){coords=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
 `,fragmentShader:`
  uniform vec3 tint;varying vec2 coords;void main(){
   float width=mix(.09,.38,coords.y+.5);
   float edge=exp(-abs(coords.x)/width)*(1.-smoothstep(.13,.5,abs(coords.y)));
   float ripple=.67+.33*sin(coords.y*340.+sin(coords.x*49.)*3.);
   gl_FragColor=vec4(tint,edge*ripple*.25);
  }
 `}));
 for(let d=-8;d<=168;d+=4){
  const x=avenue(d),z=-d;
  part(scene,box,road,x,-.11,z,15,.18,4.12);
  part(scene,box,amber,x,.004,z,.13,.008,1.55);
  for(const side of [-1,1]){
   part(scene,box,walk,x+side*9,.04,z,3.2,.23,4.12);
   part(scene,box,slab,x+side*7.45,.13,z,.13,.20,4.12);
   part(scene,box,white,x+side*6.6,.003,z,.055,.006,3.98);
   if(d%12===0){
    const lampX=x+side*7.8;
    part(scene,box,roof,lampX,2.1,z,.11,4.2,.11);
    part(scene,box,amber,lampX-side*.25,4.16,z,.57,.07,.26);
    const glow=part(scene,reflectionGeo,wash[3],x+side*5,.02,z,2.8,7,1);glow.rotation.x=-Math.PI/2;
   }
  }
 }
 function building(x,z,w,h,depth,palette,hero=false){
  part(scene,box,slab,x,h*.5,z,w,h,depth);
  part(scene,box,darkGlass,x,h*.51,z,w*.92,h*.89,depth+.02);
  part(scene,box,roof,x,h+.2,z,w*1.03,.42,depth*1.02);
  part(scene,box,slab,x+w*.13,h+.85,z,2.1,1.3,2.6);
  const col=Math.max(2,Math.floor(w/1.23));
  for(let floor=0;floor<Math.floor(h/1.65);floor++){
   const y=1.3+floor*1.65;
   for(let i=0;i<col;i++){
    if(random()<.24)continue;
    const wx=x+((i+.5)/col-.5)*w*.95;
    litWindows[(floor+i)%9<6?palette:3].push([wx,y,z+depth*.5+.025,.64,.52,.035]);
    if(floor%2===0)litWindows[palette].push([x-Math.sign(x)*w*.5,y,z+(i/col-.5)*depth,.035,.55,.65]);
   }
   if(floor%3===0)frames.push([x,y-.65,z+depth*.5+.035,w,.065,.09]);
  }
  const face=x-Math.sign(x)*w*.51;
  for(const side of [-1,1]){
   part(scene,box,roof,face,1.85,z+side*depth*.30,.17,3.3,depth*.26);
   part(scene,box,neon[palette],face-Math.sign(x)*.10,2.8,z+side*depth*.30,.12,.09,depth*.23);
  }
  part(scene,box,neon[palette],face,h*.56,z+depth*.47,.10,h*.75,.09);
  if(hero){
   part(scene,box,neon[1],face,3.15,z,.18,.12,4.6);
   part(scene,box,darkGlass,face,1.55,z,.16,3.0,3.5);
   for(const k of [-1,1])part(scene,box,white,face,1.62,z+k*1.7,.22,3.2,.07);
   part(scene,box,roof,face-Math.sign(x)*1.4,3.5,z,3,.38,4.7);
   part(scene,box,neon[1],face-Math.sign(x)*2.9,3.32,z,.08,.15,4.68);
  }
 }
 for(let d=2;d<160;d+=13)for(const side of [-1,1]){
  const hero=side===1&&d===80;
  building(avenue(d)+side*range(14,17),-d,range(6,9),hero?30:range(8,29),range(7,11),hero?1:Math.floor(range(0,4)),hero);
  building(side*range(26,49),-d-range(0,19),range(7,13),range(24,52),range(8,13),Math.floor(range(0,4)));
  const reflection=part(scene,reflectionGeo,wash[hero?1:Math.floor(range(0,4))],avenue(d)+side*4.8,.021,-d,3.2,11,1);
  reflection.rotation.x=-Math.PI/2;
 }
 const matrix=new T.Matrix4();
 for(const [material,list] of [...litWindows.map((items,i)=>[neon[i],items]),[roof,frames]]){
  const batch=new T.InstancedMesh(box,material,list.length);
  list.forEach(([x,y,z,w,h,d],i)=>{matrix.makeScale(w,h,d).setPosition(x,y,z);batch.setMatrixAt(i,matrix);});
  scene.add(batch);
 }
 // Combine the repeated architecture and road parts before adding moving actors.
 const staticBatches=new Map();
 for(const mesh of [...scene.children]){
  if(mesh.geometry!==box||mesh.isInstancedMesh)continue;
  if(!staticBatches.has(mesh.material))staticBatches.set(mesh.material,[]);
  mesh.updateMatrix();
  staticBatches.get(mesh.material).push(mesh.matrix);
  mesh.removeFromParent();
 }
 for(const [material,matrices] of staticBatches){
  const batch=new T.InstancedMesh(box,material,matrices.length);
  matrices.forEach((transform,i)=>batch.setMatrixAt(i,transform));scene.add(batch);
 }
 const party=[];
 for(const d of [27,53,105]){
  const group=new T.Group();group.position.set(avenue(d)-10,4,-d);scene.add(group);
  for(let i=0;i<3;i++){const beam=part(group,box,neon[i],0,i*.35,0,.045,.055,3.2);party.push(beam);}
 }
 const rubber=standard('#131319'),rim=standard('#6e6476',.35,.7);
 function car(color,player=false){
  const group=new T.Group(),paint=standard(color,.27,.66);
  part(group,ball,paint,0,.58,0,1.01,.43,2.13);
  part(group,box,paint,0,.47,.1,1.83,.34,3.71);
  part(group,ball,darkGlass,0,.94,.07,.78,.39,1.25);
  part(group,ball,paint,0,1.17,-.05,.71,.19,.82);
  part(group,box,red,0,.69,1.95,1.65,player?.09:.045,.065);
  for(const side of [-1,1]){
   part(group,box,white,side*.62,.6,-1.93,.39,.10,.067);
   for(const z of [-1.24,1.22]){
    const tire=part(group,wheel,rubber,side*.88,.37,z,.37,.23,.37);
    tire.rotation.z=Math.PI/2;
    const hub=part(group,wheel,rim,side*1,.37,z,.19,.023,.19);hub.rotation.z=Math.PI/2;
   }
  }
  scene.add(group);return group;
 }
 const hero=car('#712a63',true);
 const traffic=Array.from({length:11},(_,i)=>({model:car(['#363e6c','#9f675a','#393b41'][i%3]),offset:i*15,side:i%2?1:-1,speed:range(3.4,6.2)}));
 const figures=Array.from({length:24},(_,i)=>{
  const group=new T.Group(),coat=standard(['#ae584f','#687baa','#7b527e','#434855'][i%4]);
  part(group,ball,coat,0,1.06,0,.19,.32,.13);
  part(group,ball,standard('#bd8e78'),0,1.51,0,.11,.15,.105);
  const legs=[-1,1].map(side=>part(group,box,coat,side*.084,.39,0,.105,.65,.1));
  scene.add(group);return{group,legs,offset:i*6.4,side:i%2?1:-1};
 });
 let time=0;
 function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25,Math.sqrt(1500000/(w*h))));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 resize();
 return {resize,render(distance,dt,approach=0){
  time+=dt;
  const x=avenue(distance),z=-distance;
  hero.position.set(x+2,.03,z);hero.rotation.y=-Math.atan2(avenue(distance+1)-x,1);
  for(const {model,offset,side,speed} of traffic){
   const d=((offset+side*time*speed)%171+171)%171-10;
   model.position.set(avenue(d)+side*4.85,.02,-d);model.rotation.y=side===1?0:Math.PI;
  }
  figures.forEach(({group,legs,offset,side},i)=>{
   const d=(offset+time*(.65+i%3*.1))%158;
   group.position.set(avenue(d)+side*(8.65+i%3*.48),.20,-d);
   legs.forEach((leg,j)=>{leg.rotation.x=Math.sin(time*5.5+i+j*Math.PI)*.51;});
  });
  party.forEach((beam,i)=>{beam.rotation.y=Math.sin(time*.9+i)*.73;beam.scale.z=2.7+Math.sin(time*2+i)*.46;});
  const mobile=camera.aspect<.76;
  camera.position.set(x+T.MathUtils.lerp(2.1,8.0,approach),T.MathUtils.lerp(mobile?5.2:4.65,2.05,approach),z+T.MathUtils.lerp(mobile?9.5:8.6,2.4,approach));
  camera.lookAt(x+T.MathUtils.lerp(1.7,14.5,approach),T.MathUtils.lerp(1.55,2.25,approach),z+T.MathUtils.lerp(-5,5,approach));
  renderer.render(scene,camera);
 },dispose(){disposeScene(scene);renderer.dispose();}};
}
