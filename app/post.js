import * as THREE from 'three';

// Scene effects remain outside the 404 geometry modules.
export class FilmPost {
 constructor(renderer){
  this.renderer=renderer;
  const opt={type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
  this.sceneTarget=new THREE.WebGLRenderTarget(1,1,{...opt,samples:4});
  this.a=new THREE.WebGLRenderTarget(1,1,opt);this.b=new THREE.WebGLRenderTarget(1,1,opt);
  this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  this.blur=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{inputMap:{value:null},stepUV:{value:new THREE.Vector2()},threshold:{value:0}},vertexShader,fragmentShader:`
   varying vec2 vUv;uniform sampler2D inputMap;uniform vec2 stepUV;uniform float threshold;
   vec3 tap(vec2 uv){vec3 c=texture2D(inputMap,uv).rgb;return c*max(0.,1.-threshold/max(max(c.r,c.g),max(c.b,.0001)));}
   void main(){vec3 c=tap(vUv)*.227027;c+=(tap(vUv+stepUV*1.384615)+tap(vUv-stepUV*1.384615))*.316216;c+=(tap(vUv+stepUV*3.230769)+tap(vUv-stepUV*3.230769))*.070270;gl_FragColor=vec4(c,1.);}`});
  this.final=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{sceneMap:{value:this.sceneTarget.texture},bloomMap:{value:this.a.texture},resolution:{value:new THREE.Vector2()},frame:{value:0},bloomStrength:{value:.32},exposure:{value:1.12}},vertexShader,fragmentShader:`
   varying vec2 vUv;uniform sampler2D sceneMap,bloomMap;uniform vec2 resolution;uniform float frame,bloomStrength,exposure;
   float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+frame*.017)*43758.5453);}
   vec3 aces(vec3 c){return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);}
   void main(){vec3 base=texture2D(sceneMap,vUv).rgb;vec3 glow=texture2D(bloomMap,vUv).rgb;
    vec3 color=aces((base+glow*bloomStrength)*exposure);color=pow(color,vec3(1./2.2));
    float vignette=1.-.19*pow(length((vUv-.5)*vec2(1.12,1.)),1.4);color*=vignette;
    float grain=hash(floor(vUv*resolution))-.5;color+=grain*.019*(.28+sqrt(max(color.r,max(color.g,color.b))));
    gl_FragColor=vec4(clamp(color,0.,1.),1.);
   }`});
  this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.final);this.scene.add(this.quad);
 }
 resize(w,h){this.sceneTarget.setSize(w,h);this.a.setSize(Math.max(1,w>>1),Math.max(1,h>>1));this.b.setSize(Math.max(1,w>>1),Math.max(1,h>>1));this.final.uniforms.resolution.value.set(w,h);}
 render(scene,camera,frame=0){
  const r=this.renderer;r.setRenderTarget(this.sceneTarget);r.render(scene,camera);
  this.quad.material=this.blur;this.blur.uniforms.inputMap.value=this.sceneTarget.texture;this.blur.uniforms.threshold.value=1.;this.blur.uniforms.stepUV.value.set(2/this.a.width,0);r.setRenderTarget(this.a);r.render(this.scene,this.camera);
  this.blur.uniforms.inputMap.value=this.a.texture;this.blur.uniforms.threshold.value=0;this.blur.uniforms.stepUV.value.set(0,2/this.a.height);r.setRenderTarget(this.b);r.render(this.scene,this.camera);
  this.blur.uniforms.inputMap.value=this.b.texture;this.blur.uniforms.stepUV.value.set(2/this.a.width,0);r.setRenderTarget(this.a);r.render(this.scene,this.camera);
  this.quad.material=this.final;this.final.uniforms.frame.value=frame;r.setRenderTarget(null);r.render(this.scene,this.camera);
 }
}
