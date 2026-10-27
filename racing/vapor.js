import * as THREE from 'three';
const fract=v=>v-Math.floor(v),random=n=>fract(Math.sin(n*127.1+31.7)*43758.5453);
// White/cyan cold gas, with a bright narrow core and a broken, turbulent edge.
export function coldGasMaterial(color=0xaddfeb){
 return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{color:{value:new THREE.Color(color)},time:{value:0}},vertexShader:'varying vec2 v;uniform float time;void main(){v=uv;float y=clamp(uv.y,0.,1.);vec3 p=position;float flare=1.+.85*pow(1.-y,2.);p.xz*=flare*(1.+.19*sin(uv.y*27.+uv.x*18.+time*23.)*(1.-y));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:`
 varying vec2 v;uniform vec3 color;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 void main(){float y=clamp(v.y,0.,1.),n=noise(vec2(v.x*16.,y*17.+time*28.));float core=pow(y,.45);float alpha=smoothstep(0.,.24,y)*core*(.22+.50*n)*smoothstep(.12,.65,n+.28*y);vec3 c=mix(color*.7,vec3(1.35,1.43,1.46),core*.8);gl_FragColor=vec4(c,alpha);}`});
}
export class RacingVapor{
 constructor(scene){
  this.count=1100;this.cursor=0;this.serial=0;this.clocks=Array.from({length:6},()=>({jet:0,ground:0,landings:0}));this.parts=Array.from({length:this.count},()=>({life:0}));
  const plane=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry();g.index=plane.index;g.attributes.position=plane.attributes.position;g.attributes.uv=plane.attributes.uv;g.instanceCount=this.count;
  this.centers=new Float32Array(this.count*3);this.params=new Float32Array(this.count*4);g.setAttribute('center',new THREE.InstancedBufferAttribute(this.centers,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('particle',new THREE.InstancedBufferAttribute(this.params,4).setUsage(THREE.DynamicDrawUsage));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:`attribute vec3 center;attribute vec4 particle;varying vec2 v;varying vec4 q;void main(){v=uv;q=particle;vec4 p=modelViewMatrix*vec4(center,1.);float c=cos(q.w),s=sin(q.w);p.xy+=mat2(c,-s,s,c)*position.xy*q.xy;gl_Position=projectionMatrix*p;}`,fragmentShader:`
   varying vec2 v;varying vec4 q;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
   void main(){if(q.z<.001)discard;float n=noise(v*4.+q.w*7.)+.5*noise(v*10.+q.w)+.22*noise(v*23.);float rim=1.-length((v-.5)*2.)+.24*(n-.8);float a=smoothstep(0.,.7,rim)*q.z*(.45+.55*n);if(a<.002)discard;float light=clamp(.30+.32*v.y+.35*n,0.,1.);vec3 color=mix(vec3(.20,.39,.49),vec3(1.08,1.12,1.16),light);gl_FragColor=vec4(color,a);}`});
  this.mesh=new THREE.Mesh(g,m);this.mesh.frustumCulled=false;this.mesh.renderOrder=5;scene.add(this.mesh);this.vector=new THREE.Vector3();
 }
 spawn(origin,ground,velocity={x:0,z:0},power=1){
  const id=++this.serial,r=random(id),s=random(id+713),angle=r*Math.PI*2,p=this.parts[this.cursor++%this.count];
  Object.assign(p,{x:origin.x,y:origin.y,z:origin.z,age:0,life:ground?4.5+s*1.8:.45+s*.3,ground,seed:r*6.28,
   vx:ground?Math.cos(angle)*(2.8+s*3.8)+velocity.x*.3:velocity.x*.15+(r-.5)*1.1,vz:ground?Math.sin(angle)*(2.8+s*3.8)+velocity.z*.3:velocity.z*.15+(s-.5)*1.1,vy:ground?.55+s*1.05:-9-s*6,size:ground?2.5+s*1.8:.13+s*.18,power});
 }
 update(dt,cars,poses,actors){
  for(let i=0;i<cars.length;i++){
   const c=cars[i],p=poses[i],clock=this.clocks[i],active=p.air&&!!c.stunt&&c.finish===null;
   if(active&&dt>0){
    actors[i].group.updateMatrixWorld(true);clock.jet+=dt*(i?45:150);
    while(clock.jet>=1){clock.jet--;const n=this.serial%4;this.vector.set(n%2?-.7872:.7872,.08,n<2?-1.5:1.5).applyMatrix4(actors[i].group.matrixWorld);this.spawn(this.vector,false,{x:Math.sin(p.yaw)*c.speed,z:Math.cos(p.yaw)*c.speed},i?.45:1);}
    if(p.y<10){clock.ground+=dt*(i?16:90)*(1-p.y/14);while(clock.ground>=1){clock.ground--;const a=random(this.serial+1)*Math.PI*2;this.spawn({x:p.x+Math.cos(a)*1.5,y:.35,z:p.z+Math.sin(a)*1.5},true,{x:Math.sin(p.yaw)*c.speed,z:Math.cos(p.yaw)*c.speed},i?.5:1);}}
   }
   if(c.landings>clock.landings&&dt>0&&c.gravityRuns>0){for(let k=0;k<(i?7:30);k++)this.spawn({x:p.x,y:.35,z:p.z},true,undefined,i?.45:1);}
   clock.landings=c.landings;
  }
  for(let i=0;i<this.count;i++){
   const p=this.parts[i];let alpha=0,size=0,stretch=1;
   if(p.life>0){p.age+=dt;if(p.age<p.life){const u=p.age/p.life;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;if(p.ground){p.vx*=Math.exp(-dt*.32);p.vz*=Math.exp(-dt*.32);size=p.size+p.age*1.9;stretch=.95;alpha=Math.min(1,p.age/.12)*Math.pow(1-u,1.5)*.12*p.power;p.y=Math.max(size*.30,p.y);const hero=poses[0],distance=Math.hypot(p.x-hero.x,p.z-hero.z);if(hero.y<1.3&&distance<7)alpha*=.06+.94*(distance/7)**2;}else{size=p.size+p.age*1.9;stretch=1.6;alpha=Math.pow(1-u,1.4)*.12*p.power;p.y=Math.max(.15,p.y);}}else p.life=0;}
   this.centers.set([p.x||0,p.y||-100,p.z||0],i*3);this.params.set([size,size*stretch,alpha,p.seed||0],i*4);
  }
  this.mesh.geometry.attributes.center.needsUpdate=true;this.mesh.geometry.attributes.particle.needsUpdate=true;
 }
 reset(){for(const p of this.parts)p.life=0;for(const c of this.clocks)Object.assign(c,{jet:0,ground:0,landings:0});}
}
