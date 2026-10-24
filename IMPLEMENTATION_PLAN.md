# Implementation plan

## Latest milestone — v0.6 surface expansion (implemented locally)

- [x] Preserve the original basin and migrate existing expeditions to schema 7.
- [x] Expand terrain to 12,000 × 10,000 units, with bounded 81-chunk streaming, roads, water and regional palettes.
- [x] Add eight survey outposts, discovered-outpost travel, rest and skimmer recovery.
- [x] Add a kinematic land skimmer and three persistent field puzzles/rewards.
- [x] Validate logic and browser travel/save/reload.
- [ ] Next: turn the central-to-Lanayru road into a dense authored adventure with intermediate ruins, alternate crossings and a complete local quest. Playtest its full route before adding more area.

Older milestone notes below are historical; BUILD_STATUS.md describes the current build.


## Completed local increment — v0.4: Echo and The Last Forecast

Baseline: clean main at 9923ca5, 21 passing tests, 16 source modules. Work is isolated on feature/echo-and-basin-story; no external publication in this increment.

Implemented: bounded session motion history, one-object rewind, amber targeting/path/endpoint, cancellation, obstruction and passenger restrictions, stamina, pause behavior, saved settled transforms, three-power wheel and remappable direct action. A courier-weight archive demonstrates rewind and admits Threadbind as an alternate solution. Its one-time materials/pattern/testimony transaction is atomic. Saves migrate v1–v3 to v4. Story, local dialogue, journal and ending are rewritten without invalidating existing route/reward facts.

Acceptance: actual browser journey reaches courier reward, reload retains testimony/pattern, pause freezes the weight, ability cancellation settles it, unit tests cover bounds/rotation/obstruction/transactions/migration, source imports pass. BUILD_STATUS.md records the exact verification boundary.

## Next coherent increment — bounded construction assemblies

1. Preserve the current sockets while introducing explicit part/connector/joint graph data behind a development flag.
2. Start with rigid two-part assemblies and a four-part maximum. Choose kinematic compound bodies or a browser physics dependency only after an isolated stability test; document collision and licensing.
3. Implement preview, attach, detach-one-joint, cancel and bounded undo without changing inventory ownership.
4. Add one crossing or cart puzzle accepting at least two arrangements, with lost-part recall.
5. Test invalid graphs, unique IDs, atomic costs, save migration, repeated assembly/dismantling, walls, water, menus and recovery in browser before exposing the feature.

Acceptance: working assemblies and saved relationships, no duplication, no unintended movement drivers, recoverable parts, honest UI and a completed playable use case. Fix critical failures before widening part counts.

## Later ordered milestones — planned

- One reliable land vehicle and a water-vehicle puzzle; explicit energy, collision, safe dismount and persistence.
- Movement/camera audit across diverse geometry, then broader Rise and supported moving-platform/passenger behavior.
- Small atomic equipment-combination system and tighter combat encounters.
- A connected reachable sky route, surface loop and underground cave; measure actual play duration toward the 20–40 minute target.
- Limited material interaction rules, regional quests and a complete dungeon/boss.
- Expand communities and the replacement campaign only through tested content pipelines.
- Sustained profiling, controller/accessibility audit, balancing and verified release packaging.

Three.js remains suitable for this compact increment. General physics, streaming and the full campaign are not claimed. Every milestone must leave a runnable game with accurate documents.

## Superseding direction — v0.5 in progress

The user now wants Hyrule geography and supplied both sky and surface references. Complete the multi-island shrine opening with the surface concealed beneath clouds; verify the entire new-game → four shrine seals → temple → descent → glider journey. Replace the prototype coastlines using the supplied reference only after collision and route tests pass. Then build the central surface hub and order-flexible regional routes in the requested geography. Regional expansion remains in scope; do not replace it with an unrelated construction-only roadmap. Keep unsupported routes explicitly planned.

## v0.5.1 scale increment

Active reference-derived sky geometry, large-coordinate persistence, separated satellite landmasses, distant shrine entrances, wind ferries and three useful satellite discoveries are implemented. Browser verification covered one long flight, shrine entry/return and reload. Complete all four trials, their saved seals, temple descent and glider acquisition in a fresh/loaded real-browser journey before marking the opening milestone complete. Then implement the central surface hub and connections to the requested regions. Keep the current terrain approximations explicit.
