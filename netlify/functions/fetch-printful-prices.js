import fetch from "node-fetch";

export async function handler() {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // Step 1: Fetch list of products
    const res = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await res.json();
    if (!Array.isArray(data.result)) {
      throw new Error("Unexpected Printful response format (products)");
    }

    const priceMap = {};

    // Step 2: Loop through products and fetch variant prices
    for (const product of data.result) {
      const productId = product.id;

      const detailRes = await fetch(
        `https://api.printful.com/store/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${PRINTFUL_API_KEY}`,
          },
        }
      );

      const detailData = await detailRes.json();

      const variants = detailData.result?.sync_variants;
      if (Array.isArray(variants)) {
        const firstVariant = variants[0];
        if (firstVariant?.retail_price) {
          priceMap[productId] = parseFloat(firstVariant.retail_price);
        }
      }
    }

    console.log("✅ Final Price Map:", priceMap);

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