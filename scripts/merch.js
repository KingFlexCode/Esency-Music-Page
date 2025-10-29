import { addToCart, updateCartCountDisplay } from './cart-utils.js';

let productData = [];

// Fetch products from your Netlify function
async function loadProducts() {
  try {
    const res = await fetch('/.netlify/functions/fetch-printful-products');
    const data = await res.json();
    productData = data.result || data.products || [];
    renderProducts(productData);
    updateCartCountDisplay();
  } catch (err) {
    console.error(err);
    document.getElementById('product-list').textContent =
      'Error loading products.';
  }
}

// Render a list of products into the grid
function renderProducts(products) {
  const grid = document.getElementById('product-list');
  grid.innerHTML = '';
  products.forEach((item) => {
    const name = item.name || item.sync_product?.name || 'Item';
    const price = parseFloat(
      item.sync_variants?.[0]?.retail_price ||
        item.variants?.[0]?.retail_price ||
        0
    ).toFixed(2);
    const image =
      item.thumbnail_url || item.sync_product?.thumbnail_url || '';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${image}" alt="${name}" class="product-img">
      <h3 class="product-name">${name}</h3>
      <p class="product-price">$${price}</p>
      <button class="add-to-cart-btn" data-id="${item.id}" data-name="${name}" data-price="${price}">Add to Cart</button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      addToCart({ id, name, price, quantity: 1, size: null });
      showToast(`${name} added to cart`);
    });
  });
}

// Toast notification when an item is added
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

// Set up category filters (All, T‑shirts, Hoodies, Accessories)
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      const filtered =
        category === 'all'
          ? productData
          : productData.filter((p) => {
              const name = p.name || p.sync_product?.name || '';
              return name.toLowerCase().includes(category.toLowerCase());
            });
      renderProducts(filtered);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupFilters();
});
