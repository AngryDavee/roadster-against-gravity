// Shared numerical description of the directed gravity transfer.
// Geometry generation embeds this curve; the simulation samples it directly.
import * as THREE from './vendor/three.module.js';
export const TRANSFER={radius:20.4,angle:2.3,span:100,width:7.2,flightTime:4.4,landingZ:-70};
const clamp=v=>Math.max(0,Math.min(1,v));
const smoother=t=>t*t*t*(t*(t*6-15)+10);
export function rampPoint(u){u=clamp(u);const a=u*TRANSFER.angle,y=TRANSFER.radius*(1-Math.cos(a));return new THREE.Vector3(TRANSFER.span*smoother(u),y,TRANSFER.radius*Math.sin(a)-.55*y);}
export function rampFrame(u){
 const p=rampPoint(u),t=rampPoint(Math.min(1,u+.00001)).sub(rampPoint(Math.max(0,u-.00001))).normalize();
 const right=new THREE.Vector3(-t.z,0,t.x).normalize(),up=right.clone().cross(t).normalize();
 return {p,t,right,up,yaw:Math.atan2(t.x,t.z),pitch:-Math.atan2(t.y,Math.hypot(t.x,t.z))};
}
const lengths=[0];let length=0,previous=rampPoint(0);
for(let i=1;i<=1200;i++){const p=rampPoint(i/1200);length+=p.distanceTo(previous);lengths.push(length);previous=p;}
export const RAMP_LENGTH=length;
function arcParameter(s){let lo=0,hi=1200;while(hi-lo>1){const mid=(lo+hi)>>1;if(lengths[mid]<s)lo=mid;else hi=mid;}return (lo+(s-lengths[lo])/(lengths[hi]-lengths[lo]))/1200;}
const lip=rampFrame(1);
export const FLIGHT_SPEED=5,LAUNCH_SPEED=18;
export const LIP_SPEED=LAUNCH_SPEED/Math.hypot(lip.t.x,lip.t.z);
export function rampDuration(speed=48){return 2*RAMP_LENGTH/(speed+LIP_SPEED);}
export function transferPose(elapsed,entrySpeed=48,lane=0){
 const rampTime=rampDuration(entrySpeed),duration=rampTime+TRANSFER.flightTime;
 if(elapsed<=rampTime){
  const t=Math.max(0,elapsed),speed=entrySpeed+(LIP_SPEED-entrySpeed)*t/rampTime;
  const s=entrySpeed*t+.5*(LIP_SPEED-entrySpeed)/rampTime*t*t;
  const f=rampFrame(arcParameter(Math.max(0,Math.min(RAMP_LENGTH,s))));
  f.p.addScaledVector(f.right,lane);return {x:f.p.x,y:f.p.y+.035,z:f.p.z,yaw:f.yaw,pitch:f.pitch,roll:0,air:false,speed,stage:'ramp',rampTime,duration};
 }
 const t=Math.min(TRANSFER.flightTime,elapsed-rampTime),u=t/TRANSFER.flightTime;
 const vy=lip.t.y*LIP_SPEED,T=TRANSFER.flightTime,h=lip.p.y;
 // A continuous vertical jet-braking profile. X is fixed by the ramp's lip,
 // never interpolated toward a landing target. Forward thrust brakes into the
 // low hover, matching the source before normal driving accelerates again.
 const y=(2*u*u*u-3*u*u+1)*h+(u*u*u-2*u*u+u)*vy*T;
 const vertical=((6*u*u-6*u)*h+(3*u*u-4*u+1)*vy*T)/T;
 const distance=lip.p.z-TRANSFER.landingZ;
 const forward=(-2*u*u*u+3*u*u)*distance+(u*u*u-2*u*u+u)*LAUNCH_SPEED*T+(u*u*u-u*u)*FLIGHT_SPEED*T;
 const forwardSpeed=((-6*u*u+6*u)*distance+(3*u*u-4*u+1)*LAUNCH_SPEED*T+(3*u*u-2*u)*FLIGHT_SPEED*T)/T;
 const level=clamp(t/.8),ease=level*level*(3-2*level);
 return {x:TRANSFER.span+lane,y:Math.max(0,y)+.035,z:lip.p.z-forward,yaw:Math.PI,pitch:lip.pitch*(1-ease),roll:0,air:true,speed:forwardSpeed,verticalSpeed:vertical,stage:y<8?'landing':'flight',rampTime,duration};
}
