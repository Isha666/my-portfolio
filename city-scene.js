import * as T from './vendor/three.module.js';
import {addCityBackdrop} from './city-backdrop.js?v=sculpted-skyline-1';
import {createCityAttractions} from './city-attractions.js?v=separated-drone-stages-2';
import {facadeFinishGLSL} from './city-facade-finish.js?v=separated-drone-stages-2';
import {disposeScene} from './scene-resources.js';
import {createTraffic,crossings,laneOffsets} from './city-traffic.js?v=extended-drive-1';
import {createPressureLift,hatchApproachDuration} from './city-lift.js?v=hatch-entry-1';

export const towerDistance=85;
export const driveLength=245;
export const pavilionDistance=49;
const route=[
 {start:22,length:24,turn:Math.PI/3.1},
 {start:65,length:30,turn:-Math.PI/1.92},
 {start:124,length:28,turn:Math.PI/3.4},
 {start:174,length:25,turn:-Math.PI/3.7},
 {start:220,length:22,turn:Math.PI/4.5}
];
function heading(distance){
 return route.reduce((angle,{start,length,turn})=>angle+turn*T.MathUtils.smoothstep(distance,start,start+length),0);
}
const streetSamples=[new T.Vector2()];
for(let d=1;d<=320;d++){
 const angle=heading(d-.5);
 streetSamples.push(streetSamples[d-1].clone().add(new T.Vector2(Math.sin(angle),-Math.cos(angle))));
}
function streetPoint(target,distance,lane=0,y=0){
 const angle=heading(distance),i=Math.floor(distance),fraction=distance-i;
 if(distance<0)return target.set(lane,y,-distance);
 const a=streetSamples[Math.min(i,streetSamples.length-2)],b=streetSamples[Math.min(i+1,streetSamples.length-1)];
 return target.set(T.MathUtils.lerp(a.x,b.x,fraction)+Math.cos(angle)*lane,y,T.MathUtils.lerp(a.y,b.y,fraction)+Math.sin(angle)*lane);
}

function makeCoupe(){
 const car=new T.Group();
 const paint=new T.MeshPhysicalMaterial({color:'#f7a8ce',roughness:.25,metalness:.31,clearcoat:1,clearcoatRoughness:.14});
 paint.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 flakePoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nflakePoint=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 flakePoint;').replace('#include <color_fragment>',`#include <color_fragment>
   vec3 grain=floor(flakePoint*38.);
   float flake=fract(sin(dot(grain,vec3(37.41,69.17,11.23)))*41617.11);
   float detail=1.-smoothstep(.30,1.15,length(fwidth(flakePoint)*38.));
   diffuseColor.rgb*=1.+smoothstep(.88,.99,flake)*detail*1.42;
  `);
 };
 const glass=new T.MeshPhysicalMaterial({color:'#272339',roughness:.23,metalness:.36,clearcoat:.9});
 const trim=new T.MeshStandardMaterial({color:'#311126',roughness:.39,metalness:.43});
 const rubber=new T.MeshStandardMaterial({color:'#100c17',roughness:.84});
 const rim=new T.MeshStandardMaterial({color:'#f0b3d9',metalness:.68,roughness:.28});
 const lamps=new T.MeshBasicMaterial({color:'#ff426e',toneMapped:false});
 const white=new T.MeshBasicMaterial({color:'#fff0f8',toneMapped:false});
 const box=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(1,1,1,24);
 const add=(geo,mat,x,y,z,w,h,d)=>{
  const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);
  car.add(mesh);return mesh;
 };
 // The longitudinal sections shape the wide haunches and taper the bumpers.
 const bodySections=[
  [-2.14,.67,.43,.12],[-1.97,.88,.47,.19],[-1.42,1.01,.49,.25],
  [-.72,1,.51,.22],[.02,.97,.51,.22],[.64,1.04,.53,.27],
  [1.18,1.13,.51,.29],[1.72,1.09,.49,.24],[2.04,.98,.46,.19],[2.15,.84,.43,.145]
 ];
 function loft(sections,material){
  const vertices=[],indices=[],segments=32;
  const contour=new T.CatmullRomCurve3(sections.map(([z,width,height])=>new T.Vector3(z,width,height)));
  const rings=(sections.length-1)*4+1;
  Array.from({length:rings},(_,ring)=>{
   const fraction=ring/(rings-1),segment=fraction*(sections.length-1),i=Math.min(sections.length-2,Math.floor(segment));
   const p=contour.getPoint(fraction);
   return [p.x,p.y,p.z,T.MathUtils.lerp(sections[i][3],sections[i+1][3],segment-i)];
  }).forEach(([z,width,height,rise],ring)=>{
   for(let i=0;i<segments;i++){
    const theta=i/segments*Math.PI*2;
    const x=Math.cos(theta),y=Math.sin(theta);
    vertices.push(Math.sign(x)*Math.pow(Math.abs(x),.56)*width,height+rise*y,z);
    if(ring>0){
     const a=(ring-1)*segments+i,b=(ring-1)*segments+(i+1)%segments;
     const c=a+segments,d=b+segments;
     indices.push(a,b,c,b,d,c);
    }
   }
  });
  for(let i=1;i<segments-1;i++){
   const last=(rings-1)*segments;
   indices.push(0,i+1,i,last,last+i,last+i+1);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  material.side=T.DoubleSide;
  add(geo,material,0,0,0,1,1,1);
 }
 loft(bodySections,paint);
 loft([[-1.45,.59,.75,.035],[-.91,.76,.88,.165],[-.40,.78,.98,.205],[.28,.75,.94,.20],[.93,.67,.77,.12],[1.40,.55,.70,.025]],glass);
 const roof=new T.BufferGeometry(),roofVerts=[],roofIndices=[];
 for(let row=0;row<=10;row++){
  const along=row/10;
  for(let i=0;i<=16;i++){
   const breadth=i/8-1;
   roofVerts.push(breadth*(.66-along*.06),1.13+.085*Math.sin(along*Math.PI)-.155*breadth*breadth-along*.11,-.73+along*1.32);
   if(row&&i){const k=row*17+i;roofIndices.push(k-18,k-1,k-17,k-1,k,k-17);}
  }
 }
 roof.setAttribute('position',new T.Float32BufferAttribute(roofVerts,3));
 roof.setIndex(roofIndices);roof.computeVertexNormals();
 add(roof,paint,0,0,0,1,1,1);
 add(box,trim,0,.34,2.055,1.64,.13,.31);
 add(box,paint,0,.92,1.62,1.88,.085,.33);
 for(const side of [-1,1]){
  add(box,paint,side*.64,.81,1.65,.12,.21,.14);
  const mirror=add(box,paint,side*.92,.93,-.51,.25,.11,.19);
  mirror.rotation.y=-side*.18;
  for(const z of [-1.42,1.30]){
   const tire=add(cylinder,rubber,side*.96,.32,z,.332,.29,.332);
   tire.rotation.z=Math.PI/2;
   const face=add(cylinder,rim,side*1.113,.32,z,.214,.018,.214);
   face.rotation.z=Math.PI/2;
   add(cylinder,rubber,side*1.127,.32,z,.079,.025,.079).rotation.z=Math.PI/2;
  }
  add(box,white,side*.62,.54,-2.04,.32,.069,.13);
  add(box,trim,side*.54,.26,2.14,.23,.08,.14);
 }
 const curve=new T.CatmullRomCurve3([
  new T.Vector3(-1,.55,1.98),new T.Vector3(-.78,.61,2.11),new T.Vector3(0,.61,2.154),
  new T.Vector3(.78,.61,2.11),new T.Vector3(1,.55,1.98)
 ]);
 add(new T.TubeGeometry(curve,24,.022,6,false),lamps,0,0,0,1,1,1);
 return car;
}

export function createCityScene(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power'});
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.23;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(61,1,.1,2400);
 scene.background=new T.Color('#141a38');
 scene.fog=new T.FogExp2('#22213e',.009);
 scene.add(new T.HemisphereLight('#a8b8ff','#745a81',2.15));
 scene.add(new T.AmbientLight('#a790bf',.40));
 const sky=new T.Mesh(new T.SphereGeometry(1,32,16),new T.ShaderMaterial({
  side:T.BackSide,depthTest:false,depthWrite:false,
  vertexShader:`varying vec3 ray;void main(){ray=position;vec4 p=projectionMatrix*viewMatrix*vec4(position,0.);gl_Position=p.xyww;}`,
  fragmentShader:`varying vec3 ray;
   float hash(vec2 p){return fract(sin(dot(p,vec2(112.2,312.5)))*43758.54);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
   void main(){
    vec3 d=normalize(ray);
    vec3 color=mix(vec3(.18,.13,.26),vec3(.028,.043,.13),smoothstep(0.,.68,d.y));
    vec2 p=d.xz/sqrt(.045+d.y*d.y)*4.;
    float clouds=smoothstep(.43,.78,noise(p)*.63+noise(p*2.)*.25+noise(p*4.)*.12);
    color+=vec3(.10,.11,.16)*clouds*smoothstep(-.05,.28,d.y);
    gl_FragColor=vec4(color,1.);
   }
  `
 }));
 sky.renderOrder=-1000;sky.frustumCulled=false;scene.add(sky);
 const moon=new T.DirectionalLight('#a4beff',2.3);
 moon.position.set(-15,36,14);scene.add(moon);
 let seed=119;
 const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const range=(a,b)=>a+(b-a)*random();
 const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,12,8),wheel=new T.CylinderGeometry(1,1,1,20);
 const standard=(color,roughness=.62,metalness=.12)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const lit=color=>new T.MeshBasicMaterial({color,toneMapped:false});
 function part(parent,geometry,material,x,y,z,w,h,d){
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
 }
 const slab=standard('#4b4656'),road=standard('#29273a',.30,.30),walk=standard('#565169',.5),roof=standard('#303047');
 const neon=['#ed60cf','#67e3ff','#c091ff','#ffd08a'].map(lit);
 const lightShows=[];
 const trimPalette=[
  [new T.Color('#d7bd8a'),new T.Color('#aebbc9')],
  [new T.Color('#3e8eff'),new T.Color('#f15eac')],
  [new T.Color('#58cfee'),new T.Color('#ef77cb')],
  [new T.Color('#995eff'),new T.Color('#ffe16a')],
  [new T.Color('#c38e86'),new T.Color('#d9d3e7')]
 ];
 function finishForDistance(distance){
  if(distance<0)return 4;
  if(distance<25)return 2;
  if(distance<65)return 1;
  if(distance<100)return 3;
  if(distance<140)return 2;
  if(distance<185)return 4;
  if(distance<220)return 0;
  return 3;
 }
 function facadeLights(distance,offset,finish=finishForDistance(distance)){
  const material=lit('#ef76d7');
  lightShows.push({distance,material,offset,finish});
  return material;
 }
 const litWindows=neon.map(()=>[]),frames=[];
 const drum=new T.CylinderGeometry(.84,1,1,24),roofCone=new T.ConeGeometry(1,1,4);
 const masonry=standard('#89685c'),bronze=standard('#8f5f4d',.45,.44),steel=standard('#46566e');
 const billboardMaterials=['MIDNIGHT','WATERFRONT','LEADERSHIP','AFTER DARK'].map((title,i)=>{
  const c=document.createElement('canvas');c.width=256;c.height=96;
  const ctx=c.getContext('2d');const gradient=ctx.createLinearGradient(0,0,256,96);
  gradient.addColorStop(0,['#8c285c','#125267','#294c86','#542880'][i]);gradient.addColorStop(1,'#141427');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,256,96);ctx.strokeStyle='#ffd6ef';ctx.lineWidth=2;ctx.strokeRect(5,5,246,86);
  ctx.fillStyle='#fff4fa';ctx.font='bold 25px sans-serif';ctx.textAlign='center';ctx.fillText(title,128,56);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  return new T.MeshBasicMaterial({map,side:T.DoubleSide,toneMapped:false});
 });
 const signGeometry=new T.PlaneGeometry(1,1),signs=[];
 function billboard(index,x,y,z,w,h){
  const sign=part(scene,signGeometry,billboardMaterials[index],x,y,z,w,h,1);
  signs.push({sign,index,distance:-z});
  return sign;
 }
 const ledClock={value:0},ledDistance={value:0};
 const signAtlas=document.createElement('canvas');
 signAtlas.width=128;signAtlas.height=1024;
 const signInk=signAtlas.getContext('2d');
 for(const [i,word] of ['AFTER DARK','SKYPARK','MIDNIGHT','WATERFRONT'].entries()){
  signInk.save();signInk.translate(64,i*256+128);signInk.rotate(-Math.PI/2);
  signInk.textAlign='center';signInk.textBaseline='middle';signInk.font='bold 34px sans-serif';
  signInk.fillStyle='#fff';signInk.fillText(word,0,0,222);signInk.restore();
 }
 const atlas=new T.CanvasTexture(signAtlas);
 atlas.generateMipmaps=false;atlas.minFilter=T.LinearFilter;
 let signSerial=0;
 function tallSign(parent,index,x,y,z,width,height,rotation){
  const phase=(Math.sin(++signSerial*71.3+index*19.1)*43758.54)%1;
  const material=new T.ShaderMaterial({
   side:T.DoubleSide,toneMapped:false,
   uniforms:{atlas:{value:atlas},clock:ledClock,route:ledDistance,phase:{value:Math.abs(phase)},finish:{value:parent.userData.facadeFinish??finishForDistance(-z)}},
   vertexShader:`varying vec2 panel;void main(){panel=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`
    uniform sampler2D atlas;uniform float clock,route,phase,finish;varying vec2 panel;
    ${facadeFinishGLSL}
    void main(){
     float frame=mod(floor(clock*.18+route*.04+phase*4.),4.);
     float ink=texture2D(atlas,vec2(panel.x,(frame+clamp(panel.y,.006,.994))*.25)).a;
     float border=1.-smoothstep(.008,.025,min(min(panel.x,1.-panel.x),min(panel.y,1.-panel.y)));
     vec3 color=facadeFinish(panel,clock,phase,finish);
     color+=vec3(.72,.76,.82)*max(ink*.78,border*.32);
     gl_FragColor=vec4(color,1.);
    }
   `
  });
  const sign=part(parent,signGeometry,material,x,y,z,width,height,1);sign.rotation.y=rotation;
  return sign;
 }
 function towerGradient(index,finish=Math.round(Math.abs(index))%5){
  return new T.ShaderMaterial({
   toneMapped:false,
   uniforms:{clock:ledClock,phase:{value:index*.32},finish:{value:finish}},
   vertexShader:`
    varying vec2 surface;varying vec3 faceNormal;
    void main(){vec4 p=modelMatrix*vec4(position,1.);surface=uv;faceNormal=normal;gl_Position=projectionMatrix*viewMatrix*p;}
   `,
   fragmentShader:`
    uniform float clock,phase,finish;varying vec2 surface;varying vec3 faceNormal;
    ${facadeFinishGLSL}
    void main(){
     vec3 color=facadeFinish(surface,clock,phase,finish);
     gl_FragColor=vec4(color*(.72+.28*abs(faceNormal.x)),1.);
    }
   `
  });
 }
 const darkGlass=standard('#273b57',.21,.65);
 const white=lit('#dddbff'),amber=lit('#ffd08a'),red=lit('#ff405e');
 const reflectionGeo=new T.PlaneGeometry(1,1);
 const wash=neon.map(m=>new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tint:{value:m.color}},vertexShader:`
  varying vec2 coords;void main(){coords=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
 `,fragmentShader:`
  uniform vec3 tint;varying vec2 coords;void main(){
   float width=mix(.09,.38,coords.y+.5);
   float edge=exp(-abs(coords.x)/width)*(1.-smoothstep(.13,.5,abs(coords.y)));
   float ripple=.67+.33*sin(coords.y*340.+sin(coords.x*49.)*3.);
   gl_FragColor=vec4(tint,edge*ripple*.36);
  }
 `}));
 for(let d=-80;d<=272;d+=4){
  const x=0,z=-d;

  part(scene,box,amber,x,.004,z,.13,.008,1.55);
  for(const side of [-1,1]){


   part(scene,box,white,x+side*6.6,.007,z,.055,.006,3.75);
   part(scene,box,white,x+side*3.6,.008,z,.044,.006,1.8);
   if(d%8===0){
    part(scene,box,roof,x+side*7.83,.34,z,.14,.61,.14);
    part(scene,box,amber,x+side*7.83,.59,z,.16,.15,.16);
    part(scene,box,neon[1],x+side*10.25,.18,z,.40,.038,1.62);
   }
   if(d%12===0){
    const lampX=x+side*7.8;
    part(scene,box,roof,lampX,2.1,z,.11,4.2,.11);
    part(scene,box,amber,lampX-side*.25,4.16,z,.57,.07,.26);
    const glow=part(scene,reflectionGeo,wash[3],x+side*5,.02,z,2.8,7,1);glow.rotation.x=-Math.PI/2;
   }
  }
 }
 function building(x,z,w,h,depth,palette,hero=false,style=0){
  const sculpted=Math.abs(x)<22&&(
   x<0&&[2,41,145].includes(-z)||
   x>0&&[-46,93,210].includes(-z)
  );
  if(Math.abs(x)<22&&(
   x<0&&[67,132,236].includes(-z)||x>0&&[119,184].includes(-z)
  )){
   const tower=new T.Group();
   streetPoint(tower.position,-z,x);tower.rotation.y=-heading(-z);scene.add(tower);
   const height=30+(Math.abs(z)%3)*6;
   const profile=[
    new T.Vector2(w*.33,0),new T.Vector2(w*.48,height*.22),
    new T.Vector2(w*.5,height*.49),new T.Vector2(w*.40,height*.76),
    new T.Vector2(w*.18,height*.95),new T.Vector2(0,height)
   ];
   const shell=new T.Mesh(new T.LatheGeometry(profile,24),darkGlass);tower.add(shell);
   const ribs=new T.CatmullRomCurve3(profile.map(point=>new T.Vector3(point.x,point.y,0)));
   const ribGeometry=new T.TubeGeometry(ribs,32,.045,5,false);
   for(let rib=0;rib<12;rib++){
    const strut=new T.Mesh(ribGeometry,steel);strut.rotation.y=rib/12*Math.PI*2;tower.add(strut);
   }
   for(let floor=1;floor<15;floor++){
    const t=floor/15,radius=ribs.getPoint(t).x;
    const band=new T.Mesh(new T.TorusGeometry(radius,.045,5,32),neon[palette]);
    band.position.y=ribs.getPoint(t).y;band.rotation.x=Math.PI/2;tower.add(band);
   }
   part(tower,box,slab,0,.5,0,w*1.1,1,depth*1.1);
   if(style===0&&!hero){
    const samples=Math.floor(h/1.65)*Math.max(2,Math.floor(w/1.23));
    for(let i=0;i<samples;i++)random();
   }
   return;
  }
  if(sculpted){
   const side=Math.sign(x),height=Math.max(h,Math.abs(x)<22?29:39);
   const tower=new T.Group();
   streetPoint(tower.position,-z,x,0);tower.rotation.y=-heading(-z);scene.add(tower);
   tower.userData.facadeFinish=-z===41?4:finishForDistance(-z);
   const animated=[-46,41,145].includes(-z);
   const facade=animated?towerGradient((Math.abs(x)*.13-z*.047)%7,tower.userData.facadeFinish):darkGlass;
   if(side<0){
    for(let level=0;level<5;level++){
     const taper=1-level*.09;
     const volume=part(tower,box,level%2?darkGlass:slab,side*level*.28,height*(level+.5)/5,0,w*taper,height/5,depth*taper);
     volume.rotation.y=level*.055;
     part(tower,box,neon[(palette+level)%4],side*level*.28,height*(level+1)/5,.04,w*taper+.15,.10,depth*taper+.15);
    }
    part(tower,box,facade,0,height*.53,depth*.505,w*.90,height*.80,.035);
   }else{
    for(const flank of [-1,1]){
     part(tower,box,darkGlass,flank*w*.29,height*.5,0,w*.40,height,depth*.80);
     part(tower,box,facade,flank*w*.29,height*.49,depth*.41,w*.37,height*.90,.04);
     part(tower,box,neon[(palette+1)%4],flank*w*.29,height+.3,0,w*.46,.18,depth*.89);
    }
    part(tower,box,steel,0,height*.76,0,w,.65,depth*.65);
    part(tower,box,neon[palette],0,height*.78,depth*.35,w,.12,.1);
   }
   part(tower,box,masonry,0,1.5,0,w*1.08,3,depth*1.08);
   for(const flank of [-1,1])part(tower,box,neon[(palette+2)%4],flank*w*.4,3.1,depth*.56,.10,.14,.12);
   tallSign(tower,palette,-side*w*.51,height*.50,0,depth*.84,height*.83,-side*Math.PI/2);
   part(tower,fin,steel,side*w*.26,height+2.5,0,.12,5,.12);
   // Preserve the placement seed used by the original facade's window sampling.
   if(style===0&&!hero){
    const samples=Math.floor(h/1.65)*Math.max(2,Math.floor(w/1.23));
    for(let i=0;i<samples;i++)random();
   }
   return;
  }

  if(hero||h>=18&&Math.floor(-z)%3===2){
   const side=Math.sign(x);
   tallSign(scene,palette,x-side*w*.57,h*.54,z+depth*.18,1.48,h*.78,-side*Math.PI/2);
  }
  if(style===1||hero){
   const glass=part(scene,drum,darkGlass,x,h*.50,z,w*.49,h,depth*.51);
   glass.rotation.y=.08;
   for(let floor=1;floor<h/1.7;floor++){
    const y=floor*1.7;
    part(scene,drum,steel,x,y,z,w*.51,.13,depth*.52);
    for(let i=0;i<10;i++){
     const a=(i/10)*Math.PI*2;
     const panel=part(scene,box,neon[(floor+i)%5?palette:3],x+Math.cos(a)*w*.45,y-.52,z+Math.sin(a)*depth*.46,.34,.52,.23);
     panel.rotation.y=-a;
    }
   }
   for(const k of [-1,1])part(scene,box,neon[palette],x-Math.sign(x)*w*.47,h*.49,z+k*depth*.21,.065,h*.91,.075);
   if(hero){
    part(scene,box,bronze,x-w*.58,3.5,z,3.7,.32,5.3);
    part(scene,box,neon[1],x-w*.79,3.35,z,.08,.14,5.4);
    const sign=billboard(2,x-w*.82,4.17,z+.72,4.1,1.13);sign.rotation.y=-Math.PI/2;
   }
   return;
  }
  if(style===2){
   part(scene,box,masonry,x,h*.22,z,w,h*.44,depth);
   part(scene,box,bronze,x,h*.451,z,w*1.07,.16,depth*1.06);
   part(scene,box,darkGlass,x+Math.sign(x)*.64,h*.69,z,w*.73,h*.49,depth*.79);
   const cap=part(scene,roofCone,bronze,x,h*.99,z,w*.51,h*.15,depth*.54);cap.rotation.y=Math.PI/4;
   for(let i=0;i<5;i++){
    const zz=z+(i-2)*depth*.17;
    part(scene,box,neon[3],x-Math.sign(x)*w*.505,1.32,zz,.055,1.38,.7);
    part(scene,box,steel,x-Math.sign(x)*w*.54,2.19,zz,.18,.14,.82);
   }
   const sign=billboard(palette,x-Math.sign(x)*w*.53,3.22,z,3.3,1.24);
   sign.rotation.y=-Math.sign(x)*Math.PI/2;
   return;
  }
  if(style===3){
   for(let level=0;level<5;level++){
    const width=w*(1-level*.105),zz=z-level*.55;
    part(scene,box,level%2?slab:darkGlass,x+Math.sign(x)*level*.36,h*(level+.5)/5,zz,width,h/5,depth*(1-level*.07));
    part(scene,box,neon[palette],x-Math.sign(x)*(width*.5-level*.36),h*(level+1)/5,zz,.067,.086,depth*(1-level*.07));
   }
   return;
  }
  part(scene,box,slab,x,h*.5,z,w,h,depth);
  part(scene,box,darkGlass,x,h*.51,z,w*.92,h*.89,depth+.02);
  part(scene,box,roof,x,h+.2,z,w*1.03,.42,depth*1.02);
  part(scene,box,slab,x+w*.13,h+.85,z,2.1,1.3,2.6);
  const col=Math.max(2,Math.floor(w/1.23));
  for(let floor=0;floor<Math.floor(h/1.65);floor++){
   const y=1.3+floor*1.65;
   for(let i=0;i<col;i++){
    if(random()<.24)continue;
    const wx=x+((i+.5)/col-.5)*w*.95;
    litWindows[(floor+i)%9<6?palette:3].push([wx,y,z+depth*.5+.025,.64,.52,.035]);
    if(floor%2===0)litWindows[palette].push([x-Math.sign(x)*w*.5,y,z+(i/col-.5)*depth,.035,.55,.65]);
   }
   if(floor%3===0)frames.push([x,y-.65,z+depth*.5+.035,w,.065,.09]);
  }
  const face=x-Math.sign(x)*w*.51;
  for(const side of [-1,1]){
   part(scene,box,roof,face,1.85,z+side*depth*.30,.17,3.3,depth*.26);
   part(scene,box,neon[palette],face-Math.sign(x)*.10,2.8,z+side*depth*.30,.12,.09,depth*.23);
  }
  part(scene,box,neon[palette],face,h*.56,z+depth*.47,.10,h*.75,.09);
  if(hero){
   part(scene,box,neon[1],face,3.15,z,.18,.12,4.6);
   part(scene,box,darkGlass,face,1.55,z,.16,3.0,3.5);
   for(const k of [-1,1])part(scene,box,white,face,1.62,z+k*1.7,.22,3.2,.07);
   part(scene,box,roof,face-Math.sign(x)*1.4,3.5,z,3,.38,4.7);
   part(scene,box,neon[1],face-Math.sign(x)*2.9,3.32,z,.08,.15,4.68);
  }
 }
 function waterfrontPavilion(d){
  const x=-15.2,z=-d;
  const facade=new T.CylinderGeometry(1,1,1,32,1,false,0,Math.PI*2);
  const arch=new T.TorusGeometry(1,.027,6,36,Math.PI);
  part(scene,drum,bronze,x,.46,z,5.7,.56,6.1);
  part(scene,facade,darkGlass,x,2.84,z,4.92,4.3,5.12);
  part(scene,drum,steel,x,5.16,z,5.15,.29,5.64);
  part(scene,drum,bronze,x,5.43,z,5.55,.23,5.80);
  for(const offset of [-4.0,-2.5,-1,1,2.5,4.0]){
   const archway=part(scene,arch,neon[offset>0?0:3],x+2.4,5.55,z+offset,2.25,2.8,1);
   archway.rotation.y=Math.PI/2;
  }
  for(let i=0;i<15;i++){
   const a=i/14*Math.PI-Math.PI/2;
   part(scene,box,neon[3],x+Math.cos(a)*4.92,2.68,z+Math.sin(a)*5.12,.07,3.67,.08);
  }
  for(let i=0;i<9;i++)part(scene,box,amber,x+4.53+i*.47,.19,z,.11,.045,3.72);
 }
 // The major skyline silhouettes get their own geometry and rigid site transforms.
 const pearl=standard('#997d96',.29,.61);
 const cobalt=standard('#1f3955',.30,.58);
 const fin=new T.CylinderGeometry(1,1,1,8),cap=new T.ConeGeometry(1,1,8);
 const skylinePoint=new T.Vector3();
 function site(distance,offset){
  const root=new T.Group();
  streetPoint(skylinePoint,distance,offset);
  root.position.copy(skylinePoint);root.rotation.y=-heading(distance);
  scene.add(root);return root;
 }
 function windowBands(root,positions,h,material){
  const count=Math.floor(h/1.55)-1,rows=positions.length;
  const facade=new T.InstancedMesh(box,material,count*rows);
  const model=new T.Object3D();let index=0;
  for(let y=1;y<=count;y++)for(const [x,z,sx,sz] of positions){
   model.position.set(x,y*1.55,z);model.scale.set(sx,.36,sz);model.updateMatrix();
   facade.setMatrixAt(index++,model.matrix);
  }
  root.add(facade);
 }
 const crowns=site(104,22);
 const crownColors=facadeLights(104,.10,0),crownWash=towerGradient(0);
 for(const z of [-6.2,6.2]){
  for(let tier=0;tier<6;tier++){
   const radius=3.6-tier*.34;
   part(crowns,fin,z<0?crownWash:tier%2?pearl:cobalt,0,3.7+tier*7.4,z,radius,7.4,radius).rotation.y=Math.PI/8;
   part(crowns,fin,crownColors,0,7.38+tier*7.4,z,radius*1.01,.11,radius*1.01).rotation.y=Math.PI/8;
  }
  part(crowns,cap,pearl,0,46.1,z,1.65,3.4,1.65);
  part(crowns,box,white,0,49.0,z,.075,3.4,.075);
  windowBands(crowns,[[-2.8,z,.075,1.62],[0,z+2.8,1.38,.071]],26,neon[3]);
 }
 part(crowns,box,pearl,0,25,0,2.7,.32,10);
 part(crowns,box,cobalt,0,26.2,0,2.48,2.02,9.8);
 part(crowns,box,neon[1],-1.25,25.48,0,.09,.16,9.85);
 part(crowns,box,neon[1],-1.25,27.16,0,.09,.14,9.85);
 const terraces=site(43,22.8);
 const terraceColors=facadeLights(43,.50),terraceWash=towerGradient(1);
 for(const z of [-11,0,11]){
  for(let floor=0;floor<11;floor++){
   const slide=(floor/10)**2*2.4;
   part(terraces,box,z===0?terraceWash:cobalt,slide,floor*2.38+1.19,z,5.7,2.38,7.1);
   part(terraces,box,pearl,slide,floor*2.38+2.31,z,6.22,.15,7.42);
   part(terraces,box,terraceColors,slide-3.06,floor*2.38+2.39,z,.09,.075,7.33);
   for(const k of [-2.3,0,2.3])for(const side of [-1,1]){
    part(terraces,box,neon[(floor+side)%3===0?1:3],slide+side*2.88,floor*2.38+1.18,z+k,.06,.86,1.31);
   }
  }
 }
 terraces.userData.facadeFinish=1;
 tallSign(terraces,1,-3.12,14.15,0,2.30,23,-Math.PI/2);
 part(terraces,ball,pearl,1.8,27.1,0,4.7,1.35,18.5);
 part(terraces,ball,terraceColors,1.8,27.97,0,4.4,.16,17.4);
 const rooftopBark=standard('#51404a'),rooftopLeaf=standard('#315e51');
 for(const z of [-11,-6,-1,4,9,14]){
  part(terraces,box,rooftopBark,1,28.45,z,.12,.78,.12);
  part(terraces,ball,rooftopLeaf,1,29,z,.73,.62,.69);
 }
 const sphereHall=site(69,-17.9);
 const ringColors=facadeLights(69,.83);
 const halo=new T.TorusGeometry(5.15,1.24,14,64);
 const contour=new T.TorusGeometry(5.23,.034,5,72);
 part(sphereHall,box,cobalt,0,.62,0,12.2,1.24,8.1);
 const ring=part(sphereHall,halo,pearl,-.1,7.85,0,1.03,1.28,.89);
 ring.rotation.set(.10,Math.PI/2,-.24);
 for(const [depth,color] of [[.93,0],[-.93,1]]){
  const trim=part(sphereHall,contour,color===0?ringColors:neon[1],depth,7.85,0,1.03,1.28,.86);
  trim.rotation.copy(ring.rotation);
 }
 for(let i=0;i<28;i++){
  const a=i*Math.PI*2/28;
  part(sphereHall,ball,neon[i%3],1.10,7.85+Math.sin(a)*6.15,Math.cos(a)*4.94,.082,.15,.18);
 }
 // Frame each landmark from an open side of its site so nearby towers cannot clip the view.
 const landmarkViews={
  skypark:{root:terraces,position:[51,24,13],look:[0,14.5,0],layer:1},
  ring:{root:sphereHall,position:[25,10,5],look:[0,7.5,0],layer:2},
  spires:{root:crowns,position:[-62,31,14],look:[0,25,0],layer:3}
 };
 for(const view of Object.values(landmarkViews)){
  part(view.root,box,slab,0,-.19,0,14,.36,37);
  view.root.traverse(object=>object.layers.enable(view.layer));
  for(const object of scene.children)if(object.isLight||object===sky)object.layers.enable(view.layer);
  view.root.updateMatrixWorld(true);
  view.position=view.root.localToWorld(new T.Vector3(...view.position));
  view.look=view.root.localToWorld(new T.Vector3(...view.look));
 }
 for(let d=2;d<260;d+=13)for(const side of [-1,1]){
  const hero=side===1&&d===80;
  if(side===-1&&d===54)waterfrontPavilion(49);
  else if(!(side===-1&&d===67)&&!(side===1&&[28,41,106].includes(d)))building(side*range(14,17),-d,range(6,9),hero?30:d%3?range(7,13):range(17,28),range(7,11),hero?1:Math.floor(range(0,4)),hero,Math.round(d/13)%4);
  if(!((side===1&&d>=28&&d<=54)||(side===-1&&d>=54&&d<=80)||(side===1&&d>=93&&d<=119)))building(side*range(26,49),-d-range(0,19),range(7,13),range(24,52),range(8,13),Math.floor(range(0,4)),Math.round(d/13+side)%4);
  const reflection=part(scene,reflectionGeo,wash[hero?1:Math.floor(range(0,4))],side*4.8,.021,-d,3.2,11,1);
  reflection.rotation.x=-Math.PI/2;
 }
 // Extend the street frontage behind arrival and past the drive's final turn.
 for(const d of [-72,-59,-46,-33,-20,-7]){
  for(const side of [-1,1]){
   building(side*16,-d,8,16+(Math.abs(d)%4)*3,9,(Math.abs(d)+1)%4,false,Math.floor(Math.abs(d)/13)%4);
  }
 }
 for(const [d,nameIndex,side] of [[49,1,-1],[80,2,1],[113,3,-1]]){
  const z=-d;
  const sign=billboard(nameIndex,side*11.8,6.1,z,5.5,2.1);
  sign.rotation.y=-side*Math.PI/2;
  const marquee=facadeLights(d,nameIndex*.23);
  if(d===49)tallSign(scene,nameIndex,side*10.15,4.9,z-3,1.40,7.8,-side*Math.PI/2);
  part(scene,box,marquee,side*11.75,4.85,z,.10,.11,5.52);
  for(const flank of [-1,1]){
   part(scene,box,marquee,side*11.78,4.9,z+flank*2.8,.11,5.25,.11);
  }
  for(let i=0;i<4;i++)part(scene,box,neon[3],side*(11.7+i*.48),.21,z,.11,.03,4.6);
 }
 const bridgeGlass=new T.MeshStandardMaterial({color:'#7bb9d5',transparent:true,opacity:.19,roughness:.23,metalness:.18,depthWrite:false});
 const skybridges=[[24,10.4],[49,9.4],[82,9.9],[112,8.6],[166,11],[211,10.3]];
 for(const [d,height] of skybridges){
  const x=0,z=-d,depth=3.6;
  // The bridge meets a full-height entrance wing on both sides of the street.
  for(const side of [-1,1]){
   building(side*18,z,6,height+6,7,d%4,false,0);
   part(scene,box,steel,side*15,height+1.05,z,.18,2.5,depth+.4);
   part(scene,box,neon[1],side*14.88,height+1.98,z,.09,.08,depth+.5);
  }

  part(scene,box,steel,x,height,z,30,.35,depth);
  part(scene,box,steel,x,height+2.07,z,30,.21,depth);
  for(const face of [-1,1]){
   part(scene,box,neon[d===82?1:0],x,height+.20,z+face*depth*.5,30,.10,.065);
   part(scene,box,neon[1],x,height+1.94,z+face*depth*.5,30,.055,.06);
   for(let i=-12;i<=12;i++){
    part(scene,box,bridgeGlass,x+i*1.18,height+1.04,z+face*depth*.49,1.06,1.66,.058);
    part(scene,box,steel,x+(i+.48)*1.18,height+1.04,z+face*depth*.5,.048,1.84,.12);
   }
  }
 }
 const leafShade=standard('#314b43',.94),treeBark=standard('#51404a',.95);
 for(const d of [10,37,69,96,126,150])for(const side of [-1,1]){
  const x=side*10.6,z=-d;
  part(scene,box,masonry,x,.23,z,1.5,.47,1.75);
  part(scene,box,treeBark,x,1.22,z,.14,1.64,.14);
  for(let k=0;k<5;k++){
   const angle=k/5*Math.PI*2;
   part(scene,ball,leafShade,x+Math.cos(angle)*.47,2.24+(k%2)*.35,z+Math.sin(angle)*.52,.66,.60,.69);
  }
  part(scene,box,amber,x-side*.60,.52,z,.061,.034,1.42);
 }
 for(const d of crossings){
  const x=0;
  for(let i=-6;i<=6;i++)part(scene,box,white,x+i*1.07,.007,-d,.60,.01,1.8);
 }
 const signals=[],signalHousing=standard('#232b36',.44,.36);
 const neutralSignal=new T.Color('#272d37');
 const signalColors=['#ff354d','#ffc15b','#49ffb0'].map(color=>new T.Color(color));
 const lensGeometry=new T.SphereGeometry(1,12,8);
 for(const distance of crossings)for(const side of [-1,1]){
  const z=-distance;
  part(scene,box,steel,side*7.28,2.54,z,.16,5.05,.15);
  part(scene,box,steel,side*4.89,4.99,z,4.80,.11,.12);
  part(scene,box,signalHousing,side*2.65,4.54,z,.47,1.13,.28);
  const lights=signalColors.map((color,i)=>{
   const lens=part(scene,lensGeometry,lit('#272d37'),side*2.65,4.86-i*.31,z+.17,.145,.145,.07);
   return lens.material;
  });
  signals.push({distance,lights});
 }
 const matrix=new T.Matrix4(),mapped=new T.Vector3(),rotation=new T.Quaternion();
 const yAxis=new T.Vector3(0,1,0),scale=new T.Vector3();
 for(const mesh of scene.children){
  if(!mesh.isMesh||mesh===sky)continue;
  const d=-mesh.position.z;
  streetPoint(mapped,d,mesh.position.x,mesh.position.y);
  mesh.position.copy(mapped);mesh.rotateOnWorldAxis(yAxis,-heading(d));
 }
 function ribbon(left,right,y,material){
  const positions=[],triangles=[];
  for(let d=-90;d<=280;d++){
   for(const edge of [left,right]){
    streetPoint(mapped,d,edge,y);positions.push(mapped.x,mapped.y,mapped.z);
   }
   if(d>-90){const n=(d+90)*2;triangles.push(n-2,n-1,n,n-1,n+1,n);}
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setIndex(triangles);geo.computeVertexNormals();scene.add(new T.Mesh(geo,material));
 }
 ribbon(-7.45,7.45,-.02,road);
 ribbon(-10.9,-7.36,.15,walk);
 ribbon(7.36,10.9,.15,walk);

 for(const [material,list] of [...litWindows.map((items,i)=>[neon[i],items]),[roof,frames]]){
  const batch=new T.InstancedMesh(box,material,list.length);
  list.forEach(([x,y,z,w,h,d],i)=>{
   streetPoint(mapped,-z,x,y);rotation.setFromAxisAngle(yAxis,-heading(-z));
   matrix.compose(mapped,rotation,scale.set(w,h,d));batch.setMatrixAt(i,matrix);
  });
  scene.add(batch);
 }
 // Combine the repeated architecture and road parts before adding moving actors.
 const staticBatches=new Map();
 for(const mesh of [...scene.children]){
  if(mesh.geometry!==box||mesh.isInstancedMesh)continue;
  if(!staticBatches.has(mesh.material))staticBatches.set(mesh.material,[]);
  mesh.updateMatrix();
  staticBatches.get(mesh.material).push(mesh.matrix);
  mesh.removeFromParent();
 }
 for(const [material,matrices] of staticBatches){
  const batch=new T.InstancedMesh(box,material,matrices.length);
  matrices.forEach((transform,i)=>batch.setMatrixAt(i,transform));scene.add(batch);
 }
 const party=[];
 for(const d of [27,53,105]){
  const group=new T.Group();streetPoint(group.position,d,-10,4);group.rotation.y=-heading(d);scene.add(group);
  for(let i=0;i<3;i++){const beam=part(group,box,neon[i],0,i*.35,0,.045,.055,3.2);party.push(beam);}
 }
 const lampPlane=new T.PlaneGeometry(1,1);
 const roadBeams=[true,false].map(single=>new T.ShaderMaterial({
  transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
  uniforms:{single:{value:single?1:0}},
  vertexShader:`varying vec2 beam;void main(){beam=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
   uniform float single;varying vec2 beam;
   void main(){
    float distance=beam.y,x=beam.x-.5;
    float width=mix(.033,.24,distance);
    float spread=mix(.14,.24,distance)*(1.-single);
    float a=exp(-pow((x-spread)/width,2.));
    float b=exp(-pow((x+spread)/width,2.))*(1.-single);
    float falloff=smoothstep(0.,.10,distance)*pow(1.-distance,1.42);
    float road=.79+.21*sin(distance*154.+sin(x*49.)*2.);
    gl_FragColor=vec4(.79,.88,1.,min(1.,a+b)*falloff*road*.63);
   }
  `
 }));
 function addRoadBeam(model,single=false){
  const beam=part(model,lampPlane,roadBeams[single?0:1],0,.024,single?-4.2:-5.4,single?3.8:5.4,7.1,1);
  beam.rotation.x=-Math.PI/2;
 }
 const rubber=standard('#131319'),rim=standard('#6e6476',.35,.7);
 function car(color,variant){
  const group=new T.Group(),paint=standard(color,.27,.66);
  part(group,ball,paint,0,.58,0,1.01,.43,2.13);
  part(group,box,paint,0,.47,.1,1.83,.34,3.71);
  part(group,ball,darkGlass,0,.94,.07,.78,.39,1.25);
  part(group,ball,paint,0,1.17,-.05,.71,.19,.82);
  part(group,box,red,0,.69,1.95,1.65,.045,.065);
  for(const side of [-1,1]){
   part(group,box,white,side*.62,.6,-1.93,.39,.10,.067);
   for(const z of [-1.24,1.22]){
    const tire=part(group,wheel,rubber,side*.88,.37,z,.37,.23,.37);
    tire.rotation.z=Math.PI/2;
    const hub=part(group,wheel,rim,side*1,.37,z,.19,.023,.19);hub.rotation.z=Math.PI/2;
   }
  }
  if(variant===1){part(group,box,paint,0,.97,.45,1.76,.75,2.58);part(group,box,darkGlass,0,1.04,1.75,1.35,.44,.06);}
  if(variant===2){group.scale.set(.91,.81,.82);part(group,box,paint,0,.94,1.63,1.48,.061,.23);}
  addRoadBeam(group);scene.add(group);return group;
 }
 function bike(color){
  const model=new T.Group(),paint=standard(color,.31,.33);
  for(const z of [-.61,.58]){
   const tire=part(model,wheel,rubber,0,.31,z,.31,.13,.31);tire.rotation.z=Math.PI/2;
   const hub=part(model,wheel,rim,0,.31,z,.19,.14,.19);hub.rotation.z=Math.PI/2;
  }
  part(model,ball,paint,0,.60,-.1,.23,.21,.62);
  part(model,box,rubber,0,.68,.31,.21,.07,.42);
  part(model,box,white,0,.63,-.56,.20,.11,.10);
  part(model,box,red,0,.67,.68,.17,.072,.06);
  const rider=part(model,ball,roof,0,.96,.13,.205,.31,.14);rider.rotation.x=.48;
  part(model,ball,paint,0,1.24,-.05,.14,.15,.14);
  addRoadBeam(model,true);scene.add(model);return model;
 }
 const hero=makeCoupe();addRoadBeam(hero);scene.add(hero);
 const colors=['#6253a1','#c27062','#355b74','#5da36b','#e1bf74','#92648a'];
 const trafficFlow=createTraffic(24);
 const traffic=trafficFlow.cars.map((carState,i)=>{
  const twoWheels=i%5===1;
  return {model:twoWheels?bike(colors[i%6]):car(colors[i%6],i%3),state:carState};
 });
 const figures=Array.from({length:48+skybridges.length},(_,i)=>{
  const group=new T.Group(),coat=standard(['#ae584f','#687baa','#7b527e','#434855'][i%4]);
  part(group,ball,coat,0,1.06,0,.19,.32,.13);
  part(group,ball,standard('#bd8e78'),0,1.51,0,.11,.15,.105);
  const legs=[-1,1].map(side=>part(group,box,coat,side*.084,.39,0,.105,.65,.1));
  const arms=[-1,1].map(side=>part(group,ball,coat,side*.192,.99,0,.054,.23,.055));
  scene.add(group);return{group,legs,arms,offset:i*5.2,side:i%2?1:-1,bridge:i>=48?skybridges[i-48]:null};
 });
 addCityBackdrop(scene,streetPoint,heading);
 const attractions=createCityAttractions(scene,streetPoint,heading);
 let time=0,droneStart=0,pressureLift;
 const streetPosition=new T.Vector3(),streetLook=new T.Vector3();
 const orbitOffset=new T.Vector3(),lookDirection=new T.Vector3();
 let lanePosition=2.25;
 function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25,Math.sqrt(1500000/(w*h))));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.76?65:68;camera.updateProjectionMatrix();
 }
 resize();
 function occupiedLanes(lane){
  return Math.abs(lanePosition-laneOffsets[lane])>.08?[0,1]:[lane];
 }
 return {
  resize,
  drive(from,to,lane){return trafficFlow.drive(from,to,occupiedLanes(lane));},
  canChangeLane(distance,lane,previousLane){return occupiedLanes(previousLane).length===1&&trafficFlow.canChange(distance,lane);},
  render(distance,dt,approach=0,ascentTime=null,lane=0,stopSide=1,cameraMode='chase',reduced=false,freeLook=null){
  if(!reduced)time+=dt;
  if(ascentTime!==null)droneStart=time;
  attractions.tick(time,time-droneStart,distance,cameraMode,!!freeLook&&(Math.abs(freeLook.yaw)>.45||Math.abs(freeLook.pitch)>.35));
  ledClock.value=time;ledDistance.value=distance;
  const targetLane=laneOffsets[lane];
  trafficFlow.tick(dt,{distance,lanes:occupiedLanes(lane)});
  lanePosition=reduced?targetLane:T.MathUtils.damp(lanePosition,targetLane,7,dt);
  streetPoint(hero.position,distance,lanePosition,.03);
  hero.rotation.y=-heading(distance)+(targetLane-lanePosition)*.047;
  for(const {sign,index,distance:at} of signs){
   const driveCycle=Math.floor((distance-at+180)/6 + time*.45);
   sign.material=billboardMaterials[((index+driveCycle)%billboardMaterials.length+billboardMaterials.length)%billboardMaterials.length];
  }
  for(const show of lightShows){
   const nearby=1-T.MathUtils.smoothstep(Math.abs(distance-show.distance),5,32);
   const palette=trimPalette[show.finish];
   const speed=.12+show.offset*.11;
   const mix=.5+.5*Math.sin(time*speed+show.distance*.31);
   if(show.finish===2)show.material.color.setHSL((time*(.045+show.offset*.025)+show.offset)%1,.78,.61);
   else show.material.color.copy(palette[0]).lerp(palette[1],mix);
   show.material.color.multiplyScalar(.84+nearby*.22);
  }
  for(const signal of signals){
   const i=trafficFlow.phase(signal.distance);
   signal.lights.forEach((material,j)=>material.color.copy(j===i?signalColors[j]:neutralSignal));
  }
  for(const {model,state} of traffic){
   const {distance:d,side,lane}=state;
   streetPoint(model.position,d,side*laneOffsets[lane],.02);
   model.rotation.y=-heading(d)+(side===1?0:Math.PI);
   model.visible=Math.abs(d-distance)<54;
  }
  figures.forEach(({group,legs,arms,offset,side,bridge},i)=>{
   const d=bridge?bridge[0]:(offset+time*(.65+i%3*.1))%265;
   if(bridge){
    const cycle=(time*.5+offset)%56,across=cycle<28?cycle:56-cycle;
    streetPoint(group.position,d,-14+across,bridge[1]+.2);
    group.rotation.y=-heading(d)+(cycle<28?Math.PI/2:-Math.PI/2);
    group.visible=Math.abs(d-distance)<85;
   }else{
   streetPoint(group.position,d,side*(8.65+i%3*.48),.20);
   group.rotation.y=-heading(d)+(side===1?Math.PI:0);
   group.visible=Math.abs(d-distance)<38;
   }
   legs.forEach((leg,j)=>{leg.rotation.x=Math.sin(time*5.5+i+j*Math.PI)*.51;arms[j].rotation.x=-leg.rotation.x*.62;});
  });
  party.forEach((beam,i)=>{beam.rotation.y=Math.sin(time*.9+i)*.73;beam.scale.z=2.7+Math.sin(time*2+i)*.46;});
  const mobile=camera.aspect<.76;
  // A shorter viewport gives the driving controls a larger share of the frame.
  const shortView=1-T.MathUtils.smoothstep(innerHeight,400,620);
  const lookDistance=T.MathUtils.lerp(mobile?16:20-6*shortView,0,approach);
  streetPoint(streetPosition,distance,T.MathUtils.lerp(lanePosition,stopSide*8,approach),T.MathUtils.lerp(mobile?6.2:6.8,2.15,approach));
  const behind=T.MathUtils.lerp(17,1.4,approach),angle=heading(distance);
  streetPosition.x-=Math.sin(angle)*behind;streetPosition.z+=Math.cos(angle)*behind;
  const farFromLift=T.MathUtils.smoothstep(distance,0,13);
  streetPoint(streetLook,distance+lookDistance,T.MathUtils.lerp(lanePosition*.65,stopSide*14.5,approach),T.MathUtils.lerp((mobile?2:farFromLift+2.2)-1.35*shortView,2.4,approach));
  const mode=ascentTime!==null||approach>.002?'chase':cameraMode;
  let fov=mobile?74:76;
  camera.layers.set(landmarkViews[mode]?.layer??0);
  if(mode==='hood'){
   streetPoint(streetPosition,distance+1.1,lanePosition,1.35);
   streetPoint(streetLook,distance+22,lanePosition,2.25);
   fov=mobile?65:70;
  }else if(mode==='skyline'){
   streetPoint(streetPosition,distance-12,lanePosition-3,mobile?13:17);
   streetPoint(streetLook,distance+22,0,mobile?12:15);
   fov=72;
  }else if(landmarkViews[mode]){
   const view=landmarkViews[mode];
   streetPosition.copy(view.position);streetLook.copy(view.look);
   fov=mobile?mode==='skypark'?82:72:52;
  }
  if(freeLook&&ascentTime===null&&approach<.002&&(freeLook.yaw||freeLook.pitch)){
   const {yaw,pitch}=freeLook,view=landmarkViews[mode];
   const pivot=view?view.look:hero.position;
   lookDirection.subVectors(streetLook,streetPosition).applyAxisAngle(yAxis,yaw);
   if(mode!=='hood'){
    orbitOffset.subVectors(streetPosition,pivot).applyAxisAngle(yAxis,yaw);
    if(!view&&mode==='chase'){
     const right=orbitOffset.x*Math.cos(angle)+orbitOffset.z*Math.sin(angle);
     if(Math.abs(right)>.001){
      const clearance=right>0?8.8-lanePosition:8.8+lanePosition;
      const fraction=Math.min(1,clearance/Math.abs(right));
      orbitOffset.x*=fraction;orbitOffset.z*=fraction;
     }
    }
    streetPosition.copy(pivot).add(orbitOffset);
   }
   const horizon=Math.hypot(lookDirection.x,lookDirection.z);
   const elevation=T.MathUtils.clamp(Math.atan2(lookDirection.y,horizon)+pitch,-1.42,1.42);
   lookDirection.y=horizon*Math.tan(elevation);
   streetLook.copy(streetPosition).add(lookDirection);
  }
  if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  if(ascentTime!==null){
   pressureLift??=createPressureLift(camera);
   if(ascentTime<pressureLift.duration){
    hero.visible=ascentTime>=hatchApproachDuration+3.67;
    pressureLift.render(renderer,scene,camera,ascentTime,streetPosition,streetLook);
    return false;
   }
  }
  if(pressureLift){pressureLift.dispose();pressureLift=null;renderer.renderLists.dispose();}
  hero.visible=mode!=='hood';
  camera.position.copy(streetPosition);camera.lookAt(streetLook);
  renderer.render(scene,camera);
  return true;
 },dispose(){pressureLift?.dispose();disposeScene(scene);for(const material of billboardMaterials){material.map.dispose();material.dispose();}renderer.dispose();renderer.forceContextLoss();}};
}
