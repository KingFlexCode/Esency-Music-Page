/* ==========================================================
   PRINTIFY ORDER API HANDLER
   Handles communication between Esency frontend and Netlify
   serverless function that creates Printify orders.
   ========================================================== */

import { PRODUCT_MAP } from "./product-map.js";

/* ----------------------------------------------------------
   Map Cart → Printify Items
   ---------------------------------------------------------- */
export function mapCartToPrintifyItems(cart) {
  if (!Array.isArray(cart) || !cart.length) return [];

  const out = [];

  for (const item of cart) {
    const key = item.productId?.trim();
    const sizeIn = (item.size || "").toUpperCase();
    const size = sizeIn === "2XL" ? "XXL" : sizeIn;
    const map = PRODUCT_MAP[key];

    if (!map) {
      console.warn("⚠️ No product map found for:", key, item);
      continue;
    }

    const variantId = map.variants?.[size];
    if (!variantId) {
      console.warn(`⚠️ No variant found for ${key} size ${size}`, item);
      continue;
    }

    out.push({
      product_id: map.product_id,
      variant_id: Number(variantId),
      quantity: Number(item.quantity || 1),
    });
  }

  return out;
}

/* ----------------------------------------------------------
   Send Order to Printify via Netlify Function
   ---------------------------------------------------------- */
export async function sendPrintifyOrder({
  items,
  customer,
  send_to_production = true,
}) {
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Cart is empty or items invalid.");

  if (!customer || !customer.first_name || !customer.last_name)
    throw new Error("Customer information is incomplete.");

  try {
    const resp = await fetch("/.netlify/functions/create-printify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, customer, send_to_production }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errMsg = data.message || JSON.stringify(data);
      console.error("❌ Printify API error:", errMsg);
      throw new Error(errMsg);
    }

    console.log("✅ Printify API success:", data);
    return data;
  } catch (err) {
    console.error("🔥 Printify API failure:", err);
    throw err;
  }
}