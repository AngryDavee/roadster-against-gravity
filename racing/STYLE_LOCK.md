# Meridian Launch Coast

Sculpted silver machines with ink-dark panel seams racing through an ivory aerospace coast at violet dusk, warm horizon light, cool cyan cold-gas thrust, red gravity-ramp edges and restrained bloom.

Carry over the approved Roadster geometry, its overhanging concrete gravity ramp, and the illustrated surface treatment. This is an original racing adaptation, not a copy of an Asphalt track or interface. The original film remains in `app/` and the tagged baseline.

Palette: ink #101724, silver #d8dce5, warm ivory #ffead0, violet #8b87aa, sea #163e50, concrete #878895, red #ff3347, cold gas #9cdbed, amber #f7bd70. Dusk must leave the road and player readable. Terrain, water, road and sky are continuous environmental surfaces; discrete props follow the 404 asset contract and three-candidate visual selection.

Scale in metres: road width 22; Roadster approximately 5 × 2.2 × 1.3; canonical gravity ramp 7.2 wide, 34 high; hangar 25 wide, 11 high; control tower 18 high; smaller flat jump 18 long, 12 wide, 3 high. Camera is a responsive low chase view. During the gravity maneuver it widens enough to preserve orientation.

New generated images/textures and critique must use Atlas MCP. No imported mesh assets. Vehicle gas remains white/cyan. The ramp's actual original geometry is reused; its traversal is an arcade maneuver with a controllable aerial transfer into the returning lane.

## Current ramp and solo direction

Restore the source ramp's compact silhouette: original R20.4m / 2.3rad profile, 7.2m deck width, approximately 34m height. No lateral sweep or bridge-like deck. Keep the selected original ramp geometry unchanged; arrange the approach and receiving roads around its flight plane. No automatic sideways landing correction. Carry the body through vertical with quaternion continuity. Gas stays white/cyan, with four downward nozzles, brief lateral attitude jets and turbulent ground vapor. The wide camera must show the curl clearly. Only the player's Roadster is present; no opponents or parked vehicles for this iteration. Do not commit or push until the user asks.

## October 27 exhibition revision

Open canyon-to-airfield course, one Roadster, one full run. Terrain is faceted coastal rock with a cleared launch and landing yard. Remove roadway boundary rails; use flush edge markings and shoulder lighting. Preserve the narrow tall curl. Drift off the wide jump for a flat spin; drift on the gravity approach to arm its airborne spin. Camera orientation follows flight direction rather than spinning with the body. Ground steering changes heading and lane. Atlas rock albedo adds surface detail; imported normal/roughness maps remain unused pending calibration.

## Latest user override: separate receiving track

The user now explicitly requests a bent gravity ramp landing on another road. This supersedes the earlier no-lateral-sweep/shared-apron restriction. Keep the tall narrow hooked silhouette; use the selected 14m progressive bend and tangent-aligned separate receiving strip. Wide launch, close thruster descent, rear chase before contact. Shift alone must never schedule a canned spin; drift + steering at the lip supplies intentional angular input, release stabilizes.

Latest camera/pacing override: track closely up the curl, briefly widen at departure, return to the close front/side shot, then return behind the car early. The wider highlight lasts under one second; the side-to-rear orbit runs from 1.15 to 2.65s after departure with quintic easing and preserved camera radius and stays through landing and acceleration. Avoid prolonged side views or distant whole-scene framing. Faster 4.6s flight and rolling touchdown preserve racing momentum.


## Latest vehicle override: reference-correct wedge coupe

Use `assets/roadster-2026.js`. The user rejected the old boxy car. Preserve the shallow continuous bronze-dark glass canopy, long low nose, distinct raised front shoulders, circular open wheel arches, tapered side glass, clean stowed headlamp shutters, five-part machined wheels and recessed four-over-four rear machinery. Keep silver/ink illustrated materials and the low aero state from the ramp footage. The six Tesla-credited photographic views are shape evidence, not textures to paste onto the geometry. Approximately 4.94m length × 2.24m width × 1.18m height are inferred reconstruction dimensions. Old asset/original film remain preserved.

## Latest vehicle refinement — true overhead and full gallery

This supersedes the earlier vehicle selection above. Use `assets/roadster-precision.js`, 4.930m long × 2.173m wide × 1.252m high (inferred). Preserve the continuous rising side crease, restrained front shoulder, curved windshield foot and long tapered rear glass established by the actual overhead photo, sculpted five-face wheels, recessed rear ports/gimbals, stowed wing, closed lamps and copper-dark glass. Keep the illustrated surface language while matching the photographic silhouette. Do not turn the roof silver through excessive environment reflection. References are in `references/racing/roadster-precision/`; previous assets remain archived. No claim of measured 99% similarity. Recording remains on hold until the user is ready.

## Latest motion refinement — smoother and more responsive

Gravity flight is now 4.1s nominal. Keep the brief wider highlight, close view and an earlier cosine orbit (0.75–2.55s). Transport camera and look target with the vehicle, smooth both consistently, and continuously blend follow distance/height/look-ahead into touchdown. Never restore the abrupt y<8m camera-distance switch. Remove the former 0.45s rotation dead zone. A deliberate drift+steer gesture near the lip supplies torque; allow 0.15s post-lip grace, reject late mid-air activation. One sustained gesture eases through one turn; match angular velocity entering assisted alignment and avoid reversing a completed turn. Preserve the latest car, original film and no-commit instruction.
