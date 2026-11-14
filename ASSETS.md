# Looking-Glass artwork and audio

Default art is hand-written inline SVG generated in `src/assets/svg/art.js`. No image downloads or remote fonts are required. The palette is ivory `#f5edd7`, forest teal `#28564e`, deep red `#a73945`, aged gold `#bc9a52`, Alice blue `#789aa0`, and dark ink `#293b36`.

Use this consistent prompt prefix for every replacement:

> John Tenniel-inspired Through the Looking-Glass illustration in elegant flat vector style. Victorian whimsy, thin dark ink outlines, expressive readable silhouettes, ivory paper, forest teal, deep red, aged gold and muted Alice blue. Flat limited colors, fine engraved accents, no photorealism, no watermark, no external textures. Transparent background. Centered and SVG-ready with separate named layers. Keep detail readable at tablet-game size.

Add the subject below. If an image model produces a bitmap, trace/convert it to SVG for these drop-in slots. The original generated art can be kept as-is.

## Drop-in mechanics

Place a whole-asset SVG in `src/assets/svg/overrides/` using the exact filename below. The Vite raw import map bundles it automatically. No source changes are needed. Rebuild after replacement. Keep root `class="art"`; pieces also need `piece-art`. Use the listed viewBox and original coordinate system. Avoid scripts, external hrefs, remote fonts, or linked images.

For individual grouped rig parts, place `asset-key--part.svg` in `overrides/parts/`, e.g. `character-alice--eyes.svg` or `piece-white-queen--soldier-head.svg`. The matching named `<g>` is replaced in place while its containing transform is retained. Part content must use the full original character/piece coordinates, not a newly centered crop. Whole-asset overrides take priority over parts. Retain `.eyes`, `.mouth`, `.head`, `.body`, `.arms`, `.character-rig`, and piece classes needed for animation inside replacements.

## Card-soldier pieces

All twelve use viewBox `0 0 100 120`. Keep `.piece-rig`, `.soldier-body`, `.soldier-head`, `.piece-eyes`, `.soldier-arm`, and `.piece-crown` where present. The White side uses cream/gold Spades and Clubs; the Red side uses red/ivory Hearts and Diamonds. Every soldier has a rectangular playing-card body, arms, legs, expressive face, suit, role letter, and small shadow.

| Filename | Subject suffix |
| --- | --- |
| `piece-white-pawn.svg` | Cream and ivory, gold trim, dark Spade/Club. Low-rank card soldier carrying a spear; P rank |
| `piece-white-rook.svg` | Cream and ivory, gold trim, dark Spade/Club. Card soldier with battlement tower hat and a suit banner; R rank |
| `piece-white-knight.svg` | Cream and ivory, gold trim, dark Spade/Club. Clumsy card soldier on a wooden rocking horse, a clear horse silhouette; N rank |
| `piece-white-bishop.svg` | Cream and ivory, gold trim, dark Spade/Club. Card soldier with a tall pointed mitre or jester hat; B rank |
| `piece-white-queen.svg` | Cream and ivory, gold trim, dark Spade/Club. Queen card soldier, crown and distinct expressive face; Q rank Kind, slightly bewildered. |
| `piece-white-king.svg` | Cream and ivory, gold trim, dark Spade/Club. King card soldier with cape, cross crown, and scepter; K rank |
| `piece-black-pawn.svg` | Red army: red outline and Heart/Diamond, warm ivory card. Low-rank card soldier carrying a spear; P rank |
| `piece-black-rook.svg` | Red army: red outline and Heart/Diamond, warm ivory card. Card soldier with battlement tower hat and a suit banner; R rank |
| `piece-black-knight.svg` | Red army: red outline and Heart/Diamond, warm ivory card. Clumsy card soldier on a wooden rocking horse, a clear horse silhouette; N rank |
| `piece-black-bishop.svg` | Red army: red outline and Heart/Diamond, warm ivory card. Card soldier with a tall pointed mitre or jester hat; B rank |
| `piece-black-queen.svg` | Red army: red outline and Heart/Diamond, warm ivory card. Queen card soldier, crown and distinct expressive face; Q rank Furious dramatic eyebrows. |
| `piece-black-king.svg` | Red army: red outline and Heart/Diamond, warm ivory card. King card soldier with cape, cross crown, and scepter; K rank |

Piece-part prompts, usable for any of the twelve whole-asset keys: `soldier-body` = rectangular card body with suit, role letter, fine gold inset border; `soldier-head` = small expressive face appropriate to side; `piece-eyes` = two clear dark blinking eyes; `piece-crown` = appropriate royal crown for Queen/King; `soldier-legs` = two thin marching legs and curled shoes. Preserve their original placement. Arms/props are drawn as paths inside the body; replace that body group or the whole piece when changing them.

## Large character subjects

All characters use viewBox `0 0 300 420` and root `.character-rig`. Keep the part groups listed below. Maintain room above the head for crowns and speech bubbles.

| Filename | Subject suffix |
| --- | --- |
| `character-alice.svg` | Curious young Alice, blue dress, white apron, gold hair, dark headband, black Mary Jane shoes. |
| `character-whiteQueen.svg` | Kind forgetful White Queen, messy pale hair, crooked golden crown, cream and gold striped gown, fluttering shawl. |
| `character-redQueen.svg` | Furious dramatic Red Queen, huge expressive head, red gown, heart crown, angry brows, pointing finger. |
| `character-cat.svg` | Cheshire Cat, floating dusty-lilac striped body, curling tail, mischievous eyes, enormous cream toothy grin. |
| `character-rabbit.svg` | White Rabbit in amber waistcoat, frantic long ears, whiskers, ornate pocket watch. |
| `character-hare.svg` | March Hare, ochre fur, crooked ears, teal waistcoat, tea-party charm. |
| `character-hatter.svg` | Mad Hatter, enormous green top hat with 10/6 ticket, copper hair, green coat, gold waistcoat, teacup. |
| `character-caterpillar.svg` | Wise sage-green Caterpillar seated on a broad mushroom, round segmented body, pipe, expanding smoke rings. |
| `character-humpty.svg` | Humpty Dumpty, comically pompous egg on a brick wall, tiny trousers and dangling legs, uncertain smile. |
| `character-knight.svg` | Clumsy White Knight, pale armor, crooked helmet, long spear, endearing face, wooden rocking horse. |
| `character-jabberwock.svg` | Huge friendly-frightening Jabberwock dragon, sage scales, membranous wings, long swinging tail, claws, teeth and amber fire. |
| `character-flowers.svg` | Three talking garden flowers, rose, gold and dusty purple petals, independent expressive faces and leafy stems. |
| `character-tweedles.svg` | Tweedledum and Tweedledee as a mirroring comic pair, round red and amber coats, propeller caps, large faces. |
| `character-pawns.svg` | Pair of large Red pawn playing-card guards, Heart/Diamond uniforms, spears, clear silhouettes. |
| `character-guards.svg` | Pair of large Red Queen court soldiers, tower and pointed hats, red playing-card uniforms. |

## Individual character-part prompts

Append each part suffix below to the **same common prompt and that character’s subject**. Each row names a drop-in file. Replacements for `head`/`body` must retain any nested animated groups they contain. For paired/flower characters, a part filename replaces the first matching group; use a whole-character override to redesign the complete arrangement.

| Part filename | Additional part direction |
| --- | --- |
| `character-alice--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-alice--legs.svg` | Legs and shoes, matching the standing/sitting pose. |
| `character-alice--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-alice--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-alice--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-alice--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-whiteQueen--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-whiteQueen--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-whiteQueen--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-whiteQueen--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-whiteQueen--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-whiteQueen--crown.svg` | Distinct golden royal crown, removable and rotatable. |
| `character-redQueen--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-redQueen--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-redQueen--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-redQueen--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-redQueen--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-redQueen--crown.svg` | Distinct golden royal crown, removable and rotatable. |
| `character-cat--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-cat--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-cat--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-cat--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-cat--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-cat--cat-tail.svg` | Long curling striped Cat tail, readable as a pointing gesture. |
| `character-cat--grin.svg` | Glowing cream teeth and oversized Cheshire smile, isolated to remain after disappearance. |
| `character-rabbit--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-rabbit--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-rabbit--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-rabbit--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-rabbit--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-rabbit--ears.svg` | Separate elongated rabbit/hare ears with warm inner fur. |
| `character-rabbit--accessory.svg` | The named character’s pocket watch or teacup, isolated for swinging/pouring. |
| `character-hare--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-hare--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-hare--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-hare--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-hare--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-hare--ears.svg` | Separate elongated rabbit/hare ears with warm inner fur. |
| `character-hare--accessory.svg` | The named character’s pocket watch or teacup, isolated for swinging/pouring. |
| `character-hatter--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-hatter--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-hatter--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-hatter--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-hatter--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-hatter--hat.svg` | Giant green Mad Hatter hat with readable 10/6 ticket. |
| `character-hatter--accessory.svg` | The named character’s pocket watch or teacup, isolated for swinging/pouring. |
| `character-caterpillar--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-caterpillar--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-caterpillar--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-caterpillar--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-caterpillar--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-caterpillar--smoke.svg` | Three expanding soft smoke rings from the Caterpillar’s pipe. |
| `character-humpty--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-humpty--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-humpty--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-humpty--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-humpty--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-humpty--legs.svg` | Legs and shoes, matching the standing/sitting pose. |
| `character-knight--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-knight--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-knight--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-knight--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-knight--arms.svg` | Independent expressive arms or hands with the correct costume cuffs. |
| `character-knight--horse.svg` | Wooden rocking horse with a clear horse head, rocker rail, and vintage carved detail. |
| `character-jabberwock--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-jabberwock--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-jabberwock--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-jabberwock--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-jabberwock--wings.svg` | Two angular dragon wings with muted reddish membranes. |
| `character-jabberwock--dragon-tail.svg` | Long curved sage dragon tail with a pointed end. |
| `character-jabberwock--fire.svg` | Warm amber and gold comic flame, no realistic smoke or violence. |
| `character-flowers--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-flowers--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-flowers--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-flowers--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |
| `character-flowers--flower.svg` | One full flower, petals, readable face and stem, keeping the group pivot at its base. |
| `character-tweedles--body.svg` | Costume or segmented body, excluding the face, matching the silhouette and palette; retain arm groups. |
| `character-tweedles--head.svg` | Expressive head with face and appropriate hair/fur detail; retain independent eyes and mouth. |
| `character-tweedles--eyes.svg` | Two clear dark eyes suitable for blinking and following a speaker. |
| `character-tweedles--mouth.svg` | Readable comic mouth suitable for talking, smiling, fear, and anger. |

## Backgrounds, UI, and scene assets

| Filename | Subject suffix | ViewBox |
| --- | --- | --- |
| `background-garden.svg` | Enchanted English garden, rolling hedges, roses and distant trees, ivory sky | 0 0 1440 900 |
| `background-forest.svg` | Curious forest of tall twisting trees, muted teal foliage, distant chess path | 0 0 1440 900 |
| `background-tea.svg` | Warm vintage tea garden, amber atmosphere, table-party accents | 0 0 1440 900 |
| `background-castle.svg` | Red Queen’s castle, distant crenellated towers and rose hedges | 0 0 1440 900 |
| `background-sky.svg` | Dreamlike chess sky, pale clouds and softly floating suits | 0 0 1440 900 |
| `hero.svg` | Alice and Red Queen on a giant perspective chessboard, card soldiers, pocket watch and floating cards | 0 0 620 530 |
| `clock.svg` | Antique gold pocket watch, Roman numerals, separate movable hands | 0 0 160 160 |
| `cup.svg` | Cream teacup with gold trim, amber tea, red diamond decoration, small saucer, steam | 0 0 160 160 |
| `cup-cracked.svg` | Same teacup with a bold zigzag porcelain crack | 0 0 160 160 |
| `grin.svg` | Floating glowing Cheshire grin and sly eyes, without body | 0 0 160 160 |
| `bottle.svg` | Small teal Drink Me bottle, gold cork, cream label | 0 0 160 160 |
| `cake.svg` | Cream-and-jam layer cake slice with a cherry | 0 0 160 160 |
| `hat.svg` | Hidden miniature Hatter top hat, green, gold band, 10/6 ticket | 0 0 160 160 |

Backgrounds need independent `.parallax.far`, `.parallax.mid`, and `.parallax.near` layers. Keep `.clock-hands`, `.hero-clock`, `.hero-alice`, `.hero-red`, `.floating-card`, and `.steam` as appropriate. These SVG group names are the animation hooks.

The checkerboard, map tiles, card-back wipe, red curtains/gold tassels, crack lines, smoke/ink overlay, mirror frame, and control icons are code-native geometry in `src/anim/transitions/manager.js`, screen templates, and CSS. Their common prompt suffixes are respectively: “ivory/teal chessboard with gold frame”; “red Victorian playing-card back with gold lattice and spade”; “heavy deep-red theatre curtains with gold tassels”; “antique looking-glass with concentric ripples”; “thin radiating mirror cracks”; “dusty-violet smoke curls”; and “consistent dark-ink suit, crown, arrow, sound and fullscreen symbols.” They are intentionally lightweight geometry rather than linked image files.

The result card’s `▦` is explicitly a **QR placeholder**, not a usable QR. Generate a genuine QR for your final `CONFIG.signupUrl` and replace that markup in `src/screens/result.js`.

## Audio drop-ins

The default is local Web Audio synthesis: a gentle music-box loop plus move, capture, error, hint, card, whoosh, tick, crack, shatter, roar, win, and lose sounds. The game remains playable if audio cannot initialize.

Optional recordings in `src/assets/audio/` are automatically bundled by name. Use `.ogg`, `.mp3`, or `.wav`, one file per stem:

| Stem | Recording / music prompt |
| --- | --- |
| `music` | Seamless whimsical Victorian music-box waltz, warm celesta and soft pizzicato, no vocals, gentle tempo, 30–60 second loop |
| `move` | Short soft card-soldier footstep and wooden chess clink |
| `capture` | Crisp card flip with a small magical paper puff |
| `error` | Friendly comic descending two-note wobble |
| `hint` | Three mysterious ascending Cat-like music-box notes |
| `card` | Soft crisp playing-card flick |
| `whoosh` | Airy storybook page sweep |
| `tick` | Warm wooden pocket-watch tick |
| `crack` | Small porcelain teacup crack and delicate spill |
| `shatter` | Glittering antique mirror shatter, short descending fragments |
| `roar` | Comedic theatrical dragon/Queen rumble, not frightening or loud |
| `pour` | Brief warm tea pour and bubbling |
| `win` | Warm celesta coronation flourish |
| `lose` | Gentle theatrical descending music-box cadence |

Keep transients short and level-matched. Music is attenuated in the engine. Missing/undecodable files fall back to synthesis. Font replacements must preserve Arabic coverage and include their licenses. The original bundled fonts and notices are in `src/assets/fonts/`.

## Difficulty-mode additions

These defaults are generated SVG and CSS; the game works without replacing any art. Use the common prompt prefix above plus these subjects. Place optional SVG overrides in `src/assets/svg/overrides/`, then rebuild.

| Filename / slot | Prompt suffix and animation hooks | ViewBox |
| --- | --- | --- |
| `mode-card-easy.svg` | Friendly White Rabbit, welcoming pose, softly colored ivory/mint playing-card illustration; transparent background, no embedded text (the UI supplies localized rules) | 0 0 300 420 |
| `mode-card-normal.svg` | Cheshire Cat, curling tail and broad grin, dusty lilac and teal, centered playing-card illustration; no embedded text | 0 0 300 420 |
| `mode-card-hardcore.svg` | Flaming Red Queen playing-card illustration, dramatic crown and pointing hand, stylized amber flames over burgundy, readable nonviolent theatrical silhouette; no embedded text | 0 0 300 420 |
| `character-redQueen-hardcore.svg` | Larger imperious Red Queen, black/deep-red gown with aged-gold trim, exaggerated angry brows, detachable crown, independent body/head/eyes/mouth/arms. Keep `.character-rig.redQueen`, `.head`, `.eyes`, `.mouth`, `.body`, `.arms`, `.crown` for acting, bowing and the finale. Falls back to the regular Red Queen rig | 0 0 300 420 |
| `clock-hardcore.svg` | Burning crimson pocket watch, scorched gold rim, Roman numerals, clear hands and separate `.clock-hands`; keep its transparent outside edge. The numeric countdown remains DOM text | 0 0 160 160 |
| Fuse progress strip | Lightweight gold-to-red shrinking strip, `.timer-fuse` / `#timer-fuse-fill` in `src/screens/ui.js`, styled in `src/modes.css`. Keep the fill element and its scale-based progress; replace the surrounding ornament if desired | CSS/DOM |
| Mode badges | Rabbit, Cat and red-crown inline icons in `src/screens/mode-ui.js`; keep `.mode-icon`, a common 36×36 viewBox, and clear silhouettes | 0 0 36 36 |
| Hardcore coronation crown | Black outline, bright aged gold and warm glow; `.alice-crown` in `src/modes.css`. Keep this DOM/Flip hook if replacing the glyph with SVG | CSS/DOM |

Add optional `heartbeat.ogg`, `.mp3` or `.wav` to the existing audio folder: soft theatrical double heartbeat, low rounded percussion, short/level-matched and loop-safe. The game speeds up the cue from config in the last five seconds and falls back to synthesized tones when absent. Easy uses pastel confetti; Hardcore uses black and gold, both through `MODES.presentation.confetti`.

## CIC event logo

`src/assets/svg/event-logo.svg` is adapted from the supplied `cic design/dark colors.svg`. All sixteen original path outlines are preserved. The lettering uses the game's deep red `#a73e49` and forest teal `#365e52`; the keyhole uses aged gold `#bc9a52`. The viewBox removes the original export's empty margins, and the header places it on an ivory plaque so it remains readable in Hardcore. The original three designs remain untouched.

The shared branding helper in `src/screens/ui.js` embeds the logo locally on the welcome screen and page headers, including name entry, mode selection, chapter map, results and leaderboard. Its accessible label is translated into English and Arabic; the original logo lettering keeps its original orientation in RTL. To replace it later, overwrite this SVG, preserving its transparent background, `art event-logo-art` classes and suitable viewBox. Use the actual event vector artwork for identity updates rather than an AI-generated replacement.

## Animation hooks after the clock audit

Clock replacements should retain `.clock-hands` around separate `.clock-hand-hour`, `.clock-hand-minute` and `.clock-hand-second` paths. Use the existing 160×160 viewBox and local hand hub `(80, 80)`. The animation helper writes SVG-local `rotate(angle 80 80)` transforms; the HUD follows game time, not an independent loop. Legacy single-group clocks remain supported, but separating the three hands gives an accurate watch face. Avoid applying an additional CSS transform to the hand paths.

Generated characters now have a `.character-reaction` group outside `.character-rig`. This separates a happy hop from the actor's scripted stage position and its idle breathing. Keep this optional wrapper when replacing art; older overrides fall back to the inner rig. Grin placement still comes from the original SVG transform and is restored using a fresh rig on each hint.
