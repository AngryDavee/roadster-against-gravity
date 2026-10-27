// Visible keyboard-driven demonstration. Never changes vehicle state or time.
// --rehearse: headless validation. Default: fullscreen dock, waits for go-file.
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import path from 'node:path';
const rehearse=process.argv.includes('--rehearse'),go=path.join(tmpdir(),'meridian-recording-go');
const out=process.env.SHOWCASE_DIR||'evidence/racing/recording';await fs.mkdir(out,{recursive:true});
if(!rehearse)await fs.rm(go,{force:true});
const browser=await puppeteer.launch({headless:rehearse,defaultViewport:rehearse?{width:1280,height:800}:null,ignoreDefaultArgs:rehearse?[]:['--enable-automation'],args:['--no-sandbox',...rehearse?[]:['--start-fullscreen','--window-size=1440,900']]});
const page=(await browser.pages())[0],errors=[];page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),held=new Set();
try{
 await page.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__READY__);
 if(!rehearse){
  await page.bringToFront();await page.evaluate(()=>document.documentElement.requestFullscreen());
  await page.waitForFunction(()=>!!document.fullscreenElement);
  const size=await page.evaluate(()=>({width:innerWidth,height:innerHeight,screenWidth:screen.width,screenHeight:screen.height,fullscreen:!!document.fullscreenElement}));
  await fs.writeFile(out+'/fullscreen-ready.json',JSON.stringify(size,null,2));console.log('FULLSCREEN_READY',JSON.stringify(size));console.log('Waiting for recording. When ready, run npm run race:record:go in another terminal.');
  while(true){try{await fs.access(go);await fs.rm(go,{force:true});break;}catch{}await sleep(300);}
  await page.bringToFront();await page.addStyleTag({content:'*{cursor:none!important}'});
 }
 await page.click('#start');await page.waitForFunction(()=>window.__RACE__.state.phase==='race');
 console.log('RUN_STARTED');const started=Date.now();let logged=false;
 while(Date.now()-started<300000){
  const state=await page.evaluate(async()=>{
   const t=await import('./track.js'),f=await import('./transfer.js'),r=window.__RACE__.state,c=r.cars[0],road=t.sample(c.s),next=t.sample(Math.min(c.s+4,c.s<t.GRAVITY.entry?t.GRAVITY.entry:t.LENGTH));
   const curv=Math.atan2(road.t.z*next.t.x-road.t.x*next.t.z,road.t.dot(next.t))/4;
   return{phase:r.phase,paused:r.paused,time:r.time,s:c.s,lane:c.lane,heading:c.heading,charge:c.charge,speed:c.speed,curv,stunt:c.stunt,age:c.stunt?c.stunt.elapsed-f.rampDuration(c.stunt.entrySpeed):-99,gravity:c.gravityRuns,spins:c.spins,drift:(c.s>190&&c.s<275)||(c.s>t.GRAVITY.entry-110&&c.s<t.GRAVITY.entry)||Math.abs(curv)>.009};
  });
  if(state.phase==='results')break;
  const want=new Set();
  if(!state.paused){
   if(state.stunt){if(state.age>-.65&&state.age<4.1){want.add('ShiftLeft');want.add('KeyD');}}
   else{
    const target=Math.atan(-state.lane*.14),force=((target-state.heading)*3-state.curv*state.speed+state.heading*.42)/(state.drift?1.35:.94);
    if(force>.12)want.add('KeyD');if(force<-.12)want.add('KeyA');
    if(state.drift)want.add('ShiftLeft');else if(state.charge>8)want.add('Space');
   }
  }
  for(const key of held)if(!want.has(key)){await page.keyboard.up(key);held.delete(key);}
  for(const key of want)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}
  if(state.gravity&&!logged){console.log('GRAVITY_LANDED',JSON.stringify({time:state.time,spins:state.spins}));logged=true;}
  await sleep(30);
 }
 for(const key of held)await page.keyboard.up(key);held.clear();
 const result=await page.evaluate(()=>({phase:window.__RACE__.state.phase,car:window.__RACE__.state.cars[0],title:document.getElementById('result-title').innerText,fullscreen:!!document.fullscreenElement,audio:window.__RACE_AUDIO__.stats()}));
 assert.equal(result.phase,'results');assert(result.car.spins>=1,'At least one completed driver-triggered spin');assert.equal(result.car.gravityRuns,1);assert.equal(result.car.landings,2);assert.deepEqual(errors,[]);
 await page.screenshot({path:out+(rehearse?'/rehearsal-finish.png':'/recording-finish.png')});
 await fs.writeFile(out+(rehearse?'/rehearsal.json':'/recording-run.json'),JSON.stringify({passed:true,input:'real keyboard events only',...result,errors},null,2));console.log('RUN_COMPLETE',JSON.stringify({title:result.title,spins:result.car.spins,finish:result.car.finish}));
}catch(error){console.error(error);await fs.writeFile(out+'/run-error.txt',String(error));process.exitCode=1;}
finally{for(const key of held)await page.keyboard.up(key).catch(()=>{});if(rehearse)await browser.close();else browser.disconnect();}
