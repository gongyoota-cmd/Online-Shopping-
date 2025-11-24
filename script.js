// --- CONFIG & GLOBAL VARS ---
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
let currentUser = JSON.parse(localStorage.getItem('kshop_user_data'));

// Variable to hold the currently selected product for the Details Modal
let selectedProduct = null; 

// --- TRANSLATION MAP ---
const currentTranslations = {
    en: {
        shop_cat: "WOMEN'S FASHION", all: "All Products", clothing: "Clothing", shoes: "Shoes", bag: "Bags",
        men_cat: "MEN'S FASHION", accessories: "Accessories",
        order_form: "Order Form", address_label: "Delivery Address (ပို့ဆောင်ရန်လိပ်စာ)", contact_label: "Contact Phone (ဆက်သွယ်ရန်ဖုန်း)", note_label: "Note (အကြောင်းအရာ)",
        slip_label: "Payment Slip (ပြေစာ)", send_btn: "Send to Admin", chat_title: "Support Chat", history_title: "My Orders",
        settings_title: "Settings", dark_mode: "Dark Mode", language_title: "Language", login_tab: "Login", register_tab: "Register", phone_label: "Phone", pass_label: "Password", login_btn: "Login", register_btn: "Register", logout_btn: "Logout", name_label: "Name",
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK",
        search_placeholder: "Search...", chat_reply: "Hello! How can I help you today?" 
    },
    my: {
        shop_cat: "အမျိုးသမီးဖက်ရှင်", all: "ပစ္စည်းအားလုံး", clothing: "အဝတ်အထည်", shoes: "ဖိနပ်", bag: "အိတ်",
        men_cat: "အမျိုးသားဖက်ရှင်", accessories: "အသုံးအဆောင်",
        order_form: "မှာယူမှုပုံစံ", address_label: "ပို့ဆောင်ရန်လိပ်စာ", contact_label: "ဆက်သွယ်ရန်ဖုန်း", note_label: "အကြောင်းအရာ",
        slip_label: "ငွေလွှဲပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်", chat_title: "အကူအညီချတ်", history_title: "မှာယူမှုမှတ်တမ်း",
        settings_title: "ဆက်တင်များ", dark_mode: "ညမုဒ်", language_title: "ဘာသာစကား", login_tab: "ဝင်ရန်", register_tab: "အကောင့်ဖွင့်ရန်", phone_label: "ဖုန်းနံပါတ်", pass_label: "စကားဝှက်", login_btn: "ဝင်မည်", register_btn: "မှတ်ပုံတင်မည်", logout_btn: "ထွက်မည်", name_label: "နာမည်",
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်! ", order_sent_p: "ငွေပေးချေမှုအောင်မြင်ပါပြီ၊ မကြာမီ ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "အိုကေ",
        search_placeholder: "ရှာဖွေပါ...", chat_reply: "မင်္ဂလာပါ... ဘာကူညီပေးရမလဲရှင့်?" 
    },
    th: {
        shop_cat: "แฟชั่นสตรี", all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", bag: "กระเป๋า",
        men_cat: "แฟชั่นบุรุษ", accessories: "เครื่องประดับ",
        order_form: "แบบฟอร์มคำสั่งซื้อ", address_label: "ที่อยู่จัดส่ง", contact_label: "เบอร์ติดต่อ", note_label: "หมายเหตุ",
        slip_label: "สลิปการชำระเงิน", send_btn: "ส่งถึงแอดมิน", chat_title: "แชทสนับสนุน", history_title: "คำสั่งซื้อของฉัน",
        settings_title: "การตั้งค่า", dark_mode: "โหมดกลางคืน", language_title: "ภาษา", login_tab: "เข้าสู่ระบบ", register_tab: "ลงทะเบียน", phone_label: "เบอร์โทรศัพท์", pass_label: "รหัสผ่าน", login_btn: "เข้าสู่ระบบ", register_btn: "ลงทะเบียน", logout_btn: "ออกจากระบบ", name_label: "ชื่อ",
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินสำเร็จแล้ว จะดำเนินการจัดส่งเร็วๆ นี้🎉", ok_btn: "ตกลง",
        search_placeholder: "ค้นหา...", chat_reply: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ?" 
    }
};

let currentLang = localStorage.getItem('kshop_lang') || 'en';

// --- FALLBACK SAMPLE PRODUCTS (MODIFIED WITH COLOR IMAGES) ---
const allSampleProducts = [
    // Sample 1: Summer Floral Dress (Has multiple colors/images)
    {
        name: "Summer Floral Dress", 
        price: 25000, 
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", 
        category: "clothing", 
        gender: "women", 
        description: "Lightweight cotton floral dress perfect for summer outings.", 
        sizes: ["S", "M", "L", "XL"], 
        colors: [
            { name: "Red", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" }, 
            { name: "Blue", image_url: "https://images.unsplash.com/photo-1594633312681-425c220f54b7?w=500" }, 
            { name: "Yellow", image_url: "https://images.unsplash.com/photo-1574519525492-23c28a8d119e?w=500" } 
        ]
    },
    // Sample 2: Red Stiletto Heels 
    {
        name: "Red Stiletto Heels", 
        price: 45000, 
        image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500", 
        category: "shoes", 
        gender: "women", 
        description: "Elegant red heels for any formal occasion. Heel height: 4 inches.",
        sizes: ["36", "37", "38", "39"], 
        colors: [
            { name: "Red", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500" },
            { name: "Black", image_url: "https://images.unsplash.com/photo-1563297007-0bf0299ac7b5?w=500" }
        ]
    },
    // Sample 3: Tote Shoulder Bag
    {
        name: "Tote Shoulder Bag", 
        price: 55000, 
        image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", 
        category: "bag", 
        gender: "women",
        description: "Spacious tote bag for daily essentials.", 
        sizes: ["One Size"], 
        colors: [ { name: "Brown", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" } ] 
    }, 
    {
        name: "Denim Jacket", 
        price: 75000, 
        image_url: "https://images.unsplash.com/photo-1565406080356-83606f71d532?w=500", 
        category: "clothing", 
        gender: "men", 
        description: "Classic blue denim jacket, regular fit.", 
        sizes: ["M", "L", "XL"], 
        colors: [{ name: "Blue", image_url: "https://images.unsplash.com/photo-1565406080356-83606f71d532?w=500" }]
    },
    {
        name: "Sports Watch", 
        price: 95000, 
        image_url: "https://images.unsplash.com/photo-1620247472016-b83072225a07?w=500", 
        category: "accessories", 
        gender: "men", 
        description: "Waterproof digital sports watch with stopwatch.", 
        sizes: ["Adjustable"], 
        colors: [{ name: "Black", image_url: "https://images.unsplash.com/photo-1620247472016-b83072225a07?w=500" }]
    }
];

// --- FALLBACK SAMPLE BANNERS ---
const sampleBanners = [
    {image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"},
    {image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800"},
    {image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"}
];

// --- WINDOW ONLOAD ---
window.onload = function() {
    const langSelect = document.getElementById('langSelect');
    const savedLang = localStorage.getItem('kshop_lang');
    if (savedLang && currentTranslations[savedLang]) {
        currentLang = savedLang;
        langSelect.value = currentLang;
        applyLanguage(currentLang);
    } else if (langSelect.options.length > 0 && currentTranslations[currentLang]) {
        langSelect.value = currentLang;
        applyLanguage(currentLang);
    }
    
    loadProducts('all', currentTranslations[currentLang].all, 'women'); 
    updateUserUI();
    loadBanners(); 
    
    if(localStorage.getItem('kshop_dark_mode') === 'on') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
}

// --- LANGUAGE FUNCTIONS ---
function applyLanguage(lang) {
    const t = currentTranslations[lang];
    if (!t) return;
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (t[key]) el.innerText = t[key];
    });
    document.querySelector('#chatInput').placeholder = (lang === 'my') ? "စာပို့ပါ..." : (lang === 'th' ? "พิมพ์ข้อความ..." : "Type message...");
    document.querySelector('#searchInput').placeholder = t.search_placeholder || "Search...";
    document.querySelector('#pageTitle').innerText = t.all; 
}
function toggleLanguage(lang) {
    if (currentTranslations[lang]) {
        currentLang = lang;
        localStorage.setItem('kshop_lang', lang);
        applyLanguage(lang);
    }
}

// --- BANNER SLIDER FUNCTIONS ---
let slideIndex = 0;
async function loadBanners() {
    const { data, error } = await supabase
        .from('banners')
        .select('image_url')
        .order('order_index', { ascending: true }); 

    let finalBanners = [];
    if (!error && data && data.length > 0) {
        finalBanners = data;
    } else {
        finalBanners = sampleBanners;
    }

    const wrapper = document.getElementById('sliderWrapper');
    const dotsContainer = document.getElementById('dotsContainer');
    wrapper.innerHTML = '';
    dotsContainer.innerHTML = '';

    finalBanners.forEach((b, index) => {
        wrapper.innerHTML += `<div class="slide"><img src="${b.image_url}" alt="Banner ${index + 1}"></div>`;
        const activeClass = index === 0 ? ' active' : '';
        dotsContainer.innerHTML += `<span class="dot${activeClass}" onclick="currentSlide(${index})"></span>`;
    });
    
    if(finalBanners.length > 0) {
         startSlider();
    }
}
function startSlider() {
    showSlides();
    setInterval(() => {
        slideIndex++;
        showSlides();
    }, 3000); 
}
function showSlides() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return; 
    
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    
    document.getElementById('sliderWrapper').style.transform = `translateX(-${slideIndex * 100}%)`;
    
    dots.forEach(d => d.classList.remove('active'));
    dots[slideIndex].classList.add('active');
}
function currentSlide(n) { slideIndex = n; showSlides(); }

// --- UI UTILITY FUNCTIONS ---
function updateUserUI() {
    if(currentUser) document.getElementById('userDot').style.display = 'block';
    else document.getElementById('userDot').style.display = 'none';
}
function toggleMenu() { document.getElementById('sideMenu').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); }
function toggleSearch() { 
    const b=document.getElementById('searchBox'); 
    b.style.display=b.style.display==='block'?'none':'block'; 
    if(b.style.display === 'none') {
         document.getElementById('searchInput').value = '';
         searchProducts(); 
    }
}
function closeModal(id) { document.getElementById(id).style.display='none'; }
function switchTab(t) { 
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
    document.querySelectorAll('.menu-section').forEach(e=>e.classList.remove('active'));
    if(t==='women'){ 
        document.querySelectorAll('.tab')[0].classList.add('active'); 
        document.getElementById('women-menu').classList.add('active'); 
    }
    else { 
        document.querySelectorAll('.tab')[1].classList.add('active'); 
        document.getElementById('men-menu').classList.add('active'); 
    }
}

// --- SETTINGS FUNCTIONS ---
function openSettings() { document.getElementById('settingsModal').style.display = 'flex'; }
function toggleTheme(cb) { 
    document.body.classList.toggle('dark-mode', cb.checked); 
    localStorage.setItem('kshop_dark_mode', cb.checked ? 'on' : 'off');
}

// --- CHAT FUNCTIONS ---
function toggleChat() {
    const box = document.getElementById('chatBox');
    box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
}
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const userMessage = input.value.trim();
    if (userMessage === "") return;
    const body = document.getElementById('chatBody');
    
    const userDiv = document.createElement('div');
    userDiv.style.cssText = "background:var(--vibrant-blue); color:white; padding:8px; border-radius:5px; margin-bottom:10px; text-align:right; margin-left:auto; display:table;";
    userDiv.innerText = userMessage;
    body.appendChild(userDiv);
    input.value = '';

    const botReplyText = currentTranslations[currentLang].chat_reply || "Hello! How can I help you today?";
    setTimeout(() => {
        const replyDiv = document.createElement('div');
        replyDiv.style.cssText = "background:var(--bg-color); color:var(--text-color); padding:8px; border-radius:5px; margin-bottom:10px; display:table; border:1px solid #ddd;";
        replyDiv.innerText = botReplyText;
        body.appendChild(replyDiv);
        body.scrollTop = body.scrollHeight;
    }, 1000); 
}

// --- AUTH & HISTORY FUNCTIONS ---
function checkAuth() { if(currentUser) openHistory(); else document.getElementById('authModal').style.display = 'flex'; }
function showAuthForm(type) {
    if(type === 'login') {
        document.getElementById('tabLogin').style.borderBottom = '2px solid #2d2d2d';
        document.getElementById('tabRegister').style.borderBottom = 'none';
        document.getElementById('tabRegister').style.color = '#777';
        document.getElementById('tabLogin').style.color = 'var(--text-color)';
        document.getElementById('loginForm').style.display='block';
        document.getElementById('registerForm').style.display='none';
    } else {
        document.getElementById('tabLogin').style.borderBottom = 'none';
        document.getElementById('tabRegister').style.borderBottom = '2px solid #2d2d2d';
        document.getElementById('tabLogin').style.color = '#777';
        document.getElementById('tabRegister').style.color = 'var(--text-color)';
        document.getElementById('loginForm').style.display='none';
        document.getElementById('registerForm').style.display='block';
    }
}
async function doLogin() {
    const phone = document.getElementById('lPhone').value;
    const pass = document.getElementById('lPass').value;
    let { data } = await supabase.from('users').select('*').eq('phone', phone).eq('password', pass);
    if(data && data.length > 0) {
        currentUser = data[0];
        localStorage.setItem('kshop_user_data', JSON.stringify(currentUser));
        closeModal('authModal'); updateUserUI(); openHistory();
    } else { alert("Invalid Login"); }
}
async function doRegister() {
    const name = document.getElementById('rName').value;
    const phone = document.getElementById('rPhone').value;
    const pass = document.getElementById('rPass').value;
    let { error } = await supabase.from('users').insert([{ name, phone, password: pass }]);
    if(!error) { alert("Registered!"); showAuthForm('login'); }
    else { alert("Error: " + error.message); }
}
function doLogout() { localStorage.removeItem('kshop_user_data'); currentUser=null; closeModal('historyModal'); updateUserUI(); }
async function openHistory() {
    document.getElementById('historyModal').style.display='flex';
    const con = document.getElementById('historyList');
    con.innerHTML = '<p>Loading...</p>';
    let { data } = await supabase.from('orders').select('*').eq('customer_phone', currentUser.phone).order('created_at', {ascending:false});
    if(!data || !data.length) { con.innerHTML='<p>No orders yet.</p>'; return; }
    let html = '';
    data.forEach(o => {
        let icon = '⏳';
        if(o.status==='reject') icon='⛔'; if(o.status==='coming') icon='🟡'; if(o.status==='owned') icon='🟢';
        html += `<div class="history-item"><div><b>${o.item_name}</b><br>${o.price}</div><div style="font-size:20px;">${icon}</div></div>`;
    });
    con.innerHTML = html;
}

// --- PRODUCT DISPLAY FUNCTIONS ---
async function loadProducts(cat, title, gender = 'women') { 
    document.getElementById('productsContainer').innerHTML='';
    document.getElementById('sideMenu').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('loading').style.display = 'block'; 
    
    let q = supabase.from('products').select('*');
    
    if(gender) {
        q = q.ilike('gender', gender);
    }

    if(cat !== 'all') { 
        q = q.ilike('category', cat);
    }
    
    let { data, error } = await q;

    document.getElementById('loading').style.display = 'none';

    if (!data || data.length === 0 || error) {
        data = allSampleProducts.filter(p => {
            const genderMatch = p.gender === gender;
            const categoryMatch = cat === 'all' || p.category === cat;
            return genderMatch && categoryMatch;
        });
    }

    currentProducts = data || [];
    
    if (currentProducts.length === 0) {
         document.getElementById('productsContainer').innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No products found.</p>';
    } else {
         renderProducts(currentProducts, title);
    }
}

function renderProducts(list, title) {
    const con = document.getElementById('productsContainer');
    con.innerHTML = '';
    list.forEach((p, index) => {
        let img = p.image_url || 'https://via.placeholder.com/300';
        let price = Number(p.price).toLocaleString();
        con.innerHTML += `
        <div class="product-card" onclick="openDetails(${index})">
            <img src="${img}" class="p-img">
            <div class="p-info"><div class="p-name">${p.name}</div><div class="p-price">${price} Ks</div></div>
            <div class="cart-btn" onclick="event.stopPropagation(); openDetails(${index})"><i class="fas fa-eye"></i></div> 
        </div>`;
    });
}

function searchProducts() { 
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const con = document.getElementById('productsContainer');
    const productCards = con.querySelectorAll('.product-card');
    if (searchTerm.length === 0) {
        productCards.forEach(card => card.style.display = 'flex');
        return;
    }
    productCards.forEach(card => {
        const productName = card.querySelector('.p-name').innerText.toLowerCase(); 
        if (productName.includes(searchTerm)) card.style.display = 'flex'; 
        else card.style.display = 'none'; 
    });
}

// --- PRODUCT DETAILS & IMAGE UPDATE FUNCTIONS (Fixes the issue) ---

function updateDetailsImage(colorIndexString) {
    if (!selectedProduct || !selectedProduct.colors) return;

    const colorIndex = parseInt(colorIndexString);
    const p = selectedProduct;
    
    let imageUrl = p.image_url || 'https://via.placeholder.com/300'; 
    if (p.colors[colorIndex] && p.colors[colorIndex].image_url) {
        imageUrl = p.colors[colorIndex].image_url;
    }
    
    document.getElementById('detail-img').src = imageUrl;
    // Store the selected image URL for the checkout modal
    selectedProduct.current_image_url = imageUrl; 
}

function openDetails(idx) {
    if(!currentProducts || !currentProducts[idx]) return;
    const p = currentProducts[idx];
    selectedProduct = p; 
    
    // If not logged in, show auth modal first
    if(!currentUser) { 
        checkAuth(); 
        return; 
    }
    
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-price').innerText = Number(p.price).toLocaleString() + " Ks";
    document.getElementById('detail-description').innerText = p.description || "No description available.";
    
    // Populate Size Options 
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = '';
    const sizes = p.sizes || ["One Size"];
    sizes.forEach(size => {
        sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
    });

    // Populate Color Options (Key part for image switching)
    const colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = '';
    const colors = p.colors && p.colors.length > 0 ? p.colors : [{ name: "N/A", image_url: p.image_url || 'https://via.placeholder.com/300' }]; 

    colors.forEach((color, index) => {
        colorSelect.innerHTML += `<option value="${index}">${color.name}</option>`;
    });

    // Set the onchange handler (This is what triggers the image change)
    colorSelect.setAttribute('onchange', 'updateDetailsImage(this.value)');
    document.getElementById('quantityInput').value = 1;

    document.getElementById('detailsModal').style.display = 'flex';
    // Load the first color's image by default
    updateDetailsImage(0); 
}

// --- CART & ORDER FUNCTIONS ---
function openCheckoutFromDetails() {
    // Check if a product is selected
    if(!selectedProduct) return;
    
    const p = selectedProduct;
    const size = document.getElementById('sizeSelect').value;
    const colorIndex = document.getElementById('colorSelect').value;
    const colorName = p.colors[colorIndex] ? p.colors[colorIndex].name : 'N/A';
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;

    if (quantity < 1) { alert("Quantity must be at least 1."); return; }

    const orderNote = `Size: ${size}, Color: ${colorName}, Qty: ${quantity}`;
    const totalPrice = Number(p.price) * quantity;

    document.getElementById('modal-name').innerText = `${p.name} (${orderNote})`;
    document.getElementById('modal-price').innerText = totalPrice.toLocaleString() + " Ks"; 
    // Use the stored current_image_url (which was updated by updateDetailsImage)
    document.getElementById('modal-img').src = p.current_image_url || p.image_url || ''; 
    
    document.getElementById('noteInput').value = orderNote; 
    document.getElementById('contactPhoneInput').value = currentUser.phone || ''; 
    
    document.getElementById('slipInput').value = '';
    document.getElementById('sendBtn').disabled = true;

    closeModal('detailsModal');
    document.getElementById('checkoutModal').style.display = 'flex';
}

function checkSlipFile() {
    const file = document.getElementById('slipInput').files[0];
    document.getElementById('sendBtn').disabled = !file;
}

async function sendOrder() {
    const btn = document.getElementById('sendBtn');
    const file = document.getElementById('slipInput').files[0];
    const address = document.getElementById('addressInput').value;
    const contactPhone = document.getElementById('contactPhoneInput').value;
    const note = document.getElementById('noteInput').value; 

    if (!address.trim() || !contactPhone.trim() || !file) {
        alert("Please fill in Delivery Address, Contact Phone, and upload the Payment Slip.");
        btn.disabled = false; return;
    }

    btn.innerText="Sending..."; btn.disabled=true;
    const pNameWithDetails = document.getElementById('modal-name').innerText;
    const pPrice = document.getElementById('modal-price').innerText;

    await supabase.from('orders').insert([{
        customer_name: currentUser.name, customer_phone: contactPhone,
        item_name: pNameWithDetails, price: pPrice, status: 'pending', address: address, note: note
    }]);

    const caption = `🛍️ *New Order*\n👤 ${currentUser.name}\n📞 ${contactPhone}\n🏠 ${address}\n📝 ${note}\n---\n👗 ${pNameWithDetails}\n💰 ${pPrice}`;
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID); fd.append("caption", caption); fd.append("parse_mode", "Markdown");
    fd.append("photo", file); 
    
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {method:'POST', body:fd});
        closeModal('checkoutModal');
        document.getElementById('successModal').style.display = 'flex';
    } catch (error) {
         alert("Order sent to database but failed to send image to Telegram. Check console for error.");
    }
    
    btn.innerText=currentTranslations[currentLang].send_btn; 
    btn.disabled=false;
    document.getElementById('slipInput').value = ''; 
    document.getElementById('sendBtn').disabled = true;
}
