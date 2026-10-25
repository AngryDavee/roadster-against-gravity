import * as THREE from 'three';
import {ASSET,bakeStatic} from './assetlib.js';
import {LENGTH,WIDTH,GRAVITY,JUMPS,PICKUPS,sample} from './track.js';
export const material=(color,roughness=.75,metalness=.1)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function ribbon(left,right,height,mat,from=0,to=LENGTH,step=4){
 const positions=[],uv=[],indices=[];let n=0;
 for(let s=from;s<=to+step;s=Math.min(to+step,s+step)){
  const at=Math.min(to,s);for(const lane of [left,right]){const p=sample(at,lane).p;positions.push(p.x,p.y+height,p.z);uv.push((lane-left)/(right-left),at/12);}
  if(n)indices.push(n*2-2,n*2-1,n*2,n*2-1,n*2+1,n*2);n++;if(at===to)break;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,mat);mesh.receiveShadow=true;return mesh;
}
function place(obj,s,lane=0,y=0){const q=sample(s,lane);obj.position.copy(q.p);obj.position.y+=y;obj.rotation.y=q.yaw;return obj;}
export async function buildWorld(renderer,scene,onLoad){
 onLoad('Sculpting Meridian Launch Coast');
 const sky=new THREE.Mesh(new THREE.SphereGeometry(2800,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;void main(){vec3 d=normalize(p);float h=max(0.,d.y);vec3 c=mix(vec3(.29,.17,.18),vec3(.075,.105,.21),smoothstep(0.,.48,h));float sun=pow(max(0.,dot(d,normalize(vec3(-.7,.12,.4)))),260.);c+=vec3(1.,.62,.25)*sun;gl_FragColor=vec4(c,1.);}`}));scene.add(sky);
 scene.fog=new THREE.Fog(0x5a596d,240,1150);
 scene.add(new THREE.HemisphereLight(0xc5c6ed,0x292f3e,2.0));
 const sun=new THREE.DirectionalLight(0xffdfb0,3.3);sun.position.set(-180,220,140);scene.add(sun);
 const fill=new THREE.DirectionalLight(0x9abcea,1.1);fill.position.set(130,80,-60);scene.add(fill);
 const shadow=new THREE.DirectionalLight(0xffead0,1.1);shadow.castShadow=true;shadow.shadow.mapSize.set(1024,1024);Object.assign(shadow.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:130});shadow.shadow.normalBias=.07;scene.add(shadow,shadow.target);
 // Continuous sea, coast, roads and terrain are scene surfaces, not imported mesh assets.
 const seaMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}',fragmentShader:`varying vec3 wp;uniform float time;void main(){float a=sin(wp.x*.13+wp.z*.21-time*.8)*sin(wp.z*.08-time*.6);float b=pow(max(0.,sin(wp.z*.37+wp.x*.04+time)),18.);vec3 c=mix(vec3(.035,.11,.17),vec3(.12,.27,.34),a*.5+.5)+b*.055;gl_FragColor=vec4(c,1.);}`});
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),seaMaterial);sea.rotation.x=-Math.PI/2;sea.position.y=-3;scene.add(sea);
 const coast=new THREE.Shape();[[-220,-600],[-205,-150],[-130,50],[-110,400],[-70,650],[120,730],[260,550],[580,400],[650,-600]].forEach(([x,z],i)=>i?coast.lineTo(x,-z):coast.moveTo(x,-z));coast.closePath();const island=new THREE.Mesh(new THREE.ShapeGeometry(coast),material(0x485161,.96));island.rotation.x=-Math.PI/2;island.position.y=-1.4;scene.add(island);
 const mountains=new THREE.Group();const vs=[],ix=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,x=170+Math.cos(a)*1900,z=100+Math.sin(a)*1900,h=75+Math.sin(i*1.38)*43+Math.sin(i*.67)*80;vs.push(x,-5,z,x,h,z);if(i)ix.push(i*2-2,i*2-1,i*2,i*2,i*2-1,i*2+1);}const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));mg.setIndex(ix);mg.computeVertexNormals();mountains.add(new THREE.Mesh(mg,new THREE.MeshStandardMaterial({color:0x3b4059,roughness:1,side:THREE.DoubleSide,flatShading:true})));scene.add(mountains);
 const road=material(0x353b48,.88),shoulder=material(0xabb4bf,.8),paint=material(0xffe8bf,.7),dark=material(0x1a2530,.8);
 const tex=await new THREE.TextureLoader().loadAsync('textures/atlas-concrete-base.png');tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,1);tex.anisotropy=4;road.map=tex;
 scene.add(ribbon(-13,13,-.2,shoulder),ribbon(-11,11,0,road),ribbon(-10.7,-10.5,.025,paint),ribbon(10.5,10.7,.025,paint));
 const markings=new THREE.Group();for(let s=0;s<LENGTH;s+=14)for(const lane of [-3.7,3.7])markings.add(ribbon(lane-.06,lane+.06,.03,paint,s,Math.min(LENGTH,s+5),2));
 for(let s=0;s<LENGTH;s+=8)for(const side of [-1,1])markings.add(ribbon(side>0?11.4:-12.6,side>0?12.6:-11.4,-.17,Math.floor(s/8)%2?dark:paint,s,Math.min(LENGTH,s+7.5),3));
 scene.add(bakeStatic(markings));
 // Deck walls make the coastal and elevated road read as a supported viaduct.
 const sides=[];for(let i=0;i<=900;i++){const s=i/900*LENGTH;for(const lane of [-13,13]){const p=sample(s,lane).p;sides.push([p.x,p.y-.2,p.z],[p.x,-3,p.z]);}}
 const verts=[],inds=[];for(let i=0;i<sides.length;i++)verts.push(...sides[i]);for(let i=0;i<900;i++)for(let side=0;side<2;side++){const a=i*4+side*2,b=a+4;inds.push(a,b,a+1,b,b+1,a+1);}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));sg.setIndex(inds);sg.computeVertexNormals();scene.add(new THREE.Mesh(sg,new THREE.MeshStandardMaterial({color:0x737c88,roughness:.9,side:THREE.DoubleSide})));
 onLoad('Loading verified machinery and aerospace structures');
 const [car,ramp,lamp,boundary,hangar,tower,wedge]=await Promise.all([
  ASSET('assets/roadster.js'),ASSET('assets/ramp.js',{keepHierarchy:true}),ASSET('assets/floodlight.js'),ASSET('assets/boundary.js'),ASSET('assets/hangar.js'),ASSET('assets/tower.js'),ASSET('assets/wedge.js')]);
 const rampOrigin=ramp.userData.sourceOrigin;ramp.position.set(...rampOrigin);const rampGroup=new THREE.Group();rampGroup.add(bakeStatic(ramp));place(rampGroup,GRAVITY.entry);scene.add(rampGroup);
 rampGroup.traverse(o=>{if(o.isMesh&&o.material.name==='stone'){o.material=o.material.clone();o.material.map=tex;o.material.color.setHex(0xb2b6c4);}});
 const blocks=[];for(let b=0;b<16;b++){const block=new THREE.Group();const from=b/16*LENGTH,to=(b+1)/16*LENGTH;
  for(let s=from;s<to;s+=28){for(const side of [-1,1]){const edge=boundary.clone(true);edge.scale.set(4.6,1.7,1);place(edge,s,side*12.7);edge.rotation.y+=Math.PI/2;block.add(edge);}if(Math.floor(s/28)%3===0){const l=lamp.clone(true);l.scale.setScalar(1.3);place(l,s,15);block.add(l);}}
  const merged=bakeStatic(block);scene.add(merged);blocks.push(merged);
 }
 const buildings=new THREE.Group();for(const [s,lane,rot,scale] of [[100,43,-Math.PI/2,1.4],[290,48,-Math.PI/2,1],[450,62,-Math.PI/2,1.3],[1140,48,0,1.3],[1670,52,-Math.PI/2,1.5],[1850,45,0,1],[2060,42,0,1.4],[240,-58,Math.PI/2,1.3],[410,-72,Math.PI/2,1.5],[630,-50,Math.PI/2,1.2]]){const h=hangar.clone(true);h.scale.setScalar(scale);place(h,s,lane);h.rotation.y+=rot;buildings.add(h);}
 for(const [s,lane] of [[180,75],[GRAVITY.entry+20,52],[1320,58],[2300,48]]){const t=tower.clone(true);place(t,s,lane);buildings.add(t);}
 // Broad shell spans the road: a real covered sector rather than a backdrop.
 for(let i=0;i<3;i++){const cover=hangar.clone(true);cover.scale.set(1.12,1.2,1);place(cover,1900+i*24,0);buildings.add(cover);}
 scene.add(bakeStatic(buildings));
 for(const j of JUMPS){const wedgeClone=wedge.clone(true);place(wedgeClone,j.s-6,j.lane,.03);scene.add(wedgeClone);}
 // Start/finish paint and launch-lane graphics are markings on existing surfaces.
 const startPaint=new THREE.Group();for(let x=-10;x<10;x+=1)for(let z=0;z<3;z++){const tile=new THREE.Mesh(new THREE.PlaneGeometry(1,1),((x+z)%2)?paint:dark);tile.rotation.x=-Math.PI/2;const p=sample(0,x+.5).p;tile.position.set(p.x,.045,p.z+z);startPaint.add(tile);}scene.add(bakeStatic(startPaint));
 const launchPaint=material(0x8ad3e3,.5);launchPaint.emissive.setHex(0x163e54);for(let k=0;k<9;k++)scene.add(ribbon(-3.5,3.5,.04,launchPaint,GRAVITY.entry-70+k*7,GRAVITY.entry-67+k*7,1));
 const pickupMeshes=[];const cellGeo=new THREE.OctahedronGeometry(.7);for(let i=0;i<PICKUPS.length;i++)for(let j=0;j<3;j++){const m=new THREE.MeshStandardMaterial({color:0xa7f5ff,emissive:0x38c9ed,emissiveIntensity:2,metalness:.5,roughness:.2});const cell=new THREE.Mesh(cellGeo,m);place(cell,PICKUPS[i].s,PICKUPS[i].lanes[j],1.4);scene.add(cell);pickupMeshes.push({mesh:cell,key:`${i}:${j}`,base:cell.position.y});}
 const reflectionScene=new THREE.Scene();reflectionScene.background=new THREE.Color(0x43546a);for(const [pos,scale,col] of [[[0,8,0],[20,10],0xbcc6ed],[[5,3,-4],[3,8],0xffe4c8],[[-6,3,1],[2,7],0x999acb]]){const card=new THREE.Mesh(new THREE.PlaneGeometry(...scale),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));card.position.set(...pos);card.lookAt(0,0,0);reflectionScene.add(card);}const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(reflectionScene,.05).texture;pmrem.dispose();car.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.envMap=env;o.material.envMapIntensity=.7;}});
 return {car,rampGroup,pickupMeshes,shadow,seaMaterial,blocks};
}
