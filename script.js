/* ===============================
        SUPABASE CONFIG
=============================== */
const SUPA_URL = "https://nfcrbbmwqhsgnqfbitqx.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const db = supabase.createClient(SUPA_URL, SUPA_KEY);

/* ===============================
        GLOBAL VARIABLES
=============================== */
let currentCategory = "all";
let currentGender = "women";
let allProducts = [];
let filteredProducts = [];

/* ===============================
        UI CONTROL
=============================== */
function toggleMenu() {
    document.getElementById("sideMenu").classList.toggle("active");
    document.querySelector(".overlay").classList.toggle("active");
}

function toggleSearch() {
    const box = document.getElementById("searchBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function openSettings() {
    document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

/* ===============================
        LANGUAGE SWITCH
=============================== */
const LANG_DATA = {
    en: {
        clothing: "Clothing",
        shoes: "Shoes",
        bag: "Bags",
        accessories: "Accessories",
        all: "All Products",
        men_cat: "MEN'S FASHION",
        shop_cat: "WOMEN'S FASHION",
        chat_title: "Support Chat",
    },
    mm: {
        clothing: "အဝတ်အစား",
        shoes: "ဖိနပ်များ",
        bag: "လှည်းများ",
        accessories: "သုံးစရာများ",
        all: "ကုန်ပစ္စည်းအားလုံး",
        men_cat: "ယောကျာ်းများ ရှေ့ပြေး",
        shop_cat: "အမျိုးသမီးများ ဖက်ရှင်",
        chat_title: "အကူအညီ",
    }
};

let currentLang = "en";

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-t]").forEach(el => {
        el.innerText = LANG_DATA[lang][el.dataset.t];
    });
}

/* ===============================
      DARK MODE
=============================== */
function toggleDarkMode(toggle) {
    document.body.classList.toggle("dark-mode", toggle.checked);
}

/* ===============================
      AUTH CONTROL
=============================== */
async function checkAuth() {
    const { data: { user } } = await db.auth.getUser();
    if (user) {
        openAccount();
    } else {
        document.getElementById("loginModal").style.display = "flex";
    }
}

/* ===============================
      SNACKBAR
=============================== */
function showToast(msg, type="success") {
    const sb = document.getElementById("snackbar");
    sb.innerText = msg;
    sb.className = `show ${type}`;
    setTimeout(() => sb.className = sb.className.replace("show", ""), 3000);
}

/* ===============================
      PRODUCT LOAD
=============================== */
async function loadProducts(cat = "all", title = "All Products", gender = currentGender) {
    currentCategory = cat;
    currentGender = gender;

    document.getElementById("productsContainer").innerHTML = "";
    document.getElementById("pageTitle").innerText = title;
    document.getElementById("loading").style.display = "block";

    let q = db.from("products").select("*")
            .eq("gender", gender);

    if (cat !== "all") q = q.eq("category", cat);

    const { data, error } = await q;

    document.getElementById("loading").style.display = "none";

    if(error) return showToast("Error loading products","error");

    allProducts = data;
    filteredProducts = data;
    renderProducts();
}

function renderProducts() {
    const box = document.getElementById("productsContainer");
    box.innerHTML = "";

    filteredProducts.forEach(p => {
        box.innerHTML += `
            <div class="product-card">
                <img class="p-img" src="${p.image}">
                <div class="p-info">
                    <div class="p-name">${p.name}</div>
                    <div class="p-price">${p.price} Ks</div>
                </div>
                <div class="cart-btn" onclick="openOrder(${p.id})">
                    <i class="fas fa-shopping-cart"></i>
                </div>
            </div>
        `;
    });
}

/* ===============================
      SEARCH
=============================== */
function searchProducts() {
    const q = document.getElementById("searchInput").value.toLowerCase();

    filteredProducts = allProducts.filter(i =>
        i.name.toLowerCase().includes(q)
    );

    renderProducts();
}

/* ===============================
      ORDER FORM
=============================== */
let selectedProduct = null;

function openOrder(id) {
    selectedProduct = allProducts.find(p => p.id == id);
    document.getElementById("orderName").innerText = selectedProduct.name;
    document.getElementById("orderModal").style.display = "flex";
}

function closeOrder() {
    document.getElementById("orderModal").style.display = "none";
}

/* ===============================
      CHAT BOT
=============================== */
function toggleChat() {
    const box = document.getElementById("chatBox");
    box.style.display = box.style.display === "block" ? "none" : "block";
}

function sendChatMessage() {
    const msg = document.getElementById("chatInput").value;
    if(!msg) return;

    const box = document.getElementById("chatBody");
    box.innerHTML += `<div style="text-align:right;margin-bottom:5px;">
        <span style="background:#cce5ff;padding:5px;border-radius:5px;">${msg}</span>
    </div>`;

    document.getElementById("chatInput").value = "";
    box.scrollTop = box.scrollHeight;
}

/* ===============================
      SLIDER
=============================== */
let slideIndex = 0;

function startSlider() {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    slides.forEach(s => s.style.display="none");
    slideIndex++;
    if(slideIndex>slides.length) slideIndex=1;

    slides[slideIndex-1].style.display="block";

    dots.forEach(d => d.classList.remove("active"));
    dots[slideIndex-1].classList.add("active");

    setTimeout(startSlider,3000);
}

/* ===============================
     INIT
=============================== */
window.onload = async () => {
    await loadProducts();
    setLang("en");
    startSlider();
};
        
