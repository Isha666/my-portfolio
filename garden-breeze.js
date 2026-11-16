export function addGardenBreeze(material, clock, strength, flutter=0){
 material.onBeforeCompile=shader=>{
  shader.uniforms.gardenTime=clock;
  shader.vertexShader=`uniform float gardenTime;\n`+shader.vertexShader.replace('#include <project_vertex>',`
   vec4 gardenLocal = vec4(transformed, 1.);
   #ifdef USE_INSTANCING
    gardenLocal = instanceMatrix * gardenLocal;
   #endif
   vec4 gardenWorld = modelMatrix * gardenLocal;
   vec3 p = gardenWorld.xyz;
   float gust = sin(gardenTime*1.24 + p.x*.24 + p.z*.17)
     + .35*sin(gardenTime*2.05 + p.z*.42);
   float flex = ${strength.toFixed(3)};
   float flutter = ${flutter.toFixed(3)} * sin(gardenTime*4.6+p.x*3.+p.z*2.) * clamp(abs(position.y),0.,1.);
   gardenWorld.x += gust*flex + flutter;
   gardenWorld.z += gust*flex*.45;
   vec4 mvPosition = viewMatrix * gardenWorld;
   gl_Position = projectionMatrix * mvPosition;
  `);
 };
 material.customProgramCacheKey=()=>`garden-breeze/${strength}/${flutter}`;
}
