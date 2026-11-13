// Snow moves through camera space under gust acceleration, drag and gravity.
export function playSnowSquall(gsap, origin, arrive, setApproach, complete) {
 const canvas=document.createElement('canvas');
 canvas.className='snow-squall';
 canvas.setAttribute('aria-hidden','true');
 document.body.append(canvas);
 const ctx=canvas.getContext('2d');
 const world=document.querySelector('#world');
 const duration=3.85, handoff=1.40, step=1/120;
 function clear(){
  canvas.remove();
  world.classList.remove('storm-defocus');
  world.style.removeProperty('--storm-blur');
 }
 world.classList.add('storm-defocus');
 const storm={elapsed:0};
 let simulated=0;
 const flakes=Array.from({length:innerWidth<700?420:680},(_,i)=>({
  x:(Math.random()-.5)*48,y:(Math.random()-.5)*29,z:1+Math.random()*37,
  vx:0,vy:-.4-Math.random(),size:.013+Math.random()**2*.10,phase:i*2.39996
 }));
 const smooth=(a,b,value)=>{
  const t=Math.max(0,Math.min(1,(value-a)/(b-a)));
  return t*t*(3-2*t);
 };
 function advance(){
  const surge=smooth(0,1.05,simulated)*(1-smooth(1.76,duration,simulated));
  const wind=3+surge*24+Math.sin(simulated*8)*surge*4;
  for(const f of flakes){
   f.vx+=(wind+Math.sin(f.phase+simulated*5)*4-f.vx)*step*3;
   f.vy+=(-1.35+Math.cos(f.phase+simulated*4)*surge*2-f.vy)*step*2;
   f.x+=f.vx*step;
   f.y+=f.vy*step;
   f.z-=(4+surge*26)*step;
   if(f.z<.55){f.z+=36;f.x=(Math.random()-.60)*48;f.y=(Math.random()-.46)*29;}
   if(f.x>25)f.x-=50;
   if(f.y< -16)f.y+=32;
  }
  simulated+=step;
 }
 function paint(){
  const t=storm.elapsed;
  while(simulated+step<=t)advance();
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.5);
  const width=Math.round(w*dpr),height=Math.round(h*dpr);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const gust=smooth(0,.75,t)*(1-smooth(1.76,duration,t));
  const blur=innerWidth<700?19:28;
  const defocus=smooth(.17,1.08,t)*(1-smooth(1.90,3.64,t));
  world.style.setProperty('--storm-blur',Math.round(blur*defocus)+'px');
  const roll=gust*Math.sin(t*5)*.10;
  const focal=Math.max(w,h)*.69;
  const cx=w*(origin.x+(.5-origin.x)*smooth(0,.75,t));
  const cy=h*(origin.y+(.48-origin.y)*smooth(0,.75,t));
  ctx.save();
  ctx.translate(cx,cy);ctx.rotate(roll);
  ctx.lineCap='round';
  for(const f of flakes){
   const x=f.x*focal/f.z,y=-f.y*focal/f.z;
   if(Math.abs(x)>w||Math.abs(y)>h)continue;
   const previousDepth=f.z+.10+gust*.4;
   const px=(f.x-f.vx*.032)*focal/previousDepth;
   const py=-(f.y-f.vy*.032)*focal/previousDepth;
   ctx.strokeStyle='rgba(235,249,255,'+(gust*Math.min(.88,9/f.z))+')';
   ctx.lineWidth=Math.min(8,.45+f.size*focal/f.z);
   ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
  }
  ctx.restore();
  // The ground-level powder front rolls upward before filling the frame.
  const front=smooth(.24,1.18,t);
  const density=smooth(.32,1.19,t)*(1-smooth(1.64,3.73,t));
  for(let i=0;i<6;i++){
   const x=w*(i*.24-.16+Math.sin(t*1.9+i)*.15);
   const y=h*(1.18-front*(.56+i*.085)+Math.sin(i*2.4+t*2.3)*.06);
   ctx.save();ctx.translate(x,y);ctx.rotate(-.30);ctx.scale(w*.53,h*.57);
   const powder=ctx.createRadialGradient(0,0,0,0,0,1);
   powder.addColorStop(0,'rgba(228,241,252,'+(density*.64)+')');
   powder.addColorStop(1,'rgba(191,216,239,0)');
   ctx.fillStyle=powder;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  // Near-lens flakes still cut through the haze while the trail comes back into view.
  const foreground=gust*(1-smooth(1.0,1.37,t)+smooth(1.66,2.04,t));
  ctx.lineCap='round';
  for(let i=0;i<flakes.length;i+=3){
   const f=flakes[i];
   if(f.z>12)continue;
   const x=cx+f.x*focal/f.z,y=cy-f.y*focal/f.z;
   if(x<0||x>w||y<0||y>h)continue;
   ctx.strokeStyle='rgba(244,250,255,'+(foreground*.70)+')';
   ctx.lineWidth=Math.min(9,f.size*focal/f.z);
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-f.vx*1.25,y-8);ctx.stroke();
  }
  const whiteout=smooth(.90,1.28,t)*(1-smooth(1.63,2.46,t));
  ctx.fillStyle='rgba(231,243,252,'+whiteout+')';ctx.fillRect(0,0,w,h);
  // Ease the real winter camera onto the trail while the whiteout recedes.
  if(t>=handoff)setApproach(11*(1-smooth(handoff,3.54,t)));
 }
 const timeline=gsap.timeline({onComplete(){clear();complete();}});
 timeline.to(storm,{elapsed:duration,duration,ease:'none',onUpdate:paint});
 timeline.call(()=>{setApproach(11);arrive();},[],handoff);
 return {kill(){timeline.kill();clear();}};
}
