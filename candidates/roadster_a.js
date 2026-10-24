// Candidate A: primitive assembly reading of the supplied front/rear references.
export default function(THREE){
 const g=new THREE.Group(),m=c=>new THREE.MeshStandardMaterial({color:c,roughness:.55,metalness:.35});
 const white=m(0xd8dce5),dark=m(0x111821),silver=m(0x777f8d),red=m(0xff3347);
 function box(w,h,d,x,y,z,ma){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);g.add(o);return o;}
 box(1.92,.32,4.6,0,.48,0,white);box(1.7,.14,4.7,0,.25,0,dark);
 const hood=box(1.8,.15,1.45,0,.62,1.45,white);hood.rotation.x=.12;
 box(1.45,.47,1.65,0,.95,-.3,dark);
 const wind=box(1.49,.04,.82,0,1.00,.58,dark);wind.rotation.x=.52;
 box(1.52,.05,1.3,0,1.20,-.36,white);
 for(const s of [-1,1]){box(.04,.36,.05,s*.73,.96,.5,white).rotation.x=-.4;box(.04,.36,.05,s*.73,.96,-1.03,white).rotation.x=.4;box(.03,.25,1.3,s*.973,.55,-.2,white);for(const z of [-1.45,1.45]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.27,20),dark);w.rotation.z=Math.PI/2;w.position.set(s*.97,.39,z);g.add(w);const r=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.29,10),silver);r.rotation.z=Math.PI/2;r.position.copy(w.position);g.add(r);}}
 box(1.8,.045,.03,0,.63,-2.32,red);box(1.77,.025,.03,0,.54,2.32,white);box(.32,.15,.03,0,.47,-2.34,white);box(1.9,.04,.32,0,.78,-2.08,white);
 for(let i=0;i<4;i++){const o=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.14,14,1,true),silver);o.rotation.x=Math.PI/2;o.position.set((i-1.5)*.31,.32,-2.35);g.add(o);}
 for(let i=-3;i<=3;i++)box(.02,.17,.3,i*.20,.21,-2.08,dark);
 return g;
}
