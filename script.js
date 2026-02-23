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

window.addEventListener("hashchange", () => {
  if ((location.hash || "#home") === "#collection") {
    applyFiltersAndRender(currentSearchQuery);
  }
});

const form = document.getElementById("newsletterForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Subscribed successfully!");
    form.reset();
  });
}

renderHomeProducts();
applyFiltersAndRender("");