import * as THREE from "three";

const viewport = document.querySelector("#viewport");
const errorPanel = document.querySelector("#error-panel");
const toast = document.querySelector("#toast");
const missionTitle = document.querySelector("#mission-title");
const missionCopy = document.querySelector("#mission-copy");
const missionProgress = document.querySelector("#mission-progress");
const walletLabel = document.querySelector("#wallet");
const hint = document.querySelector("#interaction-hint");
const startOverlay = document.querySelector("#start-overlay");

try { boot(); } catch (error) {
  errorPanel.hidden = false;
  errorPanel.textContent = "NEXT WORLD could not start. Check your internet connection and reload.\n\n" + error.message;
}

function boot() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9bc0c5);
  scene.fog = new THREE.Fog(0x9bc0c5, 65, 190);
  const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, .1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xe7f4ff, 0x65714b, 2.0));
  const sun = new THREE.DirectionalLight(0xffe1ae, 2.2);
  sun.position.set(-35, 65, 28); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
  scene.add(sun);

  const mat = (color, roughness=.9) => new THREE.MeshStandardMaterial({ color, roughness });
  const materials = {
    grass: mat(0x6c8452), asphalt: mat(0x454a48), sand: mat(0xb99c70),
    concrete: mat(0x9d9b8e), cream: mat(0xd9c8a5), rust: mat(0xa95d3c),
    blue: mat(0x477b89), yellow: mat(0xd7ae4c), green: mat(0x52734d),
    dark: mat(0x303936), white: mat(0xe7e0ce), skin: mat(0x8b5439),
    shirt: mat(0x356c58), red: mat(0x9d4437), roof: mat(0x66584b)
  };
  const box = (name, x,y,z, sx,sy,sz, material, cast=true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), material);
    mesh.name=name; mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=true; scene.add(mesh); return mesh;
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220,220), materials.grass);
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  box("main road",0,.025,0,220,.05,12,materials.asphalt,false);
  box("cross road",0,.03,0,12,.05,220,materials.asphalt,false);
  for(let i=-100;i<=100;i+=10){
    box("road marking",i,.06,0,4,.015,.16,materials.yellow,false);
    box("road marking",0,.06,i,.16,.015,4,materials.yellow,false);
  }
  // Pavements and neighbourhood plots.
  for(const z of [-9,9]) box("pavement",0,.08,z,220,.16,3,materials.concrete,false);
  for(const x of [-9,9]) box("pavement",x,.08,0,3,.16,220,materials.concrete,false);

  function building(name,x,z,w,d,h,color,roofColor=materials.roof) {
    box(name,x,h/2,z,w,h,d,mat(color));
    box(name+" roof",x,h+.16,z,w+.5,.32,d+.5,roofColor);
    for(let y=2.2;y<h-1;y+=2.6){
      for(let xx=x-w/2+1.2;xx<x+w/2-0.5;xx+=2.7){
        box("window",xx,y,z-d/2-.012,1.05,1.05,.04,materials.blue,false);
        box("window frame",xx,y,z-d/2-.04,1.18,1.18,.04,materials.white,false);
      }
    }
    box("door",x,h/2*.48,z-d/2-.04,1.3,2.3,.08,materials.dark,false);
    return {x,z};
  }
  const market = building("Mama Kemi market", -22,-18,18,12,7,0xd3a66b,materials.rust);
  const clinic = building("Community clinic", 24,-23,15,12,8,0xd8d2bd,materials.white);
  const school = building("Community school", 28,23,19,13,7,0xd6bc84,materials.rust);
  const workshop = building("Mechanic workshop", -27,24,17,13,5,0x9eaa9c,materials.dark);
  building("Neighbourhood homes", -48,-36,12,10,6,0xb87954);
  building("Neighbourhood homes", 48,-39,13,11,7,0xc6ad81);
  building("Neighbourhood homes", -48,43,14,11,6,0xd1c09c);
  building("Neighbourhood homes", 50,42,15,12,7,0xb66c4d);
  building("Provision store", -22,-36,9,7,4.5,0xc7b58d,materials.green);
  building("Food stall", -35,-16,6,5,3.2,0xd8b45f,materials.rust);
  // Market awnings and stalls.
  for(let i=0;i<4;i++){
    const x=-35+i*7;
    box("market stall",x,1.3,-8,5,2.6,3,materials.rust);
    box("market canopy",x,2.8,-8,5.8,.25,3.8,i%2?materials.green:materials.yellow);
  }
  // Trees with simple low-poly canopies.
  for(const [x,z] of [[-58,-12],[-57,15],[58,-12],[59,15],[-12,-48],[13,49],[-42,57],[43,58],[-65,45],[65,-48]]){
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.55,3,7),materials.roof); trunk.position.set(x,1.5,z);trunk.castShadow=true;scene.add(trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(2.5,1),mat(0x527b49));crown.position.set(x,4,z);crown.castShadow=true;scene.add(crown);
  }
  // Streetlights.
  for(const [x,z] of [[-12,-16],[12,16],[-12,42],[12,-42]]){
    box("lamp post",x,3,z,.18,6,.18,materials.dark);
    box("lamp head",x,6.1,z,.8,.22,.4,materials.yellow);
  }
  // Bus stop shelter and parked community bus.
  box("bus shelter",-4,1.7,-24,7,.25,3,materials.blue);
  box("bus shelter roof", -4,3.5,-24,8,.3,4,materials.rust);
  for(const x of [-7,-1]) box("shelter support",x,1.7,-24,.18,3.4,.18,materials.dark);
  const bus=box("danfo bus",3,1.45,-27,7,2.7,3.1,materials.yellow);
  box("bus windscreen",3,2,-28.58,3.2,1.05,.06,materials.blue,false);
  for(const x of [0.8,5.2]) for(const z of [-28, -26]) {
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.58,.58,.25,12),materials.dark);
    wheel.rotation.z=Math.PI/2;wheel.position.set(x,.6,z);wheel.castShadow=true;scene.add(wheel);
  }
  // Player avatar, a visible third-person character.
  const player=new THREE.Group();scene.add(player);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.05,4,8),materials.shirt);body.position.y=1.35;body.castShadow=true;player.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,10),materials.skin);head.position.y=2.25;head.castShadow=true;player.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.39,12,7,0,Math.PI*2,0,Math.PI/2),materials.dark);hair.position.y=2.42;player.add(hair);
  const legMat=mat(0x343b38);
  const leftLeg=new THREE.Mesh(new THREE.CapsuleGeometry(.17,.62,3,6),legMat);leftLeg.position.set(-.2,.48,0);player.add(leftLeg);
  const rightLeg=leftLeg.clone();rightLeg.position.x=.2;player.add(rightLeg);
  const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.7,3,6),materials.skin);arm.position.set(-.58,1.35,0);arm.rotation.z=-.18;player.add(arm);
  const arm2=arm.clone();arm2.position.x=.58;arm2.rotation.z=.18;player.add(arm2);
  player.position.set(0,0,18);

  function npc(name,x,z,shirt,activity){
    const group=new THREE.Group();scene.add(group);
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.9,3,7),mat(shirt));torso.position.y=1.25;torso.castShadow=true;group.add(torso);
    const face=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),materials.skin);face.position.y=2.05;face.castShadow=true;group.add(face);
    const marker=new THREE.Mesh(new THREE.ConeGeometry(.18,.35,4),materials.yellow);marker.position.y=2.75;marker.rotation.x=Math.PI;group.add(marker);
    group.position.set(x,0,z);group.userData={name,home:new THREE.Vector3(x,0,z),activity,phase:Math.random()*6};return group;
  }
  const mama=npc("Mama Kemi",-27,-11,0x8f5141,"market trader");
  const tunde=npc("Tunde the driver",0,-31,0x47718a,"bus driver");
  const bisi=npc("Bisi the teacher",27,14,0x725a8e,"teacher");
  const chidi=npc("Chidi the mechanic",-25,31,0x4e7151,"mechanic");
  const npcs=[mama,tunde,bisi,chidi];
  const interactables=[
    {label:"Mama Kemi · Talk",position:new THREE.Vector3(-27,0,-11),type:"talk"},
    {label:"Provision stall · Buy bread (₦100)",position:new THREE.Vector3(-22,0,-36),type:"buy"},
    {label:"Community bus · Ride",position:new THREE.Vector3(3,0,-27),type:"bus"}
  ];

  const state=loadState();
  let step=state.step??0, wallet=state.wallet??2500, started=false, yaw=0, pitch=-.12;
  const keys=new Set(); const clock=new THREE.Clock();
  const playerDirection=new THREE.Vector3();
  const cameraOffset=new THREE.Vector3(0,4.2,8.5);
  const targetCamera=new THREE.Vector3();
  const targetLook=new THREE.Vector3();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function loadState(){try{return JSON.parse(localStorage.getItem("next-world-mvp-save")||"{}")}catch{return {}}}
  function save(){localStorage.setItem("next-world-mvp-save",JSON.stringify({step,wallet,updatedAt:new Date().toISOString()}))}
  function updateMission(){
    const missions=[
      ["Meet Mama Kemi","Find Mama Kemi at the market and press E to talk."],
      ["Buy bread","Visit the provision stall and buy bread for ₦100."],
      ["Catch your bus","Walk to the yellow community bus and press E."],
      ["Morning complete!","You have completed your first morning in Agege. Explore the neighbourhood."]
    ];
    missionTitle.textContent=missions[step][0];missionCopy.textContent=missions[step][1];
    missionProgress.style.width=(step/3*100)+"%";walletLabel.textContent="₦"+wallet.toLocaleString("en-NG");
  }
  function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove("show"),2300)}
  function interact(){
    if(!started)return;
    const nearest=interactables.map(item=>({...item,distance:player.position.distanceTo(item.position)})).sort((a,b)=>a.distance-b.distance)[0];
    if(!nearest||nearest.distance>4.5){notify("Move closer to an activity.");return}
    if(step===0&&nearest.type==="talk"){
      step=1;notify("Mama Kemi: Good morning! Please help me get bread from the provision stall.");save();
    }else if(step===1&&nearest.type==="buy"){
      if(wallet<100){notify("You don't have enough money.");return}
      wallet-=100;step=2;notify("Bread purchased. ₦100 deducted from your wallet.");save();
    }else if(step===2&&nearest.type==="bus"){
      step=3;wallet+=750;notify("Mission complete! You earned ₦750. Your story is just beginning.");save();
    }else{
      notify("That activity is not part of your current objective yet.");
    }
    updateMission();
  }
  function nearestHint(){
    const nearest=interactables.map(item=>({...item,distance:player.position.distanceTo(item.position)})).sort((a,b)=>a.distance-b.distance)[0];
    if(nearest&&nearest.distance<5){hint.textContent="E  ·  "+nearest.label;hint.style.borderColor="#d8ad58"}
    else{hint.textContent="WASD move · Mouse look · E interact";hint.style.borderColor="#ffffff2a"}
  }
  function onKeyDown(e){keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==="e")interact();if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault()}
  function onKeyUp(e){keys.delete(e.key.toLowerCase())}
  addEventListener("keydown",onKeyDown);addEventListener("keyup",onKeyUp);
  renderer.domElement.addEventListener("click",()=>{if(started&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});
  addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0025;pitch=clamp(pitch-e.movementY*.0015,-.55,.3)}});
  // Touch drag rotates the camera on phones/tablets; movement pad and action button remain separate.
  let touchLook=null;
  renderer.domElement.addEventListener("touchstart",e=>{if(e.touches.length===1){touchLook={x:e.touches[0].clientX,y:e.touches[0].clientY}}},{passive:true});
  renderer.domElement.addEventListener("touchmove",e=>{
    if(!touchLook||e.touches.length!==1)return;
    const t=e.touches[0],dx=t.clientX-touchLook.x,dy=t.clientY-touchLook.y;
    yaw-=dx*.006;pitch=clamp(pitch-dy*.003,-.55,.3);touchLook={x:t.clientX,y:t.clientY};
  },{passive:true});
  renderer.domElement.addEventListener("touchend",()=>{touchLook=null},{passive:true});
  document.querySelector("#mobile-interact").addEventListener("click",interact);
  document.querySelector("#start-button").addEventListener("click",()=>{started=true;startOverlay.style.display="none";renderer.domElement.requestPointerLock?.();notify("Welcome home. Your first morning starts now.")});
  document.querySelector("#reset-save").addEventListener("click",()=>{if(confirm("Start a new life? Your local MVP save will be reset.")){localStorage.removeItem("next-world-mvp-save");step=0;wallet=2500;updateMission();notify("A new life begins.")}});
  document.querySelectorAll("#mobile-controls button").forEach(button=>{
    const key=button.dataset.key;
    button.addEventListener("pointerdown",e=>{e.preventDefault();keys.add(key)});
    ["pointerup","pointerleave","pointercancel"].forEach(type=>button.addEventListener(type,()=>keys.delete(key)));
  });
  function animate(){
    requestAnimationFrame(animate);
    const delta=Math.min(clock.getDelta(),.05), elapsed=clock.elapsedTime;
    const forward=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0);
    const side=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
    const running=keys.has("shift"),speed=running?10:6;
    if(started&&(forward||side)){
      playerDirection.set(side,0,-forward).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
      player.position.addScaledVector(playerDirection,speed*delta);
      player.position.x=clamp(player.position.x,-82,82);player.position.z=clamp(player.position.z,-82,82);
      player.rotation.y=Math.atan2(playerDirection.x,playerDirection.z);
      const swing=Math.sin(elapsed*12)*.45;leftLeg.rotation.x=swing;rightLeg.rotation.x=-swing;arm.rotation.x=-swing*.65;arm2.rotation.x=swing*.65;
    }else{leftLeg.rotation.x=0;rightLeg.rotation.x=0;arm.rotation.x=0;arm2.rotation.x=0}
    npcs.forEach((person,i)=>{
      const phase=elapsed*.28+person.userData.phase;
      person.position.x=person.userData.home.x+Math.sin(phase)*1.7;
      person.position.z=person.userData.home.z+Math.cos(phase*.8)*1.3;
      person.rotation.y=Math.atan2(Math.cos(phase)*1.7,-Math.sin(phase*.8)*1.04);
    });
    const offset=cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    targetCamera.copy(player.position).add(offset);
    camera.position.lerp(targetCamera,1-Math.pow(.001,delta));
    targetLook.copy(player.position).add(new THREE.Vector3(0,1.45,0));
    camera.lookAt(targetLook);
    nearestHint();
    const minutes=Math.floor((8*60+elapsed*2)%1440),hour=Math.floor(minutes/60),minute=minutes%60;
    document.querySelector("#world-clock").textContent=(hour%12||12)+":"+String(minute).padStart(2,"0")+(hour>=12?" PM":" AM");
    renderer.render(scene,camera);
  }
  updateMission();animate();
  addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
}