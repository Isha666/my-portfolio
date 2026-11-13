import {makeMarineBloom} from './marine-bloom.js';

export function makeMarineFloorLife(T,scene,floor,random){
 const colors=[
  ['#74fbe2','#48b5ee','#d3fcff'],
  ['#f386c8','#ab78f6','#ffe6f8'],
  ['#f3b77b','#fa82a0','#fff6c5']
 ];
 const blossoms=[[-5,4],[5,-2],[-7,-10],[11,-10],[-11,-18],[4,-16],[13,7],[-15,3],[8,-27],[-8,-30]];
 const blooms=blossoms.map(([x,z],i)=>{
  const flower=makeMarineBloom(T,scene,{scale:.37+random()*.43,colors:colors[i%3],rows:10,cols:7});
  flower.root.position.set(x,floor(x,z)+.08,z);
  flower.root.rotation.y=i*2.4;
  return flower;
 });
 const positions=[],tints=[],seeds=[];
 const shrubs=[[-3,2],[4,-3],[-8,-7],[9,-10],[-11,-12],[6,-17],[-7,-23],[13,-21],[-13,8],[9,9],[21,-15],[-22,-16]];
 shrubs.forEach(([x,z],i)=>{
  const base=floor(x,z),size=.63+random()*.76;
  const c0=new T.Color(colors[i%3][0]),c1=new T.Color(colors[i%3][1]);
  for(let branch=0;branch<9;branch++){
   const a=branch*2.39996+i,reach=.38+random()*.51,height=.32+random()*.59;
   for(let j=0;j<135;j++){
    const t=random(),spread=t*t*.21+.022,angle=random()*Math.PI*2;
    const r=Math.sqrt(random())*spread,stem=reach*t**1.7;
    positions.push(x+size*(Math.cos(a)*stem+Math.cos(angle)*r),base+size*(height*t+Math.sin(angle)*r*.6),z+size*(Math.sin(a)*stem+Math.sin(angle)*r));
    const tint=c0.clone().lerp(c1,(branch%5)/5).multiplyScalar(.53+t*.61);
    tints.push(tint.r,tint.g,tint.b);seeds.push(t,i*.8);
   }
  }
 });
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geometry.setAttribute('tint',new T.Float32BufferAttribute(tints,3));
 geometry.setAttribute('phase',new T.Float32BufferAttribute(seeds,2));
 const clock={value:0};
 const material=new T.ShaderMaterial({
  transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{clock},
  vertexShader:`uniform float clock;attribute vec3 tint;attribute vec2 phase;varying vec3 c;varying float glow;
   void main(){vec3 p=position;p.x+=sin(clock*.9+phase.y+phase.x)*phase.x*.12;
   p.z+=cos(clock*.65+phase.y)*phase.x*.07;vec4 eye=modelViewMatrix*vec4(p,1.);
   gl_Position=projectionMatrix*eye;gl_PointSize=clamp(36./max(1.,-eye.z),1.,5.);
   glow=(.64+.36*sin(clock*1.45+phase.y+phase.x*5.))*exp(-length(eye.xyz)*.028);c=tint;}`,
  fragmentShader:`varying vec3 c;varying float glow;
   void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(c,(1.-smoothstep(.09,.5,r))*glow);}`
 });
 scene.add(new T.Points(geometry,material));
 return (t,camera)=>{
  clock.value=t;
  blooms.forEach((flower,i)=>{
   const nearby=flower.root.position.distanceToSquared(camera)<625;
   flower.root.visible=nearby;
   if(nearby)flower.update(.10+.90*(.5-.5*Math.cos(t*(.70+(i%3)*.12)+i*1.76)));
  });
 };
}
