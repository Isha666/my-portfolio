export function makeReefWildlife(T,scene,{preview=false}={}){
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 const ball=new T.SphereGeometry(1,22,16);
 const matte=color=>new T.MeshStandardMaterial({color,roughness:.71});
 const olive=matte('#728c64'),belly=matte('#b5aa72'),shell=matte('#66513b'),seam=matte('#a39961'),ink=matte('#18201c');
 function oval(parent,mat,x,y,z,sx,sy,sz){
  const m=new T.Mesh(ball,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;
 }
 function line(parent,mat,points,r){
  const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,r,7,false),mat);parent.add(m);return m;
 }
 function makeTurtle(size){
  const turtle=new T.Group();scene.add(turtle);
  oval(turtle,belly,0,-.14,0,.61,.20,.84);
  oval(turtle,shell,0,.05,0,.66,.37,.88);
  oval(turtle,olive,0,-.10,.76,.15,.13,.25);
  oval(turtle,olive,0,-.05,.99,.195,.17,.25);
  oval(turtle,belly,0,-.105,1.16,.145,.09,.14);
  oval(turtle,olive,0,-.18,-.83,.09,.06,.19);
  const flippers=[];
  for(const side of [-1,1]){
   oval(turtle,ink,side*.165,-.016,1.075,.045,.035,.037);
   for(const front of [true,false]){
    const pivot=new T.Group();pivot.position.set(side*(front?.46:.42),-.15,front?.41:-.59);turtle.add(pivot);
    oval(pivot,olive,side*(front?.38:.22),0,-.12,front?.50:.28,.067,front?.18:.12).rotation.y=side*.47;
    flippers.push({pivot,side,front});
   }
  }
  for(let k=-2;k<=2;k++){
   const z=k*.265,pts=[];
   for(let j=0;j<=14;j++){
    const x=(j/14-.5)*1.23,y=.05+.376*Math.sqrt(Math.max(.005,1-(x/.66)**2-(z/.88)**2));
    pts.push(V(x,y,z+.032*Math.cos(x*9)));
   }
   line(turtle,seam,pts,.012);
  }
  for(const side of [-1,1]){
   const pts=[];
   for(let j=0;j<=12;j++){
    const z=(j/12-.5)*1.57,x=side*(.17+.048*Math.cos(j*Math.PI));
    pts.push(V(x,.05+.38*Math.sqrt(Math.max(.005,1-(x/.66)**2-(z/.88)**2)),z));
   }
   line(turtle,seam,pts,.012);
  }
  turtle.scale.setScalar(size);
  return {turtle,flippers};
 }
 const routes=[
  {x:0,y:2.05,z:-7,width:3.8,depth:2.4,speed:.28,phase:0,size:1.20},
  {x:-7,y:1.25,z:-13,width:8.5,depth:6,speed:.15,phase:1.8,size:.91},
  {x:9,y:3.2,z:-18,width:10,depth:7,speed:.12,phase:3.5,size:1.06},
  {x:-1,y:.4,z:4,width:10,depth:5,speed:.16,phase:4.6,size:.76},
  {x:-24,y:2.2,z:-34,width:4.5,depth:6,speed:.18,phase:1.1,size:1.02},
  {x:24,y:1.65,z:-35,width:4.1,depth:5,speed:.19,phase:2.6,size:.86},
  {x:-24,y:2.7,z:14,width:4.5,depth:5,speed:.16,phase:4.1,size:1.09},
  {x:24,y:1.2,z:13,width:4,depth:5,speed:.14,phase:5.2,size:.93}
 ];
 const homeRoute={x:-3.8,y:.95,z:-15,width:3.1,depth:2.2,speed:.24,phase:1.2,size:.83};
 const turtles=(preview?[homeRoute]:routes).map(route=>({...route,...makeTurtle(route.size)}));
 const horses=[];
 const horseColors=['#e2a765','#bc7c99','#77aca9'];
 const horsePositions=[
  [-11,-7],[-8,-15],[8,-10],[13,-18],[-16,-22],[15,7],
  [-26,-35],[-21,-38],[25,-35],[21,-39],[-25,13],[-22,16],[24,13],[27,17]
 ];
 horsePositions.forEach(([x,z],i)=>{
  const g=new T.Group();scene.add(g);
  const skin=matte(horseColors[i%3]),finMat=matte('#e1bf9c');
  oval(g,skin,0,0,0,.139,.255,.17);
  oval(g,skin,0,.216,-.028,.092,.19,.105).rotation.x=-.23;
  oval(g,skin,0,.38,.045,.105,.118,.135);
  oval(g,skin,0,.349,.159,.055,.051,.122);
  oval(g,skin,0,.493,.004,.042,.078,.040);
  for(const side of [-1,1])oval(g,ink,side*.087,.411,.099,.026,.026,.024);
  const fin=oval(g,finMat,0,.055,-.163,.036,.15,.104);
  const curl=new T.CatmullRomCurve3(Array.from({length:33},(_,j)=>{
   const t=j/32,a=t*Math.PI*2.16,r=.17*(1-t*.76);
   return V(0,-.39+Math.cos(a)*r,-.09+Math.sin(a)*r);
  }));
  const tube=new T.TubeGeometry(curl,32,.062,9,false),p=tube.attributes.position;
  for(let row=0;row<=32;row++){
   const t=row/32,c=curl.getPointAt(t),r=1-.87*t;
   for(let j=0;j<=9;j++){const n=row*10+j;p.setXYZ(n,c.x+(p.getX(n)-c.x)*r,c.y+(p.getY(n)-c.y)*r,c.z+(p.getZ(n)-c.z)*r);}
  }
  tube.computeVertexNormals();g.add(new T.Mesh(tube,skin));
  horses.push({g,fin,x,z,phase:i*2.4});
 });
 return t=>{
  turtles.forEach(({turtle,flippers,x,y,z,width,depth,speed,phase})=>{
   const angle=t*speed+phase,stroke=t*2.7+phase;
   turtle.position.set(x+Math.sin(angle)*width,y+Math.sin(t*.69+phase)*.39,z+Math.cos(angle)*depth);
   turtle.rotation.set(Math.sin(t*.69+phase)*.09,Math.atan2(width*Math.cos(angle),-depth*Math.sin(angle)),Math.sin(angle)*.12);
   flippers.forEach(({pivot,side,front})=>{
    pivot.rotation.z=side*Math.sin(stroke+(front?0:1.15))*(front?.56:.22);
    pivot.rotation.y=side*Math.cos(stroke)*.18;
   });
  });
  horses.forEach(({g,fin,x,z,phase})=>{
   const a=t*.53+phase;g.position.set(x+Math.cos(a)*.61,-2.25+Math.sin(a*1.6)*.34,z+Math.sin(a)*.55);
   g.rotation.set(.08*Math.sin(a),a+.6,.10*Math.cos(a*1.2));fin.rotation.y=.46*Math.sin(t*15+phase);
  });
 };
}
