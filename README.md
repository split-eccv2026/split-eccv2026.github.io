# SPLIT — Project Page

Project page for **SPLIT: Training-Free AI-Generated and Partially Edited Video Detection via Spatial Patch-Level Incoherence and Temporal Roughness** (ECCV 2026).

Jongyeop Hyun, Hyounghun Kim — POSTECH

- Page: https://split-eccv2026.github.io/
- Paper: https://arxiv.org/abs/2607.02886
- Code: https://github.com/mldljyh/SPLIT

## Layout

```
index.html                  # the whole page
static/css/split.css        # paper-specific styles (tables, figures, cards)
static/css/index.css        # template base styles
static/katex/               # vendored KaTeX CSS + woff2 fonts (no CDN)
static/images/figures/      # figures exported from the paper
static/images/favicon.ico
static/images/social_preview.png
tools/render-math.js        # build-time LaTeX pre-rendering
paper/                      # LaTeX source (not deployed)
```

## Math

Equations are authored directly in `index.html` as LaTeX — `\[ ... \]` for display,
`\( ... \)` for inline — and pre-rendered to HTML + MathML with KaTeX at build time,
so the published page needs no JavaScript to show them.

After editing any equation, re-run the renderer:

```sh
cd tools && npm install && npm run math
```

Each rendered span keeps its LaTeX source in a `data-tex` attribute, so the script is
idempotent and re-runnable: it restores sources first, then re-renders. To edit an
equation, change the `data-tex` value (or restore first by running the script, then
edit the plain LaTeX).

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Updating figures

Figures are PNG exports of the paper's PDF figures, downscaled with `sips`:

```sh
sips -Z 2400 paper/images/teaser-1.png --out static/images/figures/teaser.png
```

## Credits

Built on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template), adopted from the [Nerfies](https://nerfies.github.io) page.
Website content licensed under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
