// netlify/functions/fetch-printful-products.js
import fetch from "node-fetch";

export async function handler() {
  try {
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
    const STORE_ID = "17034634"; // your store ID

    // ✅ Correct URL format (store ID in path, not query)
    const url = `https://api.printful.com/stores/${STORE_ID}/products`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("🧾 Full Printful Response:", JSON.stringify(data, null, 2));

    // ✅ Ensure products exist
    if (!data || !Array.isArray(data.result)) {
      console.warn("⚠️ Unexpected format or no products found");
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, products: [] }),
      };
    }

    // ✅ Map only necessary fields
    const products = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price: 35.0, // fallback placeholder
      sizes: ["S", "M", "L", "XL", "XXL"],
    }));

    console.log(`✅ Returned ${products.length} product(s)`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, products }),
    };
  } catch (error) {
    console.error("❌ Printful Fetch Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}