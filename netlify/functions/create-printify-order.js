// netlify/functions/create-printify-order.js
// Creates a DRAFT order in your Printify shop.
// Env vars: PRINTIFY_API_KEY, PRINTIFY_SHOP_ID

exports.handler = async (event) => {
  // 👇 Handle accidental GET/HEAD nicely (no 405 spam in the console)
  if (event.httpMethod === 'GET' || event.httpMethod === 'HEAD') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, info: 'POST items+customer to create an order.' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, customer, external_id } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'Missing items' };
    }
    if (!customer || !customer.first_name || !customer.last_name || !customer.address1 ||
        !customer.city || !customer.region || !customer.zip || !customer.country) {
      return { statusCode: 400, body: 'Missing customer address fields' };
    }

    const payload = {
      external_id: external_id || `ESENCY-TEST-${Date.now()}`,
      label: 'Esency Merch Order',
      line_items: items.map(i => ({
        product_id: i.product_id ? String(i.product_id) : undefined,
        variant_id: Number(i.variant_id),
        quantity: Number(i.quantity || 1)
      })),
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: customer
    };

    const url = `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
