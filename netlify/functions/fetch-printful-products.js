import fetch from "node-fetch";

export async function handler() {
  try {
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

    const res = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await res.json();

    // ✅ Validate and map product data
    if (!Array.isArray(data.result)) {
      throw new Error("Unexpected Printful response format (products)");
    }

    const products = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail_url,
      price: 30.0, // 💡 Default/fallback price — you can override this per product later
    }));

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
