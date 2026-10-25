# Roadster film — continuation handoff

## Latest iteration: October 26, 2026

The user approved evolving the concept into an original Asphalt 8-inspired racer while saving the film. The film is preserved under tag `film-baseline-2026-10-26` (commit `13daaed`) and remains unchanged in `app/`. Work continues on branch `feature/airborne-racing`, with a separate static game folder `racing/`. Read `racing/README.md`, `racing/STYLE_LOCK.md` and `references/racing/design.md` for current gameplay work. `npm run race` serves it on 4175; `npm start` still serves the film on 4174.

The adaptation has a complete two-lap coastal circuit, five AI rivals, keyboard/touch controls, drift/boost/pickups, regular jumps, an optional traversal of the original gravity ramp, pause, local best time and finish classification. New hangar/tower/wedge geometry follows the Atlas reference → three candidates → canonical verifier → visual selection workflow. Source material and evidence are in `references/racing/` and `evidence/racing/`. The newer racing scope intentionally adds scenery and a HUD; the no-HUD and fixed-edit requirements below still apply to the preserved film only.

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
