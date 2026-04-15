(()=>{var l=`
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

/* Typing cursor \u2014 zero-width, no layout shift */
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
`,n=[{target:"studio",text:"Studio"},{target:"dot",text:"."},{target:"typo-text",text:"Typ"},{target:"typo-o",text:"a"}],h=["c","r","d","o"],i={typeSpeed:120,backspaceSpeed:80,typoPause:1e3,finalPause:1400,cursorSettle:1400,loopPause:2500},r=!1,o=class extends HTMLElement{static get observedAttributes(){return["size","link","replay","speed","theme"]}constructor(){super(),this._shadow=this.attachShadow({mode:"open"}),this._timeoutId=null,this._isActive=!1,this._observer=null,this._hasPlayed=!1}connectedCallback(){this._ensureFont(),this._render(),this._setupReplay()}disconnectedCallback(){this._cleanup()}attributeChangedCallback(){this._shadow.innerHTML&&(this._cleanup(),this._render(),this._setupReplay())}play(){this._isActive||(this._clearText(),this._isActive=!0,this._brand.classList.add("is-typing"),this._createCursor(),this._runTypewriter())}stop(){this._isActive&&(this._isActive=!1,clearTimeout(this._timeoutId),this._timeoutId=null,this._removeCursor(),this._showFinal())}reset(){this.stop(),this._hasPlayed=!1,this._clearText(),this._brand.classList.remove("is-typing")}get _replayMode(){return this.getAttribute("replay")||"loop"}_ensureFont(){if(r)return;r=!0;try{if(document.fonts&&document.fonts.check('1em "Space Mono"'))return}catch{}let t=document.createElement("link");t.rel="stylesheet",t.href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",document.head.appendChild(t)}_render(){let t=this.getAttribute("link")??"https://studiotypo.xyz/",s=t!=="",e=`
      <span class="st-brand" aria-label="Studio Typo">
        <span class="st-placeholder" aria-hidden="true">Studio.Typo</span>
        <span class="st-typed">
          <span class="st-studio"></span><span class="st-dot"></span><span class="st-typo"><span class="st-typo-text"></span><span class="st-typo-o"></span></span>
        </span>
      </span>
    `,a=s?`<a class="st-link" href="${t}" target="_blank" rel="noopener noreferrer">${e}</a>`:e;this._shadow.innerHTML=`<style>${l}</style>${a}`,this._brand=this._shadow.querySelector(".st-brand"),this._studioEl=this._shadow.querySelector(".st-studio"),this._dotEl=this._shadow.querySelector(".st-dot"),this._typoTextEl=this._shadow.querySelector(".st-typo-text"),this._letterEl=this._shadow.querySelector(".st-typo-o")}_setupReplay(){let t=this._replayMode;if(t==="none"){this._showFinal();return}this._observer=new IntersectionObserver(s=>{for(let e of s)e.isIntersecting&&(!this._isActive&&!this._hasPlayed?this.play():t==="visible"&&!this._isActive&&(this.reset(),this.play()))},{threshold:.5}),this._observer.observe(this)}_cleanup(){this._isActive=!1,clearTimeout(this._timeoutId),this._timeoutId=null,this._observer&&(this._observer.disconnect(),this._observer=null)}get _speed(){let t=parseFloat(this.getAttribute("speed"));return t>0?t:1}_t(t){return t/this._speed}_wait(t){return new Promise(s=>{this._timeoutId=setTimeout(s,this._t(t))})}_clearText(){this._studioEl&&(this._studioEl.textContent="",this._dotEl.textContent="",this._typoTextEl.textContent="",this._letterEl.textContent="",this._letterEl.classList.remove("is-typo","entering"),delete this._letterEl.dataset.letter,this._removeCursor())}_createCursor(){this._cursor=document.createElement("span"),this._cursor.className="st-cursor",this._studioEl.after(this._cursor)}_removeCursor(){this._cursor&&(this._cursor.remove(),this._cursor=null)}_moveCursorAfter(t){this._cursor&&t&&t.after(this._cursor)}_getEl(t){switch(t){case"studio":return this._studioEl;case"dot":return this._dotEl;case"typo-text":return this._typoTextEl;case"typo-o":return this._letterEl}}async _runTypewriter(){if(this._isActive){for(let t of n){let s=this._getEl(t.target);for(let e=0;e<t.text.length;e++){if(!this._isActive)return;t.target==="typo-o"&&(this._letterEl.style.transition="none",this._letterEl.classList.add("is-typo"),this._letterEl.dataset.letter=t.text[e]),s.textContent+=t.text[e],t.target==="typo-o"&&(this._letterEl.offsetHeight,this._letterEl.style.transition=""),this._moveCursorAfter(s),await this._wait(i.typeSpeed)}}if(this._isActive){await this._wait(i.cursorSettle);for(let t of h){if(!this._isActive||(this._letterEl.textContent="",this._letterEl.classList.remove("is-typo"),delete this._letterEl.dataset.letter,this._moveCursorAfter(this._letterEl),await this._wait(i.backspaceSpeed),!this._isActive))return;this._letterEl.textContent=t,t!=="o"?this._letterEl.classList.add("is-typo"):this._letterEl.classList.remove("is-typo"),this._letterEl.dataset.letter=t,this._moveCursorAfter(this._letterEl);let e=t==="o"?i.finalPause:i.typoPause;await this._wait(e)}if(this._isActive)if(this.dispatchEvent(new CustomEvent("typo:complete",{bubbles:!0})),this._replayMode==="loop"){if(this._removeCursor(),await this._wait(i.loopPause),!this._isActive)return;this._clearText(),this._createCursor(),this._runTypewriter()}else this._isActive=!1,this._removeCursor(),this._hasPlayed=!0}}}_showFinal(){this._brand.classList.add("is-typing"),this._studioEl.textContent="Studio",this._dotEl.textContent=".",this._typoTextEl.textContent="Typ",this._letterEl.textContent="o",this._letterEl.classList.remove("is-typo","entering"),this._letterEl.dataset.letter="o",this._removeCursor(),this._hasPlayed=!0}};customElements.get("studio-typo")||customElements.define("studio-typo",o);})();
