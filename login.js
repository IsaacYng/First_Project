import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. Authentication State Observer
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const adminSec = document.getElementById('admin-section');
    if (user) {
        if(loginSec) loginSec.style.display = 'none';
        if(adminSec) adminSec.style.display = 'block';
        loadProfile(user.uid);
        loadInventory();
        loadModelDropdown();
    } else {
        if(loginSec) loginSec.style.display = 'flex';
        if(adminSec) adminSec.style.display = 'none';
    }
});

// 2. Profile Management
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    if (docSnap.exists()) {
        const d = docSnap.data();
        document.getElementById('dispName').innerText = d.name || "Admin";
        document.getElementById('headerUserName').innerText = d.name || "Admin";
        document.getElementById('pNameInput').value = d.name || "";
        document.getElementById('pBio').value = d.bio || "";
    }
}

document.getElementById('updateProfileBtn').onclick = async () => {
    const user = auth.currentUser;
    if(!user) return;
    const data = {
        name: document.getElementById('pNameInput').value,
        bio: document.getElementById('pBio').value,
        updatedAt: new Date()
    };
    await setDoc(doc(db, "profiles", user.uid), data);
    alert("Profile updated successfully!");
    loadProfile(user.uid);
};

// 3. Inventory & Master Records (Old Data Fix)
function loadInventory() {
    const stockTable = document.getElementById('stockTableBody');
    if(!stockTable) return;

    // Fetching from 'bikes' collection where old records are stored
    onSnapshot(collection(db, "bikes"), (snap) => {
        let html = "";
        snap.docs.forEach(d => {
            const b = d.data();
            const bikeName = b.name || b.Name || "Unnamed Model";
            const bikePrice = b.price || b.Price || "N/A";
            
            html += `
                <tr>
                    <td><b style="color:#215282">${bikeName}</b></td>
                    <td>${b.chassis || 'MASTER RECORD'}</td>
                    <td>${b.engine || 'N/A'}</td>
                    <td><span class="status-badge" style="background:#e8f0fe; color:#215282;">Live</span></td>
                    <td>
                        <button onclick="deleteEntry('bikes', '${d.id}')" style="border:none; background:none; color:red; cursor:pointer; font-size:18px;">
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>`;
        });
        stockTable.innerHTML = html;
    });
}

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

// 4. Global Delete Function
window.deleteEntry = async (col, id) => {
    if(confirm("Are you sure you want to delete this record permanently?")) {
        try {
            await deleteDoc(doc(db, col, id));
            alert("Record deleted successfully!");
        } catch(e) {
            alert("Error: " + e.message);
        }
    }
};

// 5. Login & Logout Logic
const loginBtn = document.getElementById('loginBtn');
if(loginBtn) {
    loginBtn.onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if(!email || !pass) return alert("Please enter Email and Password.");
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Login Failed: " + e.message));
    };
}

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => alert("Logged out successfully."));
    };
}

// 6. Save New Master Model
const saveModelBtn = document.getElementById('saveModelBtn');
if(saveModelBtn) {
    saveModelBtn.onclick = async () => {
        const name = document.getElementById('mName').value;
        const price = document.getElementById('mPrice').value;
        if(!name || !price) return alert("Model Name and Price are required!");
        
        try {
            await addDoc(collection(db, "bikes"), {
                name: name,
                price: Number(price),
                Insurance: Number(document.getElementById('mNormalIns').value) || 0,
                addedAt: new Date()
            });
            alert("New model added to Master List!");
            document.getElementById('mName').value = "";
            document.getElementById('mPrice').value = "";
        } catch(e) {
            alert("Error: " + e.message);
        }
    };
}
  
