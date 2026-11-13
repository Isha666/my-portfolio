import {createAurora} from './winter-aurora.js?v=sky-coverage-1';
import {createPineGeometry,addSnowyBoughs} from './winter-pines.js';
import {createGardenHome} from './garden-home.js?v=miniature-6';
import * as THREE from './vendor/three.module.js';

export function createSnowmanHome({renderer,reduced,onExplore,onProjects,onSkills,initialWorld=0,winterScene,onFrame,onVisibility}){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#102238');scene.fog=new THREE.FogExp2('#183049',.024);
 const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,175);camera.position.set(0,2.9,11);camera.lookAt(0,2.55,0);
 const homeLights=new THREE.Group();scene.add(homeLights);homeLights.add(new THREE.HemisphereLight('#dceaff','#47546a',1.2));const light=new THREE.DirectionalLight('#ffe6cb',3);light.position.set(-4,7,6);homeLights.add(light);const rim=new THREE.DirectionalLight('#91c9ff',2);rim.position.set(4,5,-3);homeLights.add(rim);
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=256;const ctx=texCanvas.getContext('2d');ctx.fillStyle='#e9f1f5';ctx.fillRect(0,0,256,256);for(let i=0;i<14000;i++){ctx.fillStyle=Math.random()>.5?'#ffffff60':'#7d9ab028';ctx.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2);}const texture=new THREE.CanvasTexture(texCanvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 const snow=new THREE.MeshStandardMaterial({color:'#e9f1f4',map:texture,bumpMap:texture,bumpScale:.035,roughness:.91});const coal=new THREE.MeshStandardMaterial({color:'#17232e',roughness:.48});const wood=new THREE.MeshStandardMaterial({color:'#685044',roughness:.9});const red=new THREE.MeshStandardMaterial({color:'#954c45',roughness:1});
 const model=new THREE.Group();scene.add(model);model.position.z=-8;
 function sphere(parent,x,y,z,r,mat,sx=1,sy=1,sz=1){const geometry=new THREE.SphereGeometry(r,48,32);if(mat===snow){const a=geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),n=1+.012*Math.sin(x*24+y*19)*Math.sin(z*21+y*13);a.setXYZ(i,x*n,y*n,z*n);}geometry.computeVertexNormals();}const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
 function rod(parent,a,b,r,mat){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),d=w.clone().sub(v);const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,d.length(),10),mat);m.position.copy(v.add(w).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m;}
 sphere(model,0,.98,0,1.2,snow,1,1, .86);sphere(model,0,2.38,0,.91,snow,1,1,.88);const head=new THREE.Group();head.position.y=3.63;model.add(head);sphere(head,0,0,0,.75,snow,1,.96,.93);
 const pupils=[],eyeWhites=[];
 const eyeWhite=new THREE.MeshStandardMaterial({color:'#fffdf8',roughness:.24});
 const iris=new THREE.MeshStandardMaterial({color:'#302148',roughness:.21});
 const catchlight=new THREE.MeshBasicMaterial({color:'#ffffff'});
 for(const x of [-.263,.263]){
  eyeWhites.push(sphere(head,x,.14,.645,.215,eyeWhite,1,1.13,.45));
  const pupil=sphere(head,x,.14,.733,.102,iris,1,1.08,.55);
  sphere(pupil,0,0,.037,.071,coal,1,1,.36);
  sphere(pupil,-.035,.038,.061,.027,catchlight,1,1,.4);
  sphere(pupil,.036,-.031,.061,.013,catchlight,1,1,.4);
  pupils.push({pupil,x});
 }
 const nose=new THREE.Mesh(new THREE.ConeGeometry(.12,.64,24),new THREE.MeshStandardMaterial({color:'#dc8143',roughness:.8}));nose.rotation.x=Math.PI/2;nose.position.set(0,-.035,.93);head.add(nose);const smilePoints=[];for(let i=0;i<=30;i++){const x=-.37+i*.74/30;smilePoints.push(new THREE.Vector3(x,-.31+.9*x*x,.65));}const smile=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smilePoints),32,.022,8,false),coal);head.add(smile);
 const hat=new THREE.Group();hat.position.y=.62;hat.rotation.z=-.09;head.add(hat);const hatMat=new THREE.MeshStandardMaterial({color:'#263e4c',roughness:.94});const brim=new THREE.Mesh(new THREE.CylinderGeometry(.89,.89,.11,64),hatMat);hat.add(brim);const crown=new THREE.Mesh(new THREE.CylinderGeometry(.53,.57,.82,48),hatMat);crown.position.y=.43;hat.add(crown);const band=new THREE.Mesh(new THREE.CylinderGeometry(.558,.575,.13,48),red);band.position.y=.13;hat.add(band);const snowRim=new THREE.Mesh(new THREE.TorusGeometry(.83,.026,8,64),snow);snowRim.rotation.x=Math.PI/2;snowRim.position.y=.065;hat.add(snowRim);for(let i=0;i<45;i++){const a=i*2.4;const r=Math.sqrt(Math.random())*.5;sphere(hat,Math.cos(a)*r,.85,Math.sin(a)*r,.035+Math.random()*.025,snow,1,.45,1);}
 const scarf=new THREE.Mesh(new THREE.TorusGeometry(.64,.16,16,64),red);scarf.rotation.x=Math.PI/2;scarf.position.y=3.04;model.add(scarf);const tail=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.65,8,16),red);tail.position.set(-.53,2.55,.75);tail.rotation.z=-.15;tail.scale.y=1.5;tail.position.y=2.38;model.add(tail);for(let i=0;i<9;i++)rod(model,[-.68+i*.034,1.61,.75],[-.69+i*.034,1.36+(i%3)*.025,.76],.009,red);for(const y of [2.65,2.23,1.3])sphere(model,0,y,y>2?.8:1.02,.07,coal);
 rod(model,[-.7,2.5,0],[-1.7,2.15,.08],.065,wood);rod(model,[-1.7,2.15,.08],[-2.18,2.4,.08],.045,wood);rod(model,[-1.8,2.2,.08],[-2.1,2.02,.12],.035,wood);
 const arm=new THREE.Group();arm.position.set(.75,2.55,0);model.add(arm);rod(arm,[0,0,0],[.75,.7,0],.065,wood);rod(arm,[.75,.7,0],[1.03,1.25,0],.045,wood);rod(arm,[.85,.9,0],[1.28,1.13,0],.032,wood);rod(arm,[.77,.78,0],[.7,1.2,0],.031,wood);

 const contact=new THREE.Mesh(new THREE.CircleGeometry(1.35,64),new THREE.MeshBasicMaterial({color:'#233b56',transparent:true,opacity:.25,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.055;contact.scale.y=.76;model.add(contact);
 const bunny=new THREE.Group();
 scene.add(bunny);
 const fur=new THREE.MeshStandardMaterial({color:'#ede2d5',roughness:.9});
 const blush=new THREE.MeshStandardMaterial({color:'#c89898',roughness:.9});
 const bunnyBody=new THREE.Group();
 bunny.add(bunnyBody);
 sphere(bunnyBody,0,.29,-.12,.27,fur,1,1,1.45);
 sphere(bunnyBody,0,.28,-.45,.094,fur);
 sphere(bunnyBody,0,.40,.19,.166,fur,.91,.92,1.13);
 sphere(bunnyBody,0,.352,.304,.095,fur,.88,.74,1.03);
 sphere(bunnyBody,0,.389,.392,.023,blush,1,.75,.55);
 const bunnyEars=[],hindPaws=[],forePaws=[];
 for(const side of [-1,1]){
  const ear=new THREE.Group();
  ear.position.set(side*.072,.51,.13);
  ear.rotation.z=-side*.10;
  bunnyBody.add(ear);
  sphere(ear,0,.154,0,.074,fur,.73,2.4,.58);
  sphere(ear,0,.165,.033,.051,blush,.67,2.52,.24);
  bunnyEars.push(ear);
  sphere(bunnyBody,side*.128,.43,.243,.030,coal,1,1.05,.83);
  sphere(bunnyBody,side*.18,.23,-.22,.168,fur,.79,1.03,1.14);
  hindPaws.push(sphere(bunnyBody,side*.18,.083,-.165,.102,fur,.7,.67,1.72));
  forePaws.push(sphere(bunnyBody,side*.092,.095,.215,.082,fur,.57,1.04,1.14));
 }
 const bunnyShadow=new THREE.Mesh(contact.geometry,contact.material);
 bunnyShadow.rotation.x=-Math.PI/2;
 bunnyShadow.scale.set(.27,.2,1);
 scene.add(bunnyShadow);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160,50,50),snow);ground.rotation.x=-Math.PI/2;ground.position.y=-.2;scene.add(ground);
 const evergreen=new THREE.MeshStandardMaterial({color:'#203e42',roughness:1});
 const pines=[[-7,-14,6],[9,-17,7],[-12,-30,8],[14,-33,9],[-4,-26,5],[5,-29,6],[-17,-36,9],[18,-40,10],[-8,-42,7],[1,-45,6],[10,-47,8]];
 for(const side of [-1,1])for(let i=0;i<12;i++)pines.push([side*(5.5+i*2.55),-20-(i%4)*6,4+(i*7%10)*.64]);
 const rand=(min,max)=>min+(max-min)*Math.random();
 const pineGeometry=createPineGeometry(THREE,rand);
 const pineBatches=new Map(),pineTransform=new THREE.Object3D();
 function instance(geometry,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  const key=geometry.id+':'+material.id;
  if(!pineBatches.has(key))pineBatches.set(key,{geometry,material,matrices:[]});
  pineTransform.position.set(x,y,z);
  pineTransform.rotation.set(rx,ry,rz);
  pineTransform.scale.set(sx,sy,sz);
  pineTransform.updateMatrix();
  pineBatches.get(key).matrices.push(pineTransform.matrix.clone());
 }
 const boughSnow=new THREE.MeshStandardMaterial({color:'#dce9f4',roughness:.88});
 for(const [x,z,h] of pines){
  rod(scene,[x,-.2,z],[x,h-.2,z],.12+h*.009,wood);
  addSnowyBoughs({x,y:-.2,z,h,geometry:pineGeometry,needles:evergreen,snow:boughSnow,instance,rand});
 }
 for(const {geometry,material,matrices} of pineBatches.values()){
  const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
  scene.add(mesh);
 }

 const {aurora,time:auroraTime}=createAurora(THREE);
 scene.add(aurora);

 // Layered alpine ridges, with exposed rock below the snow line.
 const rock=new THREE.MeshStandardMaterial({color:'#425873',roughness:1});
 for(let i=0;i<23;i++){const x=-121+i*11,z=-63-(i%3)*9,h=14+(i*7%9)*2.2;const g=new THREE.ConeGeometry(12+(i%3)*2,h,25,12);const a=g.attributes.position;for(let j=0;j<a.count;j++){const x=a.getX(j),y=a.getY(j),z=a.getZ(j),n=1+.16*Math.sin(x*1.7+z*.9+y*.7);a.setXYZ(j,x*n,y,z*n);}g.computeVertexNormals();const m=new THREE.Mesh(g,rock);m.position.set(x,h/2-1,z);scene.add(m);const cap=new THREE.Mesh(g.clone(),snow);cap.scale.set(.88,.74,.88);cap.position.set(x,h*.63,z);scene.add(cap);}
 const igloo=new THREE.Group();igloo.position.set(-4.6,-.2,-16);igloo.rotation.y=.23;scene.add(igloo);const dome=new THREE.Mesh(new THREE.SphereGeometry(2.05,40,24,0,Math.PI*2,0,Math.PI/2),snow);igloo.add(dome);const seam=new THREE.MeshStandardMaterial({color:'#8da5b9',roughness:1});for(let row=1;row<6;row++){const angle=row*Math.PI/12,r=2.055*Math.sin(angle),y=2.055*Math.cos(angle);const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.012,5,70),seam);ring.rotation.x=Math.PI/2;ring.position.y=y;igloo.add(ring);for(let j=0;j<row*5;j++){const az=j*Math.PI*2/(row*5)+(row%2)*.19;rod(igloo,[Math.cos(az)*r,y,Math.sin(az)*r],[Math.cos(az)*r*.9,y+.19,Math.sin(az)*r*.9],.01,seam);}}
 const arch=new THREE.Mesh(new THREE.TorusGeometry(.66,.24,12,32,Math.PI),snow);arch.position.set(0,.05,1.9);igloo.add(arch);const doorway=new THREE.Mesh(new THREE.CircleGeometry(.64,32,0,Math.PI),new THREE.MeshBasicMaterial({color:'#192c40',side:THREE.DoubleSide}));doorway.position.set(0,.05,2.04);igloo.add(doorway);const warm=new THREE.PointLight('#ffd39b',4,6);warm.position.set(0,.4,2.5);igloo.add(warm);
 for(const [x,z,scale,yaw] of [[5,-19,.92,-.25],[-10,-23,.78,.31],[11,-27,1.10,-.28],[-17,-35,1,.33],[19,-34,.94,-.36]]){
  const shelter=igloo.clone(true);
  shelter.position.set(x,-.2,z);
  shelter.scale.setScalar(scale);
  shelter.rotation.y=yaw;
  shelter.children.filter(child=>child.isLight).forEach(child=>shelter.remove(child));
  scene.add(shelter);
 }
 const particles=new Float32Array((innerWidth<700?650:1450)*3);for(let i=0;i<particles.length;i+=3){particles[i]=(Math.random()-.5)*32;particles[i+1]=Math.random()*17;particles[i+2]=(Math.random()-.5)*26;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(particles,3));const flakes=new THREE.Points(geo,new THREE.PointsMaterial({color:'#eff6ff',size:.045,transparent:true,opacity:.8}));scene.add(flakes);
 const crystalFields=[];
 for(let variant=0;variant<3;variant++){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=96;
  const ctx=canvas.getContext('2d');
  ctx.translate(48,48);
  ctx.lineCap='round';
  ctx.strokeStyle='#f4fbff';
  ctx.lineWidth=variant===1?3.5:4.6;
  for(let arm=0;arm<6;arm++){
   ctx.rotate(Math.PI/3);
   ctx.beginPath();
   ctx.moveTo(0,0);ctx.lineTo(0,-40);
   for(const distance of (variant===0?[24]:[16,29])){
    const width=variant===2?15:10;
    ctx.moveTo(-width,-distance-8);ctx.lineTo(0,-distance);ctx.lineTo(width,-distance-8);
   }
   ctx.stroke();
  }
  const map=new THREE.CanvasTexture(canvas);
  const positions=new Float32Array(60*3);
  for(let i=0;i<positions.length;i+=3){
   positions[i]=(Math.random()-.5)*33;
   positions[i+1]=-1+Math.random()*14;
   positions[i+2]=1-Math.random()*23;
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geometry,new THREE.PointsMaterial({
   map,size:[.23,.31,.40][variant],opacity:.82,transparent:true,depthWrite:false,alphaTest:.025
  }));
  points.frustumCulled=false;
  scene.add(points);
  crystalFields.push({positions,geometry});
 }
 const ui=document.createElement('section');ui.id='snowmanHome';ui.setAttribute('aria-label','Welcome to Isha’s portfolio');ui.innerHTML='<div class="welcome-copy"><span>A LITTLE WONDER, BEFORE WE BEGIN</span><h1 aria-label="Hello, welcome to my portfolio!"><span class="snow-typed" aria-hidden="true"></span><i class="typing-cursor" aria-hidden="true">|</i></h1></div><div class="welcome-bottom"><p>A world is waiting.</p><button id="beginJourney" aria-label="Explore Portfolio"><span class="portal-window"><svg viewBox="0 0 180 180" aria-hidden="true"><path fill="#728da7" d="M0 125 48 44 83 94 121 33 180 128V180H0Z"/><path fill="#e3edf4" d="m48 44-21 36 22-9 14 7zm73-11-25 48 22-16 19 14z"/><path fill="#193d48" d="m15 143 17-54 18 54H39l16 29H9l15-29zm103 5 15-49 18 49h-9l14 32h-43l14-32z"/><path fill="#c0dce2" d="M71 180q-13-20 19-40t4-30q38 16 12 33t12 37"/></svg></span><span class="portal-button-label">Explore Portfolio ↗</span></button><small>MOVE YOUR POINTER · SAY HELLO</small></div><div class="snowman-name"><small>HELLO, MY NAME IS</small><strong>Isha<br>Venkataraman</strong></div>';document.body.append(ui);
 let eyeScreenX=innerWidth*.5,eyeScreenY=innerHeight*.42;let active=true,tx=0,ty=0,lx=0,ly=0,lastMove=performance.now(),enteredAt=performance.now();const typed=ui.querySelector('.snow-typed'),nameplate=ui.querySelector('.snowman-name'),greeting='Hello, welcome to my portfolio!';
 let garden=null, marine=null, marineLoad=null, selectedWorld=-1, portalHovered=false;
 const worlds=[
  {name:'Winter',label:'Explore Portfolio',open:onExplore},
  {name:'Botanical Garden',label:'Enter Projects',open:onProjects},
  {name:'Underwater',label:'Enter Skills',open:onSkills}
 ];
 const portal=ui.querySelector('#beginJourney');
 const portalUI=portal.closest('.welcome-bottom');
 const label=portal.querySelector('.portal-button-label');
 const selector=document.createElement('nav');
 selector.className='home-worlds';
 selector.setAttribute('aria-label','Home environments');
 selector.innerHTML='<button type="button" aria-label="Previous environment">←</button><span aria-live="polite"></span><button type="button" aria-label="Next environment">→</button>';
 ui.append(selector);
 const worldName=selector.querySelector('span');
 let progress=0,target=0;
 let blendTarget=null;
 const blendSize=new THREE.Vector2();
 const blendScene=new THREE.Scene();
 const blendCamera=new THREE.Camera();
 const blendMaterial=new THREE.ShaderMaterial({
  transparent:true,depthTest:false,depthWrite:false,
  uniforms:{nextImage:{value:null},progress:{value:0}},
  vertexShader:`varying vec2 screenUV;
   void main(){screenUV=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform sampler2D nextImage;
   uniform float progress;
   varying vec2 screenUV;
   void main(){
    float edge=1.15-progress*1.30+sin(screenUV.y*5.0)*.025;
    float reveal=smoothstep(edge-.105,edge+.105,screenUV.x);
    gl_FragColor=vec4(texture2D(nextImage,screenUV).rgb,reveal);
    #include <colorspace_fragment>
   }`
 });
 const blendQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blendMaterial);
 blendQuad.frustumCulled=false;
 blendScene.add(blendQuad);
 const worldIndex=value=>THREE.MathUtils.euclideanModulo(value,worlds.length);
 function setProgress(value){
  target=value;
  if(target===progress)return;
  garden??=createGardenHome();
  const first=Math.floor(Math.min(progress,target)),last=Math.ceil(Math.max(progress,target));
  const reefOnRoute=first+worldIndex(2-first)<=last;
  if(reefOnRoute&&!marineLoad){
   marineLoad=import('./marine-home.js?v=reef-7').then(({createMarineHome})=>{
    marine=createMarineHome();
   }).catch(error=>{
    marineLoad=null;
    target=Math.round(progress);
    console.error('Could not load underwater Home',error);
   });
  }
 }
 function updateSelectedWorld(){
  const selected=worldIndex(Math.round(progress));
  if(selected===selectedWorld)return;
  selectedWorld=selected;
  lastMove=enteredAt=performance.now();
  tx=ty=lx=ly=0;
  ui.classList.toggle('garden-home-selected',selected===1);
  ui.classList.toggle('marine-home-selected',selected===2);
  const world=worlds[selected];
  worldName.textContent=world.name;
  if(selected!==2)for(const property of ['--reef-x','--reef-y','--reef-size','--reef-reveal'])portalUI.style.removeProperty(property);
  portal.setAttribute('aria-label',world.label);
  label.textContent=world.label+' ↗';
  renderer.domElement.setAttribute('aria-label',[
   'A waving snowman in a snowy winter forest',
   'A fox beneath flower arches in a botanical garden',
   'A baby sea turtle swimming in a bioluminescent reef'
  ][selected]);
 }
 const [previous,next]=selector.querySelectorAll('button');
 function stepWorld(direction){
  const stop=direction>0?Math.floor(target)+1:Math.ceil(target)-1;
  setProgress(stop);
 }
 previous.onclick=()=>stepWorld(-1);
 next.onclick=()=>stepWorld(1);
 portal.addEventListener('pointerenter',()=>portalHovered=true);
 portal.addEventListener('pointerleave',()=>portalHovered=false);
 let swipe=null;
 addEventListener('wheel',event=>{
  if(!active||event.ctrlKey||event.defaultPrevented||document.querySelector('.snow-squall,dialog[open]'))return;
  const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY);
  const delta=horizontal?event.deltaX:event.deltaY;
  if(!delta)return;
  event.preventDefault();
  const unit=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
  setProgress(target+THREE.MathUtils.clamp(delta*unit/620,-1,1));
 },{passive:false});
 addEventListener('touchstart',event=>{
  const touch=event.touches[0];
  swipe=active&&touch&&!event.target.closest?.('button,header,dialog')
   ?{x:touch.clientX,y:touch.clientY,start:target}:null;
 },{passive:true});
 addEventListener('touchmove',event=>{
  const touch=event.touches[0];
  if(!active||!swipe||!touch)return;
  const dx=swipe.x-touch.clientX,dy=swipe.y-touch.clientY;
  if(Math.abs(dx)>Math.max(14,Math.abs(dy)))swipe.horizontal=true;
  if(swipe.horizontal)setProgress(swipe.start+THREE.MathUtils.clamp(dx/Math.min(innerWidth*.8,420),-1,1));
 },{passive:true});
 addEventListener('touchend',()=>swipe=null);
 addEventListener('touchcancel',()=>swipe=null);
 updateSelectedWorld();
 function point(e){if(!active)return;tx=THREE.MathUtils.clamp((e.clientX-eyeScreenX)/Math.min(150,innerWidth*.21),-1,1);ty=THREE.MathUtils.clamp((eyeScreenY-e.clientY)/Math.min(145,innerHeight*.20),-1,1);lastMove=performance.now();}
 addEventListener('touchmove',e=>{if(!active||e.target.closest?.('header'))return;const touch=e.touches[0];if(touch){point(touch);if(e.cancelable)e.preventDefault();}},{passive:false});addEventListener('touchstart',e=>{if(active&&e.touches[0])point(e.touches[0]);},{passive:true});addEventListener('pointermove',point);addEventListener('pointerdown',point);addEventListener('keydown',e=>{if(!active)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(!e.repeat)stepWorld(e.key==='ArrowRight'?1:-1);e.preventDefault();return;}const directions={ArrowUp:[0,1],ArrowDown:[0,-1]};if(directions[e.key]){[tx,ty]=directions[e.key];lastMove=performance.now();e.preventDefault();}});
 portal.onclick=event=>worlds[selectedWorld].open(event.currentTarget);
 function setActive(value){active=value;ui.hidden=!value;renderer.domElement.setAttribute('aria-label',value?'A waving snowman with eyes that follow your pointer, in a snowy winter forest':'A first-person reindeer sleigh ride through a snow-covered forest with igloos and alpine mountains');document.body.classList.toggle('on-snowman-home',value);document.body.style.overflow=value?'hidden':'';model.visible=homeLights.visible=flakes.visible=value;onVisibility(value);if(value){selectedWorld=-1;updateSelectedWorld();tx=ty=0;lastMove=enteredAt=performance.now();ui.classList.remove('name-visible','explore-visible');}}
 setActive(true);
 if(initialWorld){
  const startingTarget=initialWorld===2?-1:initialWorld;
  setProgress(startingTarget);
  if(initialWorld===1)progress=target;
  else marineLoad?.then(()=>{
   if(active&&marine&&target===startingTarget)progress=target;
  });
 }
 return {get active(){return active;},get world(){return marineLoad&&!marine&&initialWorld===2&&target===-1?2:selectedWorld;},setActive,tick(dt,t,frameDelta=dt){if(!active)return;
 const readyTarget=marine||!marineLoad?target:THREE.MathUtils.clamp(target,0,1);
 progress=reduced?readyTarget:THREE.MathUtils.damp(progress,readyTarget,7,Math.min(frameDelta,.16));
 if(Math.abs(progress-readyTarget)<.009)progress=readyTarget;
 if(progress===target&&!swipe){
  const offset=target-worldIndex(target);
  progress-=offset;
  target-=offset;
 }
 updateSelectedWorld();
 const now=performance.now(),intro=(now-enteredAt)/1000-.45,idle=(now-lastMove)/1000;typed.textContent=greeting.slice(0,reduced?greeting.length:Math.max(0,Math.floor(intro*26)));ui.classList.toggle('name-visible',reduced||intro>1.25);ui.classList.toggle('explore-visible',reduced||intro>1.85);ui.querySelector('button').disabled=!reduced&&intro<1.85;ui.classList.toggle('typing-complete',typed.textContent.length===greeting.length);const wink=!reduced&&intro>2.65&&idle>2.7?Math.pow(Math.max(0,Math.sin((idle-2.7)*Math.PI/3*2)),22):0;eyeWhites[0].scale.y=1.13*(1-wink*.92);pupils[0].pupil.scale.y=1.08*(1-wink*.94);smile.scale.y=1+wink*.18;if(performance.now()-lastMove>1100)tx=ty=0;let gazeX=tx,gazeY=ty;if(!reduced&&intro<0){gazeX=gazeY=0;}else if(!reduced&&intro<2.65){gazeX=intro<1.25?-.4+Math.min(1,intro/1.25)*.8:intro<1.85?0:1;gazeY=intro<1.25?1:intro<1.85?-1:0;}lx=THREE.MathUtils.damp(lx,gazeX,10,dt);ly=THREE.MathUtils.damp(ly,gazeY,10,dt);pupils.forEach(({pupil,x})=>{const radius=Math.max(1,Math.hypot(lx,ly));
 pupil.position.x=x+lx/radius*.115;
 pupil.position.y=.14+ly/radius*.128;
 pupil.position.z=.733-.021*Math.min(1,Math.hypot(lx,ly));});head.rotation.y=lx*.11;head.rotation.x=-ly*.065;arm.rotation.z=reduced?0:Math.sin(t*2.5)*.22;model.rotation.y=-.055;for(let i=0;i<particles.length;i+=3){particles[i+1]-=dt*(.35+(i%7)*.08);if(particles[i+1]<0)particles[i+1]=17;}geo.attributes.position.needsUpdate=true;
 if(!reduced)for(const {positions,geometry} of crystalFields){
  for(let i=0;i<positions.length;i+=3){
   positions[i]+=(.24+Math.sin(t*.65+i)*.16)*dt;
   positions[i+1]-=(.58+(i%7)*.12)*dt;
   if(positions[i+1]<-1){positions[i+1]=13;positions[i]=(Math.random()-.5)*33;}
   if(positions[i]>17)positions[i]=-17;
  }
  geometry.attributes.position.needsUpdate=true;
 }
 const wide=innerWidth/innerHeight>1.1;camera.aspect=innerWidth/innerHeight;camera.position.set(0,2.9,wide?7.4:11);camera.lookAt(0,2.75,-8);camera.updateProjectionMatrix();model.position.x=0;model.updateMatrixWorld(true);camera.updateMatrixWorld(true);const uiRect=ui.getBoundingClientRect();const labelPosition=model.localToWorld(new THREE.Vector3(.12,2.46,.96)).project(camera);nameplate.style.left=((labelPosition.x+1)*innerWidth/2-uiRect.left)+'px';nameplate.style.top=((1-labelPosition.y)*innerHeight/2-uiRect.top)+'px';const left=model.localToWorld(new THREE.Vector3(-.63,2.46,.96)).project(camera),right=model.localToWorld(new THREE.Vector3(.87,2.46,.96)).project(camera);const badgeScale=THREE.MathUtils.clamp((right.x-left.x)*innerWidth/2/155,.5,1.15);nameplate.style.transform='translate(-50%,-50%) rotate(-4deg) scale('+badgeScale+')';const eyePosition=model.localToWorld(new THREE.Vector3(0,3.77,.72)).project(camera);eyeScreenX=(eyePosition.x+1)*innerWidth/2;eyeScreenY=(1-eyePosition.y)*innerHeight/2;
 auroraTime.value=reduced?0:t;
 const hopTime=reduced?0:t;
 const cycle=hopTime/.94;
 const phase=cycle%1;
 const airborne=THREE.MathUtils.clamp((phase-.16)/.64,0,1);
 const lift=4*airborne*(1-airborne);
 const step=Math.floor(cycle)+THREE.MathUtils.smoothstep(phase,.10,.84);
 const route=step*.35-.75;
 bunny.position.set(Math.sin(route)*1.54,-.2+lift*.19,-4.95+Math.cos(route)*.56);
 bunny.rotation.y=Math.atan2(Math.cos(route)*1.54,-Math.sin(route)*.56);
 bunnyBody.rotation.x=(airborne-.5)*lift*.44;
 bunnyEars.forEach(ear=>ear.rotation.x=.21-lift*.29);
 hindPaws.forEach(paw=>{
  paw.position.z=-.165-lift*.14;
  paw.rotation.x=-lift*.58;
 });
 forePaws.forEach(paw=>{
  paw.position.y=.095+lift*.08;
  paw.rotation.x=lift*.62;
 });
 bunnyShadow.position.set(bunny.position.x,-.191,bunny.position.z);
 function renderWorld(index){
  if(index===0){renderer.render(scene,camera);return;}
  const lookingAtPortal=(portalHovered||document.activeElement===portal)&&intro>=2.65;
  if(index===1){
   garden.render(renderer,dt,t,gazeX,gazeY,lookingAtPortal,reduced,intro,idle);
   return;
  }
  const pose=marine.render(renderer,dt,t,gazeX,gazeY,lookingAtPortal,reduced,intro,idle);
  if(selectedWorld!==2)return;
  portalUI.style.setProperty('--reef-x',((pose.portalPoint.x+1)*innerWidth/2-uiRect.left)+'px');
  portalUI.style.setProperty('--reef-y',((1-pose.portalPoint.y)*innerHeight/2-uiRect.top)+'px');
  portalUI.style.setProperty('--reef-size',pose.portalSize+'px');
  portalUI.style.setProperty('--reef-reveal',pose.portalReveal);
  nameplate.style.left=((pose.badge.x+1)*innerWidth/2-uiRect.left)+'px';
  nameplate.style.top=((1-pose.badge.y)*innerHeight/2-uiRect.top)+'px';
  nameplate.style.transform='translate(-50%,-50%) rotate(-4deg) scale('+pose.scale+')';
  eyeScreenX=(pose.gazePoint.x+1)*innerWidth/2;
  eyeScreenY=(1-pose.gazePoint.y)*innerHeight/2;
 }
 const lower=Math.floor(progress),mix=progress-lower;
 renderWorld(worldIndex(lower));
 if(mix===0)return;
 const size=renderer.getDrawingBufferSize(blendSize);
 if(!blendTarget)blendTarget=new THREE.WebGLRenderTarget(size.x,size.y);
 else if(blendTarget.width!==size.x||blendTarget.height!==size.y)blendTarget.setSize(size.x,size.y);
 const previousTarget=renderer.getRenderTarget(),autoClear=renderer.autoClear;
 try{
  renderer.setRenderTarget(blendTarget);
  renderWorld(worldIndex(lower+1));
  renderer.setRenderTarget(previousTarget);
  renderer.autoClear=false;
  blendMaterial.uniforms.nextImage.value=blendTarget.texture;
  blendMaterial.uniforms.progress.value=mix;
  renderer.render(blendScene,blendCamera);
 }finally{
  renderer.setRenderTarget(previousTarget);
  renderer.autoClear=autoClear;
 }
 }};
}
