// Place blossom clusters along independently curved limbs, leaving gaps between crowns.
export function growGardenTree(THREE,x,y,z,height,rand,branch,cluster){
 const point=(dx,dy,dz)=>new THREE.Vector3(x+dx*height,y+dy*height,z+dz*height);
 const compass=rand()*Math.PI*2,lean=.06+rand()*.12;
 const foot=point(0,-.016,0),knee=point(-Math.cos(compass)*.04,.22,-Math.sin(compass)*.04);
 const fork=point(Math.cos(compass)*lean,.46,Math.sin(compass)*lean);
 branch(foot,knee,.039*height);branch(knee,fork,.032*height);
 for(let i=0;i<4;i++){
  const a=compass+i*1.57+(rand()-.5)*.4;
  branch(point(Math.cos(a)*.085,.004,Math.sin(a)*.085),point(0,.13,0),.018*height);
 }
 const limbs=5+Math.floor(rand()*3);
 for(let i=0;i<limbs;i++){
  const angle=compass+i*2.39996+(rand()-.5)*.84;
  const reach=.23+rand()*.37, high=.49+rand()*.38;
  const start=knee.clone().lerp(fork,.27+rand()*.73);
  const middle=point(Math.cos(angle)*reach*.55,high-.11,Math.sin(angle)*reach*.55);
  const tip=point(Math.cos(angle+.13)*reach,high-.01,Math.sin(angle+.13)*reach);
  const radius=height*(.011+rand()*.01);
  branch(start,middle,radius);
  branch(middle,tip,radius*.59);
  for(let j=0;j<3;j++){
   const theta=angle+(j-1)*(.65+rand()*.35),scale=.085+rand()*.13;
   const start=middle.clone().lerp(tip,.23+j*.30);
   const end=start.clone().addScaledVector(new THREE.Vector3(Math.cos(theta),rand()*.65-.32,Math.sin(theta)),scale*height);
   branch(start,end,radius*.27);
   cluster(end,height*(.084+rand()*.095),theta,i);
  }
 }
}
