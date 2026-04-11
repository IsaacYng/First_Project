import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

let allBikes = []; // डेटा स्टोर गर्न

function startApp() {
    // रियल-टाइम डाटा तान्ने
    onSnapshot(bikesCol, (snapshot) => {
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderBikes(allBikes); 
    });
}

// १. बाइकहरू मात्र देखाउने फङ्सन (Admin List हटाइयो)
function renderBikes(bikes) {
    let container = document.getElementById("bike-container");
    if (container) {
        if (bikes.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>No bikes found.</p>";
            return;
        }
        
        container.innerHTML = bikes.map(bike => `
            <div class="bike-card">
                <img src="${bike.img || 'https://cdn-icons-png.flaticon.com/512/8163/8163149.png'}" alt="${bike.name}">
                <div class="bike-info">
                    <h3>${bike.name}</h3>
                    <p>Insurance 1: Rs. ${bike.Insurance1 || 0}</p>
                    <p>Insurance 2: Rs. ${bike.Insurance2 || 0}</p>
                    <div class="price">MRP: Rs. ${parseFloat(bike.price).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }
}

// २. सर्च फङ्सन (यसलाई window मा राख्नुपर्छ)
window.searchBikes = function() {
    const input = document.getElementById('search-input');
    if (!input) return;

    const filter = input.value.toLowerCase();
    
    const filteredBikes = allBikes.filter(bike => 
        bike.name.toLowerCase().includes(filter)
    );

    renderBikes(filteredBikes);
};

// एप सुरु गर्ने
startApp();
