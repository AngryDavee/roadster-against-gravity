import {LENGTH,LAPS,WIDTH,GRAVITY,JUMPS,PICKUPS,wrap,clamp,smooth,sample} from './track.js';
import {carPose} from './stunt.js';
export const NAMES=['YOU','VEGA','ION','SABLE','NOVA','KITE'];
export const COLORS=[0xd8dce5,0xeea252,0x77d9e6,0xa89ae3,0xd97983,0xa9d9b0];
const mix=(a,b,t)=>a+(b-a)*t;
const wave=(i,t)=>Math.sin(t*.73+i*13.1)*.5+Math.sin(t*.31+i*8.9)*.5;
export function createRace(){
 return {phase:'dock',countdown:3.6,time:0,tick:0,paused:false,events:[],pickups:new Map(),finishOrder:[],
 cars:NAMES.map((name,i)=>({id:i,name,s:-Math.floor(i/2)*7,lane:i%2?3:-3,speed:0,charge:100,boosting:false,drifting:false,lat:0,stunt:null,jump:null,cooldown:0,finish:null,airtime:0,landings:0,driftTime:0,gravityRuns:0,pickupCount:0,collisions:0,boostTime:0}))};
}
export function startRace(r){Object.assign(r,createRace());r.phase='countdown';}
function event(r,text,tone='cyan'){r.events.push({text,tone,until:r.time+2.2});if(r.events.length>10)r.events.shift();}
function crossed(previous,current,at){return Math.floor((previous-at)/LENGTH)<Math.floor((current-at)/LENGTH);}
export function position(car){
 if(car.stunt){
  const q=car.stunt,u=clamp(q.elapsed/GRAVITY.duration,0,1),a=mix(3.45,12.85,u),pose=carPose(a),gate=sample(GRAVITY.entry);
  const flight=smooth((a-9.6)/3.25),end=sample(GRAVITY.exit,car.lane);
  const x0=gate.p.x+gate.t.x*pose.z,z0=gate.p.z+gate.t.z*pose.z;
  const finalPose=carPose(12.85),naturalEnd=gate.p.clone().addScaledVector(gate.t,finalPose.z);
  return {x:x0+(end.p.x-naturalEnd.x)*flight,y:gate.p.y+pose.y,z:z0+(end.p.z-naturalEnd.z)*flight,
   yaw:gate.yaw+Math.PI*smooth((a-9.6)/1.14),pitch:a<=9.6?pose.pitch:mix(-2.65,-Math.PI,smooth((a-9.6)/1.14))+Math.PI*smooth((a-9.6)/1.14),roll:0,air:a>9.6,action:a};
 }
 const road=sample(car.s,car.lane),u=car.jump?car.jump.elapsed/car.jump.duration:0;
 let rampLift=0,rampPitch=0;for(const j of JUMPS){const distance=wrap(j.s-car.s);if(distance<12&&Math.abs(car.lane-j.lane)<2.6&&!car.jump){rampLift=(1-distance/12)*2;rampPitch=-Math.atan(2/12);}}
 return {x:road.p.x,y:road.p.y+(car.jump?Math.sin(Math.PI*u)*6.5+2*(1-u):rampLift),z:road.p.z,yaw:road.yaw-car.lat*.024+(car.jump?.spin?u*Math.PI*2:0),pitch:car.jump?-.14*Math.cos(Math.PI*u):-Math.asin(road.t.y)+rampPitch,roll:car.lat*.012,air:!!car.jump,action:car.jump?11:0};
}
export function step(r,dt,input={}){
 if(r.paused||r.phase==='dock'||r.cars.every(c=>c.finish!==null))return;
 dt=clamp(dt,0,1/30);r.tick++;
 if(r.phase==='countdown'){r.countdown-=dt;if(r.countdown<=0){r.phase='race';event(r,'GO / FULL THRUST');}return;}
 r.time+=dt;
 for(const c of r.cars){
  if(c.finish!==null)continue;
  c.cooldown=Math.max(0,c.cooldown-dt);
  const prev=c.s,road=sample(c.s),ahead=sample(c.s+12),curv=Math.atan2(road.t.z*ahead.t.x-road.t.x*ahead.t.z,road.t.dot(ahead.t))/12;
  let steer=input.steer||0,drift=!!input.drift,boost=!!input.boost;
  if(c.id){
   // Stable personalities and physical progress; no rubber-band teleport or free boost.
   const target=wave(c.id,r.time*.24)*7;
   const rampDistance=wrap(GRAVITY.entry-c.s);
   let desired=target;
   if(rampDistance<95&&[1,3,5].includes(c.id))desired=0;
   const pickup=PICKUPS.find(p=>wrap(p.s-c.s)<80);if(pickup&&rampDistance>95)desired=pickup.lanes[(c.id+Math.floor(r.time/6))%3];
   steer=clamp((desired-c.lane)*.55-c.lat*.15,-1,1);
   drift=Math.abs(curv)>.006&&c.speed>32;
   boost=c.charge>20&&Math.abs(curv)<.005&&Math.sin(r.time*.45+c.id*2)>.1;
   if(Math.sin(r.time*.19+c.id*7)>.993)steer+=.45; // occasional recoverable line error
  }
  c.boosting=boost&&c.charge>1&&!drift;c.drifting=drift&&!c.stunt&&!c.jump&&c.speed>15;
  if(c.boosting){c.charge=Math.max(0,c.charge-dt*21);c.boostTime+=dt;}
  if(c.drifting&&Math.abs(steer)>.15){c.charge=Math.min(100,c.charge+dt*15);c.driftTime+=dt;}
  const targetSpeed=(c.id?46+(c.id%3)*.6:48)+(c.boosting?21:0)-Math.min(15,Math.abs(curv)*750)*(c.drifting?.35:1)-(c.drifting?5:0);
  c.speed+=clamp(targetSpeed-c.speed,-30*dt,(c.boosting?27:18)*dt);
  if(c.stunt){
   c.stunt.elapsed+=dt;c.stunt.trim+=steer*dt*2.5;c.stunt.trim=clamp(c.stunt.trim,-6,6);
   if(c.boosting)c.stunt.trim*=Math.exp(-dt*2);
   c.s=mix(c.stunt.from,c.stunt.to,smooth(c.stunt.elapsed/GRAVITY.duration));
   if(c.stunt.elapsed>GRAVITY.duration){
    c.s=c.stunt.to;c.lane=clamp(c.stunt.trim,-9,9);const clean=Math.abs(c.stunt.trim)<3;
    c.speed=clean?58:32;c.charge=Math.min(100,c.charge+(clean?42:12));c.gravityRuns++;c.landings++;c.airtime+=2.2;c.stunt=null;
    if(!c.id)event(r,clean?'GRAVITY TRANSFER / +42 CHARGE':'ROUGH LANDING / RECOVER','amber');
   }
  }else{
   const force=steer*(c.drifting?15:10)+curv*c.speed*c.speed*.055;
   c.lat+=(force-c.lat)*Math.min(1,dt*5);c.lane+=c.lat*dt;
   if(Math.abs(c.lane)>WIDTH/2-1){c.lane=clamp(c.lane,-WIDTH/2+1,WIDTH/2-1);c.lat*=-.25;if(!c.cooldown){c.speed*=.63;c.collisions++;c.cooldown=.8;if(!c.id)event(r,'BARRIER / SPEED LOST','red');}}
   c.s+=c.speed*dt;
   if(c.jump){c.jump.elapsed+=dt;c.airtime+=dt;c.charge=Math.min(100,c.charge+dt*7);if(c.jump.elapsed>=c.jump.duration){c.jump=null;c.landings++;c.charge=Math.min(100,c.charge+15);if(!c.id)event(r,'AIRTIME / CLEAN TOUCHDOWN');}}
   if(!c.jump&&crossed(prev,c.s,GRAVITY.entry)&&Math.abs(c.lane)<3.4&&c.speed>32){
    const lap=Math.floor((c.s-GRAVITY.entry)/LENGTH);
    c.stunt={elapsed:0,from:c.s,to:lap*LENGTH+GRAVITY.exit,trim:c.lane*.2};c.lat=0;
    if(!c.id)event(r,'GRAVITY TRANSFER / HOLD YOUR LINE','amber');
   }
   for(const jump of JUMPS)if(!c.jump&&!c.stunt&&crossed(prev,c.s,jump.s)&&Math.abs(c.lane-jump.lane)<2.6&&c.speed>27){c.jump={elapsed:0,duration:1.55,spin:c.drifting};if(!c.id)event(r,c.drifting?'FLAT SPIN / CHARGE RECOVERY':'AIRBORNE');}
  }
  if(!c.stunt&&!c.jump)for(let i=0;i<PICKUPS.length;i++)if(crossed(prev,c.s,PICKUPS[i].s))for(let j=0;j<3;j++){
   const key=`${i}:${j}`;if(Math.abs(c.lane-PICKUPS[i].lanes[j])<1.8&&(r.pickups.get(key)||0)<=r.time){r.pickups.set(key,r.time+7);c.charge=Math.min(100,c.charge+25);c.pickupCount++;if(!c.id)event(r,'CELL COLLECTED / +25');}
  }
  if(c.s>=LENGTH*LAPS){c.finish=r.time;c.s=LENGTH*LAPS;r.finishOrder.push(c.id);if(!c.id){r.phase='results';event(r,'RACE COMPLETE');}}
 }
 for(let i=0;i<r.cars.length;i++)for(let j=i+1;j<r.cars.length;j++){
  const a=r.cars[i],b=r.cars[j];if(a.stunt||b.stunt||a.jump||b.jump||a.cooldown||b.cooldown||a.finish!==null||b.finish!==null)continue;
  if(Math.abs(a.s-b.s)<4&&Math.abs(a.lane-b.lane)<1.9){const faster=a.speed>b.speed?a:b;faster.speed*=.78;a.cooldown=b.cooldown=.65;const dir=a.lane>b.lane?1:-1;a.lane+=dir*.8;b.lane-=dir*.8;a.collisions++;b.collisions++;if(!i)event(r,'CONTACT / KEEP RACING','amber');}
 }
}
export function standings(r){return [...r.cars].sort((a,b)=>a.finish!==null&&b.finish!==null?a.finish-b.finish:a.finish!==null?-1:b.finish!==null?1:b.s-a.s);}
