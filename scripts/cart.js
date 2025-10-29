import {
  getCart,
  saveCart,
  clearCart,
  updateCartCountDisplay,
} from './cart-utils.js';
import { createPrintfulOrder } from './printful-api.js';

function renderCart() {
  const cart = getCart();
  const table = document.getElementById('cart-table');
  const tbody = document.getElementById('cart-rows');
  const emptyEl = document.getElementById('empty');
  const totalsDiv = document.getElementById('totals');
  const subtotalSpan = document.getElementById('subtotal');
  const checkoutDiv = document.getElementById('checkout');

  if (!cart || cart.length === 0) {
    table.style.display = 'none';
    totalsDiv.style.display = 'none';
    checkoutDiv.style.display = 'none';
    emptyEl.style.display = 'block';
    updateCartCountDisplay();
    return;
  }

  emptyEl.style.display = 'none';
  table.style.display = 'table';
  totalsDiv.style.display = 'flex';
  checkoutDiv.style.display = 'flex';

  tbody.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item, index) => {
    const row = document.createElement('tr');
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.size || '-'}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <button class="qty-btn minus" data-index="${index}">-</button>
        <span style="padding:0 8px;">${item.quantity}</span>
        <button class="qty-btn plus" data-index="${index}">+</button>
      </td>
      <td>$${itemTotal.toFixed(2)}</td>
      <td><button class="remove-btn" data-index="${index}">x</button></td>
    `;
    tbody.appendChild(row);
  });
  subtotalSpan.textContent = subtotal.toFixed(2);
  updateCartCountDisplay();
}

function onQuantityClick(e) {
  if (e.target.classList.contains('qty-btn')) {
    const cart = getCart();
    const index = parseInt(e.target.dataset.index, 10);
    if (e.target.classList.contains('plus')) {
      cart[index].quantity += 1;
    } else {
      cart[index].quantity = Math.max(1, cart[index].quantity - 1);
    }
    saveCart(cart);
    renderCart();
  }
}

function onRemoveClick(e) {
  if (e.target.classList.contains('remove-btn')) {
    const cart = getCart();
    const index = parseInt(e.target.dataset.index, 10);
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }
}

function attachEventHandlers() {
  const tbody = document.getElementById('cart-rows');
  tbody.addEventListener('click', onQuantityClick);
  tbody.addEventListener('click', onRemoveClick);

  const testBtn = document.getElementById('printify-test-btn');
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      try {
        const cart = getCart();
        if (!cart.length) {
          alert('Your cart is empty.');
          return;
        }
        const result = await createPrintfulOrder(cart);
        sessionStorage.setItem(
          'lastOrderId',
          result.orderId || result.id || ''
        );
        clearCart();
        window.location.href = './thankyou.html';
      } catch (err) {
        console.error(err);
        alert('Order failed.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  attachEventHandlers();
});
