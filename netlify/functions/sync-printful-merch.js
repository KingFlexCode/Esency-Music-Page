// netlify/functions/sync-printful-merch.js
// ========================================================
// SYNC PRINTFUL MERCH — Robust & Safe Version
// ========================================================

let fetchFn;
try {
  fetchFn = fetch; // Use global if available
} catch {
  fetchFn = require("node-fetch"); // Fallback for local Node
}
const fs = require("fs");

exports.handler = async () => {
  try {
    console.log("🚀 Starting Printful merch sync with full variant fetch...");

    // 1️⃣ Fetch product list
    const res = await fetchFn("https://api.printful.com/store/products", {
      headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
    });
    const data = await res.json();

    if (!res.ok || !data.result) {
      console.error("❌ Printful API error:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "Invalid response from Printful API",
          details: data,
        }),
      };
    }

    console.log(`📦 Found ${data.result.length} products — fetching variants...`);

    // 2️⃣ Fetch detailed data for each product
    const fullProducts = [];
    for (const item of data.result) {
      try {
        console.log(`🔍 Fetching details for product ID: ${item.id} (${item.name})`);
        const detailRes = await fetchFn(
          `https://api.printful.com/store/products/${item.id}`,
          {
            headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
          }
        );
        const detailData = await detailRes.json();

        if (detailRes.ok && detailData.result) {
          fullProducts.push(detailData.result);
          console.log(`✅ Loaded: ${detailData.result.product?.name || "Unnamed product"}`);
        } else {
          console.warn(`⚠️ Skipping ${item.name || "Unnamed"} — bad detail response.`);
        }
      } catch (err) {
        console.warn(`⚠️ Error fetching product ${item.id}:`, err.message);
      }
    }

    // 3️⃣ Group by product type safely
    const grouped = {};
    for (const product of fullProducts) {
      if (!product || !product.product) {
        console.warn("⚠️ Skipping invalid product entry:", product?.id);
        continue;
      }

      const type = product.product.type || "Other";
      if (!grouped[type]) grouped[type] = [];

      const productName = product.product.name || "Unnamed Product";
      const variants = Array.isArray(product.variants)
        ? product.variants.map((v) => ({
            id: v.id,
            name: v.name || "Variant",
            size: v.size || "",
            color: v.color || "",
            price: v.retail_price || "",
            availability: v.availability_status || "unknown",
          }))
        : [];

      grouped[type].push({
        id: product.id,
        name: productName,
        image: product.product.thumbnail_url || "",
        variants,
      });
    }

    // 4️⃣ Write to product-map.js
    const outputPath = "./scripts/product-map.js";
    const output = `/* AUTO-GENERATED PRODUCT MAP */
export const PRODUCT_MAP = ${JSON.stringify(grouped, null, 2)};
`;
    fs.writeFileSync(outputPath, output);
    console.log(`✅ Product map updated (${Object.keys(grouped).length} categories).`);

    // 5️⃣ Done!
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "✅ Synced Printful products safely with full variant data",
        categories: Object.keys(grouped).length,
        products: fullProducts.length,
      }),
    };
  } catch (err) {
    console.error("🔥 Sync error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};