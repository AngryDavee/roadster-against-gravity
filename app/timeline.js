// Source time, not elapsed simulation steps, owns every pose and editorial cut.
export const FPS=24000/1001, FRAME_COUNT=1094, DURATION=FRAME_COUNT/FPS;
export const SHOTS=[
 {id:'01',name:'At the threshold',start:0,end:51/FPS},
 {id:'02',name:'Against gravity',start:51/FPS,end:419/FPS},
 {id:'03',name:'Suspended',start:419/FPS,end:656/FPS},
 {id:'04',name:'Another perspective',start:656/FPS,end:743/FPS},
 {id:'05',name:'The complete arc',start:743/FPS,end:DURATION},
];
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function interpolate(points,t){
 if(t<=points[0][0])return points[0][1];
 for(let i=1;i<points.length;i++)if(t<=points[i][0])return mix(points[i-1][1],points[i][1],clamp((t-points[i-1][0])/(points[i][0]-points[i-1][0])));
 return points.at(-1)[1];
}
export function shotAt(t){return SHOTS.findIndex(s=>t>=s.start&&t<s.end)===-1?4:SHOTS.findIndex(s=>t>=s.start&&t<s.end);}
export function actionTime(t){
 const s=shotAt(t);
 if(s<2)return t;
 if(s===2)return interpolate([[419/FPS,9.63],[18.75,10.04],[20.02,10.60],[21.52,10.92],[22.52,11.50],[24.6,12.60],[25.5,13.0],[656/FPS,14.60]],t);
 if(s===3)return interpolate([[656/FPS,9.82],[28.0,10.2],[28.78,10.7],[29.5,11.05],[743/FPS,12.0]],t);
 return interpolate([[743/FPS,3.4],[32.5,4.6],[34.75,6.8],[37.8,9.65],[38.4,10.25],[39.28,11.05],[40.8,12.65],[42.5,14.3],[DURATION,17.40]],t);
}
export const RAMP={radius:20.4,angle:2.3,width:7.2};
export function carPose(a){
 const theta=interpolate([[0,0],[3.45,0],[4.3,.10],[5.25,.37],[6.25,.82],[7.25,1.23],[8.25,1.68],[9.15,2.10],[9.60,2.3]],a);
 if(a<=9.6)return {x:0,y:RAMP.radius*(1-Math.cos(theta))+.035,z:RAMP.radius*Math.sin(theta)-.55*RAMP.radius*(1-Math.cos(theta)),pitch:-Math.atan2(Math.sin(theta),Math.cos(theta)-.55*Math.sin(theta)),turn:0,flight:0,theta};
 const y=interpolate([[9.6,34.0],[9.86,34.8],[10.14,32.5],[10.48,27.4],[10.76,22.0],[11.12,13.1],[11.50,5.7],[11.85,3.25],[12.40,2.20],[12.85,.035],[17.5,.035]],a);
 const z=interpolate([[9.6,15.21],[9.9,12.1],[10.2,8.2],[10.5,3.3],[10.8,-1.0],[11.1,-5.3],[11.5,-10.2],[12.0,-13.5],[12.85,-16.2],[13.6,-21.0],[15.0,-37.0],[17.5,-68.0]],a);
 const x=a>13?Math.sin((a-13)*.24)*(a-13)*.7:0;
 return {x,y,z:z-18.69,pitch:0,turn:Math.PI-(a>13?smooth((a-13)/4)*.15:0),flight:smooth((a-9.60)/1.14),theta:2.3};
}
export function cameraPose(t,pose){
 const s=shotAt(t),a=actionTime(t);
 if(s===0)return {position:[-3.4,1.55,-13],target:[-.1,.95,0],fov:26,roll:0};
 if(s===1){
  const follow=smooth((a-9.7)/2.0),drive=smooth((a-12.1)/1.8);
  return {position:[mix(mix(-42,-14,follow),-19,drive),mix(3,2.2,drive),mix(mix(-70,pose.z-12,follow),pose.z-18,drive)],target:[0,mix(mix(17,pose.y+4.5,follow),pose.y+2.4,drive),mix(8,pose.z,follow)],fov:mix(mix(36,60,follow),35,drive),roll:0};
 }
 if(s===2){
  const d=smooth((a-10.4)/2.2);
  return {position:[mix(-16,-9,d),mix(8,1.9,d),mix(-50,pose.z-13,d)],target:[0,pose.y+.5,pose.z+1.8],fov:27,roll:0};
 }
 if(s===3){
  const d=smooth((t-SHOTS[s].start)/(SHOTS[s].end-SHOTS[s].start));
  return {position:[mix(8,7,d),pose.y+10,mix(pose.z+8,pose.z+10,d)],target:[pose.x,pose.y+.6,pose.z],fov:51,roll:mix(-.45,-.18,d)};
 }
 return {position:[-65,52,-30],target:[0,8,-20],fov:49,roll:-.055};
}
