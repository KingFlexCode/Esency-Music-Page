// netlify/functions/create-printify-order.js
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod === 'GET' || event.httpMethod === 'HEAD')
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, info: 'POST items+customer to create an order.' }) };
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, customer, external_id, send_to_production } = body; // 🔹

    if (!Array.isArray(items) || !items.length)
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing items' }) };
    if (!customer || !customer.first_name || !customer.last_name || !customer.address1 || !customer.city || !customer.region || !customer.zip || !customer.country)
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing customer address fields' }) };

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

    const shopId = process.env.PRINTIFY_SHOP_ID;
    const createUrl = `https://api.printify.com/v1/shops/${shopId}/orders.json`;
    const auth = { Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`, 'Content-Type': 'application/json' };

    // Create order
    const createRes = await fetch(createUrl, { method: 'POST', headers: auth, body: JSON.stringify(payload) });
    const created = await createRes.json();
    if (!createRes.ok) {
      return { statusCode: createRes.status, headers: CORS, body: JSON.stringify(created) };
    }

    let sent = null;

    // 🔹 Optionally send to production
    if (send_to_production && created.id) {
      const stpUrl = `https://api.printify.com/v1/shops/${shopId}/orders/${created.id}/send_to_production.json`;
      const stpRes = await fetch(stpUrl, { method: 'POST', headers: auth });
      sent = await stpRes.json();
      // even if this fails, we still return what happened
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ created, sent_to_production: sent }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};