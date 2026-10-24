# Aetherwild · The Broken Horizon

Original single-player 3D adventure, version 0.4. The Last Forecast chapter and Echo courier puzzle are playable; the three-layer campaign remains in development. Voxel Vault is separate and unchanged.

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
