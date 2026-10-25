"""Three independent constructions per Atlas object reference; selected assets are separate."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
header='''// Reference: references/racing/atlas-objects.png. Metres; +Z front.
export default function(THREE){
const g=new THREE.Group();
const mat=(color,roughness=.7,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true,side:THREE.DoubleSide});
const ivory=mat(0xc3c4cf),dark=mat(0x172330),metal=mat(0x626b7e,.5,.6),glass=mat(0x264859,.25,.5),amber=mat(0xe3b36e,.4),cyan=mat(0x9cdbed,.3);cyan.emissive.setHex(0x4f9db8);cyan.emissiveIntensity=1.4;amber.emissive.setHex(0x725025);ivory.name='metal';
const add=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=ivory)=>add(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.08,m=metal)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=add(new THREE.CylinderGeometry(r,r,delta.length(),6),m,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return add(geo,m);};
'''
footer='''
g.updateMatrixWorld(true);const b=new THREE.Box3(),v=new THREE.Vector3();g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=b.getCenter(new THREE.Vector3());for(const o of g.children){o.position.x-=c.x;o.position.y-=b.min.y;o.position.z-=c.z;}return g;}
'''
hangar_detail='''
for(const s of [-1,1]){box(.5,3,22,[s*12.4,1.5,0],metal);for(let z=-10;z<=10;z+=4){box(.9,3.6,.5,[s*12.5,1.8,z]);box(.3,.16,.4,[s*12.7,3.1,z],cyan);}for(const z of [-10.7,10.7]){rod([-11,3,z],[11,3,z],.13);box(18,.24,.3,[0,3.3,z],amber);}}
'''
strategies={
'hangar':[
('a','Primitive vaulted ribs and overlapping roof planks','''for(let i=0;i<24;i++){const a=(i+.5)/24*Math.PI,x=Math.cos(a)*12.4,y=3+Math.sin(a)*8;const slab=box(1.78,.25,22,[x,y,0]);slab.rotation.z=Math.atan2(8*Math.cos(a),-12.4*Math.sin(a));}for(const z of [-10.8,0,10.8])for(let i=0;i<24;i++){const a=i/24*Math.PI,b=(i+1)/24*Math.PI;rod([Math.cos(a)*12.7,3+Math.sin(a)*8.2,z],[Math.cos(b)*12.7,3+Math.sin(b)*8.2,z],.14);}'''+hangar_detail),
('b','Extruded hollow arch shell and broad flanges','''const shape=new THREE.Shape();for(let i=0;i<=32;i++){const a=i/32*Math.PI,x=Math.cos(a)*12.5,y=3+Math.sin(a)*8;i?shape.lineTo(x,y):shape.moveTo(x,y);}for(let i=32;i>=0;i--){const a=i/32*Math.PI;shape.lineTo(Math.cos(a)*12.15,3+Math.sin(a)*7.65);}shape.closePath();const geom=new THREE.ExtrudeGeometry(shape,{depth:22,bevelEnabled:false});geom.translate(0,0,-11);add(geom,ivory);for(const z of [-10.8,-5.5,0,5.5,10.8])for(let i=0;i<24;i++){const a=i/24*Math.PI,b=(i+1)/24*Math.PI;rod([Math.cos(a)*12.6,3+Math.sin(a)*8.15,z],[Math.cos(b)*12.6,3+Math.sin(b)*8.15,z],.11);}'''+hangar_detail),
('c','Individual curved skin panels, bronze clerestories and external rib grid','''for(let j=0;j<8;j++)for(let i=0;i<22;i++){const a=i/22*Math.PI,b=(i+1)/22*Math.PI,z=-11+j*2.75;const p=t=>[12.5*Math.cos(t),3+8*Math.sin(t)];const aa=p(a),bb=p(b);face([[...aa,z],[...bb,z],[...bb,z+2.70],[...aa,z+2.70]],i===3||i===4||i===17||i===18?amber:ivory);}for(const z of [-11,-5.5,0,5.5,11])for(let i=0;i<32;i++){const a=i/32*Math.PI,b=(i+1)/32*Math.PI;rod([Math.cos(a)*12.6,3+Math.sin(a)*8.12,z],[Math.cos(b)*12.6,3+Math.sin(b)*8.12,z],.15);}for(let i=0;i<=22;i++){const a=i/22*Math.PI;rod([12.55*Math.cos(a),3+8.06*Math.sin(a),-11],[12.55*Math.cos(a),3+8.06*Math.sin(a),11],.035,dark);}'''+hangar_detail)],
'tower':[
('a','Stacked tapering pedestal sections and an octagonal cabin','''for(let i=0;i<12;i++){const w=3.1-i*.13;box(w,1.16,w,[0,.58+i*1.12,0]);}add(new THREE.CylinderGeometry(3.4,2.6,1.2,8),metal,[0,13.8,0]);add(new THREE.CylinderGeometry(3.4,3.1,2,8),glass,[0,15.4,0]);add(new THREE.CylinderGeometry(3.6,3.6,.4,8),ivory,[0,16.6,0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;rod([Math.sin(a)*3.1,14.4,Math.cos(a)*3.1],[Math.sin(a)*3.4,16.4,Math.cos(a)*3.4],.06);};'''),
('b','Lathed flared pedestal, tapered viewing cabin and service doors','''const profile=[[2.5,0],[2.5,.4],[1.8,.8],[1.25,3],[.85,11.8],[1.15,13.2],[2.6,13.7],[3.2,14.4]].map(p=>new THREE.Vector2(...p));add(new THREE.LatheGeometry(profile,8),ivory);add(new THREE.CylinderGeometry(3.4,3.2,1.8,8),glass,[0,15.3,0]);add(new THREE.CylinderGeometry(3.6,3.6,.28,8),ivory,[0,16.35,0]);for(let j=0;j<8;j++){const a=j/8*Math.PI*2;rod([Math.sin(a)*1.75,.5,Math.cos(a)*1.75],[Math.sin(a)*.95,12.5,Math.cos(a)*.95],.035,metal);rod([Math.sin(a)*3.2,14.4,Math.cos(a)*3.2],[Math.sin(a)*3.4,16.25,Math.cos(a)*3.4],.06);}'''),
('c','Faceted panel pedestal with buttressed feet and explicit glazing mullions','''for(let i=0;i<8;i++){const a=i/8*Math.PI*2,b=(i+1)/8*Math.PI*2;for(let j=0;j<10;j++){const y=j*1.35,r=2.1-j*.105,r2=r-.105;face([[Math.sin(a)*r,y,Math.cos(a)*r],[Math.sin(b)*r,y,Math.cos(b)*r],[Math.sin(b)*r2,y+1.32,Math.cos(b)*r2],[Math.sin(a)*r2,y+1.32,Math.cos(a)*r2]],ivory);}rod([Math.sin(a)*2.1,.1,Math.cos(a)*2.1],[Math.sin(a)*1.05,13.5,Math.cos(a)*1.05],.04,metal);face([[Math.sin(a)*3,14,Math.cos(a)*3],[Math.sin(b)*3,14,Math.cos(b)*3],[Math.sin(b)*3.6,16,Math.cos(b)*3.6],[Math.sin(a)*3.6,16,Math.cos(a)*3.6]],glass);rod([Math.sin(a)*3,14,Math.cos(a)*3],[Math.sin(a)*3.6,16,Math.cos(a)*3.6],.075);rod([Math.sin(a)*2.1,2,Math.cos(a)*2.1],[Math.sin(a)*3.2,.2,Math.cos(a)*3.2],.2);}add(new THREE.CylinderGeometry(3,1.1,.6,8),metal,[0,13.7,0]);add(new THREE.CylinderGeometry(3.7,3.7,.25,8),ivory,[0,16.15,0]);''')],
'wedge':[
('a','Sloped slab deck on graduated steel trestles','''const slab=box(5,.2,12.16,[0,1.1,0]);slab.rotation.x=-Math.atan(2/12);for(let j=0;j<5;j++){const z=-4+j*2.4,h=(z+6)/6;for(const s of [-1,1])box(.2,h,.25,[s*2.2,h/2,z],metal);}'''),
('b','Extruded triangular sidewalls with inset deck','''for(const x of [-2.5,2.3]){const sh=new THREE.Shape();sh.moveTo(-6,0);sh.lineTo(6,2);sh.lineTo(6,0);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false});geo.rotateY(-Math.PI/2);geo.translate(x,0,0);add(geo,metal);}face([[-2.5,.05,-6],[2.5,.05,-6],[2.5,2.05,6],[-2.5,2.05,6]],ivory);'''),
('c','Panelized launch deck with open diagonal trusses and rail caps','''for(let i=0;i<6;i++){const z=-6+i*2,y=i/3;face([[-2.5,y+.09,z],[2.5,y+.09,z],[2.5,y+.42,z+1.98],[-2.5,y+.42,z+1.98]],ivory);}for(const s of [-1,1]){rod([s*2.5,.1,-6],[s*2.5,2.1,6],.10,metal);rod([s*2.3,.07,-6],[s*2.3,.07,6],.13,metal);for(let j=0;j<5;j++){const z=-4+j*2,y=(z+6)/6;rod([s*2.3,.1,z],[s*2.3,y,z],.10);rod([s*2.3,.1,z-2],[s*2.3,y,z],.075);}}''')]
}
manifest=[]
for family,versions in strategies.items():
 for suffix,strategy,code in versions:
  if family=='tower':code+='''add(new THREE.CylinderGeometry(3.3,3.6,.25,8),metal,[0,.125,0]);for(const s of [-1,1]){box(.6,1.5,.12,[0,.8,s*2.15],dark);box(.4,.12,.13,[0,1.7,s*2.15],cyan);}rod([.8,16.5,0],[.8,18.5,0],.035);box(.12,.15,.12,[.8,18.5,0],amber);'''
  if family=='wedge':code+='''for(const s of [-1,1])rod([s*2.45,.13,-6],[s*2.45,2.13,6],.04,amber);for(let j=0;j<3;j++){const z=-2+j*2,y=(z+6)/6+.12;rod([-1,y,z-1],[0,y+.17,z],.07,amber);rod([1,y,z-1],[0,y+.17,z],.07,amber);}box(5,.12,.3,[0,.06,-5.8],metal);'''
  file=f'{family}_{suffix}.js';(root/'racing/candidates'/file).write_text(header+'// Strategy: '+strategy+'\n'+code+footer)
  manifest.append(dict(file=file,family=family,strategy=strategy,reference='references/racing/atlas-objects.png'))
(root/'references/racing/candidates.json').write_text(json.dumps(manifest,indent=2))
print('Wrote nine reference-driven candidates.')
