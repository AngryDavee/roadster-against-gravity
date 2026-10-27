# Roadster film — continuation handoff

## Published snapshot and recording handoff — October 27

The user explicitly authorized a NEW commit and push of the accumulated current build to `AngryDavee/roadster-against-gravity`, branch `feature/airborne-racing`, so a different PC/AI agent can record it. This supersedes earlier no-commit language for this snapshot only. Do not amend/rewrite earlier commits or publish future unrequested edits. Use `git log -1` for the snapshot hash.

**Start with `RECORDING.md`.** It includes clone/install commands for the correct branch, all controls, gravity-spin technique, local game versus comparison URLs, and a prompt to give the next AI agent. Portable commands: `npm run race:rehearse`, `npm run race:record`, `npm run race:record:go`. Keep `npm run race` running separately. The helper uses the OS temporary directory, so older `/tmp/meridian-recording-go` instructions below are historical. It stages a fresh fullscreen browser, waits for the user to confirm the recorder is running, then drives with keyboard events to COAST CONQUERED. It does not record video. New runtime recording evidence defaults to `evidence/racing/recording/`. Local Mac rehearsal is verified (one spin, both landings, finish); the final nine desktop/touch gameplay checks also pass with no browser errors. Windows hardware/fullscreen behavior must be checked on the destination PC.

The immediately preceding user request is also completed: the live comparison film (`npm start`, port 4174) now uses `app/assets/roadster-precision.js`, byte-identical to the latest racing car. Both hero and parked car load it. Named body/wheel/wing pivots, wheel radius, glass reflection, outline intensity and downward gas positions are aligned with the new model. `app/timeline.js`, all 1,094 frames, source sync, camera cuts and stock loader/surfaces remain unchanged. The original film is preserved in tag `film-baseline-2026-10-26` and the prior asset remains in place. Earlier statements that ALL of `app/` is byte-identical to the baseline are superseded by this authorized car update.

Comparison validation: all eleven browser checks passed, canonical parse/path check passed, current model verified clean at 58,274 triangles. Whole film asset verification is 5/7 clean: pre-existing pavement empty-side and ramp featureless-face heuristic warnings remain. Viewed current model verifier views and regenerated comparison frames. `evidence/film-current-roadster/` and `evidence/checks/comparison.png` show the updated car. Existing MP4 exports remain historical; no updated video export is claimed. Backup before the film change: `/Users/adams/Desktop/404_GAMES/local-backups/film-before-current-roadster-20261027.tar.gz` (local only). Playback and recording need no Atlas account; future generated assets/reviews must still use Atlas MCP and the pinned 404 recipe.

## Latest iteration — smooth camera and responsive spin

User requested smoother panning, 0.5s less gravity airtime, and an explanation of input versus mechanical delay. Found a hardcoded 0.45s post-lip rotation dead zone, 0.1s exact-lip hold requirement, a late quintic camera sweep, mismatched camera/target smoothing (12 vs 40), and an abrupt y<8m camera-distance/height switch. These were real mechanical contributors; no claim to have measured the user's hardware/input latency.

`TRANSFER.flightTime` is now 4.1s nominal (boost still speeds the stunt clock). Camera orbit uses cosine easing from 0.75–2.55s; the rig follows vehicle translation before smoothing shot offsets, with equal position/target smoothing during flight. Distance, height and look-ahead blend over the final 1.65s. Reset clears the camera anchor history. Geometry/landing point, latest Roadster, music and original film are unchanged.

Rotation begins on the first simulation step after a valid lip gesture. It requires drift+steer held for 0.05s and accepts initiation until 0.15s after takeoff; Shift alone/late input still do nothing. Driven torque increased from 2.8 to 4.5 and cap from 2.1 to 2.6 rad/s. Near a completed turn, a velocity-matched quintic alignment eases forward to exactly 360°; it no longer overshoots and rewinds. One sustained gesture gives one turn, not repeated spins. Releasing early still damps rotation. Late landing alignment and turn completion are assisted, not rigid-body physics. This also affects the existing small-jump rotation helper; Shift-only negative cases remain tested.

Evidence: `evidence/racing/smooth-flight/` contains original/current camera telemetry, motion comparison, simulation response measurements, real-input transfer report, full-route rehearsal and regenerated paused inspection views. At 60Hz the pre-held gesture first rotates 0.011s after takeoff; a gesture begun just after the lip rotates by 0.095s. Both directions complete without angular rewind; measured flight is 4.117s due to timestep boundaries. Compared runs reduce peak pan speed from about 171 to 126 degrees/s and late camera-distance-change speed from about 52 to 5.2m/s. These are game-clock telemetry metrics, not physical display-latency or subjective-quality certification. Full keyboard rehearsal finishes with one spin and both landings at 25.20s, no browser errors. Canonical racing/film checks, simulation and transfer checks pass. Camera regression now checks normalized angular speed and landing distance change, in addition to framing/controls.

Backup: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-smooth-flight-20261027.tar.gz`. No commits/pushes. Recording stays paused for review; regular game remains at http://localhost:4175. Earlier timing/controls descriptions below are historical and superseded by this section.

## Current vehicle — second reference reconstruction, October 27

The user rejected the previous model and requested much closer photographic similarity. Active model is now `racing/assets/roadster-precision.js`, an extensive revision of selected construction C. Previous `roadster-2026.js`, original `roadster.js`, and all `app/` files remain preserved. Read `racing/README.md` for runtime setup. No commits or pushes are authorized.

Reviewed the Tesla-credited Car and Driver exterior gallery, including twelve additional views and the true overhead photograph (`references/racing/roadster-precision/gallery/01.jpg`). The overhead image distinguishes the actual long tapered rear glazing from the misleading foreshortened front-high view. Rebuilt the continuous flank, rising crease, windscreen foot, rear buttresses, rounded nose plan, front fascia, five sculpted silver wheel faces and recessed four-over-four rear machinery. Glass has a restrained copper tint; low wing and closed lamps follow the ramp footage. Current inferred bounds: 4.930m long × 2.173m wide × 1.252m high. These are photograph-based estimates, not manufacturer CAD or a measured 99% match. Photographic lighting/lens differences remain; the model retains the requested illustrated rendering.

The new module is directly editable and authoritative. `tools/refine-roadster.py` reproduces the previous model only; do not run it expecting to regenerate this revision. `tools/roadster-precision-review.mjs` renders previous/current isolated views. The original three candidate constructions and verification remain under `references/racing/roadster-rebuild/`; this iteration refines their selected continuous coachwork family. Current selected verifier inputs/results are in `references/racing/roadster-precision/selected/` (58,274 triangles, 16 materials, no problems). All four wheel pivots, coachwork and rear wing remain independently articulated. Runtime rear boost and downward-jet emitters were realigned, wheel visual radius is .435m, and glazing reflection/ink intensity adjusted. Physics, cameras and soundtrack are unchanged by this iteration.

Atlas MCP review `7971fbfe-dd31-4e74-8253-afcac6c8aa13` completed for 4 credits. Its critiques prompted nose/shoulder, wheel, rear taper and machinery refinements. Receipt is `references/racing/roadster-precision/atlas-review.json`; the reviewed intermediate comparison is archived alongside it. Later corrections were inspected locally, not claimed approved by Atlas. The final photo/render comparison and current landing views are in `evidence/racing/roadster-precision/`. Comparisons use approximate camera angles and explicitly show the reference wing raised versus runtime stowed. Older MP4s and older evidence directories are historical.

Validation: canonical selected-asset verification, racing and film parse checks, ten real-keyboard transfer/camera/control checks, and all eleven original-film browser checks passed. A full real-keyboard rehearsal completed one deliberate spin, two landings, and COAST CONQUERED at 25.90s with no browser errors. Minor subsequent fascia material/shoulder refinements were re-rendered and geometry-verified. Original `app/` matches `film-baseline-2026-10-26`; stock loader and surfaces match the pinned recipe. These checks do not certify a public competition gate or photographic similarity percentage.

Recording is paused for model review. The old waiting showcase process/browser was stopped; no new fullscreen run is staged. Do not create `/tmp/meridian-recording-go` until the user is ready to record. The regular game server remains at http://localhost:4175. Local backup before this revision: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-precision-roadster-20261027.tar.gz`. Current evidence has been saved locally, without committing.

## Current camera movement — continuous orbit

The user requested a smooth pan from the close side view to the rear, and a visible fullscreen demonstration ending on COAST CONQUERED. Replaced the short Cartesian cross-blend with a polar orbit around the car, 1.15–2.65 seconds after departure, quintic ease at both ends. The brief wide highlight and close shot remain; rear chase is restored well before landing. Actual keyboard telemetry passes the camera/landing checks; 87 sampled pan frames show about 140 degrees of sweep, minimum horizontal radius 7.97m and largest frame angle step 2.85 degrees. Evidence: `evidence/racing/orbit-pan/`. Audio, physics and original film unchanged.

`node tools/showcase-run.mjs --rehearse` validates a full route and intentional gravity spin using only keyboard events. Without the flag it opens a visible fullscreen browser at the dock and waits for `/tmp/meridian-recording-go`; create that file only when the user says their screen recording is ready. It then drives through the actual spin, landing and finish, and leaves the fullscreen results visible. It does not modify vehicle state or playback speed. User recordings are not captured by this script. Rehearsal passed with one spin, both landings and the finish at 25.72 seconds. That earlier fullscreen browser was subsequently stopped for vehicle review; see the current section above. Local backup: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-orbit-pan-20261027.tar.gz`. No commits or pushes.

## Current audio addition — Ignition Vector

User requested Asphalt-inspired original background music. Added `racing/audio.js` and `racing/audio/ignition-vector.mp3`; integration is confined to racing plus audio MIME types/test routing in local tools. Atlas operation `0e8247c0-6501-454b-ad16-68f7dee445da` generated one instrumental with ElevenLabs (27 generation credits; 41 including agent work). Previous Stable Audio pricing attempt produced no audio and cost 11 credits. Total 52. All operations completed, no pending generation. Source is retained under `references/racing/music/`, along with identifiers, provenance, research, measured mastering and a reproducible script. Runtime loop is 95.6s, stereo 48kHz/192kbps, -16.25 LUFS. Music plays only after user interaction, pauses with its playhead intact, softens in gravity flight and returns on landing. SOUND mutes everything; pause offers persistent music volume. Verification passed: `npm run race:audio` (8 checks, decoded loop 95.6s, real PCM output), `npm run race:test` (9 desktop/touch gameplay checks), and `npm run race:check` (37 modules, 1 page). Test with `npm run race:audio`. No reference recordings supplied to generation. Human listening remains the authority for taste/mix; the automated checks do not certify artistic quality.

Backup: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-original-music-20261027.tar.gz`. No commits or pushes. Camera timing, physics, original film and geometry are preserved.

## Current camera revision — brief highlight, early rear view

The latest user request supersedes the continuous tight-shot preference below. Keep the close tracking ascent, briefly widen around ramp departure, return to the close front/side view, then restore rear chase well before touchdown and keep it through acceleration. The reveal envelope runs from -0.18 to +0.65s around departure; the rear blend runs from 1.5 to 2.15s after departure. The existing 4.6s flight and faster launch remain unchanged. Actual keyboard tests confirm a sub-second wider highlight, close shot, early rear framing, deliberate rotation, and working left/right steering and boost after landing (10 checks, no browser errors). Camera smoothing is included in those runtime checks; the measured wider portion lasted 0.533s across 276 airborne samples. Atlas review `05323d3b-72c5-423e-b7b8-2bc7dcae5ce3` (4 credits) passed framing/readability of all four views; this static critique does not certify motion. Canonical racing check passed all 36 modules and one page. C still selects continuous chase.

Current screenshots: `evidence/racing/separated-landing/{wide,close,rear,touchdown}.png`; these are paused runtime poses, while `telemetry.json` and `report.json` record actual driving. No new MP4. Backup before this edit: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-highlight-camera-20261027.tar.gz`. No commits or pushes.

## Previous tuning — tighter camera and quicker gravity maneuver

The user rejected the distant ramp overview and slow pace. The camera now tracks beside the car (~13m desktop ascent distance), then moves into the existing close thruster angle and returns behind the car before touchdown. It no longer fits the entire ramp and both roads. Portrait distance scaling is capped. Flight time is 4.6s (was 5.6s), lip horizontal speed 24m/s (was 18), touchdown speed 14m/s (was 8). At a 48m/s entry, total stunt duration is about 5.93s versus 7.07s (~16% shorter). Driver-controlled yaw remains capped at 2.1 rad/s; its alignment window is adjusted to the shorter flight. Shift alone still does not spin. Ground cruise speed is unchanged. Camera heading stays independent of the car’s ramp rotation to avoid sweeping through the vehicle. Per-frame browser checks pass for close distance/framing and both steering directions after landing; simulation passes the 20 entry cases. Atlas tight-camera review `af0ec804-ee74-462a-aabd-16ff09604cfb` (4 credits) confirms both views avoid a distant overview; ascent silhouette could be clearer.

Backup before this tuning: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-tight-camera-20261027.tar.gz`. All work remains local; no commits or pushes. Current screenshots are regenerated in `evidence/racing/separated-landing/`; `wide.png` has since been regenerated for the brief highlight requested above. Older MP4s remain historical.

## Latest iteration — separate runway and deliberate rotation (October 27)

**No commits or pushes until the user explicitly authorizes them.** HEAD remains `23a3f13`. Previous local build: `/Users/adams/Desktop/404_GAMES/local-backups/meridian-before-separated-landing-20261027.tar.gz`. Work is confined to racing and its tests/docs/evidence; the original film is unchanged.

Atlas review `0183b1e1-5aaf-4422-9017-288377acf005` passed close descent, distinct camera stages and hooked silhouette; route readability/surface detail remained partial. Hint placement and desktop instruction contrast were improved afterward. Receipt: `evidence/racing/separated-landing/atlas-review.json`.

Current authority is `racing/README.md`. The user superseded the prior shared-apron/fixed-X layout. Active `ramp-banked.js` keeps the tall curl and bends 14m left. `transfer.js` matches that centreline and transports the car's frame through it. The lip's horizontal tangent points toward a distinct landing runway (~59m from approach); `track.js` puts its 30m pre-contact pavement and 130m straight run-out on that tangent. Lane coordinates no longer change sign at contact. Terminal flight speed and road speed both begin at 14m/s; the old minimum 8m/s progress floor was removed so motion follows actual speed.

Shift-only automatic full turns were removed. Drift + steering at takeoff enables rotational momentum; held input adds bounded torque, release damps/stabilizes, late input cannot start a new trick, and final alignment remains assisted. The gravity flight is now 4.6 seconds. The small jump uses the same intent rule. Full-route tests no longer demand automatic spins from Shift alone; dedicated positive/negative rotation regressions and real keyboard lip tests replace that obsolete assertion.

Camera: tight tracking ascent → close frontal/side thruster descent → chase before contact. Do not restore a lingering front/side camera after landing; this made steering direction confusing. Actual post-touchdown left/right and boost are now specifically tested. Current comparison stills and input telemetry are in `evidence/racing/separated-landing/`. Old MP4s are historical and do not represent this revision.

Three source-derived ramp candidates passed canonical verification; selected 14m bend keeps the compact curl while providing separation. New asset is separate; original ramp and car modules, stock loader/surfaces, and original film remain unchanged. Reused Atlas textures; fresh Atlas critique examines source vs new wide/close/touchdown views. No new image generation service used.

Commands: `npm run race` (4175), `race:simulation`, `race:transfer`, `race:test`, `race:check`; `node tools/capture-landing.mjs` captures paused runtime poses for visual review. Input acceptance uses real keyboard/touch; staged screenshots are not driving proof. Terrain remains repetitive/sparse, flight is assisted, no physical-phone or competition-gate claim.

## Start here

This is an editable browser cinematic recreating the supplied Tesla ramp stunt with an illustrated 404 game aesthetic. The owner requested a complete portable handoff so a friend or another AI can continue it. The previous racing game is a separate project and is not part of this repository.

Run Node 22.12+ (Node 24 recommended), `npm ci`, then `npm start`. Open http://localhost:4174. No API key is needed to run, edit, test, or export the existing scene. Python 3 is needed only for optional Atlas and study tools. FFmpeg is needed only to regenerate a video export.

## What is finished

- Six procedural asset families with 18 candidates, selected modules, four-side verifier evidence, and an unmodified pinned 404 recipe snapshot.
- Faceted silver Roadster with black glazing, rear light bar, RDSTR plate, rear outlets, underbody jets, wheels and wing; curved ramp, structural supports, floodlights, boundaries, pavement, parked car and service van.
- Five edited shots mapped to one shared action, absolute-time vapor, bloom, grain, contour treatment, night lighting, and Atlas concrete textures.
- Player with start, pause, timeline, chapter selection, playback speed, source comparison, interactive orbit/pinch, screenshot, fullscreen, and UI hiding.
- Full silent 1080p H.264 export in `evidence/export/roadster-against-gravity.mp4`. The `review-*.jpg` and `contact-sheet.jpg` in that folder were decoded from the final export. Earlier `frame-*.png` and other review folders are historical iterations.
- Source master in `app/reference/master.mp4`, supplementary reference videos, stills, style screenshots, PDF study, contact sheets, frame index, event/asset inventories and Atlas receipts. These are included in ordinary Git; no LFS or external media download is needed.

## Non-negotiable timing and visual intent

Source picture: 3840×2160, 1,094 frames, 24000/1001 fps, 45.628916667 seconds. Cut boundaries: 51 / 419 / 656 / 743. The five camera shots repeat one stunt; they are not successive jumps. Audio extends slightly beyond picture and has not been recreated or audited.

`app/timeline.js` owns camera/action mapping. `app/effects.js` owns seeded absolute-time white/cyan cold gas and ground vapor. `app/post.js` owns image treatment. `app/main.js` assembles the scene and UI. Geometry lives in `app/assets/`; edit selected files there deliberately. `tools/make_environment_candidates.py` regenerates venue *candidates*, not the final selected assets; it retains separately authored service-van metadata. Do not overwrite selected geometry with a stale candidate.

The original Roadster images/video define silhouette and mechanical details. The game screenshots define the faceted, ink-edged treatment, purple fill and warm lights. Do not introduce the reference game's trees, racing HUD, lasers or unrelated setting. The source film has a low wing; the supporting rear studio still has a raised wing. Gas is white/cyan, not orange rocket fire.

## Honest fidelity and remaining quality work

Timing/frame count are exact. Geometry, cameras, scale, motion and vapor are visually reconstructed, not pixel-identical or metrically solved. Occluded touchdown and hidden details are inferred. This is a complete first reconstruction, not a claim of exact visual duplication.

The latest blind Atlas review preferred improvements in ramp staging and vapor but called out small action, insufficient ink definition and close-up silhouette. Subsequent work tightened wheel fit, added flush downward outlets, strengthened contours/reflections and moved the descent camera closer. Further car-silhouette and shot-composition refinement remains the clearest quality opportunity.

The canonical asset verifier reports 4/6 clean. Pavement triggers empty side-view warnings because it is shallow and edge-on. Ramp triggers featureless front/back warnings from broad concrete faces. Evidence and rationale are in `references/verification-notes.json`; these are retained warnings, not a passed all-green gate. No live game-jam submission or performance verdict is claimed.

The existing browser suite covers all cuts/poses, desktop input, emulated phone touch, comparison synchronization, orbit, deterministic seeking, end/restart, and failed requests. It does not establish performance on a physical phone.

## Atlas continuation

`tools/atlas_mcp.py` is a small streamable-HTTP MCP client using Python's standard library. Endpoint: `https://mcp.prod-market.atlas.design/mcp`. Set `ATLAS_API_KEY` securely in your environment; macOS also supports the existing launch environment. Run `python3 tools/atlas_mcp.py list` to discover current tools. Use `python3 tools/atlas_mcp.py call TOOL arguments.json` for a tool call. Inspect schemas first; the API is alpha.

Never paste or save a key into this repository. Collaborators need their own authorized workspace key only to regenerate assets. Existing private project links/IDs in receipts document provenance; cloning does not grant workspace access.

Production generated two Google Nano Banana 2.1 references and PATINA concrete maps (41 Atlas credits recorded). The scene uses base color, roughness and normal maps; roughness is remapped to retain matte concrete. A separate anonymous visual review is recorded in `evidence/blind-review/`. No other image-generation service was used. No active Atlas job needs resuming.

## Commands and evidence

```sh
npm ci
npm run recipe:check
npm test
npm run recipe:selftest
npm run recipe:verify  # expected nonzero until the documented heuristics are resolved
npm start
# In another terminal, with the server running:
npm run capture
node tools/capture.mjs --film --width=1920 --height=1080 --output=evidence/export
```

For an alternate server port set `ROADSTER_PORT`; set `ROADSTER_URL` for the capture client. `npm test` starts/stops its own isolated server (override `ROADSTER_TEST_PORT` if needed). The export uses `ffmpeg` from PATH or the `FFMPEG` executable path. Original-source references retain their owners' rights; see `THIRD_PARTY_NOTICES.md`.

Historic study status fields describing “production not started” reflect the preproduction analysis date. They do not override this handoff. The archived study generator is a historical report script; the running scene and acceptance tests have no dependency on it.

## Suggested prompt for another AI

> Read AGENTS.md, HANDOFF.md, STYLE_LOCK.md and the source study. Run the scene and inspect the final export. Continue this Roadster cinematic using the pinned 404 recipe and Atlas MCP for generated visuals. Preserve source cut timing and deterministic seeking. Explain the current limitations honestly, inspect visual changes, and run the documented checks before pushing.
