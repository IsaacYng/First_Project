import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. फायरबेस कन्फिगरेसन
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// २. लगइन सुरक्षा चेक
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// ३. 'Price List' बाट बाइकका नामहरू मात्र तान्ने
const modelSelect = document.getElementById('modelSelect');
onSnapshot(collection(db, "bikes"), (snap) => {
    modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
    snap.forEach(d => {
        const bike = d.data();
        const opt = document.createElement('option');
        opt.value = bike.name;
        opt.innerText = bike.name;
        modelSelect.appendChild(opt);
    });
});

// ४. नयाँ बाइकको विवरण (Specs) स्टोर गर्ने
document.getElementById('saveBtn').addEventListener('click', async () => {
    const model = modelSelect.value;
    const chassis = document.getElementById('chassisNo').value;
    const engine = document.getElementById('engineNo').value;
    const color = document.getElementById('bikeColor').value;

    if (model && chassis && engine) {
        try {
            await addDoc(collection(db, "bike_specs"), {
                modelName: model,
                chassisNo: chassis,
                engineNo: engine,
                color: color,
                addedAt: new Date()
            });
            alert("सफलतापूर्वक सेभ भयो!");
            // फारम सफा गर्ने
            document.getElementById('chassisNo').value = "";
            document.getElementById('engineNo').value = "";
            document.getElementById('bikeColor').value = "";
        } catch (error) {
            alert("डाटा सेभ गर्न सकिएन: " + error.message);
        }
    } else {
        alert("कृपया सबै विवरणहरू भर्नुहोस्!");
    }
});

// ५. इन्भेन्टरी लिस्ट देखाउने र Delete गर्ने व्यवस्था
const inventoryList = document.getElementById('inventoryList');
onSnapshot(collection(db, "bike_specs"), (snap) => {
    inventoryList.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${data.modelName}</td>
            <td>${data.chassisNo}</td>
            <td><button class="delete-btn" data-id="${d.id}">Delete</button></td>
        `;
        inventoryList.appendChild(tr);
    });

    // डिलिट बटनमा इभेन्ट लिसनर थप्ने
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("के तपाईँ यो डाटा हटाउन चाहनुहुन्छ?")) {
                await deleteDoc(doc(db, "bike_specs", id));
            }
        };
    });
});
