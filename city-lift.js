import * as T from './vendor/three.module.js';
import {disposeScene} from './scene-resources.js';
import {createMarineWorld,createReefHatch} from './marine-world.js?v=hatch-entry-1';

export const hatchApproachDuration=2.15;

export function createPressureLift(camera){
 const reef=createMarineWorld(T,camera,null,{preview:true});
 const ocean=reef.scene,reefDatum=25;
 ocean.fog.density=.018;
 const fill=new T.HemisphereLight('#71c9f9','#203456',.65);
 ocean.add(fill);
 const cabin=new T.Group();
 const {hatch,hatchLeaves}=createReefHatch(T,{closedShaft:false});
 ocean.add(hatch);
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
    gl_FragColor=vec4(tint,alpha*(.78-.69*clearing));
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
 // Fixed guide rails and illuminated depth marks provide a visible speed reference.
 for(const side of [-1,1]){
  beam(ocean,steel,2+side*3.2,reefDatum-11,4.0,.24,27,.24);
  for(let y=-23;y<1;y+=1.75)beam(ocean,y%3===0?warmLight:light,2+side*3.2,y+reefDatum,4.0,.45,.05,.28);
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
 surface.rotation.x=-Math.PI/2;surface.position.set(0,reefDatum-.7,-26);ocean.add(surface);
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
  duration:hatchApproachDuration+5.15,
  render(renderer,city,camera,elapsed,streetPosition,streetLook){
   const t=Math.max(0,elapsed-hatchApproachDuration);
   const rise=ease(t,.24,3.98);
   light.color.setRGB(.46+.46*ease(t,2.62,3.5),.82-.44*ease(t,2.62,3.5),1.);
   const above=rise>.79;
   const outside=above?city:ocean;
   if(cabin.parent!==outside)outside.add(cabin);
   const eyeY=T.MathUtils.lerp(-22,streetPosition.y,rise);
   const shake=Math.sin(t*37)*.027*Math.sin(Math.PI*rise);
   camera.position.copy(streetPosition);
   camera.position.y=eyeY+shake+(above?0:reefDatum);
   const exit=ease(t,4.15,5.15);
   const inclination=T.MathUtils.lerp(-1.1,.24,ease(t,1.7,3.6))*(1-ease(t,3.9,4.45));
   camera.lookAt(streetLook.x,camera.position.y+inclination+(streetLook.y-streetPosition.y)*exit,streetLook.z);
   cabin.scale.x=T.MathUtils.clamp(camera.aspect*.57,.33,1.25);
   cabin.position.copy(camera.position);
   cabin.position.z+=exit*5.6;
   const open=ease(t,4.06,4.86);
   doors.forEach((door,i)=>{door.position.x=(i?1:-1)*(1.21+open*1.28);});
   const approaching=elapsed<hatchApproachDuration;
   hatch.visible=approaching;
   if(approaching){
    hatch.position.copy(cabin.position);
    hatch.position.z+=1.95;
    const approach=ease(elapsed,0,.68);
    const cross=ease(elapsed,.60,hatchApproachDuration);
    camera.position.x+=.85*(1-approach);
    camera.position.y+=.65*(1-approach);
    camera.position.z+=T.MathUtils.lerp(7.95,4.45,approach)*(1-cross);
    camera.lookAt(cabin.position.x,cabin.position.y+inclination*cross,cabin.position.z+T.MathUtils.lerp(1.95,streetLook.z-streetPosition.z,cross));
    const opening=ease(elapsed,.38,1.26);
    hatchLeaves.forEach((leaf,index)=>{leaf.position.x=(index?1:-1)*2.25*opening;});
   }
   surface.material.uniforms.clock.value=elapsed;
   glass.uniforms.clock.value=elapsed;
   glass.uniforms.pressure.value=Math.sin(Math.PI*rise)*.78+.18;
   glass.uniforms.waterline.value=ease(t,2.91,3.59);
   glass.uniforms.clearing.value=ease(t,3.24,4.20);
   particles.forEach(([x,y,z,speed],i)=>{
    points[i*3]=x+2+Math.sin(elapsed+y)*.17;
    points[i*3+1]=reefDatum-26+(y+elapsed*speed)%29;
    points[i*3+2]=z;
   });
   bubbles.attributes.position.needsUpdate=true;
   if(!above)reef.tick(1/60,elapsed);
   renderer.render(outside,camera);
  },
  dispose(){
   cabin.removeFromParent();
   // The rail and cabin share materials so they are disposed in a single traversal.
   ocean.add(cabin);disposeScene(ocean);
  }
 };
}
