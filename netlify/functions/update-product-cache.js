// /netlify/functions/update-printful-cache.js
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

export async function handler() {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  const url = `https://api.printful.com/store/products`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data || !Array.isArray(data.result)) {
      throw new Error("No products found or unexpected format.");
    }

    const mapped = data.result.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price: 35.0, // Or pull from variant
      sizes: ["S", "M", "L", "XL", "XXL"],
    }));

    const filePath = path.resolve("data", "printful-cache.json");
    fs.writeFileSync(filePath, JSON.stringify({ updated: Date.now(), products: mapped }, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, count: mapped.length }),
    };
  } catch (err) {
    console.error("❌ Update failed:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
