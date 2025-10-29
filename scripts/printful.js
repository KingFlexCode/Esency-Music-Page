// scripts/printful.js

const storeContainer = document.getElementById("product-list");

// Replace with your real Printful API key
const PRINTFUL_API_KEY = "YOUR_PRINTFUL_API_KEY"; 
const STORE_URL = "https://api.printful.com/store/products";

async function fetchProducts() {
  try {
    const response = await fetch(STORE_URL, {
      headers: {
        Authorization: "Basic " + btoa(PRINTFUL_API_KEY + ":")
      }
    });
    const data = await response.json();
    renderProducts(data.result);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function renderProducts(products) {
  storeContainer.innerHTML = "";

  products.forEach(product => {
    const item = document.createElement("div");
    item.classList.add("product-card");

    const image = product.thumbnail_url;
    const title = product.name;
    const price = product.sync_variants[0]?.retail_price || "N/A";

    item.innerHTML = `
      <img src="${image}" alt="${title}">
      <h3>${title}</h3>
      <p>$${price}</p>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    `;
    storeContainer.appendChild(item);
  });
}

fetchProducts();
