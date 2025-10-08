// netlify/functions/create-printify-order.js
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const response = await fetch("https://api.printify.com/v1/orders.json", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PRINTIFY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        external_id: data.orderId,
        label: "Esency Merch Order",
        line_items: data.items,
        shipping_method: 1,
        send_shipping_notification: true,
        address_to: data.customer
      })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}






import fetch from "node-fetch";

export async function handler(event) {
  console.log("🚀 create-printify-order called"); // <— added
  try {
    const data = JSON.parse(event.body);
    console.log("🟢 received payload:", data); // <— added

    const response = await fetch("https://api.printify.com/v1/orders.json", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PRINTIFY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        external_id: data.orderId || "test-order",
        label: "Esency Merch Order",
        line_items: data.items,
        shipping_method: 1,
        send_shipping_notification: true,
        address_to: data.customer
      })
    });

    console.log("📦 Printify response status:", response.status); // <— added
    const result = await response.json();
    console.log("📩 Printify response:", result); // <— added

    return {
      statusCode: response.status,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error("❌ server error:", error); // <— added
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
