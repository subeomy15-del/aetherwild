# Aetherwild · The Broken Horizon

## Latest local build: v0.6 — expanded lower lands

Run `npm start`, open http://localhost:3015 and choose **Surface expedition** in an empty save slot to try the lower-world expansion immediately. Normal **New expedition** still starts in the enlarged sky. Use WASD, Shift to boost the survey skimmer, E to interact, Space to dismount, M for the surface map and discovered-outpost travel. Outposts can recover the same vehicle if lost. Existing saves migrate automatically; occupied slots are preserved. This local increment has not been deployed to GitHub Pages.


Original single-player 3D adventure, local version 0.5.1. The enlarged sky overworld, retained Last Forecast chapter and Echo courier puzzle are playable; the three-layer campaign remains in development. Voxel Vault is separate and unchanged.

## Play online
[Play Aetherwild on GitHub Pages](https://subeomy15-del.github.io/aetherwild/)

The Pages workflow runs the tests and source checks, then publishes the playable dist directory on pushes to main. Browser saves belong to the current origin, so GitHub Pages and localhost keep separate expeditions.

## Run
~~~sh
cd /Users/danielyoo/aetherwild
npm start
~~~
Open **http://localhost:3015** in Chrome or Edge with WebGL 2. Node 20+; no dependency installation. Continue restores the latest expedition. New Expedition opens three named slots and never replaces an occupied slot. Existing local save remains slot 1.

## Controls
| Input | Action |
|---|---|
| WASD / Shift | Move / sprint |
| Mouse / arrow keys | Camera |
| Space | Jump, ledge recovery, deploy/fold sailcloth, dismount |
| E | Interact, lift/place, confirm Rise |
| Q / Tab | Use/cancel selected ability / wheel |
| 1 / 2 | Threadbind / Rise directly |
| R / wheel | Rotate held part / placement reach |
| F / Z | Detach / undo recent construction |
| Left mouse or X | Light blade attack |
| Shift + attack | Heavy armor-breaking strike |
| Right mouse / C / T | Guard and timed parry / dodge / target lock |
| H | Healing broth |
| I / J / M / Escape | Satchel / journal / map / pause |
| Backquote | Frame/render/gameplay overlay |

Keyboard controls are remappable. Standard gamepad mapping exists but physical hardware and full navigation have not been verified. Settings expose working graphics budgets, independent audio buses, text/captions/contrast/motion/camera/climb/sprint options and optional guidance.

## Try
Meet Sella and follow Eda's signal north, or investigate before formally accepting the quest. Threadbind the panels into the crossing brackets; swimming and western stones are alternate approaches. Recall winches recover essential parts. At Bellwether, set the weight on its cradle, read the regulator, choose a water route and return to Sella.

Rise through the marked intake canopy for a skiff blueprint and materials. Reconstruct the skiff, move it onto water with Threadbind, approach and board it. The root choice awakens an updraft in the Listening Hollow; the channel choice reopens a road crossing.

## Checks
~~~sh
npm test
npm run check
~~~
21 tests pass; 16 modules pass syntax/import checks. Chrome journeys covered construction, combat, Rise, puzzle/reward, save/reload, settings and the reconstructed raft. Exact evidence and gaps: [BUILD_STATUS.md](BUILD_STATUS.md). The 20–40 minute sky/surface/underground milestone is not complete.

For isolated testing open http://localhost:3015/?qa=1; this uses tab session storage instead of ordinary saves/settings. All game meshes, writing, interface and synthesized audio are original. Three.js is MIT licensed; see [ASSETS.md](ASSETS.md).


Local v0.4: speak with Sella, then examine the courier east of camp (reset winch at 15, 91). Select Echo with 3 or Tab, confirm with E after the weight passes the amber plate, and cancel with Q over the plate. Threadbind is an alternate solution. Read the nearby archive for a saved pattern and testimony. Controls are remappable. This branch has not been published to GitHub Pages.


In-progress v0.5 on feature/hyrule-world-target: new expeditions start above a cloud-hidden surface with separate ability shrine sites. This draft is not published and its complete shrine-to-hub route is not yet browser-verified. WORLD_REFERENCE.md records the subsequently supplied Hyrule maps; the traced coastline is not yet active terrain. Existing basin expeditions remain loadable.

Local v0.5.1 now has an active, enlarged reference-derived sky overworld. Start a new expedition in an empty slot; use wind-ferry docks to visit the separated shrine entrances and optional satellite stops. Inside a shrine, Pause → Return to archipelago exits safely. The full campaign and supplied surface map remain unfinished; see BUILD_STATUS.md for actual verification.
