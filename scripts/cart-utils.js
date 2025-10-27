/* ==========================================================
   CART UTILITIES — Shared LocalStorage Cart Logic
   ========================================================== */

export function loadCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(id, name, price, size) {
  const cart = loadCart();
  const existing = cart.find(
    (item) => item.id === id && item.size === size
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, size, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

export function getCartCount(cart = loadCart()) {
  return cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
}

export function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = getCartCount();
}

export function clearCart() {
  localStorage.removeItem("cart");
  updateCartCount();
}
