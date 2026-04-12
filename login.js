import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentEditId = null; // Edit मोडको लागि ID ट्र्याक गर्न
let allMasterBikes = []; // मास्टर प्राइस स्टोर गर्न

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadProfile(user.uid);
        loadMasterPriceList();
        loadLiveStock();
    } else {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }
});

// --- १. MASTER PRICE SETUP (EDIT सहित) ---
function loadMasterPriceList() {
    onSnapshot(collection(db, "bikes"), (snap) => {
        allMasterBikes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const tableBody = document.getElementById('masterTableBody');
        const select = document.getElementById('stockModelSelect');
        
        let rows = "";
        let options = '<option value="">-- Select Model --</option>';

        allMasterBikes.forEach(b => {
            rows += `
                <tr>
                    <td><img src="${b.img || 'favicon.png'}" class="master-img-view" style="width:40px; border-radius:4px;"></td>
                    <td><b>${b.name}</b></td>
                    <td>Rs. ${Number(b.price).toLocaleString()}</td>
                    <td>Rs. ${Number(b.Insurance || 0).toLocaleString()}</td>
                    <td>Rs. ${Number(b.financeInsurance || 0).toLocaleString()}</td>
                    <td>
                        <button onclick="editMaster('${b.id}')" style="color:blue; background:none; border:none; cursor:pointer; margin-right:10px;"><i class="fa fa-edit"></i></button>
                        <button onclick="deleteEntry('bikes', '${b.id}')" style="color:red; background:none; border:none; cursor:pointer;"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>`;
            options += `<option value="${b.name}">${b.name}</option>`;
        });
        tableBody.innerHTML = rows;
        select.innerHTML = options;
    });
}

// मास्टर डाटालाई एडिट मोडमा ल्याउने
window.editMaster = (id) => {
    const bike = allMasterBikes.find(b => b.id === id);
    if(bike) {
        document.getElementById('mName').value = bike.name;
        document.getElementById('mPrice').value = bike.price;
        document.getElementById('mNormalIns').value = bike.Insurance || 0;
        document.getElementById('mFinanceIns').value = bike.financeInsurance || 0;
        document.getElementById('mImg').value = bike.img || "";
        currentEditId = id;
        document.getElementById('saveModelBtn').innerText = "Update Model";
        switchTab('tab-price'); // ट्याबमा लैजाने
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

    if(currentEditId) {
        await updateDoc(doc(db, "bikes", currentEditId), data);
        currentEditId = null;
        document.getElementById('saveModelBtn').innerText = "Save to Master List";
    } else {
        await addDoc(collection(db, "bikes"), data);
    }
    alert("Data Processed!");
    clearMasterForm();
};

function clearMasterForm() {
    ['mName', 'mPrice', 'mNormalIns', 'mFinanceIns', 'mImg'].forEach(id => document.getElementById(id).value = "");
}

// --- २. LIVE STOCK (AUTO PRICE LOGIC) ---

// मोडल छान्ने बित्तिकै प्राइस आफैँ सेट हुने
document.getElementById('stockModelSelect').onchange = (e) => {
    const selectedModel = e.target.value;
    const bikeData = allMasterBikes.find(b => b.name === selectedModel);
    // तपाईँको HTML मा "Live Stock" ट्याब भित्र प्राइस देखाउने वा लुकेको इनपुट छ भने यहाँ हाल्न सकिन्छ।
    // तत्कालको लागि सेभ गर्दा हामी सिधै मास्टर लिस्टबाट प्राइस लिन्छौँ।
};

document.getElementById('saveStockBtn').onclick = async () => {
    const modelName = document.getElementById('stockModelSelect').value;
    const bikeInfo = allMasterBikes.find(b => b.name === modelName);
    
    if(!modelName || !bikeInfo) return alert("Please select a valid model!");

    await addDoc(collection(db, "inventory"), {
        model: modelName,
        price: bikeInfo.price, // मास्टर डाटाबाट अटोमेटिक प्राइस लियो
        regNo: document.getElementById('sRegNo').value,
        chassis: document.getElementById('sChassis').value,
        engine: document.getElementById('sEngine').value,
        color: document.getElementById('sColor').value,
        addedAt: new Date()
    });
    alert("Stock Added with Auto-Price!");
};

function loadLiveStock() {
    onSnapshot(collection(db, "inventory"), (snap) => {
        const tableBody = document.getElementById('stockTableBody');
        let rows = "";
        snap.docs.forEach(d => {
            const s = d.data();
            rows += `
                <tr>
                    <td>${s.model}</td>
                    <td>Rs. ${Number(s.price).toLocaleString()}</td>
                    <td>${s.chassis}</td>
                    <td>${s.engine}</td>
                    <td>${s.regNo}</td>
                    <td>${s.color}</td>
                    <td>
                        <button onclick="deleteEntry('inventory', '${d.id}')" style="color:red; background:none; border:none; cursor:pointer;"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = rows;
    });
}

// --- ३. GLOBAL FUNCTIONS ---
window.deleteEntry = async (col, id) => {
    if(confirm("Delete this?")) await deleteDoc(doc(db, col, id));
};

// Profile, Login, Logout (तपाईँको अघिल्लो कोड जस्तै)
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    if (docSnap.exists()) {
        const d = docSnap.data();
        document.getElementById('dispName').innerText = d.name || "Admin";
        document.getElementById('pNameInput').value = d.name || "";
        document.getElementById('dispRole').innerText = d.role || "Sales Advisor";
    }
}
document.getElementById('logoutBtn').onclick = () => signOut(auth);
document.getElementById('loginBtn').onclick = () => {
    signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('pass').value).catch(alert);
};
