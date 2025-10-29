// netlify/functions/fetch-printful-products.js
import { get } from '@netlify/blobs';
import fetch from 'node-fetch';

export async function handler() {
  try {
    const blob = await get('printful-cache');
    if (blob) {
      const cached = JSON.parse(blob);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, ...cached }),
      };
    }

    // Fallback: fetch directly if no cache
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
    console.error('❌ Fetch cache failed:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Could not retrieve cached or live data.',
      }),
    };
  }
}

