# Content registry

Version 0.1 early preview. “Implemented” below means present in code, not an end-to-end playtest pass. Runtime verification limits are in BUILD_STATUS.md.

## Implemented locations and actors
| Stable ID | Content |
|---|---|
| `reedwake` | Camp, Sella (`sella`), fire, field guide, beacon and safe respawn |
| `crossing` | Broken aqueduct, two panel sockets, recall winch and western stepping stones |
| `reedwatch` | Ruins, salvage cache, warning note and two scavengers |
| `bellwether` | Intake terrace, counterweight cradle, recall winch, regulator, sentinel and beacon |
| `hollow` | Luminous root grove and optional historical note |
| `bluff` | Surveyor's lookout, mineral climbing faces, notebook and cache |
| `mossglass` | Glasswater Shore and useful mineral pickup |

Enemy IDs: `scrapper-1`, `scrapper-2` (cautious scavenger), `sentinel-1` (shield sentinel). Three actors and two archetypes; no bosses. Eight pickup/cache definitions. Distant Crown islands and waterfalls are scenic representations, not playable sky or underground content.

## Implemented items, construction and story
Items: `copper`, `fiber`, `broth`, `glass`, `regulator`. Equipment: dependable mechanic's blade, Wayfarer Loom and sailcloth. Quest reward: reinforced sailcloth behavior and maximum stamina raised from 100 to 130.

Components: `panel`, `counterweight`, `raft`. Initial objects: `panel-a`, `panel-b`, `weight-a`, `raft-a`. Sockets: `crossing-south`, `crossing-north`, `intake-weight`. Blueprint data stores component kind, relative position and rotation; reconstruction creates owned parts and spends materials. Owned parts can be dismantled for materials. This is a limited curated construction system.

One local quest, **The Basin That Breathes**, uses persistent `metSella`, `intakeOpen`, `route` and `rewarded` facts plus discoveries. Stages derive from facts and support reaching the intake before meeting Sella. `route` is `roots` or `channels`; it controls the hollow light and dialogue outcome. The reward and ending require the route choice and return dialogue.

## Puzzle records
### Unfinished Crossing
- Observe: two loose teal-marked panels, two matching brackets and a flooded gap.
- Rule: Threadbind moves compatible components; aligned rigid sockets provide stable placement.
- Intended solution: lift, rotate as needed, and attach each panel to a bracket to create a crossing.
- Authored alternatives: western stepping stones, swimming with stamina, or an indirect approach. These routes still require runtime traversal checks.
- Reset/recovery: local winch recalls both essential panels; detach and undo are available.
- Reward: a persistent physical route and access to the northern basin, without a mandatory quest gate.
- Accessibility: text validity prompts, outline/preview, rotation controls and alternate traversal; clarity is not yet playtested.

### Bellwether Counterweight
- Observe: empty teal cradle, nearby marked ceramic weight, closed iris and an inspection prompt.
- Rule: a matching heavy component attached to the cradle opens the iris.
- Intended solution: Threadbind the ceramic weight into `intake-weight`, then inspect the regulator.
- Alternate approach: carry the compatible weight from any accessible side; reconstruction can supply another compatible counterweight. This is an authored socket rule, not a general mass solver.
- Reset/recovery: the nearby winch recalls `weight-a`; the open fact stays set after activation. Regulator interaction checks that fact.
- Reward: recovered regulator, route choice, visible local world state and the return-to-Sella objective.
- Accessibility: inspect/reset prompts and explicit compatibility feedback. The complete puzzle/reward journey remains unverified.
