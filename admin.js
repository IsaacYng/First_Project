import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

// --- १. सुरक्षा र लगइन जाँच (Security Check) ---
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html"; // लगइन छैन भने लखेट्ने
    } else {
        document.body.style.display = "block"; // लगइन भए मात्र स्क्रिन देखाउने
        document.getElementById('adminEmail').innerText = user.email;
    }
});

// --- २. लगआउट फङ्सन (Logout) ---
window.logout = () => {
    signOut(auth).then(() => window.location.href = "login.html");
};

// --- ३. बाइक सेभ गर्ने (Add Bike) ---
window.saveBike = async function() {
    const name = document.getElementById('bikeName').value;
    const price = document.getElementById('bikePrice').value;
    const ins = document.getElementById('bikeIns').value;

    if (!name || !price || !ins) {
        alert("Please fill all fields!");
        return;
    }

    try {
        await addDoc(bikesCol, {
            name: name,
            price: parseFloat(price),
            Insurance: parseFloat(ins),
            updatedAt: new Date()
        });
        // Input सफा गर्ने
        document.getElementById('bikeName').value = "";
        document.getElementById('bikePrice').value = "";
        document.getElementById('bikeIns').value = "";
        alert("Bike added to database!");
    } catch (e) {
        alert("Error adding bike: " + e.message);
    }
};

// --- ४. बाइक डिलिट गर्ने (Delete Bike) ---
window.deleteBike = async function(id) {
    if (confirm("Are you sure you want to delete this model?")) {
        try {
            await deleteDoc(doc(db, "bikes", id));
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }
};

// --- ५. रियल-टाइम डाटा देखाउने (Real-time Table Update) ---
onSnapshot(bikesCol, (snapshot) => {
    const tbody = document.getElementById('bikeTableBody');
    tbody.innerHTML = "";
    
    snapshot.forEach((doc) => {
        const bike = doc.data();
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: #333;">${bike.name}</td>
                <td>RS. ${parseFloat(bike.price).toLocaleString()}</td>
                <td>RS. ${parseFloat(bike.Insurance).toLocaleString()}</td>
                <td>
                    <button class="btn-del" onclick="deleteBike('${doc.id}')">
                        <i class="fa fa-trash"></i> Remove
                    </button>
                </td>
            </tr>
        `;
    });
});
