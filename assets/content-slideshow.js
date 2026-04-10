/**
 * ContentSlideshow custom element.
 * Handles dot navigation, touch swipe, and optional auto-advance.
 */
class ContentSlideshow extends HTMLElement {
  /** @type {number} */
  #current = 0;

  /** @type {ReturnType<typeof setInterval> | null} */
  #timer = null;

  /** @type {number} */
  #touchStartX = 0;

  /** @type {number} */
  #touchStartY = 0;



  

  connectedCallback() {
    this.#goTo(0);

    this.querySelectorAll('.cs__dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(/** @type {HTMLElement} */ (dot).dataset.dot ?? '0', 10);
        this.#goTo(idx);
        this.#stopAutoplay();
      });
    });

    this.addEventListener('click', (e) => {
      const btn = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-action]'));
      if (!btn) return;
      if (btn.dataset.action === 'previous') { this.#step(-1); this.#stopAutoplay(); }
      if (btn.dataset.action === 'next') { this.#step(1); this.#stopAutoplay(); }
    });

    const autoplay = parseInt(this.dataset.autoplay ?? '0', 10);
    if (autoplay > 0) {
      this.#timer = setInterval(() => this.#step(1), autoplay * 1000);
    }

    this.#bindSwipe();

    this.addEventListener('mouseenter', () => this.#stopAutoplay());
    this.addEventListener('mouseleave', () => {
      if (autoplay > 0) {
        this.#timer = setInterval(() => this.#step(1), autoplay * 1000);
      }
    });
  }

  disconnectedCallback() {
    this.#stopAutoplay();
  }

  /** @param {number} direction */
  #step(direction) {
    const slides = this.querySelectorAll('.cs__slide');
    const total = slides.length;
    this.#goTo((this.#current + direction + total) % total);
  }

  /** @param {number} index */
  #goTo(index) {
    this.querySelectorAll('.cs__slide').forEach((slide, i) => {
      const el = /** @type {HTMLElement} */ (slide);
      el.classList.toggle('is-active', i === index);
      el.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });

    this.querySelectorAll('.cs__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    this.#current = index;
  }

  #stopAutoplay() {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  #bindSwipe() {
    this.addEventListener('touchstart', (e) => {
      const touch = /** @type {TouchEvent} */ (e).touches[0];
      if (touch) {
        this.#touchStartX = touch.clientX;
        this.#touchStartY = touch.clientY;
      }
    }, { passive: true });

    this.addEventListener('touchend', (e) => {
      const touch = /** @type {TouchEvent} */ (e).changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - this.#touchStartX;
      const dy = touch.clientY - this.#touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;

      const slides = this.querySelectorAll('.cs__slide');
      const total = slides.length;
      if (dx < 0) {
        this.#goTo((this.#current + 1) % total);
      } else {
        this.#goTo((this.#current - 1 + total) % total);
      }
      this.#stopAutoplay();
    }, { passive: true });
  }
}

if (!customElements.get('content-slideshow')) {
  customElements.define('content-slideshow', ContentSlideshow);
}
