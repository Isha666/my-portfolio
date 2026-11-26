import * as T from './vendor/three.module.js';

// Ten fixed sky sectors, alternating choreographed drones and fireworks.
// Their angular separation and compact silhouettes keep portrait views uncluttered.
export const skySites=Array.from({length:10},(_,index)=>{
 const angle=index*Math.PI/5;
 return {index,angle,position:new T.Vector3(55+Math.sin(angle)*920,330+(index%3)*46,-100-Math.cos(angle)*920)};
});

export function createCitySky(scene){
 const clock={value:0};
 const color=new T.Color();
 const moon=new T.Mesh(new T.PlaneGeometry(112,112),new T.ShaderMaterial({
  transparent:true,depthWrite:false,
  vertexShader:'varying vec2 p;void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 p;
   float crater(vec2 c,float radius){float d=length(p-c);return exp(-pow((d-radius)*35.,2.))*.08-exp(-d*d/(radius*radius))*.13;}
   void main(){float r=length(p);float disk=1.-smoothstep(.565,.58,r);
    float grain=sin(p.x*143.+sin(p.y*70.))*sin(p.y*127.)*.018;
    float relief=crater(vec2(-.17,.12),.12)+crater(vec2(.21,-.18),.09)+crater(vec2(.12,.29),.07)+crater(vec2(-.28,-.23),.055);
    float shade=.88+relief+grain-.13*r;
    vec3 surface=vec3(.94,.95,1.)*shade;
    float halo=exp(-max(0.,r-.56)*10.)*.12;
    gl_FragColor=vec4(mix(vec3(.48,.61,.9),surface,disk),disk+halo*(1.-disk));}`
 }));
 moon.position.set(-170,520,-1100);moon.lookAt(55,0,-100);moon.layers.enableAll();scene.add(moon);

 // Ballistic sparks and their short tails are evaluated on the GPU. No particle
 // objects, textures, frame allocations, or particle respawning on the CPU.
 const origins=[],directions=[],seeds=[],tints=[];
 const palette=['#ffdca0','#ff8fba','#9bdfff','#c1a1ff','#ffe6bf'];
 for(const site of skySites.filter(site=>site.index%2===1))for(let burst=0;burst<3;burst++){
  color.set(palette[(site.index+burst)%palette.length]);
  for(let spark=0;spark<90;spark++){
   const latitude=1-2*(spark+.5)/90,angle=spark*2.3999632297;
   const ring=Math.sqrt(1-latitude*latitude);
   for(let tail=0;tail<4;tail++){
    origins.push(site.position.x+(burst-1)*44,site.position.y+burst*18,site.position.z);
    directions.push(ring*Math.cos(angle),latitude,ring*Math.sin(angle));
    seeds.push((site.index*.81+burst*2.8)%11,tail*.055,.85+(spark%7)*.025);
    tints.push(color.r,color.g,color.b);
   }
  }
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(origins,3));
 geometry.setAttribute('direction',new T.Float32BufferAttribute(directions,3));
 geometry.setAttribute('seed',new T.Float32BufferAttribute(seeds,3));
 geometry.setAttribute('color',new T.Float32BufferAttribute(tints,3));
 const fireworks=new T.Points(geometry,new T.ShaderMaterial({
  uniforms:{time:clock},transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,
  vertexShader:`attribute vec3 direction;attribute vec3 seed;uniform float time;varying vec3 tint;varying float alpha;
   void main(){float cycle=mod(time+seed.x,11.);float age=cycle-1.65-seed.y;
    vec3 point=position;alpha=0.;tint=color;
    if(cycle<1.65){float rise=clamp((cycle-seed.y)/1.65,0.,1.);point.y-=95.*(1.-rise*rise);
     point.x+=sin(rise*3.)*3.;alpha=.85*(1.-seed.y*3.);tint=vec3(1.,.85,.52);}
    else if(age>=0.&&age<4.2){float expansion=52.*(1.-exp(-age*.85))*seed.z;
     point+=direction*expansion;point.y-=3.8*age*age;
     float shimmer=.78+.22*sin(age*23.+direction.x*40.);
     alpha=pow(max(0.,1.-age/4.2),.85)*shimmer*(1.-seed.y*3.);
     tint=mix(color,vec3(1.,.76,.4),smoothstep(1.8,4.2,age)*.65);}
    vec4 p=modelViewMatrix*vec4(point,1.);gl_Position=projectionMatrix*p;
    gl_PointSize=clamp(2800./max(1.,-p.z),2.,5.)*(1.-seed.y*2.);}`,
  fragmentShader:`varying vec3 tint;varying float alpha;void main(){float r=length(gl_PointCoord-.5)*2.;float core=exp(-r*r*7.);gl_FragColor=vec4(tint*(1.+core*.8),core*alpha);}`
 }));
 fireworks.frustumCulled=false;fireworks.layers.enableAll();scene.add(fireworks);
 return {tick(time){clock.value=time;}};
}
