import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// २. Auth State Observer (Login/Logout Switch)
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const adminSec = document.getElementById('admin-section');
    if (user) {
        if(loginSec) loginSec.style.display = 'none';
        if(adminSec) adminSec.style.display = 'block';
        loadProfile(user.uid);
        loadMasterPriceList(); // Price Setup को टेबल भर्ने
        loadLiveStock();       // Live Stock को टेबल भर्ने
        loadModelDropdown();   // Dropdown भर्ने
    } else {
        if(loginSec) loginSec.style.display = 'flex';
        if(adminSec) adminSec.style.display = 'none';
    }
});

// ३. Profile Management (Fix)
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    if (docSnap.exists()) {
        const d = docSnap.data();
        document.getElementById('dispName').innerText = d.name || "Admin";
        document.getElementById('headerUserName').innerText = d.name || "Admin";
        document.getElementById('dispRole').innerText = d.role || "Sales Advisor";
        document.getElementById('pNameInput').value = d.name || "";
        document.getElementById('pBio').value = d.bio || "";
        document.getElementById('pRole').value = d.role || "";
    }
}

document.getElementById('updateProfileBtn').onclick = async () => {
    const user = auth.currentUser;
    if(!user) return;
    const data = {
        name: document.getElementById('pNameInput').value,
        bio: document.getElementById('pBio').value,
        role: document.getElementById('pRole').value,
        updatedAt: new Date()
    };
    try {
        await setDoc(doc(db, "profiles", user.uid), data);
        alert("Profile updated successfully!");
        loadProfile(user.uid);
    } catch(e) { alert("Error: " + e.message); }
};

// ४. Price Setup (Master Price Table)
function loadMasterPriceList() {
    const masterTable = document.getElementById('masterTableBody');
    if(!masterTable) return;

    onSnapshot(collection(db, "bikes"), (snap) => {
        let html = "";
        snap.docs.forEach(d => {
            const b = d.data();
            // Checking all possible field names from your history (price, Price, name, Name)
            const bName = b.name || b.Name || "Unknown";
            const bPrice = b.price || b.Price || 0;
            const bIns = b.Insurance || b.insurance || 0;
            const bFins = b.financeInsurance || 0;

            html += `
                <tr>
                    <td><b>${bName}</b></td>
                    <td>Rs. ${Number(bPrice).toLocaleString()}</td>
                    <td>Rs. ${Number(bIns).toLocaleString()}</td>
                    <td>Rs. ${Number(bFins).toLocaleString()}</td>
                    <td>
                        <button onclick="deleteEntry('bikes', '${d.id}')" style="border:none; background:none; color:red; cursor:pointer;">
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>`;
        });
        masterTable.innerHTML = html;
    });
}

// ५. Live Stock Management
function loadLiveStock() {
    const stockTable = document.getElementById('stockTableBody');
    if(!stockTable) return;

    onSnapshot(collection(db, "inventory"), (snap) => {
        let html = "";
        snap.docs.forEach(d => {
            const s = d.data();
            html += `
                <tr>
                    <td>${s.model}</td>
                    <td>${s.chassis}</td>
                    <td>${s.engine}</td>
                    <td>${s.color}</td>
                    <td>
                        <button onclick="deleteEntry('inventory', '${d.id}')" style="border:none; background:none; color:red; cursor:pointer;">
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>`;
        });
        stockTable.innerHTML = html;
    });
}

// ६. Dropdown Models
function loadModelDropdown() {
    const select = document.getElementById('stockModelSelect');
    if(!select) return;
    onSnapshot(collection(db, "bikes"), (snap) => {
        select.innerHTML = '<option value="">-- Select Model --</option>';
        snap.docs.forEach(d => {
            const name = d.data().name || d.data().Name;
            select.innerHTML += `<option value="${name}">${name}</option>`;
        });
    });
}

// ७. Global Delete Function
window.deleteEntry = async (col, id) => {
    if(confirm("Are you sure you want to delete this record?")) {
        try {
            await deleteDoc(doc(db, col, id));
            alert("Deleted successfully!");
        } catch(e) { alert("Error: " + e.message); }
    }
};

// ८. Form Submissions
document.getElementById('saveModelBtn').onclick = async () => {
    const name = document.getElementById('mName').value;
    const price = document.getElementById('mPrice').value;
    if(!name || !price) return alert("Please fill Name and Price!");

    await addDoc(collection(db, "bikes"), {
        name: name,
        price: Number(price),
        Insurance: Number(document.getElementById('mNormalIns').value) || 0,
        financeInsurance: Number(document.getElementById('mFinanceIns').value) || 0,
        img: document.getElementById('mImg').value || "",
        addedAt: new Date()
    });
    alert("Master price list updated!");
    // Clear inputs
    document.getElementById('mName').value = "";
    document.getElementById('mPrice').value = "";
};

document.getElementById('saveStockBtn').onclick = async () => {
    const model = document.getElementById('stockModelSelect').value;
    const chassis = document.getElementById('sChassis').value;
    if(!model || !chassis) return alert("Please select model and enter chassis!");

    await addDoc(collection(db, "inventory"), {
        model: model,
        chassis: chassis,
        engine: document.getElementById('sEngine').value,
        color: document.getElementById('sColor').value,
        addedAt: new Date()
    });
    alert("Stock entry confirmed!");
};

// ९. Login/Logout Actions
document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Login Error: " + e.message));
};

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

document.getElementById('logoutBtn').onclick = () => {
    signOut(auth).then(() => alert("Logged out!"));
};
