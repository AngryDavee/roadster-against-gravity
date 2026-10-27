// Local Atlas-generated score; one shared context keeps pause/resume sample-continuous.
const MUSIC_URL=new URL('./audio/ignition-vector.mp3',import.meta.url);
const clamp=v=>Math.max(0,Math.min(1,v));
function read(key,fallback){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}}
export class RaceAudio{
 constructor(){
  this.muted=read('meridian.sound.muted','false')==='true';
  const volume=Number(read('meridian.music.volume','.65'));
  this.volume=Number.isFinite(volume)?clamp(volume):.65;
  this.state='idle';this.mode='silent';this.source=null;this.phase='dock';this.error=null;
 }
 unlock(){
  try{
   if(!this.ctx){
    const ctx=this.ctx=new (window.AudioContext||window.webkitAudioContext)();
    this.master=ctx.createGain();this.master.gain.value=this.muted?0:1;this.master.connect(ctx.destination);
    this.music=ctx.createGain();this.music.gain.value=0;
    this.filter=ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=16000;
    this.filter.connect(this.music);this.music.connect(this.master);
    this.engine=ctx.createGain();this.engine.gain.value=0;
    this.osc=ctx.createOscillator();this.osc.type='sawtooth';
    const engineFilter=ctx.createBiquadFilter();engineFilter.type='lowpass';engineFilter.frequency.value=500;
    this.osc.connect(engineFilter);engineFilter.connect(this.engine);this.engine.connect(this.master);this.osc.start();
   }
   this.ctx.resume().catch(()=>{});
   if(!this.buffer&&!this.loading){
    this.state='loading';this.error=null;
    this.loading=fetch(MUSIC_URL).then(r=>{if(!r.ok)throw new Error(`Music HTTP ${r.status}`);return r.arrayBuffer();})
     .then(data=>this.ctx.decodeAudioData(data)).then(buffer=>{this.buffer=buffer;this.state='ready';})
     .catch(error=>{this.state='unavailable';this.error=error.message;console.warn('Racing music unavailable:',error.message);})
     .finally(()=>{this.loading=null;});
   }
  }catch(error){this.state='unavailable';this.error=error.message;}
 }
 reset(){this.stop();this.unlock();}
 stop(){if(this.source){this.source.stop();this.source.disconnect();this.source=null;}this.mode='silent';}
 pause(value){if(!this.ctx)return;if(value)this.ctx.suspend().catch(()=>{});else this.unlock();}
 setMuted(value){this.muted=value;try{localStorage.setItem('meridian.sound.muted',String(value));}catch{}if(this.ctx)this.master.gain.setTargetAtTime(value?0:1,this.ctx.currentTime,.04);}
 setVolume(value){this.volume=clamp(value);try{localStorage.setItem('meridian.music.volume',String(this.volume));}catch{}}
 update({phase,paused,airborne,boosting,speed}){
  this.phase=phase;if(!this.ctx)return;
  const now=this.ctx.currentTime,active=phase==='race'&&!paused&&!document.hidden;
  if(phase==='dock'){this.stop();}
  if(active&&this.buffer&&!this.source&&this.ctx.state==='running'){
   const source=this.source=this.ctx.createBufferSource();source.buffer=this.buffer;source.loop=true;
   source.connect(this.filter);source.start();this.startedAt=now;
  }
  this.mode=active?(airborne?'airborne':boosting?'boost':'race'):phase==='results'?'results':'silent';
  const level=active?(airborne?.22:boosting?.52:.44):phase==='results'?.18:0;
  this.music.gain.setTargetAtTime(level*this.volume,now,airborne?.18:.3);
  this.filter.frequency.setTargetAtTime(airborne?4200:16000,now,.18);
  this.engine.gain.setTargetAtTime(active?.035:0,now,.12);
  this.osc.frequency.setTargetAtTime(40+speed*2.7,now,.1);
 }
 stats(){return{state:this.state,context:this.ctx?.state??'locked',muted:this.muted,volume:this.volume,mode:this.mode,playing:!!this.source,duration:this.buffer?.duration??0,offset:this.source?(this.ctx.currentTime-this.startedAt)%this.buffer.duration:0,musicGain:this.music?.gain.value??0,filterHz:this.filter?.frequency.value??0,error:this.error};}
}
