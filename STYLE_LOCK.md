# Roadster — the locked style

> Sculpted, faceted silver machinery with ink-dark panel seams and fine procedural grain, lit by warm ivory floodlights, violet fill and red luminous edges against a nearly black night, with illustrated vapor and restrained cinematic bloom.

The user's three screenshots define surface treatment and visual quality. The supplied Roadster film defines geometry, action, cameras and editing. Do not introduce the screenshots' drift-game HUD, mountain road, cherry trees or lasers into this film.

| Role | Hex | Use |
|---|---|---|
| Silver | `0xd8dce5` | Main car panels |
| Lit ivory | `0xffead0` | Direct floodlight |
| Violet silver | `0x8b87aa` | Secondary body panels / fill |
| Ink | `0x11131e` | Panel seams, underbody |
| Glass | `0x151d2a` | Glazing |
| Night | `0x020308` | Surround |
| Concrete | `0x878895` | Ramp |
| Asphalt | `0x10131c` | Ground |
| Red | `0xff3347` | Ramp / taillights / boundary |
| Cyan | `0x9cdbed` | Illuminated gas |
| Vapor | `0xdde4f0` | Cloud body |
| Amber | `0xf7bd70` | Small warm accents |

## Fixed decisions

- Units are metres. Estimated visual working dimensions, not manufacturer specifications: car 4.8 m long, 2.08 m wide, 1.28 m high; wheel radius 0.39 m; ramp 7.2 m wide, approximately 34 m high. Camera solve can revise ramp dimensions coherently.
- Asset base is y=0; x/z centered; car front +Z. Animation lives outside asset modules.
- Geometry is supplied by reference-driven 404 modules. Three construction candidates per asset family, verified and selected visually.
- MeshStandardMaterial with explicit colors. Geometry assets have no texture imports or external mesh data.
- Procedural surface classification uses the recipe's names: plaster, stone, timber, tile, metal, fabric, foliage, ground. Glass and dark trim stay smooth.
- Fine noise must not become dirty camouflage. Ink seams and faceted shading must remain readable in motion.
- White/cyan gas, not orange rocket flames. Vapor has opaque cores, translucent edges, outward ground flow and colored illumination.
- Frame master: 1094 frames at 24000/1001 fps. Cuts: 51, 419, 656, 743.
- Source and styled rendering can be compared at the same source frame. No frame-rate-dependent choreography.
- All new generated reference imagery/review services must use Atlas MCP. Atlas authentication and generation verified; receipts in references/atlas-generation-complete.json. Supplied references remain the geometry/action authority.
