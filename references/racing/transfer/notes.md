> Superseded by the separate-runway revision. Current implementation and tests: `racing/README.md`, `HANDOFF.md`, and `evidence/racing/separated-landing/`. The shared-apron descriptions and MP4 below are historical.

# Current exhibition update — October 27

The original compact ramp is retained in the open solo exhibition. Drift triggers an airborne flat spin, with charge/score granted at landing. Capture preserves drift attitude before blending onto the curl; this prevents a yaw snap on steered entry. The flight remains assisted, fixed laterally without steering, and levels before cold-gas touchdown. The shared launch/landing pavement is drawn once. Ground barriers are removed.

Current checks: ten simulation categories including 20 speed/lane approach combinations, steered drift capture, continuous rotation and aligned touchdown; nine complete keyboard/touch browser checks; and a per-frame focused practice-button run checking framing, terrain occlusion, spin, vapor and camera toggle. The 16-second preview starts through the real Practice Gravity Launch button and uses the real drift key. Browser recording caused an encoder backlog; the recovered capture was transcoded to H.264 and fully decoded for validation. It shows the final closer airborne camera and thinner vapor. Static screenshots can be delayed by the capture tool; per-frame telemetry is authoritative for checks. It is not a full race or physical-device performance benchmark. Current evidence is in `evidence/racing/transfer/playtest/report.json` and `evidence/racing/playtest/report.json`.

Historical reviews below describe earlier visuals and must not be represented as approval of this revision.

# Compact reference ramp — previous revision record

The first playable build is preserved under `racing-baseline-2026-10-26`. The original film remains unchanged.

The source film shows four downward cold-gas streams, a short attitude-jet burst after departure, ground vapor before wheel contact, and a lingering cloud after drive-away. See the archived source event anchors for actual frame ranges. The game adapts this staging to a continuous race.

The active asset is the unchanged original `racing/assets/ramp.js`, approximately 34m tall and 7.2m wide, with its original compact vertical curl. The user rejected the 100m swept deck as bridge-like. `transfer.js` now matches the original profile. The incoming road turns into the ramp from the left, while the return straight meets the fixed flight plane. Neither the ramp nor airborne path moves automatically sideways. On-ramp lane offsets stay fixed through vertical; quaternion interpolation levels the car, and the lane sign changes at touchdown because the receiving road points the opposite way. Boost shortens traversal and consumes charge. This remains an assisted arcade path, not a rocket dynamics simulation.

Exactly one car is instantiated. Parked service vans are omitted. The HUD reports solo completion and uses a separate best-time key for this layout. Changes are local and uncommitted at the user's explicit request.

Camera sequence: wide ramp reveal, closer side view of jet-assisted descent with the upper ramp still visible, then a blended return to chase after touchdown. C or Camera toggles continuous chase. The full reveal fits ramp and landing bounds to the viewport aspect ratio. Landing markings identify the receiving lane without relying on HUD instructions.

The earlier, now-inactive swept-ramp study used an Atlas structural reference and independently reviewed a four-panel source comparison. The first review rated car legibility a qualified pass and geography/gas staging partial. Corrections broadened and softened jet ends, concentrated gas around the descending vehicle by braking forward motion, retained the ramp lip in the landing shot, and added touchdown markings. Do not claim an exact video match or a blanket visual-quality pass.

`evidence/racing/transfer/transfer-preview.mp4` records the actual browser from a deliberately staged approach to the ramp, through its real-time traversal and return to driving. It is a functional visual preview, not an unassisted full race or a performance benchmark. The full-input race evidence is in `evidence/racing/playtest/`.

The second historical Atlas review remained partial: it identified residual cloud occlusion, limited vertical billowing and ambiguity in the cropped landing view. A final correction increased vertical billowing/cyan edge color while reducing vapor opacity close to the grounded player, retaining the forward body silhouette. The review did not certify exact source likeness. Hover and final wheel-contact frames depict different phases; the source study records wheel contact as partly obscured too.

## Compact-ramp review and checks

Atlas operation `1ac63f76-6a5d-4e28-a5ce-01f24615d893` reviewed `compact-comparison.jpg` (uploaded file `ee2dbe71-5ef1-4111-bca9-5c034ab55132`, 4 credits). It passed the compact hooked silhouette, wide-camera readability and single visible car. Landing geography remained partial because of separation from the ramp and dense touchdown vapor. This is not a blanket visual-quality pass. Full receipt: `evidence/racing/transfer/review-compact.json`. The earlier reviews describe the inactive swept variant.

Verification at that previous revision: 18 simulation checks, nine full-input browser/phone checks, focused transfer/camera/solo checks and canonical shipping checks pass. The unchanged original ramp retains the canonical verifier's broad-face warnings (8/9 modules clean across the folder, 6/7 currently loaded). Original film and copied geometry/stock loader remain byte-identical. The regenerated MP4 was decoded successfully. All edits and evidence remain uncommitted; Git HEAD is still `23a3f13`.
