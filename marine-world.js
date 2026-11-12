import {makeMarineLife} from './marine-life.js';
import {makeFishSchool} from './marine-fish.js';
import {marineCreatures} from './marine-creatures.js';

import {reefSkills as skills,peopleSkills,treeSkills as branchSkills} from './marine-skills.js';

export function createMarineWorld(T,camera,onReturn){
 const scene=new T.Scene();scene.background=new T.Color('#020b29');scene.fog=new T.FogExp2('#061649',.024);
 const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
 scene.add(new T.HemisphereLight('#5b85ff','#120d35',1.2));
 const sun=new T.DirectionalLight('#92cdff',1.45);sun.position.set(-5,22,-4);scene.add(sun);
 const floorGeo=new T.PlaneGeometry(150,150,80,80);floorGeo.rotateX(-Math.PI/2);const fp=floorGeo.attributes.position;
 for(let i=0;i<fp.count;i++)fp.setY(i,-4.5+Math.sin(fp.getX(i)*.22)*Math.cos(fp.getZ(i)*.16)*.46);
 const seabed=new T.ShaderMaterial({uniforms:{clock:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float clock;void main(){vec2 q=p.xz;float a=sin(q.x*2.7+sin(q.y*1.9+clock*.6)*1.8+clock*.8);float b=cos(q.y*2.1+sin(q.x*1.4-clock*.4)*1.7);float caustic=pow(max(0.,1.-abs(a+b)),5.);vec2 d=q-vec2(-3.,-12.),e=q-vec2(16.,-4.),g=q-vec2(-18.,1.);float light=exp(-dot(d,d)*.025)+exp(-dot(e,e)*.08)*.56+exp(-dot(g,g)*.09)*.51;float grain=fract(sin(dot(floor(q*45.),vec2(12.98,78.23)))*43758.54);float sand=smoothstep(-.18,.48,sin(q.x*.13+sin(q.y*.17))*.56+cos(q.y*.25-q.x*.08)*.4);float rip=pow(.5+.5*sin(q.x*4.+q.y*.72+sin(q.y*.65)*1.6),5.);vec3 col=mix(vec3(.011,.027,.078),vec3(.105,.11,.134)+rip*.023,sand*.76)+light*(vec3(.07,.17,.19)+caustic*.18)+grain*.018;float dist=distance(cameraPosition,p);gl_FragColor=vec4(mix(col,vec3(.012,.026,.075),1.-exp(-dist*dist*.0006)),1.);}`});
 scene.add(new T.Mesh(floorGeo,seabed));
 const beam=new T.Mesh(new T.CylinderGeometry(1,7.8,24,64,1,true),new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{clock:{value:0}},vertexShader:'varying vec2 v;varying vec3 n;varying vec3 eye;void main(){v=uv;vec4 mv=modelViewMatrix*vec4(position,1.);eye=-mv.xyz;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}',fragmentShader:`varying vec2 v;varying vec3 n;varying vec3 eye;uniform float clock;void main(){float fade=smoothstep(0.,.25,v.y)*(1.-smoothstep(.91,1.,v.y));float streak=.5+.5*sin(v.x*100.5+sin(v.x*37.7+clock*.35)*2.);float soft=pow(abs(dot(normalize(n),normalize(eye))),.8);gl_FragColor=vec4(.28,.71,.93,(.03+.08*streak)*fade*soft);}`}));
 beam.position.set(-3,7.6,-12);beam.rotation.z=-.13;scene.add(beam);
 const lightPatches=[[-3,-12,'#66caff',1150],[16,-4,'#b87fff',690],[-18,1,'#45e2cb',710],[5,19,'#698dff',670]];
 for(const [x,z,color,intensity] of lightPatches){const lamp=new T.SpotLight(color,intensity,32,.32,.66,2);lamp.position.set(x-1.5,12,z+1.5);lamp.target.position.set(x,-4,z);scene.add(lamp,lamp.target);
 if(x!==-3){const shaft=beam.clone();shaft.material=beam.material.clone();shaft.material.uniforms.clock=beam.material.uniforms.clock;shaft.position.set(x,7.6,z);shaft.rotation.z=x>0?.19:-.16;shaft.scale.set(.68,1,.68);scene.add(shaft);}}

 const creature=marineCreatures(T,scene),dummy=new T.Object3D();let seed=121;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 function eroded(geo,amount){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+amount*(Math.sin(x*19+y*9+z*5)+Math.cos(z*17+x*6-y*12))*.5;p.setXYZ(i,x*r,y*r,z*r);}geo.computeVertexNormals();return geo;}
 const rock=new T.InstancedMesh(eroded(new T.SphereGeometry(1,26,18),.145),new T.MeshStandardMaterial({color:'#344554',roughness:1}),210);
 const coral=new T.InstancedMesh(eroded(new T.SphereGeometry(1,16,12),.20),new T.MeshStandardMaterial({color:'#fff',roughness:.83}),1600);
 const palette=['#f15f97','#9052d8','#39d2a9','#ef9958','#5ea9df'].map(c=>new T.Color(c));
 const coralClock={value:0};coral.material.onBeforeCompile=shader=>{shader.uniforms.reefClock=coralClock;shader.vertexShader='uniform float reefClock;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float phase=instanceMatrix[3].x*.26+instanceMatrix[3].z*.43;float pulse=sin(reefClock*1.45+phase);transformed*=1.+pulse*.09;transformed.x+=sin(reefClock+phase-position.y)*max(0.,position.y)*.21;`);};
 const patches=[];for(let i=0;i<210;i++){let x=(rnd()-.5)*86,z=-rnd()*65+6;if(Math.abs(x)<4&&z>-16)x+=x<0?-5:5;for(const [cx,cz,r] of [[16,-4,6.5],[14,1,4.5],[-18,1,4.0],[5,19,5.0]]){const d=Math.hypot(x-cx,z-cz);if(d<r){x=cx+(x-cx)*r/Math.max(d,.01);z=cz+(z-cz)*r/Math.max(d,.01);}}const y=-4.3,sz=.35+rnd()*1.5;patches.push({x,z,sz});dummy.position.set(x,y,z);dummy.rotation.set(rnd(),rnd()*6,rnd());dummy.scale.set(sz,sz*(.26+rnd()*.45),sz*.95);dummy.updateMatrix();rock.setMatrixAt(i,dummy.matrix);}
 for(let i=0;i<1600;i++){const p=patches[i%210],a=rnd()*6.28,r=rnd()*p.sz,s=.14+rnd()*.35;dummy.position.set(p.x+Math.cos(a)*r,-4+p.sz*.55+rnd()*.55,p.z+Math.sin(a)*r);dummy.rotation.set(rnd(),rnd()*6,rnd());dummy.scale.set(s,s*(.62+rnd()*1.52),s);dummy.updateMatrix();coral.setMatrixAt(i,dummy.matrix);coral.setColorAt(i,palette[(i%210)%5]);}scene.add(rock,coral);
 // Multi-fork sea fans and tube sponges make distinct silhouettes among the rocks.
 const branches=[],spongeGeo=new T.CylinderGeometry(.28,.20,1.35,14,4,true);
 const sponge=new T.InstancedMesh(spongeGeo,new T.MeshStandardMaterial({color:'#b87975',side:T.DoubleSide,roughness:.93}),155);
 function fan(p,v,length,depth,color){const end=p.clone().addScaledVector(v,length);branches.push({p,end,r:.055*Math.pow(.72,3-depth),color});if(depth>0)for(const sign of [-1,1])fan(end,V(v.x+sign*(.48+rnd()*.22),.8+rnd()*.3,v.z+sign*(rnd()-.5)*.42).normalize(),length*(.61+rnd()*.13),depth-1,color);}
 for(let i=0;i<70;i++){const p=patches[i*3],color=palette[i%palette.length];fan(V(p.x,-4+p.sz*.4,p.z),V((rnd()-.5)*.55,1,(rnd()-.5)*.36).normalize(),.62+rnd()*.52,3,color);}
 const fans=new T.InstancedMesh(new T.CylinderGeometry(.60,1,1,6),new T.MeshStandardMaterial({color:'#fff',roughness:.72}),branches.length),axis=V(0,1,0);
 branches.forEach(({p,end,r,color},i)=>{const d=end.clone().sub(p);dummy.position.copy(p).lerp(end,.5);dummy.quaternion.setFromUnitVectors(axis,d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();fans.setMatrixAt(i,dummy.matrix);fans.setColorAt(i,color);});
 for(let i=0;i<155;i++){const p=patches[(i*11)%210];dummy.position.set(p.x+(rnd()-.5)*p.sz,-4+p.sz*.45,p.z+(rnd()-.5)*p.sz);dummy.rotation.set((rnd()-.5)*.55,rnd()*6,(rnd()-.5)*.6);dummy.scale.set(.48+rnd()*.43,.35+rnd()*.65,.48+rnd()*.43);dummy.updateMatrix();sponge.setMatrixAt(i,dummy.matrix);}scene.add(fans,sponge);
 const specks=new Float32Array(660*3);for(let i=0;i<specks.length;i+=3)specks.set([(rnd()-.5)*85,rnd()*20-4,-rnd()*65+8],i);const dustGeo=new T.BufferGeometry();dustGeo.setAttribute('position',new T.BufferAttribute(specks,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:'#9bdaf3',size:.065,transparent:true,opacity:.42,depthWrite:false}));scene.add(dust);
 const schools=[makeFishSchool(T,scene,rnd,{x:-5,z:-10,count:16,radius:.62}),makeFishSchool(T,scene,rnd,{x:6,z:5,count:8,radius:.47})],life=makeMarineLife(T,scene,rnd);
 const hud=document.createElement('section');hud.id='marineHud';hud.hidden=true;hud.setAttribute('aria-label','Underwater skills');hud.innerHTML=`<div class="marine-top"><span>03 / UNDERWATER</span><button data-map aria-expanded="false">Dive Map</button><button data-all>View all skills</button><button data-zoom="in" aria-label="Zoom in">+</button><button data-zoom="out" aria-label="Zoom out">−</button><button data-return>Return to garden</button></div><div class="marine-intro"><small>THE LIVING REEF</small><h1>A deeper<br><em>curiosity.</em></h1><p>Drag to look in any direction<br>Scroll, arrows, WASD or the stick to swim · Ctrl + scroll to zoom</p></div><div class="marine-markers"></div><div class="marine-map" hidden></div><aside class="marine-card" hidden aria-label="Skill encounter"></aside><div class="marine-touch"><button class="marine-stick" aria-label="Drag to swim"><i></i></button><span>SWIM<br>↑ ↓ ← →</span></div>`;
 document.body.append(hud);
 const stick=hud.querySelector('.marine-stick'),thumb=stick.querySelector('i'),axisInput=new T.Vector2();let stickPointer=null;
 const anchorGroup=new T.Group();anchorGroup.position.set(0,2.65,-21);scene.add(anchorGroup);
 const anchorMetal=new T.MeshStandardMaterial({color:'#546e87',roughness:.46,metalness:.55,emissive:'#1b3757',emissiveIntensity:.45});
 function anchorPart(geo,x,y,z){const m=new T.Mesh(geo,anchorMetal);m.position.set(x,y,z);anchorGroup.add(m);}
 anchorPart(new T.CylinderGeometry(.10,.13,1.28,12),0,0,0);anchorPart(new T.TorusGeometry(.18,.062,9,36),0,.81,0);anchorPart(new T.BoxGeometry(.89,.12,.13),0,.35,0);
 const flukes=new T.CatmullRomCurve3([V(-.70,-.38,0),V(-.48,-.70,0),V(0,-.79,0),V(.48,-.70,0),V(.70,-.38,0)]);anchorPart(new T.TubeGeometry(flukes,36,.082,10,false),0,0,0);
 for(const side of [-1,1]){anchorPart(new T.ConeGeometry(.15,.30,4),side*.70,-.29,0);}
 const anchorControl=document.createElement('button');anchorControl.className='marine-anchor-control';anchorControl.textContent='⚓  3D & Motion tools';anchorControl.onclick=()=>showSkill(2);hud.append(anchorControl);
 const map=hud.querySelector('.marine-map'),card=hud.querySelector('.marine-card'),intro=hud.querySelector('.marine-intro'),mapButton=hud.querySelector('[data-map]');
 const markers=skills.map(({name,place},i)=>{const b=document.createElement('button');b.innerHTML=`<small>${place}</small>${name}`;b.onclick=()=>approach(i);hud.querySelector('.marine-markers').append(b);return b;});
 const pos=V(0,2.8,14),velocity=V(),wheelCurrent=V(),look=new T.Euler(0,0,0,'YXZ');let active=false,selected=-1,near=-1,glide=null,pointer=null,interacted=false;
 const keys=new Set(),moveKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyC']),canvas=document.querySelector('#world'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function clearMovement(){keys.clear();axisInput.set(0,0);thumb.style.transform='';stickPointer=null;pointer=null;canvas.classList.remove('marine-gripping');velocity.set(0,0,0);wheelCurrent.set(0,0,0);}
 function closeCard(){if(selected>=0)creature.activate(selected,false);selected=-1;creature.selectBranch(-1);card.hidden=true;}
 function setMap(open){map.hidden=!open;mapButton.setAttribute('aria-expanded',String(open));}
 function showCard(html){clearMovement();card.innerHTML='<button class="marine-close" aria-label="Close skills">×</button>'+html;card.hidden=false;card.querySelector('button').onclick=closeCard;}
 function toolList(list){return `<ul class="marine-tool-list">${list.map(tool=>`<li>${tool}</li>`).join('')}</ul>`;}
 function showSkill(i){if(selected>=0&&selected!==i)closeCard();selected=i;creature.activate(i,true);if(i===0){card.hidden=true;return;}const s=skills[i],hint=['Select a branch below the canopy.','The oyster releases three new shells with each opening.','All motion tools, collected at the anchor.','Each breath releases a new set of tools.'][i];showCard(`<small>${s.place}</small><h2>${s.name}</h2>${toolList(s.tools)}<p class="marine-gesture">${hint}</p>`);}
 function inspectRelic(i,n,tool){if(i===0){selected=0;if(tool){creature.selectBranch(n);showCard(`<small>${branchSkills[n].title}</small><h2>${tool}</h2>${toolList(branchSkills[n].tools)}`);}else revealBranch(n);return;}selected=i;const name=i===2?['Three.js (WebGL)','GSAP','Framer Motion'][n]:skills[i].tools[n];showCard(`<small>${skills[i].name}</small><h2>${name}</h2><button data-skill-group>View all ${skills[i].name} tools</button>`);card.querySelector('[data-skill-group]').onclick=()=>showSkill(i);}
 function revealBranch(n){const b=branchSkills[n];creature.selectBranch(n);showCard(`<small>THE LIVING TREE / BRANCH ${n+1}</small><h2>${b.title}</h2>${toolList(b.tools)}`);}
 function encounter(i){
  if(i!==1||creature.isUnlocked(1)){showSkill(i);return;}
  closeCard();
  if(i===1){
   showCard('<small>THE PEARL OYSTER</small><h2>Match the sonar code</h2><p>Enter <strong>2 · 5 · 3</strong> to wake the shell.</p><label for="oyster-pin">Oyster PIN</label><input id="oyster-pin" type="text" inputmode="numeric" autocomplete="off" pattern="[0-9]*" maxlength="3" placeholder="···"><p role="status"></p><div class="marine-keypad"></div>');
   const pad=card.querySelector('.marine-keypad'),input=card.querySelector('input'),status=card.querySelector('[role=status]');
   function check(){input.value=input.value.replace(/[^0-9]/g,'').slice(0,3);if(input.value.length<3){status.textContent='';return;}if(input.value==='253')showSkill(i);else{status.textContent='Try 2 · 5 · 3';input.select();}}
   input.addEventListener('input',check);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check();}});
   for(let n=1;n<=9;n++){const b=document.createElement('button');b.textContent=n;b.onclick=()=>{if(input.value.length===3)input.value='';input.value+=n;check();};pad.append(b);}input.focus({preventScroll:true});
  }

 }
 function anchor(i){const p=creature.landmarks[i].position.clone();p.y+=[4.1,1,.35,.1][i];return p;}
 function approach(i){if(!active)return;setMap(false);intro.hidden=true;interacted=true;closeCard();clearMovement();if(near===i||anchor(i).distanceTo(pos)<9){encounter(i);return;}const target=anchor(i),end=target.clone().add(V(i===0?1.3:i===1?-1.3:i===3?3.5:0,i===3?3.1:.35, i===0?13.6:i===2?8.4:i===3?-8.2:7.4));const middle=pos.clone().lerp(end,.5);middle.y=Math.max(middle.y,2.1)+1.6;
 const curve=new T.CatmullRomCurve3([pos.clone(),middle,end]);glide?.kill();if(reduced){pos.copy(end);const d=target.clone().sub(pos);look.set(Math.atan2(d.y,Math.hypot(d.x,d.z)),Math.atan2(-d.x,-d.z),0);near=i;glide=null;return;}const state={p:0};glide=gsap.to(state,{p:1,duration:Math.min(2.1,.8+pos.distanceTo(end)*.034),ease:'power2.inOut',onUpdate(){curve.getPoint(state.p,pos);const d=target.clone().sub(pos);const yaw=Math.atan2(-d.x,-d.z);look.y+=Math.atan2(Math.sin(yaw-look.y),Math.cos(yaw-look.y))*.2;look.x+= (Math.atan2(d.y,Math.hypot(d.x,d.z))-look.x)*.2;},onComplete(){near=i;glide=null;}});}
 map.innerHTML=skills.map((s,i)=>`<button data-landmark="${i}"><small>${s.place}</small>${s.name}</button>`).join('');map.querySelectorAll('button').forEach(b=>b.onclick=()=>approach(Number(b.dataset.landmark)));
 mapButton.onclick=()=>{closeCard();setMap(map.hidden);};hud.querySelector('[data-all]').onclick=()=>{setMap(false);closeCard();showCard('<small>THE LIVING REEF</small><h2>Skills index</h2>'+skills.map(s=>`<h3>${s.name}</h3>${toolList(s.tools)}`).join('')+'<h3>Collaboration & leadership</h3>'+toolList(peopleSkills));};

 hud.querySelector('[data-return]').onclick=onReturn;
 function interrupt(){glide?.kill();glide=null;near=-1;if(!interacted){interacted=true;intro.hidden=true;}}
 addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){closeCard();setMap(false);interrupt();return;}if(!moveKeys.has(e.code)||!map.hidden||e.target.closest?.('button,input,textarea'))return;e.preventDefault();interrupt();keys.add(e.code);});
 addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',clearMovement);
 function pickRelic(){let best=null,dist=Infinity;for(const {root,n,tool} of creature.smallRocks){if(!root.parent.visible)continue;const p=root.getWorldPosition(V());if(p.distanceTo(pos)>15)continue;if(ray.ray.intersectSphere(new T.Sphere(p,.36),hit)&&hit.distanceToSquared(pos)<dist){best=[0,n,tool];dist=hit.distanceToSquared(pos);}}for(const {root,i,n} of creature.relics){if(!root.visible)continue;const p=root.getWorldPosition(V());if(p.distanceTo(pos)>13)continue;if(ray.ray.intersectSphere(new T.Sphere(p,i===0?1.13:.6),hit)&&hit.distanceToSquared(pos)<dist){best=[i,n];dist=hit.distanceToSquared(pos);}}return best;}
 function pick(x,y){ray.setFromCamera(new T.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);let best=-1,dist=Infinity;for(let i=0;i<4;i++){const p=anchor(i);if(ray.ray.intersectSphere(new T.Sphere(p,[3.4,2.35,2.25,2.8][i]),hit)&&hit.distanceToSquared(pos)<dist){dist=hit.distanceToSquared(pos);best=i;}}return best;}
 canvas.addEventListener('pointerdown',e=>{if(!active||!map.hidden)return;const i=pick(e.clientX,e.clientY);interrupt();const object=i>=0&&(anchor(i).distanceTo(pos)<11||selected===i)?i:-1;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,i,object,relic:pickRelic(),amount:object>=0?creature.amount(object):0};canvas.setPointerCapture(e.pointerId);if(object>=0)canvas.classList.add('marine-gripping');});
 canvas.addEventListener('pointermove',e=>{if(!active)return;ray.setFromCamera(new T.Vector2(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2),camera);creature.cursor(ray.ray);
 if(pointer?.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,i=pointer.object;if(i<0){look.y-=dx*.004;look.x=T.MathUtils.clamp(look.x-dy*.004,-1.54,1.54);}else if(Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5){creature.manipulate(i,dx,i===1||i===2?0:dy);if(i===1||i===2)creature.scrub(i,pointer.amount+(pointer.startY-e.clientY)/115);}
 pointer.x=e.clientX;pointer.y=e.clientY;});
 canvas.addEventListener('pointerleave',()=>creature.cursor(null));
 canvas.addEventListener('pointerup',e=>{if(pointer?.id!==e.pointerId)return;const {i,object,relic,startX,startY}=pointer,tap=Math.hypot(e.clientX-startX,e.clientY-startY)<6;pointer=null;canvas.classList.remove('marine-gripping');if(tap){if(ray.ray.intersectSphere(new T.Sphere(anchorGroup.position,.9),hit)&&anchorGroup.position.distanceTo(pos)<13){showSkill(2);return;}if(relic){inspectRelic(...relic);return;}if(i<0)return;if(selected===i){closeCard();return;}approach(i);return;}if(object<0)return;if(object===1||object===2){if(creature.amount(object)>.18)showSkill(object);else{creature.release(object);closeCard();}}else showSkill(object);});
 for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(pointer?.id===e.pointerId){pointer=null;canvas.classList.remove('marine-gripping');}});
 function steer(e){const r=stick.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;axisInput.set(x,y).divideScalar(r.width*.32);if(axisInput.length()>1)axisInput.normalize();thumb.style.transform=`translate(${axisInput.x*22}px,${axisInput.y*22}px)`;}
 stick.onpointerdown=e=>{e.preventDefault();interrupt();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);steer(e);};
 stick.onpointermove=e=>{if(e.pointerId===stickPointer)steer(e);};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,e=>{if(e.pointerId===stickPointer){stickPointer=null;axisInput.set(0,0);thumb.style.transform='';}});

 let targetFov=66;
 function zoom(delta){targetFov=T.MathUtils.clamp(targetFov+delta,33,92);}
 hud.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>zoom(b.dataset.zoom==='in'?-8:8));
 addEventListener('wheel',e=>{if(!active||e.target.closest?.('.marine-card,.marine-map'))return;e.preventDefault();if(e.ctrlKey||e.metaKey){zoom(e.deltaY*.065);return;}interrupt();const factor=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;wheelCurrent.add(V(e.deltaX*factor*.029,0,-e.deltaY*factor*.029).applyEuler(look)).clampLength(0,16);},{passive:false});
 const direction=V(),screen=V(),ray=new T.Raycaster(),hit=new T.Vector3();
 return {scene,enter(preserve=false){active=true;targetFov=66;hud.hidden=false;document.body.classList.add('in-marine');if(preserve){pos.copy(camera.position);look.setFromQuaternion(camera.quaternion,'YXZ');look.z=0;}else{pos.set(0,2.8,8);look.set(0,0,0);}near=-1;interacted=false;intro.hidden=false;setMap(false);closeCard();clearMovement();document.activeElement?.blur();},leave(){active=false;hud.hidden=true;document.body.classList.remove('in-marine');creature.cursor(null);interrupt();clearMovement();closeCard();setMap(false);},tick(dt,t){
 seabed.uniforms.clock.value=beam.material.uniforms.clock.value=t;dust.position.y=Math.sin(t*.19)*.52;creature.tick(t,dt);
 schools.forEach((swim,i)=>swim(t+i*2.7));life.tick(t);coralClock.value=t;
 direction.set(Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),Number(keys.has('Space'))-Number(keys.has('KeyC')),Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')));
 direction.x+=axisInput.x;direction.z+=axisInput.y;if(direction.length()>1)direction.normalize();direction.multiplyScalar(7).applyEuler(look);velocity.lerp(direction,1-Math.exp(-dt*6));if(!glide)pos.addScaledVector(velocity,dt).addScaledVector(wheelCurrent,dt);wheelCurrent.multiplyScalar(Math.exp(-dt*5.5));pos.clamp(V(-31,-2.6,-44),V(31,12,23));
 camera.position.copy(pos);camera.rotation.copy(look);if(active&&Math.abs(camera.fov-targetFov)>.03){camera.fov=T.MathUtils.damp(camera.fov,targetFov,10,dt);camera.updateProjectionMatrix();}camera.updateMatrixWorld(true);

 screen.copy(anchorGroup.position).project(camera);anchorControl.hidden=!active||!map.hidden||!card.hidden||anchorGroup.position.distanceTo(pos)>14||screen.z<-1||screen.z>1||Math.abs(screen.x)>.85||Math.abs(screen.y)>.8;anchorControl.style.left=(screen.x*.5+.5)*100+'%';anchorControl.style.top=(-screen.y*.5+.5)*100+4+'%';
 markers.forEach((b,i)=>{const p=anchor(i);screen.copy(p).project(camera);const distance=p.distanceTo(pos);b.hidden=!card.hidden||!map.hidden||screen.z>1||screen.z<-1||Math.abs(screen.x)>.83||Math.abs(screen.y)>.69;if(b.hidden)return;b.style.left=(screen.x*.5+.5)*100+'%';b.style.top=(-screen.y*.5+.5)*100-8+'%';const reached=near===i||distance<9;if(b.dataset.reached!==String(reached)){b.dataset.reached=String(reached);b.innerHTML=`<small>${skills[i].place}</small>${reached?skills[i].action:skills[i].name}`;}b.onclick=()=>reached?encounter(i):approach(i);});
 }};
}
