import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain: "first-project-2082-12-26.firebaseapp.com",
  projectId: "first-project-2082-12-26",
  storageBucket: "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId: "1:545170954251:web:0d2f7905834af3b0be8f0e",
  measurementId: "G-17X7R542YC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

let editId = null; 
let allBikes = []; // सबै बाइकहरू यहाँ बस्छन्

function startApp() {
    onSnapshot(bikesCol, (snapshot) => {
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderBikes(allBikes); // सुरुमा सबै बाइक देखाउने
    });
}

// १. बाइकहरू स्क्रिनमा देखाउने फङ्सन
function renderBikes(bikes) {
    // होम पेजको लागि
    let container = document.getElementById("bike-container");
    if (container) {
        container.innerHTML = bikes.map(bike => `
            <div class="bike-card">
                <img src="${bike.img}" alt="${bike.name}">
                <div class="bike-info">
                    <h3>${bike.name}</h3>
                    <p>Insurance: Rs. ${bike.Insurance}</p>
                    <div class="price">Rs. ${bike.price}</div>
                </div>
            </div>
        `).join('');
    }

    // एडमिन प्यानलको लागि
    let adminList = document.getElementById("admin-bike-list");
    if (adminList) {
        adminList.innerHTML = bikes.map(bike => `
            <tr>
                <td><img src="${bike.img}" width="50" style="border-radius:5px;"></td>
                <td>${bike.name}</td>
                <td>Rs. ${bike.price}</td>
                <td>Rs. ${bike.Insurance}</td>
                <td>
                    <button onclick="prepareEdit('${bike.id}', '${bike.name}', '${bike.price}', '${bike.Insurance}', '${bike.img}')" style="background:#ffc107; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; margin-right:5px;">Edit</button>
                    <button onclick="deleteBike('${bike.id}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Remove</button>
                </td>
            </tr>
        `).join('');
    }
}

// २. सर्च गर्ने जादुई फङ्सन (Search Function)
window.searchBikes = function() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = allBikes.filter(bike => 
        bike.name.toLowerCase().includes(term)
    );
    renderBikes(filtered); // फिल्टर भएको डेटा मात्र देखाउने
};

// ३. नयाँ थप्ने वा अपडेट गर्ने
window.handleForm = async function() {
    const name = document.getElementById('newName').value;
    const price = document.getElementById('newPrice').value;
    const ins = document.getElementById('newIns').value || "0";
    const img = document.getElementById('newImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png";

    if (name && price) {
        try {
            if (editId) {
                await updateDoc(doc(db, "bikes", editId), { name, price, Insurance: ins, img });
                alert("Updated!");
                editId = null;
                document.querySelector('.add-btn').innerText = "Update Inventory";
            } else {
                await addDoc(bikesCol, { name, price, Insurance: ins, img });
                alert("Added!");
            }
            clearForm();
        } catch (e) { alert("Error: " + e.message); }
    } else { alert("Please fill details!"); }
};

window.prepareEdit = function(id, name, price, ins, img) {
    document.getElementById('newName').value = name;
    document.getElementById('newPrice').value = price;
    document.getElementById('newIns').value = ins;
    document.getElementById('newImg').value = img;
    editId = id;
    document.querySelector('.add-btn').innerText = "Save Changes";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteBike = async function(id) {
    if (confirm("Are you sure?")) await deleteDoc(doc(db, "bikes", id));
};

function clearForm() {
    document.getElementById('newName').value = "";
    document.getElementById('newPrice').value = "";
    document.getElementById('newIns').value = "";
    document.getElementById('newImg').value = "";
}

startApp();
