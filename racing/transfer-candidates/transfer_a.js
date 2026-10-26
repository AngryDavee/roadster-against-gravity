// 404 candidate; Atlas ramp study + source overhang. Strategy a
export default function(THREE){
 const g=new THREE.Group();
 const mat=(c,r=.72,m=.12,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?1.6:0,side:THREE.DoubleSide,flatShading:true});
 const concrete=mat(0x9696a3,.89,.06),steel=mat(0x424858,.55,.65),edge=mat(0xbfc4cd,.65,.4),ink=mat(0x202733),red=mat(0xb53a4a,.4,.2,0xff2038),white=mat(0xd0e4ef,.3,.1,0x88b9d4);concrete.name='stone';
 const add=(geo,m,p)=>{const o=new THREE.Mesh(geo,m);if(p)o.position.copy(p);g.add(o);return o;};
 const rod=(a,b,r=.10,m=steel)=>{const d=b.clone().sub(a),o=add(new THREE.CylinderGeometry(r,r,d.length(),6),m,a.clone().add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;};
 const box=(size,p,m=steel)=>add(new THREE.BoxGeometry(...size),m,p);
 const center=u=>{const a=u*2.3,y=20.4*(1-Math.cos(a));return new THREE.Vector3(100*u*u*u*(u*(u*6-15)+10),y,20.4*Math.sin(a)-.55*y);};
 const frame=u=>{const p=center(u),t=center(Math.min(1,u+.00001)).sub(center(Math.max(0,u-.00001))).normalize(),n=new THREE.Vector3(-t.z,0,t.x).normalize(),up=n.clone().cross(t).normalize();return {p,t,n,up};};
 const P=(u,x,y=0)=>{const f=frame(u);return f.p.addScaledVector(f.n,x).addScaledVector(f.up,y);};
 const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0].toArray(),...pts[i].toArray(),...pts[i+1].toArray());const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(a.length===18?[0,0,1,0,1,1,0,0,1,1,0,1]:new Array(a.length/3*2).fill(0),2));geo.computeVertexNormals();return add(geo,m);};

 // A: continuous indexed closed deck extrusion, supported by arch ribs.
 const verts=[],indices=[],N=160;for(let i=0;i<=N;i++)for(const [x,y]of[[-3.6,0],[3.6,0],[3.6,-.35],[-3.6,-.35]])verts.push(...P(i/N,x,y).toArray());
 for(let i=0;i<N;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4;indices.push(a,b,a+4,b,b+4,a+4);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();add(geo,concrete);
 for(let i=0;i<80;i++)for(const s of[-1,1])rod(P(i/80,s*3.62,.08),P((i+1)/80,s*3.62,.08),.06,red);
 for(let i=1;i<17;i++){const u=i/17;rod(P(u,-3.8,-.5),P(u,3.8,-.5),.24);for(const s of[-1,1]){const a=P(u,s*(u>.8?15:4.3),-.7);const foot=a.clone();foot.y=0;if(a.y>1)rod(foot,a,.30,edge);rod(a,P(u,s*3.8,-.4),.2);}}

 // Source-origin restoration keeps the runtime curve and visible deck identical.
 const bounds=new THREE.Box3().setFromObject(g),c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];g.userData.curve={span:100,radius:20.4,angle:2.3,width:7.2};return g;
}
