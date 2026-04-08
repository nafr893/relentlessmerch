/**
 * FeaturedArtistSlideshow custom element.
 * Handles previous/next navigation and optional auto-advance.
 */
class FeaturedArtistSlideshow extends HTMLElement {
  /** @type {number} */
  #current = 0;

  /** @type {ReturnType<typeof setInterval> | null} */
  #timer = null;

  connectedCallback() {
    this.#goTo(0);

    const prev = this.querySelector('[data-action="previous"]');
    const next = this.querySelector('[data-action="next"]');

    prev?.addEventListener('click', () => this.#step(-1));
    next?.addEventListener('click', () => this.#step(1));

    const autoplay = parseInt(this.dataset.autoplay ?? '0', 10);
    if (autoplay > 0) {
      this.#timer = setInterval(() => this.#step(1), autoplay * 1000);
    }

    // Pause autoplay on hover
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

  /** @param {number} direction — +1 or -1 */
  #step(direction) {
    const slides = this.querySelectorAll('.fas__slide');
    const total = slides.length;
    this.#goTo((this.#current + direction + total) % total);
    this.#stopAutoplay();
  }

  /** @param {number} index */
  #goTo(index) {
    const slides = this.querySelectorAll('.fas__slide');
    const bgs = this.querySelectorAll('.fas__bg');

    slides.forEach((slide, i) => {
      const el = /** @type {HTMLElement} */ (slide);
      el.classList.toggle('is-active', i === index);
      el.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });

    bgs.forEach((bg, i) => bg.classList.toggle('is-active', i === index));

    this.#current = index;
  }

  #stopAutoplay() {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }
}

if (!customElements.get('featured-artist-slideshow')) {
  customElements.define('featured-artist-slideshow', FeaturedArtistSlideshow);
}
