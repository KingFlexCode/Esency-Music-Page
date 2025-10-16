// scripts/printful-api.js

export async function createPrintfulOrder(orderData) {
  const response = await fetch("/.netlify/functions/create-printful-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Printful API error");
  return result;
}
