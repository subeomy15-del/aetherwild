# Content registry — local v0.5.1

## Retained implemented surface content
| ID | Content and purpose |
|---|---|
| reedwake / sella | Camp, field researcher, rest/food, save beacon, guide and quest reward |
| crossing | Two-part aqueduct, recall winch, swimming and western stone alternatives |
| reedwatch | Ruins, two mossback scavengers, warning and salvage |
| bellwether | Intake, sentinel, counterweight cradle, iris, regulator choice and beacon |
| bellwether-canopy / canopy-cache | Rise ceiling/roof; mossglass/materials/skiff pattern |
| hollow / root-updraft | Eda's note and luminous roots; root-route sailcloth launch |
| bluff | Optional survey notebook and useful mossglass cache |
| mossglass | Shore/mineral discovery and raft-travel context |
| eda-echo | Optional inspectable story fragment; not a motion-reversal power |
| echo-courier / courier-winch / courier-archive | Moving counterweight, reset and saved testimony/materials/crossing-kit reward |
| restored-road | Channel-choice physical crossing |

Seven formal discovery IDs; the canopy is part of Bellwether, not another region. Distant Crown mesas are scenery. No playable Rootsea biome, sky region, major dungeon or boss.

## Actors, parts and rewards
Iri Vale, Sella Venn and memory/signal of Eda Rook. Scavenger and sentinel roles: three actors total. Two initial panels, intake weight, courier weight and raft; owned reconstructed parts capped at 24. Copper, woven fiber, broth, mossglass and regulator. Intake-skiff blueprint; reinforced sailcloth and +30 stamina reward.

## Persistent quest q_breathing_basin
Facts: metSella, intakeOpen, route (roots/channels), rewarded. Derived steps accept discovery, puzzle completion and route choice before formal acceptance. Regulator completion is gated by intakeOpen. Return reward is idempotent; the selected route powers its visible consequence. Census Engine is a future lead, explicitly inaccessible in this chapter.

## Puzzle: aqueduct crossing
Observe two marked loose panels, matching teal brackets and a flooded gap. Teaches lifting, quarter-turn alignment, snapping and stable surfaces. Intended: fit both panels and walk across. Alternatives: swim, western stones/ridge. Reset: nearby winch recalls the two original IDs; detach/undo recover experiments. No essential panel consumption. Reward: reusable route and construction knowledge. Shape/text feedback supplement color; controls remap and no timer applies. Whole constructed crossing playtested.

## Puzzle: Bellwether intake
Observe an empty marked cradle, heavy ceramic weight, recall winch and closed iris. Tests compatible part/mass. Intended: carry the weight to the cradle. A reconstructed compatible weight can also satisfy the socket; alternative approach routes are accepted. Regulator requires the latched open fact, so bypassing scenic geometry does not skip the puzzle. Recall/reset and permanent open latch prevent lost-weight softlocks. Reward: Eda’s routing objection, local route choice and return reward. No timing or audio-only clue. Puzzle and unexpected quest order playtested.

## Optional: Rise canopy
Observe concentric ceramic ceiling marks and an inscription. Test stable/thin/reachable overhead geometry and a safe exit. Preview explains rejection; ascent can be canceled to entry. Access the roof cache and descend by sailcloth or beacon. Reward: actual skiff blueprint, three mossglass and construction materials. Reward persists and cannot be repeatedly collected. Rise, cache and invalid targeting playtested.

## Choice consequences
Roots: luminous hollow remains alive and an interactable updraft launches sailcloth; bounded wind affects gliding. Visited/activated in browser. Channels: a physical road crossing reopens; collision is regression-tested. The entire channel ending route still needs a separate browser pass.

## Not implemented
The proposed large campaign, time-era memory chain, regional allies/dungeons/bosses, broad materials/devices, Bind/Survey and playable sky/underground layers remain planned. Do not count writing, buttons or silhouettes as completed content.

## Puzzle: Eda’s courier archive — v0.4
Observe a ceramic weight moving along a supported rail, its two endpoint plinths, amber plate and sealed archive. Reset winch starts a 7.5-second traverse. Echo records at most eight seconds of motion; confirm after passing the plate, then cancel over it. The archive lid rises when the plate is occupied. Threadbind placement is an accepted alternate solution. No passenger rewind is supported.

Reset recalls the stable courier ID, stops active operations and restarts its path; a missing courier can be restored below the component cap. Clear the initial plinth of the player first. Reward requires the weight within 1.5 paces in X/Z and 0.6 in height; active rewind must settle before collection. Full material stacks or a full pattern book leave the reward unclaimed. Reward: Eda’s objection, 3 copper, 4 fiber, 2 mossglass and a real two-panel pattern. Collected ID courier-testimony prevents duplicate rewards after reload. Keyboard remapping, wheel selection, text feedback, geometric path and a generous plate support accessibility; Threadbind removes the timing requirement.

## In-progress v0.5 content

Draft sky island sites: Joining Shrine, Equipment Shrine, Ascent Shrine and Rewind Shrine; northern temple exit; forest crossing; snowy approach; two-ceiling access to the high rewind island; cloth retrieval and glider fitting. Trial flags and shrine collection IDs gate descent and one-time rewards. These are prototype sites, not surveyed replicas of the supplied map. The complete new route and revised island navigation remain unverified in browser. Hyrule surface regions and Depths are planned, not implemented.

## v0.5.1 expanded overworld

Active reference-derived sky terrain; four shrine entrance IDs overworld-weave/bind/rise/echo; northern temple; awakening landing; wind-ferry docks. Satellite IDs: windbreak-garden (fiber/broth), mineral-shelf (glass/copper), survey-perch (fiber/copper and one health-capacity upgrade). Each cache persists a satellite-prefixed collected fact and refuses duplicate/overflowing transactions. These are compact discoveries, not completed regional arcs. The complete four-shrine route still requires browser verification.
