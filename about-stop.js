import {makeTableEnvelope} from './about-envelope.js';

export function createAboutStop({THREE,scene,camera,team,sled,path,onResume}){
 const approachDistance=43.2,gate=(approachDistance-2)/192,d=55,p=path(d),center=new THREE.Vector3(p.x-8,0,-d);let state='idle',complete=false,progress=0,travel=0,startPosition,startLook,curve,opened=false,returnFocus=null,lastValue=0,openingScroll=0,routeIntent=0,reentryAfter=0,closeTween=null,leaveCallback=null,queuedExit=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const room=new THREE.Group();room.position.copy(center);room.visible=false;scene.add(room);
 const interior=new THREE.Scene();
 interior.background=new THREE.Color('#182b3e');
 interior.add(new THREE.HemisphereLight('#bdd9ed','#51453d',1.25));
 function setInterior(active){
  const destination=active?interior:scene;
  if(room.parent!==destination)destination.add(room);
 }const ice=new THREE.MeshStandardMaterial({color:'#b8d3df',side:THREE.BackSide,roughness:.9});const shell=new THREE.Mesh(new THREE.SphereGeometry(3.02,40,24,0,Math.PI*2,0,Math.PI/2),ice);room.add(shell);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(2.95,48),new THREE.MeshStandardMaterial({color:'#d9e5e9',roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=.025;room.add(floor);
 function box(mat,x,y,z,sx,sy,sz){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);o.position.set(x,y,z);o.castShadow=true;room.add(o);return o;}const wood=new THREE.MeshStandardMaterial({color:'#745344',roughness:.8});box(wood,0,.79,-1.1,3,.15,1.25);for(const x of [-1.2,1.2])box(wood,x,.4,-1.1,.13,.8,.85);
 const tableEnvelope=makeTableEnvelope(THREE,room);
 const rug=new THREE.Mesh(new THREE.CircleGeometry(1.6,40),new THREE.MeshStandardMaterial({color:'#9b6656',roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.04,-.1);rug.scale.y=.72;room.add(rug);
 const candle=new THREE.MeshStandardMaterial({color:'#fff1c6',emissive:'#ffad55',emissiveIntensity:1.3});box(candle,-1.1,1.05,-1.05,.12,.4,.12);const warm=new THREE.PointLight('#ffc581',17,8,2);warm.position.set(-1,1.9,0);room.add(warm);const fill=new THREE.PointLight('#b4d9ff',5,8,2);fill.position.set(1,2,1);room.add(fill);
 for(let row=1;row<6;row++){const theta=row*Math.PI/12,r=Math.sin(theta)*3.005,y=Math.cos(theta)*3.005;const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.016,4,60),new THREE.MeshBasicMaterial({color:'#7899aa',transparent:true,opacity:.24}));ring.rotation.x=Math.PI/2;ring.position.y=y;room.add(ring);}
 // A stone-lined fire pit sits beside the desk; warm light flickers over the ice.
 const fire=new THREE.Group();fire.position.set(-1.65,.07,-.15);room.add(fire);const rockMat=new THREE.MeshStandardMaterial({color:'#5f6970',roughness:1});for(let i=0;i<11;i++){const a=i*Math.PI*2/11,o=new THREE.Mesh(new THREE.DodecahedronGeometry(.16,0),rockMat);o.position.set(Math.cos(a)*.46,.09,Math.sin(a)*.46);o.scale.set(1.15,.8,1);fire.add(o);}const coal=new THREE.Mesh(new THREE.CircleGeometry(.44,24),new THREE.MeshStandardMaterial({color:'#302521',emissive:'#913c16',emissiveIntensity:.35,roughness:1}));coal.rotation.x=-Math.PI/2;coal.position.y=.04;fire.add(coal);for(let i=0;i<3;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.065,.09,.7,10),wood);log.position.set(0,.14+i*.03,0);log.rotation.set(Math.PI/2,0,i*1.1);fire.add(log);}
 const fireUniforms={time:{value:0}};const fireMat=new THREE.ShaderMaterial({uniforms:fireUniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;void main(){float y=vUv.y;float sway=sin(y*12.-time*4.)*.055+sin(y*25.+time*5.)*.025;float x=abs(vUv.x-.5+sway);float width=.39*pow(1.-y,.8);float flame=1.-smoothstep(width*.45,width+.015,x);float tongue=.7+.3*sin(y*19.-time*6.+vUv.x*12.);float a=flame*smoothstep(0.,.12,y)*(1.-smoothstep(.72,1.,y))*tongue;vec3 c=mix(vec3(1.,.23,.025),vec3(1.,.85,.35),pow(1.-y,2.));gl_FragColor=vec4(c,a*.85);}`});for(let i=0;i<3;i++){const flame=new THREE.Mesh(new THREE.PlaneGeometry(.85-i*.15,1.15-i*.15),fireMat);flame.position.set((i-1)*.12,.64-i*.06,.02+i*.03);flame.rotation.y=(i-1)*.6;fire.add(flame);}const fireLight=new THREE.PointLight('#ff9f50',12,7,2);fireLight.position.set(-1.65,.9,-.15);room.add(fireLight);
 const stoolMat=new THREE.MeshStandardMaterial({color:'#65504a',roughness:.9});box(stoolMat,1.75,.32,-.1,.72,.55,.65);box(new THREE.MeshStandardMaterial({color:'#8a6c70',roughness:1}),1.75,.64,-.1,.75,.12,.68);const bookColors=['#526976','#8d6554','#697c6b'];for(let i=0;i<3;i++)box(new THREE.MeshStandardMaterial({color:bookColors[i],roughness:.9}),.95,.92+i*.065,-1.2,.48,.055,.32);
 const seamMat=new THREE.MeshBasicMaterial({color:'#7298aa',transparent:true,opacity:.25});for(let row=1;row<6;row++)for(let j=0;j<12;j++){const phi=j*Math.PI/6+(row%2)*.13,points=[];for(let k=0;k<=6;k++){const theta=(row+k/6)*Math.PI/12,r=2.995;points.push(new THREE.Vector3(Math.sin(theta)*Math.cos(phi)*r,Math.cos(theta)*r,Math.sin(theta)*Math.sin(phi)*r));}room.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),6,.009,3,false),seamMat));}
 const ui=document.createElement('section');ui.id='aboutStop';ui.hidden=true;ui.setAttribute('aria-label','About Isha — the winter letter');ui.innerHTML=`<div class="stop-caption"><span>01 / THE WINTER LETTER</span><p>A little warmth. A little of my story.</p></div><button class="envelope" id="winterEnvelope" aria-label="Open the letter from Isha"><span class="envelope-pocket"></span><span class="envelope-flap"></span><span class="wax-seal">iv</span><span class="envelope-address">To you, fellow explorer.</span></button><div class="letter-experience" hidden><article class="winter-paper" tabindex="0" aria-label="About letter. Scroll inside to read all paragraphs."><div class="paper-fibres"></div><div class="paper-meta">A NOTE FROM ISHA <span>CHENNAI, INDIA</span></div><div class="ink-content"><div class="letter-heading"><div><small>HELLO, I’M</small><h2>Isha<br><em>Venkataraman.</em></h2></div><figure class="portrait"><img src="./assets/isha-about.webp" loading="lazy" decoding="async" alt="Portrait of Isha Venkataraman"></figure></div><p>I’m a third-year M.Tech CSE student at SSN, building at the intersection of <strong>machine learning and frontend engineering.</strong></p><p>I develop ML and computer vision solutions with Python, Scikit-Learn, TensorFlow, OpenCV and XGBoost—and turn them into polished, interactive products with React, React Native and Tailwind CSS.</p><p>I craft motion-rich interfaces with GSAP, Framer Motion and SVG animation, with a focus on making complex model outputs intuitive and engaging for end users.</p><p class="leadership-note"><strong>Beyond the code, I help communities grow.</strong> I serve as Joint Secretary of SSN’s ACM-W Student Chapter, Public Relations &amp; Editorial Head of the IEEE Student Branch, and Editorial Head of the IEEE Computer Society—bringing leadership, communication and storytelling into the work I do.</p><div class="letter-signature">With curiosity,<br><em>Isha</em><span class="signature-tagline">ML · FRONTEND · MOTION</span></div></div><div class="heat-glow"></div></article></div><div class="matchstick" aria-hidden="true"><i class="match-head"></i><i class="match-smoke"></i><i class="match-flame"></i><i class="match-spark s1"></i><i class="match-spark s2"></i></div><div class="stop-controls"><p id="stopInstruction" aria-live="polite">Scroll to open the envelope, or click its seal.</p><div class="ink-progress"><i></i></div><button id="revealAll">Reveal all ↗</button><button id="replayLetter" hidden>Replay the letter ↺</button><button id="returnTrail" hidden>Back to the snowy trail <span>→</span></button></div>`;document.body.append(ui);
 const envelope=ui.querySelector('.envelope'),experience=ui.querySelector('.letter-experience'),paper=ui.querySelector('.winter-paper'),match=ui.querySelector('.matchstick'),instruction=ui.querySelector('#stopInstruction'),back=ui.querySelector('#returnTrail'),revealAll=ui.querySelector('#revealAll');let liftTween=null,unfold=0,openingTween=null,extractTimeline=null,extractionFront=null,extractionClip='';
 const revealBlocks=[ui.querySelector('.letter-heading > div'),ui.querySelector('.portrait'),...ui.querySelectorAll('.ink-content > p'),ui.querySelector('.letter-signature')];let revealTween=null,fireFocus=0;
 const flamePosition=new THREE.Vector3(-1.65,.65,-.12).add(center);
 const projectedFlame=new THREE.Vector3();
 function clearIgnition(){
  fireFocus=0;experience.style.opacity='';
  match.classList.remove('carrying-flame','catching-flame');
 }
 function positionMatch(x,y,angle){
  match.style.left=x+'px';match.style.top=y+'px';
  match.style.setProperty('--match-angle',angle+'deg');
 }
 const clamp01=value=>Math.max(0,Math.min(1,value));
 function revealPaint(follow=false){
  const q=progress;
  ui.dataset.revealProgress=String(q);
  const stage=clamp01(q/.96)*revealBlocks.length;
  const index=Math.min(revealBlocks.length-1,Math.floor(stage));
  const amount=clamp01(stage-index);
  for(let i=0;i<revealBlocks.length;i++){
   const fraction=clamp01(stage-i),block=revealBlocks[i];
   block.style.visibility=fraction>0?'visible':'hidden';
   block.style.opacity=String(Math.min(1,fraction*3));
   block.style.clipPath=fraction>=1?'none':`inset(0 ${(1-fraction)*100}% 0 0)`;
  }
  const block=revealBlocks[index],bounds=paper.getBoundingClientRect(),line=block.getBoundingClientRect();
  let x=line.left-bounds.left+line.width*amount;
  let y=line.top-bounds.top+paper.scrollTop+Math.min(line.height*.58,54);
  if(follow&&q>0&&q<.97&&paper.scrollHeight>paper.clientHeight+4){
   const destination=Math.max(0,y-paper.clientHeight*.65);
   paper.scrollTop+=(destination-paper.scrollTop)*.13;
  }
  positionMatch(bounds.left+x,bounds.top+y-paper.scrollTop,17+Math.sin(stage*2.5)*12);
  match.style.opacity=q>0&&q<.995?'1':'0';
  match.classList.toggle('carrying-flame',q>0&&q<.985);
  paper.style.setProperty('--heat-x',x+'px');
  paper.style.setProperty('--heat-y',(y-paper.scrollTop)+'px');
  paper.classList.toggle('lit',q>0&&q<.985);
  ui.querySelector('.ink-progress i').style.width=q*100+'%';
  const finished=q>=.999;
  back.hidden=!finished;revealAll.hidden=finished;ui.querySelector('#replayLetter').hidden=!finished;
  instruction.textContent=finished?'Read the letter at your own pace.':'';
 }
 function stopReveal(){
  revealTween?.kill();revealTween=null;clearIgnition();
 }
 function resetReveal(){stopReveal();progress=0;revealPaint();}
 function showAll(){
  stopReveal();progress=1;paper.scrollTop=0;revealPaint();
 }
 function sweepReveal(restart=false){
  stopReveal();
  if(restart){progress=0;paper.scrollTop=0;revealPaint();}
  if(reduced){showAll();return;}
  const playhead={time:0,value:progress};
  const ignitionEnd=2.65;
  revealTween=gsap.timeline({onComplete:showAll});
  revealTween.to(playhead,{time:ignitionEnd,duration:ignitionEnd,ease:'none',onUpdate(){
   const t=playhead.time;
   fireFocus=clamp01(t/.50)*(1-clamp01((t-1.47)/.75));
   experience.style.opacity=String(1-.91*fireFocus);
   camera.updateMatrixWorld(true);
   projectedFlame.copy(flamePosition).project(camera);
   const fireX=(projectedFlame.x+1)*innerWidth/2,fireY=(1-projectedFlame.y)*innerHeight/2;
   const first=revealBlocks[0].getBoundingClientRect();
   const firstY=first.top+Math.min(first.height*.58,54);
   const approach=clamp01((t-.33)/.82),carry=clamp01((t-1.57)/(ignitionEnd-1.57));
   const ease=carry*carry*(3-2*carry);
   const x=THREE.MathUtils.lerp(fireX+98*(1-approach),first.left,ease);
   const y=THREE.MathUtils.lerp(fireY-58*(1-approach),firstY,ease)-64*Math.sin(ease*Math.PI);
   positionMatch(x,y,THREE.MathUtils.lerp(-27+approach*35,17,ease));
   match.style.opacity=String(clamp01((t-.33)/.21));
   match.classList.toggle('carrying-flame',t>=1.25);
   match.classList.toggle('catching-flame',t>=1.25&&t<1.55);
  }});
  revealTween.call(clearIgnition);
  revealTween.to(playhead,{value:1,duration:5.1,ease:'none',onUpdate(){progress=playhead.value;revealPaint(true);}});
 }
 function liftEnvelope(){
  state='lifting';setInterior(true);ui.hidden=false;envelope.disabled=true;revealAll.hidden=true;
  ui.classList.add('lifting');
  camera.updateMatrixWorld(true);room.updateMatrixWorld(true);
  const point=tableEnvelope.getWorldPosition(new THREE.Vector3()).project(camera);
  const bounds=envelope.getBoundingClientRect();
  const x=(point.x+1)*innerWidth/2-bounds.left-bounds.width/2;
  const y=(1-point.y)*innerHeight/2-bounds.top-bounds.height/2;
  function ready(){
   tableEnvelope.visible=false;liftTween=null;state='envelope';ui.classList.remove('lifting');
   envelope.disabled=false;revealAll.hidden=false;
   envelope.focus({preventScroll:true});
   if(queuedExit){queuedExit=false;exit();}
  }
  if(reduced){ready();return;}
  gsap.set(envelope,{visibility:'hidden'});
  liftTween=gsap.fromTo(envelope,{xPercent:-50,yPercent:-50,x,y,scale:.30,rotationX:69,rotationZ:4},
   {x:0,y:0,scale:1,rotationX:0,rotationZ:-4,duration:.95,delay:.26,ease:'power2.inOut',onStart(){tableEnvelope.visible=false;envelope.style.visibility='';},onComplete:ready});
 }
 resetReveal();
 function finishExtraction(){state='reading';envelope.hidden=true;experience.style.clipPath='';extractionFront?.remove();extractionFront=null;ui.classList.remove('extracting');gsap.set(paper,{clearProps:'transform,opacity'});paper.scrollTop=0;sweepReveal();}
 function paintExtraction(){ui.dataset.openProgress=String(unfold);extractTimeline?.progress(unfold);experience.style.clipPath=unfold<.60?extractionClip:'';ui.querySelector('.ink-progress i').style.width=unfold*100+'%';if(unfold>=.999)finishExtraction();}
 function startExtraction(){if(state==='extracting')return;if(state!=='envelope')return;state='extracting';opened=true;unfold=0;resetReveal();experience.hidden=false;envelope.hidden=false;envelope.style.opacity='1';envelope.classList.add('opening');ui.classList.add('extracting');gsap.set(paper,{clearProps:'transform,opacity'});const er=envelope.getBoundingClientRect(),pr=paper.getBoundingClientRect(),cx=er.left+er.width/2,scale=Math.min(envelope.offsetWidth*.77/paper.offsetWidth,envelope.offsetHeight*.72/paper.offsetHeight),dx=cx-(pr.left+pr.width/2),inside=er.top+215-(pr.top+pr.height/2),lift=er.top-90-(pr.top+pr.height/2);const flap=envelope.querySelector('.envelope-flap');flap.style.transition='none';const front=document.createElement('div');front.className='return-envelope-front';front.style.cssText=`opacity:1;left:${cx-envelope.offsetWidth/2}px;top:${er.top+er.height/2-envelope.offsetHeight/2}px;width:${envelope.offsetWidth}px;height:${envelope.offsetHeight}px`;front.innerHTML='<span class="envelope-pocket"></span><span class="envelope-address">To you, fellow explorer.</span>';ui.append(front);extractionFront=front;extractionClip=`inset(0 ${Math.max(0,innerWidth-er.right)}px ${Math.max(0,innerHeight-er.bottom)}px ${Math.max(0,er.left)}px)`;experience.style.clipPath=extractionClip;gsap.set(paper,{scale,x:dx,y:inside,rotationX:0,rotationZ:-4,opacity:1});gsap.set(flap,{rotationX:0});extractTimeline=gsap.timeline({paused:true}).to(flap,{rotationX:-175,duration:.22,ease:'power2.inOut'}).to(paper,{y:lift,duration:.38,ease:'power2.inOut'}).set(front,{opacity:0}).call(()=>{experience.style.clipPath='';}).to(paper,{scale:1,x:0,y:0,rotationZ:0,duration:.40,ease:'power2.inOut'}).to(envelope,{opacity:0,duration:.22},'>-.22');instruction.textContent='Keep scrolling to draw the letter out of its envelope.';paintExtraction();}
 function openRemainder(thenReveal=false){if(state==='envelope')startExtraction();if(state!=='extracting'){if(thenReveal&&state==='reading'){showAll();}return;}openingTween?.kill();const head={value:unfold};openingTween=gsap.to(head,{value:1,duration:reduced?0:Math.max(.2,1.6*(1-unfold)),ease:'sine.inOut',onUpdate:()=>{unfold=head.value;paintExtraction();},onComplete:()=>{openingTween=null;if(thenReveal){showAll();}}});}
 envelope.onclick=()=>openRemainder(false);revealAll.onclick=()=>openRemainder(true);ui.querySelector('#replayLetter').onclick=()=>sweepReveal(true);
 function begin({near=false}={}){if(!['idle','done'].includes(state)||(state==='done'&&performance.now()<reentryAfter))return;exitProgress=gate+.025;routeIntent=0;tableEnvelope.visible=true;gsap.set(envelope,{clearProps:'transform,visibility'});openingTween?.kill();extractTimeline?.kill();extractionFront?.remove();extractionFront=null;unfold=0;ui.classList.remove('packing','extracting');envelope.querySelector('.envelope-flap').style.transition='';gsap.set(envelope.querySelector('.envelope-flap'),{clearProps:'transform'});resetReveal();opened=false;openingScroll=0;progress=0;envelope.hidden=false;envelope.style.opacity='1';envelope.style.setProperty('--open-scroll','0');envelope.classList.remove('opening');experience.hidden=true;back.hidden=true;ui.querySelector('#replayLetter').hidden=true;revealAll.hidden=false;instruction.textContent='Scroll to open the envelope, or click its seal.';if(near){const approach=path(approachDistance);camera.position.set(approach.x,2.8,approach.z);camera.lookAt(center.x,1.8,center.z+4);const fade=document.createElement('div');fade.className='igloo-travel-fade';document.body.append(fade);gsap.to(fade,{opacity:0,duration:.6,onComplete:()=>fade.remove()});}returnFocus=document.activeElement;state='entering';ui.querySelector('.portrait img').loading='eager';travel=0;startPosition=camera.position.clone();startLook=camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(8).add(startPosition);curve=new THREE.CubicBezierCurve3(startPosition,new THREE.Vector3(startPosition.x,2.7,startPosition.z-1),new THREE.Vector3(center.x,2.1,center.z+10),new THREE.Vector3(center.x,1.65,center.z+1.85));document.body.style.overflow='hidden';document.body.classList.add('in-about-stop');document.querySelectorAll('footer,#copy,#landmark').forEach(el=>el.inert=true);}
 let exitProgress=gate+.025;
 function startExitCamera(){setInterior(false);state='exiting';travel=0;ui.hidden=true;experience.hidden=true;gsap.set(paper,{clearProps:'transform,opacity,clipPath'});experience.style.clipPath='';startPosition=camera.position.clone();startLook=new THREE.Vector3(center.x,.95,center.z-1.1);const out=path(2+exitProgress*192);curve=new THREE.CubicBezierCurve3(startPosition,new THREE.Vector3(center.x,2.1,center.z+10),new THREE.Vector3(out.x,2.7,out.z+3),new THREE.Vector3(out.x,2.8,out.z));}
 function exit(){if(!['reading','envelope'].includes(state))return;const hasPaper=state==='reading';state='closing';stopReveal();ui.classList.add('packing');back.hidden=true;ui.querySelector('#replayLetter').hidden=true;revealAll.hidden=true;instruction.textContent='Tucking this chapter away…';envelope.querySelector('.envelope-flap').style.transition='';gsap.set(envelope.querySelector('.envelope-flap'),{clearProps:'transform'});paper.classList.remove('lit');match.style.opacity='0';const tl=closeTween=gsap.timeline({onComplete:startExitCamera});if(hasPaper){envelope.hidden=false;envelope.style.opacity='0';envelope.classList.add('opening');const er=envelope.getBoundingClientRect(),pr=paper.getBoundingClientRect(),cx=er.left+er.width/2,cy=er.top+er.height/2,scale=Math.min(285/paper.offsetWidth,envelope.offsetHeight*.72/paper.offsetHeight);const dx=cx-(pr.left+pr.width/2),lift=er.top-35-(pr.top+pr.height/2);const front=document.createElement('div');front.className='return-envelope-front';front.style.cssText=`left:${cx-envelope.offsetWidth/2}px;top:${cy-envelope.offsetHeight/2}px;width:${envelope.offsetWidth}px;height:${envelope.offsetHeight}px`;front.innerHTML='<span class="envelope-pocket"></span><span class="envelope-address">To you, fellow explorer.</span>';ui.append(front);tl.to(paper,{scale,x:dx,y:lift,rotationX:25,rotationZ:-4,duration:reduced?0:.7,ease:'power2.inOut'}).to(envelope,{opacity:1,duration:reduced?0:.22},'>-.1').set(front,{opacity:1}).call(()=>{experience.style.clipPath=`inset(0 ${Math.max(0,innerWidth-er.right)}px ${Math.max(0,innerHeight-er.bottom)}px ${Math.max(0,er.left)}px)`;}).to(paper,{y:er.top+215-(pr.top+pr.height/2),rotationX:0,duration:reduced?0:.8,ease:'power2.inOut'}).call(()=>{experience.hidden=true;experience.style.clipPath='';front.remove();envelope.style.setProperty('--open-scroll','0');envelope.classList.remove('opening');});}else tl.call(()=>{envelope.style.setProperty('--open-scroll','0');envelope.classList.remove('opening');});tl.to({value:0},{value:1,duration:reduced?0:.85});}
 back.onclick=exit;
 function scrub(delta){openingTween?.kill();openingTween=null;if(state==='envelope')startExtraction();if(state==='extracting'){unfold=Math.max(0,Math.min(1,unfold+delta/1100));paintExtraction();}}
 function backToTrail(){
  exitProgress=gate-.025;
  if(state==='entering'||state==='lifting'){queuedExit=true;return;}
  if(state==='extracting'){
   openingTween?.kill();
   extractTimeline?.kill();
   extractionFront?.remove();
   extractionFront=null;
   experience.hidden=true;
   experience.style.clipPath='';
   ui.classList.remove('extracting');
   state='envelope';
  }
  exit();
 }
 function reverseAbout(event,delta){
  if(delta>=0||!['entering','lifting','envelope','extracting','reading'].includes(state))return false;
  if(state==='reading'&&event.target.closest?.('.winter-paper')&&paper.scrollTop>1)return false;
  event.preventDefault();
  backToTrail();
  return true;
 }
 addEventListener('wheel',e=>{if(e.ctrlKey||reverseAbout(e,e.deltaY))return;if(state==='done'){routeIntent=Math.sign(e.deltaY);return;}if(state==='reading'&&e.target.closest?.('.winter-paper'))return;if(['envelope','extracting'].includes(state)){e.preventDefault();scrub(Math.max(-90,Math.min(90,e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1))));}else if(['entering','lifting','exiting','closing'].includes(state))e.preventDefault();},{passive:false});
 let touchY=0;addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY||0;},{passive:true});addEventListener('touchmove',e=>{const y=e.touches[0]?.clientY??touchY,delta=touchY-y;touchY=y;if(reverseAbout(e,delta))return;if(state==='reading'&&progress>=.98&&e.target.closest('.winter-paper'))return;if(['envelope','extracting'].includes(state)){e.preventDefault();scrub(delta*2);}}, {passive:false});
 addEventListener('keydown',e=>{if(state==='done'){if(['ArrowUp','PageUp'].includes(e.key))routeIntent=-1;else if(['ArrowDown','PageDown',' '].includes(e.key))routeIntent=1;return;}if(state==='idle')return;if(['ArrowUp','PageUp'].includes(e.key)&&reverseAbout(e,-1))return;if(e.key==='Escape'){e.preventDefault();if(state==='reading'){progress=1;revealPaint();exit();}else if(state==='extracting'){openingTween?.kill();unfold=1;paintExtraction();exit();}else if(state==='envelope')envelope.click();}if(['envelope','extracting'].includes(state)&&['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();scrub(e.key==='ArrowDown'?90:230);return;}});
 addEventListener('resize',()=>{if(state==='reading')requestAnimationFrame(revealPaint);});

 function dismissImmediately(){setInterior(false);liftTween?.kill();liftTween=null;ui.classList.remove('lifting');openingTween?.kill();extractTimeline?.kill();stopReveal();closeTween?.kill();openingTween=extractTimeline=revealTween=closeTween=null;extractionFront?.remove();extractionFront=null;ui.querySelectorAll('.return-envelope-front').forEach(el=>el.remove());gsap.killTweensOf([paper,envelope,envelope.querySelector('.envelope-flap')]);ui.hidden=true;experience.hidden=true;experience.style.clipPath='';ui.classList.remove('packing','extracting');gsap.set(paper,{clearProps:'transform,opacity,clipPath'});room.visible=false;state=complete?'done':'idle';lastValue=0;routeIntent=0;queuedExit=false;leaveCallback=null;reentryAfter=0;document.body.classList.remove('in-about-stop');document.body.style.overflow='';document.querySelectorAll('footer,#copy,#landmark').forEach(el=>el.inert=false);team.visible=true;sled.visible=true;}
 return {gate,get reading(){return state==='reading';},get interiorScene(){return room.parent===interior?interior:null;},dismissImmediately,resetJourney(){dismissImmediately();complete=false;state='idle';lastValue=0;routeIntent=0;reentryAfter=0;},get active(){return !['idle','done'].includes(state)},get complete(){return complete},resumeFromPortal(value){complete=true;state='done';lastValue=value;routeIntent=0;},check(value,renderedValue=value){const previous=lastValue;lastValue=value;if(!['idle','done'].includes(state))return gate;const crossingBack=complete&&routeIntent<0&&previous>gate+.012&&value<=gate+.012;const crossingForward=complete&&routeIntent>0&&previous<gate-.012&&value>=gate-.012;if((!complete&&value>=gate&&renderedValue>=gate-.0005)||crossingBack||crossingForward){begin();lastValue=gate;return gate;}return !complete?Math.min(value,gate):value;},enter:()=>begin({near:true}),leave(callback){leaveCallback=callback;if(state==='entering'||state==='lifting')queuedExit=true;else if(state==='extracting'){openingTween?.kill();unfold=1;paintExtraction();exit();}else if(['reading','envelope'].includes(state))exit();else if(['idle','done'].includes(state)){leaveCallback=null;callback?.();}},tick(dt,time,transitionDelta=dt){fireUniforms.time.value=time;fireLight.intensity=11+Math.sin(time*8)*1.5+Math.sin(time*13)*.7;warm.intensity=12+Math.sin(time*6)*.5;if(state==='entering'||state==='exiting'){travel=Math.min(1,travel+transitionDelta/(reduced?.1:2.65));const ease=travel**3*(10+travel*(-15+6*travel));camera.position.copy(curve.getPoint(ease));const look=state==='entering'?new THREE.Vector3(center.x,1.02,center.z-1.1):path(2+exitProgress*192+18).setY(3.2);camera.lookAt(startLook.clone().lerp(look,ease));room.visible=state==='entering'?travel>.66:travel<.6;if(state==='entering'&&camera.position.z<center.z+2.43)setInterior(true);team.visible=false;sled.visible=false;if(travel>=1){if(state==='entering'){liftEnvelope();}else{state='done';complete=true;routeIntent=0;reentryAfter=performance.now()+900;lastValue=exitProgress;room.visible=false;team.visible=true;sled.visible=true;document.body.classList.remove('in-about-stop');document.querySelectorAll('footer,#copy,#landmark').forEach(el=>el.inert=false);document.body.style.overflow='';onResume(exitProgress);const after=leaveCallback;leaveCallback=null;if(after)after();else returnFocus?.focus?.({preventScroll:true});}}}else if(state==='lifting'||state==='reading'||state==='envelope'||state==='extracting'||state==='closing'){camera.position.set(center.x,1.65,center.z+1.85);camera.lookAt(center.x-1.47*fireFocus,1.02-.27*fireFocus,center.z-1.1+.84*fireFocus);room.visible=true;team.visible=false;sled.visible=false;}}};
}
