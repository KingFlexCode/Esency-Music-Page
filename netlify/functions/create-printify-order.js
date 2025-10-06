// netlify/functions/create-printify-order.js
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod === 'GET' || event.httpMethod === 'HEAD')
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, info: 'POST items+customer to create an order.' }) };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Parse body safely
    let bodyStr = event.body || '';
    let payloadIn;
    try { payloadIn = JSON.parse(bodyStr); }
    catch (e) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body', bodyPreview: bodyStr.slice(0,200) }) };
    }

    const { items, customer, external_id, send_to_production } = payloadIn;

    // Validate inputs
    if (!Array.isArray(items) || !items.length)
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing items' }) };

    const need = ['first_name','last_name','address1','city','region','zip','country'];
    const missing = need.filter(k => !customer || !customer[k]);
    if (missing.length)
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing customer fields', missing }) };

    const makePayload = {
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
    const auth = { Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`, 'Content-Type': 'application/json' };
    const createUrl = `https://api.printify.com/v1/shops/${shopId}/orders.json`;

    // Create order
    const createRes = await fetch(createUrl, { method: 'POST', headers: auth, body: JSON.stringify(makePayload) });
    const createData = await safeJson(createRes);
    if (!createRes.ok) {
      return { statusCode: createRes.status, headers: CORS, body: JSON.stringify({ step: 'create', createStatus: createRes.status, createData }) };
    }

    let sentData = null;
    if (send_to_production && createData.id) {
      const stpUrl = `https://api.printify.com/v1/shops/${shopId}/orders/${createData.id}/send_to_production.json`;
      const stpRes = await fetch(stpUrl, { method: 'POST', headers: auth });
      sentData = await safeJson(stpRes);
      // Return status even if not ok so client can show the reason
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ created: createData, sent_to_production: sentData, sent_status: stpRes.status }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ created: createData, sent_to_production: null }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message, stack_hint: 'server-catch' }) };
  }
};
