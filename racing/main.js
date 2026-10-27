import * as THREE from 'three';
import {RaceAudio} from './audio.js';
import {FilmPost} from './post.js';
import {coldGasMaterial,RacingVapor} from './vapor.js';
import {TRANSFER,rampDuration} from './transfer.js';
import {buildWorld} from './world.js';
import {LENGTH,LAPS,GRAVITY,sample,sector,wrap,clamp,smooth,ROAD_SECTIONS,JUMPS} from './track.js';
import {createRace,startRace,step,position,standings,COLORS} from './simulation.js';
const $=id=>document.getElementById(id),race=createRace(),input={steer:0,drift:false,boost:false};
const keys=new Set(),touch=new Set(),actors=[],trails=[];let renderer,scene,camera,post,world,last=performance.now(),accumulator=0,ready=false,dockTime=0,previousPhase='dock',hudClock=0,vapor,cinematic=true,landingShot=null,seenGravity=0,peakHeight=0;
const audio=new RaceAudio();
const cameraTarget=new THREE.Vector3(),cameraAnchor=new THREE.Vector3();let cameraHadStunt=false;
const map=$('map').getContext('2d');const format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toFixed(3).padStart(6,'0')}`;
function show(id,value){$(id).hidden=!value;}
function setInput(){input.steer=(keys.has('KeyD')||keys.has('ArrowRight')||touch.has('right')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')||touch.has('left')?1:0);input.boost=keys.has('Space')||touch.has('boost');input.drift=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('ArrowDown')||touch.has('drift');}
function clearInput(){keys.clear();touch.clear();for(const b of document.querySelectorAll('[data-control]'))b.classList.remove('active');setInput();}
function begin(){if(!ready)return;clearInput();vapor?.reset();landingShot=null;seenGravity=0;peakHeight=0;audio.reset();startRace(race);previousPhase='countdown';show('dock',false);show('results',false);show('paused',false);show('hud',true);resetCamera();}
function pause(value){if(!['race','countdown'].includes(race.phase))return;race.paused=value;audio.pause(value);clearInput();show('paused',value);$('pause').textContent=value?'▶':'Ⅱ';}
function dock(){audio.stop();clearInput();vapor?.reset();landingShot=null;seenGravity=0;Object.assign(race,createRace());show('dock',true);show('hud',false);show('paused',false);show('results',false);previousPhase='dock';}
function practice(){begin();race.cars[0].s=GRAVITY.entry-110;resetCamera();}
$('practice').onclick=practice;$('retry-launch').onclick=practice;
$('start').onclick=begin;$('again').onclick=begin;$('restart').onclick=begin;$('resume').onclick=()=>pause(false);$('pause').onclick=()=>pause(!race.paused);$('back').onclick=dock;$('return').onclick=dock;
function toggleCamera(){cinematic=!cinematic;$('camera').textContent=cinematic?'CAM / AUTO':'CAM / FOLLOW';$('camera').setAttribute('aria-pressed',String(cinematic));try{localStorage.setItem('meridian.cinematic',String(cinematic));}catch{}}
$('camera').onclick=toggleCamera;
try{if(localStorage.getItem('meridian.cinematic')==='false')toggleCamera();}catch{}
function syncSound(){
 $('sound').textContent=audio.muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-label',audio.muted?'Enable sound':'Mute sound');$('sound').setAttribute('aria-pressed',String(!audio.muted));
 $('music-volume').value=Math.round(audio.volume*100);$('music-level').textContent=Math.round(audio.volume*100)+'%';
}
$('sound').onclick=()=>{audio.setMuted(!audio.muted);audio.unlock();syncSound();};
$('music-volume').addEventListener('input',e=>{audio.setVolume(Number(e.target.value)/100);syncSound();});syncSound();
addEventListener('keydown',e=>{if(e.target instanceof HTMLElement&&e.target.matches('input,select,textarea'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(e.code==='KeyR'&&!e.repeat)practice();if(e.code==='KeyC'&&!e.repeat)toggleCamera();if(e.code==='Escape'&&!e.repeat)pause(!race.paused);if(e.code==='Enter'&&race.phase==='dock')begin();keys.add(e.code);setInput();});
addEventListener('keyup',e=>{keys.delete(e.code);setInput();});
for(const button of document.querySelectorAll('[data-control]')){const control=button.dataset.control;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);touch.add(control);button.classList.add('active');setInput();});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{touch.delete(control);button.classList.remove('active');setInput();});}
addEventListener('blur',()=>{clearInput();pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause(true);audio.pause(true);}});
function resetCamera(){cameraHadStunt=false;const p=position(race.cars[0]);camera.position.set(p.x-4,p.y+4,p.z-13);cameraTarget.set(p.x,p.y+1,p.z+8);camera.lookAt(cameraTarget);}

function createActors(){
 for(let i=0;i<race.cars.length;i++){
  const model=world.car.clone(true);model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.color.r>.4&&o.material.color.g>.4&&!o.material.emissive?.getHex()){o.material.color.lerp(new THREE.Color(COLORS[i]),i?.7:.0);o.material.metalness=.52;o.material.roughness=.32;o.material.envMapIntensity=1.05;}o.castShadow=i===0;o.receiveShadow=true;}});
  if(i===0){const ms=[];model.traverse(o=>{if(o.isMesh&&!o.material.emissive?.getHex())ms.push(o);});for(const o of ms){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,34),new THREE.LineBasicMaterial({color:0x0b1320,transparent:true,opacity:.14}));o.add(edge);}}
  const group=new THREE.Group();group.add(model);scene.add(group);const jetGroup=new THREE.Group(),mat=coldGasMaterial(i?COLORS[i]:0x9cdbed);group.add(jetGroup);
  for(const x of [-.4608,-.1536,.1536,.4608]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.035,.24,1,12,1,true),mat);jet.rotation.x=Math.PI/2;jet.position.set(x,.545,-3);jetGroup.add(jet);}
  const down=new THREE.Group();group.add(down);for(const x of [-.7872,.7872])for(const z of [-1.5,1.5]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.035,.44,1,12,1,true),mat);jet.position.set(x,-1,z);down.add(jet);}
  const sideJets=new THREE.Group();group.add(sideJets);for(const sign of[-1,1]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.025,.22,3.8,16,6,true),mat);jet.rotation.z=sign*Math.PI/2;jet.position.set(sign*2.75,.35,-1.1);sideJets.add(jet);}
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0x07101c,transparent:true,opacity:.32,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(1.6,3.1,1);scene.add(shadow);const wheels=[];model.traverse(o=>{if(o.name.startsWith('wheel_')){o.rotation.order='YXZ';wheels.push(o);}});actors.push({group,jetGroup,down,sideJets,mat,shadow,wheels});
 }
 const count=220,positions=new Float32Array(count*3),sizes=new Float32Array(count);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('age',new THREE.BufferAttribute(sizes,1));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelRatio:{value:1}},vertexShader:'attribute float age;varying float a;void main(){a=age;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=min(75.,(1.-age)*330./max(1.,-mv.z));gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float a;void main(){float d=length(gl_PointCoord-.5);float alpha=(1.-smoothstep(.1,.5,d))*a*.28;gl_FragColor=vec4(.77,.87,.93,alpha);}' });
 const points=new THREE.Points(geometry,mat);points.frustumCulled=false;scene.add(points);for(let i=0;i<count;i++)trails.push({age:0,x:0,y:-50,z:0});return {geometry,positions,sizes};
}
let particles,particleCursor=0,particleClock=0;
function drawCars(dt){
 for(let i=0;i<race.cars.length;i++){
  const c=race.cars[i],p=position(c),a=actors[i];if(i===0&&race.phase==='race')peakHeight=Math.max(peakHeight,p.y);
  a.group.visible=race.phase!=='dock'||i===0;a.shadow.visible=a.group.visible;
  a.group.position.set(p.x,p.y+.035,p.z);if(p.quaternion)a.group.quaternion.fromArray(p.quaternion);else a.group.rotation.set(p.pitch,p.yaw,p.roll,'YXZ');
  for(const wheel of a.wheels){if(!race.paused&&race.phase==='race')wheel.rotation.x+=c.speed*dt/.435;wheel.rotation.y=wheel.name.endsWith('_f')?-c.steering*.32:0;}
  a.jetGroup.visible=c.boosting&&!race.paused;a.mat.uniforms.time.value=race.time;
  for(const jet of a.jetGroup.children){const len=c.boosting?3.5+Math.sin(race.time*30+i)*.25:0;jet.scale.y=len;jet.position.z=-2.44-len/2;}
  a.down.visible=p.air&&!!c.stunt;for(const jet of a.down.children){jet.scale.y=Math.min(7,Math.max(.25,p.y+.15));jet.position.y=.1-jet.scale.y/2;}
  const airAge=c.stunt?c.stunt.elapsed-rampDuration(c.stunt.entrySpeed??48):99;a.sideJets.visible=p.air&&airAge>=0&&airAge<.65;
  a.shadow.position.set(p.x,sample(c.s).p.y+.04,p.z);a.shadow.material.opacity=Math.max(.04,.3-(p.y-sample(c.s).p.y)*.01);a.shadow.rotation.z=-p.yaw;
 }
 particleClock+=dt;if(particleClock>.025){particleClock=0;for(let i=0;i<race.cars.length;i++){const c=race.cars[i];if(((c.boosting&&!c.stunt)||c.drifting)&&race.phase==='race'&&!race.paused){const p=position(c),t=trails[particleCursor++%trails.length];Object.assign(t,{age:1,x:p.x-Math.sin(p.yaw)*2.5,y:p.y+.3,z:p.z-Math.cos(p.yaw)*2.5});}}}
 for(let i=0;i<trails.length;i++){const t=trails[i];if(!race.paused){t.age=Math.max(0,t.age-dt*.7);t.y+=dt*.5;}particles.positions.set([t.x,t.y,t.z],i*3);particles.sizes[i]=t.age;}particles.geometry.attributes.position.needsUpdate=true;particles.geometry.attributes.age.needsUpdate=true;
}
function drawCamera(dt){
 const c=race.cars[0],p=position(c);let target,desired;
 if(race.phase==='dock'){
  dockTime+=dt;const theta=p.yaw+.65+Math.sin(dockTime*.13)*.13;
  const dir=new THREE.Vector3(Math.sin(theta),0,Math.cos(theta)),right=sample(0).n;
  desired=new THREE.Vector3(p.x,p.y+2.5,p.z).addScaledVector(dir,-8.2);target=new THREE.Vector3(p.x,p.y+.65,p.z).addScaledVector(right,-2.4);camera.fov=44;
 }else{
  const q=sample(c.s),flight=!!c.stunt||!!c.jump;
  const yaw=c.stunt?(p.air?p.yaw:sample(GRAVITY.entry).yaw):q.yaw-c.heading*.5;
  const direction=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const age=c.stunt?c.stunt.elapsed-rampDuration(c.stunt.entrySpeed):0;
  const landingBlend=c.stunt?THREE.MathUtils.smootherstep(age,TRANSFER.flightTime-1.65,TRANSFER.flightTime):0;
  const dist=flight?THREE.MathUtils.lerp(11,6.8+c.speed*.012,landingBlend):6.8+c.speed*.012;
  desired=new THREE.Vector3(p.x,p.y+(flight?THREE.MathUtils.lerp(5,2.4,landingBlend):2.4),p.z).addScaledVector(direction,-dist);
  target=new THREE.Vector3(p.x,p.y+1.25,p.z).addScaledVector(direction,flight?THREE.MathUtils.lerp(2,5,landingBlend):5);
  let goalFov=c.boosting?76:64;
  if(c.gravityRuns>seenGravity){seenGravity=c.gravityRuns;landingShot={at:race.time};}
  let wide=0;
  if(cinematic&&c.stunt){
   const age=c.stunt.elapsed-rampDuration(c.stunt.entrySpeed);
   // Keep the highlight brief; travel around the car to regain the rear view.
   wide=smooth((c.stunt.elapsed-.15)/.7);
   if(wide>0){
    // Track the car rather than fitting the entire ramp and both roads.
    const scale=Math.min(1.65,Math.max(1,1.0/camera.aspect));
    const stage=new THREE.Vector3(p.x,p.y+.8,p.z);
    const wideCamera=new THREE.Vector3(p.x-10*scale,p.y+3.5,p.z-8*scale);
    const close=smooth((age-.1)/.75),forward=new THREE.Vector3(Math.sin(p.yaw),0,Math.cos(p.yaw)),side=new THREE.Vector3(forward.z,0,-forward.x);
    const pan=(1-Math.cos(Math.PI*THREE.MathUtils.clamp((age-.75)/1.8,0,1)))/2;
    // Polar interpolation preserves stand-off distance instead of cutting a
    // straight chord through the car. A longer cosine sweep lowers peak turn speed.
    const angle=THREE.MathUtils.lerp(Math.atan2(5,7.5),Math.PI,pan);
    const radius=THREE.MathUtils.lerp(Math.hypot(7.5,5)*scale,dist,pan);
    const closeCamera=new THREE.Vector3(p.x,THREE.MathUtils.lerp(p.y+3.2,desired.y,pan),p.z)
     .addScaledVector(forward,Math.cos(angle)*radius).addScaledVector(side,Math.sin(angle)*radius);
    const closeTarget=new THREE.Vector3(p.x,p.y+.55,p.z).lerp(target,pan);
    // Wide for a fraction of a second, not a prolonged overview.
    const reveal=smooth((age+.18)/.18)*(1-smooth((age-.35)/.3));
    const revealCamera=new THREE.Vector3(p.x-20*scale,p.y+8,p.z-17*scale);
    wideCamera.lerp(closeCamera,close);stage.lerp(closeTarget,close);wideCamera.lerp(revealCamera,reveal);desired.lerp(wideCamera,wide);target.lerp(stage,wide);goalFov=THREE.MathUtils.lerp(goalFov,THREE.MathUtils.lerp(THREE.MathUtils.lerp(THREE.MathUtils.lerp(52,46,close),62,reveal),goalFov,pan),wide);
   }
  }
  camera.fov+=(goalFov-camera.fov)*Math.min(1,dt*5);
 }
 // Carry the rig with the car before smoothing the shot offset. Otherwise camera
 // position and look target lag at different rates, producing a whip at landing.
 if(cameraHadStunt){const delta=new THREE.Vector3(p.x,p.y,p.z).sub(cameraAnchor);if(delta.length()<12){camera.position.add(delta);cameraTarget.add(delta);}}
 cameraAnchor.set(p.x,p.y,p.z);cameraHadStunt=!!c.stunt;
 camera.position.lerp(desired,1-Math.exp(-dt*(c.stunt?9:16)));cameraTarget.lerp(target,1-Math.exp(-dt*(c.stunt?9:12)));camera.lookAt(cameraTarget);camera.updateProjectionMatrix();
 world.shadow.position.set(p.x-20,p.y+45,p.z-12);world.shadow.target.position.set(p.x,p.y,p.z);world.shadow.target.updateMatrixWorld();
 world.pools.forEach((light,i)=>{const pool=sample(c.s+(i-1)*38,i%2?10:-10);light.position.copy(pool.p);light.position.y+=5.5;});
}
function drawMap(){
 map.clearRect(0,0,210,180);const transform=p=>[25+(p.x+250)*.53,160-(p.z+500)*.16];map.lineWidth=3;map.strokeStyle='#93acb27d';
 for(const [a,b] of ROAD_SECTIONS){map.beginPath();for(let i=0;i<=100;i++){const [x,y]=transform(sample(a+(b-a)*i/100).p);i?map.lineTo(x,y):map.moveTo(x,y);}map.stroke();}
 const [gx,gy]=transform(sample(GRAVITY.entry).p);map.fillStyle='#f7bd70';map.fillRect(gx-3,gy-3,6,6);
 for(const c of [...race.cars].reverse()){const p=position(c),[x,y]=transform(p);map.beginPath();map.arc(x,y,c.id?2.7:4,0,Math.PI*2);map.fillStyle=c.id?'#'+COLORS[c.id].toString(16):'#ffffff';map.fill();}
}
function drawHUD(){
 $('music-title').textContent=audio.state==='unavailable'?'MUSIC UNAVAILABLE / RETRY THE RUN':audio.state==='loading'?'LOADING ORIGINAL SCORE…':'IGNITION VECTOR / ORIGINAL SCORE';
 const c=race.cars[0],order=standings(race),place=order.findIndex(x=>x.id===0)+1;
 $('place').textContent=Math.min(100,Math.floor(Math.max(0,c.s)/(LENGTH*LAPS)*100));$('speed').textContent=Math.round(c.speed*3.6).toString().padStart(3,'0');$('timer').textContent=format(c.finish??race.time);$('lap').textContent=Math.min(LAPS,Math.max(1,Math.floor(c.s/LENGTH)+1));$('sector').textContent=sector(c.s);
 $('charge').style.width=c.charge+'%';$('charge-label').textContent=Math.round(c.charge)+'%';$('mode').textContent=c.stunt?(position(c).stage==='ramp'?'VERTICAL GRAVITY RAMP':position(c).stage==='landing'?'COLD-GAS LANDING':'ALIGNED FLIGHT'):c.jump?'AIRBORNE':c.boosting?'FULL COLD-GAS THRUST':c.drifting?'DRIFT / RECHARGING':'COLD-GAS DRIVE';
 $('countdown').textContent=race.phase==='countdown'?(race.countdown>3?'READY':Math.ceil(race.countdown)):race.phase==='race'&&race.time<.75?'GO':'';
 const ev=race.events.filter(e=>e.until>race.time).at(-1);$('message').textContent=ev?.text||'';$('message').style.color=ev?.tone==='amber'?'#f7bd70':ev?.tone==='red'?'#ff8b84':'#9cdbed';
 $('rivals').textContent='SOLO / RDSTR';$('trick-score').textContent=c.score.toLocaleString();$('spin-count').textContent=c.spins+(c.stunt?.spins||c.jump?.spins||0);const next=JUMPS.find(j=>j.s>c.s);$('hint').textContent=c.stunt?(c.stunt.elapsed<rampDuration(c.stunt.entrySpeed)?'STEER + DRIFT AT THE LIP':c.stunt.settleStarted!==undefined?'ALIGNING FOR THRUSTER LANDING':c.stunt.spinEnabled?'RELEASE TO STABILIZE · THRUSTER LANDING':'THRUSTER DESCENT · LANDING STRIP AHEAD'):next&&next.s-c.s<100?'STEER + DRIFT AS YOU LEAVE THE RAMP':c.s>GRAVITY.entry-150&&c.s<GRAVITY.entry?'FOLLOW THE LIGHTS · STEER + DRIFT AT THE LIP':'';drawMap();
 if(race.phase==='results'){
  $('classification').innerHTML=order.map((o,i)=>`<li class="${o.id?'':'you'}"><span>${String(i+1).padStart(2,'0')} / ${o.name}</span><span>${o.finish!==null?format(o.finish):`${Math.max(0,Math.round(LENGTH*LAPS-o.s))} m TO FINISH`}</span></li>`).join('');
  if(previousPhase!=='results'){
   show('results',true);clearInput();$('result-title').innerHTML=place===1?'COAST<br>CONQUERED.':`P${place} / KEEP<br>DEFYING.`;$('finish-time').textContent=format(c.finish);$('air-time').textContent=c.airtime.toFixed(1)+'s';$('landings').textContent=c.landings;$('result-spins').textContent=c.spins;
   try{const best=Number(localStorage.getItem('meridian.airborne.separate.v3.best')||Infinity);if(c.finish<best)localStorage.setItem('meridian.airborne.separate.v3.best',c.finish);$('best').textContent='PERSONAL BEST / '+format(Number(localStorage.getItem('meridian.airborne.separate.v3.best')));}catch{}
  }
 }
 previousPhase=race.phase;
}
function tick(now){
 const dt=Math.min((now-last)/1000,.1);last=now;accumulator+=dt;
 while(accumulator>=1/60){step(race,1/60,input);accumulator-=1/60;}
 drawCars(dt);vapor.update(race.paused||race.phase==='dock'?0:dt,race.cars,race.cars.map(position),actors);drawCamera(dt);world.seaMaterial.uniforms.time.value=race.time+dockTime;
 for(const p of world.pickupMeshes){p.mesh.visible=(race.pickups.get(p.key)||0)<=race.time;p.mesh.rotation.y=race.time*1.8;p.mesh.position.y=p.base+Math.sin(race.time*2.5+Number(p.key[0]))*.18;}
 audio.update({phase:race.phase,paused:race.paused,airborne:!!race.cars[0].stunt&&position(race.cars[0]).air,boosting:race.cars[0].boosting,speed:race.cars[0].speed});
 hudClock+=dt;if(hudClock>.07){drawHUD();hudClock=0;}
 renderer.info.reset();post.render(scene,camera,Math.floor(race.time*60));requestAnimationFrame(tick);
}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight,false);const size=renderer.getDrawingBufferSize(new THREE.Vector2());post.resize(size.x,size.y);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
async function init(){
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.info.autoReset=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,4000);post=new FilmPost(renderer);post.final.uniforms.exposure.value=.9;post.final.uniforms.bloomStrength.value=.23;
 $('distance').textContent=(LENGTH*LAPS/1000).toFixed(2);
 world=await buildWorld(renderer,scene,t=>$('load-text').textContent=t);particles=createActors();vapor=new RacingVapor(scene);resize();resetCamera();ready=true;show('load',false);show('dock',true);$('start').disabled=false;$('start').innerHTML='START SOLO RUN <span>↗</span>';
 try{const best=localStorage.getItem('meridian.airborne.separate.v3.best');if(best)$('best').textContent='PERSONAL BEST / '+format(Number(best));}catch{}
 window.__READY__=true;window.__RACE_AUDIO__=audio;window.__RACE__={state:race,input,stats:()=>({vapor:{ground:vapor.parts.filter(p=>p.life>0&&p.ground).length,jet:vapor.parts.filter(p=>p.life>0&&!p.ground).length},peakHeight,terrainOccluded:(()=>{const p=position(race.cars[0]),target=new THREE.Vector3(p.x,p.y+1,p.z),ray=new THREE.Raycaster(camera.position,target.clone().sub(camera.position).normalize(),.1,camera.position.distanceTo(target)-.6);return ray.intersectObject(world.terrain).length>0;})(),vehicleCount:actors.length,spins:race.cars[0].spins,score:race.cars[0].score,wheelAngles:actors[0].wheels.map(w=>w.rotation.x),cameraMode:cinematic?'cinematic':'follow',camera:{position:camera.position.toArray(),fov:camera.fov,heroScreen:new THREE.Vector3(position(race.cars[0]).x,position(race.cars[0]).y+1,position(race.cars[0]).z).project(camera).toArray()},phase:race.phase,paused:race.paused,time:race.time,speed:race.cars[0].speed,progress:race.cars[0].s,charge:race.cars[0].charge,gravityRuns:race.cars[0].gravityRuns,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,position:position(race.cars[0]),cars:race.cars.map(c=>({id:c.id,s:c.s,lane:c.lane,finish:c.finish}))})};
 last=performance.now();requestAnimationFrame(tick);
}
addEventListener('resize',resize);init().catch(error=>{console.error(error);show('load',false);show('error',true);$('error-text').textContent=error.message;});
