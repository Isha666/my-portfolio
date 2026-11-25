import * as T from './vendor/three.module.js';

export function addCityBackdrop(scene,streetPoint,heading){
 const ground=new T.Mesh(new T.PlaneGeometry(700,700),new T.MeshStandardMaterial({color:'#222338',roughness:.88,metalness:.12}));
 ground.rotation.x=-Math.PI/2;ground.position.set(20,-.11,-85);scene.add(ground);
 const palettes=['#728de4','#c17cc0','#69bfc9','#c8a277'];
 const blocks=palettes.map(()=>[]);
 let seed=713;
 const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 for(let d=-84;d<248;d+=17){
  for(const side of [-1,1]){
   for(const row of [0,1]){
    blocks[(Math.round((d+84)/17)+row+(side===1?1:0))%4].push({
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
   blocks[Math.floor(random()*4)].push({distance:d,offset,width:12,height:16+random()*33,depth:13});
  }
 }
 const transform=new T.Object3D();
 for(const [index,buildings] of blocks.entries()){
  const geometry=new T.BoxGeometry(1,1,1);
  const grids=new Float32Array(buildings.length*2);
  const material=new T.MeshStandardMaterial({color:'#30364b',roughness:.58,metalness:.35});
  material.onBeforeCompile=shader=>{
   shader.uniforms.windowTint={value:new T.Color(palettes[index])};
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
    totalEmissiveRadiance+=windowTint*(lit*.75+floorLine*.10);
   `);
  };
  material.customProgramCacheKey=()=> 'city-surrounding-windows';
  const towers=new T.InstancedMesh(geometry,material,buildings.length);
  buildings.forEach(({distance,offset,width,height,depth},i)=>{
   streetPoint(transform.position,distance,offset,height/2);
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
