import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

// १. नयाँ बाइक सेभ गर्ने फङ्सन
window.saveBike = async function() {
    const name = document.getElementById('bikeName').value;
    const price = document.getElementById('bikePrice').value;
    const ins = document.getElementById('bikeIns').value;

    if (!name || !price || !ins) {
        alert("कृपया सबै खाली ठाउँ भर्नुहोस्!");
        return;
    }

    try {
        await addDoc(bikesCol, {
            name: name,
            price: parseFloat(price),
            Insurance: parseFloat(ins),
            createdAt: new Date()
        });
        alert("Bike added successfully!");
        document.getElementById('bikeName').value = "";
        document.getElementById('bikePrice').value = "";
        document.getElementById('bikeIns').value = "";
    } catch (e) {
        alert("Error: " + e.message);
    }
};

// २. बाइक डिलिट गर्ने फङ्सन
window.deleteBike = async function(id) {
    if (confirm("के तपाईं यो बाइक हटाउन चाहनुहुन्छ?")) {
        await deleteDoc(doc(db, "bikes", id));
    }
};

// ३. रियल-टाइममा डाटा देखाउने (Real-time Sync)
onSnapshot(bikesCol, (snapshot) => {
    const tbody = document.getElementById('bikeTableBody');
    tbody.innerHTML = "";
    
    snapshot.forEach((doc) => {
        const bike = doc.data();
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${bike.name}</td>
                <td style="padding: 12px;">RS. ${parseFloat(bike.price).toLocaleString()}</td>
                <td style="padding: 12px;">RS. ${parseFloat(bike.Insurance).toLocaleString()}</td>
                <td style="padding: 12px;">
                    <button onclick="deleteBike('${doc.id}')" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
});
