import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. फायरबेस सेटअप
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// २. लगइन अवस्था चेक गर्ने (एउटै पेजमा तल-माथि गर्ने)
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const adminSec = document.getElementById('admin-section');

    if (user) {
        if(loginSec) loginSec.style.display = 'none';
        if(adminSec) adminSec.style.display = 'block';
        loadAllMyData(); // डाटाहरू लोड गर्ने
    } else {
        if(loginSec) loginSec.style.display = 'flex';
        if(adminSec) adminSec.style.display = 'none';
    }
});

// ३. लगइन लजिक
window.emailLogin = () => {
    const email = document.getElementById('loginEmail')?.value || document.getElementById('email')?.value;
    const pass = document.getElementById('loginPass')?.value || document.getElementById('pass')?.value;
    if(!email || !pass) return alert("Email र Password भर्नुहोस्।");
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

window.logout = () => signOut(auth);
// logoutBtn को लागि पनि
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.onclick = () => signOut(auth);

// ४. पुराना र नयाँ सबै डाटा टेबलमा देखाउने (Delete गर्नका लागि)
function loadAllMyData() {
    const tableBody = document.getElementById('stockTableBody') || document.getElementById('dataTableBody');
    
    if(!tableBody) return;

    // 'bikes' कलेक्सन चेक गर्ने (जहाँ पुराना डाटाहरू लुकेका छन्)
    onSnapshot(collection(db, "bikes"), (snap) => {
        let rows = "";
        snap.docs.forEach(d => {
            const data = d.data();
            // Price (P ठूलो) वा price (p सानो) दुवै चेक गर्ने
            const price = data.price || data.Price || "0";
            const name = data.name || data.Name || "Unknown";
            
            rows += `
                <tr>
                    <td style="color:red; font-weight:bold;">OLD DATA</td>
                    <td>${name}</td>
                    <td>Rs. ${price}</td>
                    <td>
                        <button onclick="finalDelete('bikes', '${d.id}')" style="border:none; background:none; color:red; cursor:pointer; font-size:20px;">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = rows;
    });
}

// ५. डिलिट फङ्सन
window.finalDelete = async (col, id) => {
    if(confirm("के तपाईँ यो डाटा सधैँका लागि हटाउन चाहनुहुन्छ?")) {
        await deleteDoc(doc(db, col, id));
        alert("हटाइयो!");
    }
};

// ६. नयाँ डाटा थप्ने
const saveBtn = document.getElementById('saveModelBtn');
if(saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('mName').value;
        const price = document.getElementById('mPrice').value;
        if(!name || !price) return alert("Data भर्नुहोस्");
        
        await addDoc(collection(db, "bikes"), {
            name: name,
            price: Number(price),
            addedAt: new Date()
        });
        alert("थपियो!");
    };
        }
                          
