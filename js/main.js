import * as THREE from 'three';

// NIGHTFALL — a compact, atmospheric stealth game. Takedowns are implied, never graphic.
const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d11);
scene.fog = new THREE.FogExp2(0x111a1d, 0.019);
const camera = new THREE.PerspectiveCamera(76, innerWidth / innerHeight, 0.08, 180);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const material = (color, roughness=.8, metalness=0, extras={}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extras });
const M = {
  ground: material(0x202929,.96), concrete: material(0x353b39,.92), rust: material(0x49332b,.82), rust2: material(0x302724,.82),
  steel: material(0x252d30,.54,.5), black: material(0x111618,.68,.18), yellow: material(0x948044,.82),
  skin: material(0x988577,.82), uniform: material(0x26312f,.88), vest: material(0x171f20,.78), boots: material(0x111515,.8),
  water: material(0x162529,.2,.4,{transparent:true,opacity:.64}),
};
const world = new THREE.Group(); scene.add(world);
scene.add(new THREE.HemisphereLight(0x93a4ad,0x151713,1.35));
const moon = new THREE.DirectionalLight(0xa6c0d0,2.1);
moon.position.set(-18,30,17); moon.castShadow=true; moon.shadow.mapSize.set(1536,1536);
moon.shadow.camera.left=-48; moon.shadow.camera.right=48; moon.shadow.camera.top=48; moon.shadow.camera.bottom=-48; moon.shadow.bias=-.0003; scene.add(moon);
scene.add(new THREE.AmbientLight(0x50606a,.3));
const lamps=[];
function box(parent,x,y,z,sx,sy,sz,mat,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(parent,x,y,z,r1,r2,h,mat,segments=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
function plane(parent,x,y,z,sx,sz,mat){const o=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),mat);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;}

// Flooded freight yard, assembled from worn modular shapes.
plane(world,0,-.12,0,100,100,M.ground);
for(let i=0;i<38;i++){const x=(Math.random()-.5)*68,z=(Math.random()-.5)*70;if(Math.abs(x)<4&&Math.abs(z)<5)continue;const p=plane(world,x,-.095, z,1+Math.random()*5,.5+Math.random()*2,M.water);p.rotation.z=Math.random()*Math.PI;}
for(let z=-34;z<36;z+=7)box(world,0,-.08,z,74,.06,.12,M.black,false);
function wall(x,z,w,h,d=1){box(world,x,h/2,z,w,h,d,M.concrete);for(let y=1;y<h;y+=2.6)box(world,x,y,z-d*.51,w,.055,.05,M.steel,false);}
wall(0,-38,76,13);wall(-38,0,1,13,76);wall(38,0,1,13,76);wall(0,38,76,13);
// Exit gate and a soft, welcoming glow.
box(world,-5,2.6,-37.4,.22,5.2,.25,M.steel);box(world,5,2.6,-37.4,.22,5.2,.25,M.steel);box(world,0,5.15,-37.4,10,.22,.25,M.steel);
for(let x=-4.5;x<=4.5;x+=.55)box(world,x,2.5,-37.4,.07,5,.08,M.steel);
const exitGlow=new THREE.Mesh(new THREE.PlaneGeometry(8,4),new THREE.MeshBasicMaterial({color:0x9cae8c,transparent:true,opacity:.16,side:THREE.DoubleSide}));exitGlow.position.set(0,2,-37.25);world.add(exitGlow);
function container(x,z,w,d,h,color){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);const cm=material(color,.72,.36);box(g,0,h/2,0,w,h,d,cm);for(let xx=-w/2+.24;xx<w/2;xx+=.48)box(g,xx,h/2,d/2+.035,.035,h-.18,.06,M.rust2,false);for(const xx of [-w/2+.1,w/2-.1])box(g,xx,h/2,d/2+.06,.14,h,.14,M.steel);for(const yy of [.18,h-.18])box(g,0,yy,d/2+.065,w,.14,.12,M.steel);for(let yy=1.1;yy<h-1;yy+=1.2)box(g,0,yy,d/2+.085,w*.3,.025,.02,M.yellow,false);}
container(-21,-20,18,8,7.4,0x37423e);container(17,-22,17,8,7.4,0x403631);container(1,-29,14,7,7.2,0x343d3a);
container(-23,2,18,8,7.2,0x44332b);container(22,4,18,8,7.2,0x34413e);
container(-16,23,19,8,7.3,0x39413b);container(14,24,17,8,7.3,0x493a30);
container(-30,-9,10,7,5.2,0x3b4039);container(30,-9,10,7,5.2,0x3c3630);
for(const x of [-32,-24,24,32]){box(world,x,6.6,-36.8,5,10,.42,M.black);box(world,x,4.2,-36.5,4.4,4.3,.15,M.steel);for(let y=2.3;y<6.2;y+=.42)box(world,x,y,-36.37,4.2,.045,.04,M.black,false);}
for(const [x,z] of [[-10,-9],[11,-8],[-8,10],[9,13],[-29,15],[29,17]]){box(world,x,.7,z,2.5,1.4,1.15,M.rust);box(world,x,1.45,z,2.2,.12,1,M.steel);for(let i=0;i<3;i++)box(world,x-1+i,.12,z+.62,.04,.17,.04,M.yellow,false);}
for(const [x,z] of [[-11,1],[12,0],[-29,-27],[29,-28]]){cylinder(world,x,.55,z,.9,.9,1.1,M.rust);cylinder(world,x,.57,z,.95,.95,.08,M.steel);cylinder(world,x,.58,z,.5,.5,.09,M.black);}
for(const [x,z] of [[-30,-2],[30,-1],[-4,-33],[4,32],[-32,30],[32,29]]){cylinder(world,x,5,z,.12,.17,10,M.black,10);box(world,x,10,z,.8,.18,.35,M.steel);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8),new THREE.MeshBasicMaterial({color:0xffd69a}));bulb.position.set(x,9.82,z);world.add(bulb);const l=new THREE.PointLight(0xffbd73,21,20,1.6);l.position.set(x,9.5,z);scene.add(l);lamps.push({light:l,base:21,phase:Math.random()*9});const beam=new THREE.Mesh(new THREE.ConeGeometry(5,13,20,1,true),new THREE.MeshBasicMaterial({color:0xffbe7b,transparent:true,opacity:.028,side:THREE.DoubleSide,depthWrite:false}));beam.position.set(x,3.8,z);beam.rotation.x=Math.PI;world.add(beam);}
for(let x=-35;x<=35;x+=2.1){if(Math.abs(x)<5)continue;cylinder(world,x,1.6,-35.7,.035,.035,3.2,M.steel,6);}
for(let y of [.5,1.3,2.1,2.9])box(world,0,y,-35.7,66,.035,.035,M.steel,false);

// Stylized rain streaks.
const rainCount=900,rainPos=new Float32Array(rainCount*3),rainVel=new Float32Array(rainCount);
for(let i=0;i<rainCount;i++){rainPos[i*3]=(Math.random()-.5)*85;rainPos[i*3+1]=Math.random()*28;rainPos[i*3+2]=(Math.random()-.5)*82;rainVel[i]=10+Math.random()*13;}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
scene.add(new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xa7bdc3,size:.055,transparent:true,opacity:.42,depthWrite:false})));

const player={x:0,z:30,yaw:0,pitch:0,health:100,crouch:false,sprinting:false,dead:false,won:false,active:false,moveX:0,moveZ:0};
camera.position.set(player.x,1.67,player.z);
const knifeRig=new THREE.Group();camera.add(knifeRig);knifeRig.position.set(.35,-.3,-.58);
const blade=new THREE.Mesh(new THREE.BoxGeometry(.055,.34,.025),material(0xaeb8bb,.2,.82));blade.position.set(0,.12,0);blade.rotation.z=-.42;knifeRig.add(blade);
const handle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.22,8),M.black);handle.position.set(.06,-.12,0);handle.rotation.z=-.1;knifeRig.add(handle);
const guardBar=new THREE.Mesh(new THREE.BoxGeometry(.16,.035,.06),M.steel);guardBar.position.set(.02,-.015,0);guardBar.rotation.z=-.1;knifeRig.add(guardBar);
let knifeAnim=0,knifeCooldown=0;

// Guards walk deliberate patrol loops. Their alert cones are visible, stylized telegraphs.
const routes=[
 [[-29,-25],[-8,-24],[-8,-14],[-28,-13]],[[25,-27],[7,-26],[7,-18],[25,-17]],
 [[-29,9],[-8,9],[-8,17],[-28,17]],[[29,9],[8,9],[8,18],[29,18]],
 [[-4,-4],[4,-4],[4,6],[-4,6]],[[-30,29],[-12,29],[-12,22],[-29,22]]
];
const guards=[];
function makeGuard(idx,pos){const g=new THREE.Group();world.add(g);g.position.set(pos[0],0,pos[1]);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.29,.82,4,8),M.uniform);body.position.y=1.1;body.castShadow=true;g.add(body);
 const vest=new THREE.Mesh(new THREE.BoxGeometry(.48,.52,.28),M.vest);vest.position.set(0,1.17,-.02);vest.castShadow=true;g.add(vest);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),M.skin);head.position.y=1.88;head.castShadow=true;g.add(head);
 const helmet=new THREE.Mesh(new THREE.SphereGeometry(.25,12,7,0,Math.PI*2,0,Math.PI*.56),M.black);helmet.position.y=2.02;helmet.castShadow=true;g.add(helmet);
 const visor=new THREE.Mesh(new THREE.BoxGeometry(.29,.085,.12),material(0x11191b,.22,.3,{emissive:0x18272a,emissiveIntensity:.3}));visor.position.set(0,1.96,-.19);g.add(visor);
 for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.62,3,6),M.boots);leg.position.set(side*.14,.4,0);leg.castShadow=true;g.add(leg);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.49,3,6),M.uniform);arm.position.set(side*.37,1.2,-.01);arm.rotation.z=side*.16;g.add(arm);}
 const cone=new THREE.Mesh(new THREE.ConeGeometry(3.2,13,22,1,true),new THREE.MeshBasicMaterial({color:0xffb655,transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false}));cone.position.set(0,1.15,-6.2);cone.rotation.x=-Math.PI/2;g.add(cone);
 const ring=new THREE.Mesh(new THREE.CircleGeometry(.65,24),new THREE.MeshBasicMaterial({color:0xe69d47,transparent:true,opacity:.08,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.02;g.add(ring);
 guards.push({group:g,idx,route:routes[idx],point:1,state:'patrol',timer:Math.random()*2,alert:0,alive:true,speed:1.55+Math.random()*.24,ring,cone,lastKnown:null,hitCooldown:0});
}
for(let i=0;i<routes.length;i++)makeGuard(i,routes[i][0]);
const obstacles=[];
for(const [x,z,w,d] of [[-21,-20,18,8],[17,-22,17,8],[1,-29,14,7],[-23,2,18,8],[22,4,18,8],[-16,23,19,8],[14,24,17,8],[-30,-9,10,7],[30,-9,10,7],[-38,0,1,76],[38,0,1,76],[0,-38,76,1],[0,38,76,1]])obstacles.push({x,z,w,d});
function blocked(x,z,r=.38){return obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);}

const $=s=>document.querySelector(s);
const ui={title:$('#titleScreen'),hud:$('#hud'),cross:$('#crosshair'),prompt:$('#prompt'),objSub:$('#objSub'),health:$('#healthBar i'),healthNum:$('#healthNum'),detect:$('#detect'),detectBar:$('#detectBar i'),detectText:$('#detectText'),kills:$('#kills b'),death:$('#deathScreen'),win:$('#winScreen'),pause:$('#pauseScreen'),mobile:$('#mobile'),subtitle:$('#subtitle'),blood:$('#bloodScreen')};
let kills=0,elapsed=0,subtitleTimer=0,nearGuard=null,screenMode='title';
function subtitle(text,seconds=3){ui.subtitle.textContent=text;ui.subtitle.classList.add('on');subtitleTimer=seconds;}
function updateObjective(){ui.objSub.textContent=kills===6?'REACH THE NORTH GATE':`${kills} / 6 GUARDS NEUTRALIZED`;}
function setMode(mode){screenMode=mode;player.active=mode==='play';ui.title.classList.toggle('gone',mode!=='title');if(mode!=='title')setTimeout(()=>ui.title.classList.add('hidden'),950);else ui.title.classList.remove('hidden');ui.hud.classList.toggle('hidden',mode==='title');ui.cross.classList.toggle('hidden',mode!=='play');const mobileOn=mode==='play'&&('ontouchstart'in window);ui.mobile.classList.toggle('on',mobileOn);ui.mobile.classList.toggle('hidden',!mobileOn);ui.death.classList.toggle('hidden',mode!=='dead');ui.win.classList.toggle('hidden',mode!=='win');ui.pause.classList.toggle('hidden',mode!=='pause');}
function reset(){player.x=0;player.z=30;player.yaw=0;player.pitch=0;player.health=100;player.dead=false;player.won=false;player.crouch=false;kills=0;elapsed=0;ui.kills.textContent='0';ui.health.style.width='100%';ui.healthNum.textContent='100';updateObjective();guards.forEach(g=>{g.group.position.set(g.route[0][0],0,g.route[0][1]);g.group.rotation.set(0,0,0);g.alive=true;g.state='patrol';g.point=1;g.timer=Math.random()*2;g.alert=0;g.lastKnown=null;g.ring.visible=true;g.cone.visible=true;g.group.visible=true;});}
function startGame(){reset();setMode('play');if(innerWidth>760)canvas.requestPointerLock?.();}
$('#playBtn').addEventListener('click',startGame);
document.querySelectorAll('.restart').forEach(b=>b.addEventListener('click',startGame));
$('#resumeBtn').addEventListener('click',()=>{setMode('play');if(innerWidth>760)canvas.requestPointerLock?.();});
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&screenMode==='play'){setMode('pause');document.exitPointerLock?.();}else if(e.code==='Escape'&&screenMode==='pause'){setMode('play');canvas.requestPointerLock?.();}if(e.code==='KeyC'&&screenMode==='play')player.crouch=!player.crouch;if(e.code==='KeyF'&&screenMode==='play')execute();});
addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===canvas&&screenMode==='pause')setMode('play');});
addEventListener('mousemove',e=>{if(screenMode==='play'&&document.pointerLockElement===canvas){player.yaw-=e.movementX*.0022;player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*.0019,-1.2,1.2);}});
let lastTouch=null;
canvas.addEventListener('pointerdown',e=>{if(screenMode!=='play')return;if(e.pointerType==='touch'){lastTouch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}else if(e.button===0)slash();});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&lastTouch&&screenMode==='play'){const dx=e.clientX-lastTouch.x,dy=e.clientY-lastTouch.y;player.yaw-=dx*.006;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*.005,-1.2,1.2);lastTouch={x:e.clientX,y:e.clientY};}});
canvas.addEventListener('pointerup',e=>{if(e.pointerType==='touch')lastTouch=null;});

// Touch movement stick and action buttons.
const stick=$('#stick'),nub=$('#stickNub');let stickId=null;
stick.addEventListener('pointerdown',e=>{stickId=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickId)moveStick(e);});
stick.addEventListener('pointerup',e=>{if(e.pointerId===stickId){stickId=null;player.moveX=player.moveZ=0;nub.style.transform='translate(0,0)';}});
function moveStick(e){const r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.min(48,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);player.moveX=Math.cos(a)*len/48;player.moveZ=Math.sin(a)*len/48;nub.style.transform=`translate(${Math.cos(a)*len}px,${Math.sin(a)*len}px)`;}
$('#btnSlash').addEventListener('pointerdown',e=>{e.preventDefault();slash();});$('#btnExec').addEventListener('pointerdown',e=>{e.preventDefault();execute();});$('#btnCrouch').addEventListener('pointerdown',e=>{e.preventDefault();player.crouch=!player.crouch;e.currentTarget.classList.toggle('active',player.crouch);});

function guardDistance(g){return Math.hypot(g.group.position.x-player.x,g.group.position.z-player.z);}
function canExecute(g){if(!g||!g.alive)return false;const dx=player.x-g.group.position.x,dz=player.z-g.group.position.z,d=Math.hypot(dx,dz);if(d>2.45)return false;const fx=-Math.sin(g.group.rotation.y),fz=-Math.cos(g.group.rotation.y),dot=fx*dx/(d||1)+fz*dz/(d||1);return dot<-.05||g.state==='search'||g.state==='investigate';}
function execute(){if(screenMode!=='play'||!nearGuard||!canExecute(nearGuard))return;const g=nearGuard;g.alive=false;g.state='down';g.ring.visible=false;g.cone.visible=false;kills++;ui.kills.textContent=kills;updateObjective();knifeAnim=1;subtitle('A shadow disappears into the rain.',2.2);g.group.traverse(o=>{if(o.isMesh)o.castShadow=false;});g.group.rotation.x=.8;g.group.position.y=-.12;setTimeout(()=>{if(!g.alive)g.group.visible=false;},1100);if(kills===6)subtitle('The north gate is clear. Reach the extraction.',4);}
function slash(){if(screenMode!=='play'||knifeCooldown>0)return;knifeCooldown=.62;knifeAnim=1;let target=null,best=2.2;for(const g of guards){if(!g.alive)continue;const d=guardDistance(g),dx=g.group.position.x-player.x,dz=g.group.position.z-player.z,angle=Math.atan2(-dx,-dz),diff=Math.abs(Math.atan2(Math.sin(angle-player.yaw),Math.cos(angle-player.yaw)));if(d<best&&diff<.85){best=d;target=g;}}if(target&&canExecute(target)){nearGuard=target;execute();}else if(target&&best<1.6){target.state='investigate';target.lastKnown=[player.x,player.z];target.alert=Math.max(target.alert,.65);subtitle('Too exposed. Get behind them.',1.8);}}
function damage(amount){player.health=Math.max(0,player.health-amount);ui.health.style.width=player.health+'%';ui.healthNum.textContent=Math.ceil(player.health);ui.blood.style.opacity='.6';setTimeout(()=>ui.blood.style.opacity='0',80);if(player.health<=0){player.dead=true;setMode('dead');document.exitPointerLock?.();}}
function finish(){if(screenMode!=='play')return;player.won=true;document.exitPointerLock?.();$('#statKills').textContent=kills;const m=Math.floor(elapsed/60),s=Math.floor(elapsed%60);$('#statTime').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;$('#statSilent').textContent=kills===6?'S':'A';setMode('win');}
function hasLine(x1,z1,x2,z2){const dx=x2-x1,dz=z2-z1,dist=Math.hypot(dx,dz),steps=Math.ceil(dist*2);for(let i=1;i<steps;i++){if(blocked(x1+dx*i/steps,z1+dz*i/steps,.1))return false;}return true;}

function updateGuards(dt){let maxAlert=0,spotted=false;nearGuard=null;let closest=99;
 for(const g of guards){if(!g.alive)continue;const gx=g.group.position.x,gz=g.group.position.z;let target=null;
  if(g.state==='patrol'){target=g.route[g.point];if(Math.hypot(gx-target[0],gz-target[1])<.6){g.point=(g.point+1)%g.route.length;g.timer=1.1;}}
  if(g.timer>0)g.timer-=dt;
  const dx=player.x-gx,dz=player.z-gz,d=Math.hypot(dx,dz),fx=-Math.sin(g.group.rotation.y),fz=-Math.cos(g.group.rotation.y),dot=(dx/(d||1))*fx+(dz/(d||1))*fz;
  const visible=d<17&&dot>(player.crouch?.45:.1)&&hasLine(gx,gz,player.x,player.z),loud=d<(player.sprinting?22:player.crouch?4:9),seen=visible&&(!player.crouch||d<5.4);
  if(seen||loud){g.alert=Math.min(1,g.alert+dt*(seen?(.36+(player.sprinting?.85:0)):.16));g.lastKnown=[player.x,player.z];}else g.alert=Math.max(0,g.alert-dt*(g.state==='chase'?.08:.2));
  maxAlert=Math.max(maxAlert,g.alert);
  if(g.alert>.92){g.state='chase';target=[player.x,player.z];}
  else if(g.alert>.26){if(g.state==='patrol')g.state='investigate';target=g.lastKnown;}
  else if(g.state==='investigate'&&g.lastKnown){target=g.lastKnown;if(Math.hypot(gx-target[0],gz-target[1])<1.1){g.state='search';g.timer=2.8;}}
  else if(g.state==='search'&&g.timer<=0){g.state='patrol';g.lastKnown=null;}
  if(g.state==='chase'){if(d<1.55){g.hitCooldown-=dt;if(g.hitCooldown<=0){damage(9+Math.random()*5);g.hitCooldown=1.15;}}else target=[player.x,player.z];}
  if(target&&g.state!=='search'){const vx=target[0]-gx,vz=target[1]-gz,l=Math.hypot(vx,vz);if(l>.2){const speed=g.state==='chase'?2.7:g.state==='investigate'?1.9:g.speed,nx=gx+vx/l*speed*dt,nz=gz+vz/l*speed*dt;if(!blocked(nx,gz,.34))g.group.position.x=nx;if(!blocked(g.group.position.x,nz,.34))g.group.position.z=nz;g.group.rotation.y=Math.atan2(-vx,-vz);}}
  g.ring.material.opacity=g.state==='chase'?.18:g.state==='investigate'?.13:.07;g.ring.material.color.set(g.state==='chase'?0xe23a34:g.state==='investigate'?0xffbc5c:0xe69d47);
  if(d<closest&&d<2.6){closest=d;nearGuard=g;}if(g.state==='chase')spotted=true;
 }
 ui.detect.classList.toggle('suspect',maxAlert>.18&&!spotted);ui.detect.classList.toggle('spotted',spotted);ui.detectBar.style.width=(maxAlert*100)+'%';ui.detectText.textContent=spotted?'COMPROMISED':maxAlert>.18?'SUSPICIOUS':'HIDDEN';ui.prompt.classList.toggle('hidden',!(nearGuard&&canExecute(nearGuard)));ui.objSub.classList.toggle('alert',spotted);
}

const minimap=$('#minimap'),mapCtx=minimap.getContext('2d');
function drawMinimap(){
 const c=mapCtx,w=minimap.width,h=minimap.height,scale=w/80;
 c.clearRect(0,0,w,h);c.fillStyle='rgba(8,13,15,.88)';c.fillRect(0,0,w,h);
 const px=x=>w/2+x*scale,py=z=>h/2+z*scale;
 c.strokeStyle='rgba(164,179,174,.22)';c.lineWidth=1;
 for(let x=-30;x<=30;x+=15){c.beginPath();c.moveTo(px(x),0);c.lineTo(px(x),h);c.stroke();}
 for(let z=-30;z<=30;z+=15){c.beginPath();c.moveTo(0,py(z));c.lineTo(w,py(z));c.stroke();}
 c.fillStyle='rgba(122,133,126,.38)';
 for(const o of obstacles){if(o.w>2&&o.d>2&&Math.abs(o.x)<35&&Math.abs(o.z)<35)c.fillRect(px(o.x-o.w/2),py(o.z-o.d/2),o.w*scale,o.d*scale);}
 c.strokeStyle='rgba(181,199,177,.8)';c.lineWidth=2;c.beginPath();c.moveTo(px(-5),py(-36));c.lineTo(px(-5),py(-39));c.moveTo(px(5),py(-36));c.lineTo(px(5),py(-39));c.stroke();
 for(const g of guards){if(!g.alive)continue;c.fillStyle=g.state==='chase'?'#f24a45':g.state==='investigate'?'#ffc36d':'#d7a24f';c.beginPath();c.arc(px(g.group.position.x),py(g.group.position.z),2.6,0,Math.PI*2);c.fill();}
 const x=px(player.x),y=py(player.z);c.save();c.translate(x,y);c.rotate(-player.yaw);c.fillStyle='#e7e8d9';c.beginPath();c.moveTo(0,-6);c.lineTo(4,5);c.lineTo(0,3);c.lineTo(-4,5);c.closePath();c.fill();c.restore();
}
function movePlayer(dt){
 const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-player.moveZ;
 const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+player.moveX;
 const length=Math.hypot(forward,side);player.sprinting=!!(keys.ShiftLeft||keys.ShiftRight)&&!player.crouch&&length>.1;
 if(length>.01){const f=forward/Math.max(1,length),s=side/Math.max(1,length),speed=player.sprinting?6.2:player.crouch?1.65:3.35;
  const dx=(-Math.sin(player.yaw)*f+Math.cos(player.yaw)*s)*speed*dt,dz=(-Math.cos(player.yaw)*f-Math.sin(player.yaw)*s)*speed*dt;
  const nx=THREE.MathUtils.clamp(player.x+dx,-36.8,36.8),nz=THREE.MathUtils.clamp(player.z+dz,-36.8,36.8);
  if(!blocked(nx,player.z,.38))player.x=nx;if(!blocked(player.x,nz,.38))player.z=nz;
 }
 const targetY=player.crouch?1.05:1.67;camera.position.set(player.x,targetY,player.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
 if(length>.1){const bob=Math.sin(performance.now()*.012*(player.sprinting?1.5:1))*(player.crouch?.012:.025);camera.position.y+=bob;}
}
function updateGame(dt){
 if(screenMode==='play'){
  elapsed+=dt;knifeCooldown=Math.max(0,knifeCooldown-dt);movePlayer(dt);updateGuards(dt);
  if(kills===6&&player.z<-33&&Math.abs(player.x)<6)finish();
  if(subtitleTimer>0){subtitleTimer-=dt;if(subtitleTimer<=0)ui.subtitle.classList.remove('on');}
 }
 knifeAnim=Math.max(0,knifeAnim-dt*3.4);const swing=knifeAnim>0?Math.sin((1-knifeAnim)*Math.PI):0;
 knifeRig.rotation.x=-swing*1.35;knifeRig.rotation.y=-swing*.55;knifeRig.position.y=-.3+swing*.16;
 for(const lamp of lamps){lamp.phase+=dt;lamp.light.intensity=lamp.base*(.94+.06*Math.sin(lamp.phase*2.7));}
 for(let i=0;i<rainCount;i++){const j=i*3;rainPos[j+1]-=rainVel[i]*dt;if(rainPos[j+1]<0){rainPos[j+1]=28;rainPos[j]=player.x+(Math.random()-.5)*85;rainPos[j+2]=player.z+(Math.random()-.5)*82;}}
 rainGeo.attributes.position.needsUpdate=true;drawMinimap();
}
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);updateGame(dt);renderer.render(scene,camera);}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize);
addEventListener('blur',()=>{for(const key in keys)keys[key]=false;});
$('#loading').classList.add('gone');setTimeout(()=>$('#loading').classList.add('hidden'),700);
updateObjective();drawMinimap();animate();
