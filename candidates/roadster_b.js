// Candidate B: extruded side silhouettes, separately modeled canopy and fascias.
export default function(THREE){
 const g=new THREE.Group(),mat=(c,m=.3)=>new THREE.MeshStandardMaterial({color:c,roughness:.48,metalness:m,side:THREE.DoubleSide});
 const shell=mat(0xd8dce5),ink=mat(0x121722),rim=mat(0x7b829b,.65);
 function profile(points,width,ma){const s=new THREE.Shape();points.forEach(([z,y],i)=>i?s.lineTo(z,y):s.moveTo(z,y));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:false});geo.rotateY(-Math.PI/2);geo.translate(width/2,0,0);const o=new THREE.Mesh(geo,ma);g.add(o);return o;}
 profile([[-2.36,.26],[-2.36,.76],[-1.4,.85],[.7,.77],[2.36,.48],[2.36,.25]],1.94,shell);
 profile([[-1.65,.83],[-.9,1.28],[.05,1.30],[.77,.80]],1.38,ink);
 profile([[-1.69,.82],[-.95,1.29],[-.86,1.30],[-1.50,.82]],1.45,shell);
 profile([[.03,1.30],[.10,1.30],[.83,.79],[.75,.79]],1.45,shell);
 function box(w,h,d,x,y,z,ma){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);g.add(o);return o;}
 for(const sign of [-1,1])for(const z of [-1.47,1.47]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.29,28),ink);wheel.rotation.z=Math.PI/2;wheel.position.set(sign*.98,.39,z);g.add(wheel);const edge=new THREE.Mesh(new THREE.TorusGeometry(.28,.025,6,22),rim);edge.rotation.y=Math.PI/2;edge.position.set(sign*1.14,.39,z);g.add(edge);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;box(.028,.055,.26,sign*1.14,.39+Math.sin(a)*.13,z+Math.cos(a)*.13,rim).rotation.x=-a;}}
 box(1.85,.03,.03,0,.72,-2.38,new THREE.MeshStandardMaterial({color:0xff3347,emissive:0xff1122,emissiveIntensity:1}));
 box(1.78,.023,.04,0,.49,2.38,new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xddeeff,emissiveIntensity:1}));
 box(1.75,.21,.04,0,.35,2.37,ink);box(1.63,.29,.04,0,.40,-2.38,ink);box(.34,.16,.025,0,.59,-2.41,shell);
 for(let k=0;k<4;k++){const n=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.12,18,1,true),rim);n.rotation.x=Math.PI/2;n.position.set((k-1.5)*.31,.42,-2.42);g.add(n);}
 box(1.93,.04,.31,0,.85,-2.05,shell);for(const sign of [-1,1])box(.03,.10,.31,sign*.95,.85,-2.05,ink);
 return g;
}
