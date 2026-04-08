/**
 * HomepageBanner custom element.
 *
 * Background crossfade and column reveal are handled entirely by CSS :has().
 * This file handles keyboard accessibility only.
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
        if (e.key === 'Enter') btn.click();
      });

      // Mirror focus so CSS :hover rules also apply on keyboard focus
      col.addEventListener('focus', () => col.classList.add('is-focused'));
      col.addEventListener('blur', () => col.classList.remove('is-focused'));
    });
  }
}

if (!customElements.get('homepage-banner')) {
  customElements.define('homepage-banner', HomepageBanner);
}
