import * as T from './vendor/three.module.js';
import {disposeScene} from './scene-resources.js';
import {makeMarineFloorLife} from './marine-floor-life.js';

export function createPressureLift(){
 const ocean=new T.Scene();
 ocean.background=new T.Color('#08243b');
 ocean.fog=new T.FogExp2('#0c3950',.061);
 ocean.add(new T.HemisphereLight('#65cbea','#184452',2.0));
 const spotlight=new T.DirectionalLight('#a2f7fd',2.4);
 spotlight.position.set(-3,16,-18);ocean.add(spotlight);
 const cabin=new T.Group();
 const steel=new T.MeshStandardMaterial({color:'#243c53',metalness:.63,roughness:.38,emissive:'#142338',emissiveIntensity:.46});
 const rim=new T.MeshStandardMaterial({color:'#6e99aa',metalness:.54,roughness:.33,emissive:'#2c4153',emissiveIntensity:.3});
 const light=new T.MeshBasicMaterial({color:'#75e7ff',toneMapped:false});
 const warmLight=new T.MeshBasicMaterial({color:'#ef8eb8',toneMapped:false});
 const box=new T.BoxGeometry(1,1,1),plane=new T.PlaneGeometry(1,1);
 function beam(parent,material,x,y,z,w,h,d){
  const mesh=new T.Mesh(box,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
 }
 beam(cabin,steel,0,-1.48,-1.05,5.3,.22,4.5);
 for(let i=0;i<13;i++)beam(cabin,rim,(i-6)*.37,-1.36,-1.08,.023,.016,4.45);
 beam(cabin,steel,0,1.46,-1.10,5.3,.22,4.5);
 for(const side of [-1,1]){
  beam(cabin,steel,side*2.47,0,-2.85,.22,2.92,.38);
  beam(cabin,rim,side*2.34,0,-2.75,.06,2.92,.18);
  beam(cabin,steel,side*1.48,-.86,-2.74,.13,.09,.12);
  beam(cabin,light,side*1.23,1.31,-2.78,2.45,.035,.055);
  beam(cabin,warmLight,side*1.23,-1.34,-2.76,2.45,.028,.055);
  beam(cabin,steel,side*2.5,0,-.72,.15,2.9,.15);
  beam(cabin,rim,side*2.51,-.73,-1.4,.085,.07,2.86);
 }
 const glass=new T.ShaderMaterial({
  transparent:true,depthWrite:false,side:T.DoubleSide,
  uniforms:{clock:{value:0},pressure:{value:1},waterline:{value:0},clearing:{value:0}},
  vertexShader:`varying vec2 pane;void main(){pane=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
   varying vec2 pane;
   uniform float clock,pressure,waterline,clearing;
   float hash(float x){return fract(sin(x*134.57)*43758.5453);}
   void main(){
    float x=pane.x*58.;
    float column=floor(x);
    float rate=.8+hash(column)*1.8;
    float y=pane.y+clock*rate*(.3+pressure);
    float stripe=exp(-pow((fract(x)-.5)*11.,2.));
    float streak=stripe*smoothstep(.25,.70,fract(y+hash(column*17.)))*(.3+hash(column)*.7);
    float droplets=pow(max(0.,sin(y*43.+column*2.)),14.)*stripe;
    float edge=pow(abs(pane.x-.5)*2.,8.)+pow(abs(pane.y-.5)*2.,10.);
    float line=exp(-abs(pane.y-waterline)*36.)*step(.001,waterline)*step(waterline,.999);
    float alpha=.04+edge*.065+streak*(.14+.19*pressure)+droplets*.13+line*.24;
    vec3 tint=mix(vec3(.24,.72,.8),vec3(.65,.84,1.),line+streak*.5);
    gl_FragColor=vec4(tint,alpha*(1.-.87*clearing));
   }
  `
 });
 const doors=[];
 for(const side of [-1,1]){
  const door=new T.Group();door.position.set(side*1.21,0,-2.85);cabin.add(door);doors.push(door);
  const pane=new T.Mesh(plane,glass);pane.scale.set(2.38,2.63,1);door.add(pane);
  beam(door,rim,-side*1.19,0,.03,.065,2.66,.095);
  beam(door,steel,0,-1.13,.035,2.38,.105,.12);
  const window=new T.Mesh(plane,glass);
  window.position.set(side*2.46,0,-1.39);window.rotation.y=Math.PI/2;window.scale.set(2.79,2.62,1);cabin.add(window);
 }
 let seed=11;
 const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const range=(a,b)=>a+(b-a)*random();
 const rock=new T.DodecahedronGeometry(1,0);
 const stone=new T.MeshStandardMaterial({color:'#294a5b',roughness:.83});
 beam(ocean,stone,1,-25,-21,85,5,90);
 for(let i=0;i<52;i++){
  const x=range(-40,40),z=range(-64,2);
  if(Math.abs(x-2)<11&&z>-20)continue;
  const mesh=new T.Mesh(rock,stone);mesh.position.set(x,-22.8,z);
  mesh.scale.set(range(.55,5),range(.6,4.5),range(.6,4.8));mesh.rotation.y=range(0,6.28);ocean.add(mesh);
 }
 const reef=new T.Group();
 reef.position.set(0,0,-14);reef.scale.set(1.28,1,1.18);
 ocean.add(reef);
 const animateReef=makeMarineFloorLife(T,reef,()=>-22.4,random);
 const reefEye=new T.Vector3();
 // Fixed guide rails and illuminated depth marks provide a visible speed reference.
 for(const side of [-1,1]){
  beam(ocean,steel,2+side*3.2,-11,4.0,.24,27,.24);
  for(let y=-23;y<1;y+=1.75)beam(ocean,y%3===0?warmLight:light,2+side*3.2,y,4.0,.45,.05,.28);
 }
 const surface=new T.Mesh(new T.PlaneGeometry(180,150),new T.ShaderMaterial({
  side:T.DoubleSide,uniforms:{clock:{value:0}},
  vertexShader:`varying vec2 world;void main(){world=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 world;uniform float clock;void main(){
   float ripples=sin(world.x*1.3+clock*2.1+cos(world.y*1.4))+sin(world.y*1.7-clock*1.9+sin(world.x*.8));
   float shimmer=pow(max(0.,ripples*.5),5.);
   gl_FragColor=vec4(vec3(.10,.31,.42)+vec3(.26,.53,.55)*shimmer,1.);
  }`
 }));
 surface.rotation.x=-Math.PI/2;surface.position.set(0,-.7,-26);ocean.add(surface);
 const bubbles=new T.BufferGeometry(),points=new Float32Array(220*3);
 const particles=Array.from({length:220},()=>[range(-11,11),range(0,29),range(-18,1),range(.35,1.7)]);
 bubbles.setAttribute('position',new T.BufferAttribute(points,3).setUsage(T.DynamicDrawUsage));
 const spray=new T.Points(bubbles,new T.ShaderMaterial({
  transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:`void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(38./-p.z,1.,10.);}`,
  fragmentShader:`void main(){float d=length(gl_PointCoord-.5);float a=exp(-pow((d-.30)*11.,2.))*(1.-smoothstep(.40,.50,d));gl_FragColor=vec4(.58,.89,1.,a*.44);}`
 }));
 spray.frustumCulled=false;ocean.add(spray);
 const ease=(t,a,b)=>T.MathUtils.smoothstep(t,a,b);
 return {
  duration:5.15,
  render(renderer,city,camera,t,streetPosition,streetLook){
   const rise=ease(t,.24,3.98);
   light.color.setRGB(.46+.46*ease(t,2.62,3.5),.82-.44*ease(t,2.62,3.5),1.);
   const above=rise>.79;
   const outside=above?city:ocean;
   if(cabin.parent!==outside)outside.add(cabin);
   const eyeY=T.MathUtils.lerp(-22,streetPosition.y,rise);
   const shake=Math.sin(t*37)*.027*Math.sin(Math.PI*rise);
   camera.position.copy(streetPosition);
   camera.position.y=eyeY+shake;
   const exit=ease(t,4.15,5.15);
   const inclination=(.20+Math.sin(rise*Math.PI)*.12)*(1-ease(t,3.3,4.45));
   camera.lookAt(streetLook.x,eyeY+inclination+(streetLook.y-streetPosition.y)*exit,streetLook.z);
   cabin.scale.x=T.MathUtils.clamp(camera.aspect*.57,.33,1.25);
   cabin.position.copy(camera.position);
   cabin.position.z+=exit*5.6;
   const open=ease(t,4.06,4.86);
   doors.forEach((door,i)=>{door.position.x=(i?1:-1)*(1.21+open*1.28);});
   surface.material.uniforms.clock.value=t;
   glass.uniforms.clock.value=t;
   glass.uniforms.pressure.value=Math.sin(Math.PI*rise)*.78+.18;
   glass.uniforms.waterline.value=ease(t,2.91,3.59);
   glass.uniforms.clearing.value=ease(t,3.24,4.20);
   particles.forEach(([x,y,z,speed],i)=>{
    points[i*3]=x+2+Math.sin(t+y)*.17;
    points[i*3+1]=-26+(y+t*speed)%29;
    points[i*3+2]=z;
   });
   bubbles.attributes.position.needsUpdate=true;
   if(!above)animateReef(t,reef.worldToLocal(reefEye.copy(camera.position)));
   renderer.render(outside,camera);
  },
  dispose(){
   cabin.removeFromParent();
   // The rail and cabin share materials so they are disposed in a single traversal.
   ocean.add(cabin);disposeScene(ocean);
  }
 };
}
