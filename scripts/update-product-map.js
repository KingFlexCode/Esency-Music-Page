/**
 * update-product-map.js
 * 
 * Fetches product + variant data from your live Netlify function,
 * and automatically regenerates /scripts/product-map.js.
 * 
 * Run manually anytime with:  node scripts/update-product-map.js
 */

import fs from "fs";
import fetch from "node-fetch";

// 1️⃣ Replace with your own deployed Netlify URL
const NETLIFY_FUNCTION_URL = "https://esencymusic.netlify.app/functions/fetch-printful-products";

async function main() {
  console.log("🔄 Fetching product data from Printful via Netlify...");

  const response = await fetch(NETLIFY_FUNCTION_URL);
  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Fetch failed:", data);
    process.exit(1);
  }

  const products = data.products || [];
  console.log(`✅ Received ${products.length} products`);

  // 2️⃣ Build mapping object for each product
  const map = {};

  for (const p of products) {
    if (!p || !p.variants) continue;

    const variantMap = {};
    for (const v of p.variants) {
      if (!v.size || !v.id) continue;
      variantMap[v.size.toUpperCase()] = v.id;
    }

    const cleanName = p.name.toLowerCase().replace(/\s+/g, "-");
    map[cleanName] = {
      product_id: p.id,
      variants: variantMap,
    };
  }

  // 3️⃣ Convert to JS export file
  const jsOutput =
    "/* Auto-generated from Printful — Do Not Edit Manually */\n\n" +
    "export const PRODUCT_MAP = " +
    JSON.stringify(map, null, 2) +
    ";\n";

  // 4️⃣ Save file to scripts/product-map.js
  fs.writeFileSync("./scripts/product-map.js", jsOutput, "utf-8");

  console.log("✅ Updated scripts/product-map.js successfully!");
}

main().catch((err) => {
  console.error("🔥 Error updating product map:", err);
  process.exit(1);
});
