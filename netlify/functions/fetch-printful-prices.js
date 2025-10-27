import fetch from "node-fetch";

export async function handler() {
  try {
    const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
    const url = `https://api.printful.com/sync/products`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await res.json();
    const products = data.result;

    const priceMap = {};

    // 🌀 Loop through products and fetch full variant data
    for (const product of products) {
      const productId = product.id;

      // Fetch product details to get variants + prices
      const detailRes = await fetch(`https://api.printful.com/sync/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        },
      });

      const detailData = await detailRes.json();

      const variants = detailData.result?.sync_variants;
      if (variants && variants.length > 0) {
        const retailPrice = parseFloat(variants[0].retail_price);
        if (!isNaN(retailPrice)) {
          priceMap[productId] = retailPrice;
        }
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