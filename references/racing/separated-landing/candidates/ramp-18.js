// 404 reference-driven candidate: Parametric paneled ribbon with attached curved rail and braced spine
export default function(THREE){
const g=new THREE.Group();
const mat=(c,r=.7,m=.1,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?2.5:0,side:THREE.DoubleSide,flatShading:true});
const ink=mat(0x151822),steel=mat(0x55576b,.6,.6),silver=mat(0xa3a1b1,.8,.15),red=mat(0xff3347,.4,.1,0xff152b),white=mat(0xdce9ff,.35,.2,0xe2efff),ground=mat(0x11151f,.85,.05);
const mesh=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=steel)=>mesh(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.05,m=steel)=>{a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,a.clone().add(b).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return mesh(geo,m);};

const R=20.4,T=2.3,W=7.2,N=92;
// Source reference curl adapted with a 18m progressive sideways bend.
const P=(a,x,offset=0)=>{const u=a/T,y=R*(1-Math.cos(a)),t=new THREE.Vector3(-54*u*u,R*T*Math.sin(a),R*T*(Math.cos(a)-.55*Math.sin(a))).normalize();const right=new THREE.Vector3(1,0,0).addScaledVector(t,-t.x).normalize(),up=new THREE.Vector3().crossVectors(t,right).normalize();return new THREE.Vector3(-18*u*u*u,y,R*Math.sin(a)-.55*y).addScaledVector(right,x).addScaledVector(up,offset).toArray();};
const concrete=mat(0x898994,.88,.08);concrete.name='stone';
for(let i=0;i<N;i++){const a=i/N*T,b=(i+1)/N*T;face([P(a,-W/2),P(a,W/2),P(b,W/2),P(b,-W/2)],concrete);face([P(b,-W/2,-.22),P(b,W/2,-.22),P(a,W/2,-.22),P(a,-W/2,-.22)],steel);face([P(a,-.042,.012),P(a,.042,.012),P(b,.042,.012),P(b,-.042,.012)],silver);for(const s of [-1,1]){face([P(a,s*W/2),P(b,s*W/2),P(b,s*W/2,-.22),P(a,s*W/2,-.22)],steel);rod(P(a,s*(W/2+.02),.035),P(b,s*(W/2+.02),.035),.038,red);}
if(i%5===0){rod(P(a,-W/2,.013),P(a,W/2,.013),.009,ink);for(const x of [-2.6,2.6])mesh(new THREE.SphereGeometry(.025,5,4),steel,P(a,x,.02));}}
for(const s of [-1,1]){
 for(let i=0;i<23;i++){const a=i/23*T,b=(i+1)/23*T;rod(P(a,s*3.76,-.22),P(b,s*3.76,-.22),.09);rod(P(a,s*3.76,-2.3),P(b,s*3.76,-2.3),.10);rod(P(a,s*3.76,-.22),P(b,s*3.76,-2.3),.055);rod(P(a,s*3.76,-2.3),P(b,s*3.76,-.22),.055);}
 for(let i=3;i<24;i+=3){const a=i/24*T,p=P(a,s*3.76,-2.3);rod([p[0],p[1],14],p,.09);rod([p[0],Math.max(.2,p[1]-4),14],p,.065);}
 rod([s*3.76,.2,14],[s*3.76,34.4,14],.10);box(.85,.26,3.8,[s*3.76,.13,14]);box(.8,.26,1.8,[s*3.76,.13,1]);
}
for(let i=3;i<24;i+=3){const a=i/24*T;rod(P(a,-3.76,-2.3),P(a,3.76,-2.3),.08);}

const bounds=new THREE.Box3(),v=new THREE.Vector3();g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];return g;
}
