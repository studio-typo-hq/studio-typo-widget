# `<studio-typo>` Attribution Widget

Self-contained Web Component that plays the Studio.Typo typewriter animation. Drop it into any project as a "built by" attribution. Loops continuously, adapts to light/dark mode automatically.

## Quick Start

```html
<script src="studio-typo.js"></script>
<studio-typo></studio-typo>
```

## Install

**Option A — Script tag (no build step):**

Copy `dist/studio-typo.js` into your project and add a script tag.

**Option B — npm:**

```bash
npm install studio-typo-widget
```

```js
import "studio-typo-widget";
// or: import { StudioTypo } from "studio-typo-widget";
```

## Attributes

| Attribute | Default | Options |
|-----------|---------|---------|
| `size` | `small` | `small` (14px), `medium` (18px), `large` (32px) |
| `link` | `https://studiotypo.xyz/` | Any URL, or `""` to disable |
| `replay` | `loop` | `loop` (continuous), `once`, `visible` (replay on scroll), `none` (static) |
| `speed` | `1` | Any positive number (e.g. `0.5` slower, `2` faster) |
| `theme` | `auto` | `auto` (detects OS preference), `dark`, `light` |

## Theming

The widget auto-detects `prefers-color-scheme` by default. Override colors from the host page:

```css
studio-typo {
  --st-text-color: #333;
  --st-font: 'Space Mono', monospace;
  --st-squiggly: #ff3b30;
  --st-letter-a: #2dd4bf;
  --st-letter-c: #a78bfa;
  --st-letter-r: #34d399;
  --st-letter-d: #f59e0b;
}
```

## JavaScript API

```js
const el = document.querySelector('studio-typo');
el.play();   // trigger animation
el.stop();   // stop and show final state
el.reset();  // reset to blank

el.addEventListener('typo:complete', () => { /* fires each cycle */ });
```

## Examples

```html
<!-- Footer attribution (loops by default) -->
<footer>
  <studio-typo size="small"></studio-typo>
</footer>

<!-- Hero / large display -->
<studio-typo size="large" speed="0.8"></studio-typo>

<!-- Play once only -->
<studio-typo replay="once"></studio-typo>

<!-- Static (no animation) -->
<studio-typo replay="none"></studio-typo>

<!-- Force dark theme -->
<studio-typo theme="dark"></studio-typo>
```

## Build

```bash
npm install
npm run build
```

Outputs `dist/studio-typo.js` (IIFE) and `dist/studio-typo.esm.js` (ESM).
