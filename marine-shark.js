export function makeMarineShark(T,scene){
 const group=new T.Group();group.position.set(5,1,19);scene.add(group);
 const skin=new T.MeshPhysicalMaterial({color:'#a6b1b9',roughness:.62,clearcoat:.14,side:T.DoubleSide,vertexColors:true}),finSkin=new T.MeshStandardMaterial({color:'#526573',side:T.DoubleSide,roughness:.52});
 skin.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 sharkSkin;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n sharkSkin=position;');shader.fragmentShader='varying vec3 sharkSkin;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float fine=sin(sharkSkin.x*193.+sin(sharkSkin.z*148.)*2.)*sin(sharkSkin.y*177.+sharkSkin.z*91.);float mottle=sin(sharkSkin.z*12.+sharkSkin.y*13.)*sin(sharkSkin.x*19.+sharkSkin.z*7.);diffuseColor.rgb*=.96+.07*mottle+.035*fine;`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 float tooth=sin(sharkSkin.z*180.+sin(sharkSkin.y*140.)*.85)*sin(sharkSkin.y*135.+sharkSkin.x*124.);vec3 ds=dFdx(-vViewPosition),dt=dFdy(-vViewPosition);vec3 grad=dFdx(tooth)*cross(dt,normal)+dFdy(tooth)*cross(normal,ds);float det=dot(ds,cross(dt,normal));normal=normalize(abs(det)*normal-sign(det)*grad*.0018);`);};
 function mesh(geo,mat,parent=group){const m=new T.Mesh(geo,mat);parent.add(m);return m;}
 const vertices=[],colors=[],index=[],rings=60,cols=32;
 for(let i=0;i<=rings;i++){const u=i/rings,z=-2.4+u*6.2,r=(Math.sin(Math.PI*u)**.54)*(1.23-.68*u)+.032;
  for(let j=0;j<=cols;j++){const a=j/cols*2*Math.PI,c=Math.cos(a);const shoulder=.025*Math.sin(a*5+u*18)*Math.sin(Math.PI*u);vertices.push(Math.sin(a)*(r+shoulder),c*(r+shoulder)*.79+.12*Math.exp(-Math.pow((u-.15)*7,2)),z);const shade=T.MathUtils.smoothstep(c,-.28,.13);colors.push(.87-.57*shade,.89-.55*shade,.89-.50*shade);if(i<rings&&j<cols){const k=i*(cols+1)+j;index.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}}
 }
 const body=new T.BufferGeometry();body.setAttribute('position',new T.Float32BufferAttribute(vertices,3));body.setAttribute('color',new T.Float32BufferAttribute(colors,3));body.setIndex(index);body.computeVertexNormals();mesh(body,skin);
 function fin(points,parent){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geo.setIndex([0,1,3,1,2,3,2,0,3]);geo.computeVertexNormals();return mesh(geo,finSkin,parent);}
 fin([[0,.42,-.16],[0,1.62,.45],[0,.31,1.4],[.07,.75,.51]]);
 for(const s of [-1,1])fin([[s*.52,-.15,-.74],[s*2.3,-.34,.78],[s*.49,-.25,.93],[s*.93,-.22,.08]]);
 const tail=new T.Group();tail.position.z=3.68;group.add(tail);fin([[0,0,-.23],[0,1.38,.78],[0,.08,.44],[.06,.50,.30]],tail);fin([[0,0,-.23],[0,-.88,.74],[0,.08,.44],[.05,-.38,.31]],tail);
 const eye=new T.MeshPhysicalMaterial({color:'#030712',roughness:.10,clearcoat:1}),belly=new T.MeshStandardMaterial({color:'#769eae',roughness:.52}),mouthMat=new T.MeshStandardMaterial({color:'#170919',emissive:'#301225',emissiveIntensity:.5}),enamel=new T.MeshStandardMaterial({color:'#dceef1',roughness:.40});
 const socket=new T.MeshStandardMaterial({color:'#3d505a',roughness:.69}),glint=new T.MeshBasicMaterial({color:'#b1d4e3'});
 function surface(z,angle){const u=(z+2.4)/6.2,r=(Math.sin(Math.PI*u)**.54)*(1.23-.68*u)+.032+.025*Math.sin(angle*5+u*18)*Math.sin(Math.PI*u);return new T.Vector3(Math.sin(angle)*r,Math.cos(angle)*r*.79+.12*Math.exp(-Math.pow((u-.15)*7,2)),z);}
 for(const s of [-1,1]){
  const p=surface(-1.77,s*1.21);
  const rim=mesh(new T.SphereGeometry(.133,22,14),socket);rim.position.copy(p);rim.scale.set(.44,.83,1.05);
  const e=mesh(new T.SphereGeometry(.097,24,16),eye);e.position.copy(p).add(new T.Vector3(s*.044,.002,-.005));e.scale.set(.54,.84,1);
  const shine=mesh(new T.SphereGeometry(.018,10,8),glint);shine.position.copy(e.position).add(new T.Vector3(s*.045,.029,-.029));
  for(let i=0;i<5;i++){const curve=new T.CatmullRomCurve3(Array.from({length:11},(_,j)=>{const t=j/10,q=surface(-.94+i*.105+.09*Math.sin(t*Math.PI),s*(1.29+t*.63));q.x+=s*.008;return q;}));mesh(new T.TubeGeometry(curve,12,.014-i*.0012,6,false),eye);}
 }

 const jaw=new T.Group();jaw.position.set(0,-.29,-.90);group.add(jaw);
 const jawGeo=new T.SphereGeometry(1,36,22),jp=jawGeo.attributes.position;for(let i=0;i<jp.count;i++){const z=jp.getZ(i),t=(z+1)*.5;jp.setXYZ(i,jp.getX(i)*(.70+t*.28),jp.getY(i)*(.65+t*.35),z);}jawGeo.computeVertexNormals();
 const lower=mesh(jawGeo,belly,jaw);lower.position.set(0,-.058,-.60);lower.scale.set(.45,.095,.71);const teeth=[];
 const cavity=mesh(new T.SphereGeometry(1,24,14),mouthMat);cavity.position.set(0,-.39,-1.56);cavity.scale.set(.44,.02,.51);
 for(let i=0;i<13;i++){const x=(i-6)*.059,z=-.77-.33*(1-(x/.45)**2);const t=mesh(new T.ConeGeometry(.023,.068,5),enamel,jaw);t.position.set(x,-.006,z);const upper=mesh(new T.ConeGeometry(.027,.077,5),enamel);upper.position.set(x,-.29,z-.90);upper.rotation.z=Math.PI;teeth.push(t,upper);}
 return {group,tick(t,opened){const phase=(t*.37)%1,breath=T.MathUtils.smoothstep(phase,.01,.16)*(1-T.MathUtils.smoothstep(phase,.58,.88)),open=opened*breath;group.position.y=1+Math.sin(t*.66)*.35;tail.rotation.y=Math.sin(t*2.25)*.40;jaw.rotation.x=-open*.42;teeth.forEach(tooth=>tooth.visible=open>.19);cavity.position.y=-.34-open*.20;cavity.scale.y=.02+open*.21;return {phase,open};}};
}
