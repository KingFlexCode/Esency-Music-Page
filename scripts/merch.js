import { addToCart, updateCartCountDisplay } from './cart-utils.js';

let productData = [];

/* ----------------------- FETCH PRODUCTS ----------------------- */
async function loadProducts() {
  try {
    const res = await fetch('/.netlify/functions/fetch-printful-products');
    const data = await res.json();
    productData = data.products || data.result || [];

    renderProducts(productData);
    updateCartCountDisplay();
  } catch (err) {
    console.error('Error loading merch products:', err);
    document.getElementById('product-list').textContent =
      '⚠️ Failed to load merch products.';
  }
}

/* ----------------------- RENDER PRODUCTS ----------------------- */
function renderProducts(products) {
  const grid = document.getElementById('product-list');
  grid.innerHTML = '';

  if (!products.length) {
    grid.innerHTML = '<p>No products available.</p>';
    return;
  }

  products.forEach((item) => {
    const name = item.name || 'Untitled Item';
    const variants = item.variants || [];
    const defaultPrice =
      parseFloat(item.default_price || (variants[0]?.price ?? 0)).toFixed(2);

    const card = document.createElement('div');
    card.className = 'product-card';

    // build variant dropdown if variants exist
    let variantSelectHTML = '';
    if (variants.length > 0) {
      const options = variants
        .map((v) => {
          const label = v.size || v.name || v.color || 'Option';
          return `<option value="${v.id}" data-price="${v.price}" data-size="${v.size || ''}">
                    ${label}
                  </option>`;
        })
        .join('');
      variantSelectHTML = `<select class="variant-select">${options}</select>`;
    }

    card.innerHTML = `
      <img src="${item.thumbnail_url || ''}" alt="${name}" class="product-img">
      <h3 class="product-name">${name}</h3>
      <p class="product-price">$${defaultPrice}</p>
      ${variantSelectHTML}
      <button class="add-to-cart-btn">Add to Cart</button>
    `;
    grid.appendChild(card);

    /* ------- VARIANT SELECT: update price when option changes ------- */
    const selectEl = card.querySelector('.variant-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const price = parseFloat(
          e.target.selectedOptions[0].dataset.price
        ).toFixed(2);
        card.querySelector('.product-price').textContent = `$${price}`;
      });
    }

    /* ------- ADD TO CART button ------- */
    const btn = card.querySelector('.add-to-cart-btn');
    btn.addEventListener('click', () => {
      let variantId = item.id;
      let price = parseFloat(defaultPrice);
      let size = null;

      if (selectEl) {
        const opt = selectEl.selectedOptions[0];
        variantId = opt.value;
        price = parseFloat(opt.dataset.price);
        size = opt.dataset.size || null;
      }

      addToCart({
        id: variantId,
        productId: item.id,
        name: name,
        price: price,
        size: size,
      });

      showToast(`${name} added to cart`);
    });
  });
}

/* ----------------------- CATEGORY FILTERS ----------------------- */
function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      const filtered =
        category === 'all'
          ? productData
          : productData.filter((p) =>
              (p.name || '').toLowerCase().includes(category.toLowerCase())
            );

      renderProducts(filtered);
    });
  });
}

/* ----------------------- TOAST FEEDBACK ----------------------- */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

/* ----------------------- INIT ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupFilters();
});
