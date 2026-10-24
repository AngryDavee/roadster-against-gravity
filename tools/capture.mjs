import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';

const options=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')));
const full=Object.hasOwn(options,'film'),w=Number(options.width||1280),h=Number(options.height||720);
const ffmpeg=process.env.FFMPEG||'ffmpeg';
if(full){const probe=spawnSync(ffmpeg,['-version'],{stdio:'ignore'});if(probe.error||probe.status!==0)throw new Error('Install FFmpeg on PATH or set FFMPEG to its executable before exporting a film.');}
const output=options.output||'evidence/final';await fs.mkdir(output,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.setViewport({width:w,height:h,deviceScaleFactor:1});
 page.on('pageerror',e=>{console.error(e.message);process.exitCode=1;});
 await page.goto((process.env.ROADSTER_URL||'http://localhost:4174')+'/?capture&clean',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__FILM__?.state.ready,{timeout:60000});
 if(full){
  const file=path.join(output,'roadster-against-gravity.mp4');
  const ff=spawn(ffmpeg,['-y','-f','image2pipe','-vcodec','mjpeg','-framerate','24000/1001','-i','pipe:0','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',file],{stdio:['pipe','ignore','pipe']});
  let err='';ff.stderr.on('data',d=>err+=d);const exited=once(ff,'exit');
  for(let frame=0;frame<1094;frame++){
   await page.evaluate(f=>window.__FILM__.frame(f),frame);
   const buffer=await page.screenshot({type:'jpeg',quality:96});if(!ff.stdin.write(buffer))await once(ff.stdin,'drain');
   if(frame%120===0)console.log(`Rendered ${frame}/1094 frames`);
  }
  ff.stdin.end();const [code]=await exited;if(code!==0)throw new Error(err.slice(-2000));console.log('Film saved:',file);
 }else{
  const frames=options.frames?options.frames.split(',').map(Number):[0,51,180,234,258,282,331,419,492,582,656,672,743,912,948,1093];
  for(const frame of frames){await page.evaluate(f=>window.__FILM__.frame(f),frame);await page.screenshot({path:path.join(output,`frame-${frame}.png`)});}
  await fs.writeFile(path.join(output,'render-stats.json'),JSON.stringify(await page.evaluate(()=>window.__FILM__.stats()),null,2));console.log('Captured',frames.length,'stills.');
 }
}finally{await browser.close();}
