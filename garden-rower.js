export function createGardenRower(THREE,boat,index=0){
 const group=new THREE.Group();boat.add(group);
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9});
 const skin=material(['#bd8967','#80553d','#dfb18a'][index%3]),shirt=material(['#b76e78','#537c93','#d3bd83','#7c7f9a','#6e9183'][index%5]),pants=material('#354651'),hair=material('#3a2b25'),hat=material('#c8ae77'),shaftMat=material('#be9767');
 function part(geo,mat,x,y,z,sx=1,sy=sx,sz=sx,parent=group){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
 const sphere=new THREE.SphereGeometry(1,12,9),axis=new THREE.Vector3(0,1,0);
 function segment(mat,r){return part(new THREE.CylinderGeometry(r,r,1,8),mat,0,0,0);}
 function fit(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(axis,d.clone().normalize());o.scale.set(1,d.length(),1);}
 const torso=new THREE.Group();torso.position.set(0,.68,.2);group.add(torso);part(sphere,shirt,0,.32,0,.23,.34,.16,torso);part(sphere,skin,0,.69,0,.085,.10,.08,torso);part(sphere,skin,0,.88,0,.135,.18,.14,torso);part(sphere,hair,0,.98,-.025,.14,.105,.14,torso);part(new THREE.CylinderGeometry(.23,.23,.035,20),hat,0,1.04,0,1,1,1,torso);part(new THREE.CylinderGeometry(.13,.15,.12,20),hat,0,1.10,0,1,1,1,torso);
 for(const side of [-1,1]){const thigh=segment(pants,.09),shin=segment(pants,.065);fit(thigh,new THREE.Vector3(side*.13,.70,.15),new THREE.Vector3(side*.18,.46,.72));fit(shin,new THREE.Vector3(side*.18,.46,.72),new THREE.Vector3(side*.18,.20,.86));part(sphere,hair,side*.18,.18,.96,.085,.06,.17);}
 const arms=[],oars=[];
 for(const side of [-1,1]){const pivot=new THREE.Group();pivot.position.set(side*.88,.70,.3);group.add(pivot);const shaft=part(new THREE.CylinderGeometry(.028,.028,2.9,9),shaftMat,side*.8,0,0,1,1,1,pivot);shaft.rotation.z=Math.PI/2;part(sphere,shaftMat,side*2.05,0,0,.45,.045,.15,pivot);const upper=segment(shirt,.065),fore=segment(skin,.046),hand=part(sphere,skin,0,0,0,.055,.055,.055);arms.push({side,upper,fore,hand});oars.push(pivot);}
 return {tick(time){const t=time*1.65+index*.8,stroke=Math.sin(t);torso.rotation.x=stroke*.10;for(let i=0;i<2;i++){const {side,upper,fore,hand}=arms[i],pivot=oars[i];pivot.rotation.set(0,side*stroke*.46,side*(-.16+Math.max(0,Math.cos(t))*.23));pivot.updateMatrix();const grip=new THREE.Vector3(-side*.55,0,0).applyMatrix4(pivot.matrix),shoulder=new THREE.Vector3(side*.20,1.17,.2+stroke*.04),elbow=shoulder.clone().lerp(grip,.55);elbow.x+=side*.10;elbow.y-=.13;fit(upper,shoulder,elbow);fit(fore,elbow,grip);hand.position.copy(grip);}}};
}
