// scripts/merch.js
document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const filterButtons = document.querySelectorAll(".filter-button");

  // Load products from your cached Printful API
  const products = await fetchProducts();

  // Default view
  renderProducts(products);

  // Category filter
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const category = button.dataset.category;
      if (category === "all") {
        renderProducts(products);
      } else {
        const filtered = products.filter((p) =>
          p.name.toLowerCase().includes(category.toLowerCase())
        );
        renderProducts(filtered);
      }
    });
  });

  async function fetchProducts() {
    try {
      const res = await fetch("/.netlify/functions/fetch-printful-products");
      const data = await res.json();
      if (!data.success || !data.products) throw new Error("No products found");
      return data.products;
    } catch (err) {
      console.error("Failed to load products:", err);
      return [];
    }
  }

  async function loadVariants(variantIds) {
    const url = `/.netlify/functions/fetch-printful-variants?ids=${variantIds.join(",")}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.variants : [];
  }

  async function renderProducts(productList) {
    productGrid.innerHTML = "";

    for (const product of productList) {
      const card = document.createElement("div");
      card.className = "product-card";
      card.id = `product-${product.id}`;
      card.innerHTML = `
        <img src="${product.thumbnail_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">$${product.default_price || "0.00"}</p>
        <div class="variant-selectors"></div>
        <button class="add-to-cart">Add to Cart</button>
      `;
      productGrid.appendChild(card);

      // Load variants only for known products
      let variantIds = [];
      if (product.name.toLowerCase().includes("hoodie")) {
        variantIds = [
          41264973643940, 41264973676708, 41264973709476, 41264973775012,
          41264973807780, 41264974528676, 41264974561444, 41264974594212,
          41264974626980, 41264974659748, 41264974266532, 41264974299300,
          41264974364836, 41264974430372, 41264974463140, 41264973873316,
          41264973906084, 41264973938852, 41264973971620, 41264974004388,
          41264974725284, 41264974790820, 41264974823588, 41264974856356,
          41264974889124,
        ];
      } else if (product.name.toLowerCase().includes("t-shirt")) {
        variantIds = [
          41262715666596, 41262715699364, 41262715732132, 41262715764900,
          41262715797668, 41262716059812, 41262716092580, 41262716125348,
          41262716158116, 41262716190884, 41262716223652, 41262716256420,
          41262716289188, 41262716321956, 41262716354724, 41262716747940,
          41262716780708, 41262716813476, 41262716846244, 41262716879012,
        ];
      }

      if (variantIds.length > 0) {
        const variants = await loadVariants(variantIds);
        createVariantSelectors(product, variants);
      }
    }
  }

  function createVariantSelectors(product, variants) {
    const container = document.querySelector(`#product-${product.id} .variant-selectors`);
    if (!container || variants.length === 0) return;

    // Extract unique sizes and colors
    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

    // Create dropdowns
    const sizeSelect = document.createElement("select");
    sizeSelect.className = "size-select";
    sizeSelect.innerHTML = `<option value="">Select Size</option>` +
      sizes.map((s) => `<option value="${s}">${s}</option>`).join("");

    const colorSelect = document.createElement("select");
    colorSelect.className = "color-select";
    colorSelect.innerHTML = `<option value="">Select Color</option>` +
      colors.map((c) => `<option value="${c}">${c}</option>`).join("");

    container.appendChild(sizeSelect);
    container.appendChild(colorSelect);

    const priceElement = document.querySelector(`#product-${product.id} .price`);
    const imageElement = document.querySelector(`#product-${product.id} img`);

    function updateVariantDisplay() {
      const selectedVariant = variants.find(
        (v) =>
          (!sizeSelect.value || v.size === sizeSelect.value) &&
          (!colorSelect.value || v.color === colorSelect.value)
      );

      if (selectedVariant) {
        priceElement.textContent = `$${selectedVariant.price}`;
        if (selectedVariant.image) imageElement.src = selectedVariant.image;
      }
    }

    sizeSelect.addEventListener("change", updateVariantDisplay);
    colorSelect.addEventListener("change", updateVariantDisplay);
  }
});
