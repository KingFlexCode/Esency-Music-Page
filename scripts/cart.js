const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartList = document.getElementById("cart-items");
const totalSpan = document.getElementById("total-price");

let total = 0;
cart.forEach(item => {
  const li = document.createElement("li");
  li.textContent = `${item.name} (${item.size}) - $${item.price.toFixed(2)}`;
  cartList.appendChild(li);
  total += item.price;
});

totalSpan.textContent = total.toFixed(2);

// PayPal button
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: total.toFixed(2) // Total from cart
        },
        description: 'Esency Merch Cart Purchase'
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      alert('Thanks ' + details.payer.name.given_name + '! Your payment was successful.');
      localStorage.removeItem("cart");
      location.href = "thankyou.html"; // Create this page optionally
    });
  }
}).render('#paypal-button-container');