// --- CONFIG (သင့် scriptOOO.js ထဲကအတိုင်း ကူးထည့်ပါ) ---
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; // <--- ဤနေရာကို သင့် URL အမှန်ဖြင့် အစားထိုးပါ
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; // <--- ဤနေရာကို သင့် Key အမှန်ဖြင့် အစားထိုးပါ
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// * ADMIN PHONE SECURITY CHECK *
const MY_ADMIN_PHONE = '959xxxxxxxxx'; // <-- ဤနေရာတွင် သင့် Admin ဖုန်းနံပါတ်အမှန် (နိုင်ငံကုဒ်ပါ) ထည့်ပါ

async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    
    // ၁. Login မဝင်ထားရင် မောင်းထုတ်မယ်
    if (!session) {
        alert("Please login first!");
        window.location.href = 'indexOOO.html'; // <--- သင့် main file name အမှန် (indexOOO.html) ဖြင့် ပြင်ဆင်ပါ
        return;
    }
    
    // ၂. Admin ဖုန်းနံပါတ် ဟုတ်မဟုတ် စစ်မယ်
    const userPhone = session.user.phone;
    if (userPhone !== MY_ADMIN_PHONE) {
        alert("You are not authorized to view this page!");
        await supabase.auth.signOut(); // လုံခြုံရေးအတွက် မဟုတ်တဲ့သူကို ထုတ်
        window.location.href = 'indexOOO.html'; // <--- သင့် main file name အမှန် (indexOOO.html) ဖြင့် ပြင်ဆင်ပါ
        return;
    }
}

window.onload = function() {
    checkAdmin();
    loadOrders();
    loadAdminProducts();
};

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(id + '-section').classList.add('active');
    
    // Highlight menu
    if(id === 'orders') document.querySelector('.menu-item:nth-child(2)').classList.add('active');
    else document.querySelector('.menu-item:nth-child(3)').classList.add('active');
}

// ... (ကျန်တဲ့ loadOrders, updateStatus, loadAdminProducts, saveProduct, deleteProduct, adminLogout functions များ အောက်မှာ ဆက်ပါမယ်) ...
