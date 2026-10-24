# Build status — 0.3.0

The rebuilt Mossglass chapter is playable. This is a verified compact increment. The requested 20–40 minute three-layer milestone and full campaign are not complete. The rejected v0.1 blockout has been substantially revised.

## Launch
Run npm start in /Users/danielyoo/aetherwild, then open http://localhost:3015 in Chrome or Edge. Node 20+ / WebGL 2; no installation or remote runtime dependencies. Voxel Vault is untouched.

GitHub Pages target: https://subeomy15-del.github.io/aetherwild/ . The GitHub workflow checks the game and publishes dist from main. Localhost and GitHub Pages have separate browser saves.

## Playable
- Seven discoverable surface locations, Reedwake Camp, flooded crossing, forest ruins/encounter, optional hollow/lookout and Bellwether Intake. Distant Crown islands remain scenery.
- Original detailed articulated mechanic/creatures; blended movement, guard and attack animation; stitched sailcloth; branching trees, instanced wind grass, layered silhouettes, canvas camp, animated water/foam, decorated ceramic ruins and cooler lighting.
- Skippable real-time engine-pulse opening; Iri's missing partner Eda; Sella's contextual dialogue, optional signal trace, regulator discovery, water choice, permanent sailcloth/stamina reward and chapter ending.
- Responsive third-person movement, sprint, buffered/coyote jump, glide, swim, assisted mineral/shore ledge recovery, camera handling for terrain/gate/pillars/canopy, and wider vehicle camera.
- Light/heavy blade attacks, lock-on, guard/parry, dodge, health, broth, death/retry; two enemy roles across three actors.
- Threadbind: curated panels, weight and rafts; yaw rotation, reach, socket preview/validation, cancel, detach, bounded undo and essential-object recall. Kinematic parts, not arbitrary rigid-body assembly.
- Rise: direct input and two-choice wheel; ceiling range/thickness/stability/exit checks, visible targeting, animated ascent, cancel, 10-stamina cost and a roof cache with a working skiff blueprint.
- Persistent choice: root spillway awakens a usable sailcloth updraft; surface channels reopen a physical road crossing.
- Actual blueprint data and resource transactions; reconstructed owned parts, dismantling/refund, steerable rideable raft. Dry rafts must be placed on water; shallow banks stop the hull.
- Three named expedition slots, latest continue, load confirmation, v1/v2 migration, checksums, verified staging writes and backup. Old local save remains slot 1; new games require an empty slot.
- Fieldbook, inventory, journal, map/pins, blueprints, pause, settings, credits. Remappable keyboard controls, text/captions/contrast/motion/climb/sprint options, guidance toggles and independent audio buses. Graphics presets change real render resolution, grass count and shadows.

## Verified
npm test: **21 passing tests**. npm run check: **16 modules** pass syntax/import and entry-asset checks.

Actual Chrome playtesting on the M4 / 16 GB Mac:
1. New named expedition, opening/control return, revised three-page Sella introduction and objective update.
2. Both bridge panels lifted, rotated, snapped and attached; entire bridge crossed. Falling into water and safe recovery retained the bridge. Manual save/reload retained position and construction.
3. Alternate swimming route crossed the channel. Shore mantle, camera clearance, gate obstruction, jump/landing and vehicle camera have headless regression checks.
4. Light and heavy keyboard attacks, target lock, scavenger defeat/material reward, healing and death/retry. Full sentinel balance and parry timing still need hands-on passes.
5. Intake reached before quest acceptance; weight carried to cradle; iris opened; valid/invalid Rise targets; roof ascent and cache/blueprint reward.
6. Regulator dialogue, root choice, return to Sella, permanent reward and ending. Reload retained completion, route, inventory and blueprint.
7. Earned skiff reconstructed, moved from dry ground to water, boarded and steered. Save/reload retained the owned raft and permitted boarding again.
8. Root-route updraft visited/activated; sailcloth climbed above the trees. Channel-road collision and bounded wind have regression checks.
9. Performance preset changed canvas width **2205 to 1249** at 1470 CSS pixels, lowered grass and disabled shadows. Preset and rebound interaction key survived reload; guide displayed the rebound key. QA controls restored afterward.
10. No browser console errors in the final QA session. QA used ?qa=1, which isolates saves/settings in tab session storage.

Frame overlay was usually **59–60 fps / about 16.7 ms**, roughly 50–480 visible draw calls and 0.94–1.1 million triangles. Browser automation/background transitions produced slower samples. These observations are not a prolonged GPU/memory profile or locked-60 guarantee.

Captured local view: artifacts/mossglass-flight-v0.3-verified.png.

## Limits
No playable sky archipelago, cave/Rootsea or streaming yet. The direct chapter path is shorter than 20–40 minutes; that duration target is not claimed.

Bind, motion-reversal Echo, Survey/photo export, advanced Pattern previews/favorites, arbitrary three-axis joints, powered devices, bow, regional companions, bosses, major dungeons, difficulty/customization and the later campaign remain planned. The wheel exposes only working powers. Earlier Impulse Vessel/Bloomwake/Echo Lens ideas remain design candidates.

Physical gamepad, gamepad rebinding/disconnect handling, prolonged memory/object growth, every combat variation and both complete ending routes need broader verification. Keyboard combat was verified with X; not every mouse gesture was proven by native automation. Saves are browser/origin local; hosted and localhost saves are separate. Clearing browser storage removes them.

## Next milestone
One compact playable sky route and connected cave, a chronological memory reward and a 20–40 minute authored journey. Verify layer travel, persistence/recovery and sustained performance before adding regions.
