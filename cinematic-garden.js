const chest=document.querySelector('.treasure');
const project=document.querySelector('dialog');
chest.setAttribute('aria-expanded','false');
chest.onclick=()=>{
 if(chest.getAttribute('aria-expanded')==='true')return;
 chest.setAttribute('aria-expanded','true');
 setTimeout(()=>project.showModal(),reducedMotion.matches?0:480);
};
project.addEventListener('close',()=>chest.setAttribute('aria-expanded','false'));

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const shots=[...document.querySelectorAll('.shot')];
let framePending=false;
function updateShots(){
 framePending=false;
 for(const shot of shots){
  const {top,bottom,height}=shot.getBoundingClientRect();
  if(bottom<0||top>innerHeight)continue;
  const distance=Math.max(0,Math.min(1,-top/Math.max(1,height-innerHeight)));
  shot.style.setProperty('--zoom',reducedMotion.matches?1:1.02+distance*.10);
 }
}
function queueUpdate(){
 if(framePending)return;
 framePending=true;
 requestAnimationFrame(updateShots);
}
addEventListener('scroll',queueUpdate,{passive:true});
addEventListener('resize',queueUpdate);
reducedMotion.addEventListener('change',queueUpdate);
queueUpdate();
