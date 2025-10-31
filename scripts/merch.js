// scripts/merch.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🟢 Merch page script loaded");

  const productGrid = document.querySelector(".product-grid");
  if (!productGrid) {
    console.error("❌ Missing .product-grid container in HTML");
    return;
  }

  // Step 1️⃣: Fetch products from Netlify
  let products = [];
  try {
    const res = await fetch("/.netlify/functions/fetch-printful-products");
    console.log("📡 Fetch status:", res.status);

    const text = await res.text();
    console.log("🧾 Raw response (first 300 chars):", text.slice(0, 300));

    const data = JSON.parse(text);
    if (data.success && Array.isArray(data.products)) {
      products = data.products;
      console.log(`✅ Loaded ${products.length} products`);
    } else {
      console.warn("⚠️ Unexpected data format:", data);
    }
  } catch (err) {
    console.error("❌ Failed to fetch products:", err);
  }

  // Step 2️⃣: Render fallback message if no data
  if (!products.length) {
    productGrid.innerHTML = `
      <p style="color:white; text-align:center; font-size:1.2rem;">
        No merch products found. Check your Netlify function or Printful cache.
      </p>
    `;
    return;
  }

  // Step 3️⃣: Render each product card
  for (const product of products) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.id = `product-${product.id}`;
    card.innerHTML = `
      <img src="${product.thumbnail_url}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">$${product.default_price || "0.00"}</p>
      <button class="add-to-cart">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  }

  console.log("🎨 Render complete — merch page is live!");
});
