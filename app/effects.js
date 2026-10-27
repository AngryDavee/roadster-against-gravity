import * as THREE from 'three';
import {carPose,smooth,clamp} from './timeline.js';

const rand=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453123;return v-Math.floor(v);};
const initial=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.atan2(Math.sin(2.3),Math.cos(2.3)-.55*Math.sin(2.3)));
const final=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);
export function vehicleQuaternion(a,target=new THREE.Quaternion()){
 const p=carPose(a);
 if(a<=9.6)return target.setFromAxisAngle(new THREE.Vector3(1,0,0),p.pitch);
 target.copy(initial).slerp(final,p.flight);
 if(a>12.85)target.setFromAxisAngle(new THREE.Vector3(0,1,0),p.turn);
 return target;
}

// Deterministic shader billboards: a seek produces the same vapor as playback.
export class Vapor {
 constructor(scene){
  this.count=600;
  const geometry=new THREE.InstancedBufferGeometry();const plane=new THREE.PlaneGeometry(1,1);
  geometry.index=plane.index;geometry.attributes.position=plane.attributes.position;geometry.attributes.uv=plane.attributes.uv;
  this.centers=new Float32Array(this.count*3);this.params=new Float32Array(this.count*4);
  geometry.setAttribute('center',new THREE.InstancedBufferAttribute(this.centers,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('particle',new THREE.InstancedBufferAttribute(this.params,4).setUsage(THREE.DynamicDrawUsage));geometry.instanceCount=this.count;
  this.material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,uniforms:{},vertexShader:`
   attribute vec3 center;attribute vec4 particle;varying vec2 vUv;varying vec4 vParticle;
   void main(){vUv=uv;vParticle=particle;vec4 p=modelViewMatrix*vec4(center,1.);float c=cos(particle.w),s=sin(particle.w);vec2 q=mat2(c,-s,s,c)*position.xy;p.xy+=q*particle.xy;gl_Position=projectionMatrix*p;}`,
   fragmentShader:`
   varying vec2 vUv;varying vec4 vParticle;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
   void main(){vec2 p=(vUv-.5)*2.;float n=noise(vUv*5.+vParticle.w*5.);n+=.5*noise(vUv*11.+vParticle.w);n+=.25*noise(vUv*25.+vParticle.w);float rim=1.-length(p)+.16*(n-.7);float alpha=smoothstep(0.,.65,rim)*vParticle.z*(.2+.7*n);if(alpha<.002)discard;
    float light=.10+.28*vUv.y+.33*n;vec3 col=mix(vec3(.11,.17,.24),vec3(.81,.86,.94),light);gl_FragColor=vec4(col,alpha);}`});
  this.mesh=new THREE.Mesh(geometry,this.material);this.mesh.frustumCulled=false;this.mesh.renderOrder=5;scene.add(this.mesh);
  this.p=new THREE.Vector3();this.q=new THREE.Quaternion();this.dir=new THREE.Vector3();
 }
 update(a){
  for(let i=0;i<this.count;i++){
   let size=0,opacity=0,stretch=1;const r=rand(i+1),s=rand(i+711);const p=this.p;
   if(i<240){
    const jet=i%4,age=((Math.floor(i/4)/60+a*2)%1)*.33,pose=carPose(a);
    if(a>=9.65&&a<12.85){
     this.q.copy(vehicleQuaternion(a));p.set(jet%2?-.7872:.7872,.10,jet<2?-1.5:1.5).applyQuaternion(this.q).add(new THREE.Vector3(pose.x,pose.y,pose.z));
     this.dir.set((r-.5)*.8,-1,(s-.5)*.5).applyQuaternion(this.q);p.addScaledVector(this.dir,age*18);p.y=Math.max(.1,p.y);
     size=.22+age*2.;stretch=1.35;opacity=(1-age/.33)*.012;
    }
   }else if(i<520){
    const birth=10.95+(i-240)/279*2.3,age=a-birth,pose=carPose(birth);
    if(age>=0&&age<7.8){
     const angle=r*Math.PI*2,spread=(.7+age*(1.4+s*2.2));
     p.set(Math.cos(angle)*spread,Math.max(.15,.3+age*(.45+s*.9)),pose.z+Math.sin(angle)*spread*.7);
     size=2.0+age*1.7+s;stretch=.8+s*.25;opacity=smooth(age/.18)*Math.pow(1-age/7.8,1.6)*.11;
    }
   }else{
    const age=(((i-520)/80+a*2.4)%1)*.6,pose=carPose(a);
    if(a>=9.65&&a<10.9){this.q.copy(vehicleQuaternion(a));p.set(i%2?1:-1,.3,-1.1).applyQuaternion(this.q).add(new THREE.Vector3(pose.x,pose.y,pose.z));this.dir.set(i%2?1:-1,-.08,.1).applyQuaternion(this.q);p.addScaledVector(this.dir,age*12);size=.10+age*.9;stretch=1.0;opacity=(1-age/.6)*.014;}
   }
   this.centers.set([p.x,p.y,p.z],i*3);this.params.set([size,size*stretch,opacity,r*6.28],i*4);
  }
  this.mesh.geometry.attributes.center.needsUpdate=true;this.mesh.geometry.attributes.particle.needsUpdate=true;
 }
}

export class ColdGasJets {
 constructor(hero){
  this.group=new THREE.Group();hero.add(this.group);this.jets=[];
  this.mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
   varying vec2 vUv;uniform float time;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
   void main(){float n=noise(vec2(vUv.x*14.,vUv.y*9.+time*12.));float alpha=pow(max(0.,vUv.y),.6)*(.22+.4*n)*smoothstep(0.,.16,vUv.y);vec3 c=mix(vec3(.26,.53,.68),vec3(.8,1.,1.1),vUv.y);gl_FragColor=vec4(c,alpha);}`});
  for(const x of [-.7872,.7872])for(const z of [-1.5,1.5]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.035,.48,1,20,12,true),this.mat);jet.userData={x,z};jet.renderOrder=4;this.group.add(jet);this.jets.push(jet);}
  this.sides=[];for(const s of [-1,1]){const jet=new THREE.Mesh(new THREE.CylinderGeometry(.02,.25,5,16,8,true),this.mat);jet.rotation.z=s*Math.PI/2;jet.position.set(s*3.4,.3,-1.1);jet.renderOrder=4;this.group.add(jet);this.sides.push(jet);}
 }
 update(a){this.group.visible=a>=9.65&&a<12.85;if(!this.group.visible)return;this.mat.uniforms.time.value=a;const p=carPose(a),length=Math.min(5,Math.max(.3,p.y+.12));for(const jet of this.jets){jet.scale.y=length;jet.position.set(jet.userData.x,.1-length/2,jet.userData.z);}for(const side of this.sides)side.visible=a<10.9;}
}
