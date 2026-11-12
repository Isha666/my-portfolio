// The Coding Club Join Us petal surface, sampled as indexed WebGL geometry.
export function makeMarineBloom(T,parent,{scale=1,colors=['#acd9ff','#b8a6fa','#ffe3fa']}={}){
 const root=new T.Group();root.scale.setScalar(scale);parent.add(root);
 const petals=[],rows=24,cols=12;
 for(let layer=0;layer<3;layer++){
  const count=[8,7,6][layer];
  const material=new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,
   uniforms:{tint:{value:new T.Color(colors[layer])}},
   vertexShader:`varying vec2 v;varying vec3 n,e;void main(){v=uv;vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);e=-p.xyz;gl_Position=projectionMatrix*p;}`,
   fragmentShader:`uniform vec3 tint;varying vec2 v;varying vec3 n,e;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(e))),2.3);vec2 q=abs(fract(v*vec2(12.,24.)+.5)-.5);float rib=1.-smoothstep(.025,.095,min(q.x,q.y));float edge=pow(abs(v.x-.5)*2.,7.);float core=exp(-v.y*5.);vec3 c=tint*(.35+.52*f+.42*core)+vec3(.55,.76,1.)*(rib*.21+edge*.25);gl_FragColor=vec4(c,.24+.32*f+rib*.16+edge*.15);}`});
  for(let petal=0;petal<count;petal++){
   const geo=new T.BufferGeometry(),coords=[],indices=[];
   for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){coords.push(j/cols,i/rows);if(i<rows&&j<cols){const k=i*(cols+1)+j;indices.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}}
   geo.setIndex(indices);geo.setAttribute('uv',new T.Float32BufferAttribute(coords,2));geo.setAttribute('position',new T.BufferAttribute(new Float32Array(coords.length/2*3),3).setUsage(T.DynamicDrawUsage));
   const mesh=new T.Mesh(geo,material);mesh.frustumCulled=false;root.add(mesh);petals.push({geo,layer,angle:petal/count*Math.PI*2+layer*.41});
  }
 }
 let last=-1;
 function update(bloom){
  if(Math.abs(bloom-last)<.002)return;last=bloom;
  for(const {geo,layer,angle} of petals){const b=T.MathUtils.clamp((bloom-layer*.12)/(1-layer*.12),0,1),length=[1.35,1.12,.87][layer],opening=.10+b*[1.48,1.25,1.02][layer],c=Math.cos(angle),d=Math.sin(angle),attr=geo.attributes.position;
   for(let i=0;i<=rows;i++){const s=i/rows,sin=Math.sin(Math.PI*s),width=Math.pow(Math.max(0,sin),.8)*[.47,.39,.31][layer];for(let j=0;j<=cols;j++){const v=j/cols*2-1,along=.035+Math.sin(opening)*length*s+v*v*.10*sin,across=v*width*(.45+.55*b),y=Math.cos(opening)*length*s+(.25*sin+.30*s**3)*(.1+.9*b)+v*v*.20*sin*b+layer*.035-.10;attr.setXYZ(i*(cols+1)+j,c*along-d*across,y,d*along+c*across);}}
   attr.needsUpdate=true;geo.computeVertexNormals();
  }
 }
 update(0);return {root,update};
}
