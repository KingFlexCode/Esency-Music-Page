/* =========================================================================
   Cart Utilities for Esency merch
   Handles: load cart from localStorage, save cart, add item, clear cart,
            get cart count, update cart count display.
   ========================================================================= */

const CART_KEY = 'esencyCart';

export function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function getCart() {
  return loadCart();
}

export function getCartCount() {
  return loadCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function updateCartCountDisplay() {
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = getCartCount();
  }
}

export function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find(
    (item) => item.id === product.id && item.size === product.size
  );
  if (existing) {
    existing.quantity += product.quantity || 1;
  } else {
    cart.push({ ...product, quantity: product.quantity || 1 });
  }
  saveCart(cart);
  updateCartCountDisplay();
}

export function clearCart() {
  saveCart([]);
  updateCartCountDisplay();
}
