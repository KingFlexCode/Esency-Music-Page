import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const API_URL = `${process.env.URL}/.netlify/functions/fetch-printful-products`;

export const handler = async () => {
  try {
    console.log("🔄 Fetching latest Printful products...");
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error("Invalid response from Printful API");
    }

    // --- Step 1: Build product map ---
    const productMap = {};
    for (const product of data.result) {
      const variants = {};
      for (const v of product.variants || []) {
        const size = v.size?.toUpperCase?.();
        if (size) variants[size] = v.id;
      }
      productMap[product.id] = {
        product_id: product.id,
        name: product.name,
        type: product.product_type || "Other",
        price: product.retail_price || 0,
        variants,
        image: product.thumbnail_url || "",
      };
    }

    // --- Step 2: Save product-map.js ---
    const mapPath = path.join("scripts", "product-map.js");
    const mapJS = `// AUTO-GENERATED FROM PRINTFUL\nexport const PRODUCT_MAP = ${JSON.stringify(productMap, null, 2)};`;
    fs.writeFileSync(mapPath, mapJS);

    // --- Step 3: Generate merch.html grouped by product type ---
    const grouped = {};
    for (const key in productMap) {
      const p = productMap[key];
      const type = p.type || "Other";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(p);
    }

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Esency Merch</title>
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../styles/styles-merch.css">
</head>
<body>
  <header class="nav-header">
    <h1 class="esency-logo"><a href="./home.html">ESENCY</a></h1>
    <nav class="nav-bar">
      <a href="./home.html">Home</a>
      <a href="./blog.html">Blog</a>
      <a href="./merch.html" class="active">Merch</a>
      <a href="./music.html">Music</a>
      <a href="./videos.html">Videos</a>
      <a href="./links.html">Links</a>
      <a href="./bio.html">Bio</a>
      <a href="./contact.html">Contact</a>
      <a href="./cart.html" id="cart-button" class="cart-link">🛒 Cart (<span id="cart-count">0</span>)</a>
    </nav>
  </header>

  <main>
`;

    for (const type in grouped) {
      html += `<div class="merch-section-header"><h1>${type}</h1></div>\n<section class="merch-gallery">`;
      for (const product of grouped[type]) {
        html += `
      <div class="merch-item" data-id="${product.product_id}" data-price="${product.price}">
        <img src="${product.image}" alt="${product.name}">
        <p class="product-name">${product.name}</p>
        <p class="product-price">$${product.price}</p>
        <div class="size-row">
          <label>Size:</label>
          <select name="size">
            <option value="">Select size</option>
            ${Object.keys(product.variants)
              .map((s) => `<option>${s}</option>`)
              .join("")}
          </select>
        </div>
        <button>Add to Cart</button>
      </div>`;
      }
      html += `</section>\n`;
    }

    html += `
  </main>
  <footer><p>&copy; 2025 Esency. All rights reserved.</p></footer>
  <div id="toast" class="toast">Added to cart.</div>
  <script src="../scripts/merch.js"></script>
</body>
</html>
`;

    const merchPath = path.join("pages", "merch.html");
    fs.writeFileSync(merchPath, html);

    console.log("✅ Merch page and product map updated successfully!");
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Merch sync complete!" }),
    };
  } catch (err) {
    console.error("🔥 Sync failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
