// ==========================================================
// 1. Configuration & Initialization
// ==========================================================

// Supabase Initialization (!!! REPLACE YOUR KEYS HERE !!!)
const supabaseUrl = "YOUR_SUPABASE_URL"; 
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"; 
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Telegram Bot Configuration
const BOT_TOKEN = 'YOUR_BOT_TOKEN'; 
const CHAT_ID = 'YOUR_CHAT_ID'; 

// Global variables
let products = [];
let currentCategory = 'women';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedProduct = null;
let current_user_id = null;
let current_user_name = localStorage.getItem('user_name') || 'Guest';

// Translation Data
const currentTranslations = {
    my: {
        logo: "ဖက်ရှင်ဓာတ်ခွဲခန်း",
        tabWomen: "အမျိုးသမီး",
        tabMen: "အမျိုးသား",
        search_placeholder: "ပစ္စည်းရှာဖွေပါ...",
        all: "ပစ္စည်းအားလုံး",
        cartTitle: "သင်၏ ဈေးခြင်းတောင်း",
        cartTotalText: "စုစုပေါင်း:",
        checkoutBtnText: "ငွေရှင်းပါ",
        chatTitle: "ဖောက်သည် ဝန်ဆောင်မှု",
        chat_placeholder: "စာရိုက်ပါ...",
        chat_reply: "မင်္ဂလာပါရှင်။ ဘာကူညီပေးရမလဲရှင့်?",
        details_color: "အရောင်:",
        details_qty: "အရေအတွက်:",
        details_add: "ခြင်းတောင်းထဲ ထည့်မည်",
        alert_cart_added: "ပစ္စည်းကို ခြင်းတောင်းထဲ ထည့်လိုက်ပါပြီ!",
        alert_checkout_success: "အော်ဒါ အောင်မြင်စွာ တင်ပို့ပြီးပါပြီ။",
        alert_no_items: "ခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိသေးပါ။"
    },
    en: {
        logo: "Fashion Lab",
        tabWomen: "Women",
        tabMen: "Men",
        search_placeholder: "Search products...",
        all: "All Products",
        cartTitle: "Your Cart",
        cartTotalText: "Total:",
        checkoutBtnText: "Checkout Now",
        chatTitle: "Customer Service",
        chat_placeholder: "Type your message...",
        chat_reply: "Hello! How can I assist you today?",
        details_color: "Color:",
        details_qty: "Quantity:",
        details_add: "Add to Cart",
        alert_cart_added: "Item added to cart!",
        alert_checkout_success: "Order submitted successfully.",
        alert_no_items: "Your cart is empty."
    }
};

let currentLang = localStorage.getItem('lang') || 'my';

// ==========================================================
// 2. Authentication Logic (Supabase Email OTP)
// ==========================================================

// Supabase Authentication Listener
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        // User is logged in
        current_user_id = session.user.id;
        // Use the name entered during login or existing name
        const userName = localStorage.getItem('user_name') || 'User'; 
        current_user_name = userName;
        
        document.getElementById('profileBtn').innerText = current_user_name;
        document.getElementById('profileBtn').title = "Logged in as: " + session.user.email;
        closeModal('login-modal');
    } else {
        // User is logged out
        current_user_id = null;
        current_user_name = 'Guest';
        document.getElementById('profileBtn').innerText = 'Log In';
        document.getElementById('profileBtn').title = 'Click to log in';
        localStorage.removeItem('user_name');
        // Clear login form on logout/session end
        if(document.getElementById('user-email')) document.getElementById('user-email').value = '';
        if(document.getElementById('otp-section')) document.getElementById('otp-section').style.display = 'none';
    }
});

// Function to handle profile button click (Login/Logout)
function openLoginOrProfile() {
    if (current_user_id) {
        // If logged in, prompt to log out
        if (confirm(`Hello, ${current_user_name}. Do you want to log out?`)) {
            logoutUser();
        }
    } else {
        // If not logged in, show the login modal
        openModal('login-modal');
    }
}

// Logout Function
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert("Error logging out: " + error.message);
    } else {
        // onAuthStateChange handles UI update
    }
}

// Send OTP
document.getElementById("send-otp-btn").addEventListener("click", async () => {
    const email = document.getElementById("user-email").value.trim();
    const userName = document.getElementById("user-name").value.trim();

    document.getElementById("otp-section").style.display = 'none';

    if (!email || !userName) {
        alert("Please enter both your Name and Email address.");
        return;
    }

    document.getElementById("send-otp-btn").disabled = true;

    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            // Replace with your actual deployed URL
            emailRedirectTo: "https://online-shopping-rust-five.vercel.app/" 
        }
    });

    document.getElementById("send-otp-btn").disabled = false;

    if (error) {
        alert("Error sending OTP: " + error.message);
    } else {
        // Temporarily save name if user successfully requests OTP
        localStorage.setItem('user_name', userName); 
        document.getElementById("otp-section").style.display = "block";
        document.getElementById("otp-code").focus();
        alert("OTP sent to your email! Check your Inbox.");
    }
});

// Verify OTP
document.getElementById("verify-otp-btn").addEventListener("click", async () => {
    const email = document.getElementById("user-email").value.trim();
    const token = document.getElementById("otp-code").value.trim();

    if (!token || !email) {
        alert("Enter the email and the 6-digit OTP code.");
        return;
    }
    
    document.getElementById("verify-otp-btn").disabled = true;

    const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: "email"
    });
    
    document.getElementById("verify-otp-btn").disabled = false;

    if (error) {
        alert("Invalid OTP or expired.");
    } else {
        // onAuthStateChange handles the rest (saving user, closing modal)
        alert("Login success! Welcome.");
    }
});


// ==========================================================
// 3. Core E-commerce & UI Logic (Original Functions)
// ==========================================================

// Sample Product Data (Replaced with Supabase Call in actual app)
const sampleProducts = [
    // ... (Your original sample product data here for testing)
    { id: 1, category: 'women', name: 'Elegant Maxi Dress', price: 45000, desc: 'A beautiful flowing dress perfect for evening wear.', colors: [{name: 'Red', img: 'https://picsum.photos/id/1/300/300'}, {name: 'Black', img: 'https://picsum.photos/id/10/300/300'}], img: 'https://picsum.photos/id/1/300/300' },
    { id: 2, category: 'women', name: 'Stylish Denim Jacket', price: 60000, desc: 'Classic denim jacket for casual look.', colors: [{name: 'Blue', img: 'https://picsum.photos/id/2/300/300'}, {name: 'White', img: 'https://picsum.photos/id/20/300/300'}], img: 'https://picsum.photos/id/2/300/300' },
    { id: 3, category: 'men', name: 'Slim Fit Polo Shirt', price: 30000, desc: 'Comfortable and stylish polo shirt.', colors: [{name: 'Navy', img: 'https://picsum.photos/id/3/300/300'}, {name: 'Gray', img: 'https://picsum.photos/id/30/300/300'}], img: 'https://picsum.photos/id/3/300/300' },
    { id: 4, category: 'men', name: 'Leather Biker Jacket', price: 120000, desc: 'High quality leather jacket for a cool vibe.', colors: [{name: 'Black', img: 'https://picsum.photos/id/4/300/300'}], img: 'https://picsum.photos/id/4/300/300' },
    // Add more products for testing
    { id: 5, category: 'women', name: 'Summer Floral Skirt', price: 25000, desc: 'Light and airy skirt for hot days.', colors: [{name: 'Floral', img: 'https://picsum.photos/id/5/300/300'}], img: 'https://picsum.photos/id/5/300/300' },
    { id: 6, category: 'men', name: 'Comfortable Sneakers', price: 75000, desc: 'Stylish and comfortable everyday sneakers.', colors: [{name: 'White', img: 'https://picsum.photos/id/6/300/300'}, {name: 'Black', img: 'https://picsum.photos/id/60/300/300'}], img: 'https://picsum.photos/id/6/300/300' },
];

async function loadProducts(category = currentCategory) {
    currentCategory = category;
    
    // In a real app, you would fetch from Supabase here:
    // const { data, error } = await supabase.from('products').select('*').eq('category', category);
    // products = data || [];
    
    // For this example, use local sample data
    products = sampleProducts.filter(p => p.category === category);

    // Update UI
    document.getElementById('pageTitle').innerText = currentTranslations[currentLang].all; 
    document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
    
    const tabs = document.querySelectorAll('.menu .tab');
    if (category === 'women' && tabs[0]) tabs[0].classList.add('active');
    if (category === 'men' && tabs[1]) tabs[1].classList.add('active');

    renderProducts(products);
}

function renderProducts(list) {
    const con = document.getElementById('productsContainer');
    con.innerHTML = '';
    
    list.forEach((p, index) => {
        const img = p.colors && p.colors.length > 0 ? p.colors[0].img : p.img;
        const price = p.price.toLocaleString('en-US'); 
        
        con.innerHTML += `
        <div class="product-card">
            <img src="${img}" class="p-img" onclick="openDetails(${index})">
            <div class="p-info" onclick="openDetails(${index})">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${price} Ks</div>
            </div>
            <div class="cart-btn" onclick="event.stopPropagation(); openDetails(${index});"><i class="fas fa-eye"></i></div> 
        </div>`;
    });
}

function openModal(id) { 
    document.getElementById(id).style.display = 'block'; 
    if (id === 'cart-modal') renderCart();
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

function toggleSearch() { 
    const b = document.getElementById('searchBox'); 
    const isVisible = b.style.display === 'block';
    b.style.display = isVisible ? 'none' : 'block'; 
    if (isVisible) {
         document.getElementById('searchInput').value = '';
         searchProducts(); // Reset search results
    } else {
         document.getElementById('searchInput').focus(); // Focus when opening
    }
}

function searchProducts() { 
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    renderProducts(filteredProducts);
}

// Product Details Logic
function openDetails(index) {
    selectedProduct = products[index];
    if (!selectedProduct) return;

    const t = currentTranslations[currentLang];
    
    // Build Color Options
    let colorOptions = '';
    selectedProduct.colors.forEach((c, i) => {
        colorOptions += `<option value="${i}">${c.name}</option>`;
    });

    const price = selectedProduct.price.toLocaleString('en-US');
    const firstImage = selectedProduct.colors[0].img;
    selectedProduct.current_image_url = firstImage; // Default selected image

    document.getElementById('details-body').innerHTML = `
        <div class="detail-img-container">
            <img id="detailImage" src="${firstImage}" alt="${selectedProduct.name}">
        </div>
        <div class="detail-info">
            <h2>${selectedProduct.name}</h2>
            <p id="detailPrice">${price} Ks</p>
            <p>${selectedProduct.desc}</p>
            
            <label for="colorSelect">${t.details_color}</label>
            <select id="colorSelect" onchange="updateDetailsImage(this.value)">
                ${colorOptions}
            </select>
            
            <label for="qtySelect" style="margin-top: 15px;">${t.details_qty}</label>
            <input type="number" id="qtySelect" value="1" min="1" max="10" style="width: 80px;">

            <button style="margin-top: 20px;" onclick="addToCart()">
                <i class="fas fa-cart-plus"></i> ${t.details_add}
            </button>
        </div>
    `;

    openModal('details-modal');
}

function updateDetailsImage(colorIndexString) {
    const index = parseInt(colorIndexString);
    if (selectedProduct && selectedProduct.colors[index]) {
        const imageUrl = selectedProduct.colors[index].img;
        document.getElementById('detailImage').src = imageUrl;
        // Store the selected image URL for the cart
        selectedProduct.current_image_url = imageUrl;
        selectedProduct.selected_color = selectedProduct.colors[index].name;
    }
}

function addToCart() {
    const qty = parseInt(document.getElementById('qtySelect').value);
    const color = selectedProduct.selected_color || selectedProduct.colors[0].name;

    const item = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        qty: qty,
        color: color,
        img: selectedProduct.current_image_url
    };
    
    // Check if item already exists (same id and color)
    const existingIndex = cart.findIndex(c => c.id === item.id && c.color === item.color);
    
    if (existingIndex !== -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    closeModal('details-modal');
    alert(currentTranslations[currentLang].alert_cart_added);
    renderCart();
}

// Cart Logic
function renderCart() {
    const con = document.getElementById('cartItems');
    const count = document.getElementById('cartItemCount');
    const totalEl = document.getElementById('cartTotal');
    let total = 0;
    
    con.innerHTML = '';

    if (cart.length === 0) {
        con.innerHTML = '<p style="text-align: center; color: #888;">' + currentTranslations[currentLang].alert_no_items + '</p>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            con.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img" alt="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name} (${item.color})</div>
                        <div class="cart-item-qty">Qty: ${item.qty}</div>
                        <div class="cart-item-price">${itemTotal.toLocaleString('en-US')} Ks</div>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        });
    }

    count.innerText = cart.length;
    totalEl.innerText = total.toLocaleString('en-US') + ' Ks';
    document.getElementById('checkoutBtn').onclick = checkout;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Checkout Logic (using Telegram Bot)
async function checkout() {
    if (cart.length === 0) {
        alert(currentTranslations[currentLang].alert_no_items);
        return;
    }

    // Ensure user is logged in
    if (!current_user_id) {
        alert("Please log in before checking out.");
        closeModal('cart-modal');
        openModal('login-modal');
        return;
    }

    let orderSummary = `New Order from Online Shop\n\n`;
    orderSummary += `👤 User: ${current_user_name} (ID: ${current_user_id})\n`;
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        orderSummary += `  - ${item.name} (${item.color}) x ${item.qty} = ${itemTotal.toLocaleString()} Ks\n`;
    });

    orderSummary += `\n💰 Total Amount: ${total.toLocaleString()} Ks\n`;
    orderSummary += `\n(Order sent via Web App)`;

    const telegramApi = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const params = {
        chat_id: CHAT_ID,
        text: orderSummary,
        parse_mode: 'Markdown'
    };

    try {
        const response = await fetch(telegramApi + '?' + new URLSearchParams(params));
        const data = await response.json();
        
        if (data.ok) {
            alert(currentTranslations[currentLang].alert_checkout_success);
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            closeModal('cart-modal');
            renderCart();
        } else {
            throw new Error(data.description || 'Failed to send message');
        }
    } catch (e) {
        alert("Error submitting order (Telegram failure). Please try again or contact support.");
        console.error("Telegram Error:", e);
    }
}

// Chat Logic (Simple Echo/Log)
function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const chatBody = document.getElementById('chatBody');

    // 1. Display User Message
    chatBody.innerHTML += `<div class="chat-message user"><div>${message}</div></div>`;
    
    // 2. Simple Bot Reply (for demo)
    setTimeout(() => {
        chatBody.innerHTML += `<div class="chat-message bot"><div>Thank you! A representative will contact you shortly.</div></div>`;
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
    }, 500);

    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
}

// ==========================================================
// 4. UI & Utility Functions
// ==========================================================

// Language Function
function applyLanguage(lang) {
    const t = currentTranslations[lang];
    if (!t) return;
    
    // Update all text elements based on translation keys
    document.getElementById('logoText').innerText = t.logo;
    document.getElementById('tabWomen').innerText = t.tabWomen;
    document.getElementById('tabMen').innerText = t.tabMen;
    document.getElementById('searchInput').placeholder = t.search_placeholder;
    document.getElementById('pageTitle').innerText = t.all; 
    document.getElementById('cartTitle').innerText = t.cartTitle; 
    document.getElementById('cartTotalText').innerText = t.cartTotalText;
    document.getElementById('checkoutBtnText').innerText = t.checkoutBtnText;
    document.getElementById('chatTitle').innerText = t.chatTitle;
    document.getElementById('chatInput').placeholder = t.chat_placeholder;

    // Update the initial chat message
    const initialMsgElement = document.getElementById('initialChatMsg');
    if (initialMsgElement) {
        initialMsgElement.innerText = t.chat_reply;
    }

    localStorage.setItem('lang', lang);
    currentLang = lang;
    renderCart(); // Re-render cart to update text
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
}

// Window Load/Init Function
window.onload = function() {
    // 1. Load language setting
    const langSelect = document.getElementById('langSelect');
    if (currentTranslations[currentLang]) {
        langSelect.value = currentLang;
        applyLanguage(currentLang);
    } else if (langSelect.options.length > 0) {
        currentLang = langSelect.options[0].value;
        langSelect.value = currentLang;
        applyLanguage(currentLang);
    }
    
    // 2. Load dark mode setting
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // 3. Load initial products (handles category activation via loadProducts)
    loadProducts(currentCategory); 
    
    // 4. Check for existing Supabase session (handled by onAuthStateChange)
};

// ==========================================================
// END OF script.js
// ==========================================================
