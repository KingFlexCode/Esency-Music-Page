// netlify/functions/create-printful-order.js

export async function handler(event) {
  // ✅ Allow only POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    // ✅ Validate input
    if (!data.items || !data.recipient) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing items or recipient data" }),
      };
    }

    // ✅ Build Printful payload
    const payload = {
      recipient: data.recipient,
      items: data.items.map((i) => ({
        variant_id: i.variant_id,
        quantity: i.quantity || 1,
        retail_price: i.retail_price,
        name: i.name,
      })),
      external_id: data.orderId || `esency-${Date.now()}`,
      shipping: "STANDARD",
    };

    // ✅ Send to Printful API
    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // ✅ Handle Printful response
    if (!response.ok) {
      console.error("❌ Printful API Error:", result);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: result.error?.message || "Printful API request failed.",
          result,
        }),
      };
    }

    // ✅ Success
    console.log("✅ Printful Order Created:", result);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Printful order created successfully.",
        result,
      }),
    };
  } catch (error) {
    console.error("🔥 Printful Order Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Unexpected server error.",
      }),
    };
  }
}