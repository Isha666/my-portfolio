import {reefSkills,treeSkills} from './marine-skills.js';
const names=[treeSkills.map(s=>s.title),reefSkills[1].tools,['WebGL','GSAP','Framer Motion'],reefSkills[3].tools];
export function makeMarineRelics(T,landmarks){
 const relics=[],smallRocks=[];
 function shell(index){
  const p=[],uv=[],ind=[],turns=48,sections=28;
  for(let i=0;i<=turns;i++){const t=i/turns,a=t*Math.PI*5.6,r=.021*Math.exp(t*2.48),tube=.028+t*t*.24;
   for(let j=0;j<=sections;j++){const b=j/sections*Math.PI*2,flute=1+.039*Math.cos(b*8+t*26),x=r+tube*Math.cos(b)*flute;uv.push(j/sections,t);
    if(index%2===0){const lip=1+.27*T.MathUtils.smoothstep(t,.88,1);p.push(Math.cos(a)*x*lip,t*.86+Math.sin(b)*tube*flute*lip,Math.sin(a)*x*lip);}
    else{const theta=(j/sections-.5)*Math.PI*1.21,rib=1+.045*Math.cos(j/sections*19*Math.PI);p.push(Math.sin(theta)*t*.59,(t*t*.30+.11*Math.cos(theta))*rib+Math.cos(theta*16)*t*.022,Math.cos(theta)*t*.66);}
    if(i<turns&&j<sections){const k=i*(sections+1)+j;ind.push(k,k+1,k+sections+1,k+1,k+sections+2,k+sections+1);}
   }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();return g;
 }
 function particleRock(root,n,detail=4){
  const rock=new T.IcosahedronGeometry(1,detail),a=rock.attributes.position,p=[];
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),r=1+.13*Math.sin(x*7+y*5+z*8+n)+.10*Math.cos(y*11-z*9);a.setXYZ(i,x*r*1.19,y*r*.83,z*r*.94);}
  rock.computeVertexNormals();root.add(new T.Mesh(rock,new T.MeshStandardMaterial({color:'#101f37',roughness:.9})));
  let seed=71+n;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  for(let i=0;i<a.count;i+=3)for(let j=0;j<3;j++){let u=rnd(),v=rnd();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;p.push(1.014*(a.getX(i)*u+a.getX(i+1)*v+a.getX(i+2)*w),1.014*(a.getY(i)*u+a.getY(i+1)*v+a.getY(i+2)*w),1.014*(a.getZ(i)*u+a.getZ(i+1)*v+a.getZ(i+2)*w));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));
  const mat=new T.PointsMaterial({color:['#5adbf3','#ad7aff','#66e5b0'][n],size:.036,transparent:true,opacity:.78,blending:T.AdditiveBlending,depthWrite:false});const points=new T.Points(g,mat);root.add(points);return points;
 }
 function face(text,color){
  const c=document.createElement('canvas');c.width=384;c.height=128;
  const ctx=c.getContext('2d');ctx.font='600 48px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle='#071329';ctx.lineWidth=12;ctx.strokeText(text,192,64,360);ctx.fillStyle='#ffffff';ctx.shadowColor='#05112b';ctx.shadowBlur=7;ctx.fillText(text,192,64,360);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
  return new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
 }
 for(let i=0;i<4;i++)for(let n=0;n<names[i].length;n++){
  const root=new T.Group();landmarks[i].add(root);root.userData.skill=[i,n];const color=['#81faff','#ffa9ef','#bfaaff','#6df6dc'][i];
  const crystal=i===0?particleRock(root,n):new T.Mesh((i===3?new T.SphereGeometry(.48,28,20):i===2?new T.SphereGeometry(.23,28,20):i===1?shell(n):new T.OctahedronGeometry(.21,0)),new T.MeshPhysicalMaterial({color:i===1?['#e8ad8a','#caa5e3','#b6d8d6'][n%3]:color,emissive:color,emissiveIntensity:.65,roughness:.32,metalness:.18,clearcoat:.7,side:T.DoubleSide}));crystal.userData.skill=root.userData.skill;root.add(crystal);if(i===0){landmarks[0].parent.add(root);root.position.copy(landmarks[0].position).add(new T.Vector3((n-1)*3.25,.65,3.3+(n===1?1.15:0)));}
  if(i===1){crystal.material.dispose();crystal.material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{tint:{value:new T.Color(['#b6e8ff','#ffc8e9','#c9b5ff'][n%3])}},
   vertexShader:'varying vec2 v;varying vec3 n,e;void main(){v=uv;vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);e=-p.xyz;gl_Position=projectionMatrix*p;}',
   fragmentShader:`varying vec2 v;varying vec3 n,e;uniform vec3 tint;void main(){vec2 q=abs(fract(v*vec2(8.,13.)+.5)-.5);float grid=1.-smoothstep(.025,.14,min(q.x,q.y));float rim=pow(1.-abs(dot(normalize(n),normalize(e))),2.);float ridge=pow(.5+.5*cos(v.x*85.+v.y*15.),6.);vec3 light=tint*(.62+rim*.33+ridge*.12)+vec3(.36,.56,.72)*grid;gl_FragColor=vec4(light,.51+grid*.095+rim*.23);}`});}
  if(i===3)crystal.material=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec3 n,e;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);e=-p.xyz;gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n,e;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(e))),2.5);float gleam=pow(max(0.,dot(normalize(n),normalize(vec3(-.6,.8,1.)))),16.);gl_FragColor=vec4(.47,.84,1.,.08+rim*.76+gleam*.45);}'});
  const label=face(names[i][n],color);label.position.y=i===0?1.03:i===1?.64:0;label.scale.set(i===0?2.4:i===1?1.75:1.44,i===0?.55:.46,1);if(i!==0)label.position.z=i===3?.49:.39;root.add(label);
  if(i===2){crystal.material.dispose();crystal.material=new T.MeshPhysicalMaterial({color:'#fff9fc',emissive:'#dcc6ff',emissiveIntensity:.27,roughness:.27,iridescence:1,iridescenceIOR:1.35,iridescenceThicknessRange:[160,340],clearcoat:.83});label.position.set(0,-.36,.12);}
  root.visible=i===0;relics.push({i,n,root,crystal,label});
  if(i===0){const tools=treeSkills[n].tools;tools.forEach((tool,j)=>{const child=new T.Group();root.add(child);child.position.set((j-(tools.length-1)/2)*.76,-.53,1.34+Math.abs(j-(tools.length-1)/2)*.13);
   const stone=new T.Group();child.add(stone);particleRock(stone,n,2);stone.scale.setScalar(.30);
   const tag=face(tool,color);tag.position.y=.32;tag.scale.set(.88,.29,1);child.add(tag);smallRocks.push({root:child,n,tool});});}
 }
 return {relics,smallRocks,update(time,opens,unlocked,highlight,jellies,mouth){
  relics.forEach(({i,n,root,crystal,label})=>{
   const a=n*2.094+time*.72;
   if(i!==0)crystal.rotation.y=time*.65+n;else{const grow=T.MathUtils.smoothstep(opens[0],.16+n*.12,.58+n*.12);root.visible=grow>.02;root.scale.setScalar(.55+grow*.45);crystal.material.opacity=(.55+grow*.23)*(highlight===n?1:.76)+.08*Math.sin(time*1.65+n);return;}

   const s=opens[i],reveal=T.MathUtils.smoothstep(s,.36,.88);root.visible=(i===2||unlocked[i])&&reveal>.06;
   if(i===1){const cycle=Math.floor(time*1.06/(Math.PI*2))%3,slot=n%3;root.visible=root.visible&&Math.floor(n/3)===cycle;root.position.set((slot-1)*(1.04+.22*reveal),s*.53-.22,1.62+.33*reveal);root.scale.setScalar(.48+reveal*.19);crystal.rotation.set(-.13,slot*.29+Math.sin(time*1.3+n)*.24,Math.sin(time+n)*.12);return;}
   if(i===2){const g=jellies[n].g,opening=g.userData.opening??0,radius=(.7+opening*1.12)*g.scale.x;root.visible=true;root.position.set(Math.cos(a)*radius,.13+Math.sin(a*1.2)*radius*.34,Math.sin(a)*radius).add(g.position);root.scale.setScalar(.64+opening*.31);return;}
   if(i===3){const cycle=Math.floor(time*.37)%5,slot=n%3,phase=T.MathUtils.clamp((mouth.phase-.16-slot*.085)/.56,0,1);root.visible=unlocked[i]&&Math.floor(n/3)===cycle&&phase>.01&&phase<1&&s>.25;root.position.set((slot-1)*phase*1.88,-.51+phase*1.55,-2.04-phase*3.60);root.scale.setScalar(.72+phase*.38);return;}
   root.scale.setScalar(.32+reveal*.67);
  });
 }};
}
