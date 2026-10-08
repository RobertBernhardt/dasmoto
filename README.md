# Dasmoto's Arts & Crafts — received over a bad line

In 2024 this repo was a Codecademy exercise: one header, three coloured headings, three photos, Helvetica.
This is the same shop with the same words, rebuilt as a colourful successor to Art Deco that arrives over a connection that doesn't quite hold.

The original is kept at [`2024/`](2024/) and linked from the footer.

## Two layers

**The deco shop.** Deep teal, ochre gold, oxblood, burnt-orange rails, translucent sage bands, film grain.
Every visual is drawn by code (SVG, canvas, CSS); there are no image files.

- **Ornament engine** (`js/deco.js`): seeded, never-identical frames composed around each section's measured layout, corner motifs, lattices and fan patterns, light glints running along the gold lines, a 3D lift for the counter tiles.
- **Shop window:** brush, frame and tube on a stepped plinth in front of a sunburst.
- **Three counters**, one per product, each in the deco successor of its 2024 heading colour (spring green → jade, light coral → coral & oxblood, sky blue → night & sky), each with one thing you can do:
  - *Brushes:* a test sheet. Pick a size, dip into a colour, drag a stroke. The oak holds a lot of paint, so one dip lasts a long way before the brush drags dry.
  - *Frames:* switch between MDF, birchwood and PDE, sand and repaint the wood ones, tap the picture for another.
  - *Paint:* the 256-colour wall (arrow keys work), tube sizes 1–8 oz.

**The signal** (`js/signal.js`). A reception value drifts; the weaker it gets, the more often something breaks:
headings split into colour channels, pictures tear into sideways slices (an SVG displacement filter with quantised noise, then the red and green-blue channels pulled apart), gold lines lose register, macroblocks flash, a tracking band rolls down the screen, words decode from noise and sometimes briefly read wrong, and once in a while the picture drops out. Scrolling fast is like moving the antenna.

The **Stabilize** button locks the line (remembered per browser). With `prefers-reduced-motion` the page starts locked and still.

## Run

Any static server, e.g.

```sh
python3 -m http.server
```

Add `?seed=123` to reproduce a frame composition, `?still` to stop all motion.
