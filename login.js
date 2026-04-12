import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Check
onAuthStateChanged(auth, u => {
    if(u) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadProfile(u.uid);
    } else {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }
});

// Login/Logout
document.getElementById('loginBtn').onclick = () => {
    signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('pass').value).catch(e => alert(e.message));
};
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// 1. Save Model
document.getElementById('saveModelBtn').onclick = async () => {
    const data = {
        name: document.getElementById('mName').value,
        price: Number(document.getElementById('mPrice').value),
        normalIns: Number(document.getElementById('mNormalIns').value),
        financeIns: Number(document.getElementById('mFinanceIns').value),
        img: document.getElementById('mImg').value
    };
    await addDoc(collection(db, "bikes"), data);
    alert("Model Updated!");
};

// 2. Load Models for Stock
let allModels = [];
onSnapshot(collection(db, "bikes"), snap => {
    allModels = snap.docs.map(d => d.data());
    const select = document.getElementById('stockModelSelect');
    select.innerHTML = '<option value="">-- Select Model --</option>';
    allModels.forEach(m => select.innerHTML += `<option value="${m.name}">${m.name}</option>`);
});

// 3. Save Stock
document.getElementById('saveStockBtn').onclick = async () => {
    const modelName = document.getElementById('stockModelSelect').value;
    const model = allModels.find(m => m.name === modelName);
    const stockData = {
        model: modelName,
        price: model.price,
        financeIns: model.financeIns,
        chassis: document.getElementById('sChassis').value,
        engine: document.getElementById('sEngine').value,
        reg: document.getElementById('sReg').value,
        color: document.getElementById('sColor').value
    };
    await addDoc(collection(db, "bike_stock"), stockData);
    alert("Bike Added to Stock!");
};

// 4. Load Stock Table
onSnapshot(collection(db, "bike_stock"), snap => {
    document.getElementById('stockTableBody').innerHTML = snap.docs.map(d => `
        <tr>
            <td>${d.data().model}</td>
            <td>${d.data().chassis}</td>
            <td><button onclick="deleteStock('${d.id}')" style="color:red; border:none; background:none; cursor:pointer;">Delete</button></td>
        </tr>
    `).join('');
});

// 5. Profile Logic
async function loadProfile(uid) {
    const d = await getDoc(doc(db, "profiles", uid));
    if(d.exists()) {
        document.getElementById('profileDisplay').innerHTML = `<h4>Bio: ${d.data().bio}</h4><p>Post: ${d.data().post}</p>`;
    }
}

document.getElementById('updateProfileBtn').onclick = async () => {
    const user = auth.currentUser;
    await setDoc(doc(db, "profiles", user.uid), {
        bio: document.getElementById('pBio').value,
        post: document.getElementById('pPost').value
    });
    alert("Profile Updated!");
    loadProfile(user.uid);
};
            
