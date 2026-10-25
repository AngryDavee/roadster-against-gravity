import assert from 'node:assert/strict';
import {createRace,startRace,step,position,standings} from '../racing/simulation.js';
import {LENGTH,LAPS,GRAVITY,JUMPS,PICKUPS,sample,wrap} from '../racing/track.js';
const fixed=1/60;
const fresh=()=>{const r=createRace();startRace(r);for(let i=0;i<220;i++)step(r,fixed,{});return r;};
const r=fresh();for(let i=0;i<180;i++)step(r,fixed,{boost:true});assert(r.cars[0].s>40);assert(r.cars[0].charge<50);assert(r.cars[0].speed>45);
const paused=r.time;r.paused=true;for(let i=0;i<100;i++)step(r,fixed,{boost:true});assert.equal(r.time,paused);r.paused=false;
const boundary=fresh();for(let i=0;i<500;i++)step(boundary,fixed,{steer:1});assert(boundary.cars[0].collisions>0);assert(Math.abs(boundary.cars[0].lane)<=10);
const jump=fresh();jump.cars[0].s=JUMPS[0].s-1;jump.cars[0].lane=JUMPS[0].lane;jump.cars[0].speed=42;for(let i=0;i<12;i++)step(jump,fixed,{});assert(jump.cars[0].jump);assert(position(jump.cars[0]).y>1);for(let i=0;i<120;i++)step(jump,fixed,{});assert(jump.cars[0].landings>=1);
const ramp=fresh();ramp.cars[0].s=GRAVITY.entry-1;ramp.cars[0].lane=0;ramp.cars[0].speed=44;let height=0;for(let i=0;i<430;i++){step(ramp,fixed,{});height=Math.max(height,position(ramp.cars[0]).y);}assert(height>34);assert.equal(ramp.cars[0].gravityRuns,1);assert(ramp.cars[0].s>GRAVITY.exit);
const bypass=fresh();bypass.cars[0].s=GRAVITY.entry-1;bypass.cars[0].lane=7;bypass.cars[0].speed=44;for(let i=0;i<60;i++)step(bypass,fixed,{});assert.equal(bypass.cars[0].stunt,null);assert.equal(bypass.cars[0].gravityRuns,0);
const championship=fresh();let old=championship.cars.map(c=>c.s);
for(let frame=0;frame<14000;frame++){
 const c=championship.cars[0],road=sample(c.s),next=sample(c.s+12),curv=Math.atan2(road.t.z*next.t.x-road.t.x*next.t.z,road.t.dot(next.t))/12;
 let target=0;const pu=PICKUPS.find(p=>wrap(p.s-c.s)<90);if(pu)target=pu.lanes[Math.floor(championship.time/6)%3];const j=JUMPS.find(j=>wrap(j.s-c.s)<70);if(j)target=j.lane;if(wrap(GRAVITY.entry-c.s)<100||c.stunt)target=0;
 const steer=c.stunt?0:Math.max(-1,Math.min(1,(target-c.lane)*.6-c.lat*.2));
 step(championship,fixed,{steer,boost:c.charge>8&&Math.abs(curv)<.006,drift:Math.abs(curv)>.005});
 for(let i=0;i<6;i++){const car=championship.cars[i];assert(Object.values(position(car)).filter(v=>typeof v==='number').every(Number.isFinite));assert(car.charge>=0&&car.charge<=100);assert(car.s>=old[i]);assert(car.s-old[i]<3,'No progress teleport');old[i]=car.s;}
}
assert.equal(championship.phase,'results');assert(championship.cars.every(c=>c.finish!==null&&c.s===LENGTH*LAPS));assert.equal(standings(championship)[0].id,0,'Skilled play can win against the same simulated rivals');
const finish=championship.cars[0].finish;startRace(championship);assert.equal(championship.phase,'countdown');assert(championship.cars.every(c=>c.finish===null));
console.log(JSON.stringify({passed:true,tests:['boost consumption','pause','barrier collision','jump landing','original gravity curve','road bypass','finite poses and bounded charge','no position teleport','all opponents finish','skilled player can win','restart'],winningTime:finish},null,2));
