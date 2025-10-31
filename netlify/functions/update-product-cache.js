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
    // Pull all products in pages
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
      // Respect the Printful API’s rate limits
      await new Promise((r) => setTimeout(r, 1000));
    }

    // For each product, fetch full variant data (size, color, price, etc.)
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
          // Extract variants: id, size, color, price
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
          // Fallback if detail call fails
          fullProducts.push({
            id: baseProd.id,
            name: baseProd.name,
            thumbnail_url: baseProd.thumbnail_url,
            variants: [],
            default_price: '',
          });
        }
      } catch (err) {
        fullProducts.push({
          id: baseProd.id,
          name: baseProd.name,
          thumbnail_url: baseProd.thumbnail_url,
          variants: [],
          default_price: '',
        });
      }
    }

    // Save the enriched product list to your cache file
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
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}