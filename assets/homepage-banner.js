/**
 * HomepageBanner custom element.
 *
 * Desktop: background crossfade + column reveal handled by CSS :hover / :focus-visible.
 * Mobile:  auto-advancing slideshow with square dot pagination and touch swipe support.
 */
class HomepageBanner extends HTMLElement {
  /** @type {ReturnType<typeof setInterval> | null} */
  #timer = null;

  /** @type {number} */
  #current = 0;

  /** @type {number} */
  #touchStartX = 0;

  connectedCallback() {
    this.#initDesktopA11y();
    this.#initMobileSlideshow();
  }

  disconnectedCallback() {
    this.#stopAutoplay();
  }

  // ── Desktop keyboard accessibility ──────────────────────────────────────────

  #initDesktopA11y() {
    const columns = this.querySelectorAll('.homepage-banner__column');

    columns.forEach((col) => {
      const btn = col.querySelector('.homepage-banner__btn');
      if (!btn) return;

      col.setAttribute('tabindex', '0');
      col.setAttribute('role', 'link');
      col.setAttribute(
        'aria-label',
        col.querySelector('.homepage-banner__heading')?.textContent?.trim() ?? ''
      );

      col.addEventListener('keydown', (e) => {
        if (/** @type {KeyboardEvent} */ (e).key === 'Enter') {
          /** @type {HTMLElement} */ (btn).click();
        }
      });

      // Remove the default-active state permanently once the user starts hovering
      col.addEventListener('mouseenter', () => {
        columns.forEach((c) => c.classList.remove('is-default-active'));
      }, { once: false });
    });
  }

  // ── Mobile slideshow ────────────────────────────────────────────────────────

  #initMobileSlideshow() {
    const mobile = this.querySelector('.homepage-banner__mobile');
    if (!mobile) return;

    // Only run on mobile — IntersectionObserver keeps it cheap on desktop
    const mq = window.matchMedia('(max-width: 749px)');
    if (!mq.matches) {
      mq.addEventListener('change', (e) => {
        if (e.matches) this.#startAutoplay();
        else this.#stopAutoplay();
      });
      return;
    }

    this.#bindDots();
    this.#bindSwipe();
    this.#startAutoplay();
  }

  #bindDots() {
    this.querySelectorAll('.homepage-banner__dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(/** @type {HTMLElement} */ (dot).dataset.dot ?? '0', 10);
        this.#goTo(idx);
        // Reset the timer so the next auto-advance is a full interval away
        this.#stopAutoplay();
        this.#startAutoplay();
      });
    });
  }

  #bindSwipe() {
    const slides = this.querySelector('.homepage-banner__slides');
    if (!slides) return;

    slides.addEventListener('touchstart', (e) => {
      const touch = /** @type {TouchEvent} */ (e).touches[0];
      if (touch) this.#touchStartX = touch.clientX;
    }, { passive: true });

    slides.addEventListener('touchend', (e) => {
      const touch = /** @type {TouchEvent} */ (e).changedTouches[0];
      if (!touch) return;
      const delta = touch.clientX - this.#touchStartX;
      if (Math.abs(delta) < 40) return; // ignore small movements

      const slideEls = this.querySelectorAll('.homepage-banner__slide');
      const total = slideEls.length;
      if (delta < 0) {
        this.#goTo((this.#current + 1) % total);
      } else {
        this.#goTo((this.#current - 1 + total) % total);
      }
      this.#stopAutoplay();
      this.#startAutoplay();
    }, { passive: true });
  }

  #startAutoplay() {
    const seconds = parseInt(this.dataset.autoplay ?? '5', 10);
    const slideEls = this.querySelectorAll('.homepage-banner__slide');
    if (slideEls.length <= 1) return;

    this.#timer = setInterval(() => {
      this.#goTo((this.#current + 1) % slideEls.length);
    }, seconds * 1000);
  }

  #stopAutoplay() {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  /**
   * Activate a slide and its matching dot.
   * @param {number} index
   */
  #goTo(index) {
    const slides = this.querySelectorAll('.homepage-banner__slide');
    const dots = this.querySelectorAll('.homepage-banner__dot');

    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    this.#current = index;
  }
}

if (!customElements.get('homepage-banner')) {
  customElements.define('homepage-banner', HomepageBanner);
}
