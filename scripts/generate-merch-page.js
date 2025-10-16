import fs from "fs";
import { PRODUCT_MAP } from "./product-map.js";

const grouped = {};
for (const key in PRODUCT_MAP) {
  const p = PRODUCT_MAP[key];
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
      </div>
    `;
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

fs.writeFileSync("pages/merch.html", html);
console.log("✅ merch.html generated successfully!");