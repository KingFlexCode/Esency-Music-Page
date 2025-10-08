/* ==========================================================
   ESENCY MERCH PAGE — CART HANDLER (Fixed Version)
   ========================================================== */

// --- Load and initialize cart ---
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- Update cart count on load ---
updateCartCount();

// --- Event delegation for Add to Cart buttons ---
document.body.addEventListener("click", (e) => {
  // only respond to buttons inside merch items
  if (e.target.tagName.toLowerCase() !== "button") return;

  const item = e.target.closest(".merch-item");
  if (!item) return;

  const productId = item.dataset.id;
  const name = item.querySelector(".product-name").textContent.trim();
  const price = parseFloat(item.dataset.price);
  const sizeSelect = item.querySelector("select[name='size']");
  const size = sizeSelect ? sizeSelect.value : "";

  if (!size) {
    alert("Please select a size first.");
    return;
  }

  addToCart(productId, name, price, size);
  showToast(`${name} (${size}) added to cart.`);
});

// --- Functions ---
function addToCart(productId, name, price, size) {
  // Load current cart from localStorage again in case it changed in another tab
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if same item + size exists
  const existing = cart.find(item => item.productId === productId && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, name, price, size, quantity: 1 });
  }

  // Save back to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update the count in header
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

function showToast(message = "Added to cart.") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// --- Handle cross-page sync (optional but smart) ---
window.addEventListener("storage", (e) => {
  if (e.key === "cart") updateCartCount();
});