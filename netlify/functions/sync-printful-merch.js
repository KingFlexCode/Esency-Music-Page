// netlify/functions/sync-printful-merch.js
import fetch from "node-fetch";
import fs from "fs";

export async function handler() {
  try {
    console.log("🚀 Starting Printful merch sync (debug mode)...");

    // 1️⃣ Fetch directly from Printful Manual API
    const res = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    const rawText = await res.text(); // get raw response
    console.log("📜 RAW RESPONSE:", rawText.slice(0, 500)); // preview first 500 chars

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "Printful did not return valid JSON",
          raw: rawText,
        }),
      };
    }

    if (!res.ok) {
      console.error("❌ Printful API error:", data);
      return {
        statusCode: res.status,
        body: JSON.stringify({
          success: false,
          error: "Invalid response from Printful API",
          details: data,
        }),
      };
    }

    if (!data.result) {
      console.error("⚠️ No 'result' field in response:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "No products found or wrong endpoint",
          data,
        }),
      };
    }

    console.log(`📦 Retrieved ${data.result.length} products from Printful.`);

    // 3️⃣ Group by type
    const grouped = {};
    for (const product of data.result) {
      const type = product.type || "Other";
      if (!grouped[type]) grouped[type] = [];

      grouped[type].push({
        id: product.id,
        name: product.name,
        image: product.thumbnail_url,
        variants: product.variants?.map((v) => ({
          id: v.id,
          name: v.name,
          size: v.size,
          color: v.color,
          price: v.retail_price,
        })),
      });
    }

    // 4️⃣ Save local map
    const output = `/* AUTO-GENERATED PRODUCT MAP */
export const PRODUCT_MAP = ${JSON.stringify(grouped, null, 2)};
`;
    fs.writeFileSync("./scripts/product-map.js", output);
    console.log("✅ Product map updated successfully.");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "✅ Printful merch synced successfully!",
        categories: Object.keys(grouped).length,
        products: data.result.length,
      }),
    };
  } catch (err) {
    console.error("🔥 Sync error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
}