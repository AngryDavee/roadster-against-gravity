// Staged visual inspection, deliberately separate from real-input race acceptance.
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
const output=process.argv[2]||'evidence/racing/final';await fs.mkdir(output,{recursive:true});
const b=await puppeteer.launch({headless:true,args:['--no-sandbox']});
try{const p=await b.newPage();p.setDefaultTimeout(120000);p.setDefaultNavigationTimeout(120000);await p.setViewport({width:1280,height:800});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.ROADSTER_URL||'http://localhost:4175',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.__READY__);await new Promise(r=>setTimeout(r,1300));await p.screenshot({path:output+'/dock.png'});await p.click('#start');await p.waitForFunction(()=>window.__RACE__.state.phase==='race');
for(const [name,progress,stunt]of[['coast',160,null],['gravity',590,2.6],['flight',890,4.8],['bridge',1400,null],['covered',1935,null]]){
 await p.evaluate(async({progress,stunt})=>{const t=await import('./track.js'),r=window.__RACE__.state,c=r.cars[0];r.paused=true;r.time=20;c.s=progress;c.lane=0;c.speed=55;c.boosting=false;c.stunt=stunt?{elapsed:stunt,from:t.GRAVITY.entry,to:t.GRAVITY.exit,trim:0}:null;},{progress,stunt});await new Promise(r=>setTimeout(r,1100));await p.screenshot({path:`${output}/${name}.png`});
}if(errors.length)throw new Error(errors.join('\n'));await fs.writeFile(output+'/capture.json',JSON.stringify({kind:'staged visual inspection; not a driving test',errors,stats:await p.evaluate(()=>window.__RACE__.stats())},null,2));console.log('Captured six current visual-inspection frames.');}finally{await b.close();}
