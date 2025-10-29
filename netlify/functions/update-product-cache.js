import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export async function handler() {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Missing PRINTFUL_API_KEY' }),
    };
  }

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
      await new Promise((r) => setTimeout(r, 1000)); // rate limit pause
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

    // ✅ Save locally as a file
    const dataDir = path.resolve('data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(
      path.join(dataDir, 'printful-cache.json'),
      JSON.stringify({ updated: Date.now(), products: mapped }, null, 2)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: mapped.length,
        message: '✅ Printful cache updated successfully (file version)',
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

