import fs from "fs";
import fetch from "node-fetch";

const API_URL = "https://esencymusic.netlify.app/.netlify/functions/fetch-printful-products";

async function main() {
  console.log("🔄 Fetching product data from Printful via Netlify...");
  const res = await fetch(API_URL);
  const data = await res.json();

  if (!data.result || !Array.isArray(data.result)) {
    console.error("❌ Invalid data from Printful:", data);
    return;
  }

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

  const output = `// AUTO-GENERATED: Printful product map\nexport const PRODUCT_MAP = ${JSON.stringify(productMap, null, 2)};\n`;
  fs.writeFileSync("scripts/product-map.js", output);
  console.log("✅ product-map.js updated successfully!");
}

main().catch(err => {
  console.error("🔥 Error updating product map:", err);
});