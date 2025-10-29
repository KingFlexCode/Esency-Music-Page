import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export async function handler() {
  try {
    const cachePath = path.resolve('data', 'printful-cache.json');

    // ✅ Read local file cache if it exists
    if (fs.existsSync(cachePath)) {
      const fileData = fs.readFileSync(cachePath, 'utf-8');
      const cached = JSON.parse(fileData);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, ...cached }),
      };
    }

    // fallback to live fetch
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

