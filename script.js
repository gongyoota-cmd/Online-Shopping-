// CONFIG
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// Custom domain used for Supabase Auth (Magic Link Redirect)
const REDIRECT_URL = window.location.origin; // Uses the current domain for redirection

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
// currentUser now stores the profile data fetched from the 'users' table
let currentUser = null; 
let selectedProduct = null; 
// currentAuthPhone is no longer relevant for Magic Link
let currentAuthPhone = null; 
let currentLang = 'my'; 
let currentTranslations = {}; 

document.addEventListener('DOMContentLoaded', () => {
    // Load and apply translations
    loadTranslations();
    
    // Check initial auth state
    handleAuthChange();
    
    // Listen for auth state changes (crucial for Magic Link)
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            handleAuthChange();
        }
    });

    // Load initial products (default tab)
    loadProducts('all', 'All Products', 'women');
});

// --- TRANSLATION and UI UTILS ---

async function loadTranslations() {
    // Simplified translation data structure for demonstration
    currentTranslations = {
        'my': {
            // General UI
            'menu': 'မီနူး', 'cart': 'စျေးဝယ်ခြင်း', 'search': 'ရှာရန်', 'my_account': 'ကျွန်ုပ်၏အကောင့်', 'logout': 'အကောင့်ထွက်',
            'order_history': 'အမှာစာမှတ်တမ်း', 'all': 'ပစ္စည်းအားလုံး', 'shop_cat': 'အမျိုးသမီးဖက်ရှင်',
            
            // Auth Form
            'register_h3': 'အကောင့်ဖန်တီးပါ', 'login_h3': 'ဝင်ရောက်ပါ',
            'name_label': 'အမည်', 'email_label': 'အီးမေးလ်', 
            'register_btn': 'Magic Link ပို့မည်', 'login_btn': 'Magic Link ပို့မည်',
            'register_link': 'အကောင့်မရှိဘူးလား? အကောင့်ဖွင့်ပါ', 'login_link': 'အကောင့်ရှိပြီးသားလား? ဝင်ရောက်ပါ',
            'check_email_h3': '📧 သင့်အီးမေးလ်ကို စစ်ဆေးပါ!',
            
            // Order Form
            'order_h3': 'အော်ဒါမှာယူခြင်း', 'del_info_h3': 'ပို့ဆောင်မည့်အချက်အလက်', 
            'del_label': 'ပို့ဆောင်ရန်လိပ်စာ', 'contact_label': 'ဆက်သွယ်ရန်ဖုန်း', 
            'note_label': 'မှတ်ချက်', 'slip_label': 'ငွေရှင်းပြေစာ',
            'send_btn': 'Admin ထံသို့ ပို့မည်', 'order_sent_h3': '👾 အော်ဒါပို့ပြီးပါပြီ!', 
            'order_sent_p': 'ငွေပေးချေမှု အောင်မြင်ပါသည်။ မကြာမီ ပို့ဆောင်ပေးပါမည်။ 🎉', 'ok_btn': 'OK',
            
            // History
            'history_h3': 'အမှာစာမှတ်တမ်း', 'pending': 'စောင့်ဆိုင်းဆဲ', 'delivered': 'ပို့ပြီး',
            
            // Product Modal
            'size_label': 'Size ရွေးပါ', 'add_to_cart': 'စျေးခြင်းထဲ ထည့်မည်',
            
            // Cart Modal
            'cart_h3': 'စျေးခြင်း', 'total': 'စုစုပေါင်း', 'order_btn': 'မှာယူမည်',
        },
        'en': {
            // General UI
            'menu': 'Menu', 'cart': 'Cart', 'search': 'Search', 'my_account': 'My Account', 'logout': 'Logout',
            'order_history': 'Order History', 'all': 'All Products', 'shop_cat': "WOMEN'S FASHION",
            
            // Auth Form
            'register_h3': 'Create Account', 'login_h3': 'Login',
            'name_label': 'Name', 'email_label': 'Email', 
            'register_btn': 'Send Magic Link', 'login_btn': 'Send Magic Link',
            'register_link': 'Create new account', 'login_link': 'Already have an account? Login',
            'check_email_h3': '📧 Check Your Email!',
            
            // Order Form
            'order_h3': 'Place Order', 'del_info_h3': 'Delivery Information', 
            'del_label': 'Delivery Address', 'contact_label': 'Contact Phone', 
            'note_label': 'Note', 'slip_label': 'Payment Slip',
            'send_btn': 'Send to Admin', 'order_sent_h3': '👾 Order sent!', 
            'order_sent_p': 'Payment successful, delivery will be made soon.🎉', 'ok_btn': 'OK',
            
            // History
            'history_h3': 'Order History', 'pending': 'Pending', 'delivered': 'Delivered',
            
            // Product Modal
            'size_label': 'Select Size', 'add_to_cart': 'Add to Cart',
            
            // Cart Modal
            'cart_h3': 'Cart', 'total': 'Total', 'order_btn': 'Place Order',
        }
    };
    applyTranslations();
    // Re-render auth form if needed, to apply new 'email_label'
    if (document.getElementById('authModal').style.display === 'block') {
         showAuthForm(document.getElementById('loginForm').style.display !== 'none' ? 'login' : 'register');
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (currentTranslations[currentLang] && currentTranslations[currentLang][key]) {
            el.innerText = currentTranslations[currentLang][key];
        }
    });
}

function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    loadTranslations();
}

function showSnackbar(message, type = 'info') {
    const snackbar = document.getElementById("snackbar");
    snackbar.className = "show " + type;
    snackbar.innerText = message;
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}

// --- PRODUCT/CART LOGIC ---

async function loadProducts(category, title, gender) {
    document.getElementById('productsTitle').innerText = title;
    
    let query = supabase.from('products').select('*');
    if (gender !== 'all') {
        query = query.eq('gender', gender);
    }
    if (category !== 'all') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    currentProducts = data;
    renderProducts(data);
    closeModal('sideMenu'); // Close the side menu after selecting a category
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = ''; 
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', p.id);
        card.innerHTML = `
            <img src="${p.image_url}" alt="${p.name}">
            <p class="p-name">${p.name}</p>
            <p class="p-price">${p.price} MMK</p>
            <button class="add-btn" onclick="openProductModal('${p.id}')"><i class="fas fa-eye"></i> View Details</button>
        `;
        container.appendChild(card);
    });
}

function openProductModal(productId) {
    selectedProduct = currentProducts.find(p => p.id === productId);
    if (!selectedProduct) return;

    document.getElementById('productModalImage').src = selectedProduct.image_url;
    document.getElementById('productModalName').innerText = selectedProduct.name;
    document.getElementById('productModalDesc').innerText = selectedProduct.description;
    document.getElementById('productModalPrice').innerText = `${selectedProduct.price} MMK`;
    
    // Size options rendering
    const sizeSelect = document.getElementById('productSizeSelect');
    sizeSelect.innerHTML = '';
    selectedProduct.sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.innerText = size;
        sizeSelect.appendChild(option);
    });

    document.getElementById('productModal').style.display = 'block';
}

let cart = [];

function addToCart() {
    if (!selectedProduct) return;

    const size = document.getElementById('productSizeSelect').value;
    const item = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        size: size,
        image_url: selectedProduct.image_url,
        quantity: 1
    };

    // Check if item already exists in cart with the same size
    const existingItemIndex = cart.findIndex(
        i => i.id === item.id && i.size === item.size
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(item);
    }
    
    showSnackbar(`${item.name} (${item.size}) added to cart!`, 'success');
    closeModal('productModal');
    updateCartIcon();
}

function updateCartIcon() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').innerText = count;
}

function openCartModal() {
    const container = document.getElementById('cartItemsContainer');
    const totalElement = document.getElementById('cartTotal');
    let total = 0;

    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center;">Your cart is empty.</p>';
        totalElement.innerText = '0 MMK';
        document.getElementById('cartOrderBtn').disabled = true;
        document.getElementById('cartOrderBtn').innerText = currentTranslations[currentLang].order_btn;
        document.getElementById('cartOrderBtn').classList.remove('active');
        document.getElementById('cartOrderBtn').classList.add('inactive');
        document.getElementById('cartOrderBtn').style.opacity = '0.5';

    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}">
                <div class="item-details">
                    <p class="item-name">${item.name} (${item.size})</p>
                    <p class="item-price">${item.price} MMK x ${item.quantity}</p>
                    <p class="item-subtotal">Subtotal: ${itemTotal} MMK</p>
                </div>
                <div class="item-actions">
                    <button onclick="updateCartQuantity(${index}, -1)" class="quantity-btn">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${index}, 1)" class="quantity-btn">+</button>
                    <button onclick="removeFromCart(${index})" class="remove-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(itemDiv);
        });
        totalElement.innerText = `${total} MMK`;
        document.getElementById('cartOrderBtn').disabled = false;
        document.getElementById('cartOrderBtn').classList.remove('inactive');
        document.getElementById('cartOrderBtn').classList.add('active');
        document.getElementById('cartOrderBtn').style.opacity = '1';
    }

    document.getElementById('cartModal').style.display = 'block';
}

function updateCartQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(index);
    } else {
        openCartModal(); // Re-render cart
    }
    updateCartIcon();
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    showSnackbar(`${removedItem.name} removed from cart.`, 'info');
    openCartModal();
    updateCartIcon();
}

function openOrderModal() {
    if (!currentUser) {
        showSnackbar("Please login to place an order.", 'error');
        openAuthModal();
        return;
    }
    if (cart.length === 0) {
         showSnackbar("Your cart is empty.", 'error');
         return;
    }
    
    // Pre-fill contact info from user profile (assuming 'phone' or 'email' is used for contact)
    // Since we are using Magic Link, we assume the user might have a phone in the 'users' table
    document.getElementById('nameInput').value = currentUser.name || '';
    document.getElementById('contactPhoneInput').value = currentUser.phone || ''; 
    document.getElementById('addressInput').value = currentUser.address || ''; 
    
    document.getElementById('orderModal').style.display = 'block';
    closeModal('cartModal');
}

// --- ORDER / TELEGRAM LOGIC ---

async function checkSlipFile() {
    const fileInput = document.getElementById('slipInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (fileInput.files.length > 0) {
        sendBtn.disabled = false;
        sendBtn.classList.add('active');
        sendBtn.classList.remove('inactive');
    } else {
        sendBtn.disabled = true;
        sendBtn.classList.remove('active');
        sendBtn.classList.add('inactive');
    }
}

async function sendOrder() {
    const name = document.getElementById('nameInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    const contactPhone = document.getElementById('contactPhoneInput').value.trim();
    const note = document.getElementById('noteInput').value.trim();
    const slipFile = document.getElementById('slipInput').files[0];
    const totalAmount = document.getElementById('cartTotal').innerText;

    if (!name || !address || !contactPhone || !slipFile) {
        showSnackbar("Please fill in all required fields and upload the payment slip.", 'error');
        return;
    }

    const sendBtn = document.getElementById('sendBtn');
    sendBtn.innerText = 'Sending...';
    sendBtn.disabled = true;

    // 1. Upload Slip to Supabase Storage
    const fileName = `slips/${currentUser.user_id}_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('slips') 
        .upload(fileName, slipFile);

    if (uploadError) {
        showSnackbar("Error uploading slip: " + uploadError.message, 'error');
        sendBtn.innerText = currentTranslations[currentLang].send_btn;
        sendBtn.disabled = false;
        return;
    }

    // Get public URL for the slip
    const { data: publicUrlData } = supabase.storage
        .from('slips')
        .getPublicUrl(fileName);
    const slipUrl = publicUrlData.publicUrl;

    // 2. Save Order to Supabase Database
    const orderDetails = cart.map(item => ({
        product_id: item.id,
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity
    }));

    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: currentUser.user_id,
            total_amount: totalAmount,
            delivery_address: address,
            contact_phone: contactPhone,
            note: note,
            payment_slip_url: slipUrl,
            order_details: orderDetails,
            status: 'pending' // Default status
        }).select();

    if (orderError) {
        showSnackbar("Error saving order: " + orderError.message, 'error');
        sendBtn.innerText = currentTranslations[currentLang].send_btn;
        sendBtn.disabled = false;
        return;
    }

    const orderId = orderData[0].id;

    // 3. Send Telegram Notification
    const cartSummary = cart.map(item => 
        ` - ${item.name} (${item.size}) x ${item.quantity} - ${item.price * item.quantity} MMK`
    ).join('\n');

    let telegramMessage = `
*NEW ORDER RECEIVED (Magic Link User)*
*Order ID:* ${orderId}
*User:* ${name} (ID: ${currentUser.user_id})
*Email:* ${currentUser.email}
*Total:* ${totalAmount}
*Phone:* ${contactPhone}
*Address:* ${address}
*Note:* ${note || 'N/A'}

*Order Details:*
${cartSummary}

*Payment Slip:* ${slipUrl}
    `;

    // Telegram Bot API call
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown'
        })
    });

    // 4. Success Handling
    showSnackbar(currentTranslations[currentLang].order_sent_p, 'success');
    closeModal('orderModal');
    document.getElementById('successModal').style.display = 'block';
    
    // Clear cart and reset form
    cart = [];
    updateCartIcon();
    document.getElementById('slipInput').value = '';
    sendBtn.innerText = currentTranslations[currentLang].send_btn;
    checkSlipFile(); // Disable button
    
    // Refresh user profile to include new order history
    await getCurrentUserProfile();
}

// --- AUTH LOGIC (Magic Link) ---

function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    // Default to login form
    showAuthForm('login');
}

function showAuthForm(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Reset forms content in case of previous Magic Link Instruction
    // The content is reset in indexOOO.html's structure when the form is shown/switched
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    // Re-apply translations for dynamic elements if necessary
    applyTranslations();
}

// Function to send the Magic Link via Email
async function sendMagicLink(type) {
    const emailInputId = type === 'login' ? 'lEmail' : 'rEmail';
    const nameInputId = type === 'register' ? 'rName' : null;
    const btnId = type === 'login' ? 'loginBtn' : 'sendMagicLinkBtn'; 
    
    const email = document.getElementById(emailInputId).value.trim();
    const btn = document.getElementById(btnId);
    const originalText = btn.innerText;

    if (!email) {
        showSnackbar("Email is required.", 'error');
        btn.disabled = false;
        return;
    }
    
    if (type === 'register') {
        const name = document.getElementById(nameInputId).value.trim();
        if (!name) {
            showSnackbar("Name is required for registration.", 'error');
            btn.disabled = false;
            return;
        }
        // Store the name temporarily before the link is sent (optional, but useful if you need to access it later)
        // Since Magic Link redirects, we handle the registration logic in handleAuthChange
    }
    
    btn.innerText = 'Sending Link...';
    btn.disabled = true;

    // Supabase signInWithOtp for Magic Link
    let { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            // The email will contain a link that redirects back to this URL
            emailRedirectTo: REDIRECT_URL, 
        }
    });

    btn.disabled = false;
    btn.innerText = originalText;

    if (error) {
        showSnackbar("Error sending link: " + error.message, 'error');
        return;
    }
    
    // UI Update: Inform user to check their email
    showSnackbar("Magic Link sent to " + email + ". Please check your inbox.", 'success');
    
    // Hide the form and show instructions, and allow user to go back
    document.getElementById(type === 'login' ? 'loginForm' : 'registerForm').innerHTML = `
        <h3 data-t="check_email_h3">${currentTranslations[currentLang].check_email_h3}</h3>
        <p>A sign-in link has been sent to <b>${email}</b>. Click the link to complete your login.</p>
        <button class="order-btn" onclick="showAuthForm('${type}')">Go Back</button>
    `;
    applyTranslations(); // Re-apply translations after changing innerHTML
}

// --- Check Authentication State and Load User Profile ---
async function handleAuthChange() {
    const { data: { user } } = await supabase.auth.getUser();

    // Reset UI elements
    document.getElementById('myAccountBtn').style.display = 'none';
    document.getElementById('loginBtnHeader').style.display = 'flex';
    document.getElementById('historyBtn').style.display = 'none';


    if (user) {
        // Fetch profile data from your custom 'users' table
        let { data: profile, error } = await supabase
            .from('users')
            .select(`*, orders(*)`) 
            .eq('user_id', user.id)
            .single();

        if (error && error.code === 'PGRST116') { // Record not found (New User)
             // **MAGIC LINK REGISTRATION LOGIC:** If user exists in Auth but not in 'users' table (new user)
             if (user.email) {
                 // Supabase Magic Link does not capture the Name during sign-up. 
                 // We will use the email prefix as a temporary name and ask the user to update it later.
                 let tempName = user.email.split('@')[0];
                 let { error: insertError } = await supabase.from('users').insert([
                     { user_id: user.id, name: tempName, email: user.email }
                 ]);
                 
                 if (insertError) {
                     console.error("Failed to create profile for new Magic Link user:", insertError);
                 } else {
                     showSnackbar(`Welcome, ${tempName}! Please update your profile.`, 'success');
                     // Try fetching again to set currentUser
                     return handleAuthChange(); 
                 }
             }

        } else if (error) {
            console.error('Error fetching profile:', error);
        } else {
            // User is logged in and has a profile
            currentUser = profile;
            document.getElementById('myAccountBtn').style.display = 'flex';
            document.getElementById('loginBtnHeader').style.display = 'none';
            document.getElementById('historyBtn').style.display = 'block';
            document.getElementById('myAccountBtn').innerText = currentUser.name;

            closeModal('authModal');
            closeModal('sideMenu');
        }
    } else {
        // No user logged in
        currentUser = null;
    }
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showSnackbar("Logout failed: " + error.message, 'error');
    } else {
        showSnackbar("Logged out successfully.", 'info');
        // UI is updated by the onAuthStateChange listener calling handleAuthChange()
        closeModal('accountModal');
    }
}

function openAccountModal() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    // Populate profile data
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profileAddress').value = currentUser.address || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';

    // Render order history
    renderOrderHistory();

    document.getElementById('accountModal').style.display = 'block';
}

function renderOrderHistory() {
    const historyContainer = document.getElementById('historyItemsContainer');
    historyContainer.innerHTML = '';

    if (!currentUser || !currentUser.orders || currentUser.orders.length === 0) {
        historyContainer.innerHTML = '<p style="text-align:center;">No order history found.</p>';
        return;
    }

    // Sort orders by creation date (newest first)
    const sortedOrders = currentUser.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sortedOrders.forEach(order => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        
        const date = new Date(order.created_at).toLocaleDateString(currentLang === 'my' ? 'my-MM' : 'en-US');
        const statusText = currentTranslations[currentLang][order.status] || order.status;
        const statusClass = order.status === 'delivered' ? 'success' : 'pending';

        itemDiv.innerHTML = `
            <div>
                <p><strong>Order ID:</strong> #${order.id}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Total:</strong> ${order.total_amount}</p>
            </div>
            <span class="status-tag ${statusClass}">${statusText}</span>
        `;
        historyContainer.appendChild(itemDiv);
    });
}

async function saveProfile() {
    const name = document.getElementById('profileName').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();

    if (!name) {
        showSnackbar("Name cannot be empty.", 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.innerText = 'Saving...';
    saveBtn.disabled = true;

    const { error } = await supabase
        .from('users')
        .update({ name: name, address: address, phone: phone })
        .eq('user_id', currentUser.user_id);

    saveBtn.innerText = 'Save Profile';
    saveBtn.disabled = false;

    if (error) {
        showSnackbar("Failed to save profile: " + error.message, 'error');
    } else {
        showSnackbar("Profile updated successfully!", 'success');
        // Re-fetch user profile to update local currentUser object
        await handleAuthChange();
        closeModal('accountModal');
    }
}

// --- UI UTILS ---

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
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

// Check for dark mode preference on load
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeSwitch').checked = true;
}
၂။ indexOOO.html(Magic Link UI) ပြင်ဆင်ချက်များ
indexOOO.htmlဖိုင်တွင်ရှိသော Login/Registration ၏ အုပ်ထိန်းသူများမှ နှင့် OTP စစ်ဆေးရန် အကွက်များကို ဖယ်ရှားပြီး Email အကွက်ဖြင့် အစားထိုးကာ onclickevent များကို sendMagicLink()function အသစ်သို့ ပြောင်းလိုက်ပါသည်။

indexOOO.html
HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fashion Lab</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="styleOOO.css"> 
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> 
</head>
<body id="body">

    <div class="overlay" onclick="toggleMenu()"></div>
    
    <div class="side-menu" id="sideMenu">
        <div class="menu-tabs">
            <div class="tab active" onclick="switchTab('women')">WOMEN</div>
            <div class="tab" onclick="switchTab('men')">MEN</div>
        </div>
        <div class="menu-content">
            <div id="women-menu" class="menu-section active">
                <div style="padding:15px; background:var(--bg-color); font-weight:bold;" data-t="shop_cat">WOMEN'S FASHION</div>
                <div class="menu-item" onclick="loadProducts('all', 'All Products', 'women')"><span data-t="all">All Products</span> <i class="fas fa-chevron-right"></i></div>
                <div class="menu-item" onclick="loadProducts('clothing', 'Clothing', 'women')"><span data-t="clothing">Clothing</span> <i class="fas fa-chevron-right"></i></div>
                <div class="menu-item" onclick="loadProducts('shoes', 'Shoes', 'women')"><span data-t="shoes">Shoes</span> <i class="fas fa-chevron-right"></i></div>
            </div>
            <div id="men-menu" class="menu-section">
                <div style="padding:15px; background:var(--bg-color); font-weight:bold;" data-t="shop_cat">MEN'S FASHION</div>
                <div class="menu-item" onclick="loadProducts('all', 'All Products', 'men')"><span data-t="all">All Products</span> <i class="fas fa-chevron-right"></i></div>
                <div class="menu-item" onclick="loadProducts('clothing', 'Clothing', 'men')"><span data-t="clothing">Clothing</span> <i class="fas fa-chevron-right"></i></div>
                <div class="menu-item" onclick="loadProducts('accessories', 'Accessories', 'men')"><span data-t="accessories">Accessories</span> <i class="fas fa-chevron-right"></i></div>
            </div>
        </div>
    </div>

    <header>
        <div class="nav-left">
            <i class="fas fa-bars" onclick="toggleMenu()" data-t="menu"></i>
            <h1>Fashion Lab</h1>
        </div>
        <div class="nav-icons">
            <i class="fas fa-search" onclick="toggleSearch()" data-t="search"></i>
            <div class="cart-icon" onclick="openCartModal()">
                <i class="fas fa-shopping-cart" data-t="cart"></i>
                <span id="cartCount">0</span>
            </div>
            <div class="auth-buttons" id="loginBtnHeader">
                <i class="fas fa-user" onclick="openAuthModal()"></i>
            </div>
            <div class="auth-buttons-logged-in" id="myAccountBtn" style="display:none;" onclick="openAccountModal()">
                 </div>
        </div>
    </header>

    <div id="searchBox" style="display: none; padding: 10px 20px; background: var(--card-bg); border-bottom: 1px solid #ddd;">
        <input type="text" id="searchInput" onkeyup="searchProducts()" placeholder="Search products..." style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid var(--text-color); background: var(--bg-color); color: var(--text-color);">
    </div>

    <main>
        <h2 id="productsTitle">All Products</h2>
        <div class="product-grid" id="productsContainer">
            </div>
    </main>

    <footer>
        <p>&copy; 2024 Fashion Lab. All rights reserved.</p>
        <div class="language-switch">
             <select id="langSelect" onchange="switchLang(this.value)">
                <option value="my">မြန်မာ</option>
                <option value="en">English</option>
            </select>
            <div class="dark-mode-switch">
                <label class="switch">
                    <input type="checkbox" id="darkModeSwitch" onchange="toggleDarkMode()">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
    </footer>


    <div class="modal" id="authModal">
        <div class="modal-content auth-modal">
            <span class="close-btn" onclick="closeModal('authModal')">&times;</span>

            <div class="auth-section" id="loginForm">
                <h3 data-t="login_h3">Login</h3>
                <div class="input-group"><label data-t="email_label">Email</label><input type="email" id="lEmail" placeholder="example@mail.com"></div>
                <button class="order-btn active" id="loginBtn" onclick="sendMagicLink('login')" data-t="login_btn">Send Magic Link</button>
                <p class="switch-auth" onclick="showAuthForm('register')" data-t="register_link">Create new account</p>
            </div>

            <div class="auth-section" id="registerForm" style="display:none;">
                <h3 data-t="register_h3">Create Account</h3>
                <div class="input-group"><label data-t="name_label">Name</label><input type="text" id="rName"></div>
                <div class="input-group"><label data-t="email_label">Email</label><input type="email" id="rEmail" placeholder="example@mail.com"></div>
                <button class="order-btn active" id="sendMagicLinkBtn" onclick="sendMagicLink('register')" data-t="register_btn">Send Magic Link</button>
                <p class="switch-auth" onclick="showAuthForm('login')" data-t="login_link">Already have an account? Login</p>
            </div>
        </div>
    </div>


    <div class="modal" id="productModal">
        <div class="modal-content product-modal">
            <span class="close-btn" onclick="closeModal('productModal')">&times;</span>
            <img id="productModalImage" src="" alt="Product Image">
            <h3 id="productModalName"></h3>
            <p id="productModalDesc"></p>
            <p class="price" id="productModalPrice"></p>
            <div class="input-group">
                <label data-t="size_label">Select Size</label>
                <select id="productSizeSelect"></select>
            </div>
            <button class="order-btn active" onclick="addToCart()" data-t="add_to_cart">Add to Cart</button>
        </div>
    </div>

    <div class="modal" id="cartModal">
        <div class="modal-content cart-modal">
            <span class="close-btn" onclick="closeModal('cartModal')">&times;</span>
            <h3 data-t="cart_h3">Your Cart</h3>
            <div id="cartItemsContainer">
                </div>
            <div class="cart-footer">
                <p data-t="total">Total:</p>
                <p id="cartTotal" class="total-price">0 MMK</p>
                <button class="order-btn inactive" id="cartOrderBtn" onclick="openOrderModal()" data-t="order_btn">Place Order</button>
            </div>
        </div>
    </div>

    <div class="modal" id="orderModal">
        <div class="modal-content order-modal">
            <span class="close-btn" onclick="closeModal('orderModal')">&times;</span>
            <h3 data-t="order_h3">Place Order</h3>
            <div class="user-info-group">
                 <h4 data-t="del_info_h3">Delivery Information</h4>
                 <div class="input-group">
                    <label data-t="name_label">Full Name (အမည်)</label>
                    <input type="text" id="nameInput">
                 </div>
                <div class="input-group">
                    <label data-t="del_label">Delivery Address (ပို့ဆောင်ရန်လိပ်စာ)</label>
                    <textarea id="addressInput" rows="3"></textarea>
                </div>
                <div class="input-group">
                    <label data-t="contact_label">Contact Phone (ဆက်သွယ်ရန်ဖုန်း)</label>
                    <input type="tel" id="contactPhoneInput" placeholder="09xxxxxxxxx">
                </div>
                <div class="input-group">
                    <label data-t="note_label">Note (အကြောင်းအရာ)</label>
                    <input type="text" id="noteInput" placeholder="Note">
                </div>
            </div>

            <div class="input-group"><label data-t="slip_label">Payment Slip (ပြေစာ)</label><input type="file" id="slipInput" onchange="checkSlipFile()"></div>
            <button class="order-btn inactive" id="sendBtn" onclick="sendOrder()" disabled data-t="send_btn">Admin ထံသို့ ပို့မည်</button>
        </div>
    </div>

    <div class="modal" id="successModal">
        <div class="modal-content" style="text-align:center;">
            <i class="fas fa-check-circle" style="font-size:50px; color:#4CAF50; margin-bottom:10px;"></i>
            <h3 data-t="order_sent_h3">👾 Order sent!</h3>
            <p data-t="order_sent_p">Payment successful, delivery will be made soon.🎉</p>
            <button class="order-btn active" onclick="closeModal('successModal')" data-t="ok_btn">OK</button>
        </div>
    </div>
    
    <div class="modal" id="accountModal">
        <div class="modal-content account-modal">
            <span class="close-btn" onclick="closeModal('accountModal')">&times;</span>
            <h3 data-t="my_account">My Account</h3>
            
            <h4>Profile Information</h4>
            <div class="input-group"><label data-t="name_label">Name</label><input type="text" id="profileName"></div>
            <div class="input-group"><label>Email</label><input type="email" id="profileEmail" disabled></div>
            <div class="input-group"><label>Address</label><textarea id="profileAddress" rows="2"></textarea></div>
            <div class="input-group"><label>Phone</label><input type="tel" id="profilePhone"></div>
            <button class="order-btn active" id="saveProfileBtn" onclick="saveProfile()">Save Profile</button>
            <hr style="margin: 20px 0;">

            <h4 data-t="order_history">Order History</h4>
            <div id="historyItemsContainer">
                </div>
            <hr style="margin: 20px 0;">

            <button class="order-btn inactive" style="background-color: #f44336; margin-top: 10px;" onclick="logout()" data-t="logout">Logout</button>
        </div>
    </div>
    
    <div id="snackbar">Some text message..</div>

    <script src="scriptOOO.js"></script>
</body>
</html>
