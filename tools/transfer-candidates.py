"""Three construction strategies using the Atlas truss study and source ramp profile."""
from pathlib import Path
out=Path('racing/transfer-candidates');out.mkdir(exist_ok=True)
common=r'''export default function(THREE){
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
'''
end=r'''
 // Source-origin restoration keeps the runtime curve and visible deck identical.
 const bounds=new THREE.Box3().setFromObject(g),c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];g.userData.curve={span:100,radius:20.4,angle:2.3,width:7.2};return g;
}
'''
A=r'''
 // A: continuous indexed closed deck extrusion, supported by arch ribs.
 const verts=[],indices=[],N=160;for(let i=0;i<=N;i++)for(const [x,y]of[[-3.6,0],[3.6,0],[3.6,-.35],[-3.6,-.35]])verts.push(...P(i/N,x,y).toArray());
 for(let i=0;i<N;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4;indices.push(a,b,a+4,b,b+4,a+4);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();add(geo,concrete);
 for(let i=0;i<80;i++)for(const s of[-1,1])rod(P(i/80,s*3.62,.08),P((i+1)/80,s*3.62,.08),.06,red);
 for(let i=1;i<17;i++){const u=i/17;rod(P(u,-3.8,-.5),P(u,3.8,-.5),.24);for(const s of[-1,1]){const a=P(u,s*(u>.8?15:4.3),-.7);const foot=a.clone();foot.y=0;if(a.y>1)rod(foot,a,.30,edge);rod(a,P(u,s*3.8,-.4),.2);}}
'''
B=r'''
 // B: separate tapered concrete panels with continuous Warren-truss edges.
 const N=112;for(let i=0;i<N;i++){const a=i/N,b=(i+1)/N;face([P(a,-3.6),P(a,3.6),P(b,3.6),P(b,-3.6)],concrete);face([P(b,-3.6,-.30),P(b,3.6,-.30),P(a,3.6,-.30),P(a,-3.6,-.30)],steel);face([P(a,-.055,.018),P(a,.055,.018),P(b,.055,.018),P(b,-.055,.018)],edge);
 for(const s of[-1,1]){face([P(a,s*3.6),P(b,s*3.6),P(b,s*3.6,-.30),P(a,s*3.6,-.30)],edge);rod(P(a,s*3.63,.07),P(b,s*3.63,.07),.045,red);}if(i%4===0)rod(P(a,-3.6,.015),P(a,3.6,.015),.018,ink);}
 for(let i=0;i<38;i++){const a=i/38,b=(i+1)/38;for(const s of[-1,1]){rod(P(a,s*3.8,-.4),P(b,s*3.8,-.4),.13);rod(P(a,s*3.8,-2.1),P(b,s*3.8,-2.1),.14);rod(P(a,s*3.8,-.4),P(b,s*3.8,-2.1),.09);rod(P(a,s*3.8,-2.1),P(b,s*3.8,-.4),.09);}rod(P(a,-3.8,-2.1),P(a,3.8,-2.1),.11);}
 for(const u of [.32,.46,.6,.74,.88,.98]){const f=frame(u),span=u>.8?15:5.7;for(const s of[-1,1]){const top=P(u,s*span,-2.5),foot=top.clone();foot.y=.25;const h=Math.max(.2,top.y-.25);box([.8,h,.9],new THREE.Vector3(top.x,.25+h/2,top.z),edge);box([3,.25,3],new THREE.Vector3(top.x,.125,top.z),concrete);rod(top,P(u,s*3.8,-2.1),.18);if(h>4){const side=foot.clone().addScaledVector(f.t,4);side.y=.2;rod(side,top,.16);box([2,.25,2],side.clone().setY(.125),concrete);}}
 if(u>.8)rod(P(u,-span,-2.5),P(u,span,-2.5),.22);}
 for(let i=4;i<52;i+=3)for(const s of[-1,1]){const p=P(i/52,s*3.3,.08);box([.18,.08,.42],p,white);}
'''
C=r'''
 // C: individually oriented solid precast segments and paired portal frames.
 for(let i=0;i<72;i++){const a=center(i/72),b=center((i+1)/72),f=frame((i+.5)/72),o=box([7.2,.42,a.distanceTo(b)+.08],a.clone().add(b).multiplyScalar(.5),concrete);o.rotation.set(-Math.atan2(f.t.y,Math.hypot(f.t.x,f.t.z)),Math.atan2(f.t.x,f.t.z),0,'YXZ');o.position.addScaledVector(f.up,-.21);for(const s of[-1,1])rod(P(i/72,s*3.65,.08),P((i+1)/72,s*3.65,.08),.065,red);}
 for(let i=3;i<18;i++){const u=i/18,span=u>.8?15:5.5;for(const s of[-1,1]){const p=P(u,s*span,-1.7),h=Math.max(.1,p.y);box([1.25,h,1.25],new THREE.Vector3(p.x,h/2,p.z),edge);box([3,.3,3],new THREE.Vector3(p.x,.15,p.z),concrete);rod(p,P(u,s*3.6,-.6),.3);}rod(P(u,-span,-1.7),P(u,span,-1.7),.3);}
'''
for name,body in [('a',A),('b',B),('c',C)]:
 (out/f'transfer_{name}.js').write_text('// 404 candidate; Atlas ramp study + source overhang. Strategy '+name+'\n'+common+body+end)
print('Wrote three independent ramp construction candidates.')
