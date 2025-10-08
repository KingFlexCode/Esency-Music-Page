/* ==========================================================
   CART UTILITIES — Shared LocalStorage Cart Logic
   ========================================================== */

export function loadCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getCartCount(cart = loadCart()) {
  return cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
}

export function updateCartCountDisplay() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = getCartCount();
}

export function clearCart() {
  localStorage.removeItem("cart");
  updateCartCountDisplay();
}