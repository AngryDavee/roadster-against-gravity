"""Apply the visual-review corrections to selected C without rewriting the studies."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'references/racing/roadster-rebuild/candidates/c-parametric-coachwork.js').read_text()
s=s.replace('// Reference reconstruction','// Selected C, revised after Atlas and in-game inspection.\n// Reference reconstruction',1)
s=s.replace('const roof=[[-1.65,.90,.43],[-1.40,1.02,.57],[-1,1.15,.66],[-.5,1.225,.70],[0,1.225,.71],[.40,1.15,.74],[.80,.99,.79],[1.08,.864,.82]];', 'const roof=[[-1.80,.90,.40],[-1.40,1.015,.58],[-1,1.12,.67],[-.5,1.17,.71],[0,1.17,.72],[.40,1.105,.76],[.80,.98,.80],[1.18,.864,.83]];')
s=s.replace('-1.65','-1.80').replace('1.08','1.18').replace('2.73','2.98').replace('z+1.65','z+1.80')
s=s.replace('lerp(-1.85,-.9,u)','lerp(-1.95,-1.08,u)')
# Source ramp uses the hidden/stowed lamps. Silver shutters keep the nose clean.
s=s.replace('// Triangular lamp recesses follow the sculpted shoulder and do not intersect it.','// Stowed triangular headlamp shutters match the ramp film; fine panel gaps remain.')
s=s.replace('},10,14,ink);','},10,14,silver);')
start=s.index('  surface((u,v)=>{const z=lerp(1.94,2.10,v)')
end=s.index('\n }',start)
s=s[:start]+'''  for(const f of[.10,.88]){const seam=[];for(let k=0;k<=20;k++){const v=k/20,z=lerp(1.64,2.32,v);seam.push(shoulderPoint(s,z,f*(1-v)+.08*v,.009));}line(seam,.0025,ink);}
''' + s[end:]
s=s.replace("const ball=mesh(new THREE.SphereGeometry(.108,20,12),steel", "const ball=mesh(new THREE.SphereGeometry(.108,20,12),mat('gimbal_housing',0x353c45,.55,.42)")
s=s.replace("tube(.047,.09,[x,.35,-2.38],bronze);ring(.045,.005,[x,.35,-2.429],steel);","tube(.038,.035,[x,.35,-2.36],ink);ring(.041,.005,[x,.35,-2.381],steel);")
# Raised shoulders must clear the inner tire and wheel-well liner, not only the outer rim.
s=s.replace('inner=.68+.14','inner=.60+.14').replace('w=.68+.14','w=.60+.14')
s=s.replace('lerp(middle,shoulder(z),v)','lerp(middle,shoulder(z),1-Math.pow(1-v,6))')
s=s.replace('lerp(mid,shoulder(z),f)','lerp(mid,shoulder(z),1-Math.pow(1-f,6))')
s=s.replace('s*(.68+.14*(1-z/2.4))','s*(.60+.14*(1-z/2.4))')
s=s.replace('height:1.24','height:1.18')
(root/'racing/assets/roadster-2026.js').write_text(s)
print('Selected C refined: shallower extended glazing, closed lamps, darker recessed gimbals.')
