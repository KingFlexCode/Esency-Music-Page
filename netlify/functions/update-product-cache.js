import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export async function handler() {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Missing PRINTFUL_API_KEY'
      }),
    };
  }

  const allProducts = [];
  let page = 1;
  const limit = 20;

  try {
    // 1. Fetch all products in pages
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
      // Respect Printful’s rate limit (pause 1s per page)
      await new Promise((r) => setTimeout(r, 1000));
    }

    // 2. For each product, get its variants and prices
    const fullProducts = [];
    for (const baseProd of allProducts) {
      try {
        const detailRes = await fetch(
          `https://api.printful.com/store/products/${baseProd.id}`,
          { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        const detailData = await detailRes.json();
        if (detailRes.ok && detailData.result) {
          const detail = detailData.result;

          // Build variant list with size, colour and price
          const variants = Array.isArray(detail.variants)
            ? detail.variants.map((v) => ({
                id: v.id,
                name: v.name || '',
                size: v.size || '',
                color: v.color || '',
                price: v.retail_price || '',
              }))
            : [];

          const defaultPrice =
            variants.length > 0 ? variants[0].price : '';

          fullProducts.push({
            id: baseProd.id,
            name: detail.product?.name || baseProd.name,
            thumbnail_url:
              detail.product?.thumbnail_url || baseProd.thumbnail_url,
            variants,
            default_price: defaultPrice,
          });
        } else {
          // Fallback if detail call fails: include minimal info
          fullProducts.push({
            id: baseProd.id,
            name: baseProd.name,
            thumbnail_url: baseProd.thumbnail_url,
            variants: [],
            default_price: '',
          });
        }
      } catch (innerErr) {
        fullProducts.push({
          id: baseProd.id,
          name: baseProd.name,
          thumbnail_url: baseProd.thumbnail_url,
          variants: [],
          default_price: '',
        });
      }
    }

    // 3. Save to local JSON cache
    const dataDir = path.resolve('data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(
      path.join(dataDir, 'printful-cache.json'),
      JSON.stringify(
        { updated: Date.now(), products: fullProducts },
        null,
        2
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: fullProducts.length,
        message:
          '✅ Printful cache updated successfully with variants',
      }),
    };
  } catch (err) {
    console.error('❌ Cache update failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
}
