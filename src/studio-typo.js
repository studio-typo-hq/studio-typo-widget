/**
 * <studio-typo> — Self-contained typewriter attribution widget.
 * Types "Studio.Typo" letter by letter, cycles the last letter through
 * typo corrections (a → c → r → d → o) with colored letters and wavy underlines.
 * Loops continuously by default.
 *
 * Usage:
 *   <script src="studio-typo.js"></script>
 *   <studio-typo></studio-typo>
 *
 * Attributes:
 *   size   — "small" (14px) | "medium" (18px) | "large" (32px)
 *   link   — URL to link to (default: "https://studiotypo.xyz/")
 *   replay — "loop" (default, continuous) | "once" | "visible" | "none"
 *   speed  — number multiplier (default: 1)
 *   theme  — "auto" (default) | "dark" | "light"
 */

const STYLES = `
:host {
  display: inline-block;
  font-family: var(--st-font, 'Space Mono', 'SF Mono', 'Consolas', monospace);
  line-height: 1.4;
}

/* Auto theme: detect from prefers-color-scheme */
:host(:not([theme])), :host([theme="auto"]) {
  color: var(--st-text-color, inherit);
}
@media (prefers-color-scheme: dark) {
  :host(:not([theme])), :host([theme="auto"]) {
    color: var(--st-text-color, #ffffff);
  }
}
@media (prefers-color-scheme: light) {
  :host(:not([theme])), :host([theme="auto"]) {
    color: var(--st-text-color, #111111);
  }
}

/* Explicit themes */
:host([theme="dark"]) {
  color: var(--st-text-color, #ffffff);
}
:host([theme="light"]) {
  color: var(--st-text-color, #111111);
}

/* Size variants */
:host([size="small"]), :host(:not([size])) {
  font-size: 14px;
}
:host([size="medium"]) {
  font-size: 18px;
}
:host([size="large"]) {
  font-size: 32px;
}

.st-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
.st-link:hover {
  opacity: 0.85;
}

.st-brand {
  display: inline-block;
  position: relative;
  white-space: nowrap;
}

/* Invisible placeholder prevents layout shift */
.st-placeholder {
  visibility: hidden;
  display: inline;
}
.st-brand.is-typing .st-placeholder {
  position: absolute;
  pointer-events: none;
}

.st-typed {
  display: none;
}
.st-brand.is-typing .st-typed {
  display: inline;
}

.st-studio, .st-typo {
  display: inline;
}

/* Typing cursor — zero-width, no layout shift */
.st-cursor {
  display: inline-block;
  width: 0;
  height: 0.9em;
  vertical-align: baseline;
  position: relative;
  overflow: visible;
}
.st-cursor::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 0.06em;
  height: 100%;
  background: currentColor;
  animation: st-blink 530ms step-end infinite;
}

@keyframes st-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Typo letter */
.st-typo-o {
  display: inline;
  position: relative;
  color: var(--st-squiggly, #ff3b30);
  transition: color 0.2s ease-out;
}

/* Typo state: wavy red underline */
.st-typo-o.is-typo {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--st-squiggly, #ff3b30);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

/* Letter enter animation */
.st-typo-o.entering {
  animation: st-enter 0.18s ease-out forwards;
}

@keyframes st-enter {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Per-letter accent colors */
.st-typo-o[data-letter="o"] { color: var(--st-squiggly, #ff3b30); }
.st-typo-o[data-letter="a"] { color: var(--st-letter-a, #2dd4bf); }
.st-typo-o[data-letter="c"] { color: var(--st-letter-c, #a78bfa); }
.st-typo-o[data-letter="r"] { color: var(--st-letter-r, #34d399); }
.st-typo-o[data-letter="d"] { color: var(--st-letter-d, #f59e0b); }
`;

// Text segments matching the DOM structure
const SEGMENTS = [
  { target: "studio", text: "Studio" },
  { target: "dot", text: "." },
  { target: "typo-text", text: "Typ" },
  { target: "typo-o", text: "a" },
];

const TYPO_LETTERS = ["c", "r", "d", "o"];

const BASE_TIMINGS = {
  typeSpeed: 120,
  backspaceSpeed: 80,
  typoPause: 1000,
  finalPause: 1400,
  cursorSettle: 1400,
  loopPause: 2500,
};

let fontInjected = false;

class StudioTypo extends HTMLElement {
  static get observedAttributes() {
    return ["size", "link", "replay", "speed", "theme"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._timeoutId = null;
    this._isActive = false;
    this._observer = null;
    this._hasPlayed = false;
  }

  connectedCallback() {
    this._ensureFont();
    this._render();
    this._setupReplay();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  attributeChangedCallback() {
    if (this._shadow.innerHTML) {
      this._cleanup();
      this._render();
      this._setupReplay();
    }
  }

  // -- Public API --

  play() {
    if (this._isActive) return;
    this._clearText();
    this._isActive = true;
    this._brand.classList.add("is-typing");
    this._createCursor();
    this._runTypewriter();
  }

  stop() {
    if (!this._isActive) return;
    this._isActive = false;
    clearTimeout(this._timeoutId);
    this._timeoutId = null;
    this._removeCursor();
    this._showFinal();
  }

  reset() {
    this.stop();
    this._hasPlayed = false;
    this._clearText();
    this._brand.classList.remove("is-typing");
  }

  // -- Internal --

  get _replayMode() {
    return this.getAttribute("replay") || "loop";
  }

  _ensureFont() {
    if (fontInjected) return;
    fontInjected = true;
    try {
      if (document.fonts && document.fonts.check('1em "Space Mono"')) return;
    } catch {}
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
  }

  _render() {
    const linkUrl = this.getAttribute("link") ?? "https://studiotypo.xyz/";
    const useLink = linkUrl !== "";

    const inner = `
      <span class="st-brand" aria-label="Studio Typo">
        <span class="st-placeholder" aria-hidden="true">Studio.Typo</span>
        <span class="st-typed">
          <span class="st-studio"></span><span class="st-dot"></span><span class="st-typo"><span class="st-typo-text"></span><span class="st-typo-o"></span></span>
        </span>
      </span>
    `;

    const wrapped = useLink
      ? `<a class="st-link" href="${linkUrl}" target="_blank" rel="noopener noreferrer">${inner}</a>`
      : inner;

    this._shadow.innerHTML = `<style>${STYLES}</style>${wrapped}`;

    // Cache element references
    this._brand = this._shadow.querySelector(".st-brand");
    this._studioEl = this._shadow.querySelector(".st-studio");
    this._dotEl = this._shadow.querySelector(".st-dot");
    this._typoTextEl = this._shadow.querySelector(".st-typo-text");
    this._letterEl = this._shadow.querySelector(".st-typo-o");
  }

  _setupReplay() {
    const mode = this._replayMode;

    if (mode === "none") {
      this._showFinal();
      return;
    }

    // For "loop", "once", and "visible" — start on intersection
    this._observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!this._isActive && !this._hasPlayed) {
              this.play();
            } else if (mode === "visible" && !this._isActive) {
              this.reset();
              this.play();
            }
          }
        }
      },
      { threshold: 0.5 }
    );
    this._observer.observe(this);
  }

  _cleanup() {
    this._isActive = false;
    clearTimeout(this._timeoutId);
    this._timeoutId = null;
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  get _speed() {
    const s = parseFloat(this.getAttribute("speed"));
    return s > 0 ? s : 1;
  }

  _t(ms) {
    return ms / this._speed;
  }

  _wait(ms) {
    return new Promise((resolve) => {
      this._timeoutId = setTimeout(resolve, this._t(ms));
    });
  }

  _clearText() {
    if (!this._studioEl) return;
    this._studioEl.textContent = "";
    this._dotEl.textContent = "";
    this._typoTextEl.textContent = "";
    this._letterEl.textContent = "";
    this._letterEl.classList.remove("is-typo", "entering");
    delete this._letterEl.dataset.letter;
    this._removeCursor();
  }

  _createCursor() {
    this._cursor = document.createElement("span");
    this._cursor.className = "st-cursor";
    this._studioEl.after(this._cursor);
  }

  _removeCursor() {
    if (this._cursor) {
      this._cursor.remove();
      this._cursor = null;
    }
  }

  _moveCursorAfter(el) {
    if (this._cursor && el) {
      el.after(this._cursor);
    }
  }

  _getEl(target) {
    switch (target) {
      case "studio": return this._studioEl;
      case "dot": return this._dotEl;
      case "typo-text": return this._typoTextEl;
      case "typo-o": return this._letterEl;
    }
  }

  async _runTypewriter() {
    if (!this._isActive) return;

    // Phase 1: Type out "Studio.Typa" letter by letter
    for (const seg of SEGMENTS) {
      const el = this._getEl(seg.target);
      for (let i = 0; i < seg.text.length; i++) {
        if (!this._isActive) return;
        if (seg.target === "typo-o") {
          this._letterEl.style.transition = "none";
          this._letterEl.classList.add("is-typo");
          this._letterEl.dataset.letter = seg.text[i];
        }
        el.textContent += seg.text[i];
        if (seg.target === "typo-o") {
          this._letterEl.offsetHeight; // force recalc
          this._letterEl.style.transition = "";
        }
        this._moveCursorAfter(el);
        await this._wait(BASE_TIMINGS.typeSpeed);
      }
    }

    // Pause after full text
    if (!this._isActive) return;
    await this._wait(BASE_TIMINGS.cursorSettle);

    // Phase 2: Typo cycle — backspace + retype
    for (const letter of TYPO_LETTERS) {
      if (!this._isActive) return;

      // Backspace
      this._letterEl.textContent = "";
      this._letterEl.classList.remove("is-typo");
      delete this._letterEl.dataset.letter;
      this._moveCursorAfter(this._letterEl);
      await this._wait(BASE_TIMINGS.backspaceSpeed);

      if (!this._isActive) return;

      // Type new letter
      this._letterEl.textContent = letter;
      const isTypo = letter !== "o";
      if (isTypo) {
        this._letterEl.classList.add("is-typo");
      } else {
        this._letterEl.classList.remove("is-typo");
      }
      this._letterEl.dataset.letter = letter;
      this._moveCursorAfter(this._letterEl);

      const pause = letter === "o" ? BASE_TIMINGS.finalPause : BASE_TIMINGS.typoPause;
      await this._wait(pause);
    }

    // Phase 3: Done — fire event, then loop or stop
    if (!this._isActive) return;
    this.dispatchEvent(new CustomEvent("typo:complete", { bubbles: true }));

    if (this._replayMode === "loop") {
      // Pause on the final "o", then restart
      this._removeCursor();
      await this._wait(BASE_TIMINGS.loopPause);
      if (!this._isActive) return;
      this._clearText();
      this._createCursor();
      this._runTypewriter();
    } else {
      this._isActive = false;
      this._removeCursor();
      this._hasPlayed = true;
    }
  }

  _showFinal() {
    this._brand.classList.add("is-typing");
    this._studioEl.textContent = "Studio";
    this._dotEl.textContent = ".";
    this._typoTextEl.textContent = "Typ";
    this._letterEl.textContent = "o";
    this._letterEl.classList.remove("is-typo", "entering");
    this._letterEl.dataset.letter = "o";
    this._removeCursor();
    this._hasPlayed = true;
  }
}

if (!customElements.get("studio-typo")) {
  customElements.define("studio-typo", StudioTypo);
}

export { StudioTypo };
