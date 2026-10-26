// Focused staged approach, then real-time rendering and real keyboard controls.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='evidence/racing/transfer/playtest';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
const errors=[],shots=[],samples=[];let recorder;const sleep=t=>new Promise(r=>setTimeout(r,t));
try{
 const page=await browser.newPage();page.setDefaultTimeout(120000);await page.setViewport({width:1440,height:900});page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__READY__);await page.click('#start');await page.waitForFunction(()=>window.__RACE__.state.phase==='race');
 if(process.env.TRANSFER_RECORD==='1')recorder=await page.screencast({path:out+'/transfer-preview.webm',ffmpegPath:process.env.FFMPEG,fps:30,scale:.75});
 await page.evaluate(async()=>{const {GRAVITY}=await import('./track.js');const c=window.__RACE__.state.cars[0];c.s=GRAVITY.entry-7;c.lane=0;c.lat=0;c.speed=48;c.jump=null;});
 const started=Date.now();let landed=false,peakCloud=0;
 while(Date.now()-started<30000){
  const info=await page.evaluate(()=>{const c=window.__RACE__.state.cars[0];return{...window.__RACE__.stats(),stunt:c.stunt,landings:c.landings};});samples.push(info);peakCloud=Math.max(peakCloud,info.vapor.ground);
  if(info.stunt&&info.position.air&&info.position.y>3&&info.position.y<5&&!shots.includes('hover')){await page.screenshot({path:out+'/hover.png'});shots.push('hover');}
  if(info.stunt){for(const [name,at]of[['ramp',1.6],['lip',3.4],['flight',4.2],['descent',5.8],['cloud',7.1]])if(info.stunt.elapsed>=at&&!shots.includes(name)){await page.screenshot({path:`${out}/${name}.png`});shots.push(name);break;}}
  if(info.landings&&!landed){landed=true;await page.screenshot({path:`${out}/touchdown.png`});shots.push('touchdown');await sleep(1800);await page.screenshot({path:`${out}/drive-away.png`});break;}
  await sleep(70);
 }
 assert(landed,'Transfer lands');assert(peakCloud>20,'Ground vapor builds before touchdown');assert(shots.includes('flight'));
 const air=samples.filter(s=>s.position.air&&s.stunt);assert(air.length>8);for(const s of samples.filter(s=>s.stunt&&s.stunt.elapsed>1.5))assert(Math.abs(s.camera.heroScreen[0])<.96&&Math.abs(s.camera.heroScreen[1])<.96,'Car remains framed during the cinematic camera sequence');const minX=Math.min(...air.map(s=>s.position.x)),maxX=Math.max(...air.map(s=>s.position.x));assert(maxX-minX<.01,'No sideways nudge in flight');
 await page.keyboard.press('KeyC');assert.equal(await page.evaluate(()=>window.__RACE__.stats().cameraMode),'follow');await page.click('#camera');assert.equal(await page.evaluate(()=>window.__RACE__.stats().cameraMode),'cinematic');
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/report.json',JSON.stringify({passed:true,kind:'Staged approach, real-time automatic ramp traversal; keyboard/button camera controls',checks:['takeoff and landing','fixed lateral alignment','pre-touchdown ground vapor','wide camera and follow toggle','no browser exceptions'],peakCloud,flightLateralRange:maxX-minX,shots,errors,samples},null,2));console.log('PASS Directed transfer, landing vapor and switchable wide camera',JSON.stringify({peakCloud,shots}));
}finally{if(recorder)await recorder.stop();await browser.close();}
