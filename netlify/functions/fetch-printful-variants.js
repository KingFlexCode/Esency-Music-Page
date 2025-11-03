import fetch from 'node-fetch';

export async function handler(event) {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing PRINTFUL_API_KEY' }),
    };
  }

  try {
    // Parse variant IDs from the query or body
    const variantIds = event.queryStringParameters.ids
      ? event.queryStringParameters.ids.split(',')
      : [];

    if (!variantIds.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No variant IDs provided' }),
      };
    }

    console.log(`Fetching ${variantIds.length} variant(s)...`);

    const variants = [];

    // Fetch each variant from Printful API
    for (const id of variantIds) {
      const response = await fetch(`https://api.printful.com/store/variants/${id}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });

      const data = await response.json();
      if (response.ok && data.result) {
        const v = data.result;

        variants.push({
          id: v.id,
          name: v.name,
          size: v.size,
          color: v.color,
          price: v.retail_price,
          currency: v.currency,
          image: v.files?.find(f => f.type === 'preview')?.url || '',
        });
      } else {
        console.warn(`Variant ${id} fetch failed: ${data.error?.message || 'unknown'}`);
      }

      // Delay slightly to avoid rate limiting
      await new Promise(res => setTimeout(res, 300));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, variants }),
    };
  } catch (error) {
    console.error('Variant fetch failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
