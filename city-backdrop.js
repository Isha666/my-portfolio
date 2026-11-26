import * as T from './vendor/three.module.js';

export function addCityBackdrop(scene,streetPoint,heading,reserveLot=(_,offset)=>offset){
 const ground=new T.Mesh(new T.PlaneGeometry(2400,2400),new T.MeshStandardMaterial({color:'#222338',roughness:.88,metalness:.12}));
 ground.rotation.x=-Math.PI/2;ground.position.set(20,-.11,-85);scene.add(ground);
 const palettes=['#728de4','#c17cc0','#69bfc9','#c8a277'];
 const blocks=Array.from({length:16},()=>[]);
 function shapeGeometry(kind){
  if(kind===0){
   // A continuous twisting, tapered glass tower.
   const geometry=new T.CylinderGeometry(.5,.5,1,8,24);
   const positions=geometry.attributes.position;
   for(let i=0;i<positions.count;i++){
    const y=positions.getY(i),turn=(y+.5)*1.05;
    const taper=1-(y+.5)*.31;
    const x=positions.getX(i)*taper,z=positions.getZ(i)*taper;
    positions.setXYZ(i,x*Math.cos(turn)-z*Math.sin(turn),y,x*Math.sin(turn)+z*Math.cos(turn));
   }
   geometry.computeVertexNormals();
   return geometry;
  }
  if(kind===1){
   const profile=[
    new T.Vector2(.32,-.5),new T.Vector2(.43,-.28),
    new T.Vector2(.5,-.06),new T.Vector2(.46,.17),
    new T.Vector2(.33,.36),new T.Vector2(.12,.48),new T.Vector2(0,.51)
   ];
   return new T.LatheGeometry(profile,20);
  }
  if(kind===2){
   const geometry=new T.BoxGeometry(1,1,1,1,12,1);
   const positions=geometry.attributes.position;
   for(let i=0;i<positions.count;i++){
    const y=positions.getY(i),height=y+.5;
    positions.setX(i,positions.getX(i)*(1-height*.43)+height*.16);
    if(y>.49)positions.setY(i,y+positions.getZ(i)*.38);
   }
   geometry.computeVertexNormals();
   return geometry;
  }
  // An elevated opening cuts through the crown.
  const outline=new T.Shape();
  outline.moveTo(-.5,-.5);outline.lineTo(.5,-.5);
  outline.lineTo(.5,.5);outline.lineTo(-.5,.5);outline.closePath();
  const opening=new T.Path();
  opening.moveTo(-.24,.07);opening.lineTo(-.24,.36);
  opening.lineTo(.24,.36);opening.lineTo(.24,.07);opening.closePath();
  outline.holes.push(opening);
  const geometry=new T.ExtrudeGeometry(outline,{depth:1,bevelEnabled:false,steps:1});
  geometry.translate(0,0,-.5);
  // Use facade-sized coordinates for consistent window proportions.
  const positions=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,positions.getX(i)+.5,positions.getY(i)+.5);
  return geometry;
 }
 let seed=713;
 const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 for(let d=-84;d<248;d+=17){
  for(const side of [-1,1]){
   for(const row of [0,1]){
    blocks[((Math.round((d+84)/17)+row+(side===1?1:0))%4)*4+
     (Math.round((d+84)/17)+row*2+(side===1?1:0))%4].push({
     distance:d+(random()-.5)*5,
     offset:side*(53+row*33+random()*8),
     width:9+random()*9,
     height:row?26+random()*40:12+random()*24,
     depth:10+random()*10
    });
   }
  }
 }
 // Close the horizon behind the arrival road and beyond the final turn.
 for(const d of [-100,252]){
  for(let offset=-100;offset<=100;offset+=16){
   blocks[Math.floor(random()*16)].push({distance:d,offset,width:12,height:22+random()*36,depth:13});
  }
 }
 const transform=new T.Object3D();
 for(const [index,buildings] of blocks.entries()){
  const geometry=shapeGeometry(index%4);
  const grids=new Float32Array(buildings.length*2);
  const material=new T.MeshStandardMaterial({color:'#30364b',roughness:.58,metalness:.35});
  material.onBeforeCompile=shader=>{
   shader.uniforms.windowTint={value:new T.Color(palettes[Math.floor(index/4)])};
   shader.uniforms.latticeAmount={value:index%4<2?1:0};
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
    attribute vec2 windowGrid;
    varying vec2 facadeUv;
    varying vec2 facadeGrid;
    varying float wall;
   `).replace('#include <begin_vertex>',`#include <begin_vertex>
    facadeUv=uv;facadeGrid=windowGrid;wall=1.-abs(normal.y);
   `);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
    uniform vec3 windowTint;
    uniform float latticeAmount;
    varying vec2 facadeUv;
    varying vec2 facadeGrid;
    varying float wall;
   `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    vec2 cell=facadeUv*facadeGrid;
    vec2 tile=fract(cell);
    float seed=fract(sin(dot(floor(cell),vec2(12.91,78.23)))*43758.54);
    float window=step(.18,tile.x)*step(tile.x,.73)*step(.22,tile.y)*step(tile.y,.69);
    float lit=window*step(.29,seed)*wall;
    float floorLine=(1.-step(.045,tile.y))*wall;
    float diagonals=min(abs(fract(facadeUv.x*6.+facadeUv.y*9.)-.5),abs(fract(facadeUv.x*6.-facadeUv.y*9.)-.5));
    float brace=(1.-smoothstep(.025,.065,diagonals))*latticeAmount*wall;
    totalEmissiveRadiance+=windowTint*(lit*.75+floorLine*.10)+vec3(.32,.39,.44)*brace*.30;
   `);
  };
  material.customProgramCacheKey=()=> 'city-surrounding-windows';
  const towers=new T.InstancedMesh(geometry,material,buildings.length);
  buildings.forEach(({distance,offset,width,height,depth},i)=>{
   streetPoint(transform.position,distance,reserveLot(distance,offset,Math.hypot(width,depth)*.5),height/2);
   transform.rotation.set(0,-heading(distance),0);
   transform.scale.set(width,height,depth);
   transform.updateMatrix();towers.setMatrixAt(i,transform.matrix);
   grids.set([Math.max(3,Math.round(width/1.3)),Math.round(height/1.65)],i*2);
  });
  geometry.setAttribute('windowGrid',new T.InstancedBufferAttribute(grids,2));
  towers.computeBoundingSphere();
  scene.add(towers);
 }
}
