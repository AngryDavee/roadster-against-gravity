import * as THREE from './vendor/three.module.js';
import {LENGTH,LAPS,WIDTH,GRAVITY,JUMPS,PICKUPS,clamp,smooth,sample,roadWidth} from './track.js';
import {transferPose,rampDuration,TRANSFER,FLIGHT_SPEED} from './transfer.js';
export const NAMES=['YOU'],COLORS=[0xd8dce5];
const mix=(a,b,t)=>a+(b-a)*t,axis=new THREE.Vector3(0,1,0);
const ease=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10);};
export function createRace(){return{phase:'dock',countdown:3.6,time:0,tick:0,paused:false,events:[],pickups:new Map(),finishOrder:[],cars:[{id:0,name:'YOU',s:0,lane:0,speed:0,charge:100,boosting:false,drifting:false,lat:0,heading:0,steering:0,driftYaw:0,driftBuffer:0,driftIntent:0,spinDirection:1,spins:0,score:0,stunt:null,jump:null,cooldown:0,finish:null,airtime:0,landings:0,driftTime:0,gravityRuns:0,pickupCount:0,collisions:0,boostTime:0,landingPulse:0}]};}
export function startRace(r){Object.assign(r,createRace());r.phase='countdown';}
function event(r,text,tone='cyan'){r.events.push({text,tone,until:r.time+2.5});if(r.events.length>10)r.events.shift();}
export function position(c){
 if(c.stunt){const q=c.stunt,pose=transferPose(q.elapsed,q.entrySpeed,q.trim),gate=sample(GRAVITY.entry),airAge=q.elapsed-rampDuration(q.entrySpeed);
  const spinAngle=q.spinAngle||0;
  const quaternion=new THREE.Quaternion().setFromAxisAngle(axis,gate.yaw+spinAngle+(q.entryYaw||0)*(1-ease(q.elapsed/.35))).multiply(new THREE.Quaternion().fromArray(pose.quaternion)).toArray();
  const cos=Math.cos(gate.yaw),sin=Math.sin(gate.yaw);
  return{...pose,quaternion,x:gate.p.x+pose.x*cos+pose.z*sin,y:gate.p.y+pose.y,z:gate.p.z-pose.x*sin+pose.z*cos,yaw:gate.yaw+pose.yaw,spinAngle,action:pose.air?11:7};
 }
 const road=sample(c.s,c.lane),u=c.jump?clamp(c.jump.elapsed/c.jump.duration,0,1):0;
 let lift=0,pitch=0;
 for(const j of JUMPS){const d=j.s-c.s;if(d>=0&&d<j.length&&Math.abs(c.lane-j.lane)<j.width/2-1&&!c.jump){lift=(1-d/j.length)*j.height;pitch=-Math.atan(j.height/j.length);}}
 const spin=c.jump?(c.jump.spinAngle||0):0;
 return{x:road.p.x,y:road.p.y+(c.jump?4*c.jump.peak*u*(1-u)+c.jump.height*(1-u):lift),z:road.p.z,yaw:road.yaw-c.heading+c.driftYaw*(c.jump?1-ease(u*3):1)+spin,pitch:c.jump?-.16*Math.cos(Math.PI*u):pitch,roll:c.jump?0:-c.steering*.025,air:!!c.jump,spinAngle:spin,action:c.jump?11:0};
}
// A lip gesture seeds angular momentum. Continued steering + drift supplies
// torque; releasing it damps rotation. Only the final alignment is assisted.
function rotateAir(q,dt,input,age,duration,settle=.7,start=0){
 q.spinAngle??=0;q.spinVelocity??=0;q.spins??=0;
 if(!q.spinEnabled||age<start)return;
 const driven=input.drift&&Math.abs(input.steer||0)>.25;
 // Ease out of a nearly complete turn while still travelling forward. Waiting
 // until touchdown used to overshoot 360 degrees and rewind the car into line.
 const completing=driven&&Math.abs(q.spinAngle)>=2*Math.PI-1.8;
 if(q.settleStarted!==undefined||age>=duration-settle||completing){
  if(q.settleStarted===undefined){
   q.settleStarted=age;q.settleAngle=q.spinAngle;q.settleVelocity=q.spinVelocity;
   q.settleTarget=Math.round(q.spinAngle/(2*Math.PI))*2*Math.PI;
   q.settleDuration=Math.min(duration-age,Math.max(.7,2*Math.abs(q.settleTarget-q.spinAngle)/Math.max(.5,Math.abs(q.spinVelocity))));
  }
  const span=Math.max(.001,q.settleDuration),u=clamp((age-q.settleStarted)/span,0,1);
  // Match incoming angular velocity and reach zero velocity/acceleration at alignment.
  const tangent=u-6*u**3+8*u**4-3*u**5;
  q.spinAngle=mix(q.settleAngle,q.settleTarget,ease(u))+q.settleVelocity*span*tangent;
  q.spinVelocity=(q.settleTarget-q.settleAngle)*30*u*u*(u-1)**2/span+q.settleVelocity*(1-18*u*u+32*u**3-15*u**4);
  if(u===1)q.spins=Math.max(q.spins,Math.floor(Math.abs(q.spinAngle)/(2*Math.PI)+1e-6));return;
 }
 const torque=driven?-(input.steer||0)*4.5:-Math.atan2(Math.sin(q.spinAngle),Math.cos(q.spinAngle))*2;
 q.spinVelocity=clamp(q.spinVelocity+torque*dt,-2.6,2.6)*Math.exp(-dt*(driven?.12:2.2));
 q.spinAngle+=q.spinVelocity*dt;q.spins=Math.max(q.spins,Math.floor(Math.abs(q.spinAngle)/(2*Math.PI)));
}
function land(r,c,spins,gravity=false){c.landings++;c.spins+=spins;c.score+=Math.round(c.airtime*10)+(spins*1000)+(gravity?2500:250);c.charge=Math.min(100,c.charge+15+spins*25+(gravity?25:0));c.landingPulse=1;event(r,spins?`FLAT SPIN ×${spins} / +${spins*25} BOOST`:gravity?'COLD-GAS TOUCHDOWN / CLEAN LANDING':'AIRTIME / CLEAN LANDING','amber');}
export function step(r,dt,input={}){
 if(r.paused||r.phase==='dock'||r.phase==='results')return;dt=clamp(dt,0,1/30);r.tick++;
 if(r.phase==='countdown'){r.countdown-=dt;if(r.countdown<=0){r.phase='race';event(r,'GO / FULL THRUST');}return;}
 r.time+=dt;const c=r.cars[0],steer=clamp(input.steer||0,-1,1),drift=!!input.drift;
 c.cooldown=Math.max(0,c.cooldown-dt);c.landingPulse=Math.max(0,c.landingPulse-dt*2);c.driftBuffer=drift?.4:Math.max(0,c.driftBuffer-dt);
 if(Math.abs(steer)>.15)c.spinDirection=-Math.sign(steer);
 c.driftIntent=drift&&Math.abs(steer)>.3?Math.min(.5,c.driftIntent+dt):0;
 c.steering+=(steer-c.steering)*(1-Math.exp(-dt*14));
 c.drifting=drift&&!c.jump&&!c.stunt&&c.speed>12;c.boosting=!!input.boost&&c.charge>1&&!c.drifting;
 if(c.boosting){c.charge=Math.max(0,c.charge-dt*18);c.boostTime+=dt;}
 if(c.drifting){c.driftTime+=dt;c.charge=Math.min(100,c.charge+dt*(Math.abs(steer)>.1?12:3));}
 c.driftYaw+=((c.drifting?-c.steering*.48:0)-c.driftYaw)*(1-Math.exp(-dt*7));
 if(c.stunt){
  const q=c.stunt,rt=rampDuration(q.entrySpeed);q.rate??=1;q.rate+=((c.boosting?1.1:1)-q.rate)*Math.min(1,dt*3);q.elapsed+=dt*q.rate;
  const air=q.elapsed>rt;
  if(air&&q.spinEnabled===undefined){
   // Allow a deliberate gesture just after the lip; never accept late mid-flight spins.
   if(drift&&c.driftIntent>=.05){q.spinEnabled=true;q.spinVelocity=-steer*1.1;event(r,'DRIVER ROTATION / RELEASE TO STABILIZE','amber');}
   else if(q.elapsed-rt>.15)q.spinEnabled=false;
  }
  rotateAir(q,dt,input,q.elapsed-rt,TRANSFER.flightTime);
  if(!q.spinEnabled)q.trim+=steer*dt*1.1;q.trim=clamp(q.trim,-2.35,2.35);
  c.s=mix(q.from,q.to,smooth(q.elapsed/q.duration));c.speed=transferPose(q.elapsed,q.entrySpeed,q.trim).speed*q.rate;if(air)c.airtime+=dt;
  if(q.elapsed>=q.duration){c.s=q.to;c.lane=q.trim;c.heading=0;c.lat=0;c.driftYaw=0;c.speed=FLIGHT_SPEED*q.rate;c.gravityRuns++;land(r,c,q.spins,true);c.stunt=null;}
  return;
 }
 const prev=c.s,road=sample(c.s),ahead=sample(Math.min(c.s+4,GRAVITY.entry>c.s?GRAVITY.entry:LENGTH));
 const curveAngle=Math.atan2(road.t.z*ahead.t.x-road.t.x*ahead.t.z,road.t.dot(ahead.t)),curv=curveAngle/4;
 const offroad=Math.max(0,Math.abs(c.lane)-roadWidth(c.s)/2);
 const target=62+(c.boosting?25:0)-(c.drifting?10:0)-Math.min(28,offroad*4);
 c.speed+=clamp(target-c.speed,-25*dt,(c.boosting?31:22)*dt);
 if(c.jump){c.jump.elapsed+=dt;c.airtime+=dt;rotateAir(c.jump,dt,input,c.jump.elapsed,c.jump.duration,.65,0);if(!c.jump.spinEnabled)c.heading+=steer*dt*.18;c.lane+=Math.sin(c.heading)*c.speed*dt*.35;c.s+=c.speed*dt;
  if(c.jump.elapsed>=c.jump.duration){land(r,c,c.jump.spins);c.jump=null;c.driftYaw=0;}
 }else{
  // Heading responds to steering; changing road direction does not rotate the
  // vehicle for free. Drift increases yaw authority and shows body slip.
  const turnRate=c.drifting?1.35:.94;
  c.heading=clamp(c.heading+(c.steering*turnRate+curv*c.speed*Math.cos(c.heading)-c.heading*.42)*dt,-.8,.8);
  // Soft run-off recovery on the wide shoulder. No invisible wall/impact bounce.
  if(offroad>1)c.heading-=Math.sign(c.lane)*Math.min(.8,offroad*.1)*dt;
  if(offroad>5)c.heading+=(-Math.sign(c.lane)*.5-c.heading)*(1-Math.exp(-dt*2));
  c.lat=Math.sin(c.heading)*c.speed;c.lane+=c.lat*dt;c.s+=Math.max(0,c.speed*Math.cos(c.heading))*dt;
  // The marked approach visibly narrows into the 7.2m deck. Its shoulder
  // guides the car smoothly, rather than a one-frame snap at ramp capture.
  if(c.s>GRAVITY.entry-85&&c.s<GRAVITY.entry){const bound=Math.max(2.35,roadWidth(c.s)/2-1.15);if(Math.abs(c.lane)>bound){c.lane+= (Math.sign(c.lane)*bound-c.lane)*(1-Math.exp(-dt*9));c.heading*=Math.exp(-dt*6);}}
  if(prev<GRAVITY.entry&&c.s>=GRAVITY.entry){
   if(Math.abs(c.lane)>2.5){c.s=GRAVITY.entry-.6;c.speed=Math.min(c.speed,14);c.lane*=Math.exp(-dt*4);event(r,'ALIGN WITH THE LIT LAUNCH LANE');return;}
   const entrySpeed=Math.max(1,c.speed);c.stunt={elapsed:0,from:GRAVITY.entry,to:GRAVITY.exit,trim:c.lane,entryYaw:-c.heading+c.driftYaw,entrySpeed,duration:rampDuration(entrySpeed)+TRANSFER.flightTime,spins:0,spinAngle:0,spinVelocity:0};c.s=GRAVITY.entry;c.heading=0;c.lat=0;event(r,'GRAVITY LAUNCH / STEER + DRIFT AT THE LIP','amber');
  }
  for(const j of JUMPS)if(!c.stunt&&prev<j.s&&c.s>=j.s&&Math.abs(c.lane-j.lane)<j.width/2-1){c.jump={elapsed:0,duration:2.8,height:j.height,peak:9,spins:0,spinAngle:0,spinEnabled:drift&&c.driftIntent>=.1,spinVelocity:drift&&c.driftIntent>=.1?-steer*1.1:0};event(r,c.jump.spinEnabled?'DRIVER ROTATION / RELEASE TO STABILIZE':'AIRBORNE / STEER + DRIFT AT THE LIP');}
 }
 if(!c.stunt&&!c.jump)for(let i=0;i<PICKUPS.length;i++)if(prev<PICKUPS[i].s&&c.s>=PICKUPS[i].s)for(let j=0;j<3;j++){if(Math.abs(c.lane-PICKUPS[i].lanes[j])<1.8){r.pickups.set(`${i}:${j}`,Infinity);c.charge=Math.min(100,c.charge+25);c.pickupCount++;event(r,'BOOST CELL / +25');}}
 if(c.s>=LENGTH){c.s=LENGTH;c.finish=r.time;r.finishOrder=[0];r.phase='results';event(r,'EXHIBITION COMPLETE');}
}
export function standings(r){return r.cars;}
