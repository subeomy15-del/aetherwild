# Current world target — user references, 2026-10-24

The user changed the target from original regional counterparts to Hyrule itself. Preserve the earlier Aetherwild work and saves; do not mislabel the current small prototype as an exact completed recreation.

User-supplied references, kept locally outside dist:
- artifacts/references/great-sky-island-reference.png: full sky-island plan with northern temple, western lake, eastern snowy landmass, southern awakening islands, satellite islands and four shrine locations.
- artifacts/references/surface-reference.png: cropped surface overview showing Hebra northwest, Eldin north/northeast, Akkala northeast, Central Hyrule centrally, Lanayru east, Necluda southeast and Gerudo southwest. The southern coastline is not shown completely.

Newest requirements: start on sky islands; hide the surface below a cloud layer until descent; use multiple islands with separate shrines; retain regional expansion. The user rejected the two-platform test-course layout and original counterpart region names.

sky-map-data.js contains a coarse coastline/water classification derived from the first supplied map. It is currently reference data, NOT connected to the active terrain generator. The raster references are not shipped as game textures. Heights, architecture and exact traversable routes still require construction and verification. Do not claim the map trace alone makes a working world.

Current local v0.5 draft: separate joining, equipment, ascent and rewind shrine sites; recoverable panels; a higher southern rewind island; forest and snow routes; temple stairs and cloud-hidden surface. The active landforms still use the prototype layout. No accurate full Hyrule surface or Depths is implemented. The original surface basin is retained for save compatibility.

Reference consultation: Nintendo's public beginner guide supports the overall tutorial sequence, not a surveyed height map: https://www.nintendo.com/jp/zelda/totk/guide/en/index.html . No Nintendo runtime assets or source have been extracted.
