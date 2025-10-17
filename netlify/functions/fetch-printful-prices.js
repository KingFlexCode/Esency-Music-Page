// netlify/functions/fetch-printful-prices.js
import fetch from "node-fetch";

export async function handler() {
  try {
    const res = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Printful API error");

    // Build a simple {product_id: price} map
    const priceMap = {};
    for (const p of data.result || []) {
      const firstVariant = p.variants && p.variants[0];
      if (firstVariant && firstVariant.retail_price) {
        priceMap[p.id] = parseFloat(firstVariant.retail_price);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, priceMap }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
