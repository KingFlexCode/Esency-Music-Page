import fetch from "node-fetch";

export async function handler() {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  const url = "https://api.printful.com/store/products";

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        "Content-Type": "application/json"
      },
    });

    const data = await response.json();

    console.log("🧾 Full Printful Response:", JSON.stringify(data, null, 2));

    // ✅ Check for proper format
    if (!data || !Array.isArray(data.result)) {
      console.warn("⚠️ Unexpected format or no products found");
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, products: [] }),
      };
    }

    // ✅ Map simplified product data
    const products = data.result.map(p => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price: 35.00, // static fallback price
      sizes: ["S", "M", "L", "XL", "XXL"], // default sizes for UI
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
      body: JSON.stringify({ success: false, error: "Server Error: " + error.message }),
    };
  }
}
