// 404 reference-driven candidate: Tripod tower with circular recessed lamps
export default function(THREE){
const g=new THREE.Group();
const mat=(c,r=.7,m=.1,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?2.5:0,side:THREE.DoubleSide,flatShading:true});
const ink=mat(0x151822),steel=mat(0x55576b,.6,.6),silver=mat(0xa3a1b1,.8,.15),red=mat(0xff3347,.4,.1,0xff152b),white=mat(0xdce9ff,.35,.2,0xe2efff),ground=mat(0x11151f,.85,.05);
const mesh=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=steel)=>mesh(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.05,m=steel)=>{a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,a.clone().add(b).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return mesh(geo,m);};
for(let k=0;k<3;k++){let a=k*Math.PI*2/3;rod([Math.cos(a)*1.1,0,Math.sin(a)*1.1],[0,4.8,0],.07);}rod([0,0,0],[0,6.4,0],.075);rod([-1.3,6.4,0],[1.3,6.4,0],.065);for(let k=0;k<5;k++){let x=(k-2)*.5;const o=mesh(new THREE.CylinderGeometry(.20,.22,.28,12),ink,[x,6.4,0]);o.rotation.x=Math.PI/2;const lens=mesh(new THREE.CircleGeometry(.17,12),white,[x,6.4,.151]);}
const bounds=new THREE.Box3(),v=new THREE.Vector3();g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];return g;
}
