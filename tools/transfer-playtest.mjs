// Actual keyboard input, with telemetry sampled in the renderer (no screenshots blocking input).
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out=process.env.TRANSFER_DIR||'evidence/racing/separated-landing';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});const errors=[],sleep=t=>new Promise(r=>setTimeout(r,t));
try{
 const page=await browser.newPage();page.setDefaultTimeout(60000);await page.setViewport({width:1440,height:900});page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__READY__);await page.click('#practice');await page.waitForFunction(()=>window.__RACE__.state.phase==='race');
 await page.evaluate(()=>{window.__TRANSFER_SAMPLES__=[];function collect(){const r=window.__RACE__,c=r.state.cars[0];window.__TRANSFER_SAMPLES__.push({...r.stats(),stunt:c.stunt?{...c.stunt}:null,heading:c.heading,lane:c.lane});if(!c.gravityRuns&&window.__TRANSFER_SAMPLES__.length<3000)requestAnimationFrame(collect);}requestAnimationFrame(collect);});
 let held=false,landed=false;const start=Date.now();
 while(Date.now()-start<45000){const info=await page.evaluate(()=>{const c=window.__RACE__.state.cars[0],p=window.__RACE__.stats().position;return{stunt:c.stunt,age:c.stunt?c.stunt.elapsed-p.rampTime:-99,landings:c.gravityRuns};});
  const wants=!!info.stunt&&info.age>-.65&&info.age<4.1;
  if(wants&&!held){await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyD');held=true;}
  if(!wants&&held){await page.keyboard.up('KeyD');await page.keyboard.up('ShiftLeft');held=false;}
  if(info.landings){landed=true;break;}await sleep(30);
 }
 if(held){await page.keyboard.up('KeyD');await page.keyboard.up('ShiftLeft');}
 const samples=await page.evaluate(()=>window.__TRANSFER_SAMPLES__),air=samples.filter(s=>s.stunt&&s.position.air);
 await fs.writeFile(out+'/telemetry.json',JSON.stringify(samples));assert(landed);assert(air.length>20);assert(samples.some(s=>Math.abs(s.position.spinAngle||0)>1),'Real driver gesture rotates car');
 assert(samples.filter(s=>s.stunt&&s.stunt.elapsed>.1).every(s=>!s.terrainOccluded),'Terrain must not occlude stunt');
 for(const s of samples.filter(s=>s.stunt&&s.stunt.elapsed>.1))assert(Math.abs(s.camera.heroScreen[0])<.96&&Math.abs(s.camera.heroScreen[1])<.96,`Hero framed at ${s.stunt.elapsed}: ${s.camera.heroScreen}`);
 const cameraDistance=s=>Math.hypot(s.camera.position[0]-s.position.x,s.camera.position[1]-s.position.y,s.camera.position[2]-s.position.z);
 const reveal=air.filter(s=>cameraDistance(s)>18);assert(reveal.length>0,'Brief wider highlight is visible');assert(reveal.at(-1).stunt.elapsed-reveal[0].stunt.elapsed<.95,'Wide highlight lasts under a second');assert(air.every(s=>cameraDistance(s)<32),'No extreme zoom-out');
 const rear=air.filter(s=>s.stunt.elapsed-s.position.rampTime>2.95);assert(rear.length>0);assert(rear.every(s=>(s.camera.position[0]-s.position.x)*Math.sin(s.position.yaw)+(s.camera.position[2]-s.position.z)*Math.cos(s.position.yaw)<-3),'Rear view restored well before landing');
 const orbit=air.filter(s=>{const age=s.stunt.elapsed-s.position.rampTime;return age>1.2&&age<2.65;});
 assert(orbit.length>20,'Pan is sampled across multiple rendered frames');
 assert(orbit.every(s=>Math.hypot(s.camera.position[0]-s.position.x,s.camera.position[2]-s.position.z)>7),'Camera orbits outside the car instead of cutting through it');
 const azimuth=s=>{const dx=s.camera.position[0]-s.position.x,dz=s.camera.position[2]-s.position.z,y=s.position.yaw;return Math.atan2(dx*Math.cos(y)-dz*Math.sin(y),dx*Math.sin(y)+dz*Math.cos(y));};
 const angles=orbit.map(azimuth);assert(angles.at(-1)-angles[0]>1.7,'Camera visibly pans from side to rear');
 assert(angles.slice(1).every((a,i)=>Math.abs(a-angles[i])<.13),'No abrupt angular camera jumps');
 const panRates=[],lateDistanceRates=[];
 for(let i=1;i<air.length;i++){const a=air[i-1],b=air[i],dt=b.time-a.time,age=a.stunt.elapsed-a.position.rampTime;if(dt<=0)continue;
  if(age>.9&&age<2.9){const da=azimuth(b)-azimuth(a);panRates.push(Math.abs(Math.atan2(Math.sin(da),Math.cos(da)))/dt*180/Math.PI);}
  if(age>2.8)lateDistanceRates.push(Math.abs(cameraDistance(b)-cameraDistance(a))/dt);
 }
 const motion={peakPanDegreesPerSecond:Math.max(...panRates),peakLateDistanceChange:Math.max(...lateDistanceRates)};
 assert(motion.peakPanDegreesPerSecond<145,'Pan avoids a sudden fast sweep');
 assert(motion.peakLateDistanceChange<10,'Landing distance blends without a camera snap');
 const close=air.filter(s=>s.stunt.elapsed-s.position.rampTime>.8&&s.stunt.elapsed-s.position.rampTime<1.5);assert(close.length>0);assert(close.some(s=>Math.hypot(s.camera.position[0]-s.position.x,s.camera.position[1]-s.position.y,s.camera.position[2]-s.position.z)<13),'Close thruster view');
 const touchdown=air.at(-1),dx=touchdown.camera.position[0]-touchdown.position.x,dz=touchdown.camera.position[2]-touchdown.position.z;assert(dx*Math.sin(touchdown.position.yaw)+dz*Math.cos(touchdown.position.yaw)<-4,'Camera behind vehicle before wheel contact');
 const before=await page.evaluate(()=>({s:window.__RACE__.state.cars[0].s,lane:window.__RACE__.state.cars[0].lane}));await page.keyboard.down('KeyA');await page.keyboard.down('Space');await sleep(420);await page.keyboard.up('KeyA');await page.keyboard.up('Space');const left=await page.evaluate(()=>({s:window.__RACE__.state.cars[0].s,lane:window.__RACE__.state.cars[0].lane,heading:window.__RACE__.state.cars[0].heading}));assert(left.lane<before.lane-.25&&left.heading<0&&left.s>before.s,'Actual post-land steering + boost');
 await page.keyboard.down('KeyD');await sleep(650);await page.keyboard.up('KeyD');assert(await page.evaluate(()=>window.__RACE__.state.cars[0].heading>0),'Opposite direction remains controllable');
 await page.keyboard.press('KeyC');await page.waitForFunction(()=>window.__RACE__.stats().cameraMode==='follow');await page.click('#camera');await page.waitForFunction(()=>window.__RACE__.stats().cameraMode==='cinematic');assert.deepEqual(errors,[]);
 await page.screenshot({path:out+'/post-landing-controls.png'});
 const report={passed:true,kind:'Real keyboard approach, deliberate lip gesture, post-touchdown steering and boost',checks:['brief wide highlight, close-up and continuous side-to-rear orbit','20+ actual airborne frames','driver-triggered rotation','unobstructed framing','close thruster descent','camera behind car before touchdown','left steering and boost after landing','right steering after landing','camera toggle','no browser errors'],motion,peakCloud:Math.max(...samples.map(s=>s.vapor.ground)),errors};await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
