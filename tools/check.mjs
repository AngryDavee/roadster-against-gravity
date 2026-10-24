import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import puppeteer from 'puppeteer';
import {FPS,FRAME_COUNT,DURATION,SHOTS,shotAt,actionTime,carPose,cameraPose} from '../app/timeline.js';

const checks=[];const ok=(name)=>{checks.push({name,pass:true});console.log('PASS',name);};
assert.equal(FRAME_COUNT,1094);assert.equal(FPS,24000/1001);
for(const [frame,shot] of [[50,0],[51,1],[418,1],[419,2],[655,2],[656,3],[742,3],[743,4],[1093,4]])assert.equal(shotAt(frame/FPS),shot);
ok('All four cuts occur on the original source frames');
for(let frame=0;frame<FRAME_COUNT;frame++){
 const t=frame/FPS,a=actionTime(t),p=carPose(a),c=cameraPose(t,p);
 assert(Object.values(p).every(Number.isFinite));assert([...c.position,...c.target,c.fov,c.roll].every(Number.isFinite));assert(p.y>=0);assert(c.fov>0&&c.fov<100);
}
ok('Every source frame has a finite vehicle and camera pose');
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage(),errors=[],badResources=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badResources.push(r.url());});
 await page.setViewport({width:1280,height:720,deviceScaleFactor:1});await page.goto((process.env.ROADSTER_URL||'http://localhost:4174')+'/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__FILM__?.state.ready);
 await fs.mkdir('evidence/checks',{recursive:true});await page.screenshot({path:'evidence/checks/title-desktop.png'});
 await page.click('#begin');await page.waitForFunction(()=>window.__FILM__.state.time>.25);await page.click('#play');
 assert.equal(await page.evaluate(()=>window.__FILM__.state.playing),false);ok('Watch / play / pause work through real mouse input');
 await page.click('#chapters button:nth-child(3)');assert.equal(await page.evaluate(()=>window.__FILM__.stats().shot),2);ok('Chapter selection seeks to the replay');
 await page.focus('#timeline');await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');assert(Math.abs(await page.evaluate(()=>window.__FILM__.state.time)-1/FPS)<1e-6);ok('Timeline keyboard seeking moves one source frame');
 await page.click('#compare');await page.waitForFunction(()=>document.querySelector('#reference').readyState>=2);await page.evaluate(()=>window.__FILM__.frame(282));await page.waitForFunction(()=>Math.abs(document.querySelector('#reference').currentTime-window.__FILM__.state.time)<.05);
 assert(await page.evaluate(()=>Math.abs(document.querySelector('#film').width/document.querySelector('#film').height-16/9)<.01));await page.screenshot({path:'evidence/checks/comparison.png'});ok('Reference comparison seeks in sync and preserves 16:9 framing');await page.click('#compare');
 await page.click('#inspect');const before=await page.$eval('#film',c=>c.toDataURL());await page.mouse.move(700,360);await page.mouse.down();await page.mouse.move(900,420,{steps:10});await page.mouse.up();const after=await page.$eval('#film',c=>c.toDataURL());assert.notEqual(before,after);await page.screenshot({path:'evidence/checks/inspection.png'});await page.click('#inspect');ok('Inspection orbit changes the actual 3D view');
 await page.evaluate(()=>window.__FILM__.frame(282));const hash=await page.$eval('#film',c=>c.toDataURL());await page.evaluate(()=>{window.__FILM__.frame(912);window.__FILM__.frame(282);});assert.equal(await page.$eval('#film',c=>c.toDataURL()),hash);ok('Seeking away and back produces identical rendered pixels');
 await page.evaluate(t=>window.__FILM__.seek(t),DURATION-.25);await page.click('#play');await page.waitForFunction(()=>!window.__FILM__.state.playing);assert(Math.abs(await page.evaluate(()=>window.__FILM__.state.time)-(DURATION-1/FPS))<1e-6);await page.click('#restart');await page.waitForFunction(()=>window.__FILM__.state.time>.1&&window.__FILM__.state.time<2);await page.click('#play');ok('Film stops on its last frame and restarts correctly');
 // A phone must use real touch to start, rather than a programmatic click.
 const phone=await browser.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});await phone.goto((process.env.ROADSTER_URL||'http://localhost:4174')+'/',{waitUntil:'networkidle0'});await phone.waitForFunction(()=>window.__FILM__?.state.ready);await phone.screenshot({path:'evidence/checks/title-phone.png'});await phone.tap('#begin');await phone.waitForFunction(()=>window.__FILM__.state.time>.1);await phone.tap('#play');assert.equal(await phone.evaluate(()=>window.__FILM__.state.playing),false);assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await phone.screenshot({path:'evidence/checks/playback-phone.png'});ok('Phone touch starts and pauses playback without horizontal overflow');
 assert.deepEqual(errors,[]);assert.deepEqual(badResources.filter(u=>!u.endsWith('favicon.ico')),[]);ok('No browser exceptions or failed production resource requests');
 await fs.writeFile('evidence/checks/report.json',JSON.stringify({passed:true,checks,errors,badResources,sourceFrames:1094,fps:FPS,pictureDuration:DURATION,render:await page.evaluate(()=>window.__FILM__.stats())},null,2));
}finally{await browser.close();}
