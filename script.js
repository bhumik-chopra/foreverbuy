const PRODUCTS = [
  { id: 1, name: "Kid Tapered Slim Fit Trouser", price: 38, image: "images/p1.png", category: "Kids", type: "Bottomwear" },
  { id: 2, name: "Men Round Neck Pure Cotton T-shirt", price: 64, image: "images/p2.png", category: "Men", type: "Topwear" },
  { id: 3, name: "Boy Round Neck Pure Cotton T-shirt", price: 60, image: "images/p3.png", category: "Kids", type: "Topwear" },
  { id: 4, name: "Women Zip-Front Relaxed Fit Jacket", price: 74, image: "images/p4.png", category: "Women", type: "Winterwear" },
  { id: 5, name: "Men Tapered Fit Flat-Front Trousers", price: 58, image: "images/p5.png", category: "Men", type: "Bottomwear" },
];

const cartCountEl = document.getElementById("cartCount");
if (cartCountEl) cartCountEl.textContent = "0";

const searchPanel = document.getElementById("searchPanel");
const searchOpen = document.getElementById("searchOpen");
const searchClose = document.getElementById("searchClose");
const searchInput = document.getElementById("searchInput");
const searchDo = document.getElementById("searchDo");

function openSearch() {
  if (!searchPanel) return;
  searchPanel.classList.add("open");
  setTimeout(() => searchInput && searchInput.focus(), 50);
}
function closeSearch() {
  if (!searchPanel) return;
  searchPanel.classList.remove("open");
}

if (searchOpen) searchOpen.addEventListener("click", openSearch);
if (searchClose) searchClose.addEventListener("click", closeSearch);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSearch();
});

const pages = {
  home: document.getElementById("page-home"),
  collection: document.getElementById("page-collection"),
  login: document.getElementById("page-login"),
  cart: document.getElementById("page-cart"),
};

const navLinks = document.querySelectorAll("[data-nav]");

function setActiveNav(key) {
  navLinks.forEach(a => a.classList.remove("active"));
  const active = document.querySelector(`[data-nav="${key}"]`);
  if (active) active.classList.add("active");
}

function showPage(key) {
  closeSearch();

  Object.values(pages).forEach(p => p && p.classList.remove("active"));
  if (pages[key]) pages[key].classList.add("active");

  if (key === "home" || key === "collection") setActiveNav(key);
  else setActiveNav("");
}

function route() {
  const hash = (location.hash || "#home").replace("#", "");

  if (hash === "about" || hash === "contact") {
    showPage("home");
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (hash in pages) {
    showPage(hash);
    if (hash === "cart") {
      updateCartDisplay();
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  } else {
    showPage("home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

window.addEventListener("hashchange", route);
window.addEventListener("load", route);

function productCardHTML(p) {
  return `
    <div class="col">
      <div class="pc">
        <img src="${p.image}" class="pc-img" alt="${p.name}">
        <div class="pc-name">${p.name}</div>
        <div class="pc-price">$${p.price}</div>
        <div class="pc-controls">
          <button class="pc-qty-btn minus" data-product-id="${p.id}" type="button">−</button>
          <input type="number" class="pc-qty-input" value="1" min="1" data-product-id="${p.id}" readonly>
          <button class="pc-qty-btn plus" data-product-id="${p.id}" type="button">+</button>
        </div>
        <button class="pc-add-btn" data-product-id="${p.id}">ADD TO CART</button>
      </div>
    </div>
  `;
}

function renderHomeProducts() {
  const homeGrid = document.getElementById("homeProductsGrid");
  if (!homeGrid) return;
  homeGrid.innerHTML = PRODUCTS.map(productCardHTML).join("");
}

function getCheckedValues(selectorAttr) {
  return Array.from(document.querySelectorAll(`input[${selectorAttr}]:checked`))
    .map(cb => cb.getAttribute(selectorAttr));
}

function applyFiltersAndRender(queryText = "") {
  const grid = document.getElementById("collectionProductsGrid");
  const info = document.getElementById("searchInfo");
  if (!grid) return;

  const cats = getCheckedValues("data-filter-cat");
  const types = getCheckedValues("data-filter-type");
  const sort = (document.getElementById("sortSelect")?.value || "relevant");

  const q = (queryText || "").trim().toLowerCase();

  let filtered = PRODUCTS.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q);
    const matchCat = cats.length === 0 || cats.includes(p.category);
    const matchType = types.length === 0 || types.includes(p.type);
    return matchQ && matchCat && matchType;
  });

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);

  grid.innerHTML = filtered.map(productCardHTML).join("");

  if (info) {
    if (q) info.textContent = `Showing results for: "${queryText}" (${filtered.length})`;
    else info.textContent = "";
  }
}

let currentSearchQuery = "";

function doSearch() {
  currentSearchQuery = (searchInput?.value || "").trim();
  location.hash = "#collection";
  setTimeout(() => applyFiltersAndRender(currentSearchQuery), 0);
}

if (searchDo) searchDo.addEventListener("click", doSearch);

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  });

  searchInput.addEventListener("input", () => {
    currentSearchQuery = searchInput.value;
    if ((location.hash || "#home") === "#collection") {
      applyFiltersAndRender(currentSearchQuery);
    }
  });
}

document.addEventListener("change", (e) => {
  const t = e.target;
  if (!t) return;

  if (t.matches('input[data-filter-cat], input[data-filter-type], #sortSelect')) {
    applyFiltersAndRender(currentSearchQuery);
  }
});

const form = document.getElementById("newsletterForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.innerHTML = '<i class="fa-solid fa-check"></i> Subscribed successfully!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
    form.reset();
  });
}

// Add to Cart functionality
let cart = [];

function getQuantityForProduct(productId) {
  const input = document.querySelector(`.pc-qty-input[data-product-id="${productId}"]`);
  return input ? parseInt(input.value) : 1;
}

document.addEventListener("click", (e) => {
  const productId = parseInt(e.target.getAttribute("data-product-id"));
  
  if (e.target.matches(".pc-qty-btn.plus")) {
    const input = document.querySelector(`.pc-qty-input[data-product-id="${productId}"]`);
    if (input) input.value = parseInt(input.value) + 1;
  }
  
  if (e.target.matches(".pc-qty-btn.minus")) {
    const input = document.querySelector(`.pc-qty-input[data-product-id="${productId}"]`);
    if (input && parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
  }
  
  if (e.target.matches(".pc-add-btn")) {
    const qty = getQuantityForProduct(productId);
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (product) {
      const existingItem = cart.find(item => item.product.id === productId);
      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        cart.push({ product, quantity: qty });
      }
      updateCartCount();
      showCartNotification(product.name, qty);
      const input = document.querySelector(`.pc-qty-input[data-product-id="${productId}"]`);
      if (input) input.value = 1;
    }
  }
  
  if (e.target.matches(".remove-cart-btn")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    cart.splice(index, 1);
    updateCartDisplay();
  }
  
  if (e.target.matches(".cart-qty-plus")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    if (cart[index]) cart[index].quantity++;
    updateCartDisplay();
  }
  
  if (e.target.matches(".cart-qty-minus")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    if (cart[index] && cart[index].quantity > 1) cart[index].quantity--;
    updateCartDisplay();
  }
});

function showCartNotification(productName, qty) {
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.innerHTML = `<i class="fa-solid fa-check"></i> Added ${qty} item${qty > 1 ? 's' : ''} to cart`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2500);
}

function updateCartCount() {
  if (cartCountEl) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
  }
}

function updateCartDisplay() {
  const container = document.getElementById("cartItemsContainer");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
    if (subtotalEl) subtotalEl.textContent = "$ 0.00";
    if (totalEl) totalEl.textContent = "$ 10.00";
    updateCartCount();
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, idx) => {
    const lineTotal = item.product.price * item.quantity;
    subtotal += lineTotal;
    return `
      <div class="cart-item">
        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.product.name}</div>
          <div class="cart-item-price">$${item.product.price} x ${item.quantity} = <span class="line-total">$${lineTotal.toFixed(2)}</span></div>
          <div class="cart-item-qty-control">
            <button class="cart-qty-minus" data-index="${idx}" type="button">−</button>
            <span class="cart-qty-display">${item.quantity}</span>
            <button class="cart-qty-plus" data-index="${idx}" type="button">+</button>
          </div>
        </div>
        <button class="remove-cart-btn" data-index="${idx}" type="button">×</button>
      </div>
    `;
  }).join("");

  if (subtotalEl) subtotalEl.textContent = `$ ${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$ ${(subtotal + 10).toFixed(2)}`;
  updateCartCount();
}

window.addEventListener("hashchange", () => {
  if ((location.hash || "#home") === "#cart") {
    updateCartDisplay();
  }
  if ((location.hash || "#home") === "#collection") {
    applyFiltersAndRender(currentSearchQuery);
  }
});

renderHomeProducts();
applyFiltersAndRender("");