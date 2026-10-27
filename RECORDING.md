# Play and record Meridian on another PC

This snapshot is on **`feature/airborne-racing`**, not the default `main` branch. It includes the latest Roadster, separate landing runway, smoother camera pan, responsive spin, original soundtrack, and updated comparison player.

## Install and start

Install Git and Node.js 24. Use a desktop with a WebGL2-capable browser and hardware acceleration enabled. Commands below work in PowerShell, Command Prompt, macOS Terminal and Linux shells:

```sh
git clone --branch feature/airborne-racing https://github.com/AngryDavee/roadster-against-gravity.git
cd roadster-against-gravity
npm ci
npm run race
```

Leave this terminal running. Open **http://localhost:4175** on that PC. The URL serves your local copy; it is not a public deployment. For an existing clone, switch to `feature/airborne-racing`, run `git pull --ff-only`, then `npm ci`. Preserve any local edits before switching branches.

`npm ci` downloads the automated test browser. If that download was skipped or fails, restore internet access and run `npx puppeteer browsers install chrome`. No Atlas/API key, Python, FFmpeg, Unity, Unreal or Blender is needed to play or screen-record. The initial clone includes source media and is larger than a typical code-only repository.

## Manual gameplay

Choose **START SOLO RUN** for the complete route, or **Practice Gravity Launch** to begin near the tall ramp. Acceleration is automatic. Wait for the countdown.

| Control | Action |
| --- | --- |
| A/D or left/right arrows | Steer |
| Space | Boost while reserve remains |
| Shift or Down + steering | Drift on the road; initiate rotation near a ramp lip |
| C / Camera button | Toggle automatic cinematic camera and continuous chase |
| R | Restart the gravity approach with countdown |
| Escape / Pause | Pause or resume |
| SOUND / pause music slider | Mute or adjust the soundtrack |

For the gravity spin, align with the lit ramp, then hold **Shift + D** (or Shift + A for the opposite direction) just before leaving its top. Keep holding to build one turn. Shift alone does not spin. Releasing early damps rotation; near completion, landing assistance eases the car forward into alignment. There is a small takeoff timing allowance, but starting the gesture well into flight will not activate a spin. Nominal gravity airtime is 4.1 seconds; boosting can shorten it further.

Use **CAM / AUTO** to record the brief wide highlight, close-up, smooth pan and rear landing view. Keep driving after touchdown until **COAST CONQUERED** appears. The run is solo; there are no opponents. Losing window focus pauses the game: return to it and Resume if necessary.

## Let an AI agent perform the recording run

The included helper drives through real keyboard events. It does not teleport the car, change physics or accelerate playback. It performs a deliberate spin, both landings and the finish. It does **not** record video itself; use your screen recorder with desktop audio enabled.

1. Keep `npm run race` running in terminal 1.
2. In terminal 2, from the repository root, optionally validate this PC first:

   ```sh
   npm run race:rehearse
   ```

   This runs headlessly and should print `RUN_COMPLETE`. Results are saved in `evidence/racing/recording/rehearsal.json`. A rehearsal verifies the route, not the quality of a screen recording on this PC.

3. Stage the visible recording window:

   ```sh
   npm run race:record
   ```

   Wait for `FULLSCREEN_READY`. The helper opens a fresh fullscreen browser and waits at the start screen. Do not click Start manually during this automated run.

4. Start your screen recorder and confirm it captures the staged browser and desktop sound. Only after the user confirms recording is running, the AI agent should execute in terminal 3:

   ```sh
   npm run race:record:go
   ```

   The helper brings the browser forward, starts the countdown and drives. Keep that browser focused; do not press gameplay keys or switch applications during the run. If it pauses after a focus change, return to the game and Resume.

5. Leave **COAST CONQUERED** visible briefly, then stop your screen recorder. The helper leaves the results window open and writes `recording-run.json` and `recording-finish.png` under `evidence/racing/recording/`. These are proof of the run, not the recorded video. If the run fails, inspect `run-error.txt`, correct the issue and stage a new run. Stop the waiting helper with Ctrl+C when cancelling.

The ready signal uses the OS temporary directory automatically. Do not use an old Mac-specific `/tmp` command copied from historical handoff entries. Run staging and the ready command under the same OS account/environment. A fullscreen recording requires a graphical desktop; use `race:rehearse` on a headless machine. If a platform blocks fullscreen, report it and use a normal browser/manual fullscreen rather than claiming the automated recording is ready.

## Comparison version

In another terminal run `npm start`, then open **http://localhost:4174** and select **Compare**. This player uses the same current car beside the reference video. Its 1,094 frames, source frame rate and cuts are preserved; it is a cinematic player, not the racing controls above. The committed MP4 export is historical and still contains the previous model. Updated player stills are in `evidence/film-current-roadster/`.

## Instructions to give your next AI agent

> Read AGENTS.md, RECORDING.md and the newest HANDOFF.md section. Use branch feature/airborne-racing. Install with npm ci, start npm run race, and rehearse with npm run race:rehearse. Then stage npm run race:record and wait for me to confirm my screen recorder is running before issuing npm run race:record:go. Perform the full route and spin through the supplied keyboard-driving helper, ending on COAST CONQUERED. Preserve the current car and gameplay; do not rebuild or retune anything just to record. Do not commit/push further changes unless I ask. Tell me about any failed checks or recording limitations.

For continued development: gameplay is in `racing/simulation.js`, ramp motion in `racing/transfer.js`, cameras in `racing/main.js`, and the model in `racing/assets/roadster-precision.js`. The comparison uses a byte-identical copy in `app/assets/roadster-precision.js`; keep them synchronized when changing the car. Keep future generated assets/reviews on Atlas MCP and follow the pinned 404 recipe. Recorded measurements and limitations are in HANDOFF.md.
