// Selected C, revised after Atlas and in-game inspection.
// Reference reconstruction of the white wedge coupe in the supplied ramp film.
// Tesla-credited press views: references/racing/roadster-rebuild/research-downloads.json.
// Dimensions are inferred from photographs, not manufacturer CAD.
export default function generate(THREE) {
 const g=new THREE.Group();g.name='roadster_2026';
 const body=new THREE.Group();body.name='coachwork';g.add(body);
 const mat=(name,c,r=.4,m=.35,e=0)=>{const a=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?1.6:0,side:THREE.DoubleSide});a.name=name;return a;};
 const silver=mat('ano_white',0xdcdde0,.32,.5),side=mat('silver_flanks',0xc4c8ce,.38,.42),ink=mat('carbon',0x0c1016,.68,.15),glass=mat('bronze_glass',0x19191b,.16,.45),rubber=mat('rubber',0x111318,.93,0),steel=mat('machined_metal',0x6c727b,.3,.75),bright=mat('polished_spokes',0xcbd0d7,.27,.8),bronze=mat('nozzle_alloy',0x817465,.4,.75),red=mat('rear_light',0xff3542,.25,.25,0xff1429),white=mat('front_light',0xe7f4ff,.25,.2,0xb9deef),amber=mat('side_marker',0xe6a151,.3,.3,0x9c4210);
 function mesh(geo,m,p=[0,0,0],parent=body){const o=new THREE.Mesh(geo,m);o.position.set(...p);parent.add(o);return o;}
 const box=(w,h,d,p,m=ink,parent=body)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,parent);
 function face(p,m,parent=body){const a=[];for(let i=1;i<p.length-1;i++)a.push(...p[0],...p[i],...p[i+1]);const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(a,3));q.computeVertexNormals();return mesh(q,m,[0,0,0],parent);}
 function surface(fn,nu,nv,m,parent=body){const p=[],ix=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)p.push(...fn(i/nu,j/nv));for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;ix.push(a,c,b,b,c,d);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();return mesh(geo,m,[0,0,0],parent);}
 function rod(a,b,r,m=ink,parent=body){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,av.clone().add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function line(points,r,m=ink,parent=body){for(let i=1;i<points.length;i++)rod(points[i-1],points[i],r,m,parent);}
 function tube(r,h,p,m=steel,parent=body,axis='z'){const o=mesh(new THREE.CylinderGeometry(r,r,h,24,1,true),m,p,parent);if(axis==='z')o.rotation.x=Math.PI/2;else if(axis==='x')o.rotation.z=Math.PI/2;return o;}
 function ring(r,t,p,m=steel,parent=body,axis='z'){const o=mesh(new THREE.TorusGeometry(r,t,6,32),m,p,parent);if(axis==='x')o.rotation.y=Math.PI/2;if(axis==='y')o.rotation.x=Math.PI/2;return o;}
 const lerp=(a,b,t)=>a+(b-a)*t;
 function profile(rows,z,col){let k=0;while(k<rows.length-2&&z>rows[k+1][0])k++;const t=Math.max(0,Math.min(1,(z-rows[k][0])/(rows[k+1][0]-rows[k][0])));const prev=rows[Math.max(0,k-1)],next=rows[Math.min(rows.length-1,k+2)],a=rows[k],b=rows[k+1],span=b[0]-a[0],m0=(b[col]-prev[col])/(b[0]-prev[0])*span,m1=(next[col]-a[col])/(next[0]-a[0])*span;return (2*t*t*t-3*t*t+1)*a[col]+(t*t*t-2*t*t+t)*m0+(-2*t*t*t+3*t*t)*b[col]+(t*t*t-t*t)*m1;}
 // z, half-width, shoulder height. The front fender is above the bonnet.
 const sections=[[-2.4,1.00,.88],[-2.10,1.065,.92],[-1.52,1.07,.94],[-.85,1.025,.90],[0,1.005,.86],[.8,1.02,.85],[1.48,1.065,.90],[1.92,1.00,.75],[2.4,.875,.535]];
 const width=z=>profile(sections,z,1),shoulder=z=>profile(sections,z,2);
 const arch=z=>{let y=.18;for(const c of[-1.52,1.48]){const d=Math.abs(z-c);if(d<.457)y=Math.max(y,.42+Math.sqrt(.457*.457-d*d));}return y;};
 const hood=z=>.79-.255*Math.pow(Math.max(0,(z-1.04)/1.36),1.1);

 // C: continuous parametric body with crowned bonnet and sculpted shoulder bands.
 // Side surface lower edge follows each circular wheel opening, not a painted arch.
 for(const s of[-1,1]){
  surface((u,v)=>{const z=lerp(-2.4,2.4,u),lo=arch(z),hi=shoulder(z),y=lerp(lo,hi,v);return[s*(width(z)-.095*(1-v)**2-.02*Math.sin(v*Math.PI)),y,z];},160,6,side);
  surface((u,v)=>{const z=lerp(-2.4,2.4,u),inner=.60+.14*Math.max(0,1-Math.abs(z)/2.4),middle=z>1.04?hood(z):.86;return[s*lerp(inner,width(z),v),lerp(middle,shoulder(z),1-Math.pow(1-v,6))+.014*Math.sin(Math.PI*v),z];},80,8,silver);
 }
 surface((u,v)=>{const z=lerp(-2.4,2.4,v),w=.60+.14*Math.max(0,1-Math.abs(z)/2.4),x=(2*u-1)*w;return[x,(z>1.04?hood(z):.86)+.014*(1-(2*u-1)**2),z];},16,72,silver);


 // Small wheel-arch rolled edges and dark inner liners, open on all four corners.
 for(const s of[-1,1])for(const zc of[-1.52,1.48]){
  const pts=[];for(let k=0;k<=40;k++){const a=Math.PI*k/40,z=zc+.46*Math.cos(a);pts.push([s*(width(z)+.002),.42+.46*Math.sin(a),z]);}line(pts,.009,silver);
  surface((u,v)=>{const a=u*Math.PI,z=zc+.452*Math.cos(a);return[s*(width(z)-v*.18),.42+.452*Math.sin(a),z];},40,2,ink);
 }
 // Continuous swept glass canopy: smoothly joined windshield, roof and rear taper.
 const roof=[[-1.80,.90,.40],[-1.40,1.015,.58],[-1,1.12,.67],[-.5,1.17,.71],[0,1.17,.72],[.40,1.105,.76],[.80,.98,.80],[1.18,.864,.83]];
 const ry=z=>profile(roof,z,1),rw=z=>profile(roof,z,2),base=z=>.865+Math.max(0,-z)*.025;
 surface((u,v)=>{const z=lerp(-1.80,1.18,v),k=2*u-1;return[k*rw(z),ry(z)-.045*k*k*Math.sin(Math.PI*v),z];},16,48,glass);
 for(const s of[-1,1]){
  // Rear buttress narrows the glass instead of a thick vertical C-pillar.
  surface((u,v)=>{const z=lerp(-1.80,1.18,u),roofY=ry(z)-.045*Math.sin(Math.PI*u),w=rw(z),belt=.90+.025*Math.max(0,-z);return[s*lerp(w,belt,v),lerp(roofY,base(z),v),z];},48,4,glass);
  const rail=[],belt=[];for(let k=0;k<=64;k++){const t=k/64,z=lerp(-1.80,1.18,t);rail.push([s*rw(z),ry(z)-.045*Math.sin(Math.PI*t)+.004,z]);belt.push([s*(.90+.025*Math.max(0,-z)),base(z)+.002,z]);}line(rail,.010,silver);line(belt,.007,ink);
  surface((u,v)=>{const z=lerp(-1.95,-1.08,u),b=.90+.025*Math.max(0,-z);return[s*lerp(z< -1.80?.43:rw(z),width(z),v),lerp(z< -1.80?.885:ry(z)-.045*Math.sin(Math.PI*(z+1.80)/2.98),shoulder(z),v),z];},32,8,silver);
  // Narrow window division, inset flush handle and side camera.
  rod([s*rw(-.6),ry(-.6)-.036,-.6],[s*.917,.88,-.78],.005,ink);
  box(.014,.025,.15,[s*1.024,.791,-.65],ink);
  const seam=[];for(const p of[[.95,.82],[.86,.40],[.65,.23],[-.76,.23],[-.89,.78]])seam.push([s*(width(p[0])-.025),p[1],p[0]]);line(seam,.0035,ink);
  box(.025,.018,.18,[s*1.061,.704,1.03],amber);
  const cam=box(.055,.024,.11,[s*.969,.854,.83],ink);cam.rotation.y=s*.17;
  surface((u,v)=>[s*(.91+v*.09),.17+.035*Math.sin(Math.PI*u),lerp(-2.17,2.2,u)],40,2,ink);
  // Bonnet's two precise diagonal shut lines.
  const hoodSeam=[];for(let k=0;k<=24;k++){const z=lerp(1.18,2.39,k/24);hoodSeam.push([s*(.60+.14*(1-z/2.4)),hood(z)+.006,z]);}line(hoodSeam,.0035,ink);
 }
 // Low tapered front aperture. No invented grille bars or protruding bumper blocks.
 surface((u,v)=>{const x=(u*2-1)*lerp(.75,.84,v);return[x,lerp(.21,.53,v),2.4-.04*(2*u-1)**2];},24,4,ink);
 const nose=[];for(let k=0;k<=32;k++){const x=(k/16-1)*.83;nose.push([x,.534+.011*(1-(x/.83)**2),2.404-.04*(x/.83)**2]);}line(nose,.006,white);
 surface((u,v)=>[(u*2-1)*lerp(.95,.82,v),.172+.025*v,lerp(2.37,2.45,v)],24,2,ink);
 // Stowed triangular headlamp shutters match the ramp film; fine panel gaps remain.
 function shoulderPoint(s,z,f,lift=0){const inner=.60+.14*Math.max(0,1-Math.abs(z)/2.4),mid=z>1.04?hood(z):.86;return[s*lerp(inner,width(z),f),lerp(mid,shoulder(z),1-Math.pow(1-f,6))+.014*Math.sin(Math.PI*f)+lift,z];}
 for(const s of[-1,1]){
  surface((u,v)=>{const z=lerp(1.64,2.32,v),f=lerp(.10,.88,u)*(1-v)+.08*v;return shoulderPoint(s,z,f,.007);},10,14,silver);
  for(const f of[.10,.88]){const seam=[];for(let k=0;k<=20;k++){const v=k/20,z=lerp(1.64,2.32,v);seam.push(shoulderPoint(s,z,f*(1-v)+.08*v,.009));}line(seam,.0025,ink);}

 }
 // Tail shoulder frame, full red blade, recessed mechanically detailed lower assembly.
 surface((u,v)=>[(2*u-1)*1.00,lerp(.63,.879,v)+.012*(1-(2*u-1)**2),-2.4],32,5,silver);
 box(1.96,.065,.025,[0,.854,-2.412],ink);box(1.90,.024,.026,[0,.864,-2.429],red);
 box(.32,.14,.023,[0,.712,-2.432],silver);
 const letters={R:[[0,0,0,1],[0,1,.55,1],[.55,1,.55,.55],[.55,.55,0,.55],[.1,.55,.65,0]],D:[[0,0,0,1],[0,1,.5,.85],[.5,.85,.5,.15],[.5,.15,0,0]],S:[[.6,1,0,1],[0,1,0,.55],[0,.55,.6,.55],[.6,.55,.6,0],[.6,0,0,0]],T:[[0,1,.65,1],[.325,1,.325,0]]};
 [...'RDSTR'].forEach((c,i)=>letters[c].forEach(([x,y,u,v])=>rod([.127-i*.052-x*.039,.676+y*.075,-2.448],[.127-i*.052-u*.039,.676+v*.075,-2.448],.0023,steel)));
 // Real cavity: dark back wall set inboard, four upper rings, four lower gimbals.
 box(1.48,.38,.018,[0,.425,-2.14],ink);
 for(const s of[-1,1])face([[s*.72,.21,-2.38],[s*.84,.29,-2.43],[s*.79,.60,-2.43],[s*.64,.64,-2.43],[s*.64,.58,-2.15],[s*.7,.25,-2.15]],ink);
 line([[-.77,.25,-2.43],[-.79,.52,-2.43],[-.62,.63,-2.43],[.62,.63,-2.43],[.79,.52,-2.43],[.77,.25,-2.43]],.018,steel);
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.32;tube(.065,.18,[x,.555,-2.39],bronze);ring(.064,.006,[x,.555,-2.486],steel);
  mesh(new THREE.CircleGeometry(.054,24),ink,[x,.555,-2.28]).rotation.y=Math.PI;
  const ball=mesh(new THREE.SphereGeometry(.108,20,12),mat('gimbal_housing',0x353c45,.55,.42),[x,.344,-2.29]);ball.scale.set(1,1,.78);
  ring(.077,.016,[x,.344,-2.377],ink);tube(.038,.035,[x,.35,-2.36],ink);ring(.041,.005,[x,.35,-2.381],steel);
  for(const s of[-1,1])rod([x+s*.105,.28,-2.31],[x+s*.078,.40,-2.31],.014,ink);
  if(i<3)box(.014,.21,.22,[x+.16,.35,-2.25],steel);
 }
 face([[-.76,.20,-2.40],[.76,.20,-2.40],[.70,.29,-2.46],[-.70,.29,-2.46]],ink);
 for(const s of[-1,1]){
  rod([s*.87,.25,-2.22],[s*.87,.55,-2.22],.045,steel);
  ring(.055,.01,[s*.87,.24,-2.22],bronze,body,'y');
 }
 // Flush underbody nozzles match the runtime cold-gas emitters.
 box(1.65,.048,3.93,[0,.18,0],ink);
 for(const x of[-.82,.82])for(const z of[-1.5,1.5]){
  mesh(new THREE.CylinderGeometry(.072,.09,.12,20),steel,[x,.16,z]);
  ring(.079,.009,[x,.10,z],bronze,body,'y');const bore=mesh(new THREE.CircleGeometry(.065,24),ink,[x,.098,z]);bore.rotation.x=Math.PI/2;
 }
 for(const x of[-.5,0,.5])box(.42,.018,2.8,[x,.146,0],steel);
 for(let z=-1.8;z<=1.8;z+=.3)box(1.42,.012,.022,[0,.13,z],ink);
 // Source film's stowed active aero, with a separately transformable wing joint.
 const wing=new THREE.Group();wing.name='rear_wing';wing.position.set(0,.918,-2.12);g.add(wing);
 surface((u,v)=>[(2*u-1)*1.018,-.025*(2*u-1)**2+.012*Math.sin(v*Math.PI),lerp(-.24,.16,v)],36,5,silver,wing);
 for(const s of[-1,1])rod([s*.54,-.055,.06],[s*.54,-.005,-.01],.012,steel,wing);
 // Four independent wheel pivots. Swept five-part machined spoke assemblies.
 for(const s of[-1,1])for(const z of[-1.52,1.48]){
  const w=new THREE.Group();w.name=`wheel_${s<0?'l':'r'}_${z>0?'f':'r'}`;w.position.set(s*.91,.42,z);g.add(w);
  const half=z<0?.17:.15;
  // Lathed tire section around X: rounded shoulders, low profile and inset bead.
  const tp=[[-half,.335],[-half,.38],[-half+.02,.411],[-half+.045,.42],[half-.045,.42],[half-.02,.411],[half,.38],[half,.335]];
  surface((u,v)=>{const k=Math.min(tp.length-2,Math.floor(v*(tp.length-1))),t=v*(tp.length-1)-k,x=lerp(tp[k][0],tp[k+1][0],t),r=lerp(tp[k][1],tp[k+1][1],t),a=u*Math.PI*2;return[x,Math.cos(a)*r,Math.sin(a)*r];},48,14,rubber,w);
  tube(.335,half*2,[0,0,0],steel,w,'x');ring(.324,.009,[s*(half+.006),0,0],bright,w,'x');
  const disc=mesh(new THREE.CylinderGeometry(.247,.247,.015,40),steel,[s*(half-.035),0,0],w);disc.rotation.z=Math.PI/2;
  for(let k=0;k<16;k++){const a=k*Math.PI/8;const d=mesh(new THREE.CircleGeometry(.009,6),ink,[s*(half-.025),Math.sin(a)*.20,Math.cos(a)*.20],w);d.rotation.y=s*Math.PI/2;}
  box(.044,.13,.055,[s*(half-.018),.03,-.233],ink,w);
  for(let k=0;k<5;k++){
   const a=k*Math.PI*2/5,arm=new THREE.Group();arm.rotation.x=a;w.add(arm);
   const plane=s*(half+.012);
   face([[plane,-.035,.055],[plane,.045,.08],[plane,.114,.306],[plane,.015,.322],[plane,-.022,.192]],bright,arm);
   face([[plane+.003*s,.018,.095],[plane+.003*s,.066,.123],[plane+.003*s,.092,.283],[plane+.003*s,.053,.292]],ink,arm);
   rod([plane,-.023,.075],[plane,-.052,.30],.010,steel,arm);
  }
  const hub=mesh(new THREE.CylinderGeometry(.059,.059,.018,24),ink,[s*(half+.021),0,0],w);hub.rotation.z=Math.PI/2;
  for(let k=0;k<5;k++){const a=k*2*Math.PI/5;mesh(new THREE.SphereGeometry(.008,6,4),steel,[s*(half+.033),Math.sin(a)*.04,Math.cos(a)*.04],w);}
  for(const x of[-half*.4,half*.4])ring(.421,.002,[x,0,0],ink,w,'x');
 }
 g.userData.dimensions={width:2.18,height:1.18,depth:4.94};
 // Normalize against transformed vertices, not conservative rotated primitive boxes.
 g.updateMatrixWorld(true);const bounds=new THREE.Box3(),v=new THREE.Vector3();
 g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
 const c=bounds.getCenter(new THREE.Vector3());for(const o of g.children){o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;}
 return g;
}
