import { addToCart, updateCartCountDisplay } from './cart-utils.js';

let productData = [];

// Fetch products from the Netlify function
async function loadProducts() {
  try {
    const res = await fetch('/.netlify/functions/fetch-printful-products');
    const data = await res.json();
    productData = data.products || data.result || [];
    renderProducts(productData);
    updateCartCountDisplay();
  } catch (err) {
    console.error(err);
    document.getElementById('product-list').textContent =
      'Error loading products.';
  }
}

// Render all products and attach events
function renderProducts(products) {
  const grid = document.getElementById('product-list');
  grid.innerHTML = '';

  products.forEach((item) => {
    const name = item.name || 'Item';
    const variants = item.variants || [];
    // Use default_price or the first variant’s price
    let price = parseFloat(
      item.default_price || (variants[0]?.price ?? 0)
    ).toFixed(2);

    // Create card
    const card = document.createElement('div');
    card.className = 'product-card';

    // Build variant dropdown if there are variants
    let variantSelectHTML = '';
    if (variants.length > 0) {
      const options = variants
        .map((v) => {
          const label = v.size || v.name || v.color || 'Option';
          return `<option value="${v.id}" data-price="${v.price}" data-size="${v.size || ''}" data-name="${v.name || ''}">${label}</option>`;
        })
        .join('');
      variantSelectHTML = `<select class="variant-select">${options}</select>`;
    }

    card.innerHTML = `
      <img src="${item.thumbnail_url || ''}" alt="${name}" class="product-img">
      <h3 class="product-name">${name}</h3>
      <p class="product-price">$${price}</p>
      ${variantSelectHTML}
      <button class="add-to-cart-btn">Add to Cart</button>
    `;
    grid.appendChild(card);

    // Handle variant change: update displayed price
    const selectEl = card.querySelector('.variant-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const opt = e.target.options[e.target.selectedIndex];
        const newPrice = parseFloat(opt.dataset.price).toFixed(2);
        card.querySelector('.product-price').textContent = `$${newPrice}`;
      });
    }

    // Add to Cart behaviour
    const btn = card.querySelector('.add-to-cart-btn');
    btn.addEventListener('click', () => {
      let variantId = item.id;
      let priceVal = parseFloat(price);
      let sizeVal = null;

      // If variants exist, use the selected variant
      if (selectEl) {
        const opt = selectEl.options[selectEl.selectedIndex];
        variantId = opt.value;
        priceVal = parseFloat(opt.dataset.price);
        sizeVal = opt.dataset.size || null;
      }

      addToCart({
        id: variantId,
        productId: item.id,    // store the base product ID if needed
        name: name,
        price: priceVal,
        size: sizeVal,
      });
      showToast(`${name} added to cart`);
    });
  });
}

// Toast notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

// Category filter setup (unchanged)
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      const filtered =
        category === 'all'
          ? productData
          : productData.filter((p) => {
              const title = p.name || '';
              return title.toLowerCase().includes(category.toLowerCase());
            });
      renderProducts(filtered);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupFilters();
});
