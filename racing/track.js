import * as THREE from './vendor/three.module.js';
import {TRANSFER,RAMP_LENGTH,rampDuration,LANDING_POINT,FLIGHT_DIRECTION} from './transfer.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const make=points=>{const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');c.arcLengthDivisions=3000;c.updateArcLengths();return c;};
// Two actual roads, separated by an airborne transfer. No road or barriers are
// drawn through the stunt volume, and no closed spline folds back on itself.
const approach=make([[-95,0,-500],[-95,0,-300],[-95,0,-100],[-90,0,10],[-65,0,105],[-20,0,185],[0,0,240],[0,0,270],[0,0,330],[0,0,400]]);
const landing=LANDING_POINT.clone().add(new THREE.Vector3(0,0,400));
const lead=d=>landing.clone().addScaledVector(FLIGHT_DIRECTION,d).toArray();
// 130 m of straight run-out; its tangent exactly matches the airborne departure.
const receiving=make([lead(-30),lead(0),lead(40),lead(85),lead(130),[-195,0,180],[-225,0,70],[-225,0,-100]]);
const inLength=approach.getLength(),airDistance=RAMP_LENGTH+70;
export const LENGTH=inLength+airDistance+receiving.getLength()-30,WIDTH=22,LAPS=1;
export const GRAVITY={entry:inLength,exit:inLength+airDistance,duration:rampDuration()+TRANSFER.flightTime};
export const ROAD_SECTIONS=[[0,GRAVITY.entry],[GRAVITY.exit-30,LENGTH]];
// Both roads are spatially separate, including the touchdown zone.
export const DRAW_SECTIONS=ROAD_SECTIONS;
export const wrap=s=>((s%LENGTH)+LENGTH)%LENGTH;
export function roadWidth(s){return s<=GRAVITY.entry?WIDTH-(WIDTH-7.2)*smooth((s-(GRAVITY.entry-55))/43):WIDTH;}
export function sample(s,lane=0){
 s=clamp(s,0,LENGTH);let p,t;
 if(s<=GRAVITY.entry){const u=clamp(s/inLength,0,1);p=approach.getPointAt(u);t=approach.getTangentAt(u);}
 else if(s>=GRAVITY.exit-30){const u=clamp((s-GRAVITY.exit+30)/receiving.getLength(),0,1);p=receiving.getPointAt(u);t=receiving.getTangentAt(u);}
 else {const u=(s-GRAVITY.entry)/airDistance;p=new THREE.Vector3(0,0,400).lerp(landing,u);t=FLIGHT_DIRECTION.clone();}
 const n=new THREE.Vector3(-t.z,0,t.x).normalize();p.addScaledVector(n,lane);return{p,t,n,yaw:Math.atan2(t.x,t.z)};
}
export function nearest(x,z,min=0,max=1){let best=Infinity,at=0;for(let i=Math.floor(min*4000);i<=Math.floor(max*4000);i++){const s=i/4000*LENGTH,p=sample(s).p,d=(p.x-x)**2+(p.z-z)**2;if(d<best){best=d;at=s;}}return at;}
export const JUMPS=[{s:270,lane:0,width:12,height:3,length:18}];
export const PICKUPS=[120,410,590,GRAVITY.entry-100,GRAVITY.exit+85].map(s=>({s,lanes:[-6,0,6]}));
export function sector(s){return s<230?'01 / CANYON RUN':s<450?'02 / FLAT-SPIN LAUNCH':s<GRAVITY.entry-90?'03 / COASTAL SWEEP':s<GRAVITY.exit?'04 / AGAINST GRAVITY':'05 / LANDING STRIP';}

export const SCENERY=[{kind:'hangar',s:60,lane:45,scale:1.3},{kind:'hangar',s:160,lane:-48,scale:1.1},{kind:'hangar',s:490,lane:45,scale:1.1},{kind:'hangar',s:640,lane:-48,scale:1.4},{kind:'hangar',s:GRAVITY.entry-130,lane:-52,scale:1.4},{kind:'hangar',s:GRAVITY.exit+100,lane:-55,scale:1.2},{kind:'hangar',s:LENGTH-50,lane:48,scale:1.5},{kind:'tower',s:130,lane:-66,scale:1},{kind:'tower',s:GRAVITY.entry-85,lane:-55,scale:1},{kind:'tower',s:LENGTH-35,lane:66,scale:1}];
