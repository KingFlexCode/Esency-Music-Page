// netlify/functions/sync-printful-merch.js
import fetch from "node-fetch";
import fs from "fs";

export async function handler() {
  try {
    console.log("🚀 Starting Printful merch sync with full variant fetch...");

    // 1️⃣ Get all products (summary list)
    const res = await fetch("https://api.printful.com/store/products", {
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

    // 2️⃣ Fetch details for each product
    const fullProducts = [];
    for (const item of data.result) {
      try {
        const detailRes = await fetch(
          `https://api.printful.com/store/products/${item.id}`,
          {
            headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
          }
        );
        const detailData = await detailRes.json();

        if (detailRes.ok && detailData.result) {
          fullProducts.push(detailData.result);
          console.log(`✅ Loaded variants for ${item.name}`);
        } else {
          console.warn(`⚠️ Skipping ${item.name} — variant fetch failed`);
        }
      } catch (err) {
        console.warn(`⚠️ Error fetching ${item.name}:`, err.message);
      }
    }

    // 3️⃣ Group by product type
    const grouped = {};
    for (const product of fullProducts) {
      const type = product.product?.type || "Other";
      if (!grouped[type]) grouped[type] = [];

      grouped[type].push({
        id: product.id,
        name: product.product.name,
        image: product.product.thumbnail_url,
        variants: product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          size: v.size,
          color: v.color,
          price: v.retail_price,
          availability: v.availability_status,
        })),
      });
    }

    // 4️⃣ Save to local product map
    const outputPath = "./scripts/product-map.js";
    const output = `/* AUTO-GENERATED PRODUCT MAP */
export const PRODUCT_MAP = ${JSON.stringify(grouped, null, 2)};
`;
    fs.writeFileSync(outputPath, output);
    console.log(`✅ Product map updated (${Object.keys(grouped).length} categories).`);

    // 5️⃣ Return success
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "✅ Synced Printful products with full variant data",
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
}
\