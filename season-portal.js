import {createGardenCrossing} from './garden-crossing.js?v=trail-controls-2';
export function createSeasonPortal({THREE,renderer,camera,winterScene,path,aboutStop,onWinterReturn}){
 const gate=.315,at=path(78),center=new THREE.Vector3(at.x,4,-78),root=new THREE.Group();root.position.copy(center);winterScene.add(root);let state='winter',hold=0,downAt=null,travel=0,autumnDistance=0,gardenTravel=0,lastFrame=0,suppressUntil=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let seed=81;const rnd=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646},range=(a,b)=>a+(b-a)*rnd();
 const rock=new THREE.MeshStandardMaterial({color:'#60738b',roughness:1}),snow=new THREE.MeshStandardMaterial({color:'#e1eaf3',roughness:.94});
 function mesh(parent,geo,mat,x,y,z,sx=1,sy=sx,sz=sx){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const torus=new THREE.TorusGeometry(3.65,.64,12,64);const pos=torus.attributes.position;for(let i=0;i<pos.count;i++){const k=1+Math.sin(pos.getX(i)*9+pos.getY(i)*7)*.025;pos.setXYZ(i,pos.getX(i)*k,pos.getY(i)*k,pos.getZ(i));}torus.computeVertexNormals();mesh(root,torus,rock,0,0,0);mesh(root,new THREE.TorusGeometry(3.68,.72,10,48,Math.PI),snow,0,.13,-.03);
 for(const side of [-1,1]){mesh(root,new THREE.DodecahedronGeometry(1,1),rock,side*5,-1,-2,3,5.3,3);mesh(root,new THREE.DodecahedronGeometry(1,1),snow,side*5,1.4,-2,2.9,3,2.9);const peak=new THREE.ConeGeometry(3.4,9,9,4);const p=peak.attributes.position;for(let i=0;i<p.count;i++){if(p.getY(i)<4)p.setY(i,p.getY(i)+Math.sin(p.getX(i)*3+p.getZ(i)*2)*.45);}peak.computeVertexNormals();mesh(root,peak,snow,side*6.5,2.6,-4,1,1,1);}
 const glow=new THREE.MeshBasicMaterial({color:'#9df2ea',transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false});const rim=mesh(root,new THREE.TorusGeometry(3.28,.055,8,100),glow,0,0,.5);const rim2=mesh(root,new THREE.TorusGeometry(3.37,.025,6,100),new THREE.MeshBasicMaterial({color:'#c1a2fa',transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}),0,0,.48);
 const particleGeo=new THREE.BufferGeometry(),particlePos=[];for(let i=0;i<400;i++){const a=rnd()*Math.PI*2,r=range(3.2,3.8);particlePos.push(Math.cos(a)*r,Math.sin(a)*r,range(.4,.85))}particleGeo.setAttribute('position',new THREE.Float32BufferAttribute(particlePos,3));const sparks=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:'#c9b4ff',size:.045,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));root.add(sparks);
 // The next season is an actual second WebGL scene, also rendered into the aperture.
 let garden,autumn,falling,gardenExit,gardenRequest,gardenWarmup,previewReady=false;
 const rimPlants=[];
 function loadGarden(){
  if(gardenRequest)return gardenRequest;
  if(garden)return gardenWarmup??Promise.resolve();
  gardenRequest??=Promise.all([import('./botanical-garden.js?v=bridge-20'),import('./garden-exit.js?v=resume-view-1')])
   .then(([{createBotanicalGarden},{createGardenExit}])=>{
    garden=createBotanicalGarden(THREE,camera);
    ({scene:autumn,falling}=garden);
    gardenExit=createGardenExit(THREE,garden,camera,renderer);
    const vineMaterial=new THREE.MeshStandardMaterial({color:'#51783c',side:THREE.DoubleSide});
    const roseMaterial=new THREE.MeshStandardMaterial({color:'#ed86a4',side:THREE.DoubleSide});
    for(let i=0;i<28;i++){
     const angle=i/28*Math.PI*2,radius=3.41+.10*Math.sin(i*2.1);
     const sprig=new THREE.Group();
     sprig.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,.69);
     sprig.rotation.z=angle+Math.PI/2;
     root.add(sprig);sprig.visible=false;
     const leaf=new THREE.Mesh(garden.botanicalGeometry.leafGeometry,vineMaterial);
     leaf.scale.setScalar(.63);leaf.rotation.set(.8,0,(i%2?1:-1)*.7);sprig.add(leaf);
     if(i%4===0)for(let j=0;j<7;j++){
      const petal=new THREE.Mesh(garden.botanicalGeometry.petalGeometry,roseMaterial);
      petal.rotation.set(1.04,j/7*Math.PI*2,0);petal.scale.setScalar(.20);
      sprig.add(petal);
     }
     rimPlants.push(sprig);
    }
    setGardenView(previewCamera,gardenEntryZ);
    garden.tick(0,0,gardenEntryZ,true);
    gardenWarmup=renderer.compileAsync(autumn,previewCamera)
     .catch(error=>console.warn('Garden shader warmup failed',error))
     .then(()=>{renderPreview();previewReady=true;});
    return gardenWarmup;
   }).finally(()=>{gardenRequest=null;});
  return gardenRequest;
 }
 const previewCamera=new THREE.PerspectiveCamera(58,1,.1,240);previewCamera.position.set(0,2.8,10);previewCamera.lookAt(0,3,-25);const target=new THREE.WebGLRenderTarget(256,256);const aperture=mesh(root,new THREE.CircleGeometry(3.25,80),new THREE.MeshBasicMaterial({color:'#456c84',toneMapped:false}),0,0,.4);const portalLight=new THREE.PointLight('#9edcfa',10,16,2);portalLight.position.copy(center).add(new THREE.Vector3(0,0,2));winterScene.add(portalLight);
 const ui=document.createElement('section');ui.id='seasonPortal';ui.hidden=true;ui.innerHTML=`<div class="portal-heading"><small>THE THRESHOLD / SNOW → BOTANICAL GARDEN</small><h2>A different world<br>is waiting.</h2><p>Press and hold the portal for two seconds.</p></div><button class="portal-hold" aria-label="Hold for two seconds to enter the botanical garden"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="hold-track" cx="60" cy="60" r="54"/><circle class="hold-fill" cx="60" cy="60" r="54"/></svg><span class="hold-symbol">✳</span><span class="hold-label">HOLD TO CROSS</span></button><p class="portal-hint" aria-live="polite">A garden in bloom, on the other side.<small>Hold mouse, touch, Space or Enter · release to cancel</small></p>`;document.body.append(ui);const button=ui.querySelector('button'),hint=ui.querySelector('.portal-hint');const wash=document.createElement('div');wash.id='portalWarp';document.body.append(wash);const arrival=document.createElement('section');arrival.id='autumnArrival';arrival.hidden=true;arrival.innerHTML='<small>CHAPTER 02 / THE BOTANICAL GARDEN</small><h2>Ideas in <br><em>bloom.</em></h2><p>A living garden of curiosity, craft, and things I build.</p><span class="arrival-note">Scroll to watch the petals unfold. Wander beneath the rose arches to the conservatory.</span><button id="backWinter">← Return through the portal</button>';document.body.append(arrival);
 let flowers,crossingFromTrail=false,revealingGarden=false;
 const gardenEntryZ=8, revealAt=.32;
 function renderPreview(){
  const previousTarget=renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  try{renderer.render(autumn,previewCamera);}
  finally{renderer.setRenderTarget(previousTarget);}
  if(!aperture.material.map){
   aperture.material.map=target.texture;
   aperture.material.color.set('#ffffff');
   aperture.material.needsUpdate=true;
  }
 }
 let prefetchRetry=0;
 function prefetch(){
  if(gardenRequest||previewReady||performance.now()<prefetchRetry)return;
  loadGarden().catch(error=>{prefetchRetry=performance.now()+4000;console.warn(error);});
 }
 function finishGarden(){
  state='autumn';
  arrival.hidden=false;arrival.classList.remove('exploring');
  document.body.classList.remove('at-season-portal');
  document.body.classList.add('in-autumn');
  teamVisibility(false);
 }
 function crossToGarden(fromTrail,covered=null){
  crossingFromTrail=fromTrail;
  revealingGarden=false;
  camera.fov=66;camera.updateProjectionMatrix();
  autumnDistance=gardenTravel=0;
  release();ui.hidden=true;arrival.hidden=true;
  document.body.style.overflow='hidden';
  if(reduced){placeGardenCamera(gardenEntryZ);finishGarden();return;}
  document.body.classList.add('garden-crossing-active');
  state='crossing';travel=covered?revealAt:0;
  flowers=covered??flowers??createGardenCrossing();
  if(!covered)flowers.show();
 }
 function setGardenView(view,z){
  view.position.set(garden.routeX(z),2.4+garden.routeY(z),z);
  view.lookAt(garden.routeX(z-12),2.35+garden.routeY(z-12),z-12);
 }
 function placeGardenCamera(z){setGardenView(camera,z);}
 function advanceGardenRide(dt,time){
  if(!garden.projectOpen&&!gardenExit.busy){
   gardenTravel=autumnDistance;
  }
  const z=gardenEntryZ-gardenTravel;
  placeGardenCamera(z);
  garden.tick(dt,time,z,true);
 }
 function tickCrossing(dt,time,frameDelta){
  travel=Math.min(1,travel+frameDelta/4.0);
  flowers.paint(travel);
  if(travel<revealAt){
   if(!crossingFromTrail)return;
   const p=path(2+gate*192),q=THREE.MathUtils.smoothstep(travel,0,revealAt);
   camera.position.lerpVectors(p,center,q);camera.position.y=THREE.MathUtils.lerp(2.8,4,q);
   camera.lookAt(center.x,4,center.z-8);return;
  }
  revealingGarden=true;
  finishGarden();
  advanceGardenRide(dt,time);
 }
 function activate(){if(state!=='winter'||!aboutStop.complete)return;state='ready';ui.hidden=false;button.disabled=!previewReady;
  if(!previewReady){
   hint.firstChild.textContent='Preparing the garden…';
   loadGarden().then(()=>{button.disabled=false;}).catch(()=>{button.disabled=false;hint.firstChild.textContent='Hold again to retry loading the garden.';});
  }document.body.classList.add('at-season-portal');document.body.style.overflow='hidden';button.focus({preventScroll:true});}
 function release(){downAt=null;button.classList.remove('holding');}
 function start(){if(state!=='ready')return;if(!previewReady){button.disabled=true;loadGarden().then(()=>{button.disabled=false;}).catch(()=>{button.disabled=false;hint.firstChild.textContent='Hold again to retry loading the garden.';});return;}downAt=performance.now();button.classList.add('holding');}
 button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();button.setPointerCapture(e.pointerId);start();});button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)start();}});button.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();release();}});addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 function cancel(){returnButton.hidden=true;revealingGarden=false;flowers?.hide();rimPlants.forEach(plant=>{plant.visible=false;});gardenExit?.reset();suppressUntil=performance.now()+1800;release();hold=0;state='winter';ui.hidden=true;arrival.hidden=true;wash.classList.remove('warping');wash.style.opacity='0';document.body.classList.remove('at-season-portal','in-autumn','garden-crossing-active');document.body.style.overflow='';winterScene.fog.density=.005;camera.fov=66;camera.updateProjectionMatrix();teamVisibility(true);}
 function teamVisibility(value){document.body.classList.toggle('portal-travelling',!value);}
 function returnWinter(){returnButton.hidden=true;document.body.classList.remove('garden-crossing-active');revealingGarden=false;flowers?.hide();gardenExit?.reset();state='returning';travel=0;arrival.hidden=true;wash.classList.add('warping');document.body.style.overflow='hidden';}
 arrival.querySelector('button').remove();
 const returnButton=document.createElement('button');
 returnButton.id='returnAboutPortal';
 returnButton.textContent='← Back through the About portal';
 returnButton.hidden=true;
 returnButton.onclick=returnWinter;
 document.body.append(returnButton);
 function retreatFromPortal(delta){
  if(state!=='ready'||delta>=0)return false;
  cancel();
  onWinterReturn(gate-.025);
  return true;
 }

 addEventListener('wheel',e=>{if(gardenExit?.active||e.ctrlKey)return;if(retreatFromPortal(e.deltaY)){e.preventDefault();return;}if(garden?.projectOpen){if(e.target.closest?.('#treasureDialog'))return;e.preventDefault();return;}if(state==='autumn'||(state==='crossing'&&travel>=.56)){e.preventDefault();if(!gardenExit.active&&!gardenExit.busy&&!garden.projectOpen)autumnDistance=Math.max(0,Math.min(128,autumnDistance+e.deltaY*.014));}else if(['ready','crossing','returning'].includes(state))e.preventDefault();},{passive:false});
 let touchY=null;addEventListener('touchstart',e=>{if(['ready','autumn','crossing'].includes(state))touchY=e.touches[0]?.clientY;},{passive:true});addEventListener('touchmove',e=>{if(touchY!==null&&retreatFromPortal(touchY-(e.touches[0]?.clientY??touchY))){if(e.cancelable)e.preventDefault();return;}if((state!=='autumn'&&(state!=='crossing'||travel<.56))||gardenExit.active||gardenExit.busy||garden.projectOpen||touchY===null)return;const y=e.touches[0]?.clientY;if(y===undefined)return;autumnDistance=Math.max(0,Math.min(128,autumnDistance+(touchY-y)*.035));touchY=y;if(e.cancelable)e.preventDefault();},{passive:false});addEventListener('touchend',()=>touchY=null);
 return {gate,prefetch,renderCrossing(navEntrance){if(state!=='crossing'&&!revealingGarden)return false;(flowers??navEntrance)?.render(renderer);return true;},async prepare(key){await loadGarden();if(key==='skills')await gardenExit.prepare();},get inMarine(){return !!gardenExit?.active},get section(){if(gardenExit?.active||gardenExit?.entering)return 'skills';if(state==='autumn'||state==='crossing')return 'projects';return 'about';},enterMarine(){cancel();state='autumn';autumnDistance=gardenTravel=124;arrival.hidden=true;arrival.classList.add('exploring');document.body.classList.add('in-autumn');teamVisibility(false);gardenExit.enterThroughVortex();},enterGarden(covered){const reuse=covered===flowers;cancel();if(reuse)covered.show(revealAt);crossToGarden(false,covered);},get scene(){if(gardenExit?.scene)return gardenExit.scene;return state==='autumn'||state==='crossing'&&travel>=revealAt||state==='returning'&&travel<.45?autumn:null;},get active(){return state!=='winter';},get hideTeam(){return ['crossing','autumn','returning'].includes(state);},cancel,check(value){if(aboutStop.active)return value;if(state==='winter'&&value>=gate&&aboutStop.complete&&performance.now()>suppressUntil)activate();return ['ready','crossing','returning'].includes(state)?Math.min(value,gate):value;},tick(dt,time,frameDelta=dt){returnButton.hidden=state!=='autumn'||revealingGarden||gardenExit.active||gardenExit.busy||garden.projectOpen;if(state==='crossing'){tickCrossing(dt,time,frameDelta);return;}
 if(revealingGarden){
  travel=Math.min(1,travel+frameDelta/4.0);
  flowers.paint(travel);
  if(travel===1){revealingGarden=false;flowers.hide();document.body.classList.remove('garden-crossing-active');}
 }if(garden&&state==='ready')garden.tick(dt,time,gardenEntryZ,false);sparks.rotation.z=time*.08+hold*1.3;rim.rotation.z=time*.05;rim2.rotation.z=-time*.09;glow.opacity=.55+Math.sin(time*1.6)*.12+hold*.3;portalLight.intensity=8+hold*22;root.scale.setScalar(1+hold*.025);if(state==='ready'){camera.lookAt(center);if(downAt!==null)hold=Math.min(1,(performance.now()-downAt)/2000);else hold=THREE.MathUtils.damp(hold,0,6,dt);rimPlants.forEach((plant,i)=>{
 const growth=THREE.MathUtils.smoothstep(hold,i/34,i/34+.18);
 plant.visible=growth>.01;plant.scale.setScalar(growth);
});button.style.setProperty('--hold',String(hold));ui.querySelector('.hold-label').textContent=hold>.02?Math.round(hold*100)+'% CHARGED':'HOLD TO CROSS';const screen=center.clone().project(camera);button.style.left=(screen.x*.5+.5)*100+'%';button.style.top=(-screen.y*.5+.5)*100+'%';if(previewReady)hint.firstChild.textContent=hold>.03?'Keep holding. The threshold is opening…':'A garden in bloom, on the other side.';if(hold>=1){crossToGarden(true);return;}}if(previewReady&&state==='ready'&&performance.now()-lastFrame>250){lastFrame=performance.now();renderPreview();}if(state==='returning'){travel=Math.min(1,travel+dt/(reduced?.6:3));const t=1-travel;wash.style.opacity=String(Math.sin(t*Math.PI)**6*.95);camera.fov=66+Math.sin(t*Math.PI)*25;camera.updateProjectionMatrix();if(t<=.55){const p=path(2+gate*192),q=THREE.MathUtils.smoothstep(t,0,.55);camera.position.set(THREE.MathUtils.lerp(p.x,center.x,q),THREE.MathUtils.lerp(2.8,4,q),THREE.MathUtils.lerp(p.z,center.z-1,q));camera.lookAt(center.x,4,center.z-8);}else{const q=(t-.55)/.45;const z=14-q*6;camera.position.set(garden.pathX(z),THREE.MathUtils.lerp(2.8,2.4,q),z);camera.lookAt(garden.pathX(z-20),THREE.MathUtils.lerp(3,2.35,q),z-20);}if(travel>=1){wash.classList.remove('warping');wash.style.opacity='0';camera.fov=66;camera.updateProjectionMatrix();document.body.style.overflow='';document.body.classList.remove('at-season-portal');state='winter';hold=0;document.body.classList.remove('in-autumn');teamVisibility(true);onWinterReturn(gate-.025);}}if(state==='autumn'&&!gardenExit.scene){advanceGardenRide(dt,time);arrival.classList.toggle('exploring',autumnDistance>8);}if(falling&&['ready','crossing','autumn','returning'].includes(state)){const a=falling.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i]+=(Math.sin(time+i)*.25)*dt;a[i+1]-=dt*.5;if(a[i+1]<0)a[i+1]=13;}falling.geometry.attributes.position.needsUpdate=true;}gardenExit?.tick(dt,time,gardenTravel,state==='autumn');garden?.updateProjectUI(8-gardenTravel,state==='autumn'&&!gardenExit.active&&!gardenExit.busy,dt);}};
}
