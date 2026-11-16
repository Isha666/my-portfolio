export function createGardenBridge(THREE,scene,routeX,routeY){
 const timber=new THREE.MeshStandardMaterial({color:'#92704b',roughness:.86}),darkWood=new THREE.MeshStandardMaterial({color:'#594d38',roughness:.93}),stone=new THREE.MeshStandardMaterial({color:'#8a8c78',roughness:1}),iron=new THREE.MeshStandardMaterial({color:'#465c4d',metalness:.45,roughness:.6}),dummy=new THREE.Object3D();
 const deck=new THREE.InstancedMesh(new THREE.BoxGeometry(6.35,.16,.72),timber,129);for(let i=0;i<129;i++){const z=-12-i*.75;dummy.position.set(routeX(z),routeY(z)-.08,z);dummy.rotation.set(Math.atan2(routeY(z-.4)-routeY(z+.4),.8),0,0);dummy.updateMatrix();deck.setMatrixAt(i,dummy.matrix);}deck.castShadow=deck.receiveShadow=true;scene.add(deck);
 function beam(a,b,r,mat){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),9),mat);m.position.copy(p.add(q).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;scene.add(m);return m;}
 const lamps=[];for(let i=0;i<=32;i++){const z=-12-i*3,x=routeX(z),y=routeY(z);for(const side of [-1,1]){beam([x+side*3.02,y-.12,z],[x+side*3.02,y+1.08,z],.065,darkWood);const cap=new THREE.Mesh(new THREE.SphereGeometry(.10,10,7),iron);cap.position.set(x+side*3.02,y+1.11,z);scene.add(cap);if(i<32){const nextZ=z-3;for(const height of [.40,.95])beam([x+side*3.02,y+height,z],[routeX(nextZ)+side*3.02,routeY(nextZ)+height,nextZ],.045,darkWood);}if(i%4===0&&i>3&&i<29){const support=new THREE.Mesh(new THREE.CylinderGeometry(.28,.42,y+1.5,12),stone);support.position.set(x+side*2.75,(y-1.5)/2,z);support.castShadow=true;scene.add(support);const lantern=new THREE.Mesh(new THREE.BoxGeometry(.22,.30,.22),new THREE.MeshStandardMaterial({color:'#e8d5a0',emissive:'#edba65',emissiveIntensity:.4}));lantern.position.set(x+side*3.02,y+1.32,z);scene.add(lantern);}}}
 const uniforms={time:{value:0}};
 const water=new THREE.Mesh(new THREE.PlaneGeometry(230,90,120,55),new THREE.ShaderMaterial({
  uniforms,side:THREE.DoubleSide,
  vertexShader:`
   uniform float time; varying vec3 vWorld;
   void main(){
    vec3 p=position;
    p.z+=.045*sin(p.x*.41+p.y*.56-time*1.55)
        +.022*sin(-p.x*.67+p.y*1.18-time*2.1);
    vWorld=(modelMatrix*vec4(p,1.)).xyz;
    gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);
   }`,
  fragmentShader:`
   uniform float time; varying vec3 vWorld;
   float rippleSeed(vec2 cell){return fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);}
   void main(){
    vec2 p=vWorld.xz;
    float flow=p.x-time*2.65;
    float crossflow=p.y+sin(flow*.28+p.y*.19)*.66;
    float w1=sin(flow*1.4+crossflow*2.9);
    float w2=sin(flow*3.9-crossflow*1.6);
    float w3=sin(flow*6.1+crossflow*5.2+sin(p.y*.72)*1.1);
    vec3 n=normalize(vec3(.085*w1+.042*w2+.025*w3,1.,.16*w1-.031*w2+.026*w3));
    vec3 eye=normalize(cameraPosition-vWorld);
    float fresnel=.04+.77*pow(1.-max(dot(eye,n),0.),4.);
    vec3 ray=reflect(-eye,n);
    float sky=clamp(ray.y,0.,1.);
    float cloud=smoothstep(.05,.92,sin(ray.x*13.+ray.z*4.)*.6+sin(ray.z*18.+ray.x*7.)*.4);
    vec3 reflection=mix(vec3(.27,.65,.62),vec3(.25,.59,.72),sky);
    reflection=mix(reflection,vec3(.72,.87,.83),cloud*.39);
    float bank=max(smoothstep(-94.,-16.,p.y)*smoothstep(-42.,-16.,p.y),1.-smoothstep(-105.,-88.,p.y));
    vec3 color=mix(vec3(.012,.22,.235),vec3(.056,.37,.302),bank);
    color+=vec3(.021,.038,.033)*(w1+w2*.4);
    color=mix(color,reflection,fresnel);
    vec3 halfLight=normalize(eye+normalize(vec3(-.37,.49,-.60)));
    float sun=pow(max(dot(n,halfLight),0.),86.);
    float streak=pow(.5+.5*sin(crossflow*11.+sin(flow*2.1)*1.2),16.)*pow(.5+.5*w2,4.);
    color+=vec3(1.,.93,.70)*sun*.72+vec3(.62,.84,.80)*streak*.08;
    vec2 lane=vec2(flow*.21,(p.y+sin(p.x*.075)*.65)*.46);
    float seed=rippleSeed(floor(lane));
    vec2 foamOffset=fract(lane)-vec2(.5,.3+.4*seed);
    float foam=smoothstep(.8,.93,seed)*exp(-foamOffset.x*foamOffset.x*32.-foamOffset.y*foamOffset.y*930.);
    color+=vec3(.52,.67,.63)*foam*.47;
    gl_FragColor=vec4(color,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 }));
 water.rotation.x=-Math.PI/2;water.position.set(0,-.70,-60);scene.add(water);
 // Stony banks and reeds give the water body visible edges on both approaches.
 for(const z of [-18,-102])for(let i=0;i<42;i++){const x=-36+i*1.8;if(Math.abs(x-routeX(z))<4)continue;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.4,1),stone);rock.position.set(x,-.45+Math.sin(i)*.08,z+Math.sin(i*2.4)*.65);rock.scale.set(1.4,.65,1);scene.add(rock);}
 return {tick(time){uniforms.time.value=time;}};
}
