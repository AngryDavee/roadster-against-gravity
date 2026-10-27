import assert from 'node:assert/strict';
import * as THREE from '../racing/vendor/three.module.js';
import {createRace,startRace,step,position} from '../racing/simulation.js';
import {sample,LENGTH,GRAVITY,JUMPS} from '../racing/track.js';
import {transferPose,rampDuration,TRANSFER,FLIGHT_DIRECTION,LANDING_YAW} from '../racing/transfer.js';
const dt=1/60,checks=[],pass=s=>checks.push(s);
const fresh=()=>{const r=createRace();startRace(r);for(let n=0;n<220;n++)step(r,dt);return r;};
const quat=p=>p.quaternion?new THREE.Quaternion().fromArray(p.quaternion):new THREE.Quaternion().setFromEuler(new THREE.Euler(p.pitch,p.yaw,p.roll,'YXZ'));
const r=fresh();for(let n=0;n<120;n++)step(r,dt,{boost:true});assert(r.cars[0].speed>50&&r.cars[0].charge<70);r.paused=true;const time=r.time;step(r,dt);assert.equal(r.time,time);pass('Solo countdown, finite boost, pause');
for(const speed of[5,25,48,85])for(const lane of[-8,-2,0,2,8]){const r=fresh(),c=r.cars[0];c.s=GRAVITY.entry-110;c.speed=speed;c.lane=lane;let previous=position(c),maxStep=0;
 for(let i=0;i<1400&&!c.gravityRuns;i++){step(r,dt);const p=position(c);assert([p.x,p.y,p.z].every(Number.isFinite));maxStep=Math.max(maxStep,Math.hypot(p.x-previous.x,p.y-previous.y,p.z-previous.z));previous=p;}
 assert.equal(c.gravityRuns,1);assert(maxStep<3);
}pass('20 low-speed/off-centre approaches reach separate receiving road without teleport');
const rt=rampDuration(48),end=rt+TRANSFER.flightTime;
for(const lane of[-2,0,2]){const p=transferPose(end,48,lane),gate=sample(GRAVITY.entry),road=sample(GRAVITY.exit,lane);assert(Math.hypot(p.x+gate.p.x-road.p.x,p.z+gate.p.z-road.p.z)<.01);assert(quat(p).angleTo(quat({pitch:0,yaw:road.yaw,roll:0}))<1e-5);}
const landing=sample(GRAVITY.exit).p;let clearance=Infinity;for(let s=0;s<=GRAVITY.entry;s+=1)clearance=Math.min(clearance,landing.distanceTo(sample(s).p));assert(clearance>45);pass('Touchdown position, attitude and lane match a physically separate road (>45m centreline gap)');
function launch(mode){const r=fresh(),c=r.cars[0];c.s=GRAVITY.entry-5;c.speed=48;let maxAngle=0,maxRate=0,last=position(c),jump=0,firstMotion=null,rewind=0,priorAngle=0;
 for(let n=0;n<1000&&!c.gravityRuns;n++){const age=c.stunt?c.stunt.elapsed-rampDuration(c.stunt.entrySpeed):-99;
  const atLip=c.stunt&&age>-.35;
  const driver=['sustain','left'].includes(mode)?atLip:mode==='grace'?age>.035:mode==='release'?atLip&&age<.8:mode==='late'?age>.3:false;
  const steer=driver?(mode==='left'?-1:1):0,drift=mode==='shift'||driver;step(r,dt,{steer,drift});const p=position(c);
  const angle=Math.abs(p.spinAngle||0);if(firstMotion===null&&angle>.001)firstMotion=c.stunt?c.stunt.elapsed-rampDuration(c.stunt.entrySpeed):age;if(c.stunt)rewind=Math.max(rewind,priorAngle-angle);priorAngle=angle;maxAngle=Math.max(maxAngle,angle);maxRate=Math.max(maxRate,Math.abs(c.stunt?.spinVelocity||0));jump=Math.max(jump,quat(last).angleTo(quat(p)));last=p;
 }
 assert.equal(c.gravityRuns,1);assert(jump<.22,`Continuous orientation ${mode}: ${jump}`);return{r,c,maxAngle,maxRate,firstMotion,rewind};
}
const straight=launch('straight'),shift=launch('shift'),held=launch('sustain'),released=launch('release'),late=launch('late');
assert.equal(shift.maxAngle,0);assert.equal(late.maxAngle,0);assert.equal(straight.maxAngle,0);assert(held.maxAngle>6.28&&held.c.spins>=1);assert(released.maxAngle<held.maxAngle*.65);assert(held.maxRate<=2.6);pass('Shift alone/late input never spins; lip steering drives bounded rotation; release reduces it');
const leftSpin=launch('left'),grace=launch('grace');
assert(held.firstMotion<.035&&leftSpin.firstMotion<.035,'No post-takeoff dead zone');
assert(grace.c.spins===1&&grace.firstMotion<.15,'A deliberate gesture just after the lip is accepted');
assert.equal(leftSpin.c.spins,1);assert(held.rewind<.002&&leftSpin.rewind<.002,'Completed spin never rewinds into alignment');
assert(held.maxAngle<=2*Math.PI+.002&&held.c.spins===1,'One sustained gesture produces one controlled turn');
assert(Math.abs(held.c.airtime-4.1)<.04,'Gravity flight is half a second shorter');
pass('Immediate left/right rotation, forgiving lip gesture, one smooth turn without rewind, 4.1-second flight');
for(const sign of[-1,1]){const r=structuredClone(straight.r),c=r.cars[0],start=position(c),initial=c.s;for(let i=0;i<40;i++)step(r,dt,{steer:sign,boost:true});const p=position(c),n=sample(initial).n;assert((p.x-start.x)*n.x*sign+(p.z-start.z)*n.z*sign>1);assert(c.s>initial+5);assert(Math.sign(c.heading)===sign);}
pass('Both steering directions, acceleration and boost respond immediately after touchdown');
for(const drift of[false,true]){const r=fresh(),c=r.cars[0];c.s=JUMPS[0].s-15;c.speed=60;for(let i=0;i<210;i++)step(r,dt,{drift});assert.equal(c.landings,1);assert.equal(c.spins,0);}pass('Small jump does not auto-spin from Shift alone');
const full=fresh();let maxLane=0;
for(let frame=0;frame<6500&&full.phase!=='results';frame++){const c=full.cars[0],a=sample(c.s),b=sample(Math.min(c.s+4,c.s<GRAVITY.entry?GRAVITY.entry:LENGTH)),curv=Math.atan2(a.t.z*b.t.x-a.t.x*b.t.z,a.t.dot(b.t))/4,drift=Math.abs(curv)>.009;
 const steer=c.stunt?0:Math.max(-1,Math.min(1,((Math.atan(-c.lane*.14)-c.heading)*3-curv*c.speed+c.heading*.42)/(drift?1.35:.94)));step(full,dt,{steer,drift,boost:!drift&&c.charge>5});maxLane=Math.max(maxLane,Math.abs(c.lane));}
assert.equal(full.phase,'results');assert.equal(full.cars[0].gravityRuns,1);assert.equal(full.cars[0].landings,2);startRace(full);assert.equal(full.cars[0].spins,0);pass('Complete solo course, separate exit run-out and restart');
console.log(JSON.stringify({passed:true,checks,landingClearance:clearance,maxLane,heldAngle:held.maxAngle,releasedAngle:released.maxAngle,firstMotionSeconds:held.firstMotion,graceMotionSeconds:grace.firstMotion,largestRewindRadians:held.rewind,gravityAirtime:held.c.airtime},null,2));
