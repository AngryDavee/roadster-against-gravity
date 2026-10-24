// 404 reference-driven candidate: Extruded continuous side profile and explicit triangular trusses
export default function(THREE){
const g=new THREE.Group();
const mat=(c,r=.7,m=.1,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?2.5:0,side:THREE.DoubleSide,flatShading:true});
const ink=mat(0x151822),steel=mat(0x55576b,.6,.6),silver=mat(0xa3a1b1,.8,.15),red=mat(0xff3347,.4,.1,0xff152b),white=mat(0xdce9ff,.35,.2,0xe2efff),ground=mat(0x11151f,.85,.05);
const mesh=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=steel)=>mesh(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.05,m=steel)=>{a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,a.clone().add(b).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return mesh(geo,m);};

const R=20.4,T=2.3,W=7.2,sh=new THREE.Shape();sh.moveTo(0,0);for(let i=0;i<=80;i++){const a=i/80*T;sh.lineTo(R*Math.sin(a),R*(1-Math.cos(a)));}for(let i=80;i>=0;i--){const a=i/80*T;sh.lineTo((R+.28)*Math.sin(a),R-(R+.28)*Math.cos(a));}sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:W,bevelEnabled:false});geo.rotateY(-Math.PI/2);geo.translate(W/2,0,0);mesh(geo,silver);
for(const s of [-1,1])for(let i=0;i<34;i++){const a=i/34*T,b=(i+1)/34*T,p=[s*3.64,R*(1-Math.cos(a)),R*Math.sin(a)],q=[s*3.64,R*(1-Math.cos(b)),R*Math.sin(b)];rod(p,q,.055,red);if(i%3===0){rod(p,[s*3.65,p[1],24],.09);rod(p,[s*3.65,Math.max(0,p[1]-3.4),24],.075);}}for(const s of [-1,1])rod([s*3.65,0,24],[s*3.65,34,24],.12);

const bounds=new THREE.Box3(),v=new THREE.Vector3();g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];return g;
}
