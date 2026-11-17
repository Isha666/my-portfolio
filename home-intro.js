const intro=document.querySelector('#homeIntro');
const savedSection=history.state?.portfolioView?.section;
const seenKey='portfolio-pupil-intro';
let seen=false;
try{seen=sessionStorage.getItem(seenKey)==='1';}catch{}

if(!seen&&(!savedSection||savedSection==='home')&&typeof intro.showModal==='function'){
 const video=intro.querySelector('video');
 const enter=intro.querySelector('.intro-pupil');
 const skip=intro.querySelector('.intro-skip');
 const sound=intro.querySelector('.intro-sound');
 const bed=new Audio('assets/intro/pupil-ambience.mp3?v=3');
 bed.loop=true;
 bed.volume=.62;
 const revealTime=2.92;
 function requestSound(){
  intro.dataset.introSound='on';
  dispatchEvent(new Event('portfolio-intro-audio'));
 }
 async function playBed(){
  if(started||revealing)return;
  try{await bed.play();sound.hidden=true;}
  catch{sound.hidden=false;}
 }
 function fadeMedia(media,duration,done){
  const initial=media.volume,start=performance.now();
  function frame(now){
   const progress=Math.max(0,Math.min(1,(now-start)/duration));
   media.volume=initial*(1-progress);
   if(progress===1)done?.();else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 }
 sound.onclick=()=>{requestSound();playBed();};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let started=false,revealing=false,frameHandle;
 let waitingForHome=false;

 function dockStar(){
  const star=intro.querySelector('.intro-travel-star');
  const logo=document.querySelector('header .brand-star');
  const destination=logo.getBoundingClientRect();
  const source=Math.max(innerHeight,innerWidth*9/16)*.40;
  const x=destination.left+destination.width/2-innerWidth/2;
  const y=destination.top+destination.height/2-innerHeight/2;
  const scale=destination.width/source;
  star.style.width=source+'px';
  star.style.height=source+'px';
  star.hidden=false;
  logo.classList.add('brand-star-docking');
  star.animate([
   {transform:'translate(-50%,-50%) scale(1)',opacity:1},
   {transform:'translate(-50%,-50%) translate('+x*.28+'px,'+y*.12+'px) scale(.38)',offset:.43},
   {transform:'translate(-50%,-50%) translate('+x+'px,'+y+'px) scale('+scale+')',opacity:1}
  ],{duration:750,easing:'cubic-bezier(.55,.04,.16,1)',fill:'forwards'}).finished.then(()=>{
   logo.classList.remove('brand-star-docking');
   star.hidden=true;
  });
 }

 function reveal(){
  if(revealing)return;
  if(!document.body.hasAttribute('data-portfolio-ready')){
   if(!waitingForHome){
    waitingForHome=true;
    addEventListener('portfolio-ready',reveal,{once:true});
   }
   return;
  }
  revealing=true;
  try{sessionStorage.setItem(seenKey,'1');}catch{}
  if(frameHandle!==undefined)video.cancelVideoFrameCallback(frameHandle);
  bed.pause();
  if(!video.paused)fadeMedia(video,110);
  const starVisible=video.currentTime>=revealTime;
  intro.classList.add('intro-revealing',starVisible?'intro-star-reveal':'intro-quiet-reveal');
  if(starVisible&&!reduced.matches)dockStar();
  dispatchEvent(new Event('portfolio-intro-reveal'));
  setTimeout(()=>{
   intro.close();
   video.removeAttribute('src');
   video.load();
   bed.removeAttribute('src');
   bed.load();
   document.querySelector('[data-section="home"]')?.focus({preventScroll:true});
  },reduced.matches?0:starVisible?860:240);
 }

 function watchFrame(_,frame){
  frameHandle=undefined;
  if(frame.mediaTime>=revealTime)reveal();
  else if(!revealing)frameHandle=video.requestVideoFrameCallback(watchFrame);
 }

 enter.onclick=async()=>{
  if(started||revealing)return;
  started=true;
  requestSound();
  fadeMedia(bed,260,()=>bed.pause());
  intro.classList.add('intro-playing');
  if(reduced.matches){reveal();return;}
  try{
   await video.play();
   if(!revealing&&typeof video.requestVideoFrameCallback==='function'){
    frameHandle=video.requestVideoFrameCallback(watchFrame);
   }
  }catch{reveal();}
 };
 video.addEventListener('timeupdate',()=>{if(video.currentTime>=revealTime)reveal();});
 video.addEventListener('ended',reveal);
 video.addEventListener('error',reveal);
 function skipIntro(){video.pause();reveal();}
 skip.onclick=skipIntro;
 intro.addEventListener('cancel',event=>{event.preventDefault();skipIntro();});
 video.poster='assets/intro/neon-pupil.jpg';
 video.src='assets/intro/neon-pupil.mp4?v=2';
 intro.showModal();
 playBed();
}
