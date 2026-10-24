// 404 candidate C: sectional coachwork and separately articulated mechanical assemblies.
// References: supplied Roadster front/rear stills, stunt F0/F492/F672, Tesla Track Mode side views.
export default function generate(THREE) {
  const g=new THREE.Group();g.name='roadster';
  const body=new THREE.Group();body.name='coachwork';g.add(body);
  const mat=(c,r=.55,m=.18,e=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e,emissiveIntensity:e?2.3:0,flatShading:true,side:THREE.DoubleSide});
  const silver=mat(0xd8dce5,.42,.25),side=mat(0xc6c4d5,.52,.22),highlight=mat(0xf1e8e7,.42,.3),ink=mat(0x10131c,.82,.1),glass=mat(0x111b29,.18,.65),rubber=mat(0x13141b,.94,0),steel=mat(0x596270,.4,.7),bronze=mat(0x857260,.52,.7),red=mat(0xff3045,.28,.2,0xff2139),white=mat(0xbfe7ff,.22,.4,0xc7eaff),amber=mat(0xe7a65d,.4,.2,0xbd6320);
  function mesh(geo,m,p=[0,0,0],parent=body){const o=new THREE.Mesh(geo,m);o.position.set(...p);parent.add(o);return o;}
  const box=(w,h,d,p,m=ink,parent=body)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,parent);
  function face(points,m,parent=body){const geo=new THREE.BufferGeometry(),a=[];for(let i=1;i<points.length-1;i++)a.push(...points[0],...points[i],...points[i+1]);geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));geo.computeVertexNormals();return mesh(geo,m,[0,0,0],parent);}
  function rod(a,b,r,m=ink,parent=body){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,av.clone().add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function tube(r,h,p,m=steel,parent=body,axis='z'){const o=mesh(new THREE.CylinderGeometry(r,r*.96,h,20,1,true),m,p,parent);o.rotation[axis==='z'?'x':'z']=Math.PI/2;return o;}
  // Longitudinal sections preserve the wedge's planar shoulders and narrowing nose.
  const sections=[[-2.36,.93,.74],[-1.65,1.02,.84],[-.70,.96,.81],[.60,.95,.79],[1.52,1.01,.70],[2.38,.86,.49]];
  const rings=sections.map(([z,w,h])=>[[-w*.88,.25,z],[-w,.43,z],[-w,h-.07,z],[-w*.73,h,z],[w*.73,h,z],[w,h-.07,z],[w,.43,z],[w*.88,.25,z]]);
  for(let j=0;j<rings.length-1;j++)for(let k=0;k<8;k++)face([rings[j][k],rings[j][(k+1)%8],rings[j+1][(k+1)%8],rings[j+1][k]],k===3?silver:k<2||k>5?ink:side);
  face(rings[0].slice().reverse(),side);face(rings.at(-1),ink);
  // Hood and rear deck: deliberate negative panel gaps and raised silver planes.
  face([[-.65,.80,.55],[.65,.80,.55],[.61,.51,2.31],[-.61,.51,2.31]],silver);
  for(const s of [-1,1]){
    rod([s*.65,.804,.55],[s*.61,.515,2.31],.008);
    face([[s*.65,.8,.55],[s*.95,.73,.73],[s*.86,.50,2.36],[s*.61,.51,2.31]],s===1?highlight:silver);
    box(.043,.16,3.55,[s*.98,.30,-.12],ink);
    box(.022,.04,1.43,[s*.977,.69,-.18],steel);
    rod([s*.969,.75,.5],[s*.972,.39,.49],.009);
    rod([s*.965,.39,.49],[s*.97,.39,-.85],.009);
    rod([s*.97,.39,-.85],[s*.96,.77,-.97],.009);
    box(.018,.035,.16,[s*.983,.702,-.61],ink);
    box(.024,.035,.16,[s*1.019,.70,1.10],amber);
    for(let i=0;i<4;i++)box(.014,.012,.125,[s*.89,.823,-1.72+i*.15],ink);
    // Fender rims are structural lips rather than wheel-covering solid blocks.
    for(const z of [-1.5,1.5]){
      const arch=mesh(new THREE.TorusGeometry(.425,.028,5,18,Math.PI),silver,[s*1.022,.39,z]);arch.rotation.y=Math.PI/2;
      for(let k=0;k<5;k++){const a=k*Math.PI/4;const stud=mesh(new THREE.SphereGeometry(.011,5,4),steel,[s*1.052,.39+Math.sin(a)*.44,z+Math.cos(a)*.44]);}
    }
  }
  // Black glazed canopy and thin bright pillars.
  const fl=[-.78,.83,.70],fr=[.78,.83,.70],rl=[-.65,1.27,.03],rr=[.65,1.27,.03];
  face([fl,fr,rr,rl],glass);
  face([rl,rr,[.64,1.25,-.89],[-.64,1.25,-.89]],glass);
  face([[-.64,1.25,-.89],[.64,1.25,-.89],[.76,.84,-1.71],[-.76,.84,-1.71]],glass);
  for(const s of [-1,1]){
    face([[s*.79,.83,.63],[s*.66,1.255,.01],[s*.65,1.24,-.85],[s*.87,.83,-1.42]],glass);
    rod([s*.79,.83,.70],[s*.65,1.28,.03],.024,silver);
    rod([s*.65,1.28,.03],[s*.64,1.265,-.89],.019,silver);
    rod([s*.64,1.265,-.89],[s*.89,.84,-1.54],.041,silver);
    rod([s*.80,.827,.64],[s*.90,.827,-1.46],.018,ink);
    rod([s*.659,1.25,-.54],[s*.848,.835,-.54],.014,ink);
    // Small side camera/indicator housing, not oversized conventional mirrors.
    box(.095,.035,.10,[s*.98,.81,.62],ink);
  }
  rod(rl,rr,.014,ink);rod([-.64,1.26,-.89],[.64,1.26,-.89],.012,ink);
  box(.022,.014,.20,[0,1.274,-.49],ink);
  // Front fascia: dark full-width aperture, uninterrupted thin light strip, splitter.
  box(1.75,.19,.07,[0,.355,2.36],ink);
  box(1.73,.026,.035,[0,.496,2.402],white);
  box(1.91,.035,.23,[0,.235,2.31],ink);
  for(const s of [-1,1])box(.11,.07,.055,[s*.805,.455,2.395],white);
  for(let i=-5;i<=5;i++)box(.014,.115,.04,[i*.137,.345,2.405],steel);
  // Rear strip and contrasting recessed machinery frame.
  box(1.90,.11,.045,[0,.722,-2.376],ink);
  box(1.81,.027,.048,[0,.744,-2.403],red);
  box(.34,.17,.026,[0,.588,-2.414],silver);
  box(.30,.135,.014,[0,.59,-2.434],highlight);
  // RDSTR plate lettering is built from strokes; no font/image texture.
  const letters={R:[[0,0,0,1],[0,1,.55,1],[.55,1,.55,.55],[.55,.55,0,.55],[.1,.55,.65,0]],D:[[0,0,0,1],[0,1,.5,.85],[.5,.85,.5,.15],[.5,.15,0,0]],S:[[.6,1,0,1],[0,1,0,.55],[0,.55,.6,.55],[.6,.55,.6,0],[.6,0,0,0]],T:[[0,1,.65,1],[.325,1,.325,0]]};
  [...'RDSTR'].forEach((c,i)=>letters[c].forEach(([x,y,u,v])=>rod([.126-i*.052-x*.043,.548+y*.08,-2.444],[.126-i*.052-u*.043,.548+v*.08,-2.444],.0028,steel)));
  box(1.47,.33,.13,[0,.335,-2.39],ink);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.31;tube(.062,.16,[x,.442,-2.48],steel);tube(.048,.12,[x,.442,-2.494],ink);
    const lip=mesh(new THREE.TorusGeometry(.061,.008,6,20),bronze,[x,.442,-2.565]);
    box(.018,.17,.26,[x+.14,.285,-2.35],steel);
    tube(.07,.035,[x,.28,-2.39],ink);
  }
  for(const s of [-1,1]){
    rod([s*.76,.21,-2.37],[s*.76,.44,-2.37],.023,steel);
    tube(.065,.22,[s*.82,.28,-1.91],steel,body,'y').rotation.set(0,0,0);
    mesh(new THREE.TorusGeometry(.069,.009,6,18),steel,[s*.82,.16,-1.91]).rotation.x=Math.PI/2;
  }
  // Four flush cold-gas outlets align with the separate runtime effect emitters.
  for(const x of [-.82,.82])for(const z of [-1.5,1.5]){
    const shroud=mesh(new THREE.CylinderGeometry(.095,.11,.13,12),steel,[x,.15,z]);
    const bore=mesh(new THREE.CircleGeometry(.072,16),ink,[x,.080,z]);bore.rotation.x=Math.PI/2;
    const rim=mesh(new THREE.TorusGeometry(.09,.012,6,18),silver,[x,.079,z]);rim.rotation.x=Math.PI/2;
  }
  // Undertray grid, cooling channels and articulated suspension details.
  box(1.70,.055,3.92,[0,.235,-.08],ink);
  for(let z=-1.7;z<1.7;z+=.45)for(const x of [-.48,0,.48])box(.42,.02,.37,[x,.195,z],steel);
  for(const x of [-.76,.76])box(.036,.05,3.73,[x,.21,-.05],bronze);
  for(let z=-1.8;z<1.8;z+=.25)box(1.37,.012,.025,[0,.18,z],ink);
  // Low wing state in the ramp footage. Its joint is available for separate studio inspection.
  const wing=new THREE.Group();wing.name='rear_wing';wing.position.set(0,.825,-2.0);g.add(wing);
  box(1.98,.045,.33,[0,0,0],silver,wing);
  for(const s of [-1,1]){box(.023,.095,.36,[s*.98,.015,0],ink,wing);box(.035,.10,.05,[s*.53,-.06,.02],steel,wing);}
  // Wheels: independent groups retain spin after loading with keepHierarchy.
  const wheels={};
  for(const s of [-1,1])for(const z of [-1.5,1.5]){
    const wheel=new THREE.Group();wheel.name=`wheel_${s<0?'l':'r'}_${z>0?'f':'r'}`;wheel.position.set(s*.89,.39,z);g.add(wheel);wheels[wheel.name]=wheel;
    const tire=mesh(new THREE.CylinderGeometry(.39,.39,.27,32,1),rubber,[0,0,0],wheel);tire.rotation.z=Math.PI/2;
    const rim=mesh(new THREE.CylinderGeometry(.294,.294,.018,24),steel,[s*.143,0,0],wheel);rim.rotation.z=Math.PI/2;
    const recess=mesh(new THREE.CylinderGeometry(.263,.263,.024,24),ink,[s*.156,0,0],wheel);recess.rotation.z=Math.PI/2;
    const disc=mesh(new THREE.CylinderGeometry(.218,.218,.013,24),bronze,[s*.171,0,0],wheel);disc.rotation.z=Math.PI/2;
    for(let k=0;k<5;k++){
      const a=k*Math.PI*2/5;const arm=new THREE.Group();arm.rotation.x=a;wheel.add(arm);
      face([[s*.187,-.045,.045],[s*.187,.036,.075],[s*.187,.07,.278],[s*.187,-.005,.278]],silver,arm);
      rod([s*.19,-.034,.055],[s*.19,.006,.276],.008,ink,arm);
    }
    const hub=mesh(new THREE.CylinderGeometry(.065,.065,.027,12),steel,[s*.20,0,0],wheel);hub.rotation.z=Math.PI/2;
    const edge=mesh(new THREE.TorusGeometry(.29,.013,6,28),silver,[s*.183,0,0],wheel);edge.rotation.y=Math.PI/2;
    for(let k=0;k<20;k++){
      const a=k*Math.PI*2/20;const t=box(.275,.009,.022,[0,Math.cos(a)*.391,Math.sin(a)*.391],ink,wheel);t.rotation.x=a;
    }
  }
  g.userData.wheels=wheels;g.userData.wing=wing;g.userData.body=body;
  // Bounds from actual vertices, per the 404 asset contract.
  const bounds=new THREE.Box3(),v=new THREE.Vector3();g.updateMatrixWorld(true);
  g.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
  const c=bounds.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});
  return g;
}
