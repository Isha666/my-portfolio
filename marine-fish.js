// A continuous tapered body with a peduncle, forked caudal fin and paired fins.
export function makeFishSchool(T,scene,rnd,{x=-3,z=-9,count=41,radius=1}={}){
 const body=new T.BufferGeometry(),p=[],uv=[],ind=[],rings=35,around=24;
 for(let i=0;i<=rings;i++){const u=i/rings,x=1-u*2.25,shape=Math.pow(Math.sin(Math.PI*u),.49)*(1-.84*u)+.035;for(let j=0;j<=around;j++){const a=j/around*Math.PI*2;p.push(x,Math.cos(a)*shape*.83,Math.sin(a)*shape*.38);uv.push(u,j/around);if(i<rings&&j<around){const k=i*(around+1)+j;ind.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}}}
 body.setAttribute('position',new T.Float32BufferAttribute(p,3));body.setAttribute('uv',new T.Float32BufferAttribute(uv,2));body.setIndex(ind);body.computeVertexNormals();
 function fin(vertices,faces){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices.flat(),3));g.setIndex(faces);g.computeVertexNormals();return g;}
 const tail=fin([[0,0,0],[-.55,.45,.02],[-.45,.19,.025],[-.31,0,.06],[-.45,-.19,.025],[-.55,-.43,.02]],[0,1,2,0,2,3,0,3,4,0,4,5]);
 const dorsal=fin([[.52,.25,0],[.23,.62,.025],[-.08,.55,.05],[-.64,.20,0],[-.1,.31,.06]],[0,1,4,1,2,4,2,3,4]);
 const pectoral=fin([[.35,-.07,.15],[-.08,-.34,.43],[-.33,-.20,.37],[-.06,-.09,.20]],[0,1,2,0,2,3]);
 const eyeGeo=new T.SphereGeometry(1,12,8),eyes=new T.MeshStandardMaterial({color:'#070b12',roughness:.12}),ring=new T.MeshStandardMaterial({color:'#dfbd7b',roughness:.38});
 const fish=[];
 for(let i=0;i<count;i++){
  const g=new T.Group(),skin=new T.MeshStandardMaterial({color:['#ed8862','#4ddacb','#7d83ff'][i%3],emissive:['#fc487d','#1fffd0','#506dff'][i%3],emissiveIntensity:.42,roughness:.42,metalness:.15,side:T.DoubleSide});
  const phase={value:0};
  skin.onBeforeCompile=shader=>{shader.uniforms.swim=phase;shader.vertexShader='uniform float swim; varying vec2 fishUV;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  fishUV=uv;float flex=pow(max(0.,.45-position.x),1.65);transformed.z+=sin(swim+position.x*2.8)*.085*flex;`);shader.fragmentShader='varying vec2 fishUV;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float bars=.70+.30*smoothstep(-.7,.5,sin(fishUV.x*26.));float scalePattern=.93+.07*sin(fishUV.x*235.+sin(fishUV.y*205.)*1.5);float belly=.78+.22*abs(cos(fishUV.y*6.283));diffuseColor.rgb*=bars*scalePattern*belly;`).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  float lateral=exp(-pow((abs(sin(fishUV.y*6.283))-.85)*11.,2.))*smoothstep(.08,.23,fishUV.x)*(1.-smoothstep(.73,.97,fishUV.x));totalEmissiveRadiance*=.05+lateral*1.45;`);};
  const fm=new T.MeshStandardMaterial({color:i%3===0?'#bd8149':'#638eab',transparent:true,opacity:.83,side:T.DoubleSide,roughness:.5});
  g.add(new T.Mesh(body,skin),new T.Mesh(dorsal,fm));
  const gillMat=new T.LineBasicMaterial({color:i%3===0?'#735741':'#36596c',transparent:true,opacity:.8});
  for(const side of [-1,1]){const pts=[];for(let j=0;j<14;j++){const u=j/13,y=(u-.5)*.40;pts.push(new T.Vector3(.35-.12*Math.sin(u*Math.PI),y,side*.205*Math.sqrt(1-(y/.40)**2)));}g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),gillMat));}
const fluke=new T.Mesh(tail,fm);fluke.position.x=-1.22;g.add(fluke);
  for(const s of [-1,1]){const f=new T.Mesh(pectoral,fm);f.scale.z=s;g.add(f);const e=new T.Mesh(eyeGeo,ring);e.position.set(.70,.078,s*.144);e.scale.set(.093,.093,.038);g.add(e);const pupil=new T.Mesh(eyeGeo,eyes);pupil.position.set(.725,.082,s*.174);pupil.scale.set(.062,.062,.025);g.add(pupil);}
  g.scale.setScalar(.23+rnd()*.28);scene.add(g);fish.push({g,fluke,phase,r:2+rnd()*5,a:rnd()*6.28,h:rnd()*5-1});
 }
 return t=>fish.forEach(({g,fluke,phase,r,a,h},i)=>{const v=.23+i%4*.023,k=a+t*v;g.position.set(x+Math.cos(k)*r*radius,h+Math.sin(k*2+i)*.6,z+Math.sin(k)*r*radius);g.rotation.y=-k-Math.PI/2;g.rotation.z=Math.cos(k*2+i)*.09;phase.value=t*8+i;fluke.position.z=Math.sin(phase.value-3.5)*.19;fluke.rotation.y=Math.sin(phase.value-3.5)*.35;});
}
