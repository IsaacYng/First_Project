import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
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

// १. लगइन अवस्था
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadProfile(user.uid);
        loadAllData(); // सबै डाटा लोड गर्ने
    } else {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }
});

// २. लगइन/आउट लजिक
document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// ३. सबै डाटा लोड गर्ने (यसले पुराना डाटाहरू टेबलमा देखाउँछ)
function loadAllData() {
    // मास्टर प्राइस लिस्ट (Bikes Collection)
    onSnapshot(collection(db, "bikes"), (snap) => {
        const tableBody = document.getElementById('stockTableBody');
        // नोट: यदि तपाईँको HTML मा एउटै टेबल छ भने यहाँ 'bikes' को डाटा पनि थपिनेछ
        let html = "";
        snap.docs.forEach(d => {
            const data = d.data();
            const name = data.name || data.Name || "Unknown";
            const price = data.price || data.Price || 0;
            html += `
                <tr>
                    <td><img src="${data.img || data.Image || ''}" width="40" style="border-radius:5px;"></td>
                    <td><strong>${name}</strong> (Master)</td>
                    <td>Rs. ${price}</td>
                    <td><span style="color:blue">Master List</span></td>
                    <td>
                        <button onclick="deleteData('bikes', '${d.id}')" style="color:red; border:none; background:none; cursor:pointer; font-size:18px;">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
        
        // अब 'bike_stock' को डाटा पनि यसैमा मिसाउने (यदि छ भने)
        onSnapshot(collection(db, "bike_stock"), (stockSnap) => {
            let stockHtml = html; // पहिलेको मास्टर लिस्टमा स्टक थप्ने
            stockSnap.docs.forEach(sd => {
                const s = sd.data();
                stockHtml += `
                    <tr>
                        <td><i class="fa fa-motorcycle" style="font-size:24px; color:#666;"></i></td>
                        <td><strong>${s.model}</strong></td>
                        <td>Chassis: ${s.chassis}</td>
                        <td><span style="color:green">In Stock</span></td>
                        <td>
                            <button onclick="deleteData('bike_stock', '${sd.id}')" style="color:red; border:none; background:none; cursor:pointer; font-size:18px;">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>`;
            });
            tableBody.innerHTML = stockHtml;
        });
    });

    // स्टक इन्ट्रीको लागि ड्रपडाउन अपडेट
    onSnapshot(collection(db, "bikes"), (snap) => {
        const select = document.getElementById('stockModelSelect');
        select.innerHTML = '<option value="">-- Select Model --</option>';
        snap.docs.forEach(d => {
            const name = d.data().name || d.data().Name;
            select.innerHTML += `<option value="${name}">${name}</option>`;
        });
    });
}

// ४. डिलिट फङ्सन (जुनसुकै कलेक्सनबाट हटाउन मिल्ने)
window.deleteData = async (collectionName, id) => {
    if(confirm("के तपाईँ यो डाटा सधैँका लागि हटाउन चाहनुहुन्छ?")) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert("डाटा हटाइयो!");
        } catch(e) { alert("Error: " + e.message); }
    }
};

// ५. नयाँ मोडेल थप्ने (Price Setup)
document.getElementById('saveModelBtn').onclick = async () => {
    const data = {
        name: document.getElementById('mName').value,
        price: Number(document.getElementById('mPrice').value),
        normalIns: Number(document.getElementById('mNormalIns').value),
        financeIns: Number(document.getElementById('mFinanceIns').value),
        img: document.getElementById('mImg').value,
        addedAt: new Date()
    };
    await addDoc(collection(db, "bikes"), data);
    alert("Master Price List Updated!");
};

// ६. प्रोफाइल लोड गर्ने
async function loadProfile(uid) {
    const docSnap = await getDoc(doc(db, "profiles", uid));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('dispName').innerText = data.name || "Ishak";
        document.getElementById('headerUserName').innerText = data.name || "Ishak";
        document.getElementById('pNameInput').value = data.name || "";
        updateGreeting(data.name || "Ishak");
    }
}

function updateGreeting(name) {
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    document.getElementById('greetingText').innerText = `${greet}, ${name}!`;
    document.getElementById('currentDate').innerText = new Date().toDateString();
}
