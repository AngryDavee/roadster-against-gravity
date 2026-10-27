// 404 editable reconstruction: precision revision of selected continuous coachwork C.
// Shape references: Tesla-credited Car and Driver exterior gallery, and user's ramp film.
// All dimensions are inferred; no downloaded meshes or baked photo textures.
export default function generate(THREE) {
 const root=new THREE.Group();root.name='roadster_precision';
 const body=new THREE.Group();body.name='coachwork';root.add(body);
 const material=(name,color,roughness,metalness,emissive=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity:emissive?1.8:0,side:THREE.DoubleSide});m.name=name;return m;};
 const paint=material('ano_silver',0xdadce0,.29,.58),flank=material('ano_flank',0xcbd0d6,.32,.52),black=material('carbon',0x090d13,.48,.23),rubber=material('rubber',0x101216,.91,.0),glass=new THREE.MeshPhysicalMaterial({color:0x211b18,roughness:.22,metalness:0,specularIntensity:.18,reflectivity:.25,side:THREE.DoubleSide}),alloy=material('machined_alloy',0xb7bcc2,.25,.78),darkMetal=material('graphite_mechanism',0x30343c,.4,.65),bronze=material('nozzle_rim',0x8b8173,.38,.72),led=material('rear_lamp',0xff182d,.25,.2,0xff1424),frontLed=material('front_lamp',0xd9efff,.2,.1,0xb4d7ee),amber=material('side_indicator',0xe7a04c,.35,.4,0x7b2f09);
 glass.name='copper_glazing';
 function mesh(geo,m=paint,p=[0,0,0],parent=body){const o=new THREE.Mesh(geo,m);o.position.set(...p);parent.add(o);return o;}
 const box=(size,p,m=black,parent=body)=>mesh(new THREE.BoxGeometry(...size),m,p,parent);
 const mix=(a,b,t)=>a+(b-a)*t,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 // Cubic profile interpolation with nonuniform knot spacing.
 function at(rows,z,col){let k=0;while(k<rows.length-2&&z>rows[k+1][0])k++;const a=rows[k],b=rows[k+1],p=rows[Math.max(0,k-1)],n=rows[Math.min(rows.length-1,k+2)],d=b[0]-a[0],t=clamp((z-a[0])/d),m0=(b[col]-p[col])/(b[0]-p[0])*d,m1=(n[col]-a[col])/(n[0]-a[0])*d;return(2*t**3-3*t*t+1)*a[col]+(t**3-2*t*t+t)*m0+(-2*t**3+3*t*t)*b[col]+(t**3-t*t)*m1;}
 function surface(fn,nu,nv,m=paint,parent=body){const pos=[],ix=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)pos.push(...fn(i/nu,j/nv));for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i;ix.push(a,a+nu+1,a+1,a+1,a+nu+1,a+nu+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(ix);g.computeVertexNormals();return mesh(g,m,[0,0,0],parent);}
 function polygon(points,m=paint,parent=body){const p=[];for(let i=1;i<points.length-1;i++)p.push(...points[0],...points[i],...points[i+1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();return mesh(g,m,[0,0,0],parent);}
 function path(points,r,m=black,parent=body,segments){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');return mesh(new THREE.TubeGeometry(curve,segments||Math.max(2,points.length),r,5,false),m,[0,0,0],parent);}
 function cylinder(r1,r2,h,p,m,parent=body,axis='y',open=false){const o=mesh(new THREE.CylinderGeometry(r1,r2,h,32,1,open),m,p,parent);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function ring(r,t,p,m=alloy,parent=body,axis='z'){const o=mesh(new THREE.TorusGeometry(r,t,5,32),m,p,parent);if(axis==='x')o.rotation.y=Math.PI/2;if(axis==='y')o.rotation.x=Math.PI/2;return o;}
 const sample=(n,f)=>Array.from({length:n+1},(_,i)=>f(i/n));
 // z, width, top shoulder, outer side crease, sill. These control the rising flank.
 const shape=[[-2.43,1.012,.963,.865,.68],[-2.12,1.078,.978,.876,.53],[-1.48,1.105,1.002,.873,.38],[-.72,1.058,.966,.818,.28],[.15,1.025,.898,.754,.228],[.86,1.035,.877,.714,.21],[1.48,1.084,.908,.775,.21],[1.91,1.035,.817,.650,.215],[2.43,.884,.553,.521,.24]];
 const W=z=>at(shape,z,1),H=z=>at(shape,z,2),B=z=>at(shape,z,3),S=z=>at(shape,z,4);
 const wheelZ=[-1.48,1.48],R=.435,axleY=.435,clear=.463;
 function lower(z){let lo=S(z);for(const cz of wheelZ){const d=Math.abs(z-cz);if(d<clear)lo=Math.max(lo,axleY+Math.sqrt(clear*clear-d*d));}return lo;}
 // Width of a side surface varies with height. The main door skin tilts inward below
 // the crisp crease; the crown band tilts inward above it. Not a vertical extrusion.
 function sideX(z,y){const hi=H(z),b=B(z),lo=S(z),w=W(z);if(y>=b)return w-.043*Math.pow(clamp((y-b)/(hi-b)),1.3);const t=clamp((b-y)/(b-lo));return w-.085*t-.012*Math.sin(Math.PI*t);}
 function sidePoint(s,z,y,out=0){return[s*(sideX(z,y)+out),y,z];}
 for(const s of[-1,1]){
  // Split the crease into separate normal domains; clip against the wheel openings.
  surface((u,v)=>{const z=mix(-2.43,2.43,u),lo=lower(z),hi=Math.max(lo,B(z));return sidePoint(s,z,mix(lo,hi,v));},128,3,flank);
  surface((u,v)=>{const z=mix(-2.43,2.43,u),lo=Math.max(lower(z),B(z));return sidePoint(s,z,mix(lo,H(z),v));},128,3,paint);
 }
 // Crown stations: z, centre/inner-surface height, inner edge. Wheel shoulders have
 // independent plateau widths so the tyres never pierce the hood surface.
 const crown=[[-2.43,.956,.76],[-1.85,.941,.70],[-1.0,.915,.75],[0,.85,.77],[.94,.854,.76],[1.25,.821,.69],[1.8,.740,.67],[2.43,.553,.72]];
 const CY=z=>at(crown,z,1),CW=z=>at(crown,z,2);
 function crownP(s,z,u){const inner=CW(z),outer=W(z)-.043,x=mix(inner,outer,u),inWheel=Math.max(...wheelZ.map(c=>Math.exp(-(((z-c)/.64)**4)))),curve=1-(1-u)**(1+2*inWheel);return[s*x,mix(CY(z),H(z),curve)+.008*Math.sin(Math.PI*u),z];}
 for(const s of[-1,1])surface((u,v)=>crownP(s,mix(-2.43,2.43,u),v),88,9,paint);
 surface((u,v)=>{const z=mix(-2.43,2.43,v),x=(u*2-1)*CW(z);return[x,CY(z)+.006*(1-(2*u-1)**2),z];},16,72,paint);
 for(const s of[-1,1]){
  for(const cz of wheelZ){
   const pts=sample(48,u=>{const a=u*Math.PI,z=cz+clear*Math.cos(a),y=axleY+clear*Math.sin(a);return sidePoint(s,z,y,.002);});path(pts,.006,paint);
   surface((u,v)=>{const a=u*Math.PI,z=cz+(clear-.004)*Math.cos(a),y=axleY+(clear-.004)*Math.sin(a);return[s*(sideX(z,y)-.01-.06*v),y-.045*v,z];},48,3,black);
  }
  // Sill is a curved carbon blade, rising ahead of the rear wheel.
  surface((u,v)=>{const z=mix(-2.38,2.37,u),lo=lower(z),y=mix(Math.max(.137,lo-.13),lo+.008,v);return[s*(sideX(z,lo)-.025+.025*Math.sin(v*Math.PI)),y,z];},100,3,black);
 }
 // Glazing and its narrow painted perimeter. Long, raked front; rearward taper.
 // z, roof centre height, upper rail width, side-window baseline, belt width.
 const canopy=[[-2.03,.965,.30,.965,.30],[-1.65,1.02,.47,.99,.74],[-1.25,1.13,.61,.982,.86],[-.85,1.215,.67,.956,.9],[-.42,1.244,.69,.921,.92],[.12,1.231,.70,.883,.915],[.52,1.133,.735,.855,.88],[.96,.966,.79,.852,.82],[1.35,.869,.798,.865,.80],[1.65,.790,.80,.79,.80]];
 const roofY=z=>at(canopy,z,1),roofW=z=>at(canopy,z,2),beltY=z=>at(canopy,z,3),beltW=z=>at(canopy,z,4);
 const roofEdge=z=>roofY(z)-.018*Math.sin(Math.PI*clamp((z+2.03)/3.68));
 // Unified front windshield, roof and rear glass. Roof transverse crown is restrained.
 surface((u,v)=>{const x=2*u-1,z=mix(-2.03,1.65-.30*Math.abs(x)**4,v);return[x*roofW(z),roofY(z)-.018*x*x*Math.sin(Math.PI*clamp((z+2.03)/3.68)),z];},24,60,glass);
 for(const s of[-1,1]){
  surface((u,v)=>{const z=mix(-2.03,1.35,u);return[s*mix(roofW(z),beltW(z),v),mix(roofEdge(z),beltY(z),v),z];},60,5,paint);
  // The side glass ends in a point before the rear axle; the rear windshield continues.
  surface((u,v)=>{const z=mix(-1.34,1.35,u),t=clamp((z+1.34)/.42),open=t*t*(3-2*t),q=v*open;return[s*(mix(roofW(z),beltW(z),q)+.003),mix(roofEdge(z),beltY(z),q)+.001,z];},60,5,glass);
  // Outer metal shoulder/buttress connects to glazing smoothly, no triangular pasted slabs.
  surface((u,v)=>{const z=mix(-2.03,1.35,u),x=mix(beltW(z),W(z)-.043,v),y=mix(beltY(z),H(z),v);return[s*x,y,z];},60,4,paint);
  const rail=sample(50,u=>{const z=mix(-2.02,1.35,u);return[s*roofW(z),roofEdge(z)+.002,z];});path(rail,.008,paint);
  path(sample(40,u=>{const z=mix(-1.34,1.35,u),t=clamp((z+1.34)/.42),o=t*t*(3-2*t);return[s*mix(roofW(z),beltW(z),o),mix(roofEdge(z),beltY(z),o)+.003,z];}),.0025,black);
  path(sample(20,t=>{const z=.35+.59*t;return[s*(mix(roofW(z),beltW(z),t)+.004),mix(roofEdge(z),beltY(z),t)+.001,z];}),.004,black);
  // Dark glass pillar at the real aft door line, subtle instead of a cage around the roof.
  path([[s*roofW(-.60),roofEdge(-.60)+.002,-.60],[s*beltW(-.70),beltY(-.70)+.003,-.70]],.005,black);
  // Door boundaries continue the raked A-pillar and aft division through the body.
  const frontSeam=[[.96,.854],[.76,.695],[.70,.52],[.60,.235]],backSeam=[[-.70,.938],[-.70,.795],[-.65,.61],[-.53,.29]];
  for(const list of[frontSeam,backSeam])path(list.map(([z,y])=>sidePoint(s,z,y,.002)),.0024,black);
  // Small flush handle placed immediately behind the rear glass division.
  const hp=sidePoint(s,-.78,.855,.003);box([.009,.017,.115],hp,darkMetal);
  // Front-fender amber and black blade, below the crease.
  polygon([sidePoint(s,1.13,.745,.003),sidePoint(s,.83,.718,.003),sidePoint(s,.84,.680,.003),sidePoint(s,1.08,.704,.003)],black);
  polygon([sidePoint(s,1.10,.730,.008),sidePoint(s,.99,.717,.008),sidePoint(s,.99,.704,.008),sidePoint(s,1.07,.714,.008)],amber);
  // Compact lens pod at the base of the windscreen, never a large exterior mirror.
  const pod=box([.045,.022,.09],[s*.891,.867,.77],black);pod.rotation.y=s*.12;
 }
 // Subtle divisions between windshield, roof panels and rear glazing, seen overhead.
 path(sample(32,u=>{const k=2*u-1,z=.35;return[k*roofW(z),roofY(z)-.018*k*k*Math.sin(Math.PI*((z+2.03)/3.68))+.002,z];}),.0028,black);
 for(const x of[-.13,.13])path(sample(16,u=>{const z=mix(-.62,.35,u),k=x/roofW(z);return[x,roofY(z)-.018*k*k*Math.sin(Math.PI*((z+2.03)/3.68))+.002,z];}),.002,black);
 // Curved windscreen lower edge and a separate shallow front cowl panel.
 function cowlPoint(k,v){const front=1.65-.30*Math.abs(k)**4,z=front+.20*v,x=k*roofW(front),start=roofY(front)-.018*k*k*Math.sin(Math.PI*clamp((front+1.78)/3.68)),frac=clamp((Math.abs(x)-CW(z))/(W(z)-.043-CW(z))),target=Math.abs(x)<CW(z)?CY(z)+.006*(1-(x/CW(z))**2):crownP(Math.sign(k)||1,z,frac)[1];return[x,mix(start,target,v)+.002,z];}
 surface((u,v)=>cowlPoint(2*u-1,v),32,5,paint);
 path(sample(40,u=>cowlPoint((2*u-1)*.90,1)),.0024,black);
 // Bonnet seams are actual boundaries, following the shoulders from nose to windshield.
 for(const s of[-1,1]){
  path(sample(32,u=>{const z=mix(1.12,2.425,u);return[s*CW(z),CY(z)+.003,z];}),.0027,black);
  // A second boundary marks the concealed headlamp panel. Ramp configuration is closed.
  path(sample(22,u=>{const z=mix(1.23,2.10,u);return crownP(s,z,mix(.12,.015,u)).map((p,i)=>i===1?p+.003:p);}),.002,black);
 }
 // Front bumper wraps downward/backward instead of ending as a flat black rectangle.
 const noseW=.735;
 surface((u,v)=>{const k=2*u-1,x=k*mix(noseW,.726,v),y=mix(.552,.405,v),z=2.43-.055*v-.035*k*k;return[x,y,z];},32,6,material('nose_panel',0x899099,.33,.48));
 surface((u,v)=>[(2*u-1)*.712,mix(.255,.405,v),2.30],24,2,black);
 for(const s of[-1,1])surface((u,v)=>[s*mix(.69,.726,u),mix(.25,.405,v),mix(2.30,2.385,u)],3,4,black);
 // Upper light blade and chamfer beneath, thin enough to read as the actual strip.
 path(sample(48,u=>{const k=2*u-1;return[k*.736,.552+.009*(1-k*k),2.435-.035*k*k];}),.008,frontLed);
 for(const s of[-1,1]){
  surface((u,v)=>{const x=s*mix(.736,.884,u),y=mix(.247,.55,v),z=2.435-.045*u-.11*(1-v);return[x,y,z];},10,6,paint);
  surface((u,v)=>{const z=mix(2.06,2.42,u);return[s*mix(.75,W(z)-.035,v),.215+.017*u,z];},14,4,black);
 }
 surface((u,v)=>{const k=2*u-1;return[k*mix(.91,.78,v),.195+.023*Math.sin(Math.PI*v),mix(2.47,2.27,v)-.045*k*k];},40,6,black);
 // Closed lower intake floor prevents the road showing through below the nose.
 surface((u,v)=>[(u*2-1)*.728,mix(.251,.213,v),mix(2.28,2.45,v)],20,3,black);
 box([1.45,.065,.018],[0,.228,2.275],black);
 // Inset lower air mouth: visible cavity with a lip and sparse internal aero fins.
 box([1.27,.105,.018],[0,.297,2.28],black);
 for(const x of[-.55,-.37,.37,.55])box([.018,.07,.08],[x,.292,2.30],darkMetal);
 // Tail fascia: black lamp surround, folded aluminium below, exposed dark outboard bumper.
 surface((u,v)=>{const k=2*u-1;return[k*1.014,mix(.867,.967,v),-2.435+.019*k*k];},48,4,black);
 path(sample(56,u=>{const k=2*u-1;return[k*.991,.929+.004*(1-k*k),-2.447+.019*k*k];}),.012,led);
 // Small upper stop lamp inset into the deck lip.
 box([.33,.007,.013],[0,.974,-2.403],led);
 surface((u,v)=>{const k=2*u-1,x=k*1.008;return[x,mix(.635,.859,v),-2.398+.022*k*k+.09*Math.sin(Math.PI*u)**3*(1-v)];},48,12,paint);
 // Inboard cutback: the reference's rear wheels and black diffuser are fully exposed.
 for(const s of[-1,1]){
  surface((u,v)=>[s*mix(.795,1.008,u),mix(.33+.05*u,.642,v),-2.425+.055*u*u],12,6,black);
  surface((u,v)=>{const z=mix(-2.425,-2.005,u);return[s*(W(z)-.055),mix(.38,S(z),v),z];},14,4,black);
  polygon([[s*.83,.64,-2.42],[s*1.0,.64,-2.42],[s*1.0,.40,-2.37],[s*.86,.37,-2.40]],black);
  path([[s*.86,.658,-2.43],[s*.99,.658,-2.43]],.004,led);
 }
 // Curved recess surround, not a bright rectangular cage.
 const outline=[[-.70,.205,-2.425],[-.79,.25,-2.43],[-.80,.43,-2.43],[-.775,.56,-2.43],[-.60,.625,-2.43],[0,.63,-2.43],[.60,.625,-2.43],[.775,.56,-2.43],[.80,.43,-2.43],[.79,.25,-2.43],[.70,.205,-2.425],[-.70,.205,-2.425]];
 path(outline,.023,black,body,80);box([1.43,.40,.018],[0,.415,-2.12],black);
 for(const s of[-1,1])surface((u,v)=>[s*mix(.71,.79,u),mix(.24,.56,v),mix(-2.15,-2.43,u)],3,6,black);
 polygon([[-.71,.205,-2.42],[.71,.205,-2.42],[.70,.29,-2.46],[-.70,.29,-2.46]],black);
 box([1.47,.022,.065],[0,.471,-2.407],black);
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.32;
  cylinder(.058,.058,.17,[x,.545,-2.35],darkMetal,body,'z',true);ring(.058,.005,[x,.545,-2.439],bronze);
  const bore=mesh(new THREE.CircleGeometry(.050,24),black,[x,.545,-2.27]);bore.rotation.y=Math.PI;
  const ball=mesh(new THREE.SphereGeometry(.113,20,12),material('recessed_gimbal',0x181b21,.58,.30),[x,.346,-2.22]);ball.scale.z=.76;
  ring(.080,.013,[x,.346,-2.305],black);cylinder(.042,.054,.065,[x,.361,-2.307],black,body,'z',true);
  for(const t of[-1,1])path([[x+t*.095,.28,-2.25],[x+t*.105,.34,-2.29],[x+t*.078,.405,-2.27]],.011,bronze);
  if(i<3)box([.011,.23,.24],[x+.16,.35,-2.28],darkMetal);
 }
 // Plate with real stroke lettering and a fine rounded surround.
 box([.345,.153,.025],[0,.735,-2.421],alloy);
 path([[-.164,.668,-2.438],[-.166,.802,-2.438],[.166,.802,-2.438],[.166,.668,-2.438],[-.164,.668,-2.438]],.003,paint,body,32);
 const font={R:[[0,0,0,1],[0,1,.55,1],[.55,1,.55,.55],[.55,.55,0,.55],[.1,.55,.65,0]],D:[[0,0,0,1],[0,1,.5,.85],[.5,.85,.5,.15],[.5,.15,0,0]],S:[[.6,1,0,1],[0,1,0,.55],[0,.55,.6,.55],[.6,.55,.6,0],[.6,0,0,0]],T:[[0,1,.65,1],[.325,1,.325,0]]};
 [...'RDSTR'].forEach((c,i)=>font[c].forEach(([x,y,u,v])=>path([[.128-i*.053-x*.042,.696+y*.084,-2.440],[.128-i*.053-u*.042,.696+v*.084,-2.440]],.0026,paint)));
 box([.055,.018,.021],[0,.836,-2.423],black);
 // Underbody and cold-gas outlets, independent of visual effects.
 box([1.62,.035,3.85],[0,.175,0],black);
 for(const x of[-.82,.82])for(const z of[-1.5,1.5]){cylinder(.066,.085,.12,[x,.17,z],darkMetal);ring(.073,.009,[x,.108,z],bronze,body,'y');const p=mesh(new THREE.CircleGeometry(.059,24),black,[x,.105,z]);p.rotation.x=Math.PI/2;}
 for(const s of[-1,1]){cylinder(.045,.06,.23,[s*.862,.32,-2.16],darkMetal);ring(.052,.007,[s*.862,.202,-2.16],alloy,body,'y');}
 for(let i=0;i<6;i++)box([1.38,.014,.025],[0,.149,-1.5+i*.6],darkMetal);
 // Wing is a shaped trailing flap in its low film configuration, with a real joint.
 const wing=new THREE.Group();wing.name='rear_wing';wing.position.set(0,.976,-2.20);root.add(wing);
 surface((u,v)=>{const k=2*u-1;return[k*1.025,.014*Math.sin(Math.PI*v)-.012*k*k,mix(-.23,.15,v)+.04*k*k];},40,6,paint,wing);
 for(const s of[-1,1])path([[s*.52,-.045,.10],[s*.52,-.008,.00],[s*.52,-.005,-.07]],.010,darkMetal,wing);
 // Detailed five-spoke aerodynamic wheel faces, inset brakes and rounded low-profile tires.
 for(const s of[-1,1])for(const z of wheelZ){
  const wheel=new THREE.Group();wheel.name=`wheel_${s<0?'l':'r'}_${z>0?'f':'r'}`;wheel.position.set(s*.925,axleY,z);root.add(wheel);
  const half=z<0?.168:.155;
  const tire=[[-half,.357],[-half,.387],[-half+.018,.421],[-half+.043,R],[half-.043,R],[half-.018,.421],[half,.387],[half,.357]];
  surface((u,v)=>{const a=u*2*Math.PI,k=Math.min(tire.length-2,Math.floor(v*7)),t=v*7-k;return[mix(tire[k][0],tire[k+1][0],t),Math.sin(a)*mix(tire[k][1],tire[k+1][1],t),Math.cos(a)*mix(tire[k][1],tire[k+1][1],t)];},48,10,rubber,wheel);
  // Circumferential grooves and subtle tread cuts, code geometry only.
  for(const x of[-.09,-.03,.03,.09])ring(R+.0006,.0015,[x,0,0],black,wheel,'x');
  for(let k=0;k<28;k++){const a=k*Math.PI/14;path([[-half+.025,Math.sin(a)*.421,Math.cos(a)*.421],[-half+.055,Math.sin(a+.025)*.435,Math.cos(a+.025)*.435]],.0013,black,wheel,2);}
  cylinder(.357,.357,2*half,[0,0,0],darkMetal,wheel,'x',true);ring(.355,.006,[s*(half+.002),0,0],alloy,wheel,'x');
  cylinder(.279,.279,.015,[s*(half-.03),0,0],darkMetal,wheel,'x');
  // Each broad triangular silver face sits between black radial ribs, like the reference.
  for(let k=0;k<5;k++){
   const arm=new THREE.Group();arm.rotation.x=k*Math.PI*2/5;wheel.add(arm);const X=s*(half+.006);
   for(const side of[0,1])surface((u,v)=>{const q=(side+u)/2,a=mix(.12,Math.PI*2/5-.10,q),r=mix(.088,.348,v),ridge=(1-Math.abs(2*q-1)),x=X+s*(.029*ridge*Math.sin(Math.PI*v)-.009*v);return[x,Math.sin(a)*r,Math.cos(a)*r];},5,5,alloy,arm);
   // Black spoke with polished edge and a narrow open slot near its outer end.
   const rib=[[X+s*.008,-.034,.060],[X+s*.008,.044,.060],[X+s*.008,.061,.326],[X+s*.008,.030,.356],[X+s*.008,-.020,.348],[X+s*.008,-.045,.168]];polygon(rib,black,arm);
   path([[X+s*.01,-.031,.090],[X+s*.01,-.024,.32],[X+s*.01,.027,.349]],.003,alloy,arm);
   path([[X+s*.011,.012,.115],[X+s*.011,.026,.302]],.002,alloy,arm);
  }
  cylinder(.072,.072,.02,[s*(half+.019),0,0],black,wheel,'x');ring(.068,.002,[s*(half+.031),0,0],alloy,wheel,'x');
  // Tiny T-shaped hub mark and five fasteners.
  path([[s*(half+.034),.026,-.024],[s*(half+.034),.030,0],[s*(half+.034),.026,.024]],.0024,alloy,wheel);
  path([[s*(half+.034),.027,0],[s*(half+.034),-.026,0]],.0024,alloy,wheel);
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5;mesh(new THREE.SphereGeometry(.007,6,4),alloy,[s*(half+.032),Math.sin(a)*.050,Math.cos(a)*.050],wheel);}
 }
 // Rounded plan-view nose corners from the true overhead reference. Apply the
 // same continuous deformation to every front panel, seam, light and splitter.
 root.updateMatrixWorld(true);const point=new THREE.Vector3();
 body.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone(),pos=g.attributes.position,inv=o.matrixWorld.clone().invert();for(let i=0;i<pos.count;i++){point.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const t=clamp((point.z-1.85)/.58);point.z-=.24*Math.min(1,Math.abs(point.x)/.9)**4*t*t*(3-2*t);point.applyMatrix4(inv);pos.setXYZ(i,point.x,point.y,point.z);}g.computeVertexNormals();o.geometry=g;});
 for(const p of root.children){p.position.x*=.96;p.scale.x*=.96;}
 // Normalize with real transformed vertices as required by the pinned recipe.
 root.updateMatrixWorld(true);const bounds=new THREE.Box3(),v=new THREE.Vector3();root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
 const c=bounds.getCenter(new THREE.Vector3());for(const p of root.children){p.position.x-=c.x;p.position.y-=bounds.min.y;p.position.z-=c.z;}
 root.userData.dimensions={width:2.17,height:1.25,depth:4.93};return root;
}
