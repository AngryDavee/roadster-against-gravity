// 404 reference-driven candidate: Lattice mast with angled framed reflector fixtures
export default function(THREE){
const g=new THREE.Group();
const mat=(c,r=.7,m=.1,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?2.5:0,side:THREE.DoubleSide,flatShading:true});
const ink=mat(0x151822),steel=mat(0x55576b,.6,.6),silver=mat(0xa3a1b1,.8,.15),red=mat(0xff3347,.4,.1,0xff152b),white=mat(0xdce9ff,.35,.2,0xe2efff),ground=mat(0x11151f,.85,.05);
const mesh=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=steel)=>mesh(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.05,m=steel)=>{a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,a.clone().add(b).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return mesh(geo,m);};
for(const x of [-.17,.17])for(const z of [-.17,.17])rod([x,.1,z],[x,6.2,z],.035);for(let y=.2;y<6.2;y+=.55)for(const s of [-1,1]){rod([-.17,y,s*.17],[.17,y+.55,s*.17],.02);rod([s*.17,y,-.17],[s*.17,y+.55,.17],.02);}for(let k=0;k<3;k++){const a=k*Math.PI*2/3;rod([0,1.2,0],[Math.cos(a)*1.0,.08,Math.sin(a)*1.0],.055);}box(.6,.14,.6,[0,.07,0],ink);rod([-1.5,6.25,0],[1.5,6.25,0],.06);for(let k=0;k<6;k++){const x=(k-2.5)*.48;box(.41,.32,.23,[x,6.30,0],ink);box(.35,.25,.03,[x,6.30,.13],silver);box(.29,.19,.018,[x,6.30,.15],white);for(const s of [-1,1])box(.015,.29,.035,[x+s*.19,6.30,.14],steel);rod([x,6.12,0],[x,6.05,.20],.03);}
const bounds=new THREE.Box3(),v=new THREE.Vector3();g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];return g;
}
