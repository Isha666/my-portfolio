export function createAurora(THREE){
 const time={value:0};
 const aurora=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
  uniforms:{time},
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`varying vec2 skyUV;
   void main(){skyUV=uv;gl_Position=vec4(position.xy,0.999999,1.0);}`,
  fragmentShader:`uniform float time;
   varying vec2 skyUV;
   void main(){
    float x=skyUV.x;
    float y=(skyUV.y-.53)/.47;
    float drift=time*.15;
    float center=.40+.14*sin(x*9.0+drift)+.07*sin(x*17.0-drift*.6);
    float distance=y-center;
    float width=.105+.027*sin(x*12.0+drift);
    float veil=exp(-pow(abs(distance)/width,2.0));
    float haze=exp(-pow(abs(distance-.12)/.21,2.0));
    float light=.66+.34*sin(x*8.0-drift);
    float fade=smoothstep(.015,.18,y)*(1.-smoothstep(.77,1.,y));
    vec3 green=vec3(.12,.82,.53),blue=vec3(.16,.44,.95),violet=vec3(.62,.22,.86);
    vec3 tint=mix(green,blue,.5+.5*sin(drift+x*8.0));
    tint=mix(tint,violet,smoothstep(-.04,.23,distance)*(.67+.32*sin(drift*.9)));
    // Overlapping bands peak at different places and move at different speeds.
    float broadGlow=.5+.5*cos(x*19.0-time*.39);
    float softGlow=.5+.5*cos(x*12.0+time*.23+1.7);
    float brightness=.32+.43*pow(broadGlow,1.5)+.25*softGlow;
    float upperCurtain=exp(-pow(abs(distance-.26)/.17,2.0));
    gl_FragColor=vec4(tint,fade*light*(veil*.44*brightness+haze*.19*(.58+.42*softGlow)+upperCurtain*.11));
    #include <colorspace_fragment>
   }`
 }));
 aurora.frustumCulled=false;
 aurora.renderOrder=-10;
 return {aurora,time};
}
