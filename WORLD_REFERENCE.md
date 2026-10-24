# Current world target — user references, 2026-10-24

The user changed the target from original regional counterparts to Hyrule itself. Preserve the earlier Aetherwild work and saves; do not mislabel the current small prototype as an exact completed recreation.

User-supplied references, kept locally outside dist:
- artifacts/references/great-sky-island-reference.png: full sky-island plan with northern temple, western lake, eastern snowy landmass, southern awakening islands, satellite islands and four shrine locations.
- artifacts/references/surface-reference.png: cropped surface overview showing Hebra northwest, Eldin north/northeast, Akkala northeast, Central Hyrule centrally, Lanayru east, Necluda southeast and Gerudo southwest. The southern coastline is not shown completely.

Newest requirements: start on sky islands; hide the surface below a cloud layer until descent; use multiple islands with separate shrines; retain regional expansion. The user rejected the two-platform test-course layout and original counterpart region names.

sky-map-data.js contains a coarse coastline/water classification derived from the first supplied map. It now drives the active enlarged overworld terrain and collision through sky-overworld.js. The raster references are not shipped as game textures. Heights, architecture and exact traversable routes still require construction and verification. Do not claim the map trace alone makes a working world.

The retained compact trial layout: separate joining, equipment, ascent and rewind shrine sites; recoverable panels; a higher southern rewind island; forest and snow routes; temple stairs and cloud-hidden surface. The trial spaces still use prototype landforms; the enlarged overworld uses the traced reference with authored channel and height adjustments. No accurate full Hyrule surface or Depths is implemented. The original surface basin is retained for save compatibility.

Reference consultation: Nintendo's public beginner guide supports the overall tutorial sequence, not a surveyed height map: https://www.nintendo.com/jp/zelda/totk/guide/en/index.html . No Nintendo runtime assets or source have been extracted.

## Active scale update — v0.5.1

The first sky-map classification is now used by sky-overworld.js to create the actual playable terrain. Coordinates are scaled tenfold in each horizontal axis (880 × 1,465-unit grid). Satellite channels and height fields are authored adjustments; this is not an exact surveyed reproduction. The map display reads the same adjusted grid. Four distant shrine entrances connect to existing compact trial spaces, and wind ferries connect landings. The Hyrule surface image is still a reference only; no complete surface terrain or global sky/surface alignment is implemented.
