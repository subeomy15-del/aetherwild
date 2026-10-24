# Build status — local v0.5.1, expanded sky overworld

This increment replaces the compressed starting-area scale with an active reference-derived sky overworld. It is a playable prototype, not a completed Great Sky Island/Hyrule recreation or full campaign. No external publication has occurred.

## Launch

Run `npm start` in `/Users/danielyoo/aetherwild`, then open http://localhost:3015. Node 20+ and WebGL are required; no remote runtime assets are needed. The server is already running.

Start a **New expedition in an empty slot** for the enlarged overworld. Existing saves are preserved. Older sky-trial saves can use Pause → Return to archipelago. Older basin expeditions remain in their saved basin state. GitHub Pages is unchanged.

## Implemented

- Reference-derived coastline and water data now produce actual terrain and matching collision. The grid covers **880 × 1,465 game units**: ten times the prior reference grid's width/depth, approximately 100 times its area. This does not mean 100 times the finished content.
- Authored satellite separations create more than a dozen distinct landmasses. The terrain mesh contains 21 separate rendered patches, including three very small fragments. They are not 21 completed regions or dungeons.
- Four widely spaced shrine entrances and a northern temple, instanced trees, water surfaces, snow-colored elevated terrain, and an opaque cloud layer concealing the surface.
- Kinematic wind ferries between awakening, shrine, temple and satellite docks. Actual flight, pause/resume, safe cancellation and stable save snapshots; they are not general aerodynamic vehicle assemblies.
- Entry into compact ability-trial spaces and return to the exact overworld entrance. Pause-menu return stays available before completing a trial. Existing Threadbind/Rise/Echo mechanics and blade/prism combination are retained.
- Three optional satellite stops: Windbreak Garden gives food/fiber; Mineral Shelf gives mossglass/copper; Surveyor’s Perch grants one health-capacity improvement and materials. Rewards are atomic and idempotent.
- Schema 6 supports large sky coordinates and shrine return points while retaining the original basin bounds for legacy expeditions. Schemas 1–5 migrate. New expeditions start in the southern sky area; glider acquisition is still tied to the surface supply quest.
- The sky dome now follows the player, fixing its visible edge when traveling beyond the old 950-unit sphere. Spawn protection no longer makes the character blink out on load, and dock gangways avoid overlapping floor surfaces.

## Verification

- `npm test`: **41 passing tests**, covering earlier regressions plus large-coordinate saves, migration, scale/spacing, realm switches, menu-paused ferry motion, cancellation/loading cleanup and satellite reward atomicity.
- `npm run check`: **24 modules** pass syntax/import checks. `git diff --check` passes.
- Real Chrome on M4 / 16 GB, isolated QA storage: new large-world spawn; movement beyond the old ±185 bounds; recovery from a changed coast; ferry boarding and destination menu; approximately **982-unit flight** to Joining Shrine; pause/resume; shrine entry; safe return through Pause → Return to archipelago; reload retained the overworld entrance at approximately (-1589,228,220). No console errors in that run.
- First bridge lift/attachment/crossing was browser-verified in the previous compact draft. In the current expanded-world run the bridge was targeted/lifted; final completion/reward was not reverified after interruptions. Tests exercise shrine seal gating and idempotence, but do not substitute for a complete four-shrine playthrough.
- Short foreground observations: typically 59–60 fps around landings, with about 78–148 draw calls and 94k–139k triangles; one automated flight/pause sample was around 30 fps. This is not a sustained performance guarantee or total-memory profile.

## Limits

The supplied map is a coarse topology reference, not a surveyed height map. Heights, satellite channels, landing adjustments and structures are authored approximations. Coastlines remain blocky; terrain materials, varied architecture, encounters and navigation density need substantial work. Current shrine trial spaces reuse prototype geometry.

The full four-shrine → temple → descent → surface/glider route remains unverified end to end. The surface is still the retained compact Mossglass basin, not the supplied Hyrule surface map. Sky/surface global alignment, all regional adventures, Depths, major dungeons/bosses, memories, legendary weapon and finale remain planned. Construction and blueprint bounds remain limited to the original basin/trial spaces.

Next: complete a fresh and loaded four-shrine journey, fix any blockers and refine routes/coastlines, then implement the central surface hub and regional connections using the supplied surface reference.

Current captured views: artifacts/expanded-sky-v0.5.1.png and artifacts/expanded-sky-map-v0.5.1.png. The local browser was left open and paused.
