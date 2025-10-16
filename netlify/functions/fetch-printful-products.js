// netlify/functions/fetch-printful-products.js
// Fetches live product + variant data from Printful Store

export async function handler() {
  try {
    // 1️⃣ Fetch all products in your Printful store
    const resp = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("❌ Printful API Error:", data);
      return {
        statusCode: resp.status,
        body: JSON.stringify({
          error: data.error || "Failed to fetch products list",
        }),
      };
    }

    // 2️⃣ For each product, fetch detailed variant info
    const detailedProducts = await Promise.all(
      data.result.map(async (p) => {
        try {
          const detailRes = await fetch(
            `https://api.printful.com/store/products/${p.id}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          const detail = await detailRes.json();
          if (!detailRes.ok) throw new Error(detail.error || "Variant fetch failed");

          return {
            id: p.id,
            name: p.name,
            thumbnail: p.thumbnail_url,
            variants: detail.result.variants.map((v) => ({
              id: v.id,
              name: v.name,
              size: v.size,
              color: v.color,
              price: v.retail_price,
              available: v.availability_status === "in_stock",
              preview: v.files?.[0]?.preview_url || null,
            })),
          };
        } catch (err) {
          console.error(`⚠️ Failed variant fetch for product ${p.id}:`, err);
          return { id: p.id, name: p.name, error: err.message };
        }
      })
    );

    // 3️⃣ Return a clean response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // so frontend can access safely
      },
      body: JSON.stringify({
        updated: new Date().toISOString(),
        count: detailedProducts.length,
        products: detailedProducts,
      }),
    };
  } catch (err) {
    console.error("🔥 Server error in fetch-printful-products:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}