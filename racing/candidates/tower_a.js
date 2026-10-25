// Reference: references/racing/atlas-objects.png. Metres; +Z front.
export default function(THREE){
const g=new THREE.Group();
const mat=(color,roughness=.7,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true,side:THREE.DoubleSide});
const ivory=mat(0xc3c4cf),dark=mat(0x172330),metal=mat(0x626b7e,.5,.6),glass=mat(0x264859,.25,.5),amber=mat(0xe3b36e,.4),cyan=mat(0x9cdbed,.3);cyan.emissive.setHex(0x4f9db8);cyan.emissiveIntensity=1.4;amber.emissive.setHex(0x725025);ivory.name='metal';
const add=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=ivory)=>add(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.08,m=metal)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=add(new THREE.CylinderGeometry(r,r,delta.length(),6),m,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return add(geo,m);};
// Strategy: Stacked tapering pedestal sections and an octagonal cabin
for(let i=0;i<12;i++){const w=3.1-i*.13;box(w,1.16,w,[0,.58+i*1.12,0]);}add(new THREE.CylinderGeometry(3.4,2.6,1.2,8),metal,[0,13.8,0]);add(new THREE.CylinderGeometry(3.4,3.1,2,8),glass,[0,15.4,0]);add(new THREE.CylinderGeometry(3.6,3.6,.4,8),ivory,[0,16.6,0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;rod([Math.sin(a)*3.1,14.4,Math.cos(a)*3.1],[Math.sin(a)*3.4,16.4,Math.cos(a)*3.4],.06);};add(new THREE.CylinderGeometry(3.3,3.6,.25,8),metal,[0,.125,0]);for(const s of [-1,1]){box(.6,1.5,.12,[0,.8,s*2.15],dark);box(.4,.12,.13,[0,1.7,s*2.15],cyan);}rod([.8,16.5,0],[.8,18.5,0],.035);box(.12,.15,.12,[.8,18.5,0],amber);
g.updateMatrixWorld(true);const b=new THREE.Box3(),v=new THREE.Vector3();g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=b.getCenter(new THREE.Vector3());for(const o of g.children){o.position.x-=c.x;o.position.y-=b.min.y;o.position.z-=c.z;}return g;}
