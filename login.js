import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. तपाईँकै फायरबेस कन्फिग
const firebaseConfig = {
  apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain: "first-project-2082-12-26.firebaseapp.com",
  projectId: "first-project-2082-12-26",
  storageBucket: "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// २. लगइन र ड्यासबोर्ड स्विच गर्ने
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    
    if (user) {
        if(loginSection) loginSection.style.display = 'none';
        if(adminSection) adminSection.style.display = 'block';
        showAllBikesToDelete(); // सबै लुकेका डाटा देखाउने फङ्सन
    } else {
        if(loginSection) loginSection.style.display = 'flex';
        if(adminSection) adminSection.style.display = 'none';
    }
});

// ३. लगइन लजिक
window.emailLogin = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("गलत ईमेल वा पासवर्ड!"));
};

document.getElementById('loginBtn').onclick = window.emailLogin;

document.getElementById('googleBtn').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => alert(e.message));
};

window.logout = () => signOut(auth);
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.onclick = window.logout;

// ४. मुख्य भाग: 'bikes' कलेक्सनका पुराना सबै डाटा टेबलमा देखाउने
function showAllBikesToDelete() {
    const tableBody = document.getElementById('stockTableBody');
    if(!tableBody) return;

    onSnapshot(collection(db, "bikes"), (snapshot) => {
        let html = "";
        snapshot.docs.forEach(d => {
            const b = d.data();
            // जुनसुकै नाममा डाटा भए पनि तान्ने (price, Price, name, Name)
            const bikeName = b.name || b.Name || "Unknown Model";
            const bikePrice = b.price || b.Price || "No Price";
            
            html += `
                <tr>
                    <td style="color: #215282; font-weight: bold;">
                        <i class="fa fa-motorcycle"></i> ${bikeName}
                    </td>
                    <td>${bikePrice}</td>
                    <td><span class="status-badge" style="background:#fff3cd; color:#856404;">Existing Data</span></td>
                    <td>
                        <button onclick="deleteBikeNow('${d.id}')" style="background:none; border:none; color:red; cursor:pointer; font-size:18px;">
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    });
}

// ५. डिलिट गर्ने फङ्सन
window.deleteBikeNow = async (id) => {
    if(confirm("के तपाईँ यो डाटा सधैँका लागि हटाउन चाहनुहुन्छ?")) {
        try {
            await deleteDoc(doc(db, "bikes", id));
            alert("डाटा हटाइयो!");
        } catch(e) {
            alert("Error: " + e.message);
        }
    }
};

// ६. नयाँ डाटा थप्ने लजिक (Price Setup)
const saveModelBtn = document.getElementById('saveModelBtn');
if(saveModelBtn) {
    saveModelBtn.onclick = async () => {
        const name = document.getElementById('mName').value;
        const price = document.getElementById('mPrice').value;
        const ins = document.getElementById('mNormalIns').value;

        if(!name || !price) return alert("नाम र मूल्य अनिवार्य छ!");

        await addDoc(collection(db, "bikes"), {
            name: name,
            price: Number(price),
            Insurance: Number(ins) || 0,
            addedAt: new Date()
        });
        alert("नयाँ डाटा थपियो!");
    };
                   }
        
