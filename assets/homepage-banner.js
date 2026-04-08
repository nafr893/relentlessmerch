/**
 * HomepageBanner custom element.
 *
 * Background crossfade and column reveal are handled entirely by CSS :hover and :focus-visible.
 * :focus-visible only activates on keyboard navigation — never on mouse clicks — which
 * prevents columns from getting "stuck" in the active state after a click.
 */
class HomepageBanner extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('.homepage-banner__column').forEach((col) => {
      const btn = col.querySelector('.homepage-banner__btn');
      if (!btn) return;

      col.setAttribute('tabindex', '0');
      col.setAttribute('role', 'link');
      col.setAttribute('aria-label', col.querySelector('.homepage-banner__heading')?.textContent?.trim() ?? '');

      col.addEventListener('keydown', (e) => {
        if (/** @type {KeyboardEvent} */ (e).key === 'Enter') /** @type {HTMLElement} */ (btn).click();
      });
    });
  }
}

if (!customElements.get('homepage-banner')) {
  customElements.define('homepage-banner', HomepageBanner);
}
