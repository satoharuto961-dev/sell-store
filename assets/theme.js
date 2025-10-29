(function () {
  function resolveQuantity(element) {
    const quantityAttr = element.getAttribute('data-checkout-quantity');
    const parsedQuantity = Number.parseInt(quantityAttr || '', 10);
    return Number.isNaN(parsedQuantity) || parsedQuantity <= 0 ? 1 : parsedQuantity;
  }

  function resolveVariantId(element) {
    const rawId = element.getAttribute('data-checkout-variant');
    if (!rawId) {
      return null;
    }

    const numericId = Number.parseInt(rawId, 10);
    return Number.isNaN(numericId) ? rawId : numericId;
  }

  function markAsLoading(element, loadingText) {
    element.dataset.checkoutOriginalMarkup = element.innerHTML;
    if (loadingText) {
      element.textContent = loadingText;
    }
    element.classList.add('is-loading');
    element.setAttribute('aria-disabled', 'true');
  }

  function clearLoadingState(element) {
    element.classList.remove('is-loading');
    element.removeAttribute('aria-disabled');
    element.dataset.checkoutProcessing = 'false';

    if (element.dataset.checkoutOriginalMarkup) {
      element.innerHTML = element.dataset.checkoutOriginalMarkup;
      delete element.dataset.checkoutOriginalMarkup;
    }
  }

  async function handleCheckoutClick(event) {
    const trigger = event.currentTarget;
    const variantId = resolveVariantId(trigger);

    if (!variantId || trigger.dataset.checkoutProcessing === 'true') {
      return;
    }

    event.preventDefault();

    const redirectUrl = trigger.getAttribute('data-checkout-redirect') || '/checkout';
    const fallbackUrl = trigger.getAttribute('href') || redirectUrl;
    const loadingText = trigger.getAttribute('data-checkout-loading-text');
    trigger.dataset.checkoutProcessing = 'true';
    markAsLoading(trigger, loadingText);

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: resolveQuantity(trigger)
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Unable to start checkout from homepage', error);
      clearLoadingState(trigger);
      window.location.href = fallbackUrl;
    }
  }

  function bindCheckoutButtons() {
    const checkoutButtons = document.querySelectorAll('[data-checkout-variant]');
    checkoutButtons.forEach((button) => {
      button.addEventListener('click', handleCheckoutClick);
    });
  }

  document.addEventListener('DOMContentLoaded', bindCheckoutButtons);
})();
