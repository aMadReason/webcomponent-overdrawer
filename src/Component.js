/* global ShadyCSS */
const css = `
`;

const markup = values => `
  <style>${values.css}</style>
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
    return [];
  }

  _setElements() {
    const focusables = this.querySelectorAll(
      "a, input, button, textarea, [tabindex='0'], [contenteditable='true']"
    );
    this.elements = [...[].slice.call(focusables)];
  }

  _dispatch() {
    const event = new CustomEvent("tea-event", {
      detail: {}
    });
    this.dispatchEvent(event);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return false; // if value hadn't changed do nothing
    return this;
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

const tag = "tea-overlaynav";
if (window.customElements.get(tag) === undefined) {
  window.customElements.define(tag, Component);
}

// magic that registers the tag
export default Component;
