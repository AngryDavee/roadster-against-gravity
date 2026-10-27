// Tall reference curl, gently swept left so its departure tangent reaches a separate road.
import * as THREE from './vendor/three.module.js';
export const TRANSFER={radius:20.4,angle:2.3,bend:-14,width:7.2,flightTime:4.1,distance:70};
const clamp=v=>Math.max(0,Math.min(1,v));
export function rampPoint(u){u=clamp(u);const a=u*TRANSFER.angle,y=TRANSFER.radius*(1-Math.cos(a));return new THREE.Vector3(TRANSFER.bend*u*u*u,y,TRANSFER.radius*Math.sin(a)-.55*y);}
export function rampFrame(u){
 const p=rampPoint(u),t=rampPoint(Math.min(1,u+.00001)).sub(rampPoint(Math.max(0,u-.00001))).normalize();
 const rightX=new THREE.Vector3(1,0,0).addScaledVector(t,-t.x).normalize(),up=new THREE.Vector3().crossVectors(t,rightX).normalize();
 const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(rightX,up,t));
 return {p,t,right:rightX.negate(),up,quaternion,yaw:Math.atan2(t.x,t.z),pitch:-Math.atan2(t.y,Math.hypot(t.x,t.z))};
}
const lengths=[0];let length=0,previous=rampPoint(0);
for(let i=1;i<=1200;i++){const p=rampPoint(i/1200);length+=p.distanceTo(previous);lengths.push(length);previous=p;}
export const RAMP_LENGTH=length;
function arcParameter(s){let lo=0,hi=1200;while(hi-lo>1){const mid=(lo+hi)>>1;if(lengths[mid]<s)lo=mid;else hi=mid;}return (lo+(s-lengths[lo])/(lengths[hi]-lengths[lo]))/1200;}
const lip=rampFrame(1);
export const FLIGHT_DIRECTION=new THREE.Vector3(lip.t.x,0,lip.t.z).normalize();
export const LANDING_POINT=lip.p.clone().setY(0).addScaledVector(FLIGHT_DIRECTION,TRANSFER.distance);
export const LANDING_YAW=Math.atan2(FLIGHT_DIRECTION.x,FLIGHT_DIRECTION.z);
const landingRotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),LANDING_YAW);
export const FLIGHT_SPEED=14,LAUNCH_SPEED=24;
export const LIP_SPEED=LAUNCH_SPEED/Math.hypot(lip.t.x,lip.t.z);
export function rampDuration(speed=48){return 2*RAMP_LENGTH/(speed+LIP_SPEED);}
export function transferPose(elapsed,entrySpeed=48,lane=0){
 const rampTime=rampDuration(entrySpeed),duration=rampTime+TRANSFER.flightTime;
 if(elapsed<=rampTime){
  const t=Math.max(0,elapsed),speed=entrySpeed+(LIP_SPEED-entrySpeed)*t/rampTime,s=entrySpeed*t+.5*(LIP_SPEED-entrySpeed)/rampTime*t*t;
  const f=rampFrame(arcParameter(Math.max(0,Math.min(RAMP_LENGTH,s))));f.p.addScaledVector(f.right,lane);
  return {x:f.p.x,y:f.p.y+.035,z:f.p.z,yaw:f.yaw,pitch:f.pitch,roll:0,quaternion:f.quaternion.toArray(),air:false,speed,stage:'ramp',rampTime,duration};
 }
 const t=Math.min(TRANSFER.flightTime,elapsed-rampTime),u=t/TRANSFER.flightTime,vy=lip.t.y*LIP_SPEED,T=TRANSFER.flightTime,h=lip.p.y;
 const y=(2*u*u*u-3*u*u+1)*h+(u*u*u-2*u*u+u)*vy*T;
 const vertical=((6*u*u-6*u)*h+(3*u*u-4*u+1)*vy*T)/T;
 const distance=(-2*u*u*u+3*u*u)*TRANSFER.distance+(u*u*u-2*u*u+u)*LAUNCH_SPEED*T+(u*u*u-u*u)*FLIGHT_SPEED*T;
 const speed=((-6*u*u+6*u)*TRANSFER.distance+(3*u*u-4*u+1)*LAUNCH_SPEED*T+(3*u*u-2*u)*FLIGHT_SPEED*T)/T;
 const a=clamp(t/1.05),level=a*a*(3-2*a),q=lip.quaternion.clone().slerp(landingRotation,level);
 const offset=new THREE.Vector3(-lane,0,0).applyQuaternion(q),p=lip.p.clone().addScaledVector(FLIGHT_DIRECTION,distance);p.y=Math.max(0,y)+.035;p.add(offset);
 return {x:p.x,y:p.y,z:p.z,yaw:LANDING_YAW,pitch:0,roll:0,quaternion:q.toArray(),air:true,speed,verticalSpeed:vertical,stage:y<8?'landing':'flight',rampTime,duration};
}
