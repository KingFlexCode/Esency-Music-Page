import fetch from "node-fetch";

export async function handler() {
  try {
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
    const url = "https://api.printful.com/store/products";

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log("🧾 Full Printful Response:", JSON.stringify(data, null, 2));
    console.log("🔍 Raw Printful response keys:", Object.keys(data));

    // ✅ Try to handle all possible shapes of Printful response
    let products = [];
    if (Array.isArray(data.result)) {
      products = data.result;
    } else if (Array.isArray(data.result?.products)) {
      products = data.result.products;
    } else if (Array.isArray(data.result?.sync_products)) {
      products = data.result.sync_products;
    } else {
      console.warn("⚠️ Unexpected format:", JSON.stringify(data, null, 2));
      throw new Error("Unexpected Printful response structure");
    }

    // ✅ Build price map using first variant's price
    const priceMap = {};
    for (const p of products) {
      const productId = p.id || p.product?.id;
      const retailPrice = parseFloat(
        p.sync_variants?.[0]?.retail_price ||
        p.variants?.[0]?.price ||
        p.price ||
        "0"
      );
      if (productId && retailPrice > 0) {
        priceMap[productId] = retailPrice;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, priceMap }),
    };
  } catch (error) {
    console.error("Printful Fetch Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
