import {createCityScene,towerDistance,pavilionDistance,driveLength} from './city-scene.js?v=free-look-1';

const canvas=document.querySelector('#cityView');
const tower=document.querySelector('#tower');
const enter=document.querySelector('#enterTower');
const hint=document.querySelector('#driveHint'),pavilion=document.querySelector('#pavilion');
const cameraPicker=document.querySelector('#cityCamera');
const brake=document.querySelector('#brake'),accelerator=document.querySelector('#accelerator'),forward=document.querySelector('#forward');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fromReef=new URLSearchParams(location.search).get('from')==='reef';
const floors=[
 {org:'IEEE Women in Engineering',role:'Public Relations Member',story:'Public relations for IEEE Women in Engineering.',visual:'campaign',steps:['BRIEF','POSTER','ANNOUNCE']},
 {org:'TEDx SSNSNUC',role:'Speaker Relations & Curation Member',story:'Part of the team supporting speaker relations and talk curation.',visual:'stage',steps:['SPEAKERS','TALK THEMES','STAGE']},
 {org:'IEEE Computer Society',role:'Editorial Head',story:'Leading editorial work for the Computer Society.',visual:'draft',steps:['DRAFT','EDIT','PUBLISH']},
 {org:'IEEE Student Branch',role:'Public Relations & Editorial Head',story:'Leading public relations and editorial work for the student branch.',visual:'press',steps:['HEADLINE','LAYOUT','PRINT']},
 {org:'SSN ACM-W Student Chapter',role:'Joint Secretary',story:'Supporting the chapter and its initiatives as Joint Secretary.',visual:'constellation',steps:['PEOPLE','EVENTS','INITIATIVES']},
 {org:'SSN Coding Club',role:'Full Stack Deputy Head',story:'I built the SSN Coding Club website. The team was impressed by the result and appointed me Full Stack Deputy Head.',visual:'website',steps:['WIREFRAME','BUILD','LAUNCH']}
];
let city;
try{city=createCityScene(canvas);}catch(error){console.warn('City WebGL unavailable',error);document.body.classList.add('city-fallback');}
let distance=city?0:towerDistance,approach=0,previous=0,enterStart=null,throttle=0,drag=null,lane=0,inspecting=false;
const pressedKeys=new Set(),heldPedals=new Set(),freeLook={yaw:0,pitch:0};
let speed=0,waitingForTraffic=false;
const braking=()=>pressedKeys.has(' ')||heldPedals.has(brake);
const accelerating=()=>pressedKeys.has('ArrowUp')||pressedKeys.has('w')||heldPedals.has(accelerator)||heldPedals.has(forward);
function clearDrivingInput(){
 pressedKeys.clear();heldPedals.clear();throttle=0;speed=0;
 delete brake.dataset.held;delete accelerator.dataset.held;delete forward.dataset.held;
 drag=null;canvas.classList.remove('is-looking');
}
let arriving=fromReef&&!reduced&&!!city,ascentTime=0;
if(arriving)document.body.classList.add('city-arriving');
function drive(delta){
 if(arriving||tower.open||enterStart!==null||braking())return false;
 inspecting=false;
 const wanted=Math.max(0,Math.min(driveLength,distance+delta));
 const next=city?city.drive(distance,wanted,lane):wanted;
 waitingForTraffic=Math.abs(next-wanted)>1e-5;
 const moved=Math.abs(next-distance)>1e-5;
 distance=next;
 updateDrive();
 return moved&&!waitingForTraffic;
}
function updateDrive(){
 const near=Math.abs(distance-towerDistance)<11;
 const atPavilion=Math.abs(distance-pavilionDistance)<8;
 enter.disabled=!near;
 enter.hidden=!near;
 pavilion.hidden=!atPavilion;
 const action=inspecting?'Return to the road ↗':'Look toward Waterfront Pavilion ↗';
 if(pavilion.textContent!==action)pavilion.textContent=action;
 const destination=near?'Leadership Tower':atPavilion?'Waterfront Pavilion':distance<41?'Right toward Waterfront Pavilion':distance<76?'Left toward Leadership Tower':distance>=driveLength?'End of the waterfront':'Scroll or hold ↑ to drive';
 const status=(waitingForTraffic?'Waiting for traffic':destination)+' · '+(lane?'Right lane':'Left lane');
 if(hint.textContent!==status)hint.textContent=status;
}
function changeLane(value){
 if(!city||arriving||tower.open||enterStart!==null)return;
 if(value===lane)return;
 if(!city.canChangeLane(distance,value,lane)){waitingForTraffic=true;updateDrive();return;}
 lane=value;waitingForTraffic=false;inspecting=false;updateDrive();
}
document.querySelector('#laneLeft').onclick=()=>changeLane(0);
document.querySelector('#laneRight').onclick=()=>changeLane(1);
pavilion.onclick=()=>{speed=0;inspecting=!inspecting;updateDrive();};
cameraPicker.onchange=()=>{freeLook.yaw=freeLook.pitch=0;};
cameraPicker.disabled=!city;

updateDrive();
addEventListener('wheel',event=>{
 if(event.ctrlKey||tower.open)return;
 event.preventDefault();
 const multiplier=event.deltaMode===1?14:event.deltaMode===2?innerHeight:1;
 drive(Math.sign(event.deltaY)*Math.min(21,Math.abs(event.deltaY)*multiplier*.04));
},{passive:false});
canvas.addEventListener('pointerdown',event=>{
 if(event.button!==0||drag||!city||arriving||tower.open||enterStart!==null)return;
 drag={id:event.pointerId,x:event.clientX,y:event.clientY};
 canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-looking');
});
canvas.addEventListener('pointermove',event=>{
 if(drag?.id!==event.pointerId)return;
 freeLook.yaw=(freeLook.yaw-(event.clientX-drag.x)*.009)%(Math.PI*2);
 freeLook.pitch=Math.max(-1.13,Math.min(1.13,freeLook.pitch-(event.clientY-drag.y)*.008));
 drag.x=event.clientX;drag.y=event.clientY;
});
for(const type of ['lostpointercapture','pointercancel','pointerup'])canvas.addEventListener(type,event=>{
 if(drag?.id!==event.pointerId)return;
 drag=null;canvas.classList.remove('is-looking');
});
canvas.addEventListener('dblclick',()=>{freeLook.yaw=freeLook.pitch=0;});
const driveKeys=['ArrowUp','ArrowDown','w','s',' '];
const backing=()=>throttle<0||pressedKeys.has('ArrowDown')||pressedKeys.has('s');
addEventListener('keydown',event=>{
 if(tower.open||event.altKey||event.metaKey||event.ctrlKey||event.target.closest?.('select'))return;
 if(['ArrowLeft','ArrowRight','a','d'].includes(event.key)){
  event.preventDefault();changeLane(event.key==='ArrowRight'||event.key==='d'?1:0);return;
 }
 if(!driveKeys.includes(event.key)||event.key===' '&&event.target.closest?.('button,a'))return;
 event.preventDefault();pressedKeys.add(event.key);
});
addEventListener('keyup',event=>pressedKeys.delete(event.key));
addEventListener('blur',clearDrivingInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearDrivingInput();});
for(const button of [accelerator,brake,forward]){
 button.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  button.setPointerCapture(event.pointerId);heldPedals.add(button);button.dataset.held='';
  if(button===brake)speed=0;
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{
  heldPedals.delete(button);delete button.dataset.held;
 });
 // Native keyboard activation still works when a pedal button has focus.
 button.addEventListener('click',event=>{
  if(event.detail!==0)return;
  if(button===brake)speed=0;else drive(1.5);
 });
}
const reverse=document.querySelector('#reverse');
reverse.addEventListener('pointerdown',event=>{reverse.setPointerCapture(event.pointerId);throttle=-1;});
for(const type of ['pointerup','pointercancel','lostpointercapture'])reverse.addEventListener(type,()=>{throttle=0;});
reverse.addEventListener('click',event=>{if(event.detail===0)drive(-1.5);});
const floorButtons=document.querySelector('#floorButtons'),art=document.querySelector('#floorArt');
const stage=document.querySelector('.elevator-stage'),display=document.querySelector('#floorDisplay');
const org=document.querySelector('#floorOrg'),title=document.querySelector('#towerTitle'),story=document.querySelector('#floorStory'),replay=document.querySelector('#replayFloor');
let currentFloor=-1,elevatorTimer,doorTimer;
floors.forEach(({org},i)=>{
 const button=document.createElement('button');button.textContent=String(i+1);
 button.setAttribute('aria-label',`Floor ${i+1}, ${org}`);button.title=org;
 button.onclick=()=>visitFloor(i);floorButtons.prepend(button);
});
function showFloor(){
 const floor=floors[currentFloor];
 display.textContent=String(currentFloor+1);
 org.textContent=floor.org;title.textContent=floor.role;story.textContent=floor.story;replay.hidden=false;
 art.className='';art.replaceChildren();
 const screen=document.createElement('div');screen.className='story-screen '+floor.visual;
 const steps=floor.steps.map((text,index)=>{
  const item=document.createElement('span');item.textContent=text;item.style.setProperty('--step',index);
  return item;
 });
 screen.append(...steps);
 if(floor.visual==='website'){
  const mockup=document.createElement('div');mockup.className='web-mock';
  for(let index=0;index<7;index++){
   const panel=document.createElement('i');panel.style.setProperty('--step',index);mockup.append(panel);
  }
  screen.append(mockup);
 }
 const stamp=document.createElement('strong');
 stamp.textContent=currentFloor===5?'APPOINTED':'FLOOR '+(currentFloor+1);
 screen.append(stamp);art.append(screen);
}
function visitFloor(index){
 clearTimeout(elevatorTimer);clearInterval(doorTimer);
 const start=currentFloor+1;
 currentFloor=index;
 Array.from(floorButtons.children).forEach((button,i)=>button.setAttribute('aria-pressed',String(floors.length-1-i===index)));
 if(reduced){showFloor();return;}
 stage.classList.add('doors-closed');
 let level=start;
 doorTimer=setInterval(()=>{
  level+=Math.sign(index+1-level);
  display.textContent=String(level||'G');
 },95);
 elevatorTimer=setTimeout(()=>{
  clearInterval(doorTimer);showFloor();stage.classList.remove('doors-closed');
 },410+Math.abs(index+1-start)*95);
}
replay.onclick=()=>visitFloor(currentFloor);
function openTower(){
 enterStart=null;clearDrivingInput();
 tower.showModal();
 if(currentFloor<0)floorButtons.firstElementChild.focus();
}
enter.onclick=()=>{
 if(enter.disabled||arriving||enterStart!==null)return;
 if(reduced||!city){openTower();return;}
 clearDrivingInput();enterStart=performance.now();enter.disabled=true;
};
document.querySelector('#leaveTower').onclick=()=>tower.close();
tower.addEventListener('close',()=>{
 clearTimeout(elevatorTimer);clearInterval(doorTimer);
 if(currentFloor>=0)showFloor();
 stage.classList.remove('doors-closed');approach=0;inspecting=false;updateDrive();enter.focus({preventScroll:true});
});

const sound=document.querySelector('#citySound');
let audio,volume,timer,beat=0;
function note(frequency,when,length,level,type){
 const voice=audio.createOscillator(),envelope=audio.createGain();
 voice.type=type;voice.frequency.value=frequency;
 envelope.gain.setValueAtTime(level,when);
 envelope.gain.exponentialRampToValueAtTime(.0001,when+length);
 voice.connect(envelope).connect(volume);voice.start(when);voice.stop(when+length);
}
function playBeat(){
 if(document.hidden)return;
 const now=audio.currentTime;
 note([55,55,65.4,49][Math.floor(beat/4)%4],now,.28,.17,'triangle');
 if(beat%2===0)note(102,now,.09,.18,'sine');
 if(beat%4===2)note(720,now,.075,.022,'triangle');
 beat++;
}
sound.onclick=async()=>{
 if(timer){clearInterval(timer);timer=null;volume.gain.setTargetAtTime(0,audio.currentTime,.06);}
 else{
  if(!audio){
   audio=new AudioContext();volume=audio.createGain();volume.gain.value=0;volume.connect(audio.destination);
  }
  await audio.resume();playBeat();timer=setInterval(playBeat,280);
 }
 sound.textContent=timer?'Sound on':'Sound off';sound.setAttribute('aria-pressed',String(!!timer));
};
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(.045,(now-(previous||now))/1000);previous=now;
 if(document.hidden)return;
 if(!arriving&&!tower.open&&enterStart===null){
  if(braking())speed=0;
  else if(backing()){speed=0;drive(-dt*8);}
  else{
   speed=accelerating()?Math.min(16,speed+dt*30):Math.max(0,speed-dt*7.6);
   if(speed&&!drive(speed*dt))speed=0;
  }
 }
 if(timer){
  const nearest=Math.min(...[27,53,105].map(stop=>Math.abs(distance-stop)));
  volume.gain.setTargetAtTime(tower.open?.035:.10+.54*Math.max(0,1-nearest/22),audio.currentTime,.16);
 }
 if(!city||tower.open)return;
 if(enterStart!==null){
  const t=Math.min(1,(now-enterStart)/740);
  approach=t*t*(3-2*t);
  if(t===1)openTower();
 }
 if(enterStart===null&&!tower.open){
  const desired=inspecting?1:0;
  approach=reduced?desired:approach+(desired-approach)*(1-Math.exp(-dt*6));
 }
 if(arriving)ascentTime+=dt;
 const driving=city.render(distance,dt,approach,arriving?ascentTime:null,lane,Math.abs(distance-pavilionDistance)<8?-1:1,cameraPicker.value,reduced,freeLook);
 if(arriving&&driving){
  arriving=false;document.body.classList.remove('city-arriving');
 }
}
addEventListener('resize',()=>city?.resize());
addEventListener('pagehide',event=>{
 if(event.persisted)return;
 city?.dispose();
 if(timer)clearInterval(timer);
 audio?.close();
});
requestAnimationFrame(frame);
