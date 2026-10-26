import * as THREE from './vendor/three.module.js';
import {TRANSFER,rampDuration} from './transfer.js';
const points=[
 [0,0,-180],[0,0,0],[0,0,200],[0,0,400],[0,0,450],[0,0,520],
 [50,0,570],[100,0,520],[100,0,400],[100,0,330],[100,0,260],[100,0,240],
 [230,8,110],[370,13,80],[430,5,-60],[390,0,-240],
 [260,0,-380],[80,0,-400],[-110,0,-340],[-150,0,-200],[-70,0,-220],[-20,0,-300],[0,0,-330],
].map(p=>new THREE.Vector3(...p));
export const curve=new THREE.CatmullRomCurve3(points,true,'catmullrom',.42);
curve.arcLengthDivisions=3000;curve.updateArcLengths();
export const LENGTH=curve.getLength(),WIDTH=22,LAPS=2;
export const wrap=s=>((s%LENGTH)+LENGTH)%LENGTH;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function sample(s,lane=0){
 const u=wrap(s)/LENGTH,p=curve.getPointAt(u),t=curve.getTangentAt(u).normalize();
 const n=new THREE.Vector3(-t.z,0,t.x).normalize();p.addScaledVector(n,lane);
 return {p,t,n,yaw:Math.atan2(t.x,t.z)};
}
export function nearest(x,z,min=0,max=1){let best=Infinity,at=0;for(let i=Math.floor(min*2400);i<=Math.floor(max*2400);i++){const s=i/2400*LENGTH,p=sample(s).p,d=(p.x-x)**2+(p.z-z)**2;if(d<best){best=d;at=s;}}let lo=at-LENGTH/2400,hi=at+LENGTH/2400;for(let i=0;i<35;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3,pa=sample(a).p,pb=sample(b).p;if((pa.x-x)**2+(pa.z-z)**2<(pb.x-x)**2+(pb.z-z)**2)hi=b;else lo=a;}return (lo+hi)/2;}
export const GRAVITY={entry:nearest(0,400,0,.5),exit:nearest(100,400+TRANSFER.landingZ,.2,.65),duration:rampDuration()+TRANSFER.flightTime};
export const JUMPS=[{s:nearest(0,120,0,.3),lane:-5},{s:nearest(390,-200,.45,.85),lane:5}];
export const PICKUPS=Array.from({length:9},(_,i)=>({s:(i+.6)*LENGTH/9,lanes:[-6,0,6]}));
export function sector(s){const u=wrap(s)/LENGTH;return u<.19?'01 / COASTAL RUN':u<.43?'02 / GRAVITY YARD':u<.62?'03 / SKY BRIDGE':u<.82?'04 / HANGAR PASS':'05 / MERIDIAN SWEEP';}
