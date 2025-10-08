/* ==========================================================
   CART PAGE — Handles Cart Rendering, Qty, Totals, and Events
   ========================================================== */

import { loadCart, saveCart, getCartCount, updateCartCountDisplay } from "./cart-utils.js";

// Load cart
let cart = loadCart();
updateCartCountDisplay();

// DOM refs
const $rows = document.getElementById("cart-rows");
const $table = document.getElementById("cart-table");
const $empty = document.getElementById("empty");
const $totals = document.getElementById("totals");
const $subtotal = document.getElementById("subtotal");
const $checkout = document.getElementById("checkout");

// ---------------- RENDER ----------------
export function renderCart() {
  if (!cart.length) {
    $table.style.display = "none";
    $totals.style.display = "none";
    $checkout.style.display = "none";
    $empty.style.display = "block";
    document.getElementById("cart-count").textContent = "0";
    return;
  }

  $empty.style.display = "none";
  $table.style.display = "";
  $totals.style.display = "";
  $checkout.style.display = "";

  $rows.innerHTML = cart.map((i, idx) => `
    <tr>
      <td style="text-align:left;">${i.name}</td>
      <td style="text-align:center;">${i.size || "-"}</td>
      <td style="text-align:center;">$${i.price.toFixed(2)}</td>
      <td style="text-align:center;">
        <button class="qty-btn" data-idx="${idx}" data-op="-">–</button>
        <span style="display:inline-block; min-width:24px; text-align:center;">${i.quantity}</span>
        <button class="qty-btn" data-idx="${idx}" data-op="+">+</button>
      </td>
      <td style="text-align:center;">$${(i.price * i.quantity).toFixed(2)}</td>
      <td style="text-align:center;"><button class="remove-btn" data-remove="${idx}">Remove</button></td>
    </tr>
  `).join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  $subtotal.textContent = total.toFixed(2);
  updateCartCountDisplay();
}

// Initial render
renderCart();

// ---------------- QTY / REMOVE EVENTS ----------------
document.body.addEventListener("click", (e) => {
  const minus = e.target.matches(".qty-btn[data-op='-']");
  const plus  = e.target.matches(".qty-btn[data-op='+']");
  const remove = e.target.matches("[data-remove]");

  if (minus || plus) {
    const idx = Number(e.target.getAttribute("data-idx"));
    cart[idx].quantity += plus ? 1 : -1;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  }

  if (remove) {
    const idx = Number(e.target.getAttribute("data-remove"));
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  }
});

// Export cart for other modules (like PayPal checkout)
export { cart };