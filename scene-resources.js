// Use only for scenes that own their resources.
export function disposeScene(scene){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 scene.traverse(object=>{
  if(object.isLight&&object.shadow)object.shadow.dispose();
  if(object.geometry)geometries.add(object.geometry);
  if(object.material){
   for(const material of [object.material].flat())materials.add(material);
  }
  if(object.isInstancedMesh)object.dispose();
 });
 for(const material of materials){
  for(const value of Object.values(material)){
   if(value?.isTexture)textures.add(value);
  }
  for(const uniform of Object.values(material.uniforms??{})){
   if(uniform.value?.isTexture)textures.add(uniform.value);
  }
  material.dispose();
 }
 for(const texture of textures)texture.dispose();
 for(const geometry of geometries)geometry.dispose();
 scene.clear();
}
