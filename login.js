import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentEditId = null;
let allMasterBikes = [];

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'flex';
        document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        loadProfile(user.uid);
        loadMasterPriceList();
        loadLiveStock();
    } else {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }
});

// --- 1. MASTER PRICE SETUP ---
function loadMasterPriceList() {
    onSnapshot(collection(db, "bikes"), (snap) => {
        allMasterBikes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const tableBody = document.getElementById('masterTableBody');
        const select = document.getElementById('stockModelSelect');
        
        let rows = "";
        let options = '<option value="">-- Select Model --</option>';

        allMasterBikes.forEach(b => {
            rows += `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <img src="${b.img || 'favicon.png'}" class="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-sm">
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${b.name}</td>
                    <td class="px-6 py-4">Rs. ${Number(b.price).toLocaleString()}</td>
                    <td class="px-6 py-4">Rs. ${Number(b.Insurance || 0).toLocaleString()}</td>
                    <td class="px-6 py-4">Rs. ${Number(b.financeInsurance || 0).toLocaleString()}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                        <button onclick="editMaster('${b.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button onclick="deleteEntry('bikes', '${b.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            options += `<option value="${b.name}">${b.name}</option>`;
        });
        tableBody.innerHTML = rows;
        select.innerHTML = options;
    });
}

window.editMaster = (id) => {
    const bike = allMasterBikes.find(b => b.id === id);
    if(bike) {
        document.getElementById('mName').value = bike.name;
        document.getElementById('mPrice').value = bike.price;
        document.getElementById('mNormalIns').value = bike.Insurance || 0;
        document.getElementById('mFinanceIns').value = bike.financeInsurance || 0;
        document.getElementById('mImg').value = bike.img || "";
        currentEditId = id;
        
        const btn = document.getElementById('saveModelBtn');
        btn.innerText = "Update Model Info";
        btn.classList.replace('bg-slate-800', 'bg-blue-600');
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

document.getElementById('saveModelBtn').onclick = async () => {
    const data = {
        name: document.getElementById('mName').value,
        price: Number(document.getElementById('mPrice').value),
        Insurance: Number(document.getElementById('mNormalIns').value) || 0,
        financeInsurance: Number(document.getElementById('mFinanceIns').value) || 0,
        img: document.getElementById('mImg').value
    };

    try {
        if(currentEditId) {
            await updateDoc(doc(db, "bikes", currentEditId), data);
            currentEditId = null;
            const btn = document.getElementById('saveModelBtn');
            btn.innerText = "Save to Master List";
            btn.classList.replace('bg-blue-600', 'bg-slate-800');
        } else {
            await addDoc(collection(db, "bikes"), data);
        }
        clearMasterForm();
    } catch (e) { alert("Error: " + e.message); }
};

function clearMasterForm() {
    ['mName', 'mPrice', 'mNormalIns', 'mFinanceIns', 'mImg'].forEach(id => document.getElementById(id).value = "");
}

// --- 2. LIVE STOCK ---
document.getElementById('saveStockBtn').onclick = async () => {
    const modelName = document.getElementById('stockModelSelect').value;
    const bikeInfo = allMasterBikes.find(b => b.name === modelName);
    
    if(!modelName || !bikeInfo) return alert("Please select a valid model!");

    await addDoc(collection(db, "inventory"), {
        model: modelName,
        price: bikeInfo.price,
        regNo: document.getElementById('sRegNo').value,
        chassis: document.getElementById('sChassis').value,
        engine: document.getElementById('sEngine').value,
        color: document.getElementById('sColor').value,
        addedAt: new Date()
    });
    
    // Clear stock form
    ['sRegNo', 'sChassis', 'sEngine', 'sColor'].forEach(id => document.getElementById(id).value = "");
    document.getElementById('stockModelSelect').value = "";
};

function loadLiveStock() {
    onSnapshot(collection(db, "inventory"), (snap) => {
        const tableBody = document.getElementById('stockTableBody');
        let rows = "";
        snap.docs.forEach(d => {
            const s = d.data();
            rows += `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">${s.model}</td>
                    <td class="px-6 py-4 text-emerald-600 font-semibold">Rs. ${Number(s.price).toLocaleString()}</td>
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">${s.chassis}</td>
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">${s.engine}</td>
                    <td class="px-6 py-4 font-semibold text-blue-600">${s.regNo || 'N/A'}</td>
                    <td class="px-6 py-4 text-gray-600">${s.color}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="deleteEntry('inventory', '${d.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = rows;
    });
}

// --- 3. GLOBAL FUNCTIONS ---
window.deleteEntry = async (col, id) => {
    if(confirm("Are you sure you want to delete this entry?")) {
        await deleteDoc(doc(db, col, id));
    }
};

async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    const headerName = document.getElementById('headerUserName');
    if (docSnap.exists()) {
        const d = docSnap.data();
        headerName.innerText = d.name || "Admin User";
    } else {
        headerName.innerText = "Administrator";
    }
}

document.getElementById('logoutBtn').onclick = () => signOut(auth);

document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};
