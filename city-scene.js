import * as T from './vendor/three.module.js';
import {disposeScene} from './scene-resources.js';
import {createPressureLift} from './city-lift.js?v=3';

export const towerDistance=85;
export const driveLength=107;

function makeCoupe(){
 const car=new T.Group();
 const paint=new T.MeshPhysicalMaterial({color:'#ec268d',roughness:.27,metalness:.38,clearcoat:1,clearcoatRoughness:.14});
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

function makeCityPlate(scene){
 const loader=new T.TextureLoader();
 const maps=['waterfront','leadership-tower'].map(name=>loader.load(
  new URL('./assets/city/'+name+'.webp',import.meta.url).href,undefined,undefined,
  error=>console.warn('City backdrop unavailable',error)
 ));
 for(const map of maps){map.colorSpace=T.SRGBColorSpace;map.minFilter=T.LinearFilter;map.generateMipmaps=false;}
 const uniforms={
  waterfront:{value:maps[0]},tower:{value:maps[1]},aspect:{value:1.78},
  progress:{value:0},entrance:{value:0},ascent:{value:0},clock:{value:0}
 };
 const plane=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({
  uniforms,depthTest:false,depthWrite:false,toneMapped:false,
  vertexShader:`varying vec2 screen;void main(){screen=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`
   varying vec2 screen;
   uniform sampler2D waterfront,tower;
   uniform float aspect,progress,entrance,ascent,clock;
   float hash(float x){return fract(sin(x*127.1)*43758.54);}
   void main(){
    float second=smoothstep(.42,.67,progress);
    float shot=progress-second*.47;
    vec2 cover=vec2(min(1.,aspect/1.778),min(1.,1.778/aspect));
    vec2 pivot=vec2(.47,.43);
    vec2 uv=(screen-.5)*cover+.5;
    vec2 offset=uv-pivot;
    float foreground=1.-smoothstep(.04,.63,uv.y);
    uv=pivot+offset/(1.+(.08+foreground*.22)*shot+entrance*.12);
    uv.x+=sin(shot*5.)*.028+entrance*.15;
    uv.y+=ascent*.18;
    vec3 color=mix(texture2D(waterfront,uv).rgb,texture2D(tower,uv).rgb,second);
    float lane=sin(clock*1.7+uv.x*18.);
    color+=vec3(.05,.014,.045)*lane*foreground;
    float rainCell=screen.x*140.+screen.y*15.;
    float row=floor(rainCell);
    float drop=exp(-pow((fract(rainCell)-.44)*13.,2.));
    drop*=pow(max(0.,sin((screen.y+clock*(.34+hash(row)*.32))*55.+row)),24.);
    color+=vec3(.20,.33,.42)*drop*.30;
    gl_FragColor=vec4(color,1.);
    #include <colorspace_fragment>
   }
  `
 }));
 plane.renderOrder=-1000;plane.frustumCulled=false;scene.add(plane);
 return uniforms;
}

export function createCityScene(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power'});
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.23;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(46,1,.1,120);
 scene.background=new T.Color('#141a38');
 const plate=makeCityPlate(scene);
 scene.add(new T.HemisphereLight('#e6d7ff','#7e3f73',2.25));
 for(const [color,intensity,x,y,z] of [['#ffd6ef',3,-3,6,3],['#70ccff',2.7,4,3,-2],['#ff7cbe',1.4,1,1,5]]){
  const light=new T.DirectionalLight(color,intensity);light.position.set(x,y,z);scene.add(light);
 }
 const car=makeCoupe();scene.add(car);
 const shadow=new T.Mesh(new T.PlaneGeometry(3.5,5.4),new T.ShaderMaterial({
  transparent:true,depthWrite:false,
  vertexShader:`varying vec2 p;void main(){p=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 p;void main(){
   float dark=exp(-dot(p*vec2(5.,4.),p*vec2(5.,4.))*1.5);
   float tail=exp(-dot((p-vec2(0.,-.33))*vec2(6.,8.),(p-vec2(0.,-.33))*vec2(6.,8.)));
   gl_FragColor=vec4(.17*tail,.004,.049*tail,.79*dark+.29*tail);
  }`
 }));
 shadow.position.set(0,.014,.55);shadow.rotation.x=-Math.PI/2;scene.add(shadow);
 let time=0,pressureLift;
 const streetPosition=new T.Vector3(),streetLook=new T.Vector3();
 function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25,Math.sqrt(1350000/(w*h))));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  plate.aspect.value=w/h;
 }
 resize();
 return {resize,render(distance,dt,approach=0,ascentTime=null){
  time+=dt;
  plate.clock.value=time;plate.progress.value=distance/driveLength;
  plate.entrance.value=approach;
  plate.ascent.value=ascentTime===null?0:1-T.MathUtils.smoothstep(ascentTime,3.15,5.1);
  const mobile=camera.aspect<.76;
  car.rotation.y=-Math.sin(distance*.073)*.065;
  streetPosition.set(T.MathUtils.lerp(.18,1.85,approach),T.MathUtils.lerp(mobile?4.25:3.72,1.96,approach),T.MathUtils.lerp(mobile?10.4:8.55,7.6,approach));
  streetLook.set(T.MathUtils.lerp(.06,4.8,approach),T.MathUtils.lerp(mobile?.25:1.02,2.25,approach),T.MathUtils.lerp(-5,0,approach));
  if(ascentTime!==null){
   pressureLift??=createPressureLift();
   if(ascentTime<pressureLift.duration){
    // The car waits at street level while the lift breaks the surface.
    car.visible=shadow.visible=ascentTime>=3.67;
    pressureLift.render(renderer,scene,camera,ascentTime,streetPosition,streetLook);
    return false;
   }
  }
  if(pressureLift){pressureLift.dispose();pressureLift=null;renderer.renderLists.dispose();}
  car.visible=shadow.visible=true;
  camera.position.copy(streetPosition);camera.lookAt(streetLook);renderer.render(scene,camera);
  return true;
 },dispose(){pressureLift?.dispose();disposeScene(scene);renderer.dispose();}};
}
