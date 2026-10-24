# Build status — local v0.4.0

Playable increment: **Echo and The Last Forecast**. The compact Mossglass Basin is runnable. The full campaign, reachable sky/underground loop and requested 20–40 minute expedition are not complete.

## Launch and publication

Run `npm start` in `/Users/danielyoo/aetherwild`, then open http://localhost:3015 in Chrome or Edge. Node 20+ and WebGL are required; the game has no remote runtime dependencies. The existing server is running. Voxel Vault is separate and untouched.

Current work: branch `feature/echo-and-basin-story`, based on `9923ca5`. This increment is local and has **not** updated https://subeomy15-del.github.io/aetherwild/ . The main-branch GitHub Pages workflow remains intact. Localhost and GitHub Pages have separate browser-local saves.

## Implemented in this increment

- Echo: free-object selection within 24 paces, highlighted target, amber recorded path and endpoint, confirm/cancel, bounded eight-second history, shortest-angle interpolation, stamina cost and swept obstruction stops. Cancellation leaves the object at its last valid pose. Attached parts, seated vehicles and passengers are explicitly unsupported and rejected.
- Courier puzzle east of camp: reset winch at (15,91), weight crossing an amber plate, supported ceramic/copper rail, grounded terrain terrace and lifting archive lid. Echo cancellation on the plate solves it; Threadbind placement is an alternate solution.
- Saved, atomic courier reward: testimony, two-panel pattern, 3 copper, 4 fiber and 2 mossglass. Full inventory/pattern capacity does not consume the reward. Repeat collection is prevented.
- Original replacement chapter: The Last Forecast. Eda challenges a network that treats inhabited places as empty; Iri recovers her evidence and gives the basin a local route. Opening, Sella dialogue, notes, ledger, journal, route consequence descriptions and ending are updated. Future Census Engine story is explicitly planned.
- Three-ability wheel, remappable Echo shortcut (default 3), current bindings in pause help and canvas accessibility description, original synthesized descending Echo sound/caption.
- Save schema 4 migrates schemas 1–3 without erasing inventories, choices, rewards, builds or slot identities. Courier settled/driver state persists; histories remain session-only. Full legacy component lists are preserved, with winch recovery available after freeing capacity.
- Closed airborne stamina regeneration exploit. Echo playback suppresses grounded regeneration. Focus loss during Rise cancels transit to its entry point.

## Retained playable foundation

Seven discoverable surface locations; camp/rest/broth, crossing with alternatives, ruins and three enemies across scavenger/sentinel roles, intake counterweight/iris, optional Rise canopy/cache/skiff pattern, hollow/updraft, shore and lookout. Responsive kinematic movement, sprint/jump/glide/swim/assisted climb/mantle, camera obstruction handling, blade light/heavy attacks, guard/timed defense/dodge/lock-on, death/retry.

Threadbind uses curated sockets and free placements, quarter-turn yaw, cancel/detach/undo and essential-part winches. Blueprint reconstruction spends real materials and produces actual parts. The raft is steerable and rideable, with shallow-bank stops. Three named expedition slots, latest continue, backup/checksum/staging validation, inventory/map/pins/journal/blueprints/settings/credits and real performance settings remain available.

## Verification in this increment

- `npm test`: **29 passing tests**, including the previous 21 regressions and new bounded-history, shortest-rotation, discontinuity, obstruction/removal, cancellation, migration, atomic/idempotent reward and stamina cases.
- `npm run check`: **18 source modules** pass syntax/local-import checks; entry assets exist.
- `git diff --check`: passes.
- Chrome on Apple M4 / 16 GB, isolated `?qa=echo` session storage: new named expedition, opening skip/control return, all three Sella introduction pages and quest activation; reset courier, target Echo, activate rewind, cancel over plate, open archive and receive reward.
- Browser reload/Continue retained testimony, materials and the real two-part pattern. Journal and blueprint book displayed them. Passenger proximity rejection displayed a specific explanation.
- Pause during rewind held courier X at **26.03** across a 1.5-second held-input check. Resume/cancel and wheel switching remained operable.
- Final Chrome reload and target/path/endpoint capture showed no console errors. Screenshot: `artifacts/echo-courier-v0.4.png`.
- Echo rebind from 3 to 4 appeared in both settings and the ability wheel; QA bindings were restored to defaults afterward.
- Short foreground scene samples showed **59–60 fps, about 16.7 ms**, roughly **127–396 draw calls**, **0.98–1.02 million triangles**, five component/history tracks, at DPR 1.5 and High settings in the courier/camp views. These are local observations, not a sustained performance guarantee or total-memory measurement.

The earlier v0.3 browser pass verified the constructed crossing, swimming, keyboard combat/death/retry, intake/Rise, root-route ending and reload, skiff reconstruction/sailing/persistence, root updraft and graphics/rebinding behavior. That is historical evidence; the full northern quest and both complete endings have not been replayed in this increment after the narrative rewrite. Automated quest/route/camera regressions pass.

## Known limits and next step

Kinematic heightfield/authored collision remains in use; there is no general rigid-body/joint solver. Echo uses conservative box checks, rejects passenger rewind, and drops construction teleports from history. Stationary objects eventually have no motion to return; reset the courier to create a new path. Pausing freezes history; saving settles/cancels the active operation.

No reachable sky region, underground cave, streaming, land vehicle, equipment combinations, bow, boss, major dungeon, regional companions, material propagation or complete campaign. The courier archive is a short added encounter, not a 20–40 minute slice by itself. No quantitative match to another game is claimed.

Physical gamepad/disconnects, prolonged memory growth, every collision shape, both full ending journeys and the new Rise focus case need broader hands-on verification. Sound cues are implemented but native browser automation has not established subjective audio quality. User saves are origin-local; clearing storage removes them.

Next concrete milestone: bounded rigid construction assemblies, one recoverable multi-solution puzzle and saved attachment graphs, validated before adding powered vehicles. See IMPLEMENTATION_PLAN.md.

## In-progress v0.5 draft after new user direction

Branch: feature/hyrule-world-target. The v0.4 increment above remains the last completed, committed milestone; v0.5 is work in progress, not published.

New expeditions now begin in the elevated tutorial. Added separate shrine sites, a prism/blade combination with real damage changes, temple/descent gating, a scripted steering descent and a glider supply quest. Surface rendering is hidden beneath an opaque animated cloud layer during the sky start. Older saves migrate to schema 5 in the basin with their glider retained. Forest, snow and higher rewind islands are under layout revision.

Current checks: 34 tests passed after the shrine split, including legacy migration, equipment transactions, actual terrain gaps, shrine prerequisites/reward idempotence, descent pause state, glider gating, cloud visibility and recovery. Source checks pass for 23 modules including the standalone map-reference data file.

Browser evidence: sky spawn/control, cloud-hidden surface, actual first panel lifting/attachment and crossing were exercised. The complete four-shrine-to-hub route has NOT been browser-verified after the latest structural changes. Shrine maps/prompts and route/collision consistency still need revision. The surface reference remains unimplemented; regional expansion is still required. See WORLD_REFERENCE.md for the user's new map target. Do not describe this draft as the full Great Sky Island, a complete opening milestone or an exact Hyrule recreation.

Final startup check: a fresh isolated Chrome expedition loaded the current separated-shrine draft, player movement worked, clouds concealed the surface and no console errors were reported. Capture: artifacts/sky-layout-draft-v0.5.png. The traced reference coastline is still not the active terrain. The final full four-shrine browser route remains unverified.
