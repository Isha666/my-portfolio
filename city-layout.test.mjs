import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {streetPoint,heading,skyParkOffset,skyParkLot,reserveSkyParkLot} from './city-route.js';
import {createSkyParkVisit,skyParkDuration} from './city-skypark.js';
import {skyParkDeckHeight} from './city-skypark-levels.js';
import {skySites} from './city-sky.js';
import {disposeScene} from './scene-resources.js';

function rectangle(x,z,minX,maxX,minZ,maxZ,angle){
 const cos=Math.cos(angle),sin=Math.sin(angle);
 return [[minX,minZ],[maxX,minZ],[maxX,maxZ],[minX,maxZ]].map(([a,b])=>[x+a*cos+b*sin,z-a*sin+b*cos]);
}
function overlap(a,b){
 for(const polygon of [a,b])for(let i=0;i<4;i++){
  const next=polygon[(i+1)%4],at=polygon[i],axis=[next[1]-at[1],at[0]-next[0]];
  const project=points=>points.map(p=>p[0]*axis[0]+p[1]*axis[1]);
  const pa=project(a),pb=project(b);
  if(Math.max(...pa)<Math.min(...pb)||Math.max(...pb)<Math.min(...pa))return false;
 }
 return true;
}
const site=new T.Object3D();streetPoint(site.position,43,skyParkOffset);site.rotation.y=-heading(43);site.updateMatrixWorld();
const lot=rectangle(site.position.x,site.position.z,skyParkLot.minX,skyParkLot.maxX,skyParkLot.minZ,skyParkLot.maxZ,-heading(43));

test('SkyPark buildings and approach stay outside every traffic lane and U-turn corridor',()=>{
 const start=new T.Vector3(),end=new T.Vector3(-12.45,.14,5.4);streetPoint(start,43,10.95);site.localToWorld(end);
 const midpoint=start.clone().add(end).multiplyScalar(.5),length=Math.hypot(end.x-start.x,end.z-start.z);
 const approach=rectangle(midpoint.x,midpoint.z,-1.75,1.75,-length/2,length/2,Math.atan2(end.x-start.x,end.z-start.z));
 const car=new T.Vector3();
 for(let distance=-70;distance<=278;distance+=.25)for(const lane of [-5.08,-2.25,0,2.25,5.08]){
  streetPoint(car,distance,lane);
  const body=rectangle(car.x,car.z,-1.35,1.35,-2.6,2.6,-heading(distance));
  assert.equal(overlap(body,lot),false,`Car enters SkyPark at ${distance}, lane ${lane}`);
  assert.equal(overlap(body,approach),false,`Car enters approach at ${distance}, lane ${lane}`);
 }
});

test('Reserving the new plot preserves both skybridge anchors',()=>{
 for(const distance of [24,49,82,112,166,211])for(const side of [-1,1])assert.equal(reserveSkyParkLot(distance,side*18,Math.hypot(6,7)/2),side*18);
});

test('Every fixed aerial display can be seen from the deck while panning on phone and laptop',()=>{
 globalThis.document={createElement(){return{getContext(){return{fillRect(){},fillText(){}};}};}};
 const scene=new T.Scene(),tower=new T.Group();scene.add(tower);tower.position.copy(site.position);tower.rotation.copy(site.rotation);
 const visit=createSkyParkVisit(tower),eye=new T.Vector3(),look=new T.Vector3();visit.pose(skyParkDuration,eye,look);
 assert.ok(eye.y>120);
 assert.ok(skySites.every(s=>s.position.y-120>skyParkDeckHeight));
 for(const [width,height] of [[390,844],[1440,900]]){
  const seen=new Set(),camera=new T.PerspectiveCamera(78,width/height,.1,2400);
  const base=look.clone().sub(eye),direction=new T.Vector3(),target=new T.Vector3();
  for(let turn=0;turn<64;turn++){
   direction.copy(base).applyAxisAngle(new T.Vector3(0,1,0),turn*Math.PI/32);
   const horizon=Math.hypot(direction.x,direction.z);direction.y=horizon*Math.tan(Math.atan2(direction.y,horizon)+.5);
   camera.position.copy(eye);camera.lookAt(target.copy(eye).add(direction));camera.updateMatrixWorld();
   skySites.forEach((show,index)=>{const p=show.position.clone().project(camera);if(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1)seen.add(index);});
  }
  assert.equal(seen.size,10,`Missing sky shows at ${width}×${height}`);
 }
 disposeScene(scene);assert.equal(scene.children.length,0);
});
