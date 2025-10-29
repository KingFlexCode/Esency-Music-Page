// netlify/functions/fetch-printful-products.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Use node-fetch to call Printful API

export async function handler() {
  const cachePath = path.resolve('data', 'printful-cache.json');
  try {
    // Try to read cached data first
    const file = fs.readFileSync(cachePath, 'utf-8');
    const cached = JSON.parse(file);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ...cached }),
    };
  } catch (err) {
    console.warn('Cache not found, fetching from Printful:', err.message);
    // Fall back to live fetch if cache missing or invalid
    const API_KEY = process.env.PRINTFUL_API_KEY;
    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error:
            'Missing PRINTFUL_API_KEY or cached data. Please set API key or run update function.',
        }),
      };
    }
    try {
      const res = await fetch('https://api.printful.com/store/products', {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const data = await res.json();
      // Optionally write to cache for next time
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, JSON.stringify({ products: data.result }));
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, products: data.result }),
      };
    } catch (apiErr) {
      console.error('Error fetching from Printful:', apiErr);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Printful API request failed.',
        }),
      };
    }
  }
}
