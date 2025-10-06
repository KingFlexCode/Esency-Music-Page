// netlify/functions/create-printify-order.js
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function getOrder(shopId, orderId, authHeaders) {
  const url = `https://api.printify.com/v1/shops/${shopId}/orders/${orderId}.json`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders });
  const data = await safeJson(res);
  return { ok: res.ok, code: res.status, data };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod === 'GET' || event.httpMethod === 'HEAD') {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, info: 'POST items+customer to create an order.' }) };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Parse + validate
    let payloadIn;
    try { payloadIn = JSON.parse(event.body || '{}'); }
    catch {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { items, customer, external_id, send_to_production } = payloadIn;

    if (!Array.isArray(items) || !items.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing items' }) };
    }
    const need = ['first_name','last_name','address1','city','region','zip','country'];
    const missing = need.filter(k => !customer || !customer[k]);
    if (missing.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing customer fields', missing }) };
    }

    const shopId = process.env.PRINTIFY_SHOP_ID;
    const auth = { Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`, 'Content-Type': 'application/json' };

    // Build create payload
    const makePayload = {
      external_id: external_id || `ESENCY-TEST-${Date.now()}`,
      label: 'Esency Merch Order',
      line_items: items.map(i => ({
        product_id: i.product_id ? String(i.product_id) : undefined,
        variant_id: Number(i.variant_id),
        quantity: Number(i.quantity || 1)
      })),
      shipping_method: 1,
      send_shipping_notification: true,
      address_to: customer
    };

    // 1) Create order (draft/on-hold or pending)
    const createUrl = `https://api.printify.com/v1/shops/${shopId}/orders.json`;
    const createRes = await fetch(createUrl, { method: 'POST', headers: auth, body: JSON.stringify(makePayload) });
    const created = await safeJson(createRes);
    if (!createRes.ok) {
      return { statusCode: createRes.status, headers: CORS, body: JSON.stringify({ step: 'create', created }) };
    }

    // If we’re not auto-sending, return now.
    if (!send_to_production) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ created, sent_to_production: null }) };
    }

    // 2) Wait until order is ready (Printify can return status "pending" briefly)
    // We’ll poll up to ~10 seconds (8 tries x 1250ms)
    const orderId = created.id;
    let lastStatus = 'pending';
    const triesMax = 8;
    let tries = 0;

    while (tries < triesMax) {
      const ord = await getOrder(shopId, orderId, auth);
      if (!ord.ok) {
        // If we can’t read it, break and report what we have.
        return { statusCode: 200, headers: CORS, body: JSON.stringify({
          created, sent_to_production: null, order_check: ord
        }) };
      }
      lastStatus = ord.data.status;

      // Usually becomes "on-hold" when it’s ready to send
      if (lastStatus && lastStatus.toLowerCase() !== 'pending') break;

      await sleep(1250);
      tries++;
    }

    // If still pending, don’t force it—report back so UI can show friendly message
    if (lastStatus && lastStatus.toLowerCase() === 'pending') {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({
        created,
        sent_to_production: { status: 'skipped', reason: 'still_pending' },
        waited_ms: tries * 1250,
        order_status_before_send: lastStatus
      }) };
    }

    // 3) Try sending to production now that it’s not pending
    const stpUrl = `https://api.printify.com/v1/shops/${shopId}/orders/${orderId}/send_to_production.json`;
    const stpRes = await fetch(stpUrl, { method: 'POST', headers: auth });
    const sent = await safeJson(stpRes);

    return { statusCode: 200, headers: CORS, body: JSON.stringify({
      created,
      sent_to_production: sent,
      waited_ms: tries * 1250,
      order_status_before_send: lastStatus,
      send_status_code: stpRes.status
    }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
