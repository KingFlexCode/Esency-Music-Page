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

    // ✅ Handle the expected Printful structure
    if (!Array.isArray(data.result)) {
      console.warn("⚠️ Unexpected format:", JSON.stringify(data, null, 2));
      throw new Error("Unexpected Printful response format (products)");
    }

    // ✅ Simplify and extract only what your merch page needs
    const products = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price: 35.0, // placeholder — Printful’s store endpoint doesn’t return retail prices directly
      sizes: ["S", "M", "L", "XL", "XXL"], // default size list
    }));

    console.log(`✅ Extracted ${products.length} products from Printful.`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, products }),
    };
  } catch (error) {
    console.error("Printful Fetch Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
