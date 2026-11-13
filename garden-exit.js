import {createPortalSix} from './portal-six.js';
export function createGardenExit(THREE,garden,camera,renderer){
 const scene=garden.scene,z=-126,cx=garden.pathX(z),root=new THREE.Group();root.position.set(cx,2.9,z);scene.add(root);const green=new THREE.MeshStandardMaterial({color:'#405c38',roughness:1});const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.23,12,100),green);root.add(ring);const leaf=new THREE.MeshStandardMaterial({color:'#547e3f',side:THREE.DoubleSide,roughness:.9}),pink=new THREE.MeshStandardMaterial({color:'#ed9db8',side:THREE.DoubleSide,roughness:.75});for(let i=0;i<150;i++){const a=i/150*6.28;const foliage=new THREE.Mesh(garden.botanicalGeometry.leafGeometry,leaf);foliage.position.set(Math.cos(a)*2.83,Math.sin(a)*2.83,.10);foliage.scale.set(.65,.65,.65);foliage.rotation.set(.5,a,-a);root.add(foliage);if(i%3===0)for(let j=0;j<12;j++){const petal=new THREE.Mesh(garden.botanicalGeometry.petalGeometry,pink);petal.position.set(Math.cos(a)*2.83,Math.sin(a)*2.83,.19);petal.scale.setScalar(.19);petal.rotation.set(1.1-(j>5?.25:0),j*1.047,0);root.add(petal);}}

 const uniforms={time:{value:0}};const waterMat=new THREE.ShaderMaterial({uniforms,transparent:true,side:THREE.DoubleSide,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;void main(){vec2 p=vUv-.5;float r=length(p);float rays=sin(atan(p.y,p.x)*14.+time*.6+r*30.);float waves=sin(r*80.-time*2.+rays*.5);vec3 col=mix(vec3(.015,.13,.24),vec3(.13,.65,.64),clamp(vUv.y+waves*.07,0.,1.));col+=pow(max(0.,waves),14.)*.07;float edge=smoothstep(.35,.49,r);col+=edge*vec3(.2,.5,.5);gl_FragColor=vec4(col,.98);}`});root.add(new THREE.Mesh(new THREE.CircleGeometry(2.55,100),waterMat));const rim=new THREE.Mesh(new THREE.TorusGeometry(2.58,.035,8,100),new THREE.MeshBasicMaterial({color:'#b0fff1',transparent:true,opacity:.8}));rim.position.z=.09;root.add(rim);
 let canEnter=false;const raycaster=new THREE.Raycaster();addEventListener('pointerup',e=>{if(!canEnter||active||diving||transition||e.target!==document.querySelector('#world'))return;raycaster.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2),camera);if(raycaster.intersectObject(root,true).length)ui.querySelector('button').click();});
 const ui=document.createElement('section');ui.id='gardenExit';ui.hidden=true;ui.innerHTML='<small>THE NEXT LANDSCAPE</small><h2>Beneath the surface.</h2><button>Draw 6 to open the portal ↗</button><p>A flower-drawn spell · pointer or touch</p>';document.body.append(ui);
 let active=false,transition=null,diving=false,drawing=false,whirling=false,lastDiveFrame=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const dive={value:0},startPosition=new THREE.Vector3();
 const veil=document.createElement('div');veil.className='garden-dive-wash';document.body.append(veil);
 let marine,vortex,reefRequest,requestGeneration=0;
 function prepare(){
  if(marine)return Promise.resolve();
  reefRequest??=Promise.all([import('./marine-world.js'),import('./marine-vortex.js')])
   .then(([{createMarineWorld},{createMarineVortex}])=>{
    marine=createMarineWorld(THREE,camera,returnToGarden);
    vortex=createMarineVortex(THREE,camera,marine.scene);
   }).finally(()=>{reefRequest=null;});
  return reefRequest;
 }
 const portalView=new THREE.PerspectiveCamera(60,1,.08,220),portalTexture=new THREE.WebGLRenderTarget(640,640);
 const windowMesh=new THREE.Mesh(new THREE.CircleGeometry(2.55,96),new THREE.MeshBasicMaterial({map:portalTexture.texture,toneMapped:false}));windowMesh.position.z=.021;windowMesh.visible=false;root.add(windowMesh);
 function enter(preserve=false){active=true;document.body.classList.remove('marine-diving');diving=whirling=drawing=false;ui.hidden=true;spell.hide();camera.fov=66;camera.updateProjectionMatrix();marine.enter(preserve);}
 function returnToGarden(){if(transition)return;transition=gsap.timeline({onComplete:()=>transition=null}).to(veil,{opacity:1,duration:.3}).call(()=>{active=false;marine.leave();camera.fov=66;camera.updateProjectionMatrix();}).to(veil,{opacity:0,duration:.45});}
 const spell=createPortalSix(startDive,()=>{if(transition||diving)return;drawing=false;spell.hide();});
 ui.querySelector('button').onclick=()=>{if(transition||drawing||diving)return;drawing=true;startPosition.copy(camera.position);gsap.fromTo(dive,{value:0},{value:1,duration:reduced?0:.55,ease:'power2.inOut'});spell.show();};
 async function startDive(){
  const generation=requestGeneration;
  try{await prepare();}catch(error){
   if(generation!==requestGeneration)return;
   drawing=false;spell.hide();ui.querySelector('p').textContent='Could not load the reef. Open the portal again to retry.';
   console.error(error);return;
  }
  if(generation!==requestGeneration)return;
  if(transition||diving)return;
  diving=true;dive.value=0;startPosition.copy(camera.position);
  document.body.classList.add('marine-diving');vortex.start();windowMesh.visible=true;
  transition=gsap.timeline({onComplete:()=>{transition=null;}});
  transition.to(dive,{value:1,duration:reduced?.10:1.15,delay:reduced?0:.28,ease:'power2.in'})
   .call(()=>{drawing=false;spell.hide();},[],reduced?0:.28)
   .call(()=>{windowMesh.visible=false;if(reduced)enter();else {lastDiveFrame=0;whirling=true;}});

 }
 const destination=new THREE.Vector3(),center=new THREE.Vector3(),top=new THREE.Vector3();
 return {
  enter,prepare,
  enterThroughVortex(){if(reduced){enter();return;}lastDiveFrame=0;diving=whirling=true;document.body.classList.add('marine-diving');vortex.start();},
  get scene(){return active?marine.scene:whirling?vortex.scene:null},
  get active(){return active},
  get entering(){return diving},
  get busy(){return drawing||diving||whirling||!!transition},
  reset(){requestGeneration++;transition?.kill();transition=null;gsap.killTweensOf(dive);gsap.killTweensOf(veil);diving=drawing=whirling=active=false;document.body.classList.remove('marine-diving');windowMesh.visible=false;vortex?.settle(0);spell.hide();marine?.leave();ui.hidden=true;veil.style.opacity=0;camera.fov=66;camera.updateProjectionMatrix();},
  tick(dt,time,distance,inGarden){
   uniforms.time.value=time;canEnter=inGarden&&!active&&!drawing&&!diving&&!transition&&distance>=102;ui.hidden=!canEnter;rim.material.opacity=.65+Math.sin(time)*.22;
   if(active){vortex.settle(time);marine.tick(dt,time);return;}
   if(whirling){marine.tick(dt,time);const now=performance.now(),step=lastDiveFrame?Math.min(.25,(now-lastDiveFrame)/1000):dt;lastDiveFrame=now;const progress=vortex.tick(step);if(progress>=1){enter(true);vortex.settle(time);}return;}

   if(drawing&&!diving){camera.position.lerpVectors(startPosition,destination.set(cx,2.9,z+Math.max(8.5,3.2/(Math.tan(camera.fov*Math.PI/360)*camera.aspect))),dive.value);camera.lookAt(cx,2.9,z);camera.updateMatrixWorld(true);center.copy(root.position).project(camera);top.copy(root.position);top.y+=2.55;top.project(camera);spell.place((center.x*.5+.5)*innerWidth,(-center.y*.5+.5)*innerHeight,Math.abs(top.y-center.y)*innerHeight);}
   if(diving){camera.position.lerpVectors(startPosition,destination.set(cx,2.9,z+.19),dive.value);camera.lookAt(cx,2.9,z-5);
    vortex.tick(0,portalView);portalView.fov=THREE.MathUtils.radToDeg(2*Math.atan(2.55/Math.max(.16,camera.position.z-z)));portalView.updateProjectionMatrix();const prior=renderer.getRenderTarget();renderer.setRenderTarget(portalTexture);renderer.render(marine.scene,portalView);renderer.setRenderTarget(prior);
   }
  }
 };
}
