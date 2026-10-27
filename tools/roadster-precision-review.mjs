// Isolated, identical-lighting reference inspection. Not gameplay or performance evidence.
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
const out='evidence/racing/roadster-precision';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();page.setDefaultTimeout(90000);await page.goto('http://localhost:4175');await page.waitForFunction(()=>window.__READY__);
 const results=await page.evaluate(async()=>{
  const THREE=await import('three'),old=(await import('./assets/roadster-2026.js')).default,newCar=(await import('./assets/roadster-precision.js')).default;
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1200,675);renderer.setPixelRatio(1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const studio=new THREE.Scene();studio.background=new THREE.Color(0x1c222d);studio.add(new THREE.HemisphereLight(0xd9e0ed,0x292f3b,.65));
  for(const [p,c,i]of[[[4,6,5],0xffefdb,3],[[-4,3,0],0xaebed9,.5],[[2,4,-4],0xffffff,1.4]]){const l=new THREE.DirectionalLight(c,i);l.position.set(...p);studio.add(l);}
  const envScene=new THREE.Scene();envScene.background=new THREE.Color(0x374250);
  for(const [pos,size]of[[[0,5,0],[8,4]],[[-4,2,0],[3,5]],[[4,3,-2],[3,7]]]){const card=new THREE.Mesh(new THREE.PlaneGeometry(...size),new THREE.MeshBasicMaterial({color:0xd9dfeb,side:THREE.DoubleSide}));card.position.set(...pos);card.lookAt(0,0,0);envScene.add(card);}
  const pmrem=new THREE.PMREMGenerator(renderer);studio.environment=pmrem.fromScene(envScene,.06).texture;
  const images=[],measures=[];
  for(const [name,fn]of[['before',old],['after',newCar]]){
   const model=fn(THREE);studio.add(model);model.traverse(o=>{if(o.isMesh)o.material.envMapIntensity=o.material.name==='copper_glazing'?.22:.65;});
   model.updateMatrixWorld(true);const bounds=new THREE.Box3(),v=new THREE.Vector3();let triangles=0;
   model.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;triangles+=(o.geometry.index?.count||p.count)/3;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
   measures.push({name,dimensions:bounds.getSize(new THREE.Vector3()).toArray(),triangles,joints:['coachwork','rear_wing','wheel_l_f','wheel_r_f','wheel_l_r','wheel_r_r'].map(n=>({name:n,present:!!model.getObjectByName(n)}))});
   for(const [view,pos,target]of[['hero',[3.6,1.30,5.4],[0,.58,0]],['side',[9,1.10,.8],[0,.65,0]],['rear',[3,1.5,-8],[0,.6,0]],['front',[0,1.1,9],[0,.65,0]],['rear-straight',[0,1.1,-9],[0,.65,0]],['top',[0,9,.001],[0,0,0]],['debug-side',[9,1.10,.8],[0,.65,0]]]){
    if(view==='debug-side')model.traverse(o=>{if(o.isMesh&&o.material.name==='copper_glazing')o.material=new THREE.MeshBasicMaterial({color:0xff2200,side:THREE.DoubleSide});});
    const camera=view==='hero'?new THREE.PerspectiveCamera(36,1200/675,.1,100):new THREE.OrthographicCamera(-3.3,3.3,1.856,-1.856,.1,100);if(view==='top'){camera.left=-4.8;camera.right=4.8;camera.top=2.7;camera.bottom=-2.7;camera.updateProjectionMatrix();}camera.position.set(...pos);camera.lookAt(...target);camera.updateMatrixWorld();renderer.render(studio,camera);images.push({name:`${name}-${view}`,data:renderer.domElement.toDataURL('image/png').split(',')[1]});
   }studio.remove(model);
  }renderer.dispose();pmrem.dispose();return{images,measures};
 });
 for(const i of results.images)await fs.writeFile(`${out}/${i.name}.png`,Buffer.from(i.data,'base64'));
 await fs.writeFile(out+'/model-measurements.json',JSON.stringify({kind:'isolated reference inspection; identical lighting and cameras',measurements:results.measures},null,2));console.log(JSON.stringify(results.measures));
}finally{await browser.close();}
