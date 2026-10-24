# Systems — v0.5.1 with retained foundations

## v0.6 surface ownership and budgets

`surface-data.js` owns pure terrain/region/road definitions and validated survey state. `SurfaceWorld` owns streamed rendering, local tree colliders, outpost interactions, skimmer presentation and the full surface map. `World.surfaceAt` uses the same sampled grid as rendered nearby terrain. Original basin heights remain intact inside 205 units; a graded transition joins expanded terrain.

Terrain uses 400-unit chunks, at most 9 × 9 active, two builds per frame, near/far grid detail and a coarse distant backdrop. Expired chunk geometries and instance buffers are disposed. Tree collision queries use neighboring tiles. This is kinematic collision and vehicle movement, not rigid-body assembly physics. Surface bounds are ±6,000 X / ±5,000 Z. Save schema 7 adds validated outpost visits, puzzle facts, mirror angles and one skimmer transform; session streaming state is not serialized. Schemas 1–6 migrate without erasing prior facts. Field rewards use atomic transactions and saved idempotence flags. Held-object/Echo bounds now allow surface construction within world limits; existing part caps remain.


## Stack and ownership
Vendored Three.js r160, native ES modules, dependency-free Node HTTP server and node:test. M4 / 16 GB target: 60 fps High, 30 fps fallback. Representative browser observations are in BUILD_STATUS.md.

core.js owns validated serializable state, inventory transactions, quest facts, blueprint data and save envelopes. save-slots.js owns three slot identities, preserving the original key for slot 1. game.js coordinates simulation/interactions/combat. world.js and environment-art.js own presentation and authored collision surfaces. player.js owns kinematic movement/camera. characters.js and creatures.js own models/animation. input.js normalizes inputs; ui.js/options.js own focus and options; audio.js routes synthesized sound; rise.js validates and animates ceiling traversal. Stable IDs connect these systems; live meshes are not save data.

## Budgets and simulation
Variable frame delta capped at 40 ms. One compact basin is loaded together: no streaming claim. Heightfield plus authored platforms and bounded cylindrical/gate collision, with explicit camera obstruction checks. Kinematic construction avoids general joint/force explosions.

24 placed components; 12 blueprints of up to 12 parts; 12 recent construction snapshots; 12 map pins; three authored enemies with perception/return limits; 64 short-lived impact effects; 64 root wind motes. Grass is instanced and quality-scaled. One directional shadow map, authored local intake light. Renderer debug reports frame time, draw calls, triangles, component/enemy counts and GPU resource counts; these are not total-memory measurements.

## Ability rules
Threadbind selects nearby marked panels/weights/rafts. A preview validates distance/placement and compatible authored sockets. Rotation is yaw in quarter turns; arbitrary three-axis surface joints are not implemented. Cancel restores the lifted part; detach/undo are bounded. Blueprint resource operations clear incompatible earlier transform undo history. Recall winches recover essential parts. Mounted rafts must be dismounted before lifting/dismantling.

Rise accepts an authored stable canopy, at most 3 paces thick and 16 above the player, with bounded standing-room/obstacle checks. The preview shows the exit/rejection. A 1.35-second ascent freezes ordinary locomotion; cancel restores entry. Cost commits on arrival. Moving/unsurveyed ceilings are rejected. No world/inventory/time reversal.

Blueprints serialize part kinds and relative position/yaw. Reconstruction validates IDs, limits, bounds and costs before spending. Ground/raft buoyancy normalization ensures stable placement. They reconstruct actual working components; general joints, powered settings and broad assembly physics remain future work.

## Persistence
The retained save format began at schema v4, migrating v1/v2/v3; current schema 6 extends it, retaining inventories, quest facts, discoveries and builds while retaining expedition metadata and adding Echo/the courier when capacity permits. localStorage stores checked payloads with checksum, staging readback, atomic main-key replacement and prior backup. Slot 1 retains aetherwild.save.v2 for backward compatibility; other slots have independent keys. Occupied or corrupt slots cannot be silently replaced. Loading another expedition requires confirmation and saves the current one first.

Position, safe respawn, health/stamina, inventory, facts, discoveries, collection/defeats, objects, patterns and pins persist. Unsafe air/water/combat saves use safe ground. Riding state is transient; the raft and its position persist, allowing reboarding. Settings are separately validated. Normal origins have independent browser storage; ?qa=1 isolates QA in tab sessionStorage.

## Interaction matrix
| Pair | Implemented behavior | Boundary |
|---|---|---|
| Water + player | Swimming, stamina, safe recovery | Authored basin level |
| Water + raft | Float placement, steering, shallow-bank stop | Kinematic hull |
| Wind + sailcloth | Bounded root updraft and controlled descent | One authored volume |
| Weight + cradle | Matching 60 kg part opens iris | Iris latches for recovery |
| Water choice + world | Root updraft or physical road crossing | Local persistent facts |
| Fire / electricity / ice / broad heat | Planned | No silent simulation |

Menus stop gameplay input/simulation. Escape cannot resume a defeated character. Loss of pointer capture/focus pauses play. Physical gamepad navigation/rebinding and disconnect handling need a dedicated verification pass.

## Echo ownership and lifecycle — v0.4

motion-history.js owns session buffers: 24 tracks, at most 162 samples each, maximum 20 Hz and eight seconds. Removed IDs are pruned. Discontinuous moves above four paces start a new history rather than traversing a teleport. Playback copies the bounded path, interpolates yaw through the shortest arc, clamps its own frame step and checks swept poses every 0.2 paces. It stops before world bounds, terrain, authored obstacles, another part or the player. These conservative kinematic checks are not general continuous rigid-body collision.

echo.js owns targeting, path/endpoint meshes and playback. During playback it is the sole transform writer. The courier’s driveStopped flag disables its normal rail driver and persists its settled state. It costs 10 stamina plus 2/second; grounded regeneration is disabled while returning an object. Attached parts, seated vehicles and nearby passengers are rejected. There are no joint assemblies or carried passengers to restore.

Only play frames advance histories and the courier. Menus/focus loss freeze them; reopening the ability wheel or switching abilities cancels playback. Saving cancels at the current valid transform, then writes a stable snapshot. Loading/new expeditions clear histories. Death freezes gameplay, retry cancels; travel/recovery cancels. Discrete construction undo does not undo rewards or inventory. History/time samples are never serialized. The original eight-second recording is consumed on cancellation/completion.

The courier archive uses claimCourierArchive for one atomic materials/blueprint/collected-fact transaction. Reset is recoverable and does not revoke or repeat rewards. v3 migration appends the tutorial courier only if the 24-part cap permits; its winch can restore it after an owned part is dismantled. No full slot is overwritten.

## In-progress sky journey architecture

journey-state.js holds schema-5 chapter/equipment facts and atomic single-material binding. sky-journey.js coordinates authored shrine sites, recovery, presentation visibility, descent and the glider quest. sky-art.js and sky-landscape.js own prototype land geometry and matching surface queries. sky-map-data.js supplies the active reference-derived overworld topology. Sky solids/parts use stable IDs; render groups can change parents, and removal detaches from their current parent. ?qa sessions omit pointer capture for keyboard/arrow-camera automation; normal play retains pointer capture. Full-route runtime verification is outstanding.

## Expanded sky overworld — schema 6

sky-overworld.js owns reference-derived terrain, an identical collision interpolation, adjusted map rows, instanced vegetation, water, shrine/dock definitions and stable satellite IDs. A separate presentation group prevents legacy trial geometry from being scaled with the overworld. Journey scene values distinguish overworld, legacy trial, and individual ability trials. Entry/return switches collision space immediately. Player coordinates may reach ±2,600 only in the sky overworld; legacy basin/trial validation remains narrow. Component/blueprint limits are unchanged.

Wind-ferry motion has one authoritative journey writer, a bounded high-arc route and runtime-only progress. Menus freeze it; cancellation returns to the departure dock; loading clears runtime motion. Saves during flight use the stable departure position. Map rows match the authored satellite channel adjustments. Sky water uses a local water-height query; original basin water keeps its existing level.
