"""Write three construction strategies per reference-driven venue asset.
Shared palette/helpers are style constraints, not imported geometry assets.
"""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
header='''export default function(THREE){
const g=new THREE.Group();
const mat=(c,r=.7,m=.1,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?2.5:0,side:THREE.DoubleSide,flatShading:true});
const ink=mat(0x151822),steel=mat(0x55576b,.6,.6),silver=mat(0xa3a1b1,.8,.15),red=mat(0xff3347,.4,.1,0xff152b),white=mat(0xdce9ff,.35,.2,0xe2efff),ground=mat(0x11151f,.85,.05);
const mesh=(geo,m,p=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);g.add(o);return o;};
const box=(w,h,d,p,m=steel)=>mesh(new THREE.BoxGeometry(w,h,d),m,p);
const rod=(a,b,r=.05,m=steel)=>{a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const v=b.clone().sub(a);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,a.clone().add(b).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
const face=(pts,m)=>{const a=[];for(let i=1;i<pts.length-1;i++)a.push(...pts[0],...pts[i],...pts[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return mesh(geo,m);};
'''
footer='''
const bounds=new THREE.Box3(),v=new THREE.Vector3();g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});g.userData.sourceOrigin=[c.x,bounds.min.y,c.z];return g;
}
'''
strategies={}
strategies['ramp']=[
('a','Stacked angled slabs with an orthogonal support tower','''
const R=20.4,N=38,W=7.2,T=2.3;
for(let i=0;i<N;i++){const a=(i+.5)/N*T,y=R*(1-Math.cos(a)),z=R*Math.sin(a);const deck=box(W,.24,R*T/N+.04,[0,y,z],silver);deck.rotation.x=-a;for(const s of [-1,1]){const edge=box(.07,.06,R*T/N,[s*W/2,y+.15*Math.cos(a),z-.15*Math.sin(a)],red);edge.rotation.x=-a;}}
for(const s of [-1,1]){for(let y=0;y<34;y+=3){rod([s*3.45,y,21.5],[s*3.45,y+3,21.5],.11);rod([s*3.45,y,15],[s*3.45,y+3,21.5],.07);}box(.8,.3,10,[s*3.5,.15,18]);}
'''),
('b','Extruded continuous side profile and explicit triangular trusses','''
const R=20.4,T=2.3,W=7.2,sh=new THREE.Shape();sh.moveTo(0,0);for(let i=0;i<=80;i++){const a=i/80*T;sh.lineTo(R*Math.sin(a),R*(1-Math.cos(a)));}for(let i=80;i>=0;i--){const a=i/80*T;sh.lineTo((R+.28)*Math.sin(a),R-(R+.28)*Math.cos(a));}sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:W,bevelEnabled:false});geo.rotateY(-Math.PI/2);geo.translate(W/2,0,0);mesh(geo,silver);
for(const s of [-1,1])for(let i=0;i<34;i++){const a=i/34*T,b=(i+1)/34*T,p=[s*3.64,R*(1-Math.cos(a)),R*Math.sin(a)],q=[s*3.64,R*(1-Math.cos(b)),R*Math.sin(b)];rod(p,q,.055,red);if(i%3===0){rod(p,[s*3.65,p[1],24],.09);rod(p,[s*3.65,Math.max(0,p[1]-3.4),24],.075);}}for(const s of [-1,1])rod([s*3.65,0,24],[s*3.65,34,24],.12);
'''),
('c','Parametric paneled ribbon with attached curved rail and braced spine','''
const R=20.4,T=2.3,W=7.2,N=92;
const P=(a,x,offset=0)=>[x,Math.max(.025,R*(1-Math.cos(a))+offset*Math.cos(a)),R*Math.sin(a)-offset*Math.sin(a)-.55*R*(1-Math.cos(a))];
const concrete=mat(0x898994,.88,.08);concrete.name='stone';
for(let i=0;i<N;i++){const a=i/N*T,b=(i+1)/N*T;face([P(a,-W/2),P(a,W/2),P(b,W/2),P(b,-W/2)],concrete);face([P(b,-W/2,-.22),P(b,W/2,-.22),P(a,W/2,-.22),P(a,-W/2,-.22)],steel);face([P(a,-.042,.012),P(a,.042,.012),P(b,.042,.012),P(b,-.042,.012)],silver);for(const s of [-1,1]){face([P(a,s*W/2),P(b,s*W/2),P(b,s*W/2,-.22),P(a,s*W/2,-.22)],steel);rod(P(a,s*(W/2+.02),.035),P(b,s*(W/2+.02),.035),.038,red);}
if(i%5===0){rod(P(a,-W/2,.013),P(a,W/2,.013),.009,ink);for(const x of [-2.6,2.6])mesh(new THREE.SphereGeometry(.025,5,4),steel,P(a,x,.02));}}
for(const s of [-1,1]){
 for(let i=0;i<23;i++){const a=i/23*T,b=(i+1)/23*T;rod(P(a,s*3.76,-.22),P(b,s*3.76,-.22),.09);rod(P(a,s*3.76,-2.3),P(b,s*3.76,-2.3),.10);rod(P(a,s*3.76,-.22),P(b,s*3.76,-2.3),.055);rod(P(a,s*3.76,-2.3),P(b,s*3.76,-.22),.055);}
 for(let i=3;i<24;i+=3){const a=i/24*T,p=P(a,s*3.76,-2.3);rod([p[0],p[1],14],p,.09);rod([p[0],Math.max(.2,p[1]-4),14],p,.065);}
 rod([s*3.76,.2,14],[s*3.76,34.4,14],.10);box(.85,.26,3.8,[s*3.76,.13,14]);box(.8,.26,1.8,[s*3.76,.13,1]);
}
for(let i=3;i<24;i+=3){const a=i/24*T;rod(P(a,-3.76,-2.3),P(a,3.76,-2.3),.08);}
''')]
strategies['floodlight']=[
('a','Rectangular stand and bank of flat lamp housings','''box(1.6,.2,1.1,[0,.1,0]);box(.14,6,.14,[0,3.2,0]);box(2.6,.5,.28,[0,6.3,0]);for(let i=0;i<6;i++){box(.32,.32,.04,[(i-2.5)*.42,6.3,.16],white);box(.36,.36,.04,[(i-2.5)*.42,6.3,-.16],ink);}for(const s of [-1,1])rod([0,1,0],[s*.7,0,s*.4],.07);'''),
('b','Tripod tower with circular recessed lamps','''for(let k=0;k<3;k++){let a=k*Math.PI*2/3;rod([Math.cos(a)*1.1,0,Math.sin(a)*1.1],[0,4.8,0],.07);}rod([0,0,0],[0,6.4,0],.075);rod([-1.3,6.4,0],[1.3,6.4,0],.065);for(let k=0;k<5;k++){let x=(k-2)*.5;const o=mesh(new THREE.CylinderGeometry(.20,.22,.28,12),ink,[x,6.4,0]);o.rotation.x=Math.PI/2;const lens=mesh(new THREE.CircleGeometry(.17,12),white,[x,6.4,.151]);}'''),
('c','Lattice mast with angled framed reflector fixtures','''for(const x of [-.17,.17])for(const z of [-.17,.17])rod([x,.1,z],[x,6.2,z],.035);for(let y=.2;y<6.2;y+=.55)for(const s of [-1,1]){rod([-.17,y,s*.17],[.17,y+.55,s*.17],.02);rod([s*.17,y,-.17],[s*.17,y+.55,.17],.02);}for(let k=0;k<3;k++){const a=k*Math.PI*2/3;rod([0,1.2,0],[Math.cos(a)*1.0,.08,Math.sin(a)*1.0],.055);}box(.6,.14,.6,[0,.07,0],ink);rod([-1.5,6.25,0],[1.5,6.25,0],.06);for(let k=0;k<6;k++){const x=(k-2.5)*.48;box(.41,.32,.23,[x,6.30,0],ink);box(.35,.25,.03,[x,6.30,.13],silver);box(.29,.19,.018,[x,6.30,.15],white);for(const s of [-1,1])box(.015,.29,.035,[x+s*.19,6.30,.14],steel);rod([x,6.12,0],[x,6.05,.20],.03);}''')]
strategies['boundary']=[
('a','Solid low barrier with luminous cap','''box(6,.4,.35,[0,.2,0],ink);box(6,.045,.05,[0,.42,.20],red);for(let i=0;i<5;i++)box(.10,.60,.10,[(i-2)*1.4,.30,0]);'''),
('b','Tubular rails and individual reflector posts','''for(let i=0;i<5;i++){const x=(i-2)*1.45;rod([x,0,0],[x,.65,0],.045);box(.35,.05,.35,[x,.025,0],ink);box(.075,.16,.08,[x,.55,.05],white);}rod([-2.9,.18,0],[2.9,.18,0],.025);rod([-2.9,.42,0],[2.9,.42,0],.026,red);'''),
('c','Segmented illuminated safety boundary with bolted feet','''for(let i=0;i<6;i++){const x=(i-2.5);box(.94,.19,.25,[x,.13,0],ink);box(.96,.033,.04,[x,.24,.145],red);box(.04,.24,.31,[x-.46,.12,0],steel);for(const s of [-1,1]){box(.23,.035,.43,[x+s*.3,.018,0],steel);mesh(new THREE.SphereGeometry(.02,6,4),silver,[x+s*.3,.045,.16]);}box(.045,.025,.045,[x,.28,0],white);}''')]
strategies['pavement']=[
('a','Simple scored pavement slabs','''ground.name='ground';box(120,.16,120,[0,.08,0],ground);for(let i=-5;i<=5;i++)box(120,.003,.02,[0,.162,i*10],ink);'''),
('b','Tiled pavement mass with narrow seam channels','''ground.name='ground';for(let x=-6;x<6;x++)for(let z=-6;z<6;z++)box(9.99,.16,9.99,[x*10+5,.08,z*10+5],ground);'''),
('c','Single ground slab with independently scored joints and embedded marker strips','''ground.name='ground';box(140,.18,140,[0,.09,0],ground);for(let i=-6;i<=6;i++){box(140,.002,.014,[0,.181,i*10],ink);box(.014,.002,140,[i*10,.181,0],ink);}for(let i=-6;i<6;i++)for(let j=0;j<2;j++)box(.009,.003,1.5,[i*10+2+j*1.2,.182,i*4],steel);''')]
previous=json.loads((root/'references/candidates.json').read_text())
manifest=[entry for entry in previous if entry.get('family')=='servicevan']
for family,candidates in strategies.items():
 for suffix,method,code in candidates:
  name=f'{family}_{suffix}.js';(root/'candidates'/name).write_text('// 404 reference-driven candidate: '+method+'\n'+header+code+footer)
  manifest.append({'module':name,'family':family,'strategy':method,'reference':'supplied ramp film: frames 0, 240, 672, 743; style-lock applies'})
for suffix,method in [('a','Primitive mass assembly'),('b','Extruded side profiles'),('c','Sectional coachwork and detailed mechanical assemblies')]:manifest.append({'module':f'roadster_{suffix}.js','family':'roadster','strategy':method,'reference':'supplied car stills + source frames 0/492/672 + official Track Mode film'})
(root/'references/candidates.json').write_text(json.dumps(manifest,indent=2))
print(f'Indexed {len(manifest)} candidates; retained hand-authored servicevan entries. Review diffs before replacing final assets.')
