/* ==========================================================
   PAYPAL CHECKOUT — Integrates PayPal + Printify Order Logic
   ========================================================== */

import { loadCart, clearCart, updateCartCountDisplay } from "./cart-utils.js";
import { PRODUCT_MAP } from "./product-map.js";
import { sendPrintifyOrder } from "./printify-api.js";

// Initialize cart
let cart = loadCart();
updateCartCountDisplay();

/* ----------------------------------------------------------
   MAP CART ITEMS → PRINTIFY ITEMS
   ---------------------------------------------------------- */
function mapCartToPrintifyItems(cartItems) {
  const out = [];
  for (const i of cartItems) {
    const key = (i.productId || "").trim();
    const sizeIn = (i.size || "").toUpperCase();
    const size = sizeIn === "2XL" ? "XXL" : sizeIn;
    const map = PRODUCT_MAP[key];
    if (!map) {
      console.warn("No product map for:", key, i);
      continue;
    }

    const variantId = map.variants?.[size];
    if (!variantId) {
      console.warn("No variant for:", key, "size:", size, i);
      continue;
    }

    out.push({
      product_id: map.product_id || undefined,
      variant_id: Number(variantId),
      quantity: Number(i.quantity || 1),
    });
  }
  return out;
}

/* ----------------------------------------------------------
   PAYPAL BUTTON CONFIGURATION
   ---------------------------------------------------------- */
if (window.paypal) {
  paypal.Buttons({
    /* ---------- 1️⃣ CREATE ORDER ---------- */
    createOrder: (data, actions) => {
      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return actions.order.create({
        application_context: { shipping_preference: "GET_FROM_FILE" },
        purchase_units: [{ amount: { value: total.toFixed(2) } }],
      });
    },

    /* ---------- 2️⃣ APPROVE ORDER ---------- */
    onApprove: async (data, actions) => {
      try {
        // 1. Capture payment from PayPal
        const order = await actions.order.capture();

        // 2. Extract buyer + shipping info
        const pu = (order.purchase_units && order.purchase_units[0]) || {};
        const ship = pu.shipping || {};
        const address = ship.address || {};
        const fullName =
          (ship.name && ship.name.full_name) ||
          (order.payer &&
            (order.payer.name?.given_name + " " + order.payer.name?.surname)) ||
          "Esency Fan";
        const [first_name, ...rest] = fullName.split(" ");
        const last_name = rest.join(" ") || "Customer";

        // 3. Prepare Printify order data
        const items = mapCartToPrintifyItems(cart);
        if (!items.length) {
          alert("Missing variant mapping. Add White/Red tee or update map.");
          return;
        }

        const orderData = {
          orderId: order.id,
          customer: {
            first_name,
            last_name,
            email: order.payer?.email_address || "",
            phone: "",
            address1: address.address_line_1 || "",
            address2: address.address_line_2 || "",
            city: address.admin_area_2 || "",
            region: address.admin_area_1 || "",
            zip: address.postal_code || "",
            country: address.country_code || "US",
          },
          items,
          send_to_production: true,
        };

        // ✅ 4. Save interim order data to sessionStorage
        sessionStorage.setItem("lastOrderId", order.id);
        sessionStorage.removeItem("lastOrderError");

        // ✅ 5. Redirect to loader screen immediately (UX-first)
        window.location.href = "./loading.html?next=thankyou.html&fail=order-failed.html";

        // 6. Continue in background: send order to Printify
        const dataResult = await sendPrintifyOrder(orderData);

        if (dataResult.created?.id) {
          sessionStorage.setItem("lastOrderId", dataResult.created.id);
          clearCart();
        } else {
          console.error("Printify failed:", dataResult);
          sessionStorage.setItem(
            "lastOrderError",
            dataResult.message || JSON.stringify(dataResult)
          );
        }
      } catch (err) {
        console.error("Checkout error:", err);
        sessionStorage.setItem("lastOrderError", err.message || "Unexpected error");
        window.location.href = "./order-failed.html";
      }
    },

    /* ---------- 3️⃣ HANDLE PAYPAL ERRORS ---------- */
    onError: (err) => {
      console.error("PayPal error:", err);
      sessionStorage.setItem(
        "lastOrderError",
        err.message || "PayPal checkout failed"
      );
      window.location.href = "./order-failed.html";
    },
  }).render("#paypal-button-container");
}
