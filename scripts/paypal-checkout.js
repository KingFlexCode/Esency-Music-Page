// scripts/paypal-checkout.js

import { getCart, clearCart, updateCartCount } from "./cart-utils.js";
import { saveCart } from "./cart-utils.js";

const cart = getCart();

if (cart.length && window.paypal) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  paypal.Buttons({
    style: {
      layout: 'horizontal',
      color: 'gold',
      shape: 'pill',
      label: 'paypal'
    },

    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total
          },
          description: "Esency Merch Order"
        }]
      });
    },

    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert(`✅ Payment complete! Thank you, ${details.payer.name.given_name}.`);
        clearCart();
        saveCart([]);
        window.location.href = "./thank-you.html";
      });
    },

    onError: function(err) {
      console.error("❌ PayPal Checkout Error:", err);
      alert("Something went wrong with your payment.");
    }

  }).render('#paypal-button-container');
}
