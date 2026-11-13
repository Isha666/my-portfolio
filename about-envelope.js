export function makeTableEnvelope(THREE, room) {
 const canvas=document.createElement('canvas');
 canvas.width=640;canvas.height=416;
 const ctx=canvas.getContext('2d');
 const paper=ctx.createLinearGradient(0,0,640,416);
 paper.addColorStop(0,'#e8d3a7');paper.addColorStop(1,'#b78f60');
 ctx.fillStyle=paper;ctx.fillRect(0,0,640,416);
 ctx.strokeStyle='#997853';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(0,411);ctx.lineTo(320,161);ctx.lineTo(640,411);ctx.stroke();
 ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(320,220);ctx.lineTo(640,0);ctx.closePath();
 ctx.fillStyle='#dec49a';ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.arc(320,213,31,0,Math.PI*2);ctx.fillStyle='#742e32';ctx.fill();
 ctx.lineWidth=2;ctx.strokeStyle='#ae5d55';ctx.stroke();
 ctx.textAlign='center';ctx.font='italic 30px Georgia';ctx.fillStyle='#64472e';
 ctx.fillText('To you, fellow explorer.',320,320);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const envelope=new THREE.Mesh(new THREE.PlaneGeometry(.86,.56),new THREE.MeshStandardMaterial({map:texture,roughness:.91,side:THREE.DoubleSide}));
 envelope.position.set(0,.874,-.96);envelope.rotation.set(-Math.PI/2,0,-.10);
 room.add(envelope);
 return envelope;
}
