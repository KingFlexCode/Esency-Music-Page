// netlify/functions/printify-whoami.js
export async function handler() {
  const hasKey = !!process.env.PRINTIFY_API_KEY;
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      shopId: process.env.PRINTIFY_SHOP_ID || null,
      hasApiKey: hasKey
    })
  };
}