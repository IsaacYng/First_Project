import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. Firebase Configuration (तपाईंको प्रोजेक्टको लागि)
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

let editId = null;

// २. सुरक्षा जाँच (Security Check)
// यदि लगइन छैन भने सिधै Login.html मा पठाइदिन्छ
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "Login.html"; 
    } else {
        document.body.style.display = "block"; // लगइन भएपछि मात्र पेज देखाउने
        const userEmailSpan = document.getElementById('userEmail');
        if(userEmailSpan) userEmailSpan.innerText = user.email;
    }
});

// ३. लगआउट फङ्सन (Logout)
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = "Login.html";
    }).catch((error) => alert("Logout Error: " + error.message));
};

// ४. डेटा थप्ने वा अपडेट गर्ने (Add or Update)
window.handleForm = async function() {
    const name = document.getElementById('newName').value;
    const price = document.getElementById('newPrice').value;
    const ins1 = document.getElementById('newIns').value;
    const ins2 = document.getElementById('newIns2').value;
    const img = document.getElementById('newImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png";

    if (!name || !price || !ins1 || !ins2) {
        alert("कृपया सबै कोठाहरू भर्नुहोस्!");
        return;
    }

    try {
        const bikeData = {
            name: name,
            price: parseFloat(price),
            Insurance1: parseFloat(ins1),
            Insurance2: parseFloat(ins2),
            img: img,
            updatedAt: new Date()
        };

        if (editId) {
            // यदि एडिट मोडमा छ भने अपडेट गर्ने
            await updateDoc(doc(db, "bikes", editId), bikeData);
            alert("मोडल अपडेट भयो!");
            editId = null;
            document.querySelector('.add-btn').innerText = "Update Inventory";
            document.querySelector('.add-btn').style.background = "#28a745";
        } else {
            // नत्र नयाँ थप्ने
            await addDoc(bikesCol, bikeData);
            alert("नयाँ बाइक थपियो!");
        }
        clearForm();
    } catch (e) { 
        alert("Error: " + e.message); 
    }
};

// ५. एडिटको लागि तयारी (Prepare to Edit)
window.prepareEdit = function(id, name, price, ins1, ins2, img) {
    document.getElementById('newName').value = name;
    document.getElementById('newPrice').value = price;
    document.getElementById('newIns').value = ins1;
    document.getElementById('newIns2').value = ins2;
    document.getElementById('newImg').value = img;
    
    editId = id;
    const addBtn = document.querySelector('.add-btn');
    addBtn.innerText = "Save Changes Now";
    addBtn.style.background = "#007bff"; // बटनको रङ बदल्ने
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ६. डिलिट गर्ने (Delete)
window.deleteBike = async function(id) {
    if (confirm("के तपाईं यो बाइक इन्भेन्टरीबाट हटाउन चाहनुहुन्छ?")) {
        try {
            await deleteDoc(doc(db, "bikes", id));
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }
};

// ७. रियल-टाइम अपडेट (Real-time Inventory List)
onSnapshot(bikesCol, (snapshot) => {
    const adminList = document.getElementById("admin-bike-list");
    if (!adminList) return;
    
    adminList.innerHTML = snapshot.docs.map(doc => {
        const bike = doc.data();
        return `
            <tr>
                <td><img src="${bike.img}" width="50" height="40" style="object-fit:cover; border-radius:5px;"></td>
                <td style="font-weight:bold;">${bike.name}</td>
                <td>Rs. ${parseFloat(bike.price).toLocaleString()}</td>
                <td>Rs. ${parseFloat(bike.Insurance1 || 0).toLocaleString()}</td>
                <td>Rs. ${parseFloat(bike.Insurance2 || 0).toLocaleString()}</td>
                <td>
                    <button class="edit-btn" onclick="prepareEdit('${doc.id}', '${bike.name}', '${bike.price}', '${bike.Insurance1}', '${bike.Insurance2}', '${bike.img}')" style="background:#ffc107; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; margin-right:5px;"><i class="fa fa-edit"></i></button>
                    <button class="remove-btn" onclick="deleteBike('${doc.id}')" style="background:#dc3545; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;"><i class="fa fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
});

// ८. फर्म खाली गर्ने फङ्सन
function clearForm() {
    document.getElementById('newName').value = "";
    document.getElementById('newPrice').value = "";
    document.getElementById('newIns').value = "";
    document.getElementById('newIns2').value = "";
    document.getElementById('newImg').value = "";
}
