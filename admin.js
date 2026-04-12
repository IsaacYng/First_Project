import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// सुरक्षा चेक
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const modelSelect = document.getElementById('modelSelect');

// १. 'bikes' (Price List) बाट मोडलको नामहरू मात्र तान्ने
onSnapshot(collection(db, "bikes"), (snap) => {
    modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
    snap.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.data().name; 
        opt.innerText = d.data().name;
        modelSelect.appendChild(opt);
    });
});

// २. डाटा सेभ गर्ने (Chassis, Engine, Insurance)
document.getElementById('saveBtn').addEventListener('click', async () => {
    const model = modelSelect.value;
    const chassis = document.getElementById('chassisNo').value;
    const engine = document.getElementById('engineNo').value;
    const color = document.getElementById('bikeColor').value;
    const ins = document.getElementById('insuranceAmt').value;

    if (model && chassis && engine) {
        try {
            await addDoc(collection(db, "bike_specs"), {
                modelName: model,
                chassisNo: chassis,
                engineNo: engine,
                color: color,
                insurance: Number(ins),
                addedAt: new Date()
            });
            alert("Stock Added Successfully!");
            // सफा गर्ने
            document.getElementById('chassisNo').value = "";
            document.getElementById('engineNo').value = "";
        } catch (e) {
            alert("Error: " + e.message);
        }
    } else {
        alert("Please fill important fields!");
    }
});

// ३. इन्भेन्टरी देखाउने र डिलिट गर्ने
onSnapshot(collection(db, "bike_specs"), (snap) => {
    const list = document.getElementById('inventoryList');
    list.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${data.modelName}</td>
            <td>${data.chassisNo}</td>
            <td>${data.color}</td>
            <td><button class="btn-del" data-id="${d.id}" style="background:red; color:white; border:none; padding:5px; cursor:pointer;">Delete</button></td>
        `;
        list.appendChild(tr);
    });

    document.querySelectorAll('.btn-del').forEach(btn => {
        btn.onclick = async (e) => {
            if(confirm("Delete this entry?")) {
                await deleteDoc(doc(db, "bike_specs", e.target.dataset.id));
            }
        };
    });
});
