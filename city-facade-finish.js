export const facadeFinishGLSL=`
 float finishHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 vec3 facadeFinish(vec2 uv,float time,float phase,float kind){
  if(kind<.5){
   vec2 tiles=uv*vec2(52.,128.);
   tiles.x+=mod(floor(tiles.y),2.)*.5;
   vec2 cell=floor(tiles),tile=fract(tiles)-.5;
   float seed=finishHash(cell+phase*13.);
   float sequin=1.-smoothstep(.34,.48,length(tile));
   vec3 metal=seed>.85?vec3(.72,.49,.18):seed>.30?vec3(.40,.46,.53):vec3(.012,.015,.021);
   float ripple=.5+.5*sin(cell.y*.11+cell.x*.17-time*(.48+phase*.6));
   float glint=pow(max(0.,sin(time*(.55+seed*.8)+seed*48.+tile.x*3.)),22.);
   vec3 reflected=mix(vec3(.64,.75,.85),vec3(1.,.78,.40),seed);
   return vec3(.009,.011,.017)+sequin*(metal*(.24+ripple*.50)+reflected*glint*.92);
  }
  float blueAim=.18+sin(time*.17+phase*6.)*.10;
  float pinkAim=.82+sin(time*.13+phase*11.)*.11;
  float spread=mix(.026,.16,uv.y);
  float blue=exp(-pow((uv.x-blueAim-uv.y*.13)/spread,2.));
  float pink=exp(-pow((uv.x-pinkAim+uv.y*.12)/spread,2.));
  float rise=exp(-pow((uv.y-fract(time*(.08+phase*.03)+phase))/.25,2.));
  float light=(.52+rise*.60+.08*sin(time*.7+phase*8.))*(1.-uv.y*.16);
  return vec3(.008,.016,.045)+light*(vec3(.025,.27,1.)*blue+vec3(1.,.055,.42)*pink);
 }
`;
