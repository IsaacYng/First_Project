import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. फायरबेस कन्फिगरेसन
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// २. लगइन अवस्था चेक गर्ने (Authentication State)
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const adminSec = document.getElementById('admin-section');
    
    if (user) {
        loginSec.style.display = 'none';
        adminSec.style.display = 'block';
        updateGreeting();
        loadProfile(user.uid);
        loadStockData();
    } else {
        loginSec.style.display = 'flex';
        adminSec.style.display = 'none';
    }
});

// ३. लगइन र पासवर्ड रिसेट लजिक
document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Error: " + e.message));
};

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

document.getElementById('forgotPassBtn').onclick = (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    if(!email) return alert("Please enter your email first!");
    sendPasswordResetEmail(auth, email).then(() => alert("Password reset link sent to your email!")).catch(e => alert(e.message));
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

// ४. प्रोफाइल व्यवस्थापन (Profile Management)
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('dispName').innerText = data.bio ? data.bio.split(' ')[0] : "Admin";
        document.getElementById('pBio').value = data.bio || "";
        document.getElementById('pContact').value = data.contact || "";
        document.getElementById('pRole').value = data.role || "";
    }
}

document.getElementById('updateProfileBtn').onclick = async () => {
    const user = auth.currentUser;
    const profileData = {
        bio: document.getElementById('pBio').value,
        contact: document.getElementById('pContact').value,
        role: document.getElementById('pRole').value,
        updatedAt: new Date()
    };
    await setDoc(doc(db, "profiles", user.uid), profileData);
    alert("Profile Updated!");
    loadProfile(user.uid);
};

// ५. मूल्य र इन्स्योरेन्स सेटअप (Price Setup)
document.getElementById('saveModelBtn').onclick = async () => {
    const data = {
        name: document.getElementById('mName').value,
        price: Number(document.getElementById('mPrice').value),
        normalIns: Number(document.getElementById('mNormalIns').value),
        financeIns: Number(document.getElementById('mFinanceIns').value),
        img: document.getElementById('mImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png"
    };
    if(!data.name || !data.price) return alert("Model Name and Price are required!");
    await addDoc(collection(db, "bikes"), data);
    alert("Model Price Added!");
    ['mName', 'mPrice', 'mNormalIns', 'mFinanceIns', 'mImg'].forEach(id => document.getElementById(id).value = "");
};

// ६. स्टक इन्ट्री लजिक (Stock Entry)
let availableModels = [];
onSnapshot(collection(db, "bikes"), (snap) => {
    availableModels = snap.docs.map(d => ({id: d.id, ...d.data()}));
    const select = document.getElementById('stockModelSelect');
    select.innerHTML = '<option value="">-- Select Model --</option>';
    availableModels.forEach(m => {
        select.innerHTML += `<option value="${m.name}">${m.name}</option>`;
    });
});

document.getElementById('saveStockBtn').onclick = async () => {
    const modelName = document.getElementById('stockModelSelect').value;
    const modelInfo = availableModels.find(m => m.name === modelName);
    
    if(!modelName || !document.getElementById('sChassis').value) return alert("Fill Model and Chassis!");

    const stockData = {
        model: modelName,
        price: modelInfo.price,
        financeIns: modelInfo.financeIns,
        chassis: document.getElementById('sChassis').value,
        engine: document.getElementById('sEngine').value,
        reg: document.getElementById('sReg').value,
        color: document.getElementById('sColor').value,
        status: "In Stock",
        addedAt: new Date()
    };
    await addDoc(collection(db, "bike_stock"), stockData);
    alert("Bike added to Live Stock!");
    ['sChassis', 'sEngine', 'sReg', 'sColor'].forEach(id => document.getElementById(id).value = "");
};

// ७. स्टक टेबल लोड गर्ने
function loadStockData() {
    onSnapshot(collection(db, "bike_stock"), (snap) => {
        const tableBody = document.getElementById('stockTableBody');
        tableBody.innerHTML = snap.docs.map(d => {
            const s = d.data();
            return `
                <tr>
                    <td><strong>${s.model}</strong></td>
                    <td style="font-family:monospace">${s.chassis}</td>
                    <td>Rs. ${s.financeIns}</td>
                    <td>
                        <button onclick="deleteStockRecord('${d.id}')" style="color:red; border:none; background:none; cursor:pointer;"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>`;
        }).join('');
    });
}

// डिलिट फङ्सन (Global scope मा राख्न window प्रयोग गरिएको)
window.deleteStockRecord = (id) => {
    if(confirm("Are you sure you want to remove this bike from stock?")) {
        deleteDoc(doc(db, "bike_stock", id));
    }
};

// ८. स्मार्ट ग्रिटिङ (Greeting Logic)
function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    document.getElementById('greetingText').innerText = `${greeting}, Ishak!`;
    document.getElementById('currentDate').innerText = new Date().toDateString();
}
