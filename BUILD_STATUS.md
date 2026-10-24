# Build status — local v0.6, expanded lower lands

Playable prototype on branch feature/hyrule-world-target. GitHub Pages remains unchanged; this increment is local only.

## Launch and try

Run `npm start` in this repository and open http://localhost:3015. Choose **Surface expedition** and an empty slot for immediate access; normal New expedition retains the sky start. Existing expeditions and unrelated save slots are preserved. E boards the survey skimmer, WASD steers, Shift boosts and Space dismounts. M opens the large surface map. Visit outposts to unlock return travel, rest and recover the vehicle.

## Implemented

- A 12,000 × 10,000 game-unit surface: plains, snowy mountains, volcanic terrain, desert, hills, rivers, lake and coast. Original basin terrain and quests remain intact.
- Eight small regional survey outposts, road corridors, first-visit materials, a completion stamina reward, rest, discovered-outpost travel and vehicle recovery.
- Kinematic wheeled survey skimmer with dry-ground restrictions, bounded slopes, collision and persistent position. It is not a physical suspension/assembly simulation.
- Three field activities: Lanayru prism filter, Eldin vent/updraft and Gerudo mirror alignment. Atomic rewards and persistent state. Eight patrols reuse existing enemy archetypes.
- Bounded terrain streaming: at most 81 chunks, two builds per frame, near/far detail, instanced trees and coarse distant terrain. Obsolete chunk resources are disposed.
- Schema 7 migration, large-coordinate saves/builds/map, separate safe Surface expedition creation. Existing enlarged sky and compact ability trials retained.

## Verification

`npm test`: 47 passing. `npm run check`: 26 source modules pass syntax/import checks. Tests cover migration, remote positions/builds, occupied-slot protection, streaming disposal/bounds, field-reward atomicity/idempotence, and skimmer boundary/water behavior, plus existing regressions.

Real Chrome on Apple M4 / 16 GB, isolated QA storage: created a surface expedition, boarded and boosted the skimmer beyond the original boundary to approximately (13,30,543), opened the expanded map, traveled to Central outpost, spoke to its keeper, rested, reloaded and continued at the outpost. No console errors observed. Found and fixed a collision seam at the old basin edge. Earlier sky flight/trial verification is retained in git history; the complete four-trial-to-surface route has not been re-played end to end.

Short foreground samples ranged roughly 30–60 fps with about 547–565 draw calls and 1.16–1.22 million triangles near the original camp. This is not a sustained performance or memory guarantee. Screenshot: artifacts/expanded-surface-v0.6.png.

## Known limits and next step

This is much larger traversable terrain, not a finished rich open world. Regional names and broad geography follow the user's reference; terrain is an authored approximation. Outposts are small camps. Three distant field puzzles are automated-tested but not yet browser-played end to end. All roads and slopes have not been manually traversed. There are no complete regional campaigns, major dungeons, new bosses, Depths adventure or finale. Vehicle physics and general construction remain simplified. Most distant areas need denser content and stronger art composition.

Next milestone: author and playtest a complete Central-to-Lanayru route with intermediate ruins, alternative crossings, encounter pacing and a saved local quest; fix traversal problems before increasing world area again.
