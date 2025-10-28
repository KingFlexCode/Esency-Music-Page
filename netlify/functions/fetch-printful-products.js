import fetch from "node-fetch";

export async function handler() {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = "17034634"; // your store ID

  const baseUrl = `https://api.printful.com/stores/${STORE_ID}/products`;

  try {
    // Step 1: Fetch all products
    const response = await fetch(baseUrl, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!data || !Array.isArray(data.result)) {
      console.warn("⚠️ Unexpected format or no products found");
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, products: [] }),
      };
    }

    // Step 2: Fetch price for each product by ID
    const detailedProducts = await Promise.all(
      data.result.map(async (p) => {
        const detailUrl = `https://api.printful.com/store/products/${p.id}`;
        try {
          const detailRes = await fetch(detailUrl, {
            headers: {
              Authorization: `Bearer ${PRINTFUL_API_KEY}`,
              "Content-Type": "application/json",
            },
          });
          const detailData = await detailRes.json();

          const variant = detailData?.result?.sync_variants?.[0];
          const price = variant?.retail_price || "0.00";

          return {
            id: p.id,
            name: p.name,
            thumbnail_url: p.thumbnail_url,
            price: parseFloat(price),
            sizes: ["S", "M", "L", "XL", "XXL"],
          };
        } catch (error) {
          console.error(`❌ Error fetching details for product ${p.id}:`, error);
          return null;
        }
      })
    );

    const products = detailedProducts.filter((p) => p !== null);

    console.log(`✅ Final product count: ${products.length}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, products }),
    };
  } catch (error) {
    console.error("❌ Printful Fetch Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
