export function createRenderQuality(renderer,{compact}){
 let scale=1,frames=0,slow=0,elapsed=0;

 return function update(raw,interior,garden=false){
  // Ignore background-tab gaps and require sustained pressure before lowering resolution.
  if(raw>0&&raw<.25){
   frames++;
   elapsed+=raw;
   if(raw>.023)slow++;
  }
  if(elapsed>=1.5){
   if(slow>frames*.45)scale=Math.max(.6,scale-.1);
   else if(slow<frames*.08&&elapsed/frames<.018)scale=Math.min(1,scale+.025);
   frames=slow=elapsed=0;
  }
  const ceiling=interior?(compact?1.25:1.75):(compact?1:1.5);
  const pixelBudget=compact?850000:2600000;
  const ratio=Math.min(devicePixelRatio,ceiling,Math.sqrt(pixelBudget/(innerWidth*innerHeight)));
  // Keep letter readability independent of sustained load in other worlds.
  const gardenFloor=Math.min(1,ratio);
  const resolution=interior?ratio:garden?Math.max(gardenFloor,ratio*scale):ratio*scale;
  const desired=Math.round(resolution*100)/100;
  if(renderer.getPixelRatio()!==desired)renderer.setPixelRatio(desired);
 };
}
