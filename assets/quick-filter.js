/**
 * Quick Filter
 * Filters product grid items based on custom.filter_group metafield values.
 *
 * Uses document-level event delegation so it works correctly after Shopify
 * view transitions or section re-renders that replace the button elements.
 * Re-reads the JSON map on every click so stale state is never used.
 */

(function () {
  'use strict';

  const SELECTORS = {
    button: '.quick-filter__button',
    jsonMap: '#quick-filter-map',
    productItem: '.product-grid__item',
  };

  const CLASSES = {
    active: 'quick-filter__button--active',
    hidden: 'quick-filter-hidden',
  };

  function getProductFilterMap() {
    const mapElement = document.querySelector(SELECTORS.jsonMap);
    if (!mapElement) return null;
    try {
      return /** @type {Record<string, string>} */ (JSON.parse(mapElement.textContent || ''));
    } catch (e) {
      console.error('Quick Filter: Failed to parse product filter map', e);
      return null;
    }
  }

  /**
   * @param {HTMLElement} clickedButton
   */
  function applyFilter(clickedButton) {
    const container = clickedButton.closest('.quick-filter');
    if (!container) return;

    const productFilterMap = getProductFilterMap();
    if (!productFilterMap) return;

    // Update active state on all buttons within this filter block
    container.querySelectorAll(SELECTORS.button).forEach((btn) => {
      btn.classList.remove(CLASSES.active);
      btn.setAttribute('aria-pressed', 'false');
    });
    clickedButton.classList.add(CLASSES.active);
    clickedButton.setAttribute('aria-pressed', 'true');

    const filterValue = clickedButton.dataset.filter;
    document.querySelectorAll(SELECTORS.productItem).forEach((item) => {
      const el = /** @type {HTMLElement} */ (item);
      const productId = el.dataset.productId;
      const productFilterGroup = productId ? productFilterMap[productId] : undefined;

      if (filterValue === 'all') {
        el.classList.remove(CLASSES.hidden);
      } else if (productFilterGroup === filterValue) {
        el.classList.remove(CLASSES.hidden);
      } else {
        el.classList.add(CLASSES.hidden);
      }
    });
  }

  // Single delegated listener on the document — survives section re-renders
  // and view transitions without needing to re-initialize.
  document.addEventListener('click', function (e) {
    const target = /** @type {Element | null} */ (e.target);
    if (!target) return;
    const button = /** @type {HTMLElement | null} */ (target.closest(SELECTORS.button));
    if (!button) return;
    applyFilter(button);
  });
})();
