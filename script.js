// CONFIG
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// Custom domain is not directly used for email auth, but kept for context.
// NOTE: Ensure Email Auth is enabled in the Supabase project settings.
const AUTH_DOMAIN = '@kshop.com'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
// currentUser now stores the profile data fetched from the 'users' table
let currentUser = null; 
let selectedProduct = null; 
// Variable to hold the email during verification flow (Modified from phone)
let currentEmail = null; 
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentLang = localStorage.getItem('lang') || 'my';
const translations = {
    // ... (translations data remains the same) ...
    en: {
        shop_cat: "FASHION CATEGORIES", all: "All Products", clothing: "Clothing", shoes: "Shoes", bags: "Bags", history: "Order History", settings: "Settings", logout: "Logout",
        auth_h3: "Login / Register", email_label: "Email", login_btn: "Login with OTP", otp_sent_to: "OTP Code sent to your email", otp_code: "OTP Code (6 digits)", verify_btn: "Verify OTP",
        name_label: "Name", register_btn: "Register and Send OTP",
        cart_h3: "🛒 Your Cart", total_h4: "Total:", checkout_btn: "Checkout",
        checkout_h3: "📦 Checkout", delivery_label: "Delivery Address", contact_label: "Contact Phone", note_label: "Note", slip_label: "Payment Slip", send_btn: "Send to Admin",
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK",
        dark_mode: "Dark Mode", language_setting: "Language", profile_h3: "My Profile", chat_h3: "Chat with Admin",
        add_to_cart: "Add to Cart", size_label: "Size", color_label: "Color",
    },
    my: {
        shop_cat: "ဖက်ရှင် အမျိုးအစားများ", all: "ကုန်ပစ္စည်းအားလုံး", clothing: "အဝတ်အထည်", shoes: "ဖိနပ်", bags: "အိတ်", history: "မှာယူမှုမှတ်တမ်း", settings: "ပြင်ဆင်မှုများ", logout: "ထွက်ရန်",
        auth_h3: "ဝင်ရောက်ရန် / အကောင့်ဖွင့်ရန်", email_label: "အီးမေးလ်", login_btn: "OTP ဖြင့် ဝင်ရန်", otp_sent_to: "OTP Code ကို အီးမေးလ်ထဲသို့ ပို့လိုက်ပါပြီ", otp_code: "OTP Code (ဂဏန်း ၆ လုံး)", verify_btn: "OTP စစ်ဆေးရန်",
        name_label: "နာမည်", register_btn: "အကောင့်ဖွင့်ပြီး OTP ပို့ရန်",
        cart_h3: "🛒 ခြင်းတောင်း", total_h4: "စုစုပေါင်း:", checkout_btn: "ငွေရှင်းရန်",
        checkout_h3: "📦 ငွေရှင်းခြင်း", delivery_label: "ပို့ဆောင်ရန်လိပ်စာ", contact_label: "ဆက်သွယ်ရန်ဖုန်း", note_label: "အကြောင်းအရာ", slip_label: "ငွေလွှဲပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်",
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်ပါပြီ", order_sent_p: "ငွေပေးချေမှု အောင်မြင်ပြီး၊ မကြာမီ ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "ရပါပြီ",
        dark_mode: "အမှောင် Mode", language_setting: "ဘာသာစကား", profile_h3: "ကျွန်ုပ်၏ ပရိုဖိုင်", chat_h3: "Admin နှင့် စကားပြောရန်",
        add_to_cart: "ခြင်းတောင်းထဲ ထည့်မည်", size_label: "အရွယ်အစား", color_label: "အရောင်",
    },
    th: {
        shop_cat: "หมวดหมู่แฟชั่น", all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", bags: "กระเป๋า", history: "ประวัติการสั่งซื้อ", settings: "การตั้งค่า", logout: "ออกจากระบบ",
        auth_h3: "เข้าสู่ระบบ / ลงทะเบียน", email_label: "อีเมล", login_btn: "เข้าสู่ระบบด้วย OTP", otp_sent_to: "รหัส OTP ถูกส่งไปที่อีเมลของคุณแล้ว", otp_code: "รหัส OTP (6 หลัก)", verify_btn: "ยืนยัน OTP",
        name_label: "ชื่อ", register_btn: "ลงทะเบียนและส่ง OTP",
        cart_h3: "🛒 ตะกร้าของคุณ", total_h4: "รวม:", checkout_btn: "ชำระเงิน",
        checkout_h3: "📦 ชำระเงิน", delivery_label: "ที่อยู่จัดส่ง", contact_label: "เบอร์ติดต่อ", note_label: "หมายเหตุ", slip_label: "สลิปการชำระเงิน", send_btn: "ส่งถึงแอดมิน",
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินสำเร็จแล้ว จะดำเนินการจัดส่งเร็วๆ นี้🎉", ok_btn: "ตกลง",
        dark_mode: "โหมดมืด", language_setting: "ภาษา", profile_h3: "โปรไฟล์ของฉัน", chat_h3: "แชทกับแอดมิน",
        add_to_cart: "เพิ่มลงตะกร้า", size_label: "ขนาด", color_label: "สี",
    }
};

// ... (Other functions like toggleMenu, showModal, closeModal, searchProducts, etc. remain the same) ...

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('verifyOtpLogin').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('verifyOtpRegister').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('verifyOtpLogin').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('verifyOtpRegister').style.display = 'none';
}

// Input checks modified for EMAIL
function checkLoginInputs() {
    const email = document.getElementById('lEmail').value.trim();
    document.getElementById('loginBtn').disabled = !email.includes('@');
}
function checkVerifyLInputs() {
    const otp = document.getElementById('lOTP').value.trim();
    document.getElementById('verifyLBtn').disabled = otp.length !== 6;
}
function checkRegisterInputs() {
    const name = document.getElementById('rName').value.trim();
    const email = document.getElementById('rEmail').value.trim();
    document.getElementById('registerBtn').disabled = !(name.length > 0 && email.includes('@'));
}
function checkVerifyRInputs() {
    const otp = document.getElementById('rOTP').value.trim();
    document.getElementById('verifyRBtn').disabled = otp.length !== 6;
}

// *** AUTHENTICATION FUNCTIONS MODIFIED FOR EMAIL OTP ***

async function sendOtp(type) {
    // 1. Get the correct email input ID based on 'login' or 'register'
    let inputId = type === 'login' ? 'lEmail' : 'rEmail';
    let email = document.getElementById(inputId).value.trim();

    if (!email || !email.includes('@')) {
        showSnackbar(translations[currentLang].my === 'my' ? 'Email လိပ်စာ မှန်ကန်စွာ ထည့်သွင်းပေးပါ' : 'Please enter a valid email address', 'error');
        return;
    }

    // Save the email globally for the verification step
    currentEmail = email; 

    // Disable button to prevent multiple clicks
    document.getElementById(type === 'login' ? 'loginBtn' : 'registerBtn').disabled = true;

    try {
        // Use Supabase signInWithOtp with the 'email' option
        // The 'options: { data: { channel: 'email' } }' tells Supabase to send a numeric token (OTP) instead of a magic link.
        const { error: otpError } = await supabase.auth.signInWithOtp({ 
            email: email,
            options: {
                data: { channel: 'email' } // KEY for Email Token (OTP) flow
            }
        });

        if (otpError) {
            throw new Error(otpError.message);
        }

        showSnackbar(translations[currentLang].otp_sent_to, 'success');
        
        // Hide Step 1 (Email/Register form) and show Step 2 (OTP verification)
        document.getElementById(type === 'login' ? 'loginForm' : 'registerForm').style.display = 'none';
        document.getElementById(type === 'login' ? 'verifyOtpLogin' : 'verifyOtpRegister').style.display = 'block';

    } catch (error) {
        console.error('OTP Send Error:', error);
        showSnackbar(translations[currentLang].my === 'my' ? 'OTP ပို့ရာတွင် အမှားရှိပါသည်: ' + error.message : 'OTP Send Error: ' + error.message, 'error');
        // Re-enable button on error
        document.getElementById(type === 'login' ? 'loginBtn' : 'registerBtn').disabled = false;
    }
}

async function verifyOtp(type) {
    let otpId = type === 'login' ? 'lOTP' : 'rOTP';
    let otp = document.getElementById(otpId).value.trim();
    const emailToVerify = currentEmail; 
    let verifyBtn = document.getElementById(type === 'login' ? 'verifyLBtn' : 'verifyRBtn');

    if (!otp || otp.length !== 6) {
        showSnackbar(translations[currentLang].my === 'my' ? 'OTP နံပါတ် (၆ လုံး) ဖြည့်ပေးပါ' : 'Please enter the 6-digit OTP code', 'error');
        return;
    }
    
    if (!emailToVerify) {
        showSnackbar(translations[currentLang].my === 'my' ? 'Email ကို အရင်ထည့်သွင်းပေးပါ' : 'Please enter the email first', 'error');
        return;
    }

    verifyBtn.disabled = true;

    try {
        // Use Supabase verifyOtp with the 'email' type and token (OTP code)
        const { data, error } = await supabase.auth.verifyOtp({
            email: emailToVerify,
            token: otp, // OTP is passed as the token
            type: 'email' // Important: Specify 'email' type for token verification
        });

        if (error) {
            throw new Error(error.message);
        }
        
        // Successful Login/Verification
        showSnackbar(translations[currentLang].my === 'my' ? 'Successfully Logged In!' : 'Login Successful!', 'success');
        
        // If it was a Register flow, create the user profile
        if (type === 'register') {
            const name = document.getElementById('rName').value.trim();
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: data.user.id, name: name, email: emailToVerify }])
                .single();
            
            if (insertError) {
                console.error("User profile creation failed:", insertError);
            }
        }
        
        // Final Steps after Auth
        closeModal('authModal');
        await fetchUserData(); 
        
    } catch (error) {
        console.error('OTP Verify Error:', error);
        showSnackbar(translations[currentLang].my === 'my' ? 'OTP မှားနေပါတယ်၊ ပြန်စစ်ဆေးပါ: ' + error.message : 'OTP Verification Failed: ' + error.message, 'error');
        verifyBtn.disabled = false;
    }
}

// ... (Other functions like checkAuthAndOpenProfile, logout, fetchUserData, etc. remain the same, 
// but they rely on the user session being set by the modified verifyOtp function) ...

// ... (The rest of the script is unchanged: fetchUserData, fetchUserOrders, loadProducts, 
// showProductDetail, addToCart, renderCart, checkout, sendOrder, checkSlipFile, 
// checkAuthStatus, toggleDarkMode, setLanguage, loadLanguagePreference, translatePage, 
// chat functions, snackbar function, etc. ) ...

// ... (Ensure fetchUserData is updated to get the email from the user object if necessary, 
// but Supabase user session should handle this after successful auth) ...

async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Fetch profile data from 'users' table
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            currentUser = { ...profile, email: user.email }; // Add email from auth object
            document.querySelector('.nav-icons i.fa-user').style.color = 'var(--accent-color)';
        } else {
            console.error("User profile not found in DB:", error);
            currentUser = { id: user.id, name: 'Guest', email: user.email };
            document.querySelector('.nav-icons i.fa-user').style.color = 'var(--accent-color)';
        }
    } else {
        currentUser = null;
        document.querySelector('.nav-icons i.fa-user').style.color = 'var(--text-color)';
    }
    // Re-render cart/UI if necessary
    renderCart();
    fetchUserOrders();
}

// ... (Rest of the original functions) ...

function logout() {
    supabase.auth.signOut();
    currentUser = null;
    cart = [];
    localStorage.removeItem('cart');
    document.querySelector('.nav-icons i.fa-user').style.color = 'var(--text-color)';
    renderCart();
    closeModal('profileModal');
    showLoginForm();
    showSnackbar(translations[currentLang].my === 'my' ? 'Log out အောင်မြင်ပါသည်။' : 'Logged out successfully.', 'success');
}
