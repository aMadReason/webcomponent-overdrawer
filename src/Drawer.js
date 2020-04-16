/* global ShadyCSS */
const css = `
  :host .menu {
    position: fixed;
    top: 0;
    background: var(--wc-bg-3, #fff);
    width: var(--wc-overdrawer-width, 100%);
    max-width: var(--wc-overdrawer-maxwidth, initial);
    min-width: var(--wc-overdrawer-minwidth, initial);
    height: var(--wc-overdrawer-height, 100%);
    max-height: var(--wc-overdrawer-maxheight, initial);
    min-height: var(--wc-overdrawer-minheight, initial);
    margin: 0;    
    z-index: 999;
    overflow-y: hidden;
    will-change: transform;
    backface-visibility: hidden;
    transition: var(--wc-overdrawer-transition, transform 300ms ease);
    box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12),0 2px 4px -1px rgba(0,0,0,0.3);

  }
  :host([data-position="left"]) .menu {
    left: 0;
    transform: translateX(-105%);
  }
  :host([data-position="right"]) .menu {
    right: 0;
    transform: translateX(105%);
  }
  :host([data-position="top"]) .menu {
    left: 0;
    transform: translateY(-105%);
    max-width: var(--wc-overdrawer-maxwidth, 100%);
    max-height: var(--wc-overdrawer-maxheight, 100%);
  }
  :host([data-position="bottom"]) .menu {
    top: auto;
    bottom: 0;
    right: 0;
    transform: translateY(105%);
    max-width: var(--wc-overdrawer-maxwidth, 100%);
    max-height: var(--wc-overdrawer-maxheight, 100%);
  }
  :host([data-open="true"]) .menu {
    transform: translateX(0%);
  }

  :host button.close {
    float: right;
    border: 0;
    font-size: 1rem;
    font-weight: bold;
    min-height: 30px;
    min-width: 30px;
    margin: 3px;
    color: var(--wc-txt-2, #333);
    border-radius: 100%;
    border: 2px solid transparent;
    transition: border 0.3s ease, background 0.5s ease;
    background: transparent;
  }
  :host([data-open]) button.close:hover {
    cursor: pointer;
    background: var(--wc-bg-2, #ddd);
  }
  :host([data-open]) button.close:focus {
    cursor: pointer;
    border: 2px solid var(--wc-txt-2, #333);
  }

  :host([data-open]) .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    opacity: 0;
    height: 100%;
    height: calc(100% + 60px);
    height: -moz-calc(100%);
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 997;
    display: block;
    width: 100%;
    pointer-events: none;
    transition: var(--wc-overlay-transition, all .5s 0 ease);
  }
  :host([data-open="true"]:not([data-overlay="false"])) .overlay {    
    opacity: 1;    
    pointer-events: all;    
  }



  /* Medium devices (tablets, 768px and up) */
  @media screen and (min-width: 768px) {
    :host([data-position="left"]) .menu,
    :host([data-position="right"]) .menu { 
      --wc-overdrawer-maxwidth: 50%;
      --wc-overdrawer-minwidth: 50%;
      --wc-overdrawer-maxheight: 100%;
      --wc-overdrawer-minheight: 100%;
    }
    :host([data-position="top"]) .menu,
    :host([data-position="bottom"]) .menu {
      --wc-overdrawer-maxwidth: 100%;
      --wc-overdrawer-minwidth: 100%;
      --wc-overdrawer-maxheight: 50%;
      --wc-overdrawer-minheight: 50%;
    }
  }

  /* Large devices (desktops, 992px and up) */
  @media screen and (min-width: 992px) and (orientation: landscape) {
    :host([data-position="left"]) .menu,
    :host([data-position="right"]) .menu { 
      --wc-overdrawer-maxwidth: 25%;
      --wc-overdrawer-minwidth: 25%;
      --wc-overdrawer-maxheight: 100%;
      --wc-overdrawer-minheight: 100%;
    }
    :host([data-position="top"]) .menu,
    :host([data-position="bottom"]) .menu {
      --wc-overdrawer-maxwidth: 100%;
      --wc-overdrawer-minwidth: 100%;
      --wc-overdrawer-maxheight: 25%;
      --wc-overdrawer-minheight: 25%;
    }
  }  

`;

const markup = values => `
  <style>${values.css}</style>
  <div class="menu">
    <div>
      <button class="close" aria-label="close menu">
        ×
      </button>
    </div>
    <div class="inner">
      <slot></slot>
    </div>    
  </div>
  <div class="overlay" aria-hidden><div>
`;

class Component extends HTMLElement {
  constructor() {
    super(); // !required!
    this._hasShadow = true; // true or fals to disable or enable shadow dom
    this.dom = this._hasShadow ? this.attachShadow({ mode: "open" }) : this;

    // setup your template
    const template = document.createElement("template");

    // we're using innerHTML but you could manually create each element and add to this._elements for complex use-cases
    template.innerHTML = markup({ css });

    /* Style Polyfill Step 1 */
    if (window.ShadyCSS) ShadyCSS.prepareTemplate(template, Component.tag); // eslint-disable-line
    /* END Style Polyfill Step 1 */

    this.instance = document.importNode(template.content, true); // copy template contents into 'this'

    /* Style Polyfill Step 2 */
    if (window.ShadyCSS) ShadyCSS.styleElement(this); // eslint-disable-line
    /* END Style Polyfill Step 2 */

    this.dom.appendChild(this.instance);
    this._setElements();
    return this;
  }

  static get observedAttributes() {
    return ["data-open"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return false; // if value hadn't changed do nothing
    this._dispatch("attribute-change");
    return this;
  }

  connectedCallback() {
    this.closeEl.addEventListener("click", () => this.close());
    this.overlayEl.addEventListener("click", () => this.close());
    this.dom.addEventListener("keydown", e => this._handleKeys(e));
  }

  disconnectedCallback() {
    this.closeEl.removeEventListener("click", () => this.close());
    this.overlayEl.removeEventListener("click", () => this.close());
    this.dom.removeEventListener("keydown", e => this._handleKeys(e));
  }

  _setElements() {
    this.closeEl = this.dom.querySelector("button.close");
    this.menuEl = this.dom.querySelector("div.menu");
    this.overlayEl = this.dom.querySelector("div.overlay");
    const focusables = this.querySelectorAll(
      "a, input, button, textarea, [tabindex='0'], [contenteditable='true']"
    );
    this.elements = [this.closeEl, ...[].slice.call(focusables)];
  }

  _dispatch(type = "dispatch") {
    const attributes = { type };
    [].slice.call(this.attributes).map(a => (attributes[a.name] = a.value));
    const event = new CustomEvent("wc-event", {
      detail: { attributes }
    });
    this.dispatchEvent(event);
  }

  _handleTrapFocus(e) {
    const target = e.target;
    const last = this.elements[this.elements.length - 1];
    const first = this.elements[0];
    const isLast = target === last && !e.shiftKey;
    const isFirst = target === first && e.shiftKey;

    if (isFirst || isLast) e.preventDefault();
    if (isLast) first.focus();
    if (isFirst) last.focus();
  }

  _handleKeys(e) {
    if (e.key.includes("Esc")) return this.close();
    if (e.key === "Tab") return this._handleTrapFocus(e);
  }

  open(triggerEl = null) {
    if (triggerEl) this.triggerEl = triggerEl;
    this.setAttribute("data-open", "true");
    this.elements.map(i => i.setAttribute("tabindex", 0));
    this.closeEl.focus();
  }

  close() {
    if (this.triggerEl) {
      this.triggerEl.focus();
      this.triggerEl = null;
    }
    this.setAttribute("data-open", "false");
  }

  toggle(triggerEl = null) {
    const toOpen = this.getAttribute("data-open") === "true" ? false : true;
    if (toOpen) return this.open(triggerEl);
    if (!toOpen) return this.close();
  }
}

const tag = "wc-overdrawer";
if (window.customElements.get(tag) === undefined) {
  window.customElements.define(tag, Component);
}

// magic that registers the tag
export default Component;
