import fetch from "node-fetch";

export async function handler() {
  try {
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
    const storeId = "17034634";
    const url = `https://api.printful.com/sync/products?limit=100&offset=0&store_id=${storeId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log("🧾 Full Printful Response:", JSON.stringify(data, null, 2));

    const products = data.result;

    const priceMap = {};
    for (const product of products) {
      const syncProductId = product.id;
      const productId = product.sync_product.id;
      const variants = product.variants || [];

      // Grab the price from the first variant
      const retailPrice = parseFloat(variants[0]?.retail_price || "0");
      if (productId && retailPrice) {
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
