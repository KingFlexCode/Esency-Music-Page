// /netlify/functions/fetch-printful-products.js
import fs from "fs";
import path from "path";

export async function handler() {
  try {
    const filePath = path.resolve("data", "printful-cache.json");
    const file = fs.readFileSync(filePath, "utf-8");
    const cached = JSON.parse(file);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ...cached }),
    };
  } catch (err) {
    console.error("❌ Read cache failed:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Could not read cached data." }),
    };
  }
}
