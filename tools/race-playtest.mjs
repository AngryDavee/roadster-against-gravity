import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='evidence/racing/playtest';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox',...(process.env.CI?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[])]});
const errors=[],failed=[],checks=[],frames=[];const pass=name=>{checks.push(name);console.log('PASS',name);};
const sleep=t=>new Promise(r=>setTimeout(r,t));
const diagnostics=[];
async function observe(page){
 page.on('console',m=>{const line=`${m.type()}: ${m.text()}`;diagnostics.push(line);if(m.type()==='error'||line.includes('[startup]'))console.log(line);});
 page.on('requestfailed',r=>diagnostics.push(`REQUEST FAILED ${r.url()}: ${r.failure()?.errorText}`));
 await page.evaluateOnNewDocument(()=>{
  let last='';new MutationObserver(()=>{const text=document.querySelector('#load-text')?.textContent;if(text&&text!==last){last=text;console.log('[startup]',text);}}).observe(document,{childList:true,subtree:true,characterData:true});
 });
}

try{
 const p=await browser.newPage();p.setDefaultTimeout(120000);p.setDefaultNavigationTimeout(120000);await p.setViewport(process.env.CI?{width:960,height:600}:{width:1280,height:800});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});await observe(p);await p.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__READY__);await sleep(1500);await p.screenshot({path:out+'/dock.png'});
 assert.equal(await p.evaluate(()=>window.__RACE__.stats().vehicleCount),1);
 await p.click('#start');await p.waitForFunction(()=>window.__RACE__.state.phase==='countdown');await p.screenshot({path:out+'/countdown.png'});await p.waitForFunction(()=>window.__RACE__.state.phase==='race');pass('Solo mode, real start button and full countdown enter race');
 const boostStart=await p.evaluate(()=>window.__RACE__.state.time);await p.keyboard.down('Space');await p.waitForFunction(t=>window.__RACE__.state.time>=t+2.2,{},boostStart);let stats=await p.evaluate(()=>window.__RACE__.stats());assert(stats.progress>30&&stats.speed>25&&stats.charge<90);await p.keyboard.up('Space');pass('Actual keyboard boost moves the car and consumes charge');
 const laneBefore=await p.evaluate(()=>window.__RACE__.state.cars[0].lane);const steerStart=await p.evaluate(()=>window.__RACE__.state.time);await p.keyboard.down('KeyD');await p.waitForFunction(t=>window.__RACE__.state.time>=t+.4,{},steerStart);await p.keyboard.up('KeyD');stats=await p.evaluate(()=>window.__RACE__.stats());assert(await p.evaluate(lane=>window.__RACE__.state.cars[0].lane>lane, laneBefore));pass('Right steering changes the driving lane');
 await p.click('#pause');const paused=await p.evaluate(()=>window.__RACE__.stats().time);await sleep(600);assert.equal(await p.evaluate(()=>window.__RACE__.stats().time),paused);await p.click('#resume');pass('Pause and resume freeze/unfreeze race simulation');
 // Start the complete route fresh after the isolated steering/pause checks.
 await p.click('#pause');await p.click('#restart');await p.waitForFunction(()=>window.__RACE__.state.phase==='race');
 // Closed-loop driver READS telemetry but only acts through real keyboard events.
 const held=new Set();let peak=0,gotRamp=false;const started=Date.now();
 while(Date.now()-started<(process.env.CI?600000:240000)){
  const state=await p.evaluate(async()=>{const t=await import('./track.js'),c=window.__RACE__.state.cars[0],r=window.__RACE__.state,road=t.sample(c.s),next=t.sample(Math.min(c.s+4,c.s<t.GRAVITY.entry?t.GRAVITY.entry:t.LENGTH));const curv=Math.atan2(road.t.z*next.t.x-road.t.x*next.t.z,road.t.dot(next.t))/4;const drift=(c.s>190&&c.s<275)||(c.s>t.GRAVITY.entry-110&&c.s<t.GRAVITY.entry)||!!c.stunt||Math.abs(curv)>.009;return{phase:r.phase,time:r.time,s:c.s,lane:c.lane,heading:c.heading,charge:c.charge,curv,drift,stunt:c.stunt,jump:c.jump,gravity:c.gravityRuns,stats:window.__RACE__.stats()};});
  if(state.phase==='results')break;
  const target=Math.atan(-state.lane*.14),force=state.stunt?0:((target-state.heading)*3-state.curv*state.stats.speed+state.heading*.42)/(state.drift?1.35:.94);
  const want=new Set();if(force>.12)want.add('KeyD');if(force<-.12)want.add('KeyA');if(state.drift)want.add('ShiftLeft');else if(state.charge>8)want.add('Space');
  for(const key of held)if(!want.has(key)){await p.keyboard.up(key);held.delete(key);}for(const key of want)if(!held.has(key)){await p.keyboard.down(key);held.add(key);}
  peak=Math.max(peak,state.stats.peakHeight);
  if(state.stunt&&state.stunt.elapsed>.65&&!frames.includes('ascent')){await p.screenshot({path:out+'/ascent.png'});frames.push('ascent');}
  if(state.stunt&&state.stunt.elapsed>2.5&&!frames.includes('flight')){await p.screenshot({path:out+'/flight.png'});frames.push('flight');}
  if(state.gravity&&!gotRamp){gotRamp=true;await p.screenshot({path:out+'/landing.png'});console.log('First gravity transfer completed at',state.time.toFixed(2));}
  if(state.jump&&state.jump.elapsed>.55&&!frames.includes('flat-jump')){await p.screenshot({path:out+'/flat-jump.png'});frames.push('flat-jump');}
  if(state.s>650&&!frames.includes('bridge')){await p.screenshot({path:out+'/bridge.png'});frames.push('bridge');}
  if(state.s>1150&&!frames.includes('covered')){await p.screenshot({path:out+'/covered.png'});frames.push('covered');}
  await sleep(70);
 }
 for(const key of held)await p.keyboard.up(key);
 const result=await p.evaluate(()=>({stats:window.__RACE__.stats(),cars:window.__RACE__.state.cars}));await fs.writeFile(out+'/last-run.json',JSON.stringify(result,null,2));assert.equal(result.stats.phase,'results');assert(result.stats.gravityRuns>=1&&peak>30);assert(result.cars[0].pickupCount>0);assert(result.cars[0].driftTime>0);assert.equal(result.cars[0].landings,2,'Both launches land');assert(result.stats.wheelAngles.some(v=>Math.abs(v)>10),'Wheels rotate during driving');pass('Real-input driver completes both launches and the separate receiving road with working controls and rotating wheels');await p.screenshot({path:out+'/results.png'});
 await p.click('#again');await p.waitForFunction(()=>window.__RACE__.state.phase==='countdown');assert.equal(await p.evaluate(()=>window.__RACE__.state.cars[0].finish),null);pass('Race-again resets finish state and countdown');
 await p.keyboard.press('KeyC');assert.equal(await p.evaluate(()=>window.__RACE__.stats().cameraMode),'follow');await p.click('#camera');assert.equal(await p.evaluate(()=>window.__RACE__.stats().cameraMode),'cinematic');pass('C key and Camera button switch between chase and cinematic modes');
 await p.close();
 const phone=await browser.newPage();phone.setDefaultTimeout(120000);phone.setDefaultNavigationTimeout(120000);await phone.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});phone.on('pageerror',e=>errors.push(e.message));await observe(phone);await phone.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'domcontentloaded'});await phone.waitForFunction(()=>window.__READY__);await phone.screenshot({path:out+'/phone-dock.png'});await phone.tap('#start');await phone.waitForFunction(()=>window.__RACE__.state.phase==='race');
 const bounds=await phone.$eval('[data-control="boost"]',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});await phone.touchscreen.touchStart(bounds.x,bounds.y);await phone.waitForFunction(()=>window.__RACE__.state.cars[0].boostTime>.8);await phone.touchscreen.touchEnd();assert(await phone.evaluate(()=>window.__RACE__.state.cars[0].boostTime>.5));assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await phone.screenshot({path:out+'/phone-race.png'});await phone.tap('#pause');assert(await phone.evaluate(()=>window.__RACE__.state.paused));pass('Phone touch starts, holds boost and pauses without horizontal overflow');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);pass('No browser exceptions or missing resources');await fs.writeFile(out+'/report.json',JSON.stringify({passed:true,checks,errors,failed,peakHeight:peak,result,note:'Headless browser is functional verification, not physical-device performance measurement.'},null,2));
}catch(error){
 await fs.writeFile(out+'/failure.json',JSON.stringify({passed:false,message:error.message,stack:error.stack,checks,errors,failed,diagnostics},null,2));
 console.error('Browser diagnostics:',JSON.stringify({errors,failed,diagnostics}));throw error;
}finally{await browser.close();}
