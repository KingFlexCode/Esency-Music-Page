import { addToCart, updateCartCount } from "./cart-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount();

  const products = await fetchLiveProducts();
  if (products.length === 0) {
    document.getElementById("merch-container").innerHTML =
      "<p style='text-align:center;'>No products found.</p>";
    return;
  }

  renderMerch(products);

  // 🛒 Add to cart handler
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const item = e.target.closest(".merch-item");
      const productId = item.dataset.id;
      const name = item.querySelector(".product-name").textContent.trim();
      const price = parseFloat(item.dataset.price);
      const size = item.querySelector("select[name='size']").value;

      if (!size) {
        alert("Please select a size.");
        return;
      }

      addToCart(productId, name, price, size);
      showToast(`${name} (${size}) added to cart.`);
    }
  });
});

/* ----------------------------------------------------
   🔄 Fetch live products from Netlify Printful function
----------------------------------------------------- */
async function fetchLiveProducts() {
  try {
    const res = await fetch("/.netlify/functions/fetch-printful-products");
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products;
    }
  } catch (err) {
    console.error("❌ Error loading products:", err);
  }
  return [];
}

/* ----------------------------------------------------
   🧱 Render the merch items on page
----------------------------------------------------- */
function renderMerch(products) {
  const merchContainer = document.getElementById("merch-container");
  merchContainer.innerHTML = "";

  const section = document.createElement("section");
  section.className = "merch-gallery";
  section.innerHTML = `
    <div class="merch-section-header"><h1>Esency Merch</h1></div>
  `;

  const gallery = document.createElement("div");
  gallery.className = "merch-grid";

  for (const product of products) {
    const { id, name, price, thumbnail, sizes = ["S", "M", "L", "XL"] } = product;

    const sizeOptions = sizes
      .map((size) => `<option value="${size}">${size}</option>`)
      .join("");

    const html = `
      <div class="merch-item" data-id="${id}" data-price="${price}">
        <img src="${thumbnail}" alt="${name}" />
        <p class="product-name">${name}</p>
        <p class="product-price">$${price.toFixed(2)}</p>
        <div class="size-row">
          <label>Size:</label>
          <select name="size">
            <option value="">Select size</option>
            ${sizeOptions}
          </select>
        </div>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `;
    gallery.insertAdjacentHTML("beforeend", html);
  }

  section.appendChild(gallery);
  merchContainer.appendChild(section);
}

/* ----------------------------------------------------
   ✅ Show fading toast notification
----------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
