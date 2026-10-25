// Reference: references/racing/atlas-objects.png. Metres; +Z front.
export default function(THREE){
const g=new THREE.Group();
const mat=(color,roughness=.7,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true,side:THREE.DoubleSide});
const ivory=mat(0xc3c4cf),dark=mat(0x172330),metal=mat(0x626b7e,.5,.6),glass=mat(0x264859,.25,.5),amber=mat(0xe3b36e,.4),cyan=mat(0x9cdbed,.3);cyan.emissive.setHex(0x4f9db8);cyan.emissiveIntensity=1.4;amber.emissive.setHex(0x725025);ivory.name='metal';
const add=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=ivory)=>add(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.08,m=metal)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=add(new THREE.CylinderGeometry(r,r,delta.length(),6),m,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return add(geo,m);};
// Strategy: Extruded hollow arch shell and broad flanges
const shape=new THREE.Shape();for(let i=0;i<=32;i++){const a=i/32*Math.PI,x=Math.cos(a)*12.5,y=3+Math.sin(a)*8;i?shape.lineTo(x,y):shape.moveTo(x,y);}for(let i=32;i>=0;i--){const a=i/32*Math.PI;shape.lineTo(Math.cos(a)*12.15,3+Math.sin(a)*7.65);}shape.closePath();const geom=new THREE.ExtrudeGeometry(shape,{depth:22,bevelEnabled:false});geom.translate(0,0,-11);add(geom,ivory);for(const z of [-10.8,-5.5,0,5.5,10.8])for(let i=0;i<24;i++){const a=i/24*Math.PI,b=(i+1)/24*Math.PI;rod([Math.cos(a)*12.6,3+Math.sin(a)*8.15,z],[Math.cos(b)*12.6,3+Math.sin(b)*8.15,z],.11);}
for(const s of [-1,1]){box(.5,3,22,[s*12.4,1.5,0],metal);for(let z=-10;z<=10;z+=4){box(.9,3.6,.5,[s*12.5,1.8,z]);box(.3,.16,.4,[s*12.7,3.1,z],cyan);}for(const z of [-10.7,10.7]){rod([-11,3,z],[11,3,z],.13);box(18,.24,.3,[0,3.3,z],amber);}}

g.updateMatrixWorld(true);const b=new THREE.Box3(),v=new THREE.Vector3();g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=b.getCenter(new THREE.Vector3());for(const o of g.children){o.position.x-=c.x;o.position.y-=b.min.y;o.position.z-=c.z;}return g;}
