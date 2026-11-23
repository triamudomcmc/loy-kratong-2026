# Shared UI (`@components/ui`)

Import everything from `@components/ui`. All sizes are Figma design px scaled with one CSS unit
`--u` (= container width / frame width); use `u(n)` = `calc(var(--u) * n)` for every dimension.

## Frame scaling
| Export | Source | Notes |
|---|---|---|
| `Frame` `{ mode?: "mobile" \| "desktop" \| "fit" }` | frame roots | `mobile`: 375x812 design, `--u = min(100vw,430px)/375`, centred, `overflow-hidden`, height `u(812)`. `desktop`: 1440x1024, `--u = 100vw/1440`. CSS lives in `globals.css` (`.frame-mobile`, `.frame-desktop`). `fit` (new): `--u = min(100vw/375, 100dvh/812)`, centred, never taller than the viewport (card never scrolls). The river (2328x1024) should set `--u: calc(100dvh / 1024)` itself. |
| `Layer` `{ x,y,w,h, className, style }` | any node | absolute box at exact Figma coordinates (all optional, in design px). |
| `Stage` `{ anchor?: "center"\|"bottom", desktop?, className?, boxClassName? }` (new) | `absolute inset-0 overflow-hidden` viewport-filling layer holding one 375x812 box (`desktop`: 1440x1024) with `--u = min(100vw/375, 100dvh/812)` (desktop `min(100vw/1440, 100dvh/1024)`). Put scenery in it at Figma coords with `u()`/`Layer`: it overflows the box freely, only the Stage clips, so sky/water/clouds can bleed to every viewport edge while the foreground stays Figma-sized and centred. `anchor="bottom"` pins water/sala/floor to the bottom edge. Put it inside a `fixed inset-0` / `relative` parent after a `TealSky`. | |
| `u(n)` | | returns `calc(var(--u) * n)` for inline styles / classes. |

## Components
| Component | Props | Figma node |
|---|---|---|
| `TealSky` `{ desktop? }` | absolute inset-0 teal gradient (183.82deg; desktop 181.26deg). Tokens `--color-sky-top/mid/bottom` in globals.css | background of ปก 91:616, Scenes 1-4, Scene 17 91:1191 |
| `Logo` `{ scale? }` | "กช." lock-up, natural size 102x16.348 (desktop scale `254/102`) | Nav 91:459 > Logo 91:460; Logo 91:445 |
| `NavHeader` `{ fixed?, desktop? }` | default: absolute header inside a Frame (mobile logo at 24,19; `desktop` at 37,34 scaled). `fixed`: viewport-fixed header for normal pages (sets own `--u`, mobile < lg, desktop at lg+). `Navbar` / `NavLoy` in `@components/Nav` use it. | Nav 91:459, nav-desktop 91:505 |
| `PillButton` `{ variant?: "solid"\|"outline", w?=118, h?=41.776, fontSize?=19.011, radius?=22, x?, y?, ...button props }` | white pill (`--color-pill` #f6f6f6, text `--color-ink` #4a4a4a, soft shadow); outline = transparent with pill-coloured text. Pass `x`/`y` to absolutely position it. Built-in feedback: hover grows 1.06 + brighter, press shrinks 0.94, keyboard focus shows a white outline + ring, `disabled` fades (reduced motion: scale change shrunk to 1.02 / 0.98). Desktop: `w=225 h=80 fontSize=28 radius=40`. | next 91:615; outline "ไม่ไป" 91:513; Scene 17 91:1244 |
| `MovingMoon` `{ pose: {glow,body}, duration?=0.7, float?=0 }` (new, client) | Same art as `Moon` but glides (x/y/scale, unit-free %) to the glow/body boxes whenever `pose` changes. Used by the story (cover -> Scene 4). `float` = slow bob in design px. Export type `MoonPose`. | same nodes |
| `Moon` `{ glow: {x,y,size}, body: {x,y,size} }` | glow `size` must be 253, 279, 99 or 202 (picks the blurred-circle SVG + its bleed inset). Body = animated moon GIF. | Mooooon 2 + Ellipse 133-136 (91:662/663, 91:524/525, 91:727/728, 91:1196/1197) |
| `MoonRabbitEar` | yellow rabbit piece over the moon, fixed at (158,280) | Union 91:515 / 91:529 |
| `Cloud` `{ name, x,y,w,h, rotate?, opacity?, drift?, driftDuration?=12, driftDelay?=0, src? }` (now client) | `name` = file in `public/assets/figma/ui/clouds/` without `.svg` (each SVG carries its own gradient/opacity) | `drift` (true = 5, or % of the cloud width) sways it sideways forever, alternating; reduced-motion makes it 1/3 and slower, never off. Unions of ปก, Scene 1, Scene 17; `cloud-small` = "cloud" 91:475 |
| `MobileScenery` `{ water?: "single"\|"layered" }` | small clouds (now drifting slowly) + water + brick floor + sala for a 375x812 frame; `single` = Scene 4 (91:696), `layered` = Scene 5 (91:716) | Scene 4 / 5 "below" group |
| `GlassBackdrop` `{ nav? }` | first child of a mobile Frame for Scene 5 / 6 / Snap: teal sky + layered scenery + small moon + pink-to-blue gradient with backdrop-blur 14 + logo nav | Scene 5 91:715 (bg 91:730) |
| `GlassCard` `{ x=16,y=72,w=343,h=703,radius=23 }` + children | outer glass card, 1px white border, blur 30, diagonal white gradient. Children are positioned relative to the card (use `Layer`). | elements 91:732 |
| `GlassSheet` `{ y=260, w=343, h=443, header=true }` | lower frosted sheet inside the card (0.5px border, blur 15) + optional 56px frosted tab strip (blur 9). Render inside `GlassCard`, before the tabs/grid. | 91:733, 91:751 |

## Assets (`public/assets/figma/ui/`)
`logo-mark.svg`, `moon.gif`, `moon-glow-{253,279,99,202}.svg`, `moon-rabbit-ear.svg`, `clouds/*.svg`,
`scenery/{sala.png,floor.png,water-single.svg,water-top.svg,water-mid.svg,water-bottom.svg,water-desktop-front.svg,water-desktop-back.svg}`.
Note: Figma exported a stray `<rect stroke="black">` in `water-single.svg` and `water-bottom.svg`; it was removed (it drew a hairline across the water).

## Fonts / tokens (globals.css)
`font-noto` = Noto Sans Thai (logo text, "ถัดไป" button of Scene 5, cover hint), `font-ui`, `font-display`, `font-title` as before.
Colours: `sky-top`, `sky-mid`, `sky-bottom`, `pill`, `ink`, `primary` (#2256a3).

## Viewport-filling scenery (round 2)
Scenery must bleed to every viewport edge; only the foreground keeps its Figma size. Use `Stage` (frame.tsx) for plain scenery, or the builder pieces below.

| Export (file) | Notes |
|---|---|
| `GlassBackdrop` (glass.tsx) | now `absolute inset-0`, needs a positioned parent. Cover-scaled with `--u = max(100vw/735, 100dvh/812)`, bottom-anchored, and pins the logo to the viewport corner. |
| `StageFrame` (glass.tsx, new) | 375x812 frame centred with `inset-0 m-auto`, `--u = min(100vw/375, 100dvh/812)`. Foreground content goes here. |
| `BuilderShell` (builder.tsx, new) | fixed full-screen `main` with the backdrop, `StageFrame`, `AnimatePresence mode="wait"` and `MotionConfig reducedMotion="user"`. |
| `BuilderStage` `previewKey` (builder.tsx, new prop) | pops the preview when the key changes. |
| `WishField` `errorTick` (builder.tsx, new prop) | re-triggers the error shake. |

Story usage (`src/components/Story/index.tsx`): `TealSky` (fixed viewport) + `Stage anchor="bottom"` for water/sala + `Stage` (centred) for moon/clouds/text + `MovingMoon` to glide the moon between the Figma poses; Scene 17 uses `Stage desktop anchor="bottom"` (fit to the smaller of width/height).
