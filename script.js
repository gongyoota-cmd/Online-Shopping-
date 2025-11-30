// CONFIG
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// Custom domain used for Supabase Auth 
const AUTH_DOMAIN = '@kshop.com'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
// currentUser now stores the profile data fetched from the 'users' table
let currentUser = null; 
let selectedProduct = null; 
// Variable to hold the Email during login process (ဖုန်းနံပါတ်အစား email ကို သုံးလိုက်ပါပြီ)
let currentAuthEmail = null; 

// ==========================================================
// 🔑 AUTHENTICATION LOGIC (Magic Link) - [အသစ်ထည့်သွင်းခြင်း]
// ==========================================================

async function fetchCurrentUser(userId) {
    // Supabase ရဲ့ "users" table ကနေ လက်ရှိ User ရဲ့ Profile ကိုယူပါတယ်
    const { data, error } = await supabase
        .from('users') 
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user profile:', error.message);
        currentUser = null;
    } else {
        currentUser = data;
        // User Login ဝင်ပြီးကြောင်း UI ကိုပြောင်းပါ
        document.getElementById('authIcon').classList.add('logged-in'); 
        document.getElementById('logoutBtn').style.display = 'block'; 
        showSnackbar(`Login ဝင်ပြီးပါပြီရှင်: ${currentUser.name || currentUser.email}`);
        // Login ဝင်ပြီးတာနဲ့ Modal ကို ပိတ်ပါ
        closeModal('loginModal'); 
    }
}

async function checkLoginState() {
    // Page စဖွင့်တာနဲ့ Session ရှိမရှိ စစ်ဆေးပါတယ်
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        await fetchCurrentUser(session.user.id);
    } else {
        currentUser = null;
        document.getElementById('authIcon').classList.remove('logged-in'); 
        document.getElementById('logoutBtn').style.display = 'none'; 
    }
}

supabase.auth.onAuthStateChange((event, session) => {
    // Login ဝင်တာ/ထွက်တာ ပြောင်းလဲရင် ဒီကနေ သိပါတယ်
    if (event === 'SIGNED_IN' && session) {
        fetchCurrentUser(session.user.id);
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        showSnackbar('Logout လုပ်ပြီးပါပြီရှင်။');
        document.getElementById('authIcon').classList.remove('logged-in'); 
        document.getElementById('logoutBtn').style.display = 'none';
    }
});


// ✉️ Magic Link ပို့တဲ့ Function (ဖုန်း OTP ကို အစားထိုးလိုက်ပါပြီ)
async function sendMagicLink() {
    const email = document.getElementById('emailInput').value.trim();
    if (!email) {
        showSnackbar('Email လိပ်စာ ထည့်ပေးပါဦးနော်။');
        return;
    }

    currentAuthEmail = email; 
    showSnackbar('Magic Link ကို Email ထဲကို ပို့နေပါပြီ... 💌 စိတ်ရှည်ရှည်နဲ့ စောင့်ပါနော်။');

    const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            // Login အောင်မြင်ရင် ဒီလိပ်စာကို ပြန်သွားမယ်လို့ သတ်မှတ်လိုက်တာပါ
            emailRedirectTo: window.location.origin 
        }
    });

    if (error) {
        console.error('Magic Link Error:', error.message);
        showSnackbar(`ပို့ဆောင်မှု မအောင်မြင်ပါဘူးရှင်: ${error.message}`);
    } else {
        showSnackbar(`Email ထဲကို Magic Link ပို့ပြီးပါပြီရှင်။ Email ကို ချက်ချင်း စစ်ကြည့်လိုက်ပါနော်!`);
        // Magic link နဲ့ ဝင်ပြီးရင်တော့ Session ကို အလိုအလျောက် handle လုပ်ပါလိမ့်မယ်။
    }
}

// 🚪 Logout Function
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout Error:', error.message);
        showSnackbar('Logout လုပ်ရာမှာ အခက်အခဲရှိပါတယ်ရှင်။');
    } else {
        // onAuthStateChange ကနေ Signed_Out ကို handle လုပ်ပါလိမ့်မယ်။
        closeModal('loginModal');
    }
}


// ==========================================================
// 🛒 PRODUCT & ORDER LOGIC (မူလအတိုင်း ထားရှိသည်)
// ==========================================================

async function loadProducts(category, title, gender) { /* ... original content ... */ }
function loadProductDetail(product) { /* ... original content ... */ }
function addToCart(product) { /* ... original content ... */ }
function renderOrderSummary() { /* ... original content ... */ }
function checkSlipFile() { /* ... original content ... */ }
async function sendOrder() { /* ... original content ... */ }
function showSnackbar(msg) { /* ... original content ... */ }
function showModal(id) { document.getElementById(id).style.display='flex'; }
function closeModal(id) { document.getElementById(id).style.display='none'; }
function toggleMenu() { /* ... original content ... */ }
function toggleDarkMode() { /* ... original content ... */ }
function toggleSearch() { /* ... original content ... */ }
function searchProducts() { /* ... original content ... */ }
function switchTab(t) { /* ... original content ... */ }
function changeLanguage(lang) { /* ... original content ... */ }
function translateUI() { /* ... original content ... */ }


// ==========================================================
// ⚙️ INITIALIZATION (မူလအတိုင်း ထားရှိသည်)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts('all', 'All Products', 'women');
    checkLoginState(); // 🔑 Login Session ကို စစ်ဆေးခြင်း
});
