// netlify/functions/fetch-printful-products.js
import fetch from "node-fetch";

export async function handler() {
  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Printful API error:", text);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Printful API failed", detail: text }),
      };
    }

    const json = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        updated: new Date().toISOString(),
        count: json?.result?.length || 0,
        products: json?.result || [],
      }),
    };
  } catch (err) {
    console.error("❌ Function failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}