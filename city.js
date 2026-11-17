import {createCityScene,towerDistance,driveLength} from './city-scene.js?v=3';

const canvas=document.querySelector('#cityView');
const tower=document.querySelector('#tower');
const lift=document.querySelector('#pressureLift');
const enter=document.querySelector('#enterTower');
const hint=document.querySelector('#driveHint');
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
let distance=city?0:towerDistance,approach=0,previous=0,enterStart=null,throttle=0,swipeY=null;
let arriving=fromReef&&!reduced&&!!city;
if(arriving){
 lift.hidden=false;document.body.classList.add('city-arriving');
 lift.addEventListener('animationend',event=>{
  if(event.target!==lift)return;
  arriving=false;lift.hidden=true;document.body.classList.remove('city-arriving');
 });
}
function drive(delta){
 if(arriving||tower.open||enterStart!==null)return;
 distance=Math.max(0,Math.min(driveLength,distance+delta));
 updateDrive();
}
function updateDrive(){
 const near=Math.abs(distance-towerDistance)<15;
 enter.disabled=!near;
 hint.textContent=near?'Leadership Tower · pull over to enter':distance>=driveLength?'End of the waterfront · scroll back to return':'Scroll or swipe to drive';
}
updateDrive();
addEventListener('wheel',event=>{
 if(event.ctrlKey||tower.open)return;
 event.preventDefault();
 const multiplier=event.deltaMode===1?14:event.deltaMode===2?innerHeight:1;
 drive(Math.sign(event.deltaY)*Math.min(21,Math.abs(event.deltaY)*multiplier*.04));
},{passive:false});
canvas.addEventListener('pointerdown',event=>{
 if(event.pointerType==='mouse')return;
 swipeY=event.clientY;canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
 if(swipeY===null)return;
 drive((swipeY-event.clientY)*.14);swipeY=event.clientY;
});
canvas.addEventListener('lostpointercapture',()=>{swipeY=null;});
canvas.addEventListener('pointercancel',()=>{swipeY=null;});
canvas.addEventListener('pointerup',()=>{swipeY=null;});
const directions={ArrowUp:1,ArrowDown:-1,w:1,s:-1};
addEventListener('keydown',event=>{
 if(tower.open||event.target.closest?.('button,a')||!directions[event.key])return;
 event.preventDefault();if(!event.repeat){throttle=directions[event.key];drive(throttle*1.2);}
});
addEventListener('keyup',event=>{if(directions[event.key]===throttle)throttle=0;});
addEventListener('blur',()=>{throttle=0;});
for(const [id,direction] of [['forward',1],['reverse',-1]]){
 const button=document.querySelector('#'+id);
 button.addEventListener('pointerdown',event=>{button.setPointerCapture(event.pointerId);throttle=direction;});
 button.addEventListener('lostpointercapture',()=>{throttle=0;});
 button.addEventListener('pointerup',()=>{throttle=0;});
 button.addEventListener('click',()=>drive(direction*2));
}
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
 enterStart=null;throttle=0;
 tower.showModal();
 if(currentFloor<0)floorButtons.firstElementChild.focus();
}
enter.onclick=()=>{
 if(enter.disabled||arriving||enterStart!==null)return;
 if(reduced||!city){openTower();return;}
 enterStart=performance.now();enter.disabled=true;
};
document.querySelector('#leaveTower').onclick=()=>tower.close();
tower.addEventListener('close',()=>{
 clearTimeout(elevatorTimer);clearInterval(doorTimer);
 if(currentFloor>=0)showFloor();
 stage.classList.remove('doors-closed');approach=0;updateDrive();enter.focus({preventScroll:true});
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
 if(throttle)drive(throttle*dt*16);
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
 city.render(distance,reduced?0:dt,approach);
}
addEventListener('resize',()=>city?.resize());
addEventListener('pagehide',event=>{
 if(event.persisted)return;
 city?.dispose();
 if(timer)clearInterval(timer);
 audio?.close();
});
requestAnimationFrame(frame);
