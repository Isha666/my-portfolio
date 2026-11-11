import {createGardenRower} from './garden-rower.js';
// Mesh-only lakeside planting, boats and conservatory pavilions.
export function createGardenLakeside(THREE,scene,routeX,routeY,terrain=()=>0){
 let seed=9021;const rand=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.84,...extra});
 const bark=mat('#71533f'),leaves=[mat('#477744'),mat('#65904e'),mat('#335f42')],pinks=[mat('#f6b7cf',{side:THREE.DoubleSide,emissive:'#b4587e',emissiveIntensity:.12}),mat('#ee89b4',{side:THREE.DoubleSide,emissive:'#b4587e',emissiveIntensity:.12}),mat('#ffdeeb',{side:THREE.DoubleSide,emissive:'#d5a9bd',emissiveIntensity:.10})],gold=mat('#b8a06a',{metalness:.55}),wood=mat('#9b693f'),trim=mat('#d2aa70'),stone=mat('#c2bea0');
 const grove=new THREE.Group();scene.add(grove);let plantingGrove=false;const dummy=new THREE.Object3D(),batches=new Map(),ball=new THREE.SphereGeometry(1,8,6);
 const petal=new THREE.BufferGeometry(),pv=[0,.025,0],pi=[];for(let i=0;i<8;i++){const a=i*Math.PI/4;pv.push(Math.cos(a)*.075,0,Math.sin(a)*.115);pi.push(0,(i+1)%8+1,i+1);}petal.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));petal.setIndex(pi);petal.computeVertexNormals();
 const hedgeGeo=new THREE.BoxGeometry(1,1,1);
 const leaf=new THREE.SphereGeometry(1,6,4);leaf.scale(.12,.035,.27);
 function instance(g,m,x,y,z,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0){const key=g.uuid+m.uuid+(plantingGrove?'grove':'lake');if(!batches.has(key))batches.set(key,{g,m,parent:plantingGrove?grove:scene,items:[]});batches.get(key).items.push([x,y,z,sx,sy,sz,rx,ry,rz]);}
 function mesh(g,m,parent=scene){const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function branch(a,b,r,m=bark,parent=plantingGrove?grove:scene){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r*.65,r,d.length(),7),m,parent);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
 function blossom(x,y,z,size=1,color=0){for(let j=0;j<5;j++){const a=j*Math.PI*.4;instance(petal,pinks[color%3],x+Math.cos(a)*.068*size,y,z+Math.sin(a)*.068*size,size,size,size,.35+Math.sin(x*3+z)*.9,a,Math.cos(z*2+y)*.8);}}
 function tree(x,z,h,cherry=true,base=0){
  if(plantingGrove)base=terrain(x,z);const lean=(rand()-.5)*h*.10;branch([x,base,z],[x+lean,base+h*.53,z],h*.033);
  for(let b=0;b<8;b++){const angle=b*2.4+rand()*.3,reach=h*(.20+rand()*.14),bx=x+Math.cos(angle)*reach,bz=z+Math.sin(angle)*reach,by=base+h*(.48+rand()*.29),joint=[x+lean,base+h*.35,z],fork=[x+Math.cos(angle)*reach*.58,by-.45,bz];branch(joint,fork,h*.014);branch(fork,[bx,by,bz],h*.008);
   for(let twig=0;twig<3;twig++){const a=angle+(twig-1)*.8,cx=bx+Math.cos(a)*h*.10,cz=bz+Math.sin(a)*h*.10,cy=by+(rand()-.5)*h*.12;branch([bx,by,bz],[cx,cy,cz],h*.0035);
    for(let k=0;k<(cherry?145:35);k++){const az=rand()*6.28,v=rand()*2-1,r=Math.cbrt(rand()),width=h*.145,xx=cx+Math.cos(az)*Math.sqrt(1-v*v)*r*width,zz=cz+Math.sin(az)*Math.sqrt(1-v*v)*r*width,yy=cy+v*r*width*.75;if(cherry)blossom(xx,yy,zz,1.15+rand()*.55,(b+twig)%3);else instance(leaf,leaves[b%3],xx,yy,zz,1.3,1.3,1.3,rand()*3,rand()*6,rand()*3);}
   }
  }
 }

 // Small distant islands leave a broad, open channel beside the bridge.
 for(const side of [-1,1])for(let i=0;i<3;i++){const z=-30-i*25+(rand()-.5)*9,x=side*(49+rand()*25),island=mesh(new THREE.SphereGeometry(1,24,12),leaves[1]);island.position.set(x,-1.2,z);island.scale.set(7,1.6,8);for(let j=0;j<3;j++)tree(x+(j-1)*4,z+(rand()-.5)*8,7+rand()*4,j%3!==1,.1);for(let j=0;j<140;j++){const a=rand()*6.28,r=rand()*6.0;const xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;instance(ball,leaves[j%3],xx,.32,zz,.45,.35,.45);for(let f=0;f<7;f++)blossom(xx+(rand()-.5)*.55,.45+rand()*.38,zz+(rand()-.5)*.55,1.4,j%3);}}
 plantingGrove=true;
 // Dense meadow ribbons across the far shore, beyond the existing path-side beds.
 const stemGeo=new THREE.CylinderGeometry(.013,.018,1,5),creamPetal=mat('#fff4da',{side:THREE.DoubleSide}),yellowPetal=mat('#efc34e',{side:THREE.DoubleSide}),centre=mat('#b18a2c');
 const violetPetal=mat('#a68bde',{side:THREE.DoubleSide}),coralPetal=mat('#ed7198',{side:THREE.DoubleSide});
 // Beds follow the actual bank elevation so flowers remain above the sloping ground.
 for(let i=0;i<14500;i++){const z=i<9000?-96-rand()*26:-122-rand()*35,x=routeX(z)+(i%2?1:-1)*(3.5+rand()*86),base=terrain(x,z)+.03,h=.35+rand()*.55;if(base<-.55)continue;instance(stemGeo,leaves[0],x,base+h/2,z,1,h,1);const pm=[yellowPetal,creamPetal,violetPetal,coralPetal,pinks[0]][Math.floor((x+100)/5+(-z)/7)%5];for(let j=0;j<7;j++){const a=j/7*6.28;instance(petal,pm,x+Math.cos(a)*.16,base+h,z+Math.sin(a)*.16,1.9,1.9,1.9,.15,a,0);}instance(ball,centre,x,base+h+.02,z,.05,.025,.05);instance(leaf,leaves[i%3],x,base+h*.45,z,1,1,1,.4,i,0);}
 // Layered rear and side groves replace the empty grass horizon.
 for(let row=0;row<2;row++)for(let i=0;i<22;i++)tree(-71+i*6.8,-134-row*15-rand()*7,9+rand()*5,(i+row)%4!==0);
 for(const side of [-1,1]){
  for(let i=0;i<6;i++)tree(routeX(-106-i*6)+side*5.6,-106-i*6,10.7+rand()*1.8,true);
  for(let i=0;i<6;i++)tree(side*(19+i*8),-111-rand()*10,8.5+rand()*4,i%3!==0);
  // Clipped hedges border the blossom avenue, with flowering shrubs beyond them.
  for(let i=0;i<50;i++){const z=-106-i*.9,x=routeX(z)+side*3.6,y=terrain(x,z);instance(hedgeGeo,leaves[0],x,y+.40,z,.65,.8,.94);}
  for(let i=0;i<125;i++){const z=-104-rand()*48,x=side*(7+rand()*53),base=terrain(x,z),r=.5+rand()*.5;instance(ball,leaves[i%3],x,base+r*.65,z,r,r*.8,r);for(let k=0;k<22;k++){const a=rand()*6.28,v=rand(),xx=x+Math.cos(a)*r*.85,zz=z+Math.sin(a)*r*.85;blossom(xx,base+r*.65+v*r*.7,zz,1.8,i%3);}}
 }
 // A light carpet of fallen blossoms extends naturally along the destination path.
 for(let i=0;i<1800;i++){const z=-105-rand()*41,x=routeX(z)+(rand()-.5)*6.5;instance(petal,pinks[i%3],x,terrain(x,z)+.025,z,.8,.8,.8,0,rand()*6,0);}

 plantingGrove=false;
 // Flowering garlands drape along both rails. Keep the centre free for the horse and chests.
 for(const side of [-1,1]){const pts=[];for(let i=0;i<=256;i++){const z=-12-i*96/256,x=routeX(z)+side*3.04,y=routeY(z)+.96-.20*Math.pow(Math.sin(i/256*32*Math.PI),2);pts.push(new THREE.Vector3(x,y,z));instance(leaf,leaves[i%3],x,y,z,1.4,1.4,1.4,.3,i*.8,.5);if(i%2===0)for(let j=0;j<3;j++)blossom(x+(rand()-.5)*.24,y+(rand()-.4)*.22,z+(rand()-.5)*.25,1.2,j);}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),256,.025,5,false),leaves[0]);}
 const boats=[];
 function boat(x,z,angle,canopy=false){const g=new THREE.Group();scene.add(g);g.position.set(x,-.68,z);g.rotation.y=angle;const verts=[],indices=[],rings=16,segments=16;for(let i=0;i<=rings;i++){const t=i/rings,zz=(t-.5)*5.6,w=Math.pow(Math.sin(Math.PI*t),.65)*1.05+.035;for(let j=0;j<=segments;j++){const a=j/segments*Math.PI;verts.push(Math.cos(a)*w,.60-Math.sin(a)*.75,zz);if(i<rings&&j<segments){const k=i*(segments+1)+j;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,new THREE.MeshStandardMaterial({color:'#956039',side:THREE.DoubleSide,roughness:.72}),g);for(const side of [-1,1]){const pts=Array.from({length:33},(_,i)=>{const t=i/32;return new THREE.Vector3(side*(Math.pow(Math.sin(Math.PI*t),.65)*1.05+.035),.61,(t-.5)*5.6);});mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.065,7,false),trim,g);}for(const zz of [-1.15,.2,1.25]){const seat=mesh(new THREE.BoxGeometry(1.75,.10,.34),wood,g);seat.position.set(0,.43,zz);}if(canopy){for(const side of [-1,1])for(const zz of [-1.25,1.25])branch([side*.8,.5,zz],[side*.8,2.3,zz],.035,gold,g);const roof=mesh(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),pinks[2],g);roof.position.y=2.25;roof.scale.set(1.2,.7,1.9);for(let j=0;j<14;j++){const a=j/14*6.28;blossom(x+Math.cos(a),1.65,z+Math.sin(a)*1.6,1.5,j);}}const rower=createGardenRower(THREE,g,boats.length);boats.push({g,x,z,angle,rower});}
 boat(-8,-41,Math.PI/2,true);boat(9,-65,Math.PI/2);boat(-10,-79,Math.PI/2);boat(24,-91,-.7,true);boat(-28,-29,.2);
 function pavilion(x,z,r){const g=new THREE.Group();g.position.set(x,.15,z);scene.add(g);const base=mesh(new THREE.CylinderGeometry(r+1,r+1.2,.35,40),stone,g);for(let i=0;i<10;i++){const a=i/10*6.28,xx=Math.cos(a)*r,zz=Math.sin(a)*r;branch([xx,0,zz],[xx,4,zz],.065,gold,g);const curve=new THREE.CatmullRomCurve3(Array.from({length:25},(_,j)=>{const t=j/24*Math.PI/2;return new THREE.Vector3(Math.cos(a)*r*Math.cos(t),4+Math.sin(t)*2.8,Math.sin(a)*r*Math.cos(t));}));mesh(new THREE.TubeGeometry(curve,28,.045,6,false),gold,g);}const dome=mesh(new THREE.SphereGeometry(r,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:'#b4dfce',metalness:.1,roughness:.12,transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false}),g);dome.position.y=4;dome.scale.y=2.8/r;for(const y of [1.0,4]){const ring=mesh(new THREE.TorusGeometry(r,.045,6,64),gold,g);ring.rotation.x=Math.PI/2;ring.position.y=y;}const finial=mesh(new THREE.SphereGeometry(.17,12,8),gold,g);finial.position.y=6.95;for(let i=0;i<40;i++){const a=i/40*6.28;blossom(x+Math.cos(a)*(r+.2),1.1,z+Math.sin(a)*(r+.2),1.6,i);}}
 pavilion(-18,-107,3.6);pavilion(58,-56,3.8);pavilion(13,-129,3.3);
 // Floating petals stay on the water surface, with a slow ripple drift.
 const floating=[];for(let i=0;i<750;i++){const z=-21-rand()*78,x=(rand()>.5?1:-1)*(4+rand()*15);floating.push([x,z]);instance(petal,pinks[i%3],x,-.64,z,.7,.7,.7,0,rand()*6,0);}
 batches.forEach(({g,m,parent,items})=>{const inst=new THREE.InstancedMesh(g,m,items.length);items.forEach((v,i)=>{dummy.position.set(v[0],v[1],v[2]);dummy.scale.set(v[3],v[4],v[5]);dummy.rotation.set(v[6],v[7],v[8]);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.castShadow=false;inst.receiveShadow=true;inst.computeBoundingSphere();parent.add(inst);});
 const drifting=new THREE.InstancedMesh(petal,pinks[1],96);scene.add(drifting);
 // The far landing is always present: perspective and the bridge crest reveal it naturally.
 return {tick(time,cameraZ=8){for(let i=0;i<96;i++){const t=(time*.045+i/96)%1,side=i%2?1:-1,z=-105-(i%9)*2.5;dummy.position.set(routeX(z)+side*(4.2-t*3.6)+Math.sin(time*.4+i)*.3,6.7-t*6.5,z+Math.sin(i*2)*2+t);dummy.rotation.set(time*.6+i,time*.35+i,i);dummy.scale.setScalar(.9);dummy.updateMatrix();drifting.setMatrixAt(i,dummy.matrix);}drifting.instanceMatrix.needsUpdate=true;boats.forEach(({g,x,z,angle,rower},i)=>{rower.tick(time);const crossing=i<3,phase=time*.075+i*2.1;g.position.set(crossing?Math.sin(phase)*30:x+Math.sin(phase)*.5,-.68+Math.sin(time*.8+i)*.035,z+Math.cos(time*.1+i)*.3);g.rotation.set(Math.sin(time*.6+i)*.018,crossing?(Math.cos(phase)>0?-Math.PI/2:Math.PI/2):angle+Math.sin(time*.13+i)*.025,Math.sin(time*.7+i)*.025);});}};
}
