// Bump the cache version whenever the offline bundle changes.
const cacheName='portfolio-offline-v19';
const files=[
 './index.html',
 './city.html',
 './city.css',
 './city.js',
 './city-scene.js',
 './city-traffic.js',
 './city-lift.js',
 './style.css',
 './about-envelope.js',
 './about-stop.js',
 './botanical-garden.js',
 './garden-breeze.js',
 './garden-bridge.js',
 './garden-butterflies.js',
 './garden-carriage.js',
 './garden-crossing.js',
 './garden-exit.js',
 './garden-home.js',
 './garden-lakeside.js',
 './garden-plant-geometry.js',
 './garden-rower.js',
 './garden-tree-form.js',
 './home-audio.js',
 './home-intro.js',
 './marine-bloom.js',
 './marine-creatures.js',
 './marine-discoveries.js',
 './marine-fish.js',
 './marine-floor-life.js',
 './marine-home.js',
 './marine-life.js',
 './marine-particle-map.js',
 './marine-relics.js',
 './marine-shark.js',
 './marine-shells.js',
 './marine-skills.js',
 './marine-vortex.js',
 './marine-wildlife.js',
 './marine-world.js',
 './portal-six.js',
 './project-treasures.js',
 './render-quality.js',
 './scene-resources.js',
 './season-portal.js',
 './snow-squall.js',
 './snowman-home.js',
 './winter-aurora.js',
 './winter-pines.js',
 './winter.js',
 './vendor/gsap.min.js',
 './vendor/three.core.js',
 './vendor/three.module.js',
 './assets/audio/garden-birds.mp3',
 './assets/audio/garden-chest.mp3',
 './assets/audio/garden-hooves.mp3',
 './assets/audio/garden-portal.mp3',
 './assets/audio/garden-water.mp3',
 './assets/audio/reef-ambience.mp3',
 './assets/audio/reef-jellyfish.mp3',
 './assets/audio/reef-oyster.mp3',
 './assets/audio/reef-shark.mp3',
 './assets/audio/reef-tree-near.mp3',
 './assets/audio/reef-tree-wake.mp3',
 './assets/audio/snow-squall.mp3',
 './assets/audio/underwater.mp3',
 './assets/audio/whirlpool.mp3',
 './assets/audio/winter.mp3',
 './assets/intro/neon-pupil.jpg',
 './assets/intro/neon-pupil.mp4',
 './assets/intro/pupil-ambience.mp3',
 './assets/isha-about.webp',
];
const localFiles=new Set(files.map(file=>new URL(file,self.registration.scope).pathname));
const entry=new URL('./index.html',self.registration.scope).href;

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(files.map(file=>new Request(file,{cache:'reload'})))).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('portfolio-offline-')&&key!==cacheName).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

async function serve(request,url){
 const cache=await caches.open(cacheName);
 const response=await cache.match(request.mode==='navigate'&&!localFiles.has(url.pathname)?entry:url.origin+url.pathname);
 // Versioned styles and modules should match the HTML that requested them.
 const versionedCode=url.searchParams.has('v')&&/\.(css|js)$/.test(url.pathname);
 if(request.mode==='navigate'||versionedCode||['localhost','127.0.0.1','[::1]'].includes(url.hostname)){
  // Keep local edits and deployed HTML visible while allowing an offline reload.
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),2000);
  try{
   const online=await fetch(request,{signal:controller.signal});
   if(online.ok||!response)return online;
  }catch(error){
   if(!response)throw error;
  }finally{clearTimeout(timeout);}
 }
 if(!response)return fetch(request);
 const range=request.headers.get('range');
 if(!range)return response;
 const bytes=await response.arrayBuffer();
 const size=bytes.byteLength;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range);
 if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 const end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
 if(start>=size||start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 return new Response(bytes.slice(start,end+1),{status:206,headers:{
  'Content-Type':response.headers.get('Content-Type')??'application/octet-stream',
  'Content-Range':'bytes '+start+'-'+end+'/'+size,
  'Content-Length':String(end-start+1),
  'Accept-Ranges':'bytes'
 }});
}

self.addEventListener('fetch',event=>{
 const {request}=event;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'&&url.href.split(/[?#]/)[0]===self.registration.scope||localFiles.has(url.pathname)){
  event.respondWith(serve(request,url));
 }
});
