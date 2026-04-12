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

// २. लगइन अवस्था र डाटा लोड
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadProfile(user.uid);
        syncModelsAndStock(); // पुरानो र नयाँ डाटा सँगै लोड गर्न
    } else {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }
});

// ३. लगइन लजिक
document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(!email || !pass) return alert("Please enter email and password");
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

document.getElementById('forgotPassBtn').onclick = (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    if(!email) return alert("Enter your email to reset password!");
    sendPasswordResetEmail(auth, email).then(() => alert("Reset link sent to email!")).catch(e => alert(e.message));
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

// ४. प्रोफाइल व्यवस्थापन (नाम र बायो फिक्स)
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    const userEmail = auth.currentUser.email;
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        const userName = data.name || "Admin";
        document.getElementById('dispName').innerText = userName;
        document.getElementById('headerUserName').innerText = userName;
        document.getElementById('pNameInput').value = userName;
        document.getElementById('pBio').value = data.bio || "";
        document.getElementById('pContact').value = data.contact || "";
        document.getElementById('pRole').value = data.role || "";
        updateGreeting(userName);
    } else {
        document.getElementById('dispName').innerText = "Admin";
        updateGreeting("Admin");
    }
}

document.getElementById('updateProfileBtn').onclick = async () => {
    const user = auth.currentUser;
    const nameValue = document.getElementById('pNameInput').value || "Admin";
    const profileData = {
        name: nameValue,
        bio: document.getElementById('pBio').value,
        contact: document.getElementById('pContact').value,
        role: document.getElementById('pRole').value,
        updatedAt: new Date()
    };
    await setDoc(doc(db, "profiles", user.uid), profileData);
    alert("Profile Successfully Updated!");
    loadProfile(user.uid); // पेज रिफ्रेस नगरी नाम अपडेट गर्न
};

// ५. मूल्य र इन्स्योरेन्स (पुरानो Index सँग मिल्ने गरी)
document.getElementById('saveModelBtn').onclick = async () => {
    const data = {
        name: document.getElementById('mName').value,
        price: Number(document.getElementById('mPrice').value), // पुरानाे Index मा 'price' सानाे अक्षरमा थियाे भने
        normalIns: Number(document.getElementById('mNormalIns').value),
        financeIns: Number(document.getElementById('mFinanceIns').value),
        img: document.getElementById('mImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png"
    };
    if(!data.name || !data.price) return alert("Model Name and Price are mandatory!");
    await addDoc(collection(db, "bikes"), data);
    alert("New Model Added to Price List!");
};

// ६. स्टक र मोडेल सिङ्क्रोनाइजेसन
let allModels = [];
function syncModelsAndStock() {
    // मोडेलहरू ड्रपडाउनमा लोड गर्ने
    onSnapshot(collection(db, "bikes"), (snap) => {
        allModels = snap.docs.map(d => ({id: d.id, ...d.data()}));
        const select = document.getElementById('stockModelSelect');
        select.innerHTML = '<option value="">-- Select Master Model --</option>';
        allModels.forEach(m => {
            select.innerHTML += `<option value="${m.name}">${m.name}</option>`;
        });
    });

    // स्टक लिस्ट लोड गर्ने
    onSnapshot(collection(db, "bike_stock"), (snap) => {
        document.getElementById('stockTableBody').innerHTML = snap.docs.map(d => {
            const s = d.data();
            return `
                <tr>
                    <td><strong>${s.model}</strong></td>
                    <td style="font-family:monospace; font-size:12px;">${s.chassis}</td>
                    <td>${s.engine || '-'}</td>
                    <td><span style="color:green; font-weight:bold;">${s.status || 'In Stock'}</span></td>
                    <td>
                        <button onclick="delStock('${d.id}')" style="color:var(--danger); border:none; background:none; cursor:pointer;"><i class="fa fa-trash-can"></i></button>
                    </td>
                </tr>`;
        }).join('');
    });
}

// ७. नयाँ स्टक सेभ गर्ने
document.getElementById('saveStockBtn').onclick = async () => {
    const modelName = document.getElementById('stockModelSelect').value;
    const chassis = document.getElementById('sChassis').value;
    const modelInfo = allModels.find(m => m.name === modelName);
    
    if(!modelName || !chassis) return alert("Model and Chassis are required!");

    const stockObj = {
        model: modelName,
        price: modelInfo.price,
        financeIns: modelInfo.financeIns,
        chassis: chassis,
        engine: document.getElementById('sEngine').value,
        color: document.getElementById('sColor').value,
        status: "In Stock",
        addedAt: new Date()
    };
    
    try {
        await addDoc(collection(db, "bike_stock"), stockObj);
        alert("Bike added to Inventory!");
        ['sChassis', 'sEngine', 'sColor'].forEach(id => document.getElementById(id).value = "");
    } catch(e) { alert(e.message); }
};

// डिलिट फङ्सन
window.delStock = (id) => {
    if(confirm("Confirm deletion from live stock?")) {
        deleteDoc(doc(db, "bike_stock", id));
    }
};

// ८. स्मार्ट ग्रिटिङ र समय
function updateGreeting(name) {
    const hour = new Date().getHours();
    let greet = "Good Evening";
    if(hour < 12) greet = "Good Morning";
    else if(hour < 17) greet = "Good Afternoon";
    
    document.getElementById('greetingText').innerText = `${greet}, ${name}!`;
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
