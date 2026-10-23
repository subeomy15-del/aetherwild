# Build status

Version 0.1.0 — early preview checkpoint. Milestone 1 is not complete.

## Runs
Standalone project in `/Users/danielyoo/aetherwild`; Voxel Vault is unchanged. Node 24 serves the vendored Three.js browser game. Run `npm start`, then open http://localhost:3015 in Chrome or Edge. No dependency installation is required.

## Present in the preview
- A stylized surface basin with Reedwake Camp, a visible weather intake, water, vegetation, ruins and seven discoverable location IDs. Distant sky islands are scenery.
- Third-person movement and camera; sprint, jump, sailcloth, swimming, assisted mineral climbing and raft riding are implemented in code.
- Threadbind lifts panels, a ceramic weight and a raft; rotation, socket previews, attachment, detach, undo and local puzzle resets. Curated kinematic construction, not general-purpose joint physics.
- Two enemy archetypes across three actors; blade attacks, heavy attacks, dodge, block, timed guard, damage and retry are implemented.
- Sella dialogue and persistent quest facts; a counterweight intake puzzle, a water-routing choice, return-to-camp reward, +30 stamina and an ending screen are implemented.
- Title/new/continue, pause, inventory, journal, field map/pins, blueprint recording/reconstruction, settings and credits. Versioned browser-local saves with validation, checksum, staging and backup.
- Original procedural meshes, interface and synthesized audio; capped active component/effect counts and a debug overlay.

## Verification completed
- Workspace and M4 / 16 GB hardware inspected. No applicable AGENTS.md found in the workspace search; Unity, Godot and Unreal were unavailable.
- Chrome startup, title, new game and continue render checked; continue restored player position. Holding W moves the player. Camp presentation visually inspected and instanced vegetation rendering corrected.
- Walked to Sella, opened her introduction, advanced all four dialogue pages and observed the objective change to reaching Bellwether Intake. Pause menu opened successfully.
- `npm test`: 11 logic tests pass for inventory transactions, quest ordering/reward prerequisites, save round trips, corruption/backup recovery, migration, failed writes and blueprint transactions/IDs/limits.
- `npm run check`: syntax and local imports checked for eight source modules.
- Fixed buried starting panels, a hovering weight, duplicate rapid reconstruction IDs and invalid blueprint placements that could make saves invalid.

## Limits and unverified behavior
This is an immediate feedback build. The full NPC → construction → encounter → puzzle → reward journey has not been playtested. Movement feel, camera, puzzle clarity, combat balance, save/quit/continue journeys, menu coverage and blueprint use need runtime verification. A 15–30 minute duration has not been established.

No performance measurements, prolonged memory/object-growth run or physical gamepad test yet. The debug overlay reports frame time, draw calls, component/enemy counts and renderer resource counts; these are not a memory profile. Gamepad input exists but still needs a full control/focus audit.

Saves belong to this browser and origin; local and hosted URLs have separate storage. The basin is loaded together; there is no world streaming. Impulse Vessel, Bloomwake, Echo Lens, general vehicle construction, the full environmental matrix, substantial dungeons/bosses and the enormous three-layer adventure remain planned. No giant-world completion claim.

## Next step
Collect the user's early preview feedback, take the requested short break, then playtest and repair one complete start-to-reward journey. Fix movement, camera, input, construction recovery and progression failures before adding territory.
