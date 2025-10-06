// netlify/functions/printify-whoami.js
exports.handler = async () => {
  const hasKey = Boolean(process.env.PRINTIFY_API_KEY);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      shopId: process.env.PRINTIFY_SHOP_ID || null,
      hasApiKey: hasKey
    })
  };
};
