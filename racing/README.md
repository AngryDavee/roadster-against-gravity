# Meridian — solo airborne exhibition

Run `npm ci`, then `npm run race`, and open http://localhost:4175. Existing assets run without an Atlas key. The comparison film on port 4174 now uses the same car, preserving its original shot timing. The original film remains at its baseline tag. **For another PC or an AI-operated recording, read [RECORDING.md](../RECORDING.md).** Future unrequested edits remain local.

## Current Roadster

`assets/roadster-precision.js` is the active reference-derived wedge coupe. Earlier models remain in `assets/roadster-2026.js` and `assets/roadster.js`. Tesla-credited gallery photographs, including the true overhead view, and the user's ramp footage establish the continuous glass canopy, narrow rear taper, rising body crease, rounded nose, sculpted silver wheel faces and recessed thrust hardware. The doors/lamps stay closed and wing low as in the ramp shot. Inferred bounds are 4.930 × 2.173 × 1.252m; this is editable procedural geometry, not CAD or a measured 99% match.

This extensively refines selected construction C from the original three candidates. Canonical verification passes at 58,274 triangles with no problems. Current source provenance, Atlas critique and selected verifier results are in `references/racing/roadster-precision/`. Current visual evidence and photo comparison are in `evidence/racing/roadster-precision/`. Run `node tools/roadster-precision-review.mjs` for isolated previous/current renders. Edit the module directly; the older `tools/refine-roadster.py` regenerates only the earlier model. Independent wheel/wing groups remain intact; rear boost and downward jets follow the revised outlets. Physics, camera and music are unchanged. Recording is paused for review; no fullscreen demonstration is currently staged.

## Current landing revision

The user rejected the shared approach/landing pavement, distant descent camera, post-landing disorientation and Shift-only automatic spin. The ramp now keeps the tall reference curl while progressively bending 14m left. Its actual departure tangent aims at a separate receiving runway, about 59m from the approach centreline at touchdown. The receiving road extends 30m behind the contact point and stays straight for 130m afterward. Flight and ground coordinates share the same position, yaw, lane basis and terminal speed; no touchdown lane-sign flip or sideways correction is applied.

The view tracks beside the car during ascent, briefly widens at departure (under one second), returns to a short close front/side thruster shot, then pans around the car on a curved path from 0.75–2.55s after departure. The cosine orbit starts earlier and has a lower peak turn speed. Camera position and look target travel with the car and use matching smoothing; follow distance, height and look-ahead blend continuously over the final 1.65 seconds instead of switching at a height threshold. Rear chase stays active throughout touchdown and acceleration. C toggles continuous chase. Ground steering and boost are active immediately on touchdown. The flight remains assisted and follows the ramp's departure tangent; this is not a full rigid-body vehicle simulation.

## Original soundtrack

**Ignition Vector** is an original instrumental generated with ElevenLabs Music through Atlas MCP. The direction draws on the classic Asphalt 8 mix of electronic, bass and rock: driving breakbeats, synth bass and guitar accents. No Asphalt recording or reference audio was supplied. The retained source is 96.024s; the locally mastered looping MP3 is 95.6s, stereo 48kHz/192kbps, approximately -16.25 LUFS. The requested 150 BPM is not a measured guarantee.

Music begins with the race after a user gesture. It softens and filters during the gravity flight, returns on landing, and lifts slightly under boost. Pause preserves the playhead. SOUND controls the whole mix; the pause screen has a separate music-volume slider. Both preferences persist. The dock stops playback, and a failed audio download cannot block racing. Existing engine audio remains procedural.

`npm run race:audio` checks real browser decoding/output, mute, pause/resume, volume, airborne/landing mix, dock stop, persistence and failed-request recovery. Source, generation receipts, mastering measurements and research links are in `references/racing/music/`; runtime credits are in `racing/audio/credits.json`. `tools/master-racing-music.py` reproduces local processing with FFmpeg. No API key is needed to play the track.

## Controls

- A/D or left/right arrows: steer; automatic acceleration.
- Shift/Down plus steering at the lip: initiate rotation immediately. A deliberate gesture within 0.15s after takeoff is also accepted after a 0.05s hold. Shift alone does not spin, and later input cannot start a trick. Hold the combination to build a turn; releasing early damps rotation. A nearly complete turn eases forward to 360° with continuous angular velocity, instead of overshooting and rewinding. One sustained gesture produces one turn. Nominal gravity flight is 4.1s (boost can shorten it further), with 14m/s rolling touchdown. Driven yaw is capped at 2.6 rad/s; final alignment remains assisted.
- Space: boost. Drift, pickups and completed rotations replenish reserve.
- R / Practice Gravity Launch: retry the launch approach with countdown.
- C / Camera: automatic sequence or chase view.
- Escape / Pause: pause. Phone touch steering/drift/boost can be combined.

A new `meridian.airborne.separate.v3.best` key isolates records from previous route layouts.

## 404 and Atlas provenance

The active ramp is `assets/ramp-banked.js`. Three source-derived bends (10m, 14m, 18m) were built and passed the canonical four-view verifier: `references/racing/separated-landing/candidates/_verify/`. The middle bend preserves the narrow curl with adequate receiving-road clearance. It modifies the existing reference-driven 404 module; it is not an imported mesh. Original `assets/ramp.js`, Roadster, `assetlib.js`, `surfaces.js` and `app/` remain unchanged. Existing Atlas concrete and rock textures are reused. No additional texture generation was needed. Atlas receives source/game comparison frames for visual critique; receipts are in `evidence/racing/separated-landing/`.

The latest source review revisited the reference's close replay (roughly 17.5–27.4s), high aerial replay (27.4–31s), and wide replay. The playable sequence adopts the useful wide/close transitions without replaying or rewinding the player's action. Source frame analysis remains in `references/source-study.json`.

## Verification and limitations

- `npm run race:simulation`: 20 slow/off-centre entries; separate-road clearance; matching touchdown position/attitude/lane; Shift-only and late-input negative cases; held versus released rotation; both post-land steering directions/boost; full route and restart.
- `npm run race:transfer`: real keyboard lip gesture, per-frame visibility, sub-second wide highlight, close thruster view, early chase before contact, actual left/right steering and boost after landing.
- `npm run race:test`: complete real-input course, countdown, boost, steering, restart, camera toggle and emulated phone touch.
- `npm run race:check`: canonical 404 parse/path checks. The three new ramp candidates are clean; unchanged older assets retain their previously documented verifier warnings.

Current camera visual evidence: `evidence/racing/smooth-flight/{wide,close,pan,rear,touchdown}.png` (paused runtime poses) and `evidence/racing/smooth-flight/report.json` / `telemetry.json` (real input). `tools/capture-landing.mjs` regenerates those stills. Older MP4s and `evidence/racing/final/` depict earlier layouts and are historical; no new video export is claimed.

Remaining limits: stylized terrain is still repetitive and sparse in places, flight leveling is assisted, barrel-roll ramps are absent, and no physical-phone performance or live competition-gate pass is claimed. This is an original Asphalt-inspired prototype, not an exact reproduction of its physics or production quality.

The pre-change build is backed up outside the repository at `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-separated-landing-20261027.tar.gz`. Read `HANDOFF.md` before continuing.

Atlas review operation `0183b1e1-5aaf-4422-9017-288377acf005` (5 credits) passed the hooked silhouette, close descent and distinct camera stages. Road-to-flight geography and surface detail remained partial. Follow-up moved hints away from the car and enlarged desktop control text. The review does not certify motion; actual-input tests cover the landing handoff.
