import * as T from './vendor/three.module.js';
import {skyParkFloors,skyParkDeckHeight,skyParkDeckRise} from './city-skypark-levels.js?v=skypark-50-floors-2';
import {addSkyParkDetails} from './city-skypark-details.js?v=skypark-50-floors-2';

export const skyParkDuration=17.8;
const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const t=clamp(value);return clamp(t*t*t*(10+t*(-15+6*t)));};
export function skyParkHeight(time){return .3+(skyParkDeckHeight-.3)*ease((time-6.4)/9);}
export function skyParkStatus(time,descending=false){
 if(time>=skyParkDuration)return 'SkyPark · Floor 50 · Scroll / arrows / WASD to walk';
 if(time<1.6)return descending?'Returning to your car':'Entering the SkyPark grand lobby';
 if(time<3.6)return descending?'Walking through the lobby':'Grand lobby · SkyPark concierge';
 if(time<5.6)return descending?'Leaving the elevator':'Boarding the glass elevator';
 if(time<6.4)return descending?'Lobby · doors opening':'Elevator doors closing';
 if(time<15.4)return `${descending?'Descending':'Ascending'} · Floor ${Math.max(1,Math.min(skyParkFloors,Math.ceil(skyParkHeight(time)/2.38)))} / ${skyParkFloors}`;
 if(time<16.2)return descending?'Elevator doors closing':'Observation deck · doors opening';
 return descending?'Boarding the elevator':'Stepping onto the observation deck';
}

export function createSkyParkVisit(tower){
 const box=new T.BoxGeometry(1,1,1);
 const metal=new T.MeshStandardMaterial({color:'#587488',metalness:.72,roughness:.28});
 const floor=new T.MeshStandardMaterial({color:'#263948',metalness:.3,roughness:.45});
 const glass=new T.MeshStandardMaterial({color:'#b8e8f3',transparent:true,opacity:.17,roughness:.16,metalness:.12,depthWrite:false,side:T.DoubleSide});
 const light=new T.MeshBasicMaterial({color:'#9ceaff',toneMapped:false});
 const warm=new T.MeshBasicMaterial({color:'#ffe2aa',toneMapped:false});
 function part(parent,material,x,y,z,w,h,d){
  const mesh=new T.Mesh(box,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.layers.enable(1);parent.add(mesh);return mesh;
 }
 // A real exterior lift shaft on the road-facing side of the existing tower.
 for(const z of [-1.35,1.35]){
  part(tower,metal,-3.25,(skyParkDeckHeight+1)/2,z,.14,skyParkDeckHeight+1,.14);
  for(let y=2;y<=skyParkDeckHeight;y+=12)part(tower,metal,-2.8,y,z,1.1,.12,.12);
 }
 const cabin=new T.Group();cabin.position.set(-4.55,.3,0);tower.add(cabin);
 part(cabin,floor,0,0,0,2.6,.18,2.7);
 part(cabin,metal,0,2.8,0,2.6,.14,2.7);
 part(cabin,warm,0,2.70,0,1.9,.045,1.9);
 for(const x of [-1.22,1.22])for(const z of [-1.27,1.27])part(cabin,metal,x,1.4,z,.075,2.8,.075);
 for(const z of [-1.3,1.3]){
  part(cabin,glass,0,1.4,z,2.4,2.6,.03);
  part(cabin,metal,0,.95,z,2.4,.045,.045);
 }
 part(cabin,glass,1.25,1.4,0,.03,2.6,2.5);
 const doors=[-1,1].map(side=>{
  const door=new T.Group();door.userData.side=side;cabin.add(door);
  part(door,glass,-1.27,1.35,0,.035,2.65,1.22);
  for(const edge of [-.59,.59])part(door,metal,-1.29,1.35,edge,.05,2.7,.035);
  return door;
 });
 part(tower,floor,-4.5,.15,0,5,.3,5);
 for(const z of [-2.4,2.4])part(tower,light,-5.6,.32,z,3.2,.035,.075);
 const deckRoot=new T.Group();deckRoot.position.y=skyParkDeckRise;tower.add(deckRoot);
 // Extend the existing rooftop garden with an accessible observation balcony.
 part(deckRoot,floor,1.3,28.49,0,7.8,.16,30);
 part(deckRoot,floor,-4.7,28.49,1.7,5.1,.16,9.2);
 for(const [x,z,w,d] of [[-7.2,1.7,.04,9.2],[-4.7,-2.9,5.1,.04],[-4.7,6.3,5.1,.04]]){
  part(deckRoot,glass,x,29.12,z,w,1.15,d);
  part(deckRoot,metal,x,29.73,z,w===.04?.08:w,.065,d===.04?.08:d);
  part(deckRoot,light,x,28.62,z,w===.04?.055:w,.04,d===.04?.055:d);
 }
 for(const z of [-2,1,4,5.5])part(deckRoot,metal,-7.2,29.1,z,.045,1.2,.045);
 for(const [x,z,length] of [[-2.55,-8.95,11.9],[-2.55,10.6,8.6],[5.15,0,29.8]]){
  part(deckRoot,glass,x,29.12,z,.035,1.15,length);
  part(deckRoot,metal,x,29.73,z,.08,.065,length);
 }
 for(const z of [-14.9,14.9]){
  part(deckRoot,glass,1.3,29.12,z,7.7,1.15,.035);
  part(deckRoot,metal,1.3,29.73,z,7.7,.065,.08);
 }
 const details=addSkyParkDetails(tower);
 const deckPosition=new T.Vector2(-6.15,3.5);
 let returnPath=[],returnIndex=0;
 const localEye=new T.Vector3(),localLook=new T.Vector3();
 const landingEye=new T.Vector3(),landingLook=new T.Vector3();
 const cabinEntrance=new T.Vector3(-4.9,1.9,0);
 const entrance=new T.Vector3(-12.3,1.95,5.4),lobbyStop=new T.Vector3(-9.1,1.95,6.44);
 function walkable(x,z,people=true){
  const main=x>=-2.15&&x<=4.55&&z>=-14.1&&z<=14.1;
  const balcony=x>=-6.7&&x<=-2.15&&z>=-2.4&&z<=5.75;
  if(!main&&!balcony)return false;
  if(x> -6&&x< -3.05&&z> -1.55&&z<1.55)return false;
  if(x>-2.85&&x<-2.15&&(z< -2.2||z>5.5))return false;
  for(const at of [-11,-6,-1,4,9,14])if((x-1)**2+(z-at)**2<1)return false;
  for(const at of [-8,0,8]){
   if(x>3.35&&x<4.75&&Math.abs(z-at)<1.45)return false;
   if((x-3.13)**2+(z-at)**2<.55**2)return false;
  }
  if(people&&details.deckGuests.some(({group})=>(group.position.x-x)**2+(group.position.z-z)**2<.5**2))return false;
  return true;
 }
 function walk(dx,forward,yaw,dt){
  const length=Math.hypot(dx,forward);if(!length)return;
  const bx=-.873,bz=-.488,cos=Math.cos(yaw),sin=Math.sin(yaw);
  const fx=bx*cos+bz*sin,fz=-bx*sin+bz*cos;
  const step=2.25*Math.min(dt,.05)/Math.max(1,length);
  const x=(-fz*dx+fx*forward)*step,z=(fx*dx+fz*forward)*step;
  if(walkable(deckPosition.x+x,deckPosition.y))deckPosition.x+=x;
  if(walkable(deckPosition.x,deckPosition.y+z))deckPosition.y+=z;
 }
 function scroll(horizontal,forward,yaw){
  const distance=Math.hypot(horizontal,forward);if(!distance)return;
  const count=Math.ceil(Math.min(1.2,distance)/.1),step=Math.min(1.2,distance)/count;
  for(let i=0;i<count;i++)walk(horizontal/distance,forward/distance,yaw,step/2.25);
 }
 function beginReturn(){
  // A small grid routes the return walk around planters, seating and railings.
  const width=24,height=58,count=width*height;
  const key=(x,z)=>Math.round((z+14)*2)*width+Math.round((x+7)*2);
  const xOf=i=>-7+(i%width)*.5,zOf=i=>-14+Math.floor(i/width)*.5;
  const parent=new Int32Array(count).fill(-1),queue=new Int32Array(count);
  let start=key(deckPosition.x,deckPosition.y),goal=key(-6,3.5);
  if(!walkable(xOf(start),zOf(start),false)){
   let best=Infinity;
   for(let i=0;i<count;i++)if(walkable(xOf(i),zOf(i),false)){
    const distance=(xOf(i)-deckPosition.x)**2+(zOf(i)-deckPosition.y)**2;
    if(distance<best){best=distance;start=i;}
   }
  }
  let head=0,tail=1;queue[0]=start;parent[start]=start;
  while(head<tail&&parent[goal]<0){
   const at=queue[head++];
   for(const next of [at-1,at+1,at-width,at+width]){
    if(next<0||next>=count||parent[next]>=0)continue;
    if(Math.abs(xOf(next)-xOf(at))>.51||Math.abs(zOf(next)-zOf(at))>.51)continue;
    if(!walkable(xOf(next),zOf(next),false))continue;
    parent[next]=at;queue[tail++]=next;
   }
  }
  returnPath=[];
  if(parent[goal]>=0){let at=goal;while(at!==start){returnPath.push(new T.Vector2(xOf(at),zOf(at)));at=parent[at];}returnPath.reverse();}
  returnPath.push(new T.Vector2(-6.15,3.5));returnIndex=0;
 }
 function returnToLift(dt){
  const target=returnPath[returnIndex];if(!target)return true;
  const dx=target.x-deckPosition.x,dz=target.y-deckPosition.y,distance=Math.hypot(dx,dz),step=Math.min(dt,.05)*2.8;
  if(distance<=step){deckPosition.copy(target);returnIndex++;}else{deckPosition.x+=dx/distance*step;deckPosition.y+=dz/distance*step;}
  return returnIndex>=returnPath.length;
 }
 function resetWalk(){deckPosition.set(-6.15,3.5);returnPath=[];returnIndex=0;}
 function pose(time,eye,look){
  const height=skyParkHeight(time);
  cabin.position.y=height;
  const open=1-ease((time-5.6)/.8)+ease((time-15.4)/.8);
  for(const door of doors)door.position.z=door.userData.side*(.62+open*1.18);
  localEye.set(-4.9,height+1.6,0);localLook.set(-48,height+3.5,4);
  if(time<5.6){
   if(time<3.6){
    localEye.copy(entrance).lerp(lobbyStop,ease((time-1.6)/2));
    localLook.set(-4.1,3.6,11.32);
   }else{
    const step=ease((time-3.6)/2);
    localEye.copy(lobbyStop).lerp(cabinEntrance,step);
    const angle=T.MathUtils.lerp(.69,-1.48,step);
    localLook.set(localEye.x+Math.sin(angle)*30,localEye.y+1.5,localEye.z+Math.cos(angle)*30);
   }
  }
  landingEye.set(deckPosition.x,skyParkDeckHeight+1.6,deckPosition.y);
  landingLook.set(deckPosition.x-170,30,deckPosition.y-95);
  const step=ease((time-16.2)/1.6);
  localEye.lerp(landingEye,step);localLook.lerp(landingLook,step);
  tower.updateWorldMatrix(true,false);
  eye.copy(tower.localToWorld(localEye));look.copy(tower.localToWorld(localLook));
 }
 pose(0,new T.Vector3(),new T.Vector3());
 return {pose,walk,scroll,walkable,beginReturn,returnToLift,resetWalk,tick(time){details.tick(time,deckPosition);},
  getDeckPosition(target){return target.copy(deckPosition);},
  boardingBlend(time){return ease(time/1.6);}};
}
