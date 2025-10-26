// /netlify/functions/fetch-printful-prices.js

import fetch from "node-fetch";

export async function handler() {
  try {
    // 🔑 Replace with your actual Printful API key
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error("Unexpected Printful response format");
    }

    // 🧾 Build a price map of { product_id: retail_price }
    const priceMap = {};
    data.result.forEach((product) => {
      const productId = product.id;
      const retailPrice = parseFloat(
        product.sync_variants?.[0]?.retail_price || "0"
      );
      if (productId && retailPrice > 0) {
        priceMap[productId] = retailPrice;
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        priceMap,
      }),
    };
  } catch (error) {
    console.error("Printful Fetch Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
}
