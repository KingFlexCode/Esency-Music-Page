import {
  getCart,
  clearCart,
  updateCartCountDisplay,
} from './cart-utils.js';
import { createPrintfulOrder } from './printful-api.js';

const cart = getCart();

if (cart.length && window.paypal) {
  const total = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  paypal
    .Buttons({
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'pill',
        label: 'paypal',
      },

      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: total,
              },
              description: 'Esency Merch Order',
            },
          ],
        });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(async function (details) {
          try {
            // Optionally create the order in Printful
            await createPrintfulOrder(cart);
          } catch (err) {
            console.error('Printful order error', err);
          }
          clearCart();
          updateCartCountDisplay();
          sessionStorage.removeItem('lastOrderId');
          window.location.href = './thankyou.html';
        });
      },

      onError: function (err) {
        console.error('❌ PayPal Checkout Error:', err);
        alert('There was an error with your payment.');
      },
    })
    .render('#paypal-button-container');
}
