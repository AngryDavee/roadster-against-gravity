import {coastalTerrain} from './terrain.js';
import * as THREE from 'three';
import {ASSET,bakeStatic} from './assetlib.js';
import {LENGTH,WIDTH,GRAVITY,JUMPS,PICKUPS,sample,ROAD_SECTIONS,DRAW_SECTIONS,roadWidth,SCENERY} from './track.js';
export const material=(color,roughness=.75,metalness=.1)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function ribbon(left,right,height,mat,from=0,to=LENGTH,step=2){
 const group=new THREE.Group();for(const [a,b] of (from===0&&to===LENGTH?DRAW_SECTIONS:ROAD_SECTIONS)){const lo=Math.max(a,from),hi=Math.min(b,to);if(hi>lo)group.add(ribbonPart(left,right,height,mat,lo,hi,step));}return group;
}
function ribbonPart(left,right,height,mat,from,to,step){
 const positions=[],uv=[],indices=[];let n=0;
 for(let s=from;s<=to+step;s=Math.min(to+step,s+step)){
  const at=Math.min(to,s);for(const lane of [left,right]){const p=sample(at,lane*roadWidth(at)/WIDTH).p;positions.push(p.x,p.y+height,p.z);uv.push((lane-left)/(right-left),at/12);}
  if(n)indices.push(n*2-2,n*2-1,n*2,n*2-1,n*2+1,n*2);n++;if(at===to)break;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,mat);mesh.receiveShadow=true;return mesh;
}
function place(obj,s,lane=0,y=0){const q=sample(s,lane);obj.position.copy(q.p);obj.position.y+=y;obj.rotation.y=q.yaw;return obj;}
export async function buildWorld(renderer,scene,onLoad){
 onLoad('Sculpting Meridian Launch Coast');
 const sky=new THREE.Mesh(new THREE.SphereGeometry(2800,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;void main(){vec3 d=normalize(p);float h=max(0.,d.y);vec3 c=mix(vec3(.29,.17,.18),vec3(.075,.105,.21),smoothstep(0.,.48,h));float sun=pow(max(0.,dot(d,normalize(vec3(-.7,.12,.4)))),260.);c+=vec3(1.,.62,.25)*sun;gl_FragColor=vec4(c,1.);}`}));scene.add(sky);
 scene.fog=new THREE.Fog(0x616775,200,1100);
 scene.add(new THREE.HemisphereLight(0xc5c6ed,0x292f3e,2.0));
 const sun=new THREE.DirectionalLight(0xffdfb0,3.3);sun.position.set(-180,220,140);scene.add(sun);
 const fill=new THREE.DirectionalLight(0x9abcea,1.1);fill.position.set(130,80,-60);scene.add(fill);
 const shadow=new THREE.DirectionalLight(0xffead0,1.1);shadow.castShadow=true;shadow.shadow.mapSize.set(1024,1024);Object.assign(shadow.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:130});shadow.shadow.normalBias=.07;scene.add(shadow,shadow.target);
 // Continuous sea, coast, roads and terrain are scene surfaces, not imported mesh assets.
 const seaMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}',fragmentShader:`varying vec3 wp;uniform float time;void main(){float a=sin(wp.x*.13+wp.z*.21-time*.8)*sin(wp.z*.08-time*.6);float b=pow(max(0.,sin(wp.z*.37+wp.x*.04+time)),18.);vec3 c=mix(vec3(.035,.11,.17),vec3(.12,.27,.34),a*.5+.5)+b*.055;gl_FragColor=vec4(c,1.);}`});
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),seaMaterial);sea.rotation.x=-Math.PI/2;sea.position.y=-3;scene.add(sea);
 const terrain=coastalTerrain();scene.add(terrain);
 const mountains=new THREE.Group();const vs=[],ix=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,x=170+Math.cos(a)*1900,z=100+Math.sin(a)*1900,h=75+Math.sin(i*1.38)*43+Math.sin(i*.67)*80;vs.push(x,-5,z,x,h,z);if(i)ix.push(i*2-2,i*2-1,i*2,i*2,i*2-1,i*2+1);}const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));mg.setIndex(ix);mg.computeVertexNormals();mountains.add(new THREE.Mesh(mg,new THREE.MeshStandardMaterial({color:0x3b4059,roughness:1,side:THREE.DoubleSide,flatShading:true})));scene.add(mountains);
 const road=material(0x252b34,.78),shoulder=material(0xabb4bf,.8),paint=material(0xffe8bf,.7),dark=material(0x1a2530,.8);
 const tex=await new THREE.TextureLoader().loadAsync('textures/atlas-concrete-base.png');tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,1);tex.anisotropy=4;road.map=tex;
 const rock=await new THREE.TextureLoader().loadAsync('textures/atlas-coastal-rock-base.png');rock.colorSpace=THREE.SRGBColorSpace;rock.wrapS=rock.wrapT=THREE.RepeatWrapping;rock.anisotropy=4;terrain.material.map=rock;
 shoulder.map=tex;
 scene.add(ribbon(-13,13,-.2,shoulder),ribbon(-11,11,0,road),ribbon(-10.7,-10.5,.025,paint),ribbon(10.5,10.7,.025,paint));
 const rendered=s=>DRAW_SECTIONS.some(([a,b])=>s>=a&&s<=b);
 const markings=new THREE.Group();for(let s=0;s<LENGTH;s+=14)if(rendered(s))for(const lane of [-3.7,3.7])markings.add(ribbon(lane-.06,lane+.06,.03,paint,s,Math.min(LENGTH,s+5),2));
 for(let s=0;s<LENGTH;s+=8)if(rendered(s))for(const side of [-1,1])markings.add(ribbon(side>0?11.4:-12.6,side>0?12.6:-11.4,-.17,Math.floor(s/8)%2?dark:paint,s,Math.min(LENGTH,s+7.5),3));
 scene.add(bakeStatic(markings));
 onLoad('Loading verified machinery and aerospace structures');
 const [car,ramp,lamp,hangar,tower,wedge]=await Promise.all([
  ASSET('assets/roadster-precision.js',{keepHierarchy:true}),ASSET('assets/ramp-banked.js',{keepHierarchy:true}),ASSET('assets/floodlight.js'),ASSET('assets/hangar.js',{surfaces:true}),ASSET('assets/tower.js',{surfaces:true}),ASSET('assets/wedge.js',{surfaces:true})]);
 // Bake each rigid assembly separately, retaining the four wheel pivots.
 for(const name of ['coachwork','rear_wing','wheel_l_f','wheel_r_f','wheel_l_r','wheel_r_r']){const part=car.getObjectByName(name);if(!part)continue;const local=new THREE.Group();for(const child of part.children)local.add(child.clone(true));const baked=bakeStatic(local);part.clear();part.add(baked);}
 car.traverse(o=>{o.userData={};});
 const rampOrigin=ramp.userData.sourceOrigin;ramp.position.set(...rampOrigin);const rampGroup=new THREE.Group();rampGroup.add(bakeStatic(ramp));place(rampGroup,GRAVITY.entry);scene.add(rampGroup);
 rampGroup.traverse(o=>{if(o.isMesh&&o.material.name==='stone'){
  // The original code-native faces have no UVs. Map the existing Atlas
  // concrete along the curl instead of sampling one dark pixel everywhere.
  const points=o.geometry.attributes.position,uv=[];
  for(let i=0;i<points.count;i++)uv.push((points.getX(i)+3.6)/7.2,Math.acos(THREE.MathUtils.clamp(1-points.getY(i)/20.4,-1,1))*20.4/12);
  o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  o.material=o.material.clone();o.material.map=tex;o.material.color.setHex(0xb2b6c4);o.material.metalness=.02;
 }});
 // The source illuminates the driving face from the landing side. The dusk
 // sun is behind this vertical surface, so give it its own floodlight pool.
 const rampLight=new THREE.SpotLight(0xdde7f3,6500,105,.62,.8,2),rampGate=sample(GRAVITY.entry).p;
 rampLight.position.copy(rampGate).add(new THREE.Vector3(-8,22,-42));
 rampLight.target.position.copy(rampGate).add(new THREE.Vector3(0,22,2));
 scene.add(rampLight,rampLight.target);
 const blocks=[],fixtures=new THREE.Group(),buildings=new THREE.Group();
 // Flush runway lights replace the long solid rails that crossed tight bends.
 const markerMat=new THREE.MeshStandardMaterial({color:0xafd8e2,emissive:0x7bb6c9,emissiveIntensity:1.3});
 for(const [a,b]of DRAW_SECTIONS)for(let at=a;at<b;at+=18){for(const sign of[-1,1]){const light=new THREE.Mesh(new THREE.BoxGeometry(.18,.065,.8),markerMat);place(light,at,sign*(roadWidth(at)/2+.6),.06);fixtures.add(light);}if(Math.floor(at/18)%5===0){const pole=lamp.clone(true);place(pole,at,roadWidth(at)/2+7);fixtures.add(pole);}}
 scene.add(bakeStatic(fixtures));
 for(const o of SCENERY){const h=(o.kind==='hangar'?hangar:tower).clone(true);h.scale.setScalar(o.scale);place(h,o.s,o.lane);if(o.kind==='hangar')h.rotation.y+=Math.PI/2;buildings.add(h);const pad=new THREE.Mesh(new THREE.PlaneGeometry(o.kind==='hangar'?42:18,o.kind==='hangar'?38:18),material(0x777a7c,.95));pad.rotation.x=-Math.PI/2;const loc=sample(o.s,o.lane);pad.position.copy(loc.p);pad.position.y=-.12;scene.add(pad);}
 scene.add(bakeStatic(buildings));
 for(const j of JUMPS){const launch=wedge.clone(true);launch.scale.set(j.width/5,j.height/2,j.length/12);place(launch,j.s-j.length/2,j.lane,.02);scene.add(launch);}
 // Start/finish paint and launch-lane graphics are markings on existing surfaces.
 const startPaint=new THREE.Group();for(let x=-10;x<10;x+=1)for(let z=0;z<3;z++){const tile=new THREE.Mesh(new THREE.PlaneGeometry(1,1),((x+z)%2)?paint:dark);tile.rotation.x=-Math.PI/2;const p=sample(0,x+.5).p;tile.position.set(p.x,.045,p.z+z);startPaint.add(tile);}scene.add(bakeStatic(startPaint));
 const launchPaint=material(0x8ad3e3,.5);launchPaint.emissive.setHex(0x163e54);for(let k=0;k<9;k++)scene.add(ribbon(-3.5,3.5,.04,launchPaint,GRAVITY.entry-70+k*7,GRAVITY.entry-67+k*7,1));
 // Return-lane threshold marks make the intended touchdown zone readable in the wide shot.
 for(let k=-4;k<=4;k++)for(const side of[-1,1])scene.add(ribbon(side>0?4.1:-4.4,side>0?4.4:-4.1,.04,launchPaint,GRAVITY.exit+k*5,GRAVITY.exit+k*5+2.5,1));
 scene.add(ribbon(-4.4,4.4,.04,paint,GRAVITY.exit,GRAVITY.exit+.35,1));
 const pickupMeshes=[];const cellGeo=new THREE.OctahedronGeometry(.7);for(let i=0;i<PICKUPS.length;i++)for(let j=0;j<3;j++){const m=new THREE.MeshStandardMaterial({color:0xa7f5ff,emissive:0x38c9ed,emissiveIntensity:2,metalness:.5,roughness:.2});const cell=new THREE.Mesh(cellGeo,m);place(cell,PICKUPS[i].s,PICKUPS[i].lanes[j],1.4);scene.add(cell);pickupMeshes.push({mesh:cell,key:`${i}:${j}`,base:cell.position.y});}
 const reflectionScene=new THREE.Scene();reflectionScene.background=new THREE.Color(0x43546a);for(const [pos,scale,col] of [[[0,8,0],[20,10],0xbcc6ed],[[5,3,-4],[3,8],0xffe4c8],[[-6,3,1],[2,7],0x999acb]]){const card=new THREE.Mesh(new THREE.PlaneGeometry(...scale),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));card.position.set(...pos);card.lookAt(0,0,0);reflectionScene.add(card);}const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(reflectionScene,.05).texture;pmrem.dispose();car.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.envMap=env;o.material.envMapIntensity=o.material.name==='copper_glazing'?.22:.7;}});
 const pools=[];for(let i=0;i<3;i++){const light=new THREE.PointLight(i===1?0xffd39c:0xb6cbe9,160,38,2);scene.add(light);pools.push(light);}
 return {terrain,car,rampGroup,pickupMeshes,shadow,seaMaterial,blocks,pools};
}
