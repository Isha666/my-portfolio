import * as T from './vendor/three.module.js';

export const skyParkDuration=10.8;
const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const t=clamp(value);return clamp(t*t*t*(10+t*(-15+6*t)));};
export function skyParkHeight(time){return .3+28.25*ease((time-2.4)/6);}
export function skyParkStatus(time,descending=false){
 if(time>=skyParkDuration)return 'SkyPark observation deck · Drag to look around';
 if(time<1.6)return descending?'Returning to your car':'Entering the SkyPark glass elevator';
 if(time<2.4)return descending?'Lobby · doors opening':'Elevator doors closing';
 if(time<8.4)return `${descending?'Descending':'Ascending'} · Floor ${Math.max(1,Math.ceil(skyParkHeight(time)/2.38))} / 12`;
 if(time<9.2)return descending?'Elevator doors closing':'Observation deck · doors opening';
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
 for(const z of [-12.35,-9.65]){
  part(tower,metal,-3.25,14.8,z,.14,29.6,.14);
  for(const y of [2,9,16,23,28.5])part(tower,metal,-2.8,y,z,1.1,.12,.12);
 }
 const cabin=new T.Group();cabin.position.set(-4.55,.3,-11);tower.add(cabin);
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
 part(tower,floor,-4.5,.15,-11,5,.3,5);
 for(const z of [-13.4,-8.6])part(tower,light,-5.6,.32,z,3.2,.035,.075);
 // Extend the existing rooftop garden with an accessible observation balcony.
 part(tower,floor,1.3,28.49,0,7.8,.16,30);
 part(tower,floor,-4.7,28.49,-9.3,5.1,.16,9.2);
 for(const [x,z,w,d] of [[-7.2,-9.3,.04,9.2],[-4.7,-13.9,5.1,.04],[-4.7,-4.7,5.1,.04]]){
  part(tower,glass,x,29.12,z,w,1.15,d);
  part(tower,metal,x,29.73,z,w===.04?.08:w,.065,d===.04?.08:d);
  part(tower,light,x,28.62,z,w===.04?.055:w,.04,d===.04?.055:d);
 }
 for(const z of [-13,-10,-7,-5.5])part(tower,metal,-7.2,29.1,z,.045,1.2,.045);
 for(const x of [-2.55,5.15]){
  part(tower,glass,x,29.12,4,.035,1.15,21.8);
  part(tower,metal,x,29.73,4,.08,.065,21.8);
 }
 const localEye=new T.Vector3(),localLook=new T.Vector3();
 const landingEye=new T.Vector3(-6.15,30.15,-7.5),landingLook=new T.Vector3(-50,25,-32);
 function pose(time,eye,look){
  const height=skyParkHeight(time);
  cabin.position.y=height;
  const open=1-ease((time-1.6)/.8)+ease((time-8.4)/.8);
  for(const door of doors)door.position.z=door.userData.side*(.62+open*1.18);
  localEye.set(-4.9,height+1.6,-11);
  localLook.set(-48,height+3.5,-30);
  const step=ease((time-9.2)/1.6);
  localEye.lerp(landingEye,step);localLook.lerp(landingLook,step);
  tower.updateWorldMatrix(true,false);
  eye.copy(tower.localToWorld(localEye));look.copy(tower.localToWorld(localLook));
 }
 pose(0,new T.Vector3(),new T.Vector3());
 return {pose,boardingBlend(time){return ease(time/1.6);}};
}
