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
        error: 'Missing PRINTFUL_API_KEY in environment variables.'
      }),
    };
  }

  const allProducts = [];
  let page = 1;
  const limit = 20;

  try {
    console.log('🔄 Fetching all Printful products...');

    // 1️⃣ Fetch all base products (paged)
    while (true) {
      const response = await fetch(
        `https://api.printful.com/store/products?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );

      if (!response.ok) {
        console.error(`❌ Failed to fetch products on page ${page}`);
        break;
      }

      const data = await response.json();
      if (!data.result?.length) break;

      allProducts.push(...data.result);
      console.log(`✅ Fetched page ${page}, total so far: ${allProducts.length}`);

      // Stop if no more pages
      if (data.paging && page >= data.paging.total_pages) break;
      page++;

      // Respect API rate limits (avoid 429)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`📦 Total products fetched: ${allProducts.length}`);

    // 2️⃣ For each product, fetch full details with variants
    const fullProducts = [];

    for (const baseProduct of allProducts) {
      try {
        const detailRes = await fetch(
          `https://api.printful.com/store/products/${baseProduct.id}`,
          { headers: { Authorization: `Bearer ${API_KEY}` } }
        );

        const detailData = await detailRes.json();

        if (detailRes.ok && detailData.result) {
          const detail = detailData.result;

          // Extract all variant info
          const variants = Array.isArray(detail.variants)
            ? detail.variants.map((v) => ({
                id: v.id,
                name: v.name || '',
                size: v.size || '',
                color: v.color || '',
                price: v.retail_price || '',
                currency: v.currency || 'USD',
              }))
            : [];

          // Use first variant price as default
          const defaultPrice = variants.length > 0 ? variants[0].price : '';

          fullProducts.push({
            id: baseProduct.id,
            name: detail.product?.name || baseProduct.name,
            thumbnail_url:
              detail.product?.thumbnail_url || baseProduct.thumbnail_url,
            variants,
            default_price: defaultPrice,
          });

          console.log(`✅ Cached ${baseProduct.name} (${variants.length} variants)`);
        } else {
          // Fallback minimal info if variant fetch fails
          fullProducts.push({
            id: baseProduct.id,
            name: baseProduct.name,
            thumbnail_url: baseProduct.thumbnail_url,
            variants: [],
            default_price: '',
          });
          console.warn(`⚠️ Could not fetch details for ${baseProduct.name}`);
        }
      } catch (err) {
        console.error(`❌ Error fetching product ${baseProduct.id}:`, err);
        fullProducts.push({
          id: baseProduct.id,
          name: baseProduct.name,
          thumbnail_url: baseProduct.thumbnail_url,
          variants: [],
          default_price: '',
        });
      }
    }

    // 3️⃣ Write results to cache file
    const dataDir = path.resolve('data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const cacheFile = path.join(dataDir, 'printful-cache.json');
    fs.writeFileSync(
      cacheFile,
      JSON.stringify(
        {
          updated: new Date().toISOString(),
          products: fullProducts,
        },
        null,
        2
      )
    );

    console.log(`✅ Cache file written to ${cacheFile}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: fullProducts.length,
        message:
          '✅ Printful cache updated successfully with variant details and prices.',
      }),
    };
  } catch (error) {
    console.error('❌ Cache update failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
}
