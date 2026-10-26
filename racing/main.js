import * as THREE from 'three';
import {FilmPost} from './post.js';
import {coldGasMaterial,RacingVapor} from './vapor.js';
import {TRANSFER,rampDuration} from './transfer.js';
import {buildWorld} from './world.js';
import {LENGTH,LAPS,GRAVITY,sample,sector,wrap,clamp,smooth} from './track.js';
import {createRace,startRace,step,position,standings,COLORS} from './simulation.js';
const $=id=>document.getElementById(id),race=createRace(),input={steer:0,drift:false,boost:false};
const keys=new Set(),touch=new Set(),actors=[],trails=[];let renderer,scene,camera,post,world,last=performance.now(),accumulator=0,ready=false,dockTime=0,previousPhase='dock',hudClock=0,audio,muted=false,vapor,cinematic=true,landingShot=null,seenGravity=0;
const map=$('map').getContext('2d');const format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toFixed(3).padStart(6,'0')}`;
function show(id,value){$(id).hidden=!value;}
function setInput(){input.steer=(keys.has('KeyD')||keys.has('ArrowRight')||touch.has('right')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')||touch.has('left')?1:0);input.boost=keys.has('Space')||touch.has('boost');input.drift=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('ArrowDown')||touch.has('drift');}
function clearInput(){keys.clear();touch.clear();for(const b of document.querySelectorAll('[data-control]'))b.classList.remove('active');setInput();}
function startAudio(){
 try {if(!audio){const ctx=new (window.AudioContext||window.webkitAudioContext)(),gain=ctx.createGain(),osc=ctx.createOscillator(),filter=ctx.createBiquadFilter();osc.type='sawtooth';filter.type='lowpass';filter.frequency.value=500;gain.gain.value=0;osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start();audio={ctx,gain,osc};}audio.ctx.resume();}catch{}
}
function begin(){if(!ready)return;clearInput();vapor?.reset();landingShot=null;seenGravity=0;startAudio();startRace(race);previousPhase='countdown';show('dock',false);show('results',false);show('paused',false);show('hud',true);resetCamera();}
function pause(value){if(!['race','countdown'].includes(race.phase))return;race.paused=value;clearInput();show('paused',value);$('pause').textContent=value?'▶':'Ⅱ';}
function dock(){clearInput();vapor?.reset();landingShot=null;seenGravity=0;Object.assign(race,createRace());show('dock',true);show('hud',false);show('paused',false);show('results',false);previousPhase='dock';}
$('start').onclick=begin;$('again').onclick=begin;$('restart').onclick=begin;$('resume').onclick=()=>pause(false);$('pause').onclick=()=>pause(!race.paused);$('back').onclick=dock;$('return').onclick=dock;
function toggleCamera(){cinematic=!cinematic;$('camera').textContent=cinematic?'CAM / AUTO':'CAM / FOLLOW';$('camera').setAttribute('aria-pressed',String(cinematic));try{localStorage.setItem('meridian.cinematic',String(cinematic));}catch{}}
$('camera').onclick=toggleCamera;
try{if(localStorage.getItem('meridian.cinematic')==='false')toggleCamera();}catch{}
$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-label',muted?'Enable sound':'Mute sound');startAudio();};
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(e.code==='KeyC'&&!e.repeat)toggleCamera();if(e.code==='Escape'&&!e.repeat)pause(!race.paused);if(e.code==='Enter'&&race.phase==='dock')begin();keys.add(e.code);setInput();});
addEventListener('keyup',e=>{keys.delete(e.code);setInput();});
for(const button of document.querySelectorAll('[data-control]')){const control=button.dataset.control;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);touch.add(control);button.classList.add('active');setInput();});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{touch.delete(control);button.classList.remove('active');setInput();});}
addEventListener('blur',()=>{clearInput();pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause(true);}});
function resetCamera(){const p=position(race.cars[0]);camera.position.set(p.x-4,p.y+4,p.z-13);camera.lookAt(p.x,p.y+1,p.z+8);}

function createActors(){
 for(let i=0;i<6;i++){
  const model=world.car.clone(true);model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.color.r>.4&&o.material.color.g>.4&&!o.material.emissive?.getHex()){o.material.color.lerp(new THREE.Color(COLORS[i]),i?.7:.0);o.material.metalness=.52;o.material.roughness=.32;o.material.envMapIntensity=1.05;}o.castShadow=i===0;o.receiveShadow=true;}});
  if(i===0){const ms=[];model.traverse(o=>{if(o.isMesh&&!o.material.emissive?.getHex())ms.push(o);});for(const o of ms){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,34),new THREE.LineBasicMaterial({color:0x0b1320,transparent:true,opacity:.35}));o.add(edge);}}
  const group=new THREE.Group();group.add(model);scene.add(group);const jetGroup=new THREE.Group(),mat=coldGasMaterial(i?COLORS[i]:0x9cdbed);group.add(jetGroup);
  for(const x of [-.72,-.25,.25,.72]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.035,.24,1,12,1,true),mat);jet.rotation.x=Math.PI/2;jet.position.set(x,.46,-3);jetGroup.add(jet);}
  const down=new THREE.Group();group.add(down);for(const x of [-.82,.82])for(const z of [-1.5,1.5]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.035,.44,1,12,1,true),mat);jet.position.set(x,-1,z);down.add(jet);}
  const sideJets=new THREE.Group();group.add(sideJets);for(const sign of[-1,1]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.025,.22,3.8,16,6,true),mat);jet.rotation.z=sign*Math.PI/2;jet.position.set(sign*2.75,.35,-1.1);sideJets.add(jet);}
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0x07101c,transparent:true,opacity:.32,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(1.6,3.1,1);scene.add(shadow);actors.push({group,jetGroup,down,sideJets,mat,shadow});
 }
 const count=220,positions=new Float32Array(count*3),sizes=new Float32Array(count);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('age',new THREE.BufferAttribute(sizes,1));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelRatio:{value:1}},vertexShader:'attribute float age;varying float a;void main(){a=age;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=min(75.,(1.-age)*330./max(1.,-mv.z));gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float a;void main(){float d=length(gl_PointCoord-.5);float alpha=(1.-smoothstep(.1,.5,d))*a*.28;gl_FragColor=vec4(.77,.87,.93,alpha);}' });
 const points=new THREE.Points(geometry,mat);points.frustumCulled=false;scene.add(points);for(let i=0;i<count;i++)trails.push({age:0,x:0,y:-50,z:0});return {geometry,positions,sizes};
}
let particles,particleCursor=0,particleClock=0;
function drawCars(dt){
 for(let i=0;i<6;i++){
  const c=race.cars[i],p=position(c),a=actors[i];
  a.group.visible=race.phase!=='dock'||i===0;a.shadow.visible=a.group.visible;
  a.group.position.set(p.x,p.y+.035,p.z);a.group.rotation.set(p.pitch,p.yaw,p.roll,'YXZ');
  a.jetGroup.visible=c.boosting&&!race.paused;a.mat.uniforms.time.value=race.time;
  for(const jet of a.jetGroup.children){const len=c.boosting?3.5+Math.sin(race.time*30+i)*.25:0;jet.scale.y=len;jet.position.z=-2.1-len/2;}
  a.down.visible=p.air;for(const jet of a.down.children){jet.scale.y=Math.min(7,Math.max(.25,p.y+.15));jet.position.y=.1-jet.scale.y/2;}
  const airAge=c.stunt?c.stunt.elapsed-rampDuration(c.stunt.entrySpeed??48):99;a.sideJets.visible=p.air&&airAge>=0&&airAge<.65;
  a.shadow.position.set(p.x,sample(c.s).p.y+.04,p.z);a.shadow.material.opacity=Math.max(.04,.3-(p.y-sample(c.s).p.y)*.01);a.shadow.rotation.z=-p.yaw;
 }
 particleClock+=dt;if(particleClock>.025){particleClock=0;for(let i=0;i<6;i++){const c=race.cars[i];if(((c.boosting&&!c.stunt)||c.drifting)&&race.phase==='race'&&!race.paused){const p=position(c),t=trails[particleCursor++%trails.length];Object.assign(t,{age:1,x:p.x-Math.sin(p.yaw)*2.5,y:p.y+.3,z:p.z-Math.cos(p.yaw)*2.5});}}}
 for(let i=0;i<trails.length;i++){const t=trails[i];if(!race.paused){t.age=Math.max(0,t.age-dt*.7);t.y+=dt*.5;}particles.positions.set([t.x,t.y,t.z],i*3);particles.sizes[i]=t.age;}particles.geometry.attributes.position.needsUpdate=true;particles.geometry.attributes.age.needsUpdate=true;
}
function drawCamera(dt){
 const c=race.cars[0],p=position(c);let target,desired;
 if(race.phase==='dock'){
  dockTime+=dt;const theta=p.yaw+.65+Math.sin(dockTime*.13)*.13;
  const dir=new THREE.Vector3(Math.sin(theta),0,Math.cos(theta)),right=sample(0).n;
  desired=new THREE.Vector3(p.x,p.y+2.5,p.z).addScaledVector(dir,-8.2);target=new THREE.Vector3(p.x,p.y+.65,p.z).addScaledVector(right,-2.4);camera.fov=44;
 }else{
  const q=sample(c.s),flight=!!c.stunt;
  const yaw=flight?p.yaw:q.yaw;
  const direction=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const dist=flight?13:6.5+c.speed*.008;desired=new THREE.Vector3(p.x,p.y+(flight?5:2.4),p.z).addScaledVector(direction,-dist);target=new THREE.Vector3(p.x,p.y+1.25,p.z).addScaledVector(direction,flight?2:5);
  let goalFov=c.boosting?69:60;
  if(c.gravityRuns>seenGravity){seenGravity=c.gravityRuns;landingShot={at:race.time};}
  let wide=0;if(cinematic){if(c.stunt)wide=smooth((c.stunt.elapsed-.15)/.75);else if(landingShot)wide=1-smooth((race.time-landingShot.at-.2)/1.15);}
  if(wide>0){
   const gate=sample(GRAVITY.entry),stage=new THREE.Vector3(gate.p.x+50,gate.p.y+17,gate.p.z-28);
   const direction=new THREE.Vector3(-.88,.10,-.46).normalize();
   const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();
   const tanV=Math.tan(38*Math.PI/360),tanH=tanV*camera.aspect;let distance=0;
   // Fit the whole ramp, landing pad and spreading vapor, even in portrait.
   for(const x of[-15,115])for(const y of[0,41])for(const z of[-85,22]){
    const delta=new THREE.Vector3(gate.p.x+x,gate.p.y+y,gate.p.z+z).sub(stage);
    distance=Math.max(distance,delta.dot(direction)+Math.max(Math.abs(delta.dot(right))/tanH,Math.abs(delta.dot(up))/tanV));
   }
   const wideCamera=stage.clone().addScaledVector(direction,distance*1.06);
   const airAge=c.stunt?c.stunt.elapsed-rampDuration(c.stunt.entrySpeed??48):10;
   const close=smooth((airAge-.55)/1.35),closeTarget=new THREE.Vector3(p.x,p.y+1.1,p.z);
   const offset=new THREE.Vector3(-27,0,-35).multiplyScalar(Math.max(1,.95/camera.aspect));
   const landingCamera=new THREE.Vector3(p.x+offset.x,gate.p.y+7,p.z+offset.z);
   closeTarget.lerp(new THREE.Vector3(gate.p.x+100,gate.p.y+34,gate.p.z-3.48),.10);
   wideCamera.lerp(landingCamera,close);stage.lerp(closeTarget,close);
   desired.lerp(wideCamera,wide);target.lerp(stage,wide);goalFov=THREE.MathUtils.lerp(goalFov,THREE.MathUtils.lerp(38,48,close),wide);
  }
  camera.fov+=(goalFov-camera.fov)*Math.min(1,dt*5);
 }
 camera.position.lerp(desired,1-Math.exp(-dt*(c.stunt?6:16)));camera.lookAt(target);camera.updateProjectionMatrix();
 world.shadow.position.set(p.x-20,p.y+45,p.z-12);world.shadow.target.position.set(p.x,p.y,p.z);world.shadow.target.updateMatrixWorld();
 world.pools.forEach((light,i)=>{const pool=sample(c.s+(i-1)*38,i%2?10:-10);light.position.copy(pool.p);light.position.y+=5.5;});
}
function drawMap(){
 map.clearRect(0,0,210,180);const transform=p=>[18+(p.x+170)*.25,164-(p.z+410)*.15];map.lineWidth=4;map.strokeStyle='#93acb24d';map.beginPath();for(let i=0;i<=160;i++){const [x,y]=transform(sample(i/160*LENGTH).p);i?map.lineTo(x,y):map.moveTo(x,y);}map.stroke();
 const [gx,gy]=transform(sample(GRAVITY.entry).p);map.fillStyle='#f7bd70';map.fillRect(gx-3,gy-3,6,6);
 for(const c of [...race.cars].reverse()){const p=position(c),[x,y]=transform(p);map.beginPath();map.arc(x,y,c.id?2.7:4,0,Math.PI*2);map.fillStyle=c.id?'#'+COLORS[c.id].toString(16):'#ffffff';map.fill();}
}
function drawHUD(){
 const c=race.cars[0],order=standings(race),place=order.findIndex(x=>x.id===0)+1;
 $('place').textContent=place;$('speed').textContent=Math.round(c.speed*3.6).toString().padStart(3,'0');$('timer').textContent=format(c.finish??race.time);$('lap').textContent=Math.min(LAPS,Math.max(1,Math.floor(c.s/LENGTH)+1));$('sector').textContent=sector(c.s);
 $('charge').style.width=c.charge+'%';$('charge-label').textContent=Math.round(c.charge)+'%';$('mode').textContent=c.stunt?(position(c).stage==='ramp'?'DIRECTED GRAVITY RAMP':position(c).stage==='landing'?'COLD-GAS LANDING':'ALIGNED FLIGHT'):c.jump?'AIRBORNE':c.boosting?'FULL COLD-GAS THRUST':c.drifting?'DRIFT / RECHARGING':'COLD-GAS DRIVE';
 $('countdown').textContent=race.phase==='countdown'?(race.countdown>3?'READY':Math.ceil(race.countdown)):race.phase==='race'&&race.time<.75?'GO':'';
 const ev=race.events.filter(e=>e.until>race.time).at(-1);$('message').textContent=ev?.text||'';$('message').style.color=ev?.tone==='amber'?'#f7bd70':ev?.tone==='red'?'#ff8b84':'#9cdbed';
 $('rivals').innerHTML=order.map((o,i)=>`<div class="${o.id?'':'you'}"><span>${i+1} / ${o.name}</span><span>${o.id?(o.finish!==null?'FINISHED':`${Math.round(o.s-c.s)>0?'+':''}${Math.round(o.s-c.s)} m`):'RDSTR'}</span></div>`).join('');drawMap();
 if(race.phase==='results'){
  $('classification').innerHTML=order.map((o,i)=>`<li class="${o.id?'':'you'}"><span>${String(i+1).padStart(2,'0')} / ${o.name}</span><span>${o.finish!==null?format(o.finish):`${Math.max(0,Math.round(LENGTH*LAPS-o.s))} m TO FINISH`}</span></li>`).join('');
  if(previousPhase!=='results'){
   show('results',true);clearInput();$('result-title').innerHTML=place===1?'COAST<br>CONQUERED.':`P${place} / KEEP<br>DEFYING.`;$('finish-time').textContent=format(c.finish);$('air-time').textContent=c.airtime.toFixed(1)+'s';$('landings').textContent=c.landings;
   try{const best=Number(localStorage.getItem('meridian.best')||Infinity);if(c.finish<best)localStorage.setItem('meridian.best',c.finish);$('best').textContent='PERSONAL BEST / '+format(Number(localStorage.getItem('meridian.best')));}catch{}
  }
 }
 previousPhase=race.phase;
}
function tick(now){
 const dt=Math.min((now-last)/1000,.1);last=now;accumulator+=dt;
 while(accumulator>=1/60){step(race,1/60,input);accumulator-=1/60;}
 drawCars(dt);vapor.update(race.paused||race.phase==='dock'?0:dt,race.cars,race.cars.map(position),actors);drawCamera(dt);world.seaMaterial.uniforms.time.value=race.time+dockTime;
 for(const p of world.pickupMeshes){p.mesh.visible=(race.pickups.get(p.key)||0)<=race.time;p.mesh.rotation.y=race.time*1.8;p.mesh.position.y=p.base+Math.sin(race.time*2.5+Number(p.key[0]))*.18;}
 if(audio){const audible=!muted&&!race.paused&&race.phase==='race';audio.gain.gain.setTargetAtTime(audible?.035:0,audio.ctx.currentTime,.12);audio.osc.frequency.setTargetAtTime(40+race.cars[0].speed*2.7,audio.ctx.currentTime,.1);}
 hudClock+=dt;if(hudClock>.07){drawHUD();hudClock=0;}
 renderer.info.reset();post.render(scene,camera,Math.floor(race.time*60));requestAnimationFrame(tick);
}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight,false);const size=renderer.getDrawingBufferSize(new THREE.Vector2());post.resize(size.x,size.y);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
async function init(){
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.info.autoReset=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,4000);post=new FilmPost(renderer);post.final.uniforms.exposure.value=.9;post.final.uniforms.bloomStrength.value=.23;
 $('distance').textContent=(LENGTH*LAPS/1000).toFixed(2);
 world=await buildWorld(renderer,scene,t=>$('load-text').textContent=t);particles=createActors();vapor=new RacingVapor(scene);resize();resetCamera();ready=true;show('load',false);show('dock',true);$('start').disabled=false;$('start').innerHTML='ENTER THE RACE <span>↗</span>';
 try{const best=localStorage.getItem('meridian.best');if(best)$('best').textContent='PERSONAL BEST / '+format(Number(best));}catch{}
 window.__READY__=true;window.__RACE__={state:race,input,stats:()=>({vapor:{ground:vapor.parts.filter(p=>p.life>0&&p.ground).length,jet:vapor.parts.filter(p=>p.life>0&&!p.ground).length},cameraMode:cinematic?'cinematic':'follow',camera:{position:camera.position.toArray(),fov:camera.fov,heroScreen:new THREE.Vector3(position(race.cars[0]).x,position(race.cars[0]).y+1,position(race.cars[0]).z).project(camera).toArray()},phase:race.phase,paused:race.paused,time:race.time,speed:race.cars[0].speed,progress:race.cars[0].s,charge:race.cars[0].charge,gravityRuns:race.cars[0].gravityRuns,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,position:position(race.cars[0]),cars:race.cars.map(c=>({id:c.id,s:c.s,lane:c.lane,finish:c.finish}))})};
 last=performance.now();requestAnimationFrame(tick);
}
addEventListener('resize',resize);init().catch(error=>{console.error(error);show('load',false);show('error',true);$('error-text').textContent=error.message;});
