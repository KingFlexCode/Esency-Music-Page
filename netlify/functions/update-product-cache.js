import fetch from 'node-fetch';
import { getStore } from '@netlify/blobs';

export async function handler() {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Missing PRINTFUL_API_KEY' }),
    };
  }

  // ✅ Create (or open) a store named "printful-cache"
  const store = getStore('printful-cache');

  const allProducts = [];
  let page = 1;
  const limit = 20;

  try {
    while (true) {
      const res = await fetch(
        `https://api.printful.com/store/products?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );

      if (!res.ok) break;
      const data = await res.json();
      if (!data.result?.length) break;

      allProducts.push(...data.result);
      if (data.paging && page >= data.paging.total_pages) break;
      page++;
      await new Promise((r) => setTimeout(r, 1000)); // rate limit delay
    }

    const mapped = allProducts.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price:
        p.sync_variants?.[0]?.retail_price ||
        p.variants?.[0]?.retail_price ||
        'N/A',
    }));

    await store.set('latest', JSON.stringify({ updated: Date.now(), products: mapped }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: mapped.length,
        message: '✅ Printful cache updated successfully',
      }),
    };
  } catch (err) {
    console.error('❌ Cache update failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
