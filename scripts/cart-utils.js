/* ==========================================================
   CART UTILITIES — Shared LocalStorage Cart Logic
   ========================================================== */

const CART_KEY = "esency_cart";

// ✅ Save item to localStorage
export function addToCart(productId, name, price, size) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, name, price, size, quantity: 1 });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCountDisplay();
}

// ✅ Load cart from localStorage
export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// ✅ Count total items
export function updateCartCountDisplay() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    countEl.textContent = count > 0 ? count : "";
  }
}

// ✅ Save cart to localStorage (used in cart.js)
export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ✅ Empty cart
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCountDisplay();
}
