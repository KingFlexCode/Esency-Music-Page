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
    const products = data.result || [];

    const result = [];

    for (const product of products) {
      const detailRes = await fetch(`https://api.printful.com/sync/products/${product.id}`, {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        },
      });

      const detail = await detailRes.json();
      const variants = detail.result?.sync_variants || [];

      const price = parseFloat(variants[0]?.retail_price || "0");
      const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

      result.push({
        id: product.id,
        name: product.name,
        price,
        sizes,
        thumbnail_url: product.thumbnail_url
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, products: result }),
    };
  } catch (err) {
    console.error("Printful Fetch Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
