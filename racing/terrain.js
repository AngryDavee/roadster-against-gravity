// Continuous faceted coastal terrain; scene geometry, not an imported prop.
import * as THREE from './vendor/three.module.js';
import {ROAD_SECTIONS,sample,SCENERY} from './track.js';
const hash=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
const noise=(x,z)=>{const i=Math.floor(x),j=Math.floor(z),u=x-i,v=z-j,a=u*u*(3-2*u),b=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(i,j),hash(i+1,j),a),THREE.MathUtils.lerp(hash(i,j+1),hash(i+1,j+1),a),b);};
export function coastalTerrain(){
 const road=[];for(const [a,b]of ROAD_SECTIONS)for(let s=a;s<=b;s+=10)road.push(sample(s).p);
 const pads=SCENERY.map(o=>({p:sample(o.s,o.lane).p,r:o.kind==='hangar'?23:8}));
 const N=105,M=145,vertices=[],colors=[],indices=[],uv=[];
 for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){
  const x=-530+i*7,z=-650+j*8,coast=112+Math.sin(z*.006)*32;
  let distance=1000;for(const p of road)distance=Math.min(distance,Math.hypot(x-p.x,z-p.z));for(const pad of pads)distance=Math.min(distance,Math.max(0,Math.hypot(x-pad.p.x,z-pad.p.z)-pad.r));
  const ridge=10+noise(x*.014,z*.014)*43+noise(x*.037,z*.037)*17+noise(x*.093,z*.093)*5+Math.max(0,-x-170)*.18;
  const shoulder=THREE.MathUtils.smoothstep(distance,20,72),shore=THREE.MathUtils.smoothstep(coast-x,0,65);
  const yard=THREE.MathUtils.smoothstep(z,145,245)*THREE.MathUtils.smoothstep(x,-245,-170);
  const y=x>coast?-8:-.28+ridge*shoulder*shore*(1-yard);
  vertices.push(x,y,z);uv.push(x/20,z/20);
  const bands=.5+.5*Math.sin(y*.7+noise(x*.03,z*.03)*2),c=new THREE.Color().lerpColors(new THREE.Color(0x8d8275),new THREE.Color(0xd1c0a7),bands*.7+shoulder*.1);
  if(distance<26)c.setHex(0x394248);else if(y<4)c.lerp(new THREE.Color(0x9d8c78),.35);
  colors.push(c.r,c.g,c.b);
  if(i<N&&j<M){const a=j*(N+1)+i,b=a+N+1;indices.push(a,b,a+1,b,b+1,a+1);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,flatShading:true}));mesh.receiveShadow=true;return mesh;
}
