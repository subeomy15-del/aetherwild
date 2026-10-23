# Technical systems

## Engine and ownership
Dependency-free browser application on the available vendored Three.js renderer. Node 24 serves static assets and runs stable logic tests. No Unity/Godot/Unreal installed. Hardware target: Apple M4 / 16 GB / 8 GPU cores. Initial performance target: 60 fps at a capped render pixel ratio of 1.5, with a 30 fps fallback; actual measurements belong in BUILD_STATUS.md.

`core.js` owns serializable player, inventory, quest, puzzle and blueprint state. `game.js` coordinates simulation. `world.js` owns render representations, collision surfaces, interactables and authored machinery. `player.js` owns kinematic movement and the camera. `ui.js` owns input focus and overlays. `input.js` normalizes keyboard, mouse and gamepad. `audio.js` routes synthesized music, ambience and effects. Stable IDs connect data; meshes are never save data.

## Bounds
Gameplay uses a variable delta capped at 0.04 seconds per frame, not a fixed-step physics solver. Local heightfield and curated box/radial surfaces provide kinematic collision. Construction is capped at 24 components; effects at 64; this slice has three enemies with bounded perception and return radius. No claim of deterministic general-purpose physics. Kinematic contraptions with documented sockets avoid joint explosions. Rendering uses instancing for vegetation and distant landmarks. The current basin is loaded together; streaming is not implemented.

## Interaction rules
Only marked components can be Threadbound. Selection shows an outline; held components show placement previews. A compatible unoccupied socket, alignment and placement bounds determine attachment; there is no general material stress solver. Undo restores the previous object arrangement. Essential puzzle objects reset locally. Canonical quest facts accept unexpected order and are evaluated idempotently. Menu mode disables player simulation and consumes gameplay input; full menu/device focus testing remains outstanding.

## Persistence
Versioned local saves with validation, checksum, a staging write, verified readback, main slot and prior backup. Browser local storage is per origin. Unsafe airborne, swimming, threatened or dead save positions fall back to recorded safe ground. Important builds serialize component IDs, positions, rotations and socket IDs. See tests for migrations, corrupt saves and transactional inventory behavior. Runtime save/quit/continue journeys still need verification.

## Environmental matrix
| Pair | First slice | Expansion rule |
|---|---|---|
| Water + player | Swim/stamina | Currents and protection |
| Wind + sailcloth | Controlled descent | Sails and selected light objects |
| Heavy object + pressure socket | Authored counterweight | General pressure devices |
| Water routing + roots | Persistent visible local consequence | Layer-aware catchments |
| Fire + dry material | Planned | Bounded ignition; water extinguishes |
| Electricity + wet conductor | Planned | Hop/radius cap, explicit telegraphs |
| Heat + air | Planned | Authored updraft volumes |
| Ice + water/traction | Planned | Eligible volumes, recoverable thaw |
| Water + raft | Kinematic authored riding and shallow-bank limits | General capped displacement and forces |

Planned rows are not silently simulated.
