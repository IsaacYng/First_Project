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

// २. Auth State Observer
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const adminSec = document.getElementById('admin-section');
    if (user) {
        if(loginSec) loginSec.style.display = 'none';
        if(adminSec) adminSec.style.display = 'block';
        loadProfile(user.uid);
        loadMasterPriceList(); 
        loadLiveStock();       
        loadModelDropdown();   
    } else {
        if(loginSec) loginSec.style.display = 'flex';
        if(adminSec) adminSec.style.display = 'none';
    }
});

// ३. Profile Management (Facebook Style Menu Logic)
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
    await setDoc(doc(db, "profiles", user.uid), {
        name: document.getElementById('pNameInput').value,
        bio: document.getElementById('pBio').value,
        role: document.getElementById('pRole').value
    });
    alert("Profile Updated!");
    loadProfile(user.uid);
};

// ४. Master Price List (With Image Preview in Table)
function loadMasterPriceList() {
    onSnapshot(collection(db, "bikes"), (snap) => {
        const tableBody = document.getElementById('masterTableBody');
        let rows = "";
        snap.docs.forEach(d => {
            const b = d.data();
            rows += `
                <tr>
                    <td><img src="${b.img || 'favicon.png'}" class="master-img-view" onerror="this.src='https://cdn-icons-png.flaticon.com/512/8163/8163149.png'"></td>
                    <td><b>${b.name || 'Unknown'}</b></td>
                    <td>Rs. ${Number(b.price || 0).toLocaleString()}</td>
                    <td>Rs. ${Number(b.Insurance || 0).toLocaleString()}</td>
                    <td>Rs. ${Number(b.financeInsurance || 0).toLocaleString()}</td>
                    <td>
                        <button onclick="deleteEntry('bikes', '${d.id}')" style="border:none; background:none; color:red; cursor:pointer;">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = rows;
    });
}

// ५. Live Stock (With Registration Number)
function loadLiveStock() {
    onSnapshot(collection(db, "inventory"), (snap) => {
        const tableBody = document.getElementById('stockTableBody');
        let rows = "";
        snap.docs.forEach(d => {
            const s = d.data();
            rows += `
                <tr>
                    <td>${s.model}</td>
                    <td>Rs. ${Number(s.price || 0).toLocaleString()}</td>
                    <td>${s.chassis}</td>
                    <td>${s.engine}</td>
                    <td style="color:var(--primary); font-weight:bold;">${s.regNo || 'N/A'}</td>
                    <td>${s.color}</td>
                    <td>
                        <button onclick="deleteEntry('inventory', '${d.id}')" style="border:none; background:none; color:red; cursor:pointer;">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = rows;
    });
}

// ६. Dropdown Models for Stock
function loadModelDropdown() {
    onSnapshot(collection(db, "bikes"), (snap) => {
        const select = document.getElementById('stockModelSelect');
        select.innerHTML = '<option value="">-- Select Model --</option>';
        snap.docs.forEach(d => {
            const name = d.data().name;
            select.innerHTML += `<option value="${name}">${name}</option>`;
        });
    });
}

// ७. Save Data Functions
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
    alert("Master Model Added!");
    // Reset fields
    document.getElementById('mName').value = "";
    document.getElementById('mPrice').value = "";
    document.getElementById('mImg').value = "";
};

document.getElementById('saveStockBtn').onclick = async () => {
    const model = document.getElementById('stockModelSelect').value;
    const regNo = document.getElementById('sRegNo').value;
    const chassis = document.getElementById('sChassis').value;

    if(!model || !chassis) return alert("Select Model and Enter Chassis!");

    // Master list बाट यो मोडलको मूल्य पत्ता लगाउने (ऐच्छिक तर राम्रो)
    await addDoc(collection(db, "inventory"), {
        model: model,
        regNo: regNo,
        chassis: chassis,
        engine: document.getElementById('sEngine').value,
        color: document.getElementById('sColor').value,
        addedAt: new Date()
    });
    alert("Stock Entry Saved!");
};

// ८. Global Delete & Auth Actions
window.deleteEntry = async (col, id) => {
    if(confirm("Are you sure?")) {
        await deleteDoc(doc(db, col, id));
    }
};

document.getElementById('loginBtn').onclick = () => {
    signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('pass').value)
    .catch(e => alert(e.message));
};

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);
document.getElementById('menuLogout').onclick = (e) => { e.preventDefault(); signOut(auth); };
    
