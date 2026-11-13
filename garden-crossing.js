import * as THREE from './vendor/three.module.js';

const palettes = [
  ['#852343', '#cb4270', '#f386a5', '#ffb7bf', '#ffe2d7'],
  ['#985354', '#dc826d', '#ffb896', '#ffdbaf', '#fff0da'],
  ['#4d326c', '#8452a6', '#bc7ec5', '#e2a7df', '#ffe2f1'],
  ['#a34246', '#da665e', '#f8a779', '#ffc783', '#fff2bd'],
];

function petalGeometry() {
  const geometry = new THREE.PlaneGeometry(1, 1, 5, 5);
  const points = geometry.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const u = points.getX(i) * 2;
    const v = points.getY(i) + .5;
    const width = Math.sin(Math.PI * v * .83) ** .8;
    points.setXYZ(i, u * width * .49, v, .22 * v * v + u * u * width * .17);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createGardenCrossing() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(53, 1, .07, 110);
  const group = new THREE.Group();
  scene.add(group, new THREE.HemisphereLight('#fff1da', '#42596a', 2.2));
  const sun = new THREE.DirectionalLight('#ffe2ae', 3.1);
  sun.position.set(-5, 8, -4);
  const fill = new THREE.DirectionalLight('#c4dfff', 1.4);
  fill.position.set(3, 3, 8);
  scene.add(sun, fill);

  const petal = petalGeometry();
  const petalMaterial = new THREE.MeshStandardMaterial({side:THREE.DoubleSide, roughness:.72});
  const leafMaterial = new THREE.MeshStandardMaterial({side:THREE.DoubleSide, roughness:.52});
  const wood = new THREE.MeshStandardMaterial({color:'#473127', roughness:.9});
  const vine = new THREE.MeshStandardMaterial({color:'#455533', roughness:.77});
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const forward = new THREE.Vector3(0,0,1);
  let seed = 391, progress = 0, visible = false;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const vary = (a,b) => THREE.MathUtils.lerp(a,b,random());
  const pick = values => values[Math.floor(random()*values.length)];
  const arches = [];

  function tube(parent, points, radius, material) {
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 72, radius, 7), material));
  }

  for (let index = 0; index < palettes.length; index++) {
    const arch = new THREE.Group();
    const depth = -index * 5.8;
    const radius = 3.8 - index * .55;
    arch.position.set(0, 0, depth);
    group.add(arch);
    arches.push(arch);
    const curve = t => new THREE.Vector3(radius * Math.cos(t), radius * Math.sin(t), 0);
    for (const side of [-1, 1]) {
      const rail = Array.from({length:49}, (_, i) => {
        const p = curve(i / 48 * Math.PI * 2);
        p.z = side * .32;
        return p;
      });
      tube(arch, rail, .081, wood);
      const tendril = rail.map((p,i) => p.clone().add(new THREE.Vector3(Math.sin(i*.85)*.15, Math.cos(i*.67)*.12, Math.sin(i*.92)*.23)));
      tube(arch, tendril, .037, vine);
    }

    const leaves = new THREE.InstancedMesh(petal, leafMaterial, 290);
    const flowers = new THREE.InstancedMesh(petal, petalMaterial, 1980);
    const greens = ['#293325','#3e432b','#535032','#686346','#63504b'];
    let leafIndex = 0, flowerIndex = 0;
    for (let i = 0; i < leaves.count; i++) {
      const p = curve(vary(0,Math.PI*2));
      dummy.position.set(p.x+vary(-.46,.46),p.y+vary(-.39,.39),vary(-.68,.68));
      dummy.rotation.set(vary(-1.5,1.5),vary(-1.4,1.4),vary(0,Math.PI*2));
      const size = vary(.17,.54);
      dummy.scale.set(size*.64,size,size*.53);
      dummy.updateMatrix();
      leaves.setMatrixAt(leafIndex,dummy.matrix);
      leaves.setColorAt(leafIndex++,color.set(pick(greens)));
    }
    const rose = new THREE.Object3D();
    const centerColor = new THREE.Color();
    for (let i = 0; i < 90; i++) {
      const t = (i + vary(.05,.95)) / 90 * Math.PI * 2;
      const p = curve(t);
      const trailing = i % 5 === 0;
      rose.position.set(p.x+vary(-.36,.36),p.y+vary(-.37,.33)-(trailing?vary(.1,.55):0),vary(-.28,.75));
      rose.rotation.set(vary(-.62,.62),vary(-.76,.76),vary(0,6.28));
      rose.updateMatrix();
      const size = vary(.16,.34)*(trailing?.84:1);
      const palette = palettes[index];
      centerColor.set(pick(palette));
      for (let j = 0; j < 22; j++) {
        const ring = j < 9 ? 0 : j < 17 ? 1 : 2;
        const a = j * 2.39996;
        const r = size * [.46,.28,.12][ring];
        const length = size * [1.05,.76,.47][ring];
        dummy.position.set(Math.cos(a)*r,Math.sin(a)*r,size*(.06+ring*.18));
        dummy.rotation.set(.32+ring*.24+vary(-.12,.12),0,0);
        dummy.rotateOnWorldAxis(forward,a-Math.PI/2);
        dummy.scale.set(length*1.18,length,length);
        dummy.updateMatrix();
        flowers.setMatrixAt(flowerIndex,dummy.matrix.premultiply(rose.matrix));
        flowers.setColorAt(flowerIndex++,color.set(palette[Math.min(4,ring+Math.floor(vary(0,3)))]).lerp(centerColor,.34));
      }
    }
    arch.add(leaves,flowers);
  }

  // A depth-independent matte hides the outgoing scene before the garden is ready.
  const floating = new THREE.InstancedMesh(petal, petalMaterial, 88);
  floating.frustumCulled = false;
  const drifting = Array.from({length:floating.count}, (_, i) => {
    floating.setColorAt(i,color.set(pick(palettes[i%palettes.length])));
    return {x:vary(-4,4),y:vary(-3,3),z:vary(-20,6),phase:vary(0,6.28),size:vary(.04,.14)};
  });
  scene.add(floating);
  const matteMaterial = new THREE.ShaderMaterial({
    transparent:true, depthTest:false, depthWrite:false,
    uniforms:{opening:{value:0},aspect:{value:1},opacity:{value:1}},
    vertexShader:`varying vec2 screenUV;
      void main(){ screenUV=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
    fragmentShader:`varying vec2 screenUV;
      uniform float opening, aspect, opacity;
      void main(){
        vec2 p=screenUV-.5; p.x*=aspect;
        float r=length(p);
        float aura=exp(-r*r*7.0);
        vec3 c=mix(vec3(.023,.039,.028),vec3(.17,.16,.075),aura);
        float fade=1.0-smoothstep(0.0,.032,opening);
        float edge=smoothstep(opening-.025,opening+.035,r);
        float halo=exp(-abs(r-opening)*47.0)*smoothstep(.01,.065,opening)*(1.0-smoothstep(.24,.55,opening));
        c+=vec3(.67,.36,.14)*halo;
        gl_FragColor=vec4(c,max(mix(edge,1.0,fade),halo*.32)*opacity);
      }`,
  });
  const matte = new THREE.Mesh(new THREE.PlaneGeometry(2,2),matteMaterial);
  matte.frustumCulled = false;
  matte.renderOrder = 1000;
  const backdrop = new THREE.Scene();
  backdrop.add(matte);
  const smooth = THREE.MathUtils.smoothstep;

  return {
    show(value = 0) { visible = true; progress = value; },
    paint(value) { progress = value; },
    hide() { visible = false; },
    render(renderer) {
      if (!visible) return;
      const aspect = innerWidth / innerHeight;
      if (camera.aspect !== aspect) {
        camera.aspect = aspect;
        camera.fov = aspect < .8 ? 62 : 53;
        camera.updateProjectionMatrix();
      }
      const z = 13 - 35 * progress ** 1.38;
      const sway = Math.sin(progress*Math.PI)*.13;
      camera.position.set(sway,0,z);
      camera.lookAt(0,0,z-15);
      for (let i = 0; i < arches.length; i++) {
        const growth = smooth(progress,.03+i*.073,.24+i*.075);
        arches[i].scale.setScalar(.12+.88*growth);
        arches[i].rotation.z = (1-growth)*(.48-i*.27);
        arches[i].visible = growth > 0;
      }
      drifting.forEach(({x,y,z,phase,size}, i) => {
        dummy.position.set(x+Math.sin(phase+progress*6)*.36,y-progress*1.4,z+progress*1.1);
        dummy.rotation.set(phase+progress*5,phase-progress*7,phase+progress*3);
        dummy.scale.setScalar(size*smooth(progress,.08,.3));
        dummy.updateMatrix();
        floating.setMatrixAt(i,dummy.matrix);
      });
      floating.instanceMatrix.needsUpdate = true;
      floating.visible = progress < .98;
      const farDistance = Math.max(.1,z+17.4);
      const projectedOpening = 1.85 / (2*farDistance*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
      matteMaterial.uniforms.opening.value = smooth(progress,.32,.40) * projectedOpening
        + smooth(progress,.70,.94) * (aspect*.56+.56);
      matteMaterial.uniforms.aspect.value = aspect;
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      try {
        if (progress >= .09 && progress < .95) {
          // Ease in over the preceding scene before opening onto the garden.
          matteMaterial.uniforms.opacity.value = smooth(progress,.09,.29);
          renderer.render(backdrop,camera);
        }
        renderer.clearDepth();
        renderer.render(scene,camera);
      } finally {
        renderer.autoClear = autoClear;
      }
    },
  };
}
