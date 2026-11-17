export function createHomeAudio(button){
 const tracks=['winter.mp3?v=carol-1','garden-birds.mp3?v=3','underwater.mp3','garden-portal.mp3?v=2','garden-birds.mp3?v=3','garden-hooves.mp3?v=3','garden-water.mp3','garden-chest.mp3','snow-squall.mp3','whirlpool.mp3?v=2','reef-ambience.mp3?v=2','reef-tree-near.mp3?v=3','reef-oyster.mp3','reef-jellyfish.mp3','reef-shark.mp3?v=3','reef-tree-wake.mp3?v=2'];
 const buffers=new Map();
 let context,master,current,world=0,enabled=false,active=true,request=0,audioScreen='';
 function storedSound(key){
  try{return localStorage.getItem('portfolio-sound:'+key);}catch{return null;}
 }
 function rememberSound(){
  try{
   const value=enabled?'on':'off';
   localStorage.setItem('portfolio-sound:last',value);
   if(audioScreen)localStorage.setItem('portfolio-sound:'+audioScreen,value);
  }catch{}
 }

 const portalTrack=3;
 const projectsTrack=4,reefTrack=10;
 const reefCues={tree:11,oyster:12,jellyfish:13,shark:14,wake:15};
 const treeLayer={track:reefCues.tree,level:.82};

 function loadTrack(index){
   if(index===projectsTrack)index=1;
   if(!buffers.has(index)){
    const url=new URL('./assets/audio/'+tracks[index],import.meta.url);
    const buffer=fetch(url).then(response=>{
     if(!response.ok)throw new Error('Could not load Home ambience');
     return response.arrayBuffer();
    }).then(data=>context.decodeAudioData(data)).catch(error=>{
     if(buffers.get(index)===buffer)buffers.delete(index);
     throw error;
    });
    buffers.set(index,buffer);
   }
  return buffers.get(index);
 }

 const gardenLayers=[
  {track:5,level:.82},
  {track:6,level:.48}
 ];
 let gardenPlaying=false,reefPlaying=false,reefSession=0;
 const transitions={snow:8,whirlpool:9};
 let transitionSource,transitionRequest=0;

 function stopTransition(){
  transitionRequest++;
  if(transitionSource){
   transitionSource.stop();
   transitionSource=null;
  }
 }

 async function playTransition(kind){
  stopTransition();
  if(!enabled||document.hidden)return;
  const version=transitionRequest,start=context.currentTime;
  try{
   const buffer=await loadTrack(transitions[kind]);
   const offset=context.currentTime-start;
   if(version!==transitionRequest||offset>=buffer.duration)return;
   const source=context.createBufferSource(),gain=context.createGain();
   source.buffer=buffer;
   gain.gain.value=.63;
   source.connect(gain).connect(context.destination);
   source.onended=()=>{
    if(transitionSource===source)transitionSource=null;
    source.disconnect();gain.disconnect();
   };
   transitionSource=source;
   source.start(0,offset);
  }catch(error){console.warn('Could not play portal sound',error);}
 }

 function stopLayers(layers){
  for(const layer of layers){
   layer.amount=0;
   if(!layer.source)continue;
   const time=context.currentTime;
   layer.gain.gain.setTargetAtTime(0,time,.08);
   layer.source.stop(time+.35);
   layer.source=null;
  }
 }

 function setLayer(layer,amount,playing){
  layer.amount=amount;
  if(layer.source){
   if(amount===layer.previous||(amount!==0&&Math.abs(amount-layer.previous)<.025))return;
   layer.previous=amount;
   layer.gain.gain.setTargetAtTime(amount*layer.level,context.currentTime,.12);
   return;
  }
  if(amount<=0||layer.loading)return;
  layer.loading=true;
  loadTrack(layer.track).then(buffer=>{
   if(!playing()||layer.amount<=0)return;
   const source=context.createBufferSource(),gain=context.createGain();
   source.buffer=buffer;
   source.loop=true;
   gain.gain.value=0;
   source.connect(gain).connect(master);
   source.onended=()=>{source.disconnect();gain.disconnect();};
   source.start();
   layer.source=source;
   layer.gain=gain;
   layer.previous=layer.amount;
   gain.gain.setTargetAtTime(layer.amount*layer.level,context.currentTime,.12);
  }).catch(error=>console.warn('Could not load ambient layer',error))
   .finally(()=>{layer.loading=false;});
 }

 async function sync(){
  const version=++request;
  if(!context)return;
  if(!enabled||document.hidden)stopTransition();
  const introOpen=document.querySelector('#homeIntro[open]:not(.intro-revealing)');
  const shouldPlay=enabled&&active&&!document.hidden&&!introOpen;
  gardenPlaying=shouldPlay&&world===projectsTrack;
  const nextReef=shouldPlay&&world===reefTrack;
  if(nextReef!==reefPlaying)reefSession++;
  reefPlaying=nextReef;
  if(!gardenPlaying)stopLayers(gardenLayers);
  if(!reefPlaying&&treeLayer.source)stopLayers([treeLayer]);
  const now=context.currentTime;
  master.gain.setTargetAtTime(shouldPlay?.44:0,now,.08);
  if(!shouldPlay){
   if(current){
    current.source.stop(now+.35);
    current=null;
   }
   if(!enabled||!active)buffers.clear();
   return;
  }
  const retained=new Set([world===projectsTrack?1:world]);
  if(gardenPlaying)for(const track of [5,6,7])retained.add(track);
  if(reefPlaying)for(const track of Object.values(reefCues))retained.add(track);
  for(const track of buffers.keys())if(!retained.has(track))buffers.delete(track);
  if(current?.world===world)return;

  const nextWorld=world;
  if(nextWorld===reefTrack)for(const track of Object.values(reefCues))loadTrack(track).catch(()=>{});
  try{
   const buffer=await loadTrack(nextWorld);
   if(version!==request)return;
   const time=context.currentTime;
   if(current){
    const gardenArrival=current.world===portalTrack&&nextWorld===projectsTrack;
    current.gain.gain.setTargetAtTime(0,time,gardenArrival?.28:.14);
    current.source.stop(time+(gardenArrival?1.4:.75));
   }
   const source=context.createBufferSource(),gain=context.createGain();
   source.buffer=buffer;
   source.loop=true;
   gain.gain.value=0;
   source.connect(gain).connect(master);
   source.onended=()=>{
    source.disconnect();
    gain.disconnect();
    if(current?.source===source)current=null;
   };
   source.start();
   gain.gain.setTargetAtTime(nextWorld===portalTrack?1.35:1,time,nextWorld===portalTrack?.025:nextWorld===reefTrack?.65:.14);
   current={world:nextWorld,source,gain};
  }catch(error){
   if(version===request){
    button.textContent='Retry sound';
    console.warn(error);
    enabled=false;
    button.setAttribute('aria-pressed','false');
    sync();
   }
  }
 }

 async function setEnabled(value,remember=false){
  enabled=value;
  if(remember)rememberSound();
  button.setAttribute('aria-pressed',String(enabled));
  button.textContent=enabled?'Sound on':'Sound off';
  if(enabled){
   try{
    if(!context){
     context=new (window.AudioContext||window.webkitAudioContext)();
     master=context.createGain();
     master.gain.value=0;
     master.connect(context.destination);
    }
    await context.resume();
   }catch(error){
    enabled=false;
    button.setAttribute('aria-pressed','false');
    button.textContent='Sound unavailable';
    console.warn(error);
   }
  }
  sync();
 }
 button.onclick=()=>setEnabled(!enabled,true);
 addEventListener('portfolio-intro-audio',()=>{if(!enabled)setEnabled(true,true);});
 addEventListener('portfolio-intro-reveal',()=>{
  if(document.querySelector('#homeIntro')?.dataset.introSound==='on'&&!enabled)setEnabled(true,true);
  else sync();
 });
 function resumeAfterGesture(){
  if(enabled&&context?.state==='suspended')context.resume().then(sync).catch(()=>{});
 }
 addEventListener('pointerdown',resumeAfterGesture,{passive:true});
 addEventListener('keydown',resumeAfterGesture);
 document.addEventListener('visibilitychange',sync);
 return {
  playTransition,stopTransition,
  async playReefCue(cue,side=0){
   if(!reefPlaying)return;
   if(cue==='tree'){setLayer(treeLayer,side,()=>reefPlaying);return;}
   const session=reefSession;
   try{
    const buffer=await loadTrack(reefCues[cue]);
    if(session!==reefSession)return;
    const source=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner();
    source.buffer=buffer;
    gain.gain.value=cue==='oyster'?1.4:cue==='shark'?1.2:cue==='wake'?1:.62;
    pan.pan.value=Math.max(-1,Math.min(1,side))*.45;
    source.connect(gain).connect(pan).connect(master);
    source.onended=()=>{source.disconnect();gain.disconnect();pan.disconnect();};
    source.start();
   }catch(error){console.warn('Could not play reef cue',error);}
  },
  async playGardenChime(side){
   if(!gardenPlaying)return;
   try{
    const buffer=await loadTrack(7);
    if(!gardenPlaying)return;
    const source=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner();
    source.buffer=buffer;
    gain.gain.value=.65;
    pan.pan.value=side*.35;
    source.connect(gain).connect(pan).connect(master);
    source.onended=()=>{source.disconnect();gain.disconnect();pan.disconnect();};
    source.start();
   }catch(error){console.warn('Could not play chest chimes',error);}
  },
  updateGardenRide(speed,water){
   if(!gardenPlaying)return;
   setLayer(gardenLayers[0],Math.min(1,speed/2.6),()=>gardenPlaying);
   if(gardenLayers[0].source)gardenLayers[0].source.playbackRate.setTargetAtTime(.85+Math.min(1,speed/12)*.4,context.currentTime,.16);
   setLayer(gardenLayers[1],water,()=>gardenPlaying);
  },
  update(section,homeWorld,crossing,reefReady){
   world=section==='skills'&&reefReady?reefTrack:section==='projects'?(crossing?portalTrack:projectsTrack):homeWorld;
   active=section==='home'||section==='projects'||section==='skills'&&reefReady;
   button.hidden=!(active||section==='skills');
   const key=section==='home'?'home-'+homeWorld:section;
   if(key!==audioScreen){
    audioScreen=key;
    const preference=storedSound(key)??storedSound('last');
    const desired=preference===null?enabled:preference==='on';
    if(desired!==enabled||desired&&!context){setEnabled(desired);return;}
   }
   sync();
  }
 };
}
