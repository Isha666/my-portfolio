export const facadeFinishGLSL=`
 float finishHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 vec3 facadeFinish(vec2 uv,float time,float phase,float kind){
  if(kind<.5||kind>3.5){
   float variation=step(3.5,kind);
   vec2 tiles=uv*mix(vec2(52.,128.),vec2(36.,90.),variation);
   tiles.x+=mod(floor(tiles.y),2.)*.5;
   vec2 cell=floor(tiles),tile=fract(tiles)-.5;
   float seed=finishHash(cell+phase*13.);
   float shape=mix(length(tile),abs(tile.x)+abs(tile.y),variation);
   float sequin=1.-smoothstep(.34,.48+variation*.2,shape);
   vec3 metal=seed>.85?vec3(.72,.49,.18):seed>.30?vec3(.40,.46,.53):vec3(.012,.015,.021);
   if(variation>.5)metal=seed>.55?vec3(.85,.51,.43):seed>.10?vec3(.78,.74,.80):vec3(.025,.015,.033);
   float ripple=.5+.5*sin(cell.y*(.11+variation*.08)+cell.x*.17-time*(.48+phase*.6));
   float glint=pow(max(0.,sin(time*(.55+seed*.8)+seed*48.+tile.x*3.)),22.);
   vec3 reflected=mix(vec3(.64,.75,.85),vec3(1.,.78,.40),seed);
   if(variation>.5)reflected=mix(vec3(.92,.87,1.),vec3(1.,.66,.54),seed);
   return vec3(.009,.011,.017)+sequin*(metal*(.24+variation*.18+ripple*.50)+reflected*glint*.92);
  }
  if(kind>1.5&&kind<2.5){
   float epoch=floor(time*(.06+phase*.04)+phase*7.);
   vec2 axis=normalize(vec2(sin(epoch*4.3+phase*31.),cos(epoch*3.7+phase*19.))+.001);
   float travel=dot(uv-.5,axis);
   float hue=phase+time*(.075+phase*.10)+travel*.70;
   vec3 rainbow=.5+.5*cos(6.283*(hue+vec3(0.,.67,.33)));
   float sweep=pow(.5+.5*sin(travel*14.-time*(1.3+phase)),4.);
   return rainbow*(.36+.46*sweep);
  }
  float blueAim=.18+sin(time*.17+phase*6.)*.10;
  float pinkAim=.82+sin(time*.13+phase*11.)*.11;
  float spread=mix(.026,.16,uv.y);
  float blue=exp(-pow((uv.x-blueAim-uv.y*.13)/spread,2.));
  float pink=exp(-pow((uv.x-pinkAim+uv.y*.12)/spread,2.));
  float rise=exp(-pow((uv.y-fract(time*(.08+phase*.03)+phase))/.25,2.));
  float light=(.52+rise*.60+.08*sin(time*.7+phase*8.))*(1.-uv.y*.16);
  vec3 first=kind>2.5?vec3(.48,.08,1.):vec3(.025,.27,1.);
  vec3 second=kind>2.5?vec3(1.,.76,.10):vec3(1.,.055,.42);
  return vec3(.008,.016,.045)+light*(first*blue+second*pink);
 }
`;
