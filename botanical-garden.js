import {growGardenTree} from './garden-tree-form.js';
import {addGardenBreeze} from './garden-breeze.js';
import {createGardenButterflies} from './garden-butterflies.js';
import {organicGeometry} from './garden-plant-geometry.js?v=rounded-1';
import {createGardenLakeside} from './garden-lakeside.js?v=discard-build-1';
import {createGardenBridge} from './garden-bridge.js?v=teal-1';
import {createProjectTreasures} from './project-treasures.js?v=scene-lifetime-1';
import {createGardenCarriage} from './garden-carriage.js?v=route-heading-1';
export function createBotanicalGarden(THREE,camera,onGardenChime){
 let seed=427;const rnd=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646},rand=(a,b)=>a+(b-a)*rnd();
 const scene=new THREE.Scene();scene.background=new THREE.Color('#a9d7e8');scene.fog=new THREE.FogExp2('#d3ddce',.0065);
 scene.add(new THREE.HemisphereLight('#e6f1ff','#34502a',1.5));const sun=new THREE.DirectionalLight('#ffe6b2',2.7);sun.position.set(-24,35,12);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-34,right:34,top:40,bottom:-85,near:.1,far:160});sun.target.position.set(0,0,-30);scene.add(sun,sun.target);sun.shadow.normalBias=.04;
 const sky=new THREE.Mesh(new THREE.SphereGeometry(190,40,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vDir;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec3 d=normalize(vDir);float h=max(d.y,0.);vec3 col=mix(vec3(.85,.89,.75),vec3(.35,.67,.86),pow(h,.55));vec2 uv=d.xz/(max(.13,d.y))*1.6;float n=noise(uv)*.55+noise(uv*2.)*.26+noise(uv*4.)*.13+noise(uv*8.)*.06;float cloud=smoothstep(.49,.72,n)*smoothstep(.04,.22,d.y);col=mix(col,vec3(1.,.97,.89),cloud*.85);float sun=pow(max(0.,dot(d,normalize(vec3(-.6,.5,.3)))),90.);col+=vec3(.3,.22,.10)*sun;gl_FragColor=vec4(col,1.);}` }));sky.position.z=-40;scene.add(sky);
 // All botanical forms below are volumetric meshes, without image cutouts.
 const botanicalMat=c=>new THREE.MeshStandardMaterial({color:c,side:THREE.DoubleSide,roughness:.72});
 const flowerMats=['#d72e59','#fff8e7','#ef80b3','#9c86dd'].map(botanicalMat),leafMat=botanicalMat('#477e39'),blossomMat=botanicalMat('#f8c0d2'),fernMat=botanicalMat('#3c7136'),grassMat=botanicalMat('#638e3c');
 const sunflowerMat=botanicalMat('#f3bd32'),sunflowerShade=botanicalMat('#e49a20'),seedMat=botanicalMat('#503723'),pollenMat=botanicalMat('#e4ab30');

 const petalGeometry=organicGeometry(THREE,'petal',true),roseGeometry=organicGeometry(THREE,'rose',true),leafGeometry=organicGeometry(THREE,'leaf',true);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.95});const bark=mat('#75664d'),stone=mat('#c9b99a'),wood=mat('#7d674e'),green=mat('#3d6234');
 const ball=new THREE.SphereGeometry(1,12,8),cube=new THREE.BoxGeometry(1,1,1),card=leafGeometry,dummy=new THREE.Object3D();
 const breeze={value:0},reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const material of [leafMat,fernMat,grassMat])addGardenBreeze(material,breeze,.028,.038);
 for(const material of [blossomMat,...flowerMats,sunflowerMat,sunflowerShade,seedMat,pollenMat])addGardenBreeze(material,breeze,.019,.023);
 const branchWood=bark.clone();addGardenBreeze(branchWood,breeze,.014);
 const archLeaves=leafMat.clone();addGardenBreeze(archLeaves,breeze,.004,.006);
 const archFlowers=[flowerMats[2],flowerMats[1],flowerMats[0],sunflowerMat,flowerMats[3]].map(material=>material.clone());
 archFlowers.push(...['#a62446','#fff1dc','#a38bbe'].map(botanicalMat));
 for(const material of archFlowers)addGardenBreeze(material,breeze,.003,.004);
 const canopyTones=['#315f32','#507e37','#8dad49','#395c46','#6a9539','#b4bd52'].map(botanicalMat);
 const autumnTones=['#986479','#bf8262','#d7a73d','#e9c859','#ba6952','#c48b94'].map(botanicalMat);
 for(const material of [...canopyTones,...autumnTones]){
  material.vertexColors=true;
  addGardenBreeze(material,breeze,.033,.067);
 }
 const canopyLeaf=organicGeometry(THREE,'leaf',true);
 const leafUv=canopyLeaf.getAttribute('uv'),leafColors=[];
 const leafPosition=canopyLeaf.getAttribute('position');
 for(let i=0;i<leafUv.count;i++){
  const u=Math.abs(2*leafUv.getX(i)-1),t=leafUv.getY(i);
  // Raised midrib and shallow blade curvature keep the edge paper-thin.
  leafPosition.setZ(i,leafPosition.getZ(i)*.36+.05*(1-u)*Math.sin(t*Math.PI));
  const shade=.78+.14*(1-u)+.14*t;
  leafColors.push(shade,shade,shade*.95);
 }
 canopyLeaf.setAttribute('color',new THREE.Float32BufferAttribute(leafColors,3));
 canopyLeaf.computeVertexNormals();
 const limbGeometry=new THREE.CylinderGeometry(.63,1,1,7);
 const limbRotation=new THREE.Quaternion(),limbEuler=new THREE.Euler(),limbAxis=new THREE.Vector3(0,1,0);
 function treeLimb(a,b,r){
  const axis=b.clone().sub(a),length=axis.length(),center=a.clone().lerp(b,.5);
  limbEuler.setFromQuaternion(limbRotation.setFromUnitVectors(limbAxis,axis.normalize()));
  item(limbGeometry,r<.065?branchWood:bark,center.x,center.y,center.z,r,length,r,limbEuler.x,limbEuler.y,limbEuler.z);
 }
 const batches=new Map(),growing=[],pocketBatches=[],bloomPockets=[];function item(geo,m,x,y,z,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0,bloom=false,tilt=0,pocket=null,rootY=y){const tile=Math.floor(z/24);const key=geo.uuid+m.uuid+tile+(pocket?'pocket':bloom==='openPetal'?'open':bloom?'grow':'static');if(!batches.has(key))batches.set(key,{geo,m,items:[],bloom,pocketed:Boolean(pocket)});batches.get(key).items.push({x,y,z,sx,sy,sz,rx,ry,rz,tilt,mode:bloom,pocket,rootY});}
 function mesh(geo,m,x,y,z){const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=a.receiveShadow=true;scene.add(a);return a;}
 function beam(a,b,r,m=bark){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(r*.7,r,d.length(),9),m,0,0,0);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
 const pathX=z=>Math.sin(-z*.055)*2.1;const routeX=pathX,routeY=z=>{const d=-z;return 2.8*THREE.MathUtils.smoothstep(d,13,28)*(1-THREE.MathUtils.smoothstep(d,88,106));};const terrain=(x,z)=>{const depth=THREE.MathUtils.smoothstep(-z,18,25)*(1-THREE.MathUtils.smoothstep(-z,95,104));return -.16+Math.sin(x*.24+z*.11)*.09+Math.max(0,Math.abs(x-pathX(z))-5)*.035-depth*4.5;};
 const groundGeo=new THREE.PlaneGeometry(230,250,110,110);groundGeo.rotateX(-Math.PI/2);const gp=groundGeo.attributes.position;for(let i=0;i<gp.count;i++)gp.setY(i,terrain(gp.getX(i),gp.getZ(i)-40));groundGeo.computeVertexNormals();const groundMat=mat('#476c34');mesh(groundGeo,groundMat,0,0,-40);
 const onBranch=(x,z)=>z<-14&&z>-106&&Math.abs(x)<42;
 // Broken flagstones with narrow moss-filled seams.
 for(let row=0;row<166;row++){const z=14-row*.94;if(z<-12&&z>-108)continue;for(let j=0;j<4;j++)item(cube,stone,pathX(z)+(j-1.5)*.85+rand(-.07,.07),-.05+rand(0,.018),z,rand(.77,.82),.07,rand(.80,.9),0,rand(-.07,.07));}
 const bridge=createGardenBridge(THREE,scene,routeX,routeY);const lakeside=createGardenLakeside(THREE,scene,routeX,routeY,terrain,breeze);
 function flower(x,y,z,type,size=1,pocket=null){if(onBranch(x,z)&&y<2.5)return;const rose=type===0,sunflower=type===4,tilt=sunflower?.85:.2;if(sunflower)size*=.82;const layers=rose?6:sunflower?2:1,n=rose?9:sunflower?18:12;const length=(sunflower?.23:rose?.22:.15)*size;const h=(sunflower?1.35:rand(.40,.78))*size;const opens=pocket||Math.sin(x*19+z*5.21)<-.08;const growingPlant=pocket?.grow?pocket:null;item(cube,green,x,y+h/2,z,.022*size,h,.022*size,0,0,0,growingPlant?'stalk':false,0,growingPlant,y);for(const side of [-1,1])item(card,leafMat,x,y+h*.4,z,.16*size,.28*size,.30,-.6,side*.7,side*.8,growingPlant?'stalk':false,0,growingPlant,y);const fy=y+h;for(let layer=0;layer<layers;layer++)for(let j=0;j<n;j++){const angle=j/n*Math.PI*2+layer*.4;const len=length*(1-layer*(rose?.10:.08));item(rose?roseGeometry:petalGeometry,sunflower?(layer?sunflowerShade:sunflowerMat):rose?(Math.sin(x*3+z)>.4?flowerMats[2]:flowerMats[0]):flowerMats[type%4],x,fy+layer*(rose?.007:.025),z,len*(rose?1.25:.55),len, len,rose?1.4-layer*.16:1.55,angle,0,opens?'petal':'openPetal',tilt,pocket,y);}if(!rose){item(ball,sunflower?seedMat:pollenMat,x,fy+.02,z,sunflower?.14*size:.065*size,.045*size,sunflower?.14*size:.065*size,tilt,0,0,opens?'head':false,0,pocket,y);if(sunflower)for(let i=0;i<55;i++){const a=i*2.39996,r=.125*Math.sqrt(i/55)*size;item(ball,i%2?pollenMat:seedMat,x+Math.cos(a)*r,fy+.045+Math.sin(a)*r*Math.sin(tilt),z+Math.sin(a)*r*Math.cos(tilt),.009*size,.009*size,.009*size,0,0,0,opens?'head':false,0,pocket,y);}}}
 for(let i=0;i<1130;i++){const z=rand(-139,16),x=pathX(z)+(i%2?1:-1)*rand(2.1,12),y=terrain(x,z);if(onBranch(x,z))continue;flower(x,y,z,i%7===0?4:i%4,rand(.75,1.05));for(let j=0;j<6;j++){const a=j*1.05;item(card,j%3?leafMat:fernMat,x+Math.cos(a)*.2,y+.15,z+Math.sin(a)*.2,.32,.42,.5,-.6,a,j*.2);} }
 // Dense colour ribbons and taller back borders enclose the approach to the lake.
 for(let i=0;i<1980;i++){const z=rand(-13,18),side=i%2?1:-1,offset=rand(2.35,9.4),x=pathX(z)+side*offset,y=terrain(x,z),band=Math.floor((z+18)/4)+Math.floor(offset/1.7);flower(x,y,z,[0,2,1,3,4,2][band%6],rand(.72,1.05));for(let j=0;j<3;j++)item(card,leafMat,x+rand(-.15,.15),y+.10,z+rand(-.15,.15),.16,.32,.3,-.5,rnd()*6,.4);}
 for(const side of [-1,1])for(let i=0;i<100;i++){const z=18-i*.32,x=pathX(z)+side*9.2;item(ball,green,x,terrain(x,z)+.5,z,.65,.60,.46);}
 // Flower boxes soften the bridge rails without blocking the chest stops.
 for(let i=0;i<15;i++){const z=-31-i*3.5,x=routeX(z)+(i%2?1:-1)*2.85,y=routeY(z);item(cube,wood,x,y+.24,z,.40,.38,1.1);for(let j=0;j<7;j++)flower(x+rand(-.12,.12),y+.44,z+(j-3)*.13,[0,1,2,3][j%4],.7);}
 // Dedicated rose borders place the layered flowers right alongside the carriage.
 for(let i=0;i<190;i++){const z=12-i*.65,x=pathX(z)+(i%2?1:-1)*(2.17+rand(0,.33));flower(x,terrain(x,z),z,[0,1,2,3,0,1,4][i%7],rand(.75,1.05));}
 // Distinct pockets of pink buds and sunflowers open at different points on the approach.
 const pocketPositions=[6.4,4.6,2.7,.8,-1,-2.8,-4.7,-6.5,-8.3,-10.1,-12.1];
 for(const [index,z] of pocketPositions.entries()){
  const side=index%2?1:-1,pocket={z,amount:0,grow:true};
  bloomPockets.push(pocket);
  for(let j=0;j<4;j++){
   const zz=z+(j-1.5)*.42,x=pathX(zz)+side*(2.14+(j%2)*.35);
   const type=j%3===index%3?4:j%2===0?0:2;
   flower(x,terrain(x,zz),zz,type,.79+j*.064,pocket);
  }
 }
 // Tapered grass blades and divided fern fronds fill the flower beds.
 for(let i=0;i<6500;i++){const z=rand(-139,16),x=pathX(z)+(i%2?1:-1)*rand(2.0,22),y=terrain(x,z);if(onBranch(x,z))continue;item(card,grassMat,x,y,z,.045,rand(.2,.55),.2,rand(-.3,.3),rnd()*6.28,rand(-.25,.25));}
 // Dense, layered foliage planes create natural canopy silhouettes.
 function tree(x,z,h,cherry=false,banyan=false,accent=null){
  if(z<-20&&z>-102&&Math.abs(x)<42)return;
  const fullCrown=accent==='autumn-overhang',autumn=fullCrown||accent==='autumn';
  const base=terrain(x,z),tones=autumn?autumnTones:canopyTones;
  const spread=point=>new THREE.Vector3(x+(point.x-x)*1.27,base+(point.y-base)*.79,z+(point.z-z)*1.27);
  const limbs=banyan?(a,b,r)=>treeLimb(spread(a),spread(b),r*1.27):treeLimb;
  growGardenTree(THREE,x,base,z,h,rnd,limbs,(center,width,angle,limb)=>{
   if(banyan){
    center=spread(center);width*=1.22;
    if(limb%2===0){
     const end=center.clone().add(new THREE.Vector3(.06,-h*(.13+rnd()*.29),.07));
     end.y=Math.max(terrain(end.x,end.z)+.12,end.y);
     treeLimb(center,end,.017+ rnd()*.014);
    }
   }
   const sprayCount=fullCrown?9:7,leavesPerSpray=16;
   const sprays=cherry?[]:Array.from({length:sprayCount},(_,i)=>{
    const direction=angle+(i-(sprayCount-1)/2)*.42;
    const tip=center.clone().add(new THREE.Vector3(Math.cos(direction)*width*.91,(i%3-1)*width*.38,Math.sin(direction)*width*.91));
    treeLimb(center,tip,.014);
    return {tip,direction};
   });
   for(let k=0;k<(cherry?72:sprayCount*leavesPerSpray);k++){
    const az=rnd()*6.28,r=Math.sqrt(rnd())*width;
    const xx=center.x+Math.cos(az)*r,zz=center.z+Math.sin(az)*r;
    const yy=center.y+rand(-.52,.52)*width;
    if(!cherry||k%9===0){
     const spray=cherry?null:sprays[k%sprays.length];
     const leafBase=spray?center.clone().lerp(spray.tip,.22+.78*(Math.floor(k/sprayCount))/(leavesPerSpray-1)):new THREE.Vector3(xx,yy,zz);
     const side=(k+Math.floor(k/sprayCount))%2?1:-1;
     item(canopyLeaf,tones[(limb+(k%5===0?2:0)+(banyan?1:0)+Math.floor(k/(sprayCount*4)))%tones.length],
      leafBase.x,leafBase.y,leafBase.z,rand(.22,.34)*(fullCrown?1.18:1),rand(.24,.39)*(fullCrown?1.14:1),.29,
      .70+rand(-.46,.46),(spray?.direction??angle)+rand(-.65,.65),side*(.55+rand(0,.54)));
    }
    if(cherry||(accent==='flowering'&&k%4===0)){
     const size=rand(.10,.18),rotation=rand(0,6.28);
     const material=limb%3===0?flowerMats[1]:blossomMat;
     const spray=cherry?null:sprays[k%sprays.length];
     const bloomCenter=spray?center.clone().lerp(spray.tip,.38+.62*(Math.floor(k/sprayCount))/(leavesPerSpray-1)):new THREE.Vector3(xx,yy,zz);
     for(let p=0;p<5;p++)item(petalGeometry,material,bloomCenter.x,bloomCenter.y,bloomCenter.z,size,size,size,1.16,rotation+p*1.256,0,'openPetal',.52+Math.sin(xx+zz)*.35);
    }
   }
  });
 }
 for(let i=0;i<38;i++)tree((i%2?1:-1)*rand(7.5,30),rand(-110,12),rand(6.5,10),i%3===0);
 // Near-canopy boughs frame the entry and the cherry swing.
 tree(-10.5,1,8,false,true);tree(8,-15,9,false,false,'autumn');
 tree(9.3,3.5,8.2,false,true);tree(-6.4,-10.3,10.3,false,false,'autumn-overhang');tree(9,-10,9.6,false,false,'flowering');
 // Roses sit in overlapping clusters, with secondary colors grouped in small sprays.
 for(const [index,z] of [12,4,-4,-11,-112].entries()){
  const cx=pathX(z),base=terrain(cx,z),main=archFlowers[index===2?5:index%4];
  const accent=index===2?archFlowers[6]:index===3?archFlowers[7]:main;
  function cluster(x,y,depth,i){
   const mixed=i%17===5||i%17===6;
   const color=mixed?accent:index===2&&i%6===0?archFlowers[0]:main;
   const size=rand(.14,.20)*(mixed?.85:1);
   const phase=rand(0,Math.PI*2),tilt=rand(.88,1.37);
   item(card,archLeaves,x+rand(-.13,.13),y,depth-.08,.24,.35,.31,rand(-1,1),phase,rand(-1,1));
   for(let layer=0;layer<3;layer++){
    const len=size*(1-layer*.18);
    for(let petal=0;petal<7;petal++){
     item(roseGeometry,color,x,y+layer*.017,depth,len,len,len,1.44-layer*.23,phase+petal*.898+layer*.27,0,
      i%19===0?'archPetal':'openPetal',tilt);
    }
   }
  }
  for(const side of [-1,1]){
   beam([cx+side*2.8,base,z],[cx+side*2.8,base+3.1,z],.065,wood);
   for(let i=0;i<32;i++)for(let row=0;row<3;row++){
    const y=base+.13+i*.098+rand(-.07,.07);
    cluster(cx+side*(2.8+(row-1)*.16)+rand(-.10,.10),y,z+rand(-.22,.28),i+row*3);
   }
  }
  const curve=new THREE.CatmullRomCurve3(Array.from({length:41},(_,i)=>{
   const a=i*Math.PI/40;
   return new THREE.Vector3(cx+Math.cos(a)*2.8,base+3.1+Math.sin(a)*2.2,z);
  }));
  mesh(new THREE.TubeGeometry(curve,48,.065,8,false),wood,0,0,0);
  for(let i=0;i<76;i++)for(let row=0;row<3;row++){
   const a=(i+.5)*Math.PI/76,r=(row-1)*.17;
   cluster(cx+Math.cos(a)*(2.8+r)+rand(-.10,.10),
    base+3.1+Math.sin(a)*(2.2+r)+rand(-.10,.10),z+rand(-.24,.29),i+row*4);
  }
 }
 // Swing ropes meet a visible branch; planked seat and climbing ivy move together.
 const sx=-3.4,sz=-17;tree(sx-2.8,sz-1,8,true);beam([sx-2,5.8,sz],[sx+1.5,5.8,sz],.13);const swing=new THREE.Group();swing.position.set(sx,5.65,sz);scene.add(swing);const ropeMat=mat('#c8b794');for(const x of [-.9,.9]){const rope=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,4.3,9),ropeMat);rope.position.set(x,-2.15,0);swing.add(rope);for(let j=0;j<9;j++){const ivy=new THREE.Mesh(card,leafMat);ivy.position.set(x+Math.sin(j)*.06,-j*.42-.3,.02);ivy.scale.setScalar(.23);swing.add(ivy);}}for(let j=0;j<4;j++){const seat=new THREE.Mesh(new THREE.BoxGeometry(2.15,.12,.19),wood);seat.position.set(0,-4.3,(j-1.5)*.20);swing.add(seat);}for(let i=0;i<180;i++)item(card,flowerMats[2],sx+rand(-2.6,2.6),.008,sz+rand(-2.5,2.5),.12,.12,1,-Math.PI/2,0,rnd()*6);
 const secondSwing=swing.clone();secondSwing.position.set(-5.5,5.65,-115);scene.add(secondSwing);tree(-8.3,-116,8,true);beam([-8.3,5.8,-115],[-4.4,5.8,-115],.13);
 // Textured glasshouse behind the flowers.
 const glass=new THREE.MeshPhysicalMaterial({color:'#d7eee0',transparent:true,opacity:.20,roughness:.1,side:THREE.DoubleSide,depthWrite:false});const frame=mat('#526252'),gx=7,gz=-119;mesh(new THREE.BoxGeometry(7,4.6,9),glass,gx,2.3,gz);for(const x of [-3.5,0,3.5]){beam([gx+x,0,gz+4.5],[gx+x,4.7,gz+4.5],.04,frame);beam([gx+x,4.7,gz+4.5],[gx+x,6.2,gz],.04,frame);beam([gx+x,6.2,gz],[gx+x,4.7,gz-4.5],.04,frame);}for(const z of [-4.5,-2.25,0,2.25,4.5]){beam([gx-3.5,0,gz+z],[gx-3.5,4.7,gz+z],.04,frame);beam([gx+3.5,0,gz+z],[gx+3.5,4.7,gz+z],.04,frame);beam([gx-3.5,4.7,gz+z],[gx+3.5,4.7,gz+z],.04,frame);}
 // A tiered fountain with arcing streams, droplets and expanding ripples.
 const fx=5.2,fz=-15,water=new THREE.MeshPhysicalMaterial({color:'#8ecbd2',transparent:true,opacity:.65,roughness:.14,metalness:.12,side:THREE.DoubleSide});mesh(new THREE.CylinderGeometry(1.7,1.9,.42,48),stone,fx,.12,fz);mesh(new THREE.CircleGeometry(1.55,48),water,fx,.35,fz).rotation.x=-Math.PI/2;mesh(new THREE.CylinderGeometry(.15,.26,2.1,24),stone,fx,1.2,fz);mesh(new THREE.CylinderGeometry(.75,.6,.18,40),stone,fx,2.23,fz);const bowlPoints=[new THREE.Vector2(.12,0),new THREE.Vector2(.2,.12),new THREE.Vector2(.42,.24),new THREE.Vector2(.82,.31),new THREE.Vector2(.91,.36),new THREE.Vector2(.94,.45),new THREE.Vector2(.82,.45),new THREE.Vector2(.7,.33),new THREE.Vector2(.3,.25)];mesh(new THREE.LatheGeometry(bowlPoints,64),stone,fx,1.9,fz);mesh(new THREE.TorusGeometry(1.72,.10,10,64),stone,fx,.35,fz).rotation.x=-Math.PI/2;const waterUniforms={time:{value:0}};const streamMat=new THREE.ShaderMaterial({uniforms:waterUniforms,transparent:true,side:THREE.DoubleSide,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float flow=sin(vUv.x*130.-time*13.+sin(vUv.y*25.)*2.);float glint=pow(max(0.,flow),20.);vec3 col=mix(vec3(.31,.65,.68),vec3(.92,1.,.98),.45+glint*.5);gl_FragColor=vec4(col,.24+glint*.3);}' });const streams=[];for(let j=0;j<12;j++){const a=j*Math.PI/6,points=[];for(let k=0;k<=20;k++){const t=k/20;points.push(new THREE.Vector3(fx+Math.cos(a)*(.80+t*.5),2.37+Math.sin(t*Math.PI)*.12-t*1.95,fz+Math.sin(a)*(.80+t*.5)));}streams.push(points);mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),36,.045,10,false),streamMat,0,0,0);}mesh(new THREE.CylinderGeometry(.81,1.3,1.9,72,24,true),streamMat,fx,1.4,fz);const jetPoints=[];for(let i=0;i<=20;i++){const t=i/20;jetPoints.push(new THREE.Vector3(fx+.16*Math.sin(t*3),2.4+Math.sin(t*Math.PI)*1.0,fz+t*.18));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(jetPoints),36,.045,10,false),streamMat,0,0,0);const dropletGeo=new THREE.BufferGeometry(),dropPos=new Float32Array(240*3);dropletGeo.setAttribute('position',new THREE.BufferAttribute(dropPos,3));const drops=new THREE.Points(dropletGeo,new THREE.PointsMaterial({color:'#defaff',size:.055,transparent:true,opacity:.8}));scene.add(drops);const ripples=[];for(let j=0;j<5;j++){const r=mesh(new THREE.TorusGeometry(1,.012,5,60),new THREE.MeshBasicMaterial({color:'#ddf9f5',transparent:true,opacity:.3}),fx,.365,fz);r.rotation.x=-Math.PI/2;ripples.push(r);}
 // Three broad falling sheets connect mossy rock steps beside the path.
 const cascadeStone=mat('#78836b');for(let step=0;step<3;step++){const zz=-11-step*.85,yy=.45+step*.44;for(let side=-1;side<=1;side++){const rock=mesh(new THREE.DodecahedronGeometry(1,1),cascadeStone,-4.6+side*.56,yy*.45,zz);rock.scale.set(.55,yy,.65);}const surface=mesh(new THREE.PlaneGeometry(1.3,.85,10,6),water,-4.6,yy,zz);surface.rotation.x=-Math.PI/2;const sheet=mesh(new THREE.PlaneGeometry(1.15,.53,15,10),streamMat,-4.6,yy-.23,zz+.43);sheet.rotation.x=-.1;}
 // A reflective lily pond gives the planting a second focal point.
 const pond=mesh(new THREE.CircleGeometry(3.1,64),water,-10,.03,-120);pond.rotation.x=-Math.PI/2;pond.scale.y=1.65;for(let i=0;i<35;i++){const a=rnd()*6.28,r=rand(2.9,3.5);item(ball,stone,-10+Math.cos(a)*r,.03,-120+Math.sin(a)*r*1.65,.25,.16,.30);}
 for(let i=0;i<30;i++)item(ball,mat('#64804b'),-85+i*6,1,-166-rand(0,20),rand(9,17),rand(5,10),rand(9,17));
 // Low flowers follow the outer edge of the flagstones on both landings.
 for(const [start,end] of [[17,-11.7],[-109,-141]]){
  let pocket=null;
  for(let row=0;start-row*.31>=end;row++){
   if(row%5===0){
    const z=start-(row+2)*.31;
    pocket=start===17&&z<6.5?{z,amount:0,grow:true}:null;
    if(pocket)bloomPockets.push(pocket);
   }
   for(const side of [-1,1]){
    const z=start-row*.31+rand(-.09,.09);
    const x=pathX(z)+side*rand(1.73,1.96);
    const band=Math.floor(row/6)+(side<0?1:0);
    const type=[1,2,3,2,1,3][band%6];
    flower(x,terrain(x,z),z,type,rand(.48,.70),pocket);
    const backZ=z-.15,backX=pathX(backZ)+side*rand(1.99,2.22);
    flower(backX,terrain(backX,backZ),backZ,type,rand(.46,.64),pocket);
   }
  }
 }
 // Smaller groups on the opposite side open at a staggered distance from the horse.
 for(const [index,z] of pocketPositions.entries()){
  const pocket={z:z-.28,amount:0,grow:true};
  bloomPockets.push(pocket);
  const side=index%2?-1:1;
  for(let j=0;j<4;j++){
   const zz=pocket.z+(j-1.5)*.39,x=pathX(zz)+side*(1.84+j*.20);
   flower(x,terrain(x,zz),zz,[0,2,3,4][(j+index)%4],.67+j*.08,pocket);
  }
 }
 const bloomTilt=new THREE.Quaternion(),petalRotation=new THREE.Quaternion();
 const petalEuler=new THREE.Euler(0,0,0,'YXZ'),petalAxis=new THREE.Vector3(1,0,0);
 function paint(inst,data,cameraZ,previous=Infinity,changedPocketsOnly=false){
  let first=data.length,last=-1;
  for(let i=0;i<data.length;i++){
   const o=data[i],offset=Math.sin(o.z*.92)*2;
   if(changedPocketsOnly&&!o.pocket.changed)continue;
   const arch=o.mode==='archPetal',distance=arch?8:12,range=arch?5:7;
   const opening=o.pocket?THREE.MathUtils.smoothstep(o.pocket.amount,Math.min(.24,Math.abs(o.z-o.pocket.z)*.32),1):o.mode==='openPetal'?1:THREE.MathUtils.smoothstep(distance+offset-(cameraZ-o.z),0,range);
   if(Number.isFinite(previous)){
    const old=o.mode==='openPetal'?1:THREE.MathUtils.smoothstep(distance+offset-(previous-o.z),0,range);
    if(opening===old)continue;
   }
   const growth=o.pocket?.grow?.38+.62*opening:1;
   dummy.position.set(o.x,o.rootY+(o.y-o.rootY)*growth,o.z);
   if(o.mode==='petal'||o.mode==='openPetal'||arch){
    bloomTilt.setFromAxisAngle(petalAxis,o.tilt);
    petalRotation.setFromEuler(petalEuler.set(.14+(o.rx-.14)*opening,o.ry,o.rz));
    dummy.quaternion.copy(bloomTilt).multiply(petalRotation);
   }else dummy.rotation.set(o.rx,o.ry,o.rz);
   const visible=o.mode==='head'?THREE.MathUtils.smoothstep(opening,.54,.93):1;
   const petalSize=o.pocket&&o.mode==='petal'?.64+.36*opening:1;
   dummy.scale.set(o.sx*visible*petalSize*growth,o.sy*visible*petalSize*growth,o.sz*visible*petalSize*growth);
   dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
   first=Math.min(first,i);last=i;
  }
  if(last>=0){
   inst.instanceMatrix.addUpdateRange(first*16,(last-first+1)*16);
   inst.instanceMatrix.needsUpdate=true;
  }
 }
 for(let i=0;i<82;i++){
  const z=14-i*1.85+rand(-.5,.5),x=pathX(z)+rand(-1.42,1.42),petal=i%3===0;
  const y=routeY(z)+.035;
  item(petal?petalGeometry:leafGeometry,petal?blossomMat:leafMat,x,y,z,.12,.19,.13,-Math.PI/2,0,rnd()*6.28);
 }
 batches.forEach(({geo,m,items,bloom,pocketed})=>{const inst=new THREE.InstancedMesh(geo,m,items.length);if(bloom){paint(inst,items,10);if(items[0].mode!=='openPetal'){inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);(pocketed?pocketBatches:growing).push({inst,items});}}else items.forEach((o,i)=>{dummy.position.set(o.x,o.y,o.z);dummy.rotation.set(o.rx,o.ry,o.rz);dummy.scale.set(o.sx,o.sy,o.sz);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.computeBoundingSphere();if(pocketed)inst.boundingSphere.radius+=1.5;inst.castShadow=inst.receiveShadow=true;scene.add(inst);});
 function advanceBloomPockets(cameraZ){
  let changed=false;
  for(const pocket of bloomPockets){
   // The horse stands 5.6 units in front of the camera. Open along its flanks.
   const ahead=cameraZ-5.6-pocket.z;
   const amount=THREE.MathUtils.smoothstep(3.6-ahead,0,4.35);
   pocket.changed=pocket.amount!==amount;
   changed ||= pocket.changed;
   pocket.amount=amount;
  }
  if(changed)for(const {inst,items} of pocketBatches)paint(inst,items,cameraZ,Infinity,true);
 }
 const fallingGeo=new THREE.BufferGeometry(),fallingPos=[];for(let i=0;i<240;i++)fallingPos.push(rand(-14,14),rand(.2,2.5),rand(-85,12));fallingGeo.setAttribute('position',new THREE.Float32BufferAttribute(fallingPos,3));const falling=new THREE.Points(fallingGeo,new THREE.PointsMaterial({color:'#f0dfb0',size:.018,transparent:true,opacity:.28}));scene.add(falling);const leaves=[];
 function detach(leaf,index,z){
  const sourceZ=z-rand(7,11),side=index%2?1:-1;
  if(onBranch(pathX(sourceZ)+side*2,sourceZ))return;
  leaf.position.set(pathX(sourceZ)+side*rand(1.6,2.2),rand(2.65,3.8),sourceZ);
  leaf.rotation.set(rand(-1,1),rand(-1,1),rand(-1,1));
  Object.assign(leaf.userData,{falling:true,rest:0,delay:index*.37});
 }
 for(let i=0;i<6;i++){
  const petal=i%3===0,leaf=new THREE.Mesh(petal?petalGeometry:leafGeometry,petal?blossomMat:leafMat);
  leaf.scale.setScalar(rand(.14,.20));
  leaf.visible=false;
  scene.add(leaf);leaves.push(leaf);
 }

 const butterflies=createGardenButterflies(THREE,scene,18,()=>[rand(-6,6),rand(1.1,3),rand(-70,8)]);
 const birds=[];for(let i=0;i<9;i++){const group=new THREE.Group(),wings=[];const body=new THREE.Mesh(ball,mat(i%2?'#567b9e':'#dbb260'));body.scale.set(.09,.07,.19);group.add(body);const head=new THREE.Mesh(ball,body.material);head.scale.setScalar(.065);head.position.set(0,.055,-.16);group.add(head);const beak=new THREE.Mesh(new THREE.ConeGeometry(.025,.09,8),pollenMat);beak.rotation.x=-Math.PI/2;beak.position.set(0,.045,-.245);group.add(beak);for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),seedMat);eye.position.set(side*.055,.08,-.18);group.add(eye);}const tail=new THREE.Mesh(new THREE.ConeGeometry(.08,.3,8),body.material);tail.rotation.x=Math.PI/2;tail.position.set(0,.02,.26);group.add(tail);for(const side of [-1,1]){const pivot=new THREE.Group();const wing=new THREE.Mesh(new THREE.SphereGeometry(1,12,6),body.material);wing.scale.set(.25,.022,.10);wing.position.x=side*.20;pivot.add(wing);group.add(pivot);wings.push(pivot);}scene.add(group);birds.push({group,wings});}
 const carriage=createGardenCarriage(THREE,scene,routeX,routeY);const treasures=createProjectTreasures(THREE,scene,camera,routeX,routeY,onGardenChime);let lastZ=Infinity,lastRideZ=null,leafTravel=0,nextLeafRelease=3;return {scene,dispose(){treasures.dispose();},falling,pathX,routeX,routeY,get projectOpen(){return treasures.open;},updateProjectUI(z,active,dt){camera.updateMatrixWorld(true);treasures.tick(z,active,dt);},botanicalGeometry:{leafGeometry,petalGeometry},tick(dt,time,cameraZ=8,inGarden=false){breeze.value=reduced?0:time;waterUniforms.time.value=time;bridge.tick(time);lakeside.tick(time,cameraZ);carriage.tick(dt,time,cameraZ);if(inGarden){
 const forwardTravel=Math.max(0,(lastRideZ??cameraZ)-cameraZ);
 lastRideZ=cameraZ;
 advanceBloomPockets(cameraZ);
 if(!reduced){
  leafTravel+=forwardTravel;
  if(leafTravel>=nextLeafRelease){
   const ready=leaves.filter(leaf=>!leaf.userData.falling);
   for(let i=0;i<Math.min(ready.length,2);i++)detach(ready[i],i,cameraZ);
   nextLeafRelease=leafTravel+rand(4,7);
  }
 }
}else lastRideZ=null;if(Math.abs(cameraZ-lastZ)>.12){growing.forEach(({inst,items})=>paint(inst,items,cameraZ,lastZ));lastZ=cameraZ;}swing.rotation.x=Math.sin(time*.7)*.075;secondSwing.rotation.x=Math.sin(time*.65+1)*.06;butterflies.forEach(({group,wings,origin},i)=>{group.position.set(origin.x+Math.sin(time*.6+i)*1.2,origin.y+Math.sin(time+i)*.35,origin.z+Math.cos(time*.4+i)*1.2);group.visible=Math.abs(group.position.z-cameraZ)>3.5;group.rotation.y=Math.sin(time*.4+i);wings.forEach((w,j)=>w.rotation.y=Math.sin(time*13+i)*(j?1:-1)*1.1);});birds.forEach(({group,wings},i)=>{const a=time*.13+i*.7;group.position.set(Math.sin(a)*10,5.4+Math.sin(a*2+i)*1.5,-18-i*6+Math.cos(a)*5);group.visible=Math.abs(group.position.z-cameraZ)>3;group.rotation.y=a+Math.PI/2;wings.forEach((w,j)=>w.rotation.z=Math.sin(time*8+i)*(j?1:-1)*.5);});leaves.forEach((leaf,i)=>{
  if(!leaf.userData.falling){leaf.visible=false;return;}
  if(leaf.userData.delay>0){leaf.userData.delay-=dt;leaf.visible=false;return;}
  leaf.visible=true;
  const {position:p}=leaf;
  const floor=Math.abs(p.x-routeX(p.z))<1.7?routeY(p.z)+.045:terrain(p.x,p.z)+.028;
  if(p.y>floor){
   p.y-=dt*(.46+i%4*.075);
   p.x+=(Math.sin(time*.7+i)*.11+(routeX(p.z)-p.x)*.26)*dt;
   p.z+=Math.sin(time*.55+i)*.12*dt;
   leaf.rotation.x+=dt*.39;leaf.rotation.z+=dt*.48;
  }else{
   p.y=floor;leaf.rotation.x=-Math.PI/2;
   leaf.userData.rest+=dt;
   if(leaf.userData.rest>4){leaf.userData.falling=false;leaf.visible=false;}
  }
 });for(let i=0;i<240;i++){const t=(time*.5+i/240)%1,a=i%12* Math.PI/6;dropPos[i*3]=fx+Math.cos(a)*(.8+t*.5);dropPos[i*3+1]=2.37+Math.sin(t*Math.PI)*.12-t*1.95;dropPos[i*3+2]=fz+Math.sin(a)*(.8+t*.5);}dropletGeo.attributes.position.needsUpdate=true;ripples.forEach((r,i)=>{const s=(time*.35+i/5)%1;r.scale.setScalar(.15+s*1.35);r.material.opacity=(1-s)*.4;});}};
}
