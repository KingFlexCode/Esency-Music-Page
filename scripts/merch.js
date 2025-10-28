// merch.js
import { addToCart, updateCartCountDisplay } from "./cart-utils.js";

document.addEventListener("DOMContentLoaded", () => {
  updateCartCountDisplay();
  fetchLiveProducts();
});

async function fetchLiveProducts() {
  const merchContainer = document.getElementById("merch-container");
  const loadingMsg = document.getElementById("loading-msg");
  try {
    const res = await fetch("/.netlify/functions/fetch-printful-products");
    const data = await res.json();

    if (!data.success || !Array.isArray(data.products)) {
      merchContainer.innerHTML = "<p>Error loading products.</p>";
      return;
    }

    loadingMsg.remove();

    const grid = document.createElement("div");
    grid.className = "product-grid";

    data.products.forEach((product) => {
      const item = document.createElement("div");
      item.className = "product-card";

      item.innerHTML = `
        <img src="${product.thumbnail_url}" alt="${product.name}" class="product-img" />
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>

        <select class="product-size">
          ${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("")}
        </select>

        <button class="add-to-cart-btn">Add to Cart</button>
      `;

      const addButton = item.querySelector(".add-to-cart-btn");
      const sizeSelect = item.querySelector(".product-size");

      addButton.addEventListener("click", () => {
        addToCart(product.id, product.name, product.price, sizeSelect.value);
        showToast("Added to cart!");
      });

      grid.appendChild(item);
    });

    merchContainer.appendChild(grid);
  } catch (err) {
    console.error("Error loading products:", err);
    merchContainer.innerHTML = "<p>Failed to load products.</p>";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textConte
