/* =========================================================================
   Printful API proxy
   Calls Netlify serverless function to create an order.
   ========================================================================= */

export async function createPrintfulOrder(cartItems) {
  const response = await fetch('/.netlify/functions/create-printful-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cartItems }),
  });
  if (!response.ok) {
    throw new Error(`Printful order failed: ${response.status}`);
  }
  const data = await response.json();
  return data; // { id: 'orderId', ... }
}
