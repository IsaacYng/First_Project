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

// १. लगइन सुरक्षा जाँच (Check Login Status)
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // यदि लगइन छैन भने Login.html मा पठाउने (L ठूलो भएको पक्का गर्नुहोस्)
        window.location.href = "admin.html"; 
    } else {
        document.body.style.display = "block";
        document.getElementById('adminEmail').innerText = user.email;
    }
});

// २. लगआउट फङ्सन
window.logout = () => signOut(auth).then(() => window.location.href = "admin.html");

// ३. नयाँ बाइक थप्ने फङ्सन
window.saveBike = async function() {
    const name = document.getElementById('bikeName').value;
    const price = document.getElementById('bikePrice').value;
    const ins1 = document.getElementById('bikeIns1').value;
    const ins2 = document.getElementById('bikeIns2').value;

    if (!name || !price || !ins1 || !ins2) {
        alert("कृपया सबै कोठा भर्नुहोस्!");
        return;
    }

    try {
        await addDoc(bikesCol, {
            name: name,
            price: parseFloat(price),
            Insurance1: parseFloat(ins1),
            Insurance2: parseFloat(ins2),
            updatedAt: new Date()
        });
        alert("सफलतापूर्वक थपियो!");
        document.getElementById('bikeName').value = "";
        document.getElementById('bikePrice').value = "";
        document.getElementById('bikeIns1').value = "";
        document.getElementById('bikeIns2').value = "";
    } catch (e) { alert("Error: " + e.message); }
};

// ४. बाइक डिलिट गर्ने फङ्सन
window.deleteBike = async function(id) {
    if (confirm("के तपाईं यो मोडल हटाउन चाहनुहुन्छ?")) {
        await deleteDoc(doc(db, "bikes", id));
    }
};

// ५. रियल-टाइम अपडेट (Display Data)
onSnapshot(bikesCol, (snapshot) => {
    const tbody = document.getElementById('bikeTableBody');
    tbody.innerHTML = "";
    snapshot.forEach((doc) => {
        const bike = doc.data();
        tbody.innerHTML += `
            <tr>
                <td><b>${bike.name}</b></td>
                <td>RS. ${parseFloat(bike.price).toLocaleString()}</td>
                <td>RS. ${parseFloat(bike.Insurance1).toLocaleString()}</td>
                <td>RS. ${parseFloat(bike.Insurance2 || 0).toLocaleString()}</td>
                <td>
                    <button class="btn-del" onclick="deleteBike('${doc.id}')">
                        <i class="fa fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });
});
