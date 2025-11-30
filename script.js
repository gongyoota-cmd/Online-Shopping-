// CONFIG
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// Custom domain used for Supabase Auth 
// This is no longer needed for Magic Link but kept as a placeholder if needed later.
const AUTH_DOMAIN = '@kshop.com'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
// currentUser now stores the profile data fetched from the 'users' table
let currentUser = null; 
let selectedProduct = null; 
// Variable to hold the email address during the Magic Link flow
let currentAuthEmail = null; // <-- Changed from currentAuthPhone

// --- INITIALIZATION ---
window.onload = async () => {
    // Check for theme and language preference
    loadPreferences();
    
    // Load the user session and profile
    await loadUserSession(); 
    
    // Load initial products
    await loadProducts('all', 'All Products', 'women');
    
    // Listen for auth changes (for Magic Link confirmation)
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            loadUserSession();
            closeModal('authModal');
        }
    });
    
    updateLoginStatus();
};

function updateLoginStatus() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (currentUser) {
        logoutBtn.style.display = 'flex';
    } else {
        logoutBtn.style.display = 'none';
    }
}

// --- CORE FUNCTIONS ---
function toggleMenu() { 
    document.getElementById('sideMenu').classList.toggle('active'); 
    document.querySelector('.overlay').classList.toggle('active'); 
}
function toggleSearch() { 
    const b=document.getElementById('searchBox'); 
    b.style.display=b.style.display==='block'?'none':'block'; 
    if(b.style.display === 'none') {
         document.getElementById('searchInput').value = '';
         searchProducts(); 
    }
}
function closeModal(id) { document.getElementById(id).style.display='none'; }

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
    loadProducts('all', 'All Products', t);
}

// --- UTILITY ---
function showSnackbar(message, type = 'info') {
    const snackbar = document.getElementById('snackbar');
    snackbar.innerText = message;
    snackbar.className = 'show ' + type;
    setTimeout(() => { snackbar.className = snackbar.className.replace('show', ''); }, 3000);
}

// --- DATA FETCHING ---
async function loadProducts(category, title, gender) {
    toggleMenu(); // Close side menu
    document.getElementById('currentCategoryTitle').innerText = title;
    
    let query = supabase.from('products').select('*').eq('gender', gender);
    if (category !== 'all') {
        query = query.eq('category', category);
    }
    
    let { data, error } = await query;
    
    if (error) {
        console.error('Error loading products:', error);
        showSnackbar('Error loading products.', 'error');
        return;
    }
    
    currentProducts = data;
    renderProducts(data);
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = ''; 
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">No products found in this category.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image_url}" alt="${p.name}">
            <p class="p-name">${p.name}</p>
            <p class="p-price" style="font-weight:bold; color:var(--accent-color);">${p.price}</p>
        `;
        card.onclick = () => openDetails(p.id);
        container.appendChild(card);
    });
}

// --- DETAILS & CHECKOUT ---
function openDetails(productId) {
    selectedProduct = currentProducts.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    document.getElementById('modal-image').src = selectedProduct.image_url;
    document.getElementById('modal-name').innerText = selectedProduct.name;
    document.getElementById('modal-price').innerText = selectedProduct.price;
    document.getElementById('modal-details').innerText = selectedProduct.details;
    document.getElementById('detailsModal').style.display = 'flex';
}

function openCheckoutFromDetails() {
    // Check if the user is logged in
    if(!currentUser) { 
        closeModal('detailsModal');
        checkAuth(); 
        return; 
    }
    if(!selectedProduct) return;
    
    // Combine product name and price for display/note
    const orderNote = `[ORDER] ${selectedProduct.name} - ${selectedProduct.price}`;
    
    // Set the consolidated note and contact info (now email)
    document.getElementById('noteInput').value = orderNote; 
    document.getElementById('contactPhoneInput').value = currentUser.email || ''; // <-- Used currentUser.email
    
    // Reset file input
    document.getElementById('slipInput').value = '';
    document.getElementById('sendBtn').disabled = true;
    
    // Update summary in checkout modal
    document.getElementById('checkoutProductSummary').innerHTML = `
        <p style="font-weight:bold;">${selectedProduct.name}</p>
        <p style="color:var(--accent-color);">Price: ${selectedProduct.price}</p>
    `;

    closeModal('detailsModal');
    document.getElementById('checkoutModal').style.display = 'flex';
}

function checkSlipFile() {
    const file = document.getElementById('slipInput').files[0];
    document.getElementById('sendBtn').disabled = !file;
}

// --- ORDER SUBMISSION ---
async function sendOrder() {
    const btn = document.getElementById('sendBtn');
    const file = document.getElementById('slipInput').files[0];
    const address = document.getElementById('addressInput').value.trim();
    const contactInfo = document.getElementById('contactPhoneInput').value.trim(); // <-- This is now the user's email or manually edited contact info
    let note = document.getElementById('noteInput').value.trim(); 

    if (!address || !contactInfo || !file) {
        showSnackbar("Please fill in all required fields (Address, Contact, Slip).", 'error'); 
        btn.disabled = false; return;
    }
    
    if(!currentUser || !currentUser.user_id) {
        showSnackbar("User is not logged in properly. Please re-login.", 'error'); 
        return;
    }

    btn.innerText="Sending..."; btn.disabled=true;
    const pNameWithDetails = document.getElementById('modal-name').innerText;
    const pPrice = document.getElementById('modal-price').innerText;

    // 1. Upload the payment slip to Supabase Storage
    const fileName = `${currentUser.user_id}_${Date.now()}`;
    const { error: uploadError } = await supabase.storage
        .from('slips') 
        .upload(fileName, file);
        
    if (uploadError) {
        showSnackbar('Error uploading slip: ' + uploadError.message, 'error');
        btn.innerText="Send"; btn.disabled=false; return;
    }
    
    // Get public URL for the file
    const { data: publicURLData } = supabase.storage.from('slips').getPublicUrl(fileName);
    const publicURL = publicURLData.publicUrl;

    // 2. Save order details to the 'orders' table
    // customer_phone field will store the contactInfo (which is likely the email, or a manually entered phone number)
    const { error: orderError } = await supabase.from('orders').insert([{
        customer_name: currentUser.name, customer_phone: contactInfo, customer_user_id: currentUser.user_id,
        item_name: pNameWithDetails, price: pPrice, status: 'pending', address: address, note: note, slip_url: publicURL
    }]);
    
    if (orderError) {
        showSnackbar('Error saving order: ' + orderError.message, 'error');
        btn.innerText="Send"; btn.disabled=false; return;
    }
    
    // 3. Send notification to Telegram
    const caption = `🛍️ *New Order*\n👤 ${currentUser.name}\n📧 ${contactInfo} (Contact Info)\n🏠 ${address}\n📝 ${note}\n---\n👗 ${pNameWithDetails}\n💰 ${pPrice}\n📄 [View Slip](${publicURL})`;

    const fd = new FormData();
    fd.append('chat_id', CHAT_ID);
    fd.append('caption', caption);
    fd.append('parse_mode', 'Markdown');
    // Using the public URL to send the photo from Telegram API
    fd.append('photo', publicURL);

    try {
        // Send the order via fetch to Telegram
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {method:'POST', body:fd});
        
        closeModal('checkoutModal');
        document.getElementById('successModal').style.display = 'flex';
        // Reload history after successful order
        loadOrderHistory();

    } catch (error) {
         console.error("Telegram Error:", error);
         showSnackbar("Order sent to database but failed to notify Admin.", 'error'); 
    }
    
    btn.innerText=getTranslation('send_btn'); btn.disabled=false;
}

// --- AUTH: Session/Profile Loading ---
async function loadUserSession() {
    // Ensure session is fetched correctly
    await supabase.auth.getSession(); 

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Check for a pending Magic Link sign-in error on the URL
    if(window.location.hash.includes('access_token') && sessionError) {
        console.error("Error signing in after Magic Link:", sessionError);
        showSnackbar("Login failed. Please try sending the link again.", 'error');
        window.history.replaceState({}, document.title, window.location.pathname); // Clear hash
        return;
    }
    
    if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
    }
    
    currentUser = null;
    
    if (session) {
        const userId = session.user.id;
        
        // 1. Fetch user profile
        let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        // 2. Handle Profile Creation (If a user signed up via Magic Link but has no profile yet)
        if (profileError && profileError.code === 'PGRST116') { // PGRST116 = Profile Not Found
            console.log("Profile not found. Creating a new profile for Magic Link user.");
            const userEmail = session.user.email;
            
            // Use the part of the email before @ as a default name
            const defaultName = userEmail ? userEmail.split('@')[0] : 'New User';
            
            let { error: newProfileError } = await supabase.from('users').insert([
                // phone is set to 'N/A' as we use email
                { user_id: userId, name: defaultName, email: userEmail, phone: 'N/A' } 
            ]);
            
            if (newProfileError) {
                console.error("Error creating new profile:", newProfileError);
                showSnackbar("Profile creation failed. Please contact support.", 'error');
                await supabase.auth.signOut();
                return;
            }
            
            // Re-fetch the newly created profile
            let { data: newProfileData } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', userId)
                .single();

            currentUser = newProfileData;
            showSnackbar("Registration & Login successful!", 'success');
        } 
        
        // 3. Handle other profile fetching errors
        else if (profileError) {
             console.error("Error fetching profile:", profileError);
             await supabase.auth.signOut(); // Sign out corrupted session
             return;
        } else {
             // 4. Successful profile fetch
             currentUser = profile;
        }
    }
    
    updateLoginStatus();
    // Clear hash fragment (access_token, etc.) after processing the session
    if(window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// --- AUTH: Magic Link Functions ---
function checkAuth() { 
    if(currentUser) openHistory(); 
    else {
        document.getElementById('authModal').style.display = 'flex'; 
        // Reset to default login view on open
        showAuthForm('login'); 
        
        // Clear inputs and reset UI for Magic Link Step 1
        document.getElementById('lEmail').value = ''; 
        document.getElementById('verifyOtpLogin').style.display = 'none';
        document.getElementById('sendMagicLinkBtn').style.display = 'block'; 
        
        document.getElementById('rName').value = '';
        document.getElementById('rEmail').value = ''; 
        document.getElementById('verifyOtpRegister').style.display = 'none';
        document.getElementById('sendMagicLinkRegisterBtn').style.display = 'block'; 
        currentAuthEmail = null;
    }
}

function showAuthForm(type) {
    // Reset to Step 1 when switching tabs
    currentAuthEmail = null; 

    if(type === 'login') {
        document.getElementById('tabLogin').style.borderBottom = '2px solid #2d2d2d';
        document.getElementById('tabRegister').style.borderBottom = 'none';
        document.getElementById('tabRegister').style.color = '#777';
        document.getElementById('tabLogin').style.color = 'var(--text-color)';
        document.getElementById('loginForm').style.display='block';
        document.getElementById('registerForm').style.display='none';
        
        // Show Step 1 for Login (Magic Link)
        document.getElementById('verifyOtpLogin').style.display = 'none';
        document.getElementById('sendMagicLinkBtn').style.display = 'block'; 
        document.getElementById('lEmail').value = ''; 
    } else {
        document.getElementById('tabLogin').style.borderBottom = 'none';
        document.getElementById('tabRegister').style.borderBottom = '2px solid #2d2d2d';
        document.getElementById('tabLogin').style.color = '#777';
        document.getElementById('tabRegister').style.color = 'var(--text-color)';
        document.getElementById('loginForm').style.display='none';
        document.getElementById('registerForm').style.display='block';
        
        // Show Step 1 for Register (Magic Link)
        document.getElementById('verifyOtpRegister').style.display = 'none';
        document.getElementById('sendMagicLinkRegisterBtn').style.display = 'block'; 
        document.getElementById('rName').value = ''; 
        document.getElementById('rEmail').value = ''; 
    }
}


// --- OTP Step 1: Send OTP to Phone ကို Magic Link သို့ ပြောင်းလဲ ---
async function sendMagicLink(type) { 
    let email, btn; 
    
    if (type === 'login') {
        email = document.getElementById('lEmail').value.trim(); 
        btn = document.getElementById('sendMagicLinkBtn'); 
    } else { // register
        const name = document.getElementById('rName').value.trim();
        if (!name) {
            showSnackbar("Please enter your name for registration.", 'error');
            return;
        }
        email = document.getElementById('rEmail').value.trim(); 
        btn = document.getElementById('sendMagicLinkRegisterBtn'); 
    }

    if (!email || !email.includes('@')) { 
        showSnackbar("Please enter a valid email address.", 'error');
        return;
    }
    
    currentAuthEmail = email; 
    
    const originalText = btn.innerText;
    btn.innerText = "Sending Link...";
    btn.disabled = true;

    // Use Supabase signInWithOtp with the 'email' option (Magic Link)
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({ 
        email: email,
        options: {
            emailRedirectTo: window.location.href // Redirect back to the current page
        }
    });

    if (magicLinkError) {
        showSnackbar("Error sending Magic Link: " + magicLinkError.message, 'error');
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }
    
    showSnackbar(`Magic Link sent to ${email}. Check your inbox.`, 'success');

    // Hide the input/button and show the message
    if (type === 'login') {
        document.getElementById('sendMagicLinkBtn').style.display = 'none'; 
        document.getElementById('verifyOtpLogin').style.display = 'block'; 
    } else { // register
        document.getElementById('sendMagicLinkRegisterBtn').style.display = 'none'; 
        document.getElementById('verifyOtpRegister').style.display = 'block'; 
    }

    // Keep button disabled temporarily to prevent spamming
    setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    }, 5000); 
}

// --- OTP Step 2: Verify OTP and Login/Register function (REMOVED) ---


async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Logout Error:", error);
        showSnackbar("Logout failed.", 'error');
        return;
    }
    currentUser = null;
    selectedProduct = null;
    updateLoginStatus();
    closeModal('settingsModal');
    showSnackbar("Logged out successfully.", 'info');
}

// --- ORDER HISTORY ---
async function openHistory() {
    if (!currentUser) {
        checkAuth();
        return;
    }
    
    closeModal('settingsModal');
    document.getElementById('historyModal').style.display = 'flex';
    loadOrderHistory();
}

async function loadOrderHistory() {
    const container = document.getElementById('historyContainer');
    container.innerHTML = '<p style="text-align:center; padding:20px;">Loading orders...</p>';
    
    let { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_user_id', currentUser.user_id)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Error loading order history:", error);
        container.innerHTML = `<p style="text-align:center; color:red;">Error loading history: ${error.message}</p>`;
        return;
    }
    
    if (orders.length === 0) {
        container.innerHTML = `<p data-t="no_orders" style="text-align:center; color:#777; margin-top:20px;">${getTranslation('no_orders')}</p>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        let statusClass = '';
        if (order.status === 'pending') statusClass = 'status-pending';
        else if (order.status === 'shipped') statusClass = 'status-shipped';
        else if (order.status === 'delivered') statusClass = 'status-delivered';
        else statusClass = 'status-cancelled';

        const orderDate = new Date(order.created_at).toLocaleDateString();

        return `
            <div class="order-card">
                <div class="order-summary">
                    <p><strong>${order.item_name}</strong></p>
                    <p>Price: ${order.price}</p>
                </div>
                <div class="${statusClass}">Status: ${order.status}</div>
                <div class="order-details">
                    <p>Date: ${orderDate}</p>
                    <p>Address: ${order.address}</p>
                    <p>Contact: ${order.customer_phone}</p>
                </div>
            </div>
        `;
    }).join('');
}

// --- SETTINGS & PREFERENCES ---
function openSettings() {
    closeModal('historyModal');
    document.getElementById('settingsModal').style.display = 'flex';
}

// ... (Theme and Language functions are unchanged)

// --- THEME & LANGUAGE ---
function loadPreferences() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeToggle').checked = isDark;
    
    const lang = localStorage.getItem('language') || 'en';
    document.getElementById('languageSelect').value = lang;
    setLanguage(lang);
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    const elements = document.querySelectorAll('[data-t]');
    elements.forEach(el => {
        const key = el.getAttribute('data-t');
        el.innerText = getTranslation(key, lang);
    });
}

function getTranslation(key, lang = localStorage.getItem('language') || 'en') {
    return currentTranslations[lang] && currentTranslations[lang][key] ? currentTranslations[lang][key] : currentTranslations['en'][key] || key;
}

// --- TRANSLATION MAP (MODIFIED) ---
const currentTranslations = {
    en: {
        all: "All Products", clothing: "Clothing", shoes: "Shoes", accessories: "Accessories", shop_cat: "WOMEN'S FASHION", shop_cat_men: "MEN'S FASHION",
        history: "Order History", settings_title: "Settings", dark_mode: "Dark Mode", language_title: "Language", login_tab: "Login", register_tab: "Register", 
        email_label: "Email", // <-- CHANGED
        pass_label: "OTP Code", 
        login_btn: "Send Login Link", // <-- CHANGED
        register_btn: "Send Registration Link", // <-- CHANGED
        logout_btn: "Logout", name_label: "Name",
        order_now_btn: "Order Now", checkout_h3: "Final Checkout", your_order_h4: "Your Order", 
        shipping_info_h4: "Shipping & Contact Info", address_label: "Delivery Address (ပို့ဆောင်ရန်လိပ်စာ)", 
        contact_label: "Contact Phone (ဆက်သွယ်ရန်ဖုန်း)", note_label: "Note (အကြောင်းအရာ)", 
        slip_label: "Payment Slip (ပြေစာ)", send_btn: "Send to Admin", 
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK", 
        no_orders: "No orders found."
    },
    my: {
        all: "ပစ္စည်းအားလုံး", clothing: "အဝတ်အစား", shoes: "ဖိနပ်", accessories: "အသုံးအဆောင်", shop_cat: "အမျိုးသမီးဖက်ရှင်", shop_cat_men: "အမျိုးသားဖက်ရှင်",
        history: "မှာယူမှုမှတ်တမ်း", settings_title: "ဆက်တင်များ", dark_mode: "ညမုဒ်", language_title: "ဘာသာစကား", login_tab: "ဝင်ရန်", register_tab: "အကောင့်ဖွင့်ရန်", 
        email_label: "အီးမေးလ်", // <-- CHANGED
        pass_label: "OTP ကုဒ်",
        login_btn: "ဝင်ရောက်ရန် လင့်ပို့မည်", // <-- CHANGED
        register_btn: "အကောင့်ဖွင့်ရန် လင့်ပို့မည်", // <-- CHANGED
        logout_btn: "ထွက်မည်", name_label: "နာမည်",
        order_now_btn: "အခုမှာယူမည်", checkout_h3: "နောက်ဆုံး ငွေရှင်းခြင်း", your_order_h4: "သင်၏မှာယူမှု", 
        shipping_info_h4: "ပို့ဆောင်ရန်နှင့် ဆက်သွယ်ရန် အချက်အလက်", address_label: "ပို့ဆောင်ရန်လိပ်စာ", 
        contact_label: "ဆက်သွယ်ရန်ဖုန်း", note_label: "မှတ်ချက်", 
        slip_label: "ငွေပေးချေမှုပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်", 
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်ပါပြီ!", order_sent_p: "ငွေပေးချေမှုအောင်မြင်ပါပြီ၊ မကြာခင် ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "OK", 
        no_orders: "မှာယူမှုများ မတွေ့ပါ။"
    },
    th: {
        all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", accessories: "เครื่องประดับ", shop_cat: "แฟชั่นผู้หญิง", shop_cat_men: "แฟชั่นผู้ชาย",
        history: "ประวัติการสั่งซื้อ", settings_title: "การตั้งค่า", dark_mode: "โหมดกลางคืน", language_title: "ภาษา", login_tab: "เข้าสู่ระบบ", register_tab: "ลงทะเบียน", 
        email_label: "อีเมล", // <-- CHANGED
        pass_label: "รหัส OTP", 
        login_btn: "ส่งลิงก์เข้าสู่ระบบ", // <-- CHANGED
        register_btn: "ส่งลิงก์ลงทะเบียน", // <-- CHANGED
        logout_btn: "ออกจากระบบ", name_label: "ชื่อ",
        order_now_btn: "สั่งซื้อตอนนี้", checkout_h3: "ชำระเงินสุดท้าย", your_order_h4: "คำสั่งซื้อของคุณ", 
        shipping_info_h4: "ข้อมูลการจัดส่งและติดต่อ", address_label: "ที่อยู่จัดส่ง", 
        contact_label: "เบอร์โทรศัพท์ติดต่อ", note_label: "หมายเหตุ", 
        slip_label: "สลิปการชำระเงิน", send_btn: "ส่งถึงผู้ดูแล", 
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินเรียบร้อยแล้ว จะจัดส่งให้เร็วที่สุด🎉", ok_btn: "ตกลง",
        no_orders: "ไม่พบคำสั่งซื้อ"
    }
};
