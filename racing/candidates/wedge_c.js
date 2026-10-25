// Reference: references/racing/atlas-objects.png. Metres; +Z front.
export default function(THREE){
const g=new THREE.Group();
const mat=(color,roughness=.7,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true,side:THREE.DoubleSide});
const ivory=mat(0xc3c4cf),dark=mat(0x172330),metal=mat(0x626b7e,.5,.6),glass=mat(0x264859,.25,.5),amber=mat(0xe3b36e,.4),cyan=mat(0x9cdbed,.3);cyan.emissive.setHex(0x4f9db8);cyan.emissiveIntensity=1.4;amber.emissive.setHex(0x725025);ivory.name='metal';
const add=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=ivory)=>add(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.08,m=metal)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=add(new THREE.CylinderGeometry(r,r,delta.length(),6),m,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return add(geo,m);};
// Strategy: Panelized launch deck with open diagonal trusses and rail caps
for(let i=0;i<6;i++){const z=-6+i*2,y=i/3;face([[-2.5,y+.09,z],[2.5,y+.09,z],[2.5,y+.42,z+1.98],[-2.5,y+.42,z+1.98]],ivory);}for(const s of [-1,1]){rod([s*2.5,.1,-6],[s*2.5,2.1,6],.10,metal);rod([s*2.3,.07,-6],[s*2.3,.07,6],.13,metal);for(let j=0;j<5;j++){const z=-4+j*2,y=(z+6)/6;rod([s*2.3,.1,z],[s*2.3,y,z],.10);rod([s*2.3,.1,z-2],[s*2.3,y,z],.075);}}for(const s of [-1,1])rod([s*2.45,.13,-6],[s*2.45,2.13,6],.04,amber);for(let j=0;j<3;j++){const z=-2+j*2,y=(z+6)/6+.12;rod([-1,y,z-1],[0,y+.17,z],.07,amber);rod([1,y,z-1],[0,y+.17,z],.07,amber);}box(5,.12,.3,[0,.06,-5.8],metal);
g.updateMatrixWorld(true);const b=new THREE.Box3(),v=new THREE.Vector3();g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=b.getCenter(new THREE.Vector3());for(const o of g.children){o.position.x-=c.x;o.position.y-=b.min.y;o.position.z-=c.z;}return g;}
