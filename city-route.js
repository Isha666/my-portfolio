import * as T from './vendor/three.module.js';

export const driveLength=245;
const route=[
 {start:22,length:24,turn:Math.PI/3.1},
 {start:65,length:30,turn:-Math.PI/1.92},
 {start:124,length:28,turn:Math.PI/3.4},
 {start:174,length:25,turn:-Math.PI/3.7},
 {start:220,length:22,turn:Math.PI/4.5}
];
export function heading(distance){
 return route.reduce((angle,{start,length,turn})=>angle+turn*T.MathUtils.smoothstep(distance,start,start+length),0);
}
const streetSamples=[new T.Vector2()];
for(let d=1;d<=320;d++){
 const angle=heading(d-.5);
 streetSamples.push(streetSamples[d-1].clone().add(new T.Vector2(Math.sin(angle),-Math.cos(angle))));
}
export function streetPoint(target,distance,lane=0,y=0){
 const angle=heading(distance),i=Math.floor(distance),fraction=distance-i;
 if(distance<0)return target.set(lane,y,-distance);
 const a=streetSamples[Math.min(i,streetSamples.length-2)],b=streetSamples[Math.min(i+1,streetSamples.length-1)];
 return target.set(T.MathUtils.lerp(a.x,b.x,fraction)+Math.cos(angle)*lane,y,T.MathUtils.lerp(a.y,b.y,fraction)+Math.sin(angle)*lane);
}

export const skyParkLot={distance:43,minX:-12.6,maxX:7.2,minZ:-20,maxZ:20};
const roadPoint=new T.Vector3(),sitePoint=new T.Vector3();
export function distanceToLot(point,distance,offset,lot=skyParkLot){
 streetPoint(sitePoint,distance,offset,0);
 const angle=heading(distance),dx=point.x-sitePoint.x,dz=point.z-sitePoint.z;
 const x=Math.cos(angle)*dx+Math.sin(angle)*dz,z=-Math.sin(angle)*dx+Math.cos(angle)*dz;
 return Math.hypot(Math.max(lot.minX-x,0,x-lot.maxX),Math.max(lot.minZ-z,0,z-lot.maxZ));
}
export function roadClearance(offset,lot=skyParkLot){
 let clearance=Infinity;
 for(let d=-90;d<=278;d+=.5){
  streetPoint(roadPoint,d,0,0);
  clearance=Math.min(clearance,distanceToLot(roadPoint,lot.distance,offset,lot));
 }
 return clearance;
}
export const skyParkOffset=(()=>{
 // Leave the carriageways and both sidewalks clear, including the nearby bend.
 for(let offset=30;offset<=100;offset+=1)if(roadClearance(offset)>=13.5)return offset;
 throw new Error('SkyPark requires a clear building plot');
})();
export function reserveSkyParkLot(distance,offset,radius){
 const point=new T.Vector3();
 for(let attempt=0;attempt<12;attempt++){
  streetPoint(point,distance,offset,0);
  if(distanceToLot(point,skyParkLot.distance,skyParkOffset)>=radius+2)break;
  offset+=Math.sign(offset||1)*12;
 }
 return offset;
}
