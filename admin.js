import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. फायरबेस सेटअप (तपाईँको Config)
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// २. Price List बाट मोडल मात्र तान्ने
onSnapshot(collection(db, "bikes"), (snap) => {
    const select = document.getElementById('modelSelect');
    select.innerHTML = '<option value="">-- Select Model --</option>';
    snap.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.data().name; 
        opt.innerText = d.data().name;
        select.appendChild(opt);
    });
});

// ३. नयाँ इन्भेन्टरी थप्ने (Add)
document.getElementById('saveBtn').addEventListener('click', async () => {
    const model = document.getElementById('modelSelect').value;
    const chassis = document.getElementById('chassisNo').value;
    const engine = document.getElementById('engineNo').value;
    const color = document.getElementById('bikeColor').value;

    if(model && chassis && engine) {
        await addDoc(collection(db, "bike_specs"), {
            modelName: model,
            chassisNo: chassis,
            engineNo: engine,
            color: color
        });
        alert("Saved!");
    } else {
        alert("Please fill all fields!");
    }
});

// ४. स्टोर भएको डाटा देखाउने र हटाउने (Show & Remove)
onSnapshot(collection(db, "bike_specs"), (snap) => {
    const list = document.getElementById('inventoryList');
    list.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        const row = `<tr>
            <td>${data.modelName}</td>
            <td>${data.chassisNo}</td>
            <td><button class="delete-btn" onclick="deleteEntry('${d.id}')">Delete</button></td>
        </tr>`;
        list.innerHTML += row;
    });
});

// ५. डाटा हटाउने फङ्सन (Delete)
window.deleteEntry = async (id) => {
    if(confirm("Are you sure?")) {
        await deleteDoc(doc(db, "bike_specs", id));
    }
};
