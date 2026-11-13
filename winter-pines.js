export function createPineGeometry(THREE,rand){
 const foliageCone=new THREE.ConeGeometry(1,1,16,3);const foliagePos=foliageCone.attributes.position;for(let i=0;i<foliagePos.count;i++){const y=foliagePos.getY(i);if(y<.49){const jitter=rand(.85,1.12);foliagePos.setX(i,foliagePos.getX(i)*jitter);foliagePos.setZ(i,foliagePos.getZ(i)*jitter);foliagePos.setY(i,y+rand(-.06,.06));}}foliageCone.computeVertexNormals();
const boughGeo=new THREE.SphereGeometry(1,8,4);
 return {foliageCone,boughGeo};
}

export function addSnowyBoughs({x,y,z,h,geometry,needles,snow,instance,rand}){
 const {foliageCone,boughGeo}=geometry;
 for(let row=0;row<11;row++){
  const t=row/10,yy=y+h*(.12+t*.79),radius=h*(.24*(1-t)+.018),depth=h*(.17-t*.055);
  instance(foliageCone,needles,x,yy,z,radius,depth,radius,0,row*.67);
  instance(foliageCone,snow,x,yy+depth*.16,z,radius*.94,depth*.91,radius*.94,0,row*.67);
  for(let j=0;j<7;j++){
   const angle=j*Math.PI*2/7+row*.61,length=radius*rand(.82,1.13);
   instance(boughGeo,snow,x+Math.cos(angle)*length*.69,yy-depth*.16,z+Math.sin(angle)*length*.69,
    length*.19,depth*.16,length*.39,.08,-angle+Math.PI/2,rand(-.1,.1));
  }
 }
}
