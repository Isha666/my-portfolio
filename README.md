# A World in the Making — winter study

Laptop-first Three.js / GSAP prototype. Run `python3 -m http.server 4173` from this folder and open http://localhost:4173.

The current `index.html` loads `winter.js`: an eye-level walk along a snowy riverside promenade, into a lantern village and beneath moving northern lights. Scroll controls travel; the field guide and top navigation jump to three winter locations. A sleeve and carried lantern place the visitor inside the scene. Snowfall, flowing water and aurora animate independently; Pause snowfall pauses the atmosphere. Reduced-motion preferences disable walking bob and start atmospheric animation paused.

Winter includes procedural textured snow and bark, instanced branch-level firs and bare trees, snow-capped railings, benches, warm lantern lighting, a bridge, cabins, a fairy-lit snowman, footprints, three depths of falling snow, stars, distant ridgelines and shader-based aurora/water. No reference photograph is used as a flat background.

The previous three-season environment is preserved in `index-v1.html`, `world-v1.js`, and `style-v1.css`. Its autumn and spring scenery has not yet received the winter realism treatment. Portfolio panels are simple placeholders; the elaborate physical component interactions and final personal content are not implemented yet.

Dependencies are vendored; no installation required. The Coding Club app is unchanged.

Latest winter revision: first-person sleigh with two animated harnessed reindeer, reins and a wooden front rail; heavy layered snow on full evergreen silhouettes; three snow-block igloos; displaced 3D mountain terrain with exposed-rock / snow vertex colours. The previous walking winter is retained in winter-v2.js.

View / atmosphere refinement: raised the sleigh eye position from 2.25m to 2.8m and moved the team farther ahead. Replaced broad rigid-leg swings with a slower, smoothed stride and articulated knees. Aurora ribbons sit high above the mountains with purple/green blending and a slow brightness cycle. Snow combines denser soft flakes with a separate six-armed crystal texture in the foreground.

## Winter About stop

At 20.5% of the route the camera automatically turns into the igloo at distance 55. The sleigh waits outside. Click the wax-sealed envelope, then scroll (or use Arrow Down / Page Down / Space) to strike a match and reveal heat-sensitive ink across the letter. Reveal all is available to bypass the motion, and reduced-motion preferences reveal the contents immediately. After reading, Back to the snowy trail animates the camera out and resumes beyond the stop. Escape opens the envelope or exits the reading scene; the experience never requires a pointer-only gesture.

The letter adapts the Summary in the supplied résumé. The portrait is deliberately empty: choose a local image in the portrait frame, or supply the final portrait for a bundled asset. The local picker uses an in-memory object URL and does not upload the image.

Reindeer movement now measures travel velocity per second, with a more visible articulated stride and smoothed start/stop.

### Repeat visits and the leadership letter

Scrolling over the envelope opens it; click, Space, Page Down and Arrow Down also work. The ink reveal measures the rendered word positions and groups them into lines. The match tip sweeps left-to-right along each line, revealing each word behind that exact tip, then moves to the following line. Leadership copy includes the ACM-W Joint Secretary, IEEE Student Branch Public Relations & Editorial Head, and IEEE Computer Society Editorial Head roles from the résumé.

About / Igloo in the header returns from any location to a short approach outside the igloo and guides the camera inside. Scrolling backward across the stop also reopens the visit; it is no longer a one-time event. The room includes a stone fire pit, crossed logs, animated flame shaders, flickering light, ice-block seams, books and a cushioned seat. Replay and Reveal all remain available.

### Large reading view / simplified match

The letter now fills nearly the laptop viewport, with larger text and a dedicated large portrait column. Content blocks are hidden before the paper becomes visible, eliminating the initial written-content flash. A single upper-left to lower-right match sweep reveals whole paragraphs. Reveal all and Replay both restart blank and play the same continuous 3.4-second sweep; scrolling can still control the reveal. Reduced-motion users receive the completed letter without animated movement.

### Portfolio navigation / put the letter away

Reveal all has been removed; Replay letter is the only replay control. Returning to the trail first scales/folds the paper into the open envelope, closes the flap, then moves the camera outside. The global header remains available while reading. Home and About are implemented; Projects, Skills and Contact are visibly marked soon until their components exist. The destination registry in winter.js associates each implemented section with its arrival animation. About starts at the short approach to the igloo; Home waits for the letter to be packed before returning to the opening route.

Envelope return correction: removed the decorative insert sheet from the envelope markup. The actual reading paper now remains visible throughout packing, shrinks above the envelope mouth, then slides behind a foreground copy of only the front pocket. Clipping hides the sheet below the envelope edge. The flap closes only after that same sheet is fully inside; no replacement letter or opacity fade is used for insertion.

### Scroll extraction and viewport verification

Opening is a paused GSAP extraction timeline: scrolling opens the flap, draws the same sheet upward behind the pocket, and expands it into the reading surface. Reveal all is present while the envelope is visible and during partial reading. It continues the remaining opening / ink animation from the current progress; Replay appears only after completion and deliberately restarts the ink sweep.

Touch swipes and keyboard scrolling are supported. Once revealed, the paper is independently scrollable, including keyboard Home/End navigation, so smaller screens can reach all paragraphs and the signature.

Verified viewport layouts: phone 390×844 (paper width/scrollWidth 368/368; last paragraph and signature reached), portrait tablet 768×1024 (720/720; entire letter fits), landscape tablet 1024×768 (961/961; small vertical scroll reaches remaining content). Phone name/portrait overlap was corrected by stacking the portrait below the title. The full WebGL landscape remains a prototype; these responsive checks focus on the letter, navigation and its controls.

## Mountain portal / autumn transition

After the About stop, progress 31.5% pauses at a snow-capped mountain arch. The aperture renders a live preview of a separate autumn WebGL scene. Hold the circular control for two seconds with mouse, touch, Space or Enter; releasing early drains the charge. Completed holds move the camera into the aperture with a restrained tunnel wash and settle into an autumn woodland village. The landing has warm light, multi-coloured foliage, scattered leaves, falling particles and workshop exteriors; the actual project components remain future work.

The autumn landing provides a reverse portal transition to winter. Home and About in the global navigation also leave the autumn scene cleanly. The reference snapshot at Documents/ChatGPT/portfolio/why-zero-live-snapshot was inspected for its hold-progress / tunnel interaction; its branded content and bundled code were not copied.

## Fast global navigation

Home in the navbar (and the brand link) interrupts any active letter, igloo camera, hold or portal transition. A 0.28-second fade covers an immediate reset to the opening route, followed by a 0.72-second reveal and a small local camera arrival. It never waits for packing the envelope or reversing the portal. About retains its short approach just outside the igloo. Pending animation timelines are cancelled so they cannot restore the previous section after navigation.

The navbar now shares one fixed layout across winter, the letter and autumn: identical height, brand, spacing and field-guide visibility at each screen breakpoint. Seasonal styling changes its colours only.


## Botanical garden chapter
The former autumn landing is now a Three.js botanical garden with a winding stone path, rose arches, mixed flower beds, a cherry-blossom swing, animated butterflies and falling petals, and a glass conservatory for future project exhibits. The existing two-second hold portal and reverse transition remain. Wheel and touch move through the garden. The supplied garden photos and Fernhollow description informed the atmosphere and motion; no external compiled engine is used.

### Garden geometry and motion
All garden flowers, foliage, butterfly wings, and birds are mesh geometry; there are no botanical photo sprites or image atlases. Petals rotate around their bases from a closed bud into an open bloom as the camera approaches, including cherry blossoms in the trees. Roses use overlapping petal layers; daisies have white ray petals and pollen centers; sunflowers have two golden petal rings and modeled seed heads. Fountain streams have wider tubes with moving shader highlights, droplets and ripples. The garden's exit is a living foliage portal to a reversible underwater preview. The original snow crossing's hold, camera flight, FOV pulse and tunnel wash are retained.

The garden now has a modeled horse carriage viewed from the passenger seat, a close entrance swing, dedicated layered-rose borders and petal/leaf litter on the path. Plant stems extend and petals unfold within roughly 3–9 metres of the camera. The fountain has a tiered stone bowl, spill curtain, top jet and animated droplets; all water is geometry/shader driven.

Garden navigation is directly available from the fixed navbar. Borders mix species rather than separating roses into rows; bloom sizes are reduced. Butterflies have three modeled wing silhouettes and five color palettes. The snow crossing retains the remote version's timing, hold interaction and FOV/tunnel effect, while its garden-side camera endpoint now matches the resting garden camera to avoid a snap at arrival. Garden shadows are warmed in the portal preview before crossing.
