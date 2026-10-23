# Aetherwild: The Broken Horizon

An original single-player 3D adventure prototype in Mossglass Basin. This is an early feedback build, not the completed enormous game. Voxel Vault is a separate project and is unchanged.

## Launch

Requires Node 20+ and a modern Chrome or Edge browser with WebGL 2 and hardware acceleration. No package installation is needed.

```sh
cd /Users/danielyoo/aetherwild
npm start
```

Open **http://localhost:3015**, choose **Begin expedition**, then click the game to capture the mouse if necessary. Escape opens the pause fieldbook. Browser saves belong to the current URL/origin.

## Controls

| Input | Action |
|---|---|
| WASD | Move |
| Mouse / arrow keys | Look / turn camera |
| Shift | Sprint; hold with attack for a heavy strike |
| Space | Jump; press again while airborne to deploy sailcloth; dismount raft |
| E | Interact; lift/place a Threadbound component |
| Q | Enter/leave Threadbind |
| R / mouse wheel | Rotate held part / adjust placement reach |
| F / Z | Detach selected part / undo construction |
| Left / right mouse | Attack / block; guard timing can stagger an attacker |
| C / H | Dodge / drink healing broth |
| I / J / M | Satchel / journal / field map |
| Escape | Pause / return |
| Backquote | Debug overlay |

Settings include control remapping, camera sensitivity/inversion, text size, contrast, reduced motion, captions, audio levels, sprint toggle and render quality. Standard gamepad input is implemented but has not been verified with physical hardware.

## First things to try

Meet Sella at camp, look toward the northern weather intake, and investigate the broken aqueduct. Threadbind can move the marked panels into its brackets; a recall winch recovers misplaced essential parts. The journal describes the current objective and authored alternate routes.

The code includes the basin quest, construction, encounters, intake puzzle, routing choice and reward. Initial browser checks cover startup/title/new/continue rendering and position restoration, walking to Sella, all four introduction dialogue pages, the resulting objective update, pause and camp presentation. The complete adventure journey, movement feel and performance still need playtesting. See [BUILD_STATUS.md](BUILD_STATUS.md) for exact scope and verification.

## Checks

```sh
npm test
npm run check
```

Eleven logic tests cover inventory, quest transitions, save validation/recovery/migration and blueprint transactions. Syntax checks are separate from actual playtesting.

All world art, writing, interface and synthesized audio are original. Three.js is MIT licensed; see [ASSETS.md](ASSETS.md). The design and expansion plan are in [GAME_DESIGN.md](GAME_DESIGN.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
