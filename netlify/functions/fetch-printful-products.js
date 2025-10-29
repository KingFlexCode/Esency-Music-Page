import fetch from 'node-fetch';
import { getStore } from '@netlify/blobs';

export async function handler() {
  try {
    // ✅ Connect to the same store
    const store = getStore('printful-cache');
    const blob = await store.get('latest');

    if (blob) {
      const cached = JSON.parse(await blob.text());
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, ...cached }),
      };
    }

    // fallback: fetch directly from Printful
    const API_KEY = process.env.PRINTFUL_API_KEY;
    const res = await fetch('https://api.printful.com/store/products', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, products: data.result }),
    };
  } catch (err) {
    console.error('❌ Fetch cache failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
