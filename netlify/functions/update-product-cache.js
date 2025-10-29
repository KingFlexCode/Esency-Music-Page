// netlify/functions/update-product-cache.js
import fetch from 'node-fetch';
import { set } from '@netlify/blobs';

export async function handler() {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  if (!PRINTFUL_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Missing PRINTFUL_API_KEY environment variable.',
      }),
    };
  }

  const allProducts = [];
  let page = 1;
  const limit = 20;

  try {
    // Paginate through Printful API
    while (true) {
      const res = await fetch(
        `https://api.printful.com/store/products?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Printful API failed (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      if (!Array.isArray(data.result) || data.result.length === 0) break;

      allProducts.push(...data.result);
      console.log(`✅ Page ${page} loaded (${data.result.length} products)`);

      // Stop if no more pages
      if (data.paging && data.paging.total_pages <= page) break;
      page++;

      // Respect Printful rate limits (pause 1s per page)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const mapped = allProducts.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price:
        p.sync_variants?.[0]?.retail_price ||
        p.variants?.[0]?.retail_price ||
        'N/A',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    }));

    // Save to Netlify Blob
    await set('printful-cache', JSON.stringify({ updated: Date.now(), products: mapped }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: mapped.length,
        message: 'Printful cache updated successfully.',
      }),
    };
  } catch (err) {
    console.error('❌ Cache update failed:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
