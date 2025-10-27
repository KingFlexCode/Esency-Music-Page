/* ==========================================================
   ESENCY MERCH PAGE — Dynamic Product Rendering with
   Printful Live Prices + Local Caching
   ========================================================== */

import { PRODUCT_MAP } from "./product-map.js";
import { addToCart, updateCartCount } from "./cart-utils.js";

// --- Constants ---
const PRICE_CACHE_KEY = "printfulPriceCache";
const PRICE_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// --- Initialize ---
document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount();

  const priceMap = await getCachedPrices();
  renderMerch(priceMap);

  // 🛒 Add-to-cart listener
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const item = e.target.closest(".merch-item");
      const productId = item.dataset.id;
      const name = item.querySelector(".product-name").textContent.trim();
      const price = parseFloat(item.dataset.price);
      const size = item.querySelector("select[name='size']").value;

      if (!size) {
        alert("Please select a size first.");
        return;
      }

      addToCart(productId, name, price, size);
      showToast(`${name} (${size}) added to cart.`);
    }
  });
});

/* ----------------------------------------------------------
   🔄 Fetch or load cached prices
   ---------------------------------------------------------- */
async function getCachedPrices() {
  try {
    const cached = localStorage.getItem(PRICE_CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp < PRICE_CACHE_DURATION) {
        console.log("💾 Using cached Printful prices");
        return data;
      }
    }

    const res = await fetch("/.netlify/functions/fetch-printful-prices");
    const result = await res.json();

  if (result.success) {
    const data = result.priceMap;
    localStorage.setItem(
      
      PRICE_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    );
    return data;
  }else {
      console.warn("⚠️ Failed to fetch live prices:", result.error);
    }
  } catch (err) {
    console.error("❌ Error fetching prices:", err);
  }
  return {}; // fallback
}

/* ----------------------------------------------------------
   🧱 Render merch dynamically from PRODUCT_MAP
   ---------------------------------------------------------- */
function renderMerch(priceMap = {}) {
  const merchContainer = document.getElementById("merch-container");
  merchContainer.innerHTML = "";

  const grouped = {};
  Object.entries(PRODUCT_MAP).forEach(([key, product]) => {
    if (!grouped[product.category]) grouped[product.category] = [];
    grouped[product.category].push({ key, ...product });
  });

  for (const [category, items] of Object.entries(grouped)) {
    const section = document.createElement("section");
    section.className = "merch-gallery";
    section.innerHTML = `<div class="merch-section-header"><h1>${category}</h1></div>`;

    const gallery = document.createElement("div");
    gallery.className = "merch-grid";

    items.forEach((p) => {
      const price = priceMap[p.product_id] || 35.0;
      const sizes = Object.keys(p.variants)
        .map((s) => `<option value="${s}">${s}</option>`)
        .join("");

      const productHTML = `
        <div class="merch-item" data-id="${p.key}" data-price="${price}">
          <img src="${p.thumbnail}" alt="${p.key}">
          <p class="product-name">${formatName(p.key)}</p>
          <p class="product-price">$${price.toFixed(2)}</p>
          <div class="size-row">
            <label>Size:</label>
            <select name="size">
              <option value="">Select size</option>
              ${sizes}
            </select>
          </div>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      `;
      gallery.insertAdjacentHTML("beforeend", productHTML);
    });

    section.appendChild(gallery);
    merchContainer.appendChild(section);
  }
}

/* ----------------------------------------------------------
   🧩 Utilities
   ---------------------------------------------------------- */
function formatName(key) {
  return key
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function showToast(message = "Added to cart.") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}
