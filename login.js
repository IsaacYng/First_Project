import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. फायरबेस कन्फिगरेसन (तपाईँकै प्रोजेक्टको)
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// २. लगइन अवस्था चेक गर्ने र डाटा लोड गर्ने
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadProfile(user.uid);
        syncEverything(); // मोडेल र स्टक लोड गर्न
    } else {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }
});

// ३. लगइन लजिक (ईमेल/गुगल र पासवर्ड रिसेट)
document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(!email || !pass) return alert("Email र Password भर्नुहोस्।");
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Error: " + e.message));
};

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

document.getElementById('forgotPassBtn').onclick = (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    if(!email) return alert("Password रिसेट गर्न पहिले ईमेल लेख्नुहोस्।");
    sendPasswordResetEmail(auth, email).then(() => alert("Password reset link ईमेलमा पठाइयो।")).catch(e => alert(e.message));
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

// ४. प्रोफाइल र नाम व्यवस्थापन (Fix)
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
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
        updateGreeting("Admin");
    }
}

document.getElementById('updateProfileBtn').onclick = async () => {
    const user = auth.currentUser;
    const profileData = {
        name: document.getElementById('pNameInput').value,
        bio: document.getElementById('pBio').value,
        contact: document.getElementById('pContact').value,
        role: document.getElementById('pRole').value,
        updatedAt: new Date()
    };
    await setDoc(doc(db, "profiles", user.uid), profileData);
    alert("Profile Update भयो!");
    loadProfile(user.uid);
};

// ५. मूल्य र इन्स्योरेन्स (Master Price List)
document.getElementById('saveModelBtn').onclick = async () => {
    const data = {
        name: document.getElementById('mName').value,
        price: Number(document.getElementById('mPrice').value),
        normalIns: Number(document.getElementById('mNormalIns').value),
        financeIns: Number(document.getElementById('mFinanceIns').value),
        img: document.getElementById('mImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png",
        // पुरानो सिस्टमसँग मिलाउन (Compatibility)
        Price: Number(document.getElementById('mPrice').value),
        Insurance: Number(document.getElementById('mNormalIns').value)
    };
    
    if(!data.name || !data.price) return alert("Model Name र Price अनिवार्य छ।");
    await addDoc(collection(db, "bikes"), data);
    alert("नयाँ मूल्य सूचीमा थपियो!");
};

// ६. स्टक र मोडेल सिङ्क्रोनाइजेसन (पुरानो डाटा तान्ने मुख्य भाग)
let allModels = [];
function syncEverything() {
    // पुरानो र नयाँ दुवै मोडेल तान्ने
    onSnapshot(collection(db, "bikes"), (snap) => {
        allModels = snap.docs.map(d => ({id: d.id, ...d.data()}));
        const select = document.getElementById('stockModelSelect');
        select.innerHTML = '<option value="">-- Select Model --</option>';
        
        allModels.forEach(m => {
            // यदि डाटाबेसमा 'Name' छ भने त्यो लिने, नत्र 'name' लिने
            const mName = m.name || m.Name || "Unknown Model";
            select.innerHTML += `<option value="${mName}">${mName}</option>`;
        });
    });

    // स्टक लिस्ट टेबलमा देखाउने
    onSnapshot(collection(db, "bike_stock"), (snap) => {
        const tableBody = document.getElementById('stockTableBody');
        tableBody.innerHTML = snap.docs.map(d => {
            const s = d.data();
            return `
                <tr>
                    <td><strong>${s.model}</strong></td>
                    <td style="font-family:monospace">${s.chassis}</td>
                    <td>${s.engine || '-'}</td>
                    <td><span style="color:green">In Stock</span></td>
                    <td>
                        <button onclick="delStock('${d.id}')" style="color:red; border:none; background:none; cursor:pointer;"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>`;
        }).join('');
    });
}

// ७. स्टक सेभ गर्ने
document.getElementById('saveStockBtn').onclick = async () => {
    const modelName = document.getElementById('stockModelSelect').value;
    const modelInfo = allModels.find(m => (m.name || m.Name) === modelName);
    
    if(!modelName || !document.getElementById('sChassis').value) return alert("Model र Chassis No भर्नुहोस्।");

    const stockObj = {
        model: modelName,
        price: modelInfo.price || modelInfo.Price,
        financeIns: modelInfo.financeIns || 0,
        chassis: document.getElementById('sChassis').value,
        engine: document.getElementById('sEngine').value,
        color: document.getElementById('sColor').value,
        addedAt: new Date()
    };
    await addDoc(collection(db, "bike_stock"), stockObj);
    alert("बाइक स्टकमा थपियो!");
};

// ग्लोबल डिलिट फङ्सन
window.delStock = (id) => {
    if(confirm("के तपाईँ यो बाइक स्टकबाट हटाउन चाहनुहुन्छ?")) {
        deleteDoc(doc(db, "bike_stock", id));
    }
};

// ८. ग्रिटिङ (Greeting Logic)
function updateGreeting(name) {
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    document.getElementById('greetingText').innerText = `${greet}, ${name}!`;
    document.getElementById('currentDate').innerText = new Date().toDateString();
    }
            
