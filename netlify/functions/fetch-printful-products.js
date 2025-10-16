// netlify/functions/fetch-printful-products.js
export async function handler() {
  try {
    // ✅ Fetch all products from Printful (works for all store types)
    const resp = await fetch("https://api.printful.com/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: "Failed to fetch Printful products", details: errorText }),
      };
    }

    const data = await resp.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        updated: new Date().toISOString(),
        count: data.result?.length || 0,
        products: data.result || [],
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}