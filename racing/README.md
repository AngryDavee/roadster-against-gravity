# Meridian / Against Gravity

An original arcade racing adaptation of the Roadster film. A coastal aerospace circuit at violet dusk combines high-speed straights, charge pickups, drift corners, smaller launch wedges, a covered technical sector, an elevated coastal road and the original overhanging gravity ramp.

## Run

From the repository root, with Node 22.12+:

```sh
npm ci
npm run race
```

Open http://localhost:4175. This directory is a standalone static application: its modules, assets, vendor library and textures all stay inside it. No Atlas key is required to play. The original film is unchanged in `../app/`, served by `npm start` at port 4174, and recoverable from Git tag `film-baseline-2026-10-26`.

## Controls and race

- A/D or Left/Right: steer. Acceleration is automatic.
- Shift or Down: drift/brake; steering during a drift restores charge.
- Space: cold-gas boost. Charge is finite; pickups, drift and landings restore it.
- Escape or pause button: pause/resume. Losing focus pauses the race.
- Phone: hold the on-screen steering, drift and boost controls. Two-finger combinations work.

Complete two laps against five simulated drivers. Their progress, lane choice, charge use and collisions are simulated; they do not teleport to the leader. They can take the same ramps and pickups. Different control patterns make them competitive, while skilled play can win. This is local AI racing, not network multiplayer.

The main gravity ramp is optional. Follow the cyan center approach at speed; use the side lanes for the normal road bypass. The original ramp geometry and ascent curve are preserved. After launch, cold-gas thrust transfers the car sideways to the return straight. Steering trims the landing; boosting stabilizes it. This is a deliberately assisted arcade traversal, not a free-flight vehicle simulation. Ordinary wedges launch the car; drifting at launch adds a flat spin.

Results appear when the player finishes. Rivals still racing continue to finish, and the classification updates rather than inventing their final times. The player's best time is saved locally when browser storage is available.

## Research and art

The design draws on Gameloft's documented route/jump/trick/boost loop, while using an original setting and interface. Research and concrete design decisions are recorded in `../references/racing/design.md`. There are no copied Asphalt tracks, UI assets or car meshes.

Atlas MCP generated the gameplay target and coherent hangar/tower/wedge sheet. The generation completed in private project `254a8025-503f-4a33-8ed8-e0394c884d2d`, operation `a1b9f6c9-66de-4290-b1a0-b32a10012edd`, with 54 credits recorded. The concept's car and straight ramp differ from the source subject, so the preserved procedural Roadster and original overhang remain authoritative. Existing Atlas concrete maps are reused. All three new props were built through three independent construction strategies, verified, viewed from multiple sides and selected. Receipts and choices are in `../references/racing/`.

The continuous road, coastal ground, sea and horizon are procedural scene surfaces. Discrete machinery and structures are 404 asset modules. Jets, trail particles, markings and pickup indicators are runtime effects. Motor sound is a synthesized Web Audio cue; no music track is included.

## Verification

```sh
npm run race:check       # canonical 404 module/path shipping checks
npm run race:simulation  # boost, collisions, jumps, ramp, fairness, finish/restart
npm run race:test        # starts isolated server; complete real-input race + phone checks
npm run race:verify      # asset geometry views; retained original-ramp warnings
```

The browser driver reads telemetry but operates through keyboard, pointer and touch input. It checks countdown, boost, steering direction, pause, two full laps, gravity transfers, pickups, drift, results, restart and mobile interaction. A complete driven race took about 107 seconds in the recorded run. Simulation tests assert finite positions, bounded charge, continuous progress, a traversable road bypass, all rivals finishing and a skilled player winning.

Selected geometry: **6/7 clean**. All three new props pass. The original ramp still triggers its documented broad-front/back featurelessness warnings; the warnings are retained. No live jam-gate pass or real-phone frame-rate claim is made.

`../evidence/racing/playtest/` contains actual-input race evidence. `../evidence/racing/final/` contains deliberately staged visual-inspection views, including the corrected jet shader. Earlier baseline/review folders document superseded visual iterations. The first driven race exposed a jet shader domain error and a sub-metre ramp-entry progress regression; both were corrected, with the progress invariant covered by simulation tests.

## Continue editing

| File | Responsibility |
|---|---|
| `track.js` | Circuit spline, road width, ramp transfer endpoints, wedges and pickups |
| `simulation.js` | Fixed-step race, rivals, collisions, charge, stunts and classification |
| `world.js` | Track surfaces, coast, scenery, Atlas material and asset placement |
| `main.js` | Input, camera, HUD, effects, sound and persistence |
| `assets/` | Selected 404 geometry; original Roadster and gravity ramp preserved |
| `candidates/` | Three constructions for each new prop, plus verifier evidence |
| `STYLE_LOCK.md` | Shared visual direction |

This is the first playable racing iteration. The environment still needs richer landscape detail, the camera and handling need human playtesting, and rival vehicles currently share the Roadster geometry with distinct colors. Wheel geometry is static in this build. No career, additional circuits, multiplayer, vehicle damage system or production-quality soundtrack is claimed. The cinematic's exported MP4 is still the original film, not a recording of this game.
