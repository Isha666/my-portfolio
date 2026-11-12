// A damped radial current carries the camera and the debris in the same field.
export function createMarineVortex(T,camera,scene){
 const funnel=new T.Group();funnel.position.y=14.5;scene.add(funnel);const depthScale=.90;funnel.scale.y=depthScale;
 const count=2100,positions=new Float32Array(count*3),colors=new Float32Array(count*3),particles=[];
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('color',new T.BufferAttribute(colors,3));
 const points=new T.Points(geo,new T.PointsMaterial({vertexColors:true,size:.065,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending}));points.frustumCulled=false;funnel.add(points);
 const petals=new T.InstancedMesh(new T.SphereGeometry(1,8,5),new T.MeshBasicMaterial({color:'#ffc4d8',transparent:true,depthWrite:false}),90);petals.frustumCulled=false;funnel.add(petals);
 const dummy=new T.Object3D();
 const streaks=new Float32Array(count*6),streakGeo=new T.BufferGeometry();streakGeo.setAttribute('position',new T.BufferAttribute(streaks,3));
 const foam=new T.LineSegments(streakGeo,new T.LineBasicMaterial({color:'#9ae9ef',transparent:true,opacity:.21,depthWrite:false,blending:T.AdditiveBlending}));foam.frustumCulled=false;funnel.add(foam);
 const tube=new T.Mesh(new T.CylinderGeometry(15,3,44,96,40,true),new T.ShaderMaterial({side:T.BackSide,transparent:true,depthWrite:false,uniforms:{clock:{value:0},fade:{value:1}},vertexShader:'uniform float clock;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float swell=.30*sin(uv.x*50.265+uv.y*34.-clock*4.)+.17*sin(uv.x*87.96-uv.y*54.+clock*2.);p.xz*=1.+swell*.22;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:`varying vec2 vUv;uniform float clock,fade;void main(){float phase=vUv.x*50.265+vUv.y*29.-clock*4.9;float bands=sin(phase+.54*sin(phase*2.+vUv.y*21.));float ribs=pow(.5+.5*bands,7.);float ripples=sin(vUv.y*150.+sin(vUv.x*75.4+clock)*2.-clock*7.);float foam=pow(max(0.,ripples*ribs),3.);gl_FragColor=vec4(mix(vec3(.012,.06,.11),vec3(.19,.65,.72),ribs*.62)+foam*.25,(.25+ribs*.29+foam*.11)*fade);}`}));tube.position.y=-22;funnel.add(tube);
 const water=new T.Mesh(new T.PlaneGeometry(190,190,120,120),new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,uniforms:{clock:{value:0}},
 vertexShader:`uniform float clock;varying vec3 p;void main(){p=position;float r=length(p.xy),sw=sin(atan(p.y,p.x)*5.+r*2.3-clock*3.8);p.z=(sin(p.x*.86+clock*1.1)+cos(p.y*.68-clock*.73))*.12+sw*.15*exp(-r*.16)-1.45*exp(-r*r*.21);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float clock;varying vec3 p;void main(){float r=length(p.xy),a=atan(p.y,p.x),wave=sin(r*4.2+a*5.-clock*4.5+sin(r*7.-clock)*.25);float white=pow(max(0.,wave),12.)*exp(-r*.16);vec3 n=normalize(cross(dFdx(p),dFdy(p)));float glint=pow(abs(dot(n,normalize(vec3(.2,.35,1.)))),13.);float hole=smoothstep(.35,2.3,r);float halo=exp(-r*.085);float flow=.5+.5*sin(a*5.+r*1.16-clock*2.4);vec3 c=mix(vec3(.008,.025,.095),vec3(.048,.22,.47),halo*(.28+flow*.5)+glint*.08)+vec3(.34,.72,.97)*(white*1.10+.18*exp(-pow((r-11.8)*.8,2.))*(.5+.5*sin(a*12.-clock*2.4)));gl_FragColor=vec4(c,hole*.98);}`}));
 water.rotation.x=-Math.PI/2;water.renderOrder=-3;funnel.add(water);

 const eye={r:5,a:0,z:1,vr:0,spin:0,vz:0};let elapsed=0;const eyePos=new T.Vector3(),aim=new T.Vector3(),direction=new T.Vector3();
 function seed(p,i){p.r=1+Math.random()*11;p.a=Math.random()*Math.PI*2;p.z=4-Math.random()*44;p.vr=p.spin=p.vz=0;const c=new T.Color(i<90?'#ffd5df':i%4===0?'#d0fbff':'#55bccd');colors.set([c.r,c.g,c.b],i*3);}
 for(let i=0;i<count;i++){const p={};seed(p,i);particles.push(p);}
 // A regularized vortex: conserved circulation away from the core, a
 // smooth inward sink and axial jet. Inertial bodies relax toward the flow.
 function step(p,dt){const r=Math.max(.12,p.r),core=r*r+.48,tangent=5.2*r/core,radial=-1.35-.6*r/core,axial=-5.9-3.1/core;
  const response=1-Math.exp(-dt*3.5);p.vr+=(radial-p.vr)*response;p.spin+=(tangent/r-p.spin)*response;p.vz+=(axial-p.vz)*response;p.r=Math.max(.13,r+p.vr*dt);p.a+=p.spin*dt;p.z+=p.vz*dt;}
 return {scene,settle(t){funnel.rotation.x=0;water.material.uniforms.clock.value=t;foam.visible=points.visible=petals.visible=tube.visible=false;water.visible=true;},start(){foam.visible=points.visible=petals.visible=tube.visible=true;elapsed=0;Object.assign(eye,{r:4.6,a:.32,z:6,vr:-.4,spin:.22,vz:-3});particles.forEach(seed);},tick(dt,view=camera){dt*=.84;elapsed=Math.min(3.65,elapsed+dt);const n=Math.max(1,Math.ceil(dt*120));for(let j=0;j<n;j++)step(eye,dt/n);for(let i=0;i<count;i++){const p=particles[i];for(let j=0;j<n;j++)step(p,dt/n);if(p.z<-45||p.r<.22)seed(p,i);const x=Math.cos(p.a)*p.r,y=Math.sin(p.a)*p.r;positions.set([x,p.z+2.4,-y],i*3);const delay=.045+(i%7)*.012,pa=p.a-p.spin*delay,pr=p.r-p.vr*delay;streaks.set([x,p.z+2.4,-y,Math.cos(pa)*pr,p.z-p.vz*delay+2.4,-Math.sin(pa)*pr],i*6);if(i<90){dummy.position.set(x,p.z+2.4,-y);dummy.rotation.set(elapsed+i,p.a,elapsed*.8);dummy.scale.set(.11,.065,.018);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}}geo.attributes.position.needsUpdate=streakGeo.attributes.position.needsUpdate=true;petals.instanceMatrix.needsUpdate=true;tube.material.uniforms.clock.value=elapsed;
 const x=Math.cos(eye.a)*eye.r,z=-Math.sin(eye.a)*eye.r,y=eye.z+2.4;
 water.material.uniforms.clock.value=elapsed;
 const turn=T.MathUtils.smoothstep(elapsed,0,1.30),level=T.MathUtils.smoothstep(elapsed,2.50,3.65);
 funnel.rotation.x=(1-turn)*Math.PI*.5;
 funnel.updateMatrixWorld(true);
 eyePos.set(x,y,z);funnel.localToWorld(eyePos);
 aim.set(-Math.sin(eye.a)*.28,y-7,-Math.cos(eye.a)*.28);funnel.localToWorld(aim);
 direction.copy(aim).sub(eyePos).normalize().lerp(new T.Vector3(0,.04,-1),level).normalize();
 view.position.copy(eyePos);view.up.set(0,level,-(1-level)).normalize().applyQuaternion(funnel.quaternion);view.lookAt(aim.copy(eyePos).add(direction));view.up.set(0,1,0);
 const roll=2*Math.PI*T.MathUtils.smoothstep(elapsed,1.22,3.57)+.27*Math.sin(eye.a)*Math.sin(Math.PI*elapsed/3.65);
 view.rotateZ(roll);
 if(elapsed>2.35){const fade=1-T.MathUtils.smoothstep(elapsed,2.35,3.6);petals.material.opacity=fade;points.material.opacity=fade*.8;foam.material.opacity=fade*.26;tube.material.uniforms.fade.value=fade;}
 else{petals.material.opacity=1;points.material.opacity=.8;foam.material.opacity=.26;tube.material.uniforms.fade.value=1;}
 return Math.min(1,elapsed/3.65);}};
}
