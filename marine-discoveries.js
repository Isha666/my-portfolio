import {makeMarineFloorLife} from './marine-floor-life.js';
import {makeReefWildlife} from './marine-wildlife.js?v=oyster-home-1';
import {marineSurface} from './marine-shells.js';
export function makeMarineDiscoveries(T,scene,{preview=false}={}){
 let seed=437;const rand=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const V=(x,y,z)=>new T.Vector3(x,y,z), floor=(x,z)=>-4.5+Math.sin(x*.22)*Math.cos(z*.16)*.46;
 const material=(color,glow=color,power=.15)=>new T.MeshStandardMaterial({color,emissive:glow,emissiveIntensity:power,roughness:.74});
 const sphere=new T.SphereGeometry(1,20,14),stone=new T.IcosahedronGeometry(1,2),dummy=new T.Object3D();
 function mesh(g,m,p,x,y,z,sx=1,sy=sx,sz=sx){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o;}
 const palette=['#f48f94','#ec547e','#feb881','#b480e1','#4ecfc0','#a3b8e4'].map(c=>new T.Color(c));
 const pebbles=new T.InstancedMesh(stone,material('#ffffff','#32435d',.2),1600);
 const sand=[];for(let patch=0;patch<48;patch++){const cx=(rand()-.5)*77,cz=(rand()-.56)*78;for(let j=0;j<100;j++){const a=rand()*6.283,r=Math.sqrt(rand())*3.9,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r; sand.push(x,floor(x,z)+.024+rand()*.018,z);}}
 const grains=new T.BufferGeometry();grains.setAttribute('position',new T.Float32BufferAttribute(sand,3));scene.add(new T.Points(grains,new T.PointsMaterial({color:'#bca58d',size:.024,transparent:true,opacity:.58,depthWrite:false})));
 for(let i=0;i<1600;i++){const x=(rand()-.5)*79,z=(rand()-.56)*82,r=.043+rand()**2*.17;dummy.position.set(x,floor(x,z)+r*.21,z);dummy.rotation.set(rand()*.6,rand()*6.28,rand()*.55);dummy.scale.set(r*1.3,r*.61,r);dummy.updateMatrix();pebbles.setMatrixAt(i,dummy.matrix);pebbles.setColorAt(i,palette[i%6].clone().multiplyScalar(.65+rand()*.45));}scene.add(pebbles);
 const rockPositions=[],rockColors=[];
 for(let i=0;i<30;i++){const a=i*2.39996,d=10+rand()*29,x=Math.cos(a)*d,z=Math.sin(a)*d-7;if([[16,-4],[-18,1],[5,19],[0,-22]].some(([u,v])=>Math.hypot(x-u,z-v)<6))continue;const s=.40+rand()*.9,y=floor(x,z)+.37*s;
  const core=mesh(stone,material('#172539','#253655'),scene,x,y,z,s,s*.7,s*.83);core.rotation.y=a;
  for(let j=0;j<330;j++){const u=rand()*2-1,b=rand()*6.28,q=Math.sqrt(1-u*u),r=1.005+.06*Math.sin(b*4+u*9);rockPositions.push(x+Math.cos(b)*q*s*r,y+u*s*.7*r,z+Math.sin(b)*q*s*.83*r);const c=palette[i%6];rockColors.push(c.r,c.g,c.b);}
 }
 const sparks=new T.BufferGeometry();sparks.setAttribute('position',new T.Float32BufferAttribute(rockPositions,3));sparks.setAttribute('color',new T.Float32BufferAttribute(rockColors,3));const shimmer=new T.PointsMaterial({size:.052,vertexColors:true,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false});scene.add(new T.Points(sparks,shimmer));
 const coralMats=['#fb7f91','#fd9c83','#f05c9e','#c2a3ff','#62bfae'].map(c=>material(c,c,.45));
 const bloomFloor=makeMarineFloorLife(T,scene,floor,rand);
 const swimWildlife=makeReefWildlife(T,scene,{preview});
 const coralTime={value:0},branches=[];
 function branch(start,dir,length,depth,k){
  const bend=dir.clone().add(V((rand()-.5)*.45,.05,(rand()-.5)*.45)).normalize();
  const middle=start.clone().addScaledVector(dir,length*.48);
  const end=middle.clone().addScaledVector(bend,length*.52);
  branches.push({curve:new T.CatmullRomCurve3([start,middle,end]),r:.088*(.48+depth*.29),k,depth});
  if(depth===0)return;
  for(let b=0;b<3;b++){
   const a=b*2.399+rand()*.7;
   const origin=b===0?middle:end.clone().lerp(middle,.10+b*.08);
   const fork=V(bend.x*.63+Math.cos(a)*.61,.55+rand()*.36,bend.z*.63+Math.sin(a)*.61).normalize();
   branch(origin,fork,length*(.54+rand()*.22),depth-1,k);
  }
 }
 for(let i=0;i<(preview?22:37);i++){
  const a=i*2.399,d=7+rand()*30,x=Math.cos(a)*d,z=Math.sin(a)*d-9;
  if([[16,-4],[-18,1],[5,19],[0,-22]].some(([u,v])=>Math.hypot(x-u,z-v)<5.8))continue;
  branch(V(x,floor(x,z)-.06,z),V((rand()-.5)*.35,1,(rand()-.5)*.35).normalize(),.69+rand()*.96,2,i%5);
 }
 for(let k=0;k<5;k++){
  const color=coralMats[k].color,tip=new T.Color('#ffd0ba');
  const positions=[],colors=[];
  branches.filter(b=>b.k===k).forEach(({curve,r,depth})=>{
   const g=new T.TubeGeometry(curve,9,r,8,false).toNonIndexed();
   const p=g.attributes.position,uv=g.attributes.uv;
   const centers=curve.getSpacedPoints(9);
   for(let i=0;i<p.count;i++){
    const t=uv.getX(i),center=centers[Math.round(t*9)];
    const taper=depth===0?Math.max(.035,Math.sqrt(1-t)):1-.50*t;
    const texture=1+.11*Math.sin(t*57+uv.getY(i)*41);
    positions.push(center.x+(p.getX(i)-center.x)*taper*texture,center.y+(p.getY(i)-center.y)*taper*texture,center.z+(p.getZ(i)-center.z)*taper*texture);
    const c=color.clone().lerp(tip,depth===0?t*.34:.08);colors.push(c.r,c.g,c.b);
   }
   g.dispose();
  });
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  coralMats[k].vertexColors=true;coralMats[k].color.set('#ffffff');
  coralMats[k].onBeforeCompile=shader=>{
   shader.uniforms.coralTime=coralTime;
   shader.vertexShader='uniform float coralTime;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float rise=clamp((position.y+4.15)*.62,0.,1.);
    transformed.x+=sin(coralTime*1.17+position.z*.45)*rise*rise*.075;
   `);
  };
  scene.add(new T.Mesh(g,coralMats[k]));
 }
 const starMaterials=['#795ac5','#b35188','#c57d70','#457fba'].map((color,i)=>new T.MeshPhysicalMaterial({color,roughness:.41,clearcoat:.43,iridescence:.45,emissive:i===0?'#395ea0':color,emissiveIntensity:.22}));
 const starDot=material('#c6def5','#8c89c9',.28),starGeometry=marineSurface(T,20,18,(t,u)=>{
  const a=u*Math.PI*2,r=.235*(1-t)**.77+.012;
  return [r*Math.cos(a)+.10*t*t,-Math.sin(a)*r*.58+.034*Math.sin(t*4),.09+t*.94,palette[0]];
 });
 const stars=[];
 for(let n=0;n<26;n++){
  const a=n*2.39996,d=5+(n*11%28),x=n===0?-4:Math.cos(a)*d,z=n===0?-2:Math.sin(a)*d-7;
  const star=new T.Group(),arms=[],size=.41+rand()*.42,mat=starMaterials[n%4];
  star.position.set(x,floor(x,z)+.10,z);star.rotation.y=a;star.scale.setScalar(size);scene.add(star);
  mesh(sphere,mat,star,0,0,0,.30,.14,.30);
  for(let i=0;i<5;i++){
   const joint=new T.Group();joint.rotation.y=i*Math.PI*2/5;star.add(joint);arms.push(joint);
   mesh(starGeometry,mat,joint,0,0,0);
   const dots=new T.InstancedMesh(sphere,starDot,6);
   for(let j=0;j<6;j++){
    const t=j/6,r=.025-.014*t;
    dummy.position.set(.1*t*t,.145*(1-t)+.032*Math.sin(t*4),.17+t*.77);
    dummy.rotation.set(0,0,0);dummy.scale.set(r,r*.65,r);dummy.updateMatrix();dots.setMatrixAt(j,dummy.matrix);
   }
   joint.add(dots);
  }
  stars.push({p:star.position,arms,awake:0,radius:size*.91});
 }
 return {actors:stars,tap(i){stars[i].awake=4.5;},tick(t,dt,camera){
  bloomFloor(t,camera);swimWildlife(t);coralTime.value=t;
  stars.forEach(star=>{
   star.awake=Math.max(0,star.awake-dt);
   star.arms.forEach((joint,i)=>{
    const lift=Math.min(1,star.awake)*(.26+.20*Math.sin((4.5-star.awake)*2.7-i*.85));
    joint.rotation.x=T.MathUtils.damp(joint.rotation.x,-lift,5,dt);
   });
  });
  shimmer.opacity=.67+Math.sin(t*1.1)*.17;
  coralMats.forEach((m,i)=>m.emissiveIntensity=.24+Math.max(0,Math.sin(t*.64+i*1.6))**4*.65);
 }};
}
