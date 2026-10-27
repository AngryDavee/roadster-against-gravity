import * as THREE from 'three';
import {ASSET,bakeStatic} from './assetlib.js';
import {FilmPost} from './post.js';
import {Vapor,ColdGasJets,vehicleQuaternion} from './effects.js';
import {FPS,FRAME_COUNT,DURATION,SHOTS,clamp,smooth,shotAt,actionTime,carPose,cameraPose} from './timeline.js';

const $=id=>document.getElementById(id),canvas=$('film');
const state={time:0,playing:false,speed:1,started:false,inspect:false,compare:false,ready:false,frames:0};
const params=new URLSearchParams(location.search),capture=params.has('capture');
const edgeWhite={value:0};
let renderer,scene,camera,post,hero,vapor,jets,wheels=[],headlights=[],orbit={yaw:.7,pitch:.34,radius:9},last=performance.now(),noticeTimer;
function notice(text){$('notice').textContent=text;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,4500);}
function setStarted(){state.started=true;$('intro').hidden=true;$('caption').hidden=false;}
function play(value=true){setStarted();state.playing=value;if(value&&state.time>=DURATION-1/FPS)state.time=0;$('play').textContent=value?'Ⅱ':'▶';$('play').setAttribute('aria-label',value?'Pause':'Play');syncReference(true);}
function format(t){return '00:'+Math.floor(t).toString().padStart(2,'0')+'.'+Math.floor(t%1*1000).toString().padStart(3,'0');}
function seek(t){state.time=clamp(t,0,DURATION-1/FPS);setStarted();syncReference(true);render();return state.time;}
function compactPart(root){
 const parent=root.parent,p=root.position.clone(),q=root.quaternion.clone(),s=root.scale.clone(),name=root.name;
 root.removeFromParent();root.position.set(0,0,0);root.quaternion.identity();root.scale.set(1,1,1);
 const merged=bakeStatic(root);merged.name=name;merged.position.copy(p);merged.quaternion.copy(q);merged.scale.copy(s);parent.add(merged);return merged;
}
function outlines(root){
 const meshes=[];root.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position.count>12&&!o.material.emissive?.getHex())meshes.push(o);});
 for(const o of meshes){const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,32),new THREE.LineBasicMaterial({color:0x090b14,transparent:true,opacity:.14}));o.add(line);}
}
function shadowLight(color,intensity,position,target,extent=45){
 const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);light.target.position.set(...target);scene.add(light,light.target);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:1,far:180});light.shadow.bias=-.0005;light.shadow.normalBias=.035;return light;
}
async function init(){
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(capture?1:Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
 renderer.info.autoReset=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0x020308);
 scene=new THREE.Scene();scene.background=new THREE.Color(0x010205);scene.fog=new THREE.Fog(0x010205,45,155);
 camera=new THREE.PerspectiveCamera(40,1,.08,350);post=new FilmPost(renderer);
 scene.add(new THREE.HemisphereLight(0xc5c2ed,0x15121e,.82));
 shadowLight(0xffeedb,3.4,[16,34,-28],[0,13,6]);
 const rim=new THREE.DirectionalLight(0xa4b8ff,1.6);rim.position.set(-18,28,15);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xc2a6e2,.7);fill.position.set(-12,8,-32);scene.add(fill);
 $('loadDetail').textContent='Loading the five verified asset families';
 const assets=await Promise.all([
  ASSET('assets/roadster-precision.js',{keepHierarchy:true}),ASSET('assets/ramp.js',{keepHierarchy:true,surfaces:{byMaterial:{stone:'stone'}}}),
  ASSET('assets/pavement.js',{surfaces:true}),ASSET('assets/floodlight.js'),ASSET('assets/boundary.js'),ASSET('assets/roadster-precision.js'),ASSET('assets/servicevan.js')
 ]);
 [hero]=assets;
 const coachwork=hero.getObjectByName('coachwork');
 if(!coachwork)throw new Error('The Roadster articulated assembly did not load.');
 compactPart(coachwork);
 for(const name of ['wheel_l_f','wheel_r_f','wheel_l_r','wheel_r_r']){
  const wheel=hero.getObjectByName(name);if(!wheel)throw new Error('Missing Roadster wheel: '+name);wheels.push(compactPart(wheel));
 }
 const wing=hero.getObjectByName('rear_wing');if(wing)compactPart(wing);

 // Procedural studio light cards provide crisp painted-metal reflections; no imported environment mesh or image.
 const reflectionScene=new THREE.Scene();reflectionScene.background=new THREE.Color(0x0c101c);
 for(const [pos,scale,color] of [[[0,8,0],[12,4],0xbcc6ed],[[5,3,-4],[3,8],0xffe4c8],[[-6,3,1],[2,7],0x999acb]]){const card=new THREE.Mesh(new THREE.PlaneGeometry(...scale),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));card.position.set(...pos);card.lookAt(0,0,0);reflectionScene.add(card);}
 const pmrem=new THREE.PMREMGenerator(renderer),reflections=pmrem.fromScene(reflectionScene,.05).texture;pmrem.dispose();
 hero.traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial){o.material=o.material.clone();o.material.envMap=reflections;o.material.envMapIntensity=o.material.name==='copper_glazing'?.22:.65;o.material.polygonOffset=true;o.material.polygonOffsetFactor=1;o.material.polygonOffsetUnits=1;
 if(o.material.color.getHex()>0x303030&&o.material.emissive.getHex()===0){o.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
 float illustrationLuma=dot(gl_FragColor.rgb,vec3(.2126,.7152,.0722));
 float illustratedBand=floor(illustrationLuma*7.+.45)/7.;
 gl_FragColor.rgb*=mix(1.,illustratedBand/max(.04,illustrationLuma),.20);
 float inkDot=1.-smoothstep(.12,.27,length(fract(gl_FragCoord.xy*.36)-.5));
 gl_FragColor.rgb*=1.-inkDot*.12;
 `);};}
 }});
 outlines(hero);scene.add(hero);
 const ramp=assets[1],origin=ramp.userData.sourceOrigin;
 ramp.position.set(...origin);const rampMerged=bakeStatic(ramp);scene.add(rampMerged);
 rampMerged.traverse(o=>{if(o.isMesh&&o.material.emissive?.getHex()===0xff152b){o.material=o.material.clone();o.material.onBeforeCompile=shader=>{shader.uniforms.edgeWhite=edgeWhite;shader.vertexShader='varying float rampY;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','rampY=(modelMatrix*vec4(transformed,1.)).y;\n#include <project_vertex>');shader.fragmentShader='varying float rampY;uniform float edgeWhite;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat cool=(1.-smoothstep(edgeWhite-.4,edgeWhite+.4,rampY))*step(.1,edgeWhite);totalEmissiveRadiance=mix(totalEmissiveRadiance,vec3(1.1,1.6,1.8),cool);');};}});
 // The film's concrete surface is replaced with the generated Atlas material when available.
 const atlasTexture=await new Promise(resolve=>new THREE.TextureLoader().load('textures/atlas-concrete-base.png',resolve,undefined,()=>resolve(null)));
 if(atlasTexture){atlasTexture.colorSpace=THREE.SRGBColorSpace;atlasTexture.wrapS=atlasTexture.wrapT=THREE.RepeatWrapping;atlasTexture.repeat.set(2,10);atlasTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();const rough=await new THREE.TextureLoader().loadAsync('textures/atlas-concrete-roughness.png');const normal=await new THREE.TextureLoader().loadAsync('textures/atlas-concrete-normal.png');for(const tex of [rough,normal]){tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,10);}rampMerged.traverse(o=>{if(o.isMesh&&o.material.name==='stone'){o.material.map=atlasTexture;o.material.roughnessMap=rough;o.material.roughness=1;o.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',THREE.ShaderChunk.roughnessmap_fragment.replace('roughnessFactor *= texelRoughness.g;','roughnessFactor *= mix(0.72, 1.0, texelRoughness.g);'));};o.material.normalMap=normal;o.material.normalScale.set(.24,.24);o.material.color.setHex(0xb9bac6);o.material.needsUpdate=true;}});}
 // Planar UVs along the ramp's arc keep the surface density uniform through the curve.
 rampMerged.traverse(o=>{if(o.isMesh&&o.material.name==='stone'){const p=o.geometry.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i)+.55*p.getY(i),20.4-p.getY(i));uv[i*2]=(p.getX(i)+3.6)/7.2;uv[i*2+1]=a/2.3;}o.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));}});
 const ground=assets[2];ground.position.y=-.182;ground.position.z=-12;ground.scale.set(8,1,8);ground.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.multiplyScalar(.10);}});scene.add(ground);
 const scenery=new THREE.Group();
 for(const [x,z,rotation] of [[26,4,Math.PI], [36,-12,Math.PI],[-28,20,Math.PI]]){const lamp=assets[3].clone(true);lamp.position.set(x,0,z);lamp.rotation.y=rotation;lamp.scale.setScalar(.55);scenery.add(lamp);}
 for(let i=0;i<7;i++){const barrier=assets[4].clone(true);barrier.position.set(13,.01,-35+i*6);barrier.rotation.y=Math.PI/2;scenery.add(barrier);}
 for(let i=0;i<4;i++){const barrier=assets[4].clone(true);barrier.position.set(-9,.01,-10+i*6);barrier.rotation.y=Math.PI/2;scenery.add(barrier);}
 scene.add(bakeStatic(scenery));
 const parked=assets[5];parked.position.set(-24,.02,-5);parked.rotation.y=-.9;scene.add(parked);
 const van=assets[6];van.position.set(23,.02,-30);van.rotation.y=.4;scene.add(van);
 // Ground markings are thin painted strips on the pavement, not additional props.
 const paint=new THREE.MeshStandardMaterial({color:0x858590,roughness:.92,metalness:0});
 for(const [x,z,len,rot] of [[0,-23,46,0],[-5,-19,70,2.0]]){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.095,len),paint);stripe.rotation.x=-Math.PI/2;stripe.rotation.z=rot;stripe.position.set(x,.007,z);stripe.receiveShadow=true;scene.add(stripe);}
 for(const x of [-.67,.67]){const light=new THREE.SpotLight(0xbbe2ff,32,32,.40,.65,1.3);light.position.set(x,.52,2.1);light.target.position.set(x,.05,19);hero.add(light,light.target);headlights.push(light);}
 // Low pools beneath lamp banks illuminate the tarmac without filling the black sky.
 for(const [x,z] of [[26,4],[36,-12],[-28,20],[-24,-5],[15,-15]]){const light=new THREE.PointLight(0xf5dfc4,80,22,2);light.position.set(x,4.5,z);scene.add(light);}
 const redBounce=new THREE.PointLight(0xff1935,2.5,4,1.7);redBounce.position.set(0,.6,-2.4);hero.add(redBounce);
 vapor=new Vapor(scene);jets=new ColdGasJets(hero);resize();state.ready=true;
 $('loading').hidden=true;
 if(params.has('clean'))document.body.classList.add('clean');
 if(params.has('t'))seek(Number(params.get('t'))||0);
 if(capture)setStarted();
 window.__FILM__={state,seek,play,pause:()=>play(false),render,stats:()=>({vehicleAsset:'roadster-precision.js',wheelCount:wheels.length,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,time:state.time,shot:shotAt(state.time),action:actionTime(state.time),pose:carPose(actionTime(state.time)),width:canvas.width,height:canvas.height}),setSize:(w,h)=>{renderer.setPixelRatio(1);renderer.setSize(w,h,false);post.resize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();},frame:n=>seek(n/FPS)};
 render();if(!capture)requestAnimationFrame(tick);
}
function resize(){if(!renderer)return;const availableW=$('stage').clientWidth/(state.compare?2:1),availableH=$('stage').clientHeight,w=Math.min(availableW,availableH*16/9),h=w*9/16;canvas.style.width=w+'px';canvas.style.height=h+'px';$('referencePanel').style.width=w+'px';$('referencePanel').style.height=h+'px';renderer.setSize(w,h,false);const size=renderer.getDrawingBufferSize(new THREE.Vector2());post.resize(size.x,size.y);camera.aspect=w/h;camera.updateProjectionMatrix();if(state.ready)render();}
function render(){
 if(!state.ready)return;
 const t=state.time,a=actionTime(t),p=carPose(a);hero.position.set(p.x,p.y,p.z);hero.quaternion.copy(vehicleQuaternion(a));
 const wheelAngle=a<=9.6?-p.theta*20.4/.435:-(47+(15-p.z))/.435;
 for(const w of wheels)w.rotation.x=wheelAngle;
 vapor.update(a);jets.update(a);edgeWhite.value=smooth((a-4.0)/5.2)*24;
 if(state.inspect){const center=new THREE.Vector3(p.x,p.y+.8,p.z);camera.position.copy(center).add(new THREE.Vector3(Math.sin(orbit.yaw)*Math.cos(orbit.pitch),Math.sin(orbit.pitch),Math.cos(orbit.yaw)*Math.cos(orbit.pitch)).multiplyScalar(orbit.radius));camera.up.set(0,1,0);camera.lookAt(center);camera.fov=43;}
 else{const c=state.started?cameraPose(t,p):{position:[-5,2.1,-8],target:[1.9,1.2,0],fov:39,roll:0};camera.position.set(...c.position);camera.up.set(Math.sin(c.roll),Math.cos(c.roll),0);camera.lookAt(new THREE.Vector3(...c.target));camera.fov=c.fov;}
 camera.updateProjectionMatrix();renderer.info.reset();post.render(scene,camera,Math.floor(t*FPS+.0001));state.frames++;
 const shot=shotAt(t);$('shotNumber').textContent=SHOTS[shot].id;$('shotName').textContent=SHOTS[shot].name;
 $('time').textContent=format(t);$('timeline').value=Math.floor(t*FPS+1e-6);$('timeline').style.background=`linear-gradient(to right,#d9bee9 ${t/DURATION*100}%,#ffffff28 ${t/DURATION*100}%)`;
 [...$('chapters').children].forEach((b,i)=>b.classList.toggle('active',i===shot));
}
function syncReference(force=false){const video=$('reference');if(!state.compare||video.readyState<1)return;video.playbackRate=state.speed;if(force||Math.abs(video.currentTime-state.time)>.08)video.currentTime=state.time;if(state.playing&&!state.inspect)video.play().catch(()=>{});else video.pause();}
function tick(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(state.playing&&!state.inspect){state.time+=dt*state.speed;if(state.time>=DURATION-1/FPS){state.time=DURATION-1/FPS;play(false);}render();syncReference();}requestAnimationFrame(tick);}
SHOTS.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.id+' / '+s.name.toUpperCase();b.style.flex=String(s.end-s.start);b.setAttribute('aria-label','Seek to '+s.name);b.onclick=()=>seek(s.start);$('chapters').append(b);});
$('begin').onclick=()=>play();$('play').onclick=()=>play(!state.playing);$('restart').onclick=()=>{seek(0);play();};$('timeline').oninput=e=>seek(Number(e.target.value)/FPS);
$('speed').onclick=()=>{state.speed=state.speed===1?.5:state.speed===.5?.25:1;$('speed').textContent=state.speed+'×';syncReference(true);};
$('compare').onclick=async()=>{state.compare=!state.compare;document.body.classList.toggle('comparing',state.compare);$('referencePanel').hidden=!state.compare;$('comparisonLabel').hidden=!state.compare;$('compare').setAttribute('aria-pressed',state.compare);setStarted();if(state.compare&&!$('reference').src){$('reference').preload='auto';$('reference').src='./reference/master.mp4';$('reference').load();$('reference').addEventListener('loadedmetadata',()=>syncReference(true),{once:true});$('reference').addEventListener('error',()=>notice('The private source video is missing. Add it at app/reference/master.mp4.'),{once:true});}if(!state.compare)$('reference').pause();resize();syncReference(true);};
$('inspect').onclick=()=>{state.inspect=!state.inspect;setStarted();play(false);document.body.classList.toggle('inspection',state.inspect);$('inspect').setAttribute('aria-pressed',state.inspect);if(state.inspect)notice('Drag to orbit the machine · Scroll or pinch to zoom');render();};
$('minimal').onclick=()=>document.body.classList.toggle('clean');
$('fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>notice('Fullscreen is unavailable in this browser.'));
$('snapshot').onclick=()=>{render();const a=document.createElement('a');a.download=`roadster-${String(Math.floor(state.time*FPS)).padStart(4,'0')}.png`;a.href=canvas.toDataURL('image/png');a.click();};
let drag=null;const pointers=new Map();let pinch=0;
canvas.addEventListener('pointerdown',e=>{if(!state.inspect)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);drag=[e.clientX,e.clientY];if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);}});
canvas.addEventListener('pointermove',e=>{if(!state.inspect||!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],dist=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);orbit.radius=clamp(orbit.radius*pinch/Math.max(1,dist),3.2,35);pinch=dist;}else if(drag){orbit.yaw-=(e.clientX-drag[0])*.007;orbit.pitch=clamp(orbit.pitch+(e.clientY-drag[1])*.005,-.2,1.4);}drag=[e.clientX,e.clientY];render();});
for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,e=>{pointers.delete(e.pointerId);drag=null;});
canvas.addEventListener('wheel',e=>{if(!state.inspect)return;e.preventDefault();orbit.radius=clamp(orbit.radius*Math.exp(e.deltaY*.001),3.2,35);render();},{passive:false});
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden&&state.playing)play(false);});
window.addEventListener('keydown',e=>{if(e.target.matches('input'))return;if(e.code==='Space'){e.preventDefault();play(!state.playing);}if(e.code==='ArrowRight'){e.preventDefault();seek(state.time+(e.shiftKey?1:1/FPS));}if(e.code==='ArrowLeft'){e.preventDefault();seek(state.time-(e.shiftKey?1:1/FPS));}if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key==='Escape'){document.body.classList.remove('clean');if(state.inspect)$('inspect').click();}});
init().catch(e=>{console.error(e);$('loading').hidden=true;$('error').hidden=false;$('errorText').textContent=e.message;});
