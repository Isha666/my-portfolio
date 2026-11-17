export function marineParticleMap(THREE){
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=32;
 const ctx=canvas.getContext('2d');
 const glow=ctx.createRadialGradient(16,16,0,16,16,15);
 glow.addColorStop(0,'rgba(255,255,255,1)');
 glow.addColorStop(.30,'rgba(255,255,255,.82)');
 glow.addColorStop(.68,'rgba(255,255,255,.24)');
 glow.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=glow;
 ctx.fillRect(0,0,32,32);
 return new THREE.CanvasTexture(canvas);
}
