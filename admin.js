// --- CONFIG (သင့် script.js ထဲကအတိုင်း ပြန်ကူးထည့်ပါ) ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'; 
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login စစ်ဆေးခြင်း (ရိုးရှင်းသောနည်းလမ်း)
// တကယ်တမ်း Production မှာ Supabase Auth RLS နဲ့ သေချာလုပ်သင့်ပါတယ်
async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("Please login first!");
        window.location.href = 'index.html'; // Login မဝင်ထားရင် user page ကို ပြန်မောင်းမယ်
    }
    // ဒီနေရာမှာ သင့် Email ဟုတ်မဟုတ် စစ်နိုင်ပါတယ် (Optional)
    // if(session.user.email !== 'your_admin_email@gmail.com') { ... }
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

// --- ORDERS FUNCTIONS ---
async function loadOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error(error);
    const tbody = document.getElementById('orderTableBody');
    document.getElementById('loadingOrders').style.display = 'none';
    tbody.innerHTML = '';

    data.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString();
        // Status အရောင်ခွဲခြားခြင်း
        let statusColor = '#333';
        if(order.status === 'pending') statusColor = 'orange';
        if(order.status === 'coming') statusColor = 'blue';
        if(order.status === 'owned') statusColor = 'green';
        if(order.status === 'reject') statusColor = 'red';

        tbody.innerHTML += `
            <tr>
                <td>${date}</td>
                <td>${order.customer_name}<br><small>${order.customer_phone}</small><br><small>${order.address}</small></td>
                <td>${order.item_name}<br><b>${order.price}</b></td>
                <td style="color:${statusColor}; font-weight:bold;">${order.status.toUpperCase()}</td>
                <td>
                    <select class="status-select" onchange="updateStatus(${order.id}, this.value)">
                        <option value="pending" ${order.status=='pending'?'selected':''}>Pending</option>
                        <option value="coming" ${order.status=='coming'?'selected':''}>Coming</option>
                        <option value="owned" ${order.status=='owned'?'selected':''}>Owned (Done)</option>
                        <option value="reject" ${order.status=='reject'?'selected':''}>Reject</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

async function updateStatus(orderId, newStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    
    if (error) alert("Error updating status");
    else {
        alert("Order updated!");
        loadOrders(); // Refresh table
    }
}

// --- PRODUCTS FUNCTIONS ---
async function loadAdminProducts() {
    const { data, error } = await supabase.from('products').select('*').order('id', {ascending: false});
    const grid = document.getElementById('adminProductList');
    grid.innerHTML = '';
    data.forEach(p => {
        grid.innerHTML += `
            <div class="admin-p-card">
                <img src="${p.image_url || 'https://via.placeholder.com/150'}">
                <div style="font-weight:bold; margin-top:5px;">${p.name}</div>
                <div>${p.price} Ks</div>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        `;
    });
}

// Open/Close Modal
function openProductModal() { document.getElementById('productModal').style.display = 'flex'; }
function closeProductModal() { document.getElementById('productModal').style.display = 'none'; }

async function saveProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const img = document.getElementById('pImg').value;
    const cat = document.getElementById('pCategory').value;
    const gender = document.getElementById('pGender').value;
    const desc = document.getElementById('pDesc').value;

    if(!name || !price) return alert("Name and Price are required!");

    const { error } = await supabase.from('products').insert([
        { name: name, price: price, image_url: img, category: cat, gender: gender, description: desc }
    ]);

    if(error) {
        alert("Error: " + error.message);
    } else {
        alert("Product Added!");
        closeProductModal();
        loadAdminProducts();
        // Clear inputs
        document.getElementById('pName').value = '';
        document.getElementById('pPrice').value = '';
    }
}

async function deleteProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if(!error) loadAdminProducts();
    }
}

async function adminLogout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}
