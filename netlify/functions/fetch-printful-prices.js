import fetch from "node-fetch";

export async function handler() {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log("🧾 Full Printful Response:", JSON.stringify(data, null, 2));

    if (!Array.isArray(data.result)) {
      throw new Error("Unexpected Printful response format (products)");
    }

    const priceMap = {};

    // Fetch product details for each item
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

      if (Array.isArray(variants) && variants.length > 0) {
        const firstVariant = variants[0];
        if (firstVariant?.retail_price) {
          priceMap[productId] = parseFloat(firstVariant.retail_price);
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
