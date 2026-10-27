// Real browser audio decode/output and user gestures; no mocked AudioContext.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='evidence/racing/music';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),errors=[],checks=[];
try{
 const page=await browser.newPage();page.setDefaultTimeout(60000);await page.setViewport({width:1440,height:900});
 page.on('pageerror',e=>errors.push(e.message));let requests=0;page.on('request',r=>{if(r.url().endsWith('.mp3'))requests++;});
 await page.goto(process.env.ROADSTER_URL||'http://localhost:4175');await page.waitForFunction(()=>window.__READY__);
 assert.equal(await page.evaluate(()=>window.__RACE_AUDIO__.stats().context),'locked');assert.equal(requests,0);checks.push('no autoplay or music download before user gesture');
 await page.click('#start');await page.waitForFunction(()=>window.__RACE_AUDIO__.stats().playing);
 const initial=await page.evaluate(()=>window.__RACE_AUDIO__.stats());assert(Math.abs(initial.duration-95.6)<.01);assert.equal(initial.state,'ready');checks.push('local music decoded and playing after Start');
 await page.evaluate(()=>{const a=window.__RACE_AUDIO__;window.__MUSIC_METER__=a.ctx.createAnalyser();window.__MUSIC_METER__.fftSize=2048;a.master.connect(window.__MUSIC_METER__);});
 async function rms(){return page.evaluate(()=>{const d=new Float32Array(2048);window.__MUSIC_METER__.getFloatTimeDomainData(d);return Math.sqrt(d.reduce((a,v)=>a+v*v,0)/d.length);});}
 await sleep(600);const audible=await rms();assert(audible>.0001,'Master has audible PCM output');
 await page.click('#sound');await sleep(450);assert.equal(await page.evaluate(()=>window.__RACE_AUDIO__.stats().muted),true);assert(await rms()<.0001);await page.click('#sound');checks.push('master mute silences actual output');
 await page.click('#pause');await page.waitForFunction(()=>window.__RACE_AUDIO__.stats().context==='suspended');
 const pausedOffset=await page.evaluate(()=>window.__RACE_AUDIO__.stats().offset);await sleep(400);assert.equal(await page.evaluate(()=>window.__RACE_AUDIO__.stats().offset),pausedOffset);
 await page.focus('#music-volume');await page.keyboard.press('Home');for(let i=0;i<30;i++)await page.keyboard.press('ArrowRight');
 assert.equal(await page.evaluate(()=>window.__RACE_AUDIO__.stats().volume),.3);
 await page.screenshot({path:out+'/music-settings.png'});await page.click('#resume');await page.waitForFunction(()=>window.__RACE_AUDIO__.stats().context==='running');await sleep(200);
 assert(await page.evaluate(()=>window.__RACE_AUDIO__.stats().offset)>pausedOffset);checks.push('pause preserves playhead; volume slider and resume work');
 await page.keyboard.press('KeyR');await page.waitForFunction(()=>window.__RACE_AUDIO__.stats().mode==='airborne');await sleep(350);
 const air=await page.evaluate(()=>window.__RACE_AUDIO__.stats());assert(air.filterHz<8000&&air.musicGain<.1);await page.waitForFunction(()=>window.__RACE__.state.cars[0].gravityRuns===1);await sleep(600);
 const land=await page.evaluate(()=>window.__RACE_AUDIO__.stats());assert.equal(land.mode,'race');assert(land.filterHz>12000&&land.musicGain>air.musicGain);checks.push('music softens in flight and returns after landing');
 await page.click('#pause');await page.click('#back');assert.equal(await page.evaluate(()=>window.__RACE_AUDIO__.stats().playing),false);checks.push('return to dock stops music');
 await page.click('#start');await page.waitForFunction(()=>window.__RACE_AUDIO__.stats().playing);await page.click('#sound');
 await page.reload();await page.waitForFunction(()=>window.__READY__);const saved=await page.evaluate(()=>window.__RACE_AUDIO__.stats());assert(saved.muted&&saved.volume===.3);checks.push('sound preferences survive reload');
 // Failed music must not prevent the race from starting.
 await page.setRequestInterception(true);page.on('request',r=>r.url().endsWith('.mp3')?r.abort():r.continue());
 await page.click('#practice');await page.waitForFunction(()=>window.__RACE_AUDIO__.stats().state==='unavailable');await page.waitForFunction(()=>window.__RACE__.state.phase==='race'&&window.__RACE__.state.cars[0].speed>5);checks.push('music request failure does not block racing');
 assert.deepEqual(errors,[]);const result={passed:true,checks,duration:initial.duration,measuredMasterRms:audible,air,land,errors};await fs.writeFile(out+'/report.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:true,checks,duration:initial.duration,errors},null,2));
}finally{await browser.close();}
