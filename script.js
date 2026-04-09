import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

function updateApp() {
    onSnapshot(bikesCol, (snapshot) => {
        const bikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        let adminList = document.getElementById("admin-bike-list");
        if (adminList) {
            adminList.innerHTML = bikes.map(bike => `
                <tr>
                    <td><img src="${bike.img}" width="50"></td>
                    <td>${bike.name}</td>
                    <td>${bike.price}</td>
                    <td>${bike.Insurance}</td>
                    <td><button onclick="window.deleteBike('${bike.id}')" style="background:red; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;">Remove</button></td>
                </tr>
            `).join('');
        }
    });
}
window.handleForm = async function() {
    let name = document.getElementById('newName').value;
    let price = document.getElementById('newPrice').value;
    let ins = document.getElementById('newIns').value || "0";
    let img = document.getElementById('newImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png";

    if (name && price) {
        try {
            await addDoc(bikesCol, { name, price, Insurance: ins, img });
            alert("Bike added to Cloud!");
            document.getElementById('newName').value = "";
            document.getElementById('newPrice').value = "";
        } catch (e) {
            alert("Error: " + e.message);
        }
    } else {
        alert("Please fill Name and Price!");
    }
}
window.deleteBike = async function(id) {
    if (confirm("Are you sure?")) {
        await deleteDoc(doc(db, "bikes", id));
    }
}
updateApp();
