import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='evidence/racing/playtest';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
const errors=[],failed=[],checks=[],frames=[];const pass=name=>{checks.push(name);console.log('PASS',name);};
const sleep=t=>new Promise(r=>setTimeout(r,t));
try{
 const p=await browser.newPage();await p.setViewport({width:1280,height:800});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});await p.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.__READY__);await sleep(1500);await p.screenshot({path:out+'/dock.png'});
 await p.click('#start');await p.waitForFunction(()=>window.__RACE__.state.phase==='countdown');await p.screenshot({path:out+'/countdown.png'});await p.waitForFunction(()=>window.__RACE__.state.phase==='race');pass('Real start button and full countdown enter race');
 await p.keyboard.down('Space');await sleep(2200);let stats=await p.evaluate(()=>window.__RACE__.stats());assert(stats.progress>30&&stats.speed>25&&stats.charge<90);await p.screenshot({path:out+'/boost.png'});await p.keyboard.up('Space');pass('Actual keyboard boost moves the car and consumes charge');
 const xBefore=stats.position.x;await p.keyboard.down('KeyD');await sleep(400);await p.keyboard.up('KeyD');stats=await p.evaluate(()=>window.__RACE__.stats());assert(stats.position.x<xBefore);pass('Right steering moves toward screen-right on the opening straight');
 await p.click('#pause');const paused=await p.evaluate(()=>window.__RACE__.stats().time);await sleep(600);assert.equal(await p.evaluate(()=>window.__RACE__.stats().time),paused);await p.click('#resume');pass('Pause and resume freeze/unfreeze race simulation');
 // Closed-loop driver READS telemetry but only acts through real keyboard events.
 const held=new Set();let peak=0,gotRamp=false;const started=Date.now();
 while(Date.now()-started<240000){
  const state=await p.evaluate(async()=>{const t=await import('./track.js'),c=window.__RACE__.state.cars[0],r=window.__RACE__.state;const road=t.sample(c.s),next=t.sample(c.s+12),curv=Math.atan2(road.t.z*next.t.x-road.t.x*next.t.z,road.t.dot(next.t))/12;let target=0;const pu=t.PICKUPS.find(p=>t.wrap(p.s-c.s)<95);if(pu)target=pu.lanes[Math.floor(r.time/6)%3];const j=t.JUMPS.find(j=>t.wrap(j.s-c.s)<65);if(j)target=j.lane;if(t.wrap(t.GRAVITY.entry-c.s)<110||c.stunt)target=0;return{phase:r.phase,time:r.time,s:c.s,lane:c.lane,lat:c.lat,charge:c.charge,curv,target,stunt:c.stunt,gravity:c.gravityRuns,stats:window.__RACE__.stats()};});
  if(state.phase==='results')break;
  const force=state.stunt?0:(state.target-state.lane)*.7-state.lat*.25;
  const want=new Set();if(force>.22)want.add('KeyD');if(force<-.22)want.add('KeyA');if(Math.abs(state.curv)>.005)want.add('ShiftLeft');else if(state.charge>8)want.add('Space');
  for(const key of held)if(!want.has(key)){await p.keyboard.up(key);held.delete(key);}for(const key of want)if(!held.has(key)){await p.keyboard.down(key);held.add(key);}
  peak=Math.max(peak,state.stats.position.y);
  if(state.stunt&&state.stunt.elapsed>1.5&&!frames.includes('ascent')){await p.screenshot({path:out+'/ascent.png'});frames.push('ascent');}
  if(state.stunt&&state.stunt.elapsed>4.3&&!frames.includes('flight')){await p.screenshot({path:out+'/flight.png'});frames.push('flight');}
  if(state.gravity&&!gotRamp){gotRamp=true;await p.screenshot({path:out+'/landing.png'});console.log('First gravity transfer completed at',state.time.toFixed(2));}
  if(state.s>1350&&!frames.includes('bridge')){await p.screenshot({path:out+'/bridge.png'});frames.push('bridge');}
  if(state.s>1930&&!frames.includes('covered')){await p.screenshot({path:out+'/covered.png'});frames.push('covered');}
  await sleep(180);
 }
 for(const key of held)await p.keyboard.up(key);
 const result=await p.evaluate(()=>({stats:window.__RACE__.stats(),cars:window.__RACE__.state.cars}));assert.equal(result.stats.phase,'results');assert(result.stats.gravityRuns>=1&&peak>30);assert(result.cars[0].pickupCount>0);assert(result.cars[0].driftTime>0);pass('Real-input driver completes two laps with gravity transfer, pickups and drift');await p.screenshot({path:out+'/results.png'});
 await p.click('#again');await p.waitForFunction(()=>window.__RACE__.state.phase==='countdown');assert.equal(await p.evaluate(()=>window.__RACE__.state.cars[0].finish),null);pass('Race-again resets finish state and countdown');
 await p.close();
 const phone=await browser.newPage();await phone.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});phone.on('pageerror',e=>errors.push(e.message));await phone.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'networkidle0'});await phone.waitForFunction(()=>window.__READY__);await phone.screenshot({path:out+'/phone-dock.png'});await phone.tap('#start');await phone.waitForFunction(()=>window.__RACE__.state.phase==='race');
 const bounds=await phone.$eval('[data-control="boost"]',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});await phone.touchscreen.touchStart(bounds.x,bounds.y);await sleep(1200);await phone.touchscreen.touchEnd();assert(await phone.evaluate(()=>window.__RACE__.state.cars[0].boostTime>.5));assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await phone.screenshot({path:out+'/phone-race.png'});await phone.tap('#pause');assert(await phone.evaluate(()=>window.__RACE__.state.paused));pass('Phone touch starts, holds boost and pauses without horizontal overflow');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);pass('No browser exceptions or missing resources');await fs.writeFile(out+'/report.json',JSON.stringify({passed:true,checks,errors,failed,peakHeight:peak,result,note:'Headless browser is functional verification, not physical-device performance measurement.'},null,2));
}finally{await browser.close();}
