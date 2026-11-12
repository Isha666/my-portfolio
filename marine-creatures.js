import {makeMarineShark} from './marine-shark.js';
import {makeMarineRelics} from './marine-relics.js';
import {makeMarineBloom} from './marine-bloom.js';
export function marineCreatures(T,scene){
 const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
 const standard=(color,emissive=color,intensity=.12)=>new T.MeshStandardMaterial({color,emissive,emissiveIntensity:intensity,roughness:.58});
 const ball=new T.SphereGeometry(1,18,12);
 function mesh(parent,geo,mat,p=V(),s=V(1,1,1)){const o=new T.Mesh(geo,mat);o.position.copy(p);o.scale.copy(s);parent.add(o);return o;}
 function group(x,y,z){const g=new T.Group();g.position.set(x,y,z);scene.add(g);return g;}
 function tube(parent,pts,r,mat){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,r,6,false),mat);}
 const tree=group(-18,-4,1);tree.scale.setScalar(1.22);
 const nodes=[],treeTips=[];let seed=219;const rng=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 function bough(p,d,len,depth,branch=0){const tip=p.clone().addScaledVector(d,len),mid=p.clone().lerp(tip,.53).add(V(.21,.13,-.22)),curve=new T.CatmullRomCurve3([p,mid,tip]);const rad=.24*Math.pow(.67,4-depth);
  for(let i=0;i<(depth===4?1550:depth===3?510:165);i++){const u=rng(),q=curve.getPoint(u),r=rad*Math.sqrt(rng())*(1-u*.45),a=rng()*6.28;q.add(V(Math.cos(a)*r,(rng()-.5)*r,Math.sin(a)*r));q.branch=branch;nodes.push(q);}
  if(depth>0){for(let i=0;i<(depth===3?4:3);i++){const a=i*2.4+rng()+tip.x,bend=depth===4?.85:.72;bough(tip,V(d.x*.6+Math.cos(a)*bend,.42+rng()*.37,d.z*.6+Math.sin(a)*bend).normalize(),len*(.59+rng()*.12),depth-1,depth===4?i:branch);}}
  else {if(!treeTips[branch]||tip.y>treeTips[branch].y)treeTips[branch]=tip.clone();for(let i=0;i<300;i++){const a=rng()*6.28,h=rng()*2-1,r=Math.cbrt(rng())*.88,n=Math.sqrt(1-h*h);const q=tip.clone().add(V(Math.cos(a)*n*r,h*r*.68,Math.sin(a)*n*r));q.branch=branch;nodes.push(q);}}
 }
 bough(V(),V(.13,1,.02).normalize(),3.2,4);
 const cloudGeo=new T.BufferGeometry(),luminous=new Float32Array(nodes.length*3),heights=new Float32Array(nodes.length),random=new Float32Array(nodes.length),branchId=new Float32Array(nodes.length);
 nodes.forEach((p,i)=>{luminous.set([p.x,p.y,p.z],i*3);heights[i]=p.y;random[i]=rng();branchId[i]=p.branch;});
 cloudGeo.setAttribute('branchId',new T.BufferAttribute(branchId,1));cloudGeo.setAttribute('position',new T.BufferAttribute(luminous,3));cloudGeo.setAttribute('level',new T.BufferAttribute(heights,1));cloudGeo.setAttribute('seed',new T.BufferAttribute(random,1));
 const treeUniforms={clock:{value:0},charge:{value:0},gust:{value:0},selected:{value:-1},rayOrigin:{value:V()},rayDirection:{value:V(0,0,1)},hover:{value:0},pixel:{value:Math.min(devicePixelRatio,2)}};
 const treeGlow=new T.Points(cloudGeo,new T.ShaderMaterial({uniforms:treeUniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:`attribute float level,seed,branchId;uniform float clock,charge,gust,pixel,selected,hover;uniform vec3 rayOrigin,rayDirection;varying vec3 ink;varying float a;void main(){float k=smoothstep(1.,6.5,level),pulse=exp(-pow((level-charge*7.5)*1.1,2.));vec3 p=position;float gather=(1.-charge)*smoothstep(2.8,6.5,level)*.28;p=mix(p,vec3(p.x*.46,4.2+(p.y-4.2)*.40,p.z*.46),gather);vec3 delta=p-rayOrigin;vec3 fromRay=delta-rayDirection*max(0.,dot(delta,rayDirection));float radius=length(fromRay);float spread=exp(-pow((radius-.68)*5.2,2.))*hover;vec3 repel=normalize(fromRay+vec3(.0001));p+=repel*spread*.14;float phase=seed*250.+clock*.75;float shed=pow(seed,12.)*gust;p+=vec3(sin(phase)*(.04+shed*2.3),cos(phase*.7)*.04+shed*1.8,cos(phase)*(.04+shed*2.));vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(pixel*(12.+seed*16.)/max(1.,-mv.z),1.,4.);gl_Position=projectionMatrix*mv;vec3 tip=branchId<.5?vec3(.08,.67,1.):branchId<1.5?vec3(.66,.23,1.):vec3(.10,1.,.68);float picked=1.-step(.4,abs(branchId-selected));ink=mix(vec3(.08,.34,1.),tip,k)*(.52+charge*.29+picked*.6)+vec3(.18,.55,.7)*pulse;a=(.3+seed*.28+pulse*.29+spread*.18)*exp(-length(mv.xyz)*.017);}`,
 fragmentShader:`varying vec3 ink;varying float a;void main(){vec2 p=abs(gl_PointCoord-.5);float edge=1.-smoothstep(.32,.5,max(p.x,p.y));gl_FragColor=vec4(ink,a*edge);}`}));
 treeGlow.frustumCulled=false;tree.add(treeGlow);
 const rootWave=mesh(tree,new T.RingGeometry(.91,1,100),new T.MeshBasicMaterial({color:'#6fb8ff',side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false}),V(0,.04,0));rootWave.rotation.x=-Math.PI/2;
 const oyster=group(16,-2,-4),shells=[new T.Group(),new T.Group()];shells.forEach(g=>oyster.add(g));
 const shellMat=new T.MeshPhysicalMaterial({color:'#49336f',emissive:'#5f347e',emissiveIntensity:.27,roughness:.54,iridescence:.65,clearcoat:.24});
 const nacre=new T.MeshPhysicalMaterial({color:'#ecc7df',emissive:'#dd87be',emissiveIntensity:.24,roughness:.22,side:T.DoubleSide,iridescence:1,clearcoat:.85});
 const fiberClock={value:0};
 for(let j=0;j<2;j++){
  const s=j?1:-1,g=shells[j],outer=new T.SphereGeometry(2,56,32,0,Math.PI*2,j?0:Math.PI/2,Math.PI/2),p=outer.attributes.position;
  for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k),z=p.getZ(k),rib=1+.042*Math.cos(Math.atan2(z,x)*27)*Math.sqrt(Math.max(0,1-y*y/4));p.setXYZ(k,x*rib,y*.56,z*.83*rib);}outer.computeVertexNormals();mesh(g,outer,shellMat);
  const lip=new T.LatheGeometry(Array.from({length:27},(_,k)=>{const r=k/26;return new T.Vector2(r*1.98,s*(.23*(1-r*r)+.034*Math.sin(r*25)*r));}),64);mesh(g,lip,nacre,V(),V(1,1,.83));
  const positions=[],weights=[],seeds=[];
  for(let i=0;i<4800;i++){const a=i*2.39996,b=(i+.5)/4800,rad=Math.sqrt(1-b*b),x=Math.cos(a)*rad,z=Math.sin(a)*rad,base=V(2*x,s*1.12*b,1.66*z),n=V(x,s*b,z).normalize(),len=.09+rng()*.24,phi=rng()*6.28;
   for(let k=0;k<3;k++)for(const t of [k/3,(k+1)/3]){positions.push(base.x+n.x*len*t+Math.cos(phi)*t*t*.10,base.y+n.y*len*t,base.z+n.z*len*t+Math.sin(phi)*t*t*.10);weights.push(t);seeds.push(phi);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('weight',new T.Float32BufferAttribute(weights,1));geo.setAttribute('phase',new T.Float32BufferAttribute(seeds,1));
  const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{clock:fiberClock},vertexShader:`attribute float weight,phase;uniform float clock;varying vec3 ink;varying float a;void main(){vec3 p=position;float f=weight*weight;p.x+=sin(clock*1.8+phase+p.y)*f*.075;p.z+=cos(clock*1.4+phase+p.x)*f*.055;ink=mix(vec3(.36,.34,.79),vec3(.86,.38,.68),smoothstep(-2.,2.,p.x));a=.52-weight*.28;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec3 ink;varying float a;void main(){gl_FragColor=vec4(ink,a);}`});
  const coat=new T.LineSegments(geo,mat);g.add(coat);
 }
 const pearl=mesh(oyster,ball,new T.MeshPhysicalMaterial({color:'#ffe6ef',emissive:'#fa85b4',emissiveIntensity:.85,roughness:.18,iridescence:.85,clearcoat:1}),V(),V(.39,.39,.39));
 const pearlBloom=makeMarineBloom(T,oyster,{scale:1.2,colors:['#d58edc','#9da6ff','#ffd6ed']});
 const jelly=group(0,5,-22),jellies=[];
 function makeJelly(parent,scale,phase){const g=new T.Group();g.scale.setScalar(scale);parent.add(g);const bloom=makeMarineBloom(T,g,{scale:1.25});bloom.root.rotation.set(Math.PI*.75,0,.23);const core=mesh(g,ball,new T.MeshPhysicalMaterial({color:'#b7eaff',emissive:'#65acf4',emissiveIntensity:.55,transparent:true,opacity:.37,depthWrite:false,roughness:.24}),V(0,-.1,0),V(.37,.29,.37));const filaments=[];for(let i=0;i<20;i++){const p=new Float32Array(25*3),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));const line=new T.Line(geo,new T.LineBasicMaterial({color:i%3?'#8199e6':'#c4eaff',transparent:true,opacity:.65}));line.frustumCulled=false;g.add(line);filaments.push(line);}
 jellies.push({g,bloom,core,filaments,phase});return g;}
 makeJelly(jelly,1.35,0);makeJelly(jelly,.63,1);makeJelly(jelly,.45,2);
 const shark=makeMarineShark(T,scene);
 const values=[0,0,0,0].map(()=>({v:0})),landmarks=[tree,oyster,jelly,shark.group],unlocked=[false,false,false,false],manual=[null,null,null,null],live=[0,0,0,0];
 const artifacts=makeMarineRelics(T,landmarks),inverse=new T.Matrix4();let gust=0,hover=0,highlight=-1;
 return {landmarks,
  amount(i){return manual[i]??live[i];},isUnlocked(i){return unlocked[i];},
  relics:artifacts.relics,smallRocks:artifacts.smallRocks,
  cursor(ray){hover=ray?1:0;if(ray){tree.updateWorldMatrix(true,false);inverse.copy(tree.matrixWorld).invert();treeUniforms.rayOrigin.value.copy(ray.origin).applyMatrix4(inverse);treeUniforms.rayDirection.value.copy(ray.direction).transformDirection(inverse);}},
  release(i){manual[i]=null;},
  manipulate(i,dx,dy){const o=landmarks[i];o.rotation.y+=dx*.012;o.rotation.x=T.MathUtils.clamp(o.rotation.x+dy*.006,-.55,.55);if(i===0)gust=Math.min(1.8,gust+Math.abs(dx)*.022);},
  scrub(i,value){gsap.killTweensOf(values[i]);manual[i]=T.MathUtils.clamp(value,0,1);values[i].v=manual[i];},
  activate(i,on){if(i===0&&on)gust=1.65;if(i>0&&on)unlocked[i]=true;manual[i]=null;gsap.to(values[i],{v:on||unlocked[i]?1:0,duration:i===1?1.9:1.35,ease:'power2.inOut',overwrite:true});},
  treeTips,selectBranch(i){highlight=i;treeUniforms.selected.value=i;gust=i<0?0:1.5;},
  tick(t,dt){
   fiberClock.value=t;gust*=Math.exp(-dt*1.55);const b=values[0].v;treeUniforms.clock.value=t;treeUniforms.charge.value=b;treeUniforms.gust.value=gust;treeUniforms.hover.value=T.MathUtils.lerp(treeUniforms.hover.value,hover,1-Math.exp(-dt*12));rootWave.scale.setScalar(1+b*5.5);rootWave.material.opacity=Math.sin(b*Math.PI)*.45;
   const loop=(speed,offset=0)=>T.MathUtils.smoothstep(.5-.5*Math.cos(t*speed+offset),.06,.94);
   const s=manual[1]??(unlocked[1]?values[1].v*loop(1.06):values[1].v),jellyOpen=manual[2]??loop(1.52,.35);
   shells[0].position.y=-s*.51;shells[1].position.y=s*1.5;shells[1].rotation.x=-s*.52;shells[0].rotation.x=s*.20;pearl.position.y=s*.65+Math.sin(t*1.8)*.05;pearl.visible=s>.06;pearl.scale.setScalar(.39-s*.19);
   const q=T.MathUtils.smoothstep(s,.3,1);pearlBloom.root.visible=q>.01;pearlBloom.root.position.set(0,s*.18,.25);pearlBloom.root.rotation.set(.48,t*.16,0);if(q>.01)pearlBloom.update(q);
   jellies.forEach(({g,bloom,core,filaments,phase},i)=>{const opening=i===0?.15+jellyOpen*.83:.37+Math.sin(t*1.48+phase)*.23;g.position.set(i===0?0:i===1?-3.7:3.5,Math.sin(t*.45+phase)*.5+i*.9,Math.cos(t*.4+phase)*.65-i*1.4);g.rotation.y=t*.19+phase;g.userData.opening=opening;bloom.update(opening);core.scale.setScalar(.30+opening*.14);filaments.forEach((line,k)=>{const a=k/20*6.28,p=line.geometry.attributes.position,coreRadius=core.scale.x,attachment=(.32+(k%3)*.11)*coreRadius,baseY=core.position.y-coreRadius*.67;for(let j=0;j<25;j++){const u=j/24,spread=(.12+(k%3)*.13)*opening*Math.sin(u*Math.PI*.78),r=attachment+spread;p.setXYZ(j,Math.cos(a)*r+Math.sin(t*1.7-u*6+k)*u*.39,baseY-u*(2.0+k%5*.43),Math.sin(a)*r+Math.cos(t*1.1-u*4+k)*u*.5);}p.needsUpdate=true;});});
   const scan=values[3].v,mouth=shark.tick(t,scan);live[0]=b;live[1]=s;live[2]=jellyOpen;live[3]=scan;artifacts.update(t,live,unlocked,highlight,jellies,mouth);

  }
 };
}
