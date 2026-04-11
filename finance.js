import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

let selectedBike = null;

// १. बाइकको लिस्ट लोड गर्ने (Dropdown को लागि)
onSnapshot(bikesCol, (snapshot) => {
    const select = document.getElementById('bikeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">मोडल छान्नुहोस्</option>';
    snapshot.forEach((doc) => {
        const bike = doc.data();
        let option = document.createElement('option');
        option.value = doc.id;
        option.text = bike.name;
        // पुरानो इन्स्योरेन्स (Insurance1) लाई डाटाको रूपमा राख्ने
        option.dataset.price = bike.price;
        option.dataset.ins = bike.Insurance1; 
        select.appendChild(option);
    });
});

// २. बाइक छानेपछि मूल्य र इन्स्योरेन्स सेट गर्ने
window.updateBikeDetails = function() {
    const select = document.getElementById('bikeSelect');
    const option = select.options[select.selectedIndex];
    
    if (option.value) {
        const price = option.dataset.price;
        const ins = option.dataset.ins; // यसले पुरानो (पहिलो) इन्स्योरेन्स मात्र लिन्छ
        
        document.getElementById('mrpPrice').value = price;
        document.getElementById('insuranceFee').value = ins;
        calculateFinance(); // आफै क्याल्कुलेट गर्ने
    }
};

// ३. फाइनान्स क्याल्कुलेसन लजिक
window.calculateFinance = function() {
    const mrp = parseFloat(document.getElementById('mrpPrice').value) || 0;
    const downPaymentPercent = parseFloat(document.getElementById('dpPercent').value) || 40;
    const insurance = parseFloat(document.getElementById('insuranceFee').value) || 0;
    const interestRate = 14; // मानौँ १४% ब्याज दर
    const tenure = parseInt(document.getElementById('tenure').value) || 12;

    // डाउनपेमेन्ट हिसाब (MRP को ४०%)
    const dpAmount = (mrp * downPaymentPercent) / 100;
    const totalDownPayment = dpAmount + insurance;

    // ऋण (Loan) हिसाब
    const loanAmount = mrp - dpAmount;
    const monthlyInterest = (interestRate / 100) / 12;
    
    // EMI फर्मुला
    const emi = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, tenure)) / (Math.pow(1 + monthlyInterest, tenure) - 1);

    // नतिजा देखाउने
    document.getElementById('resDownPayment').innerText = "Rs. " + Math.round(totalDownPayment).toLocaleString();
    document.getElementById('resEMI').innerText = "Rs. " + Math.round(emi).toLocaleString();
    document.getElementById('resLoan').innerText = "Rs. " + Math.round(loanAmount).toLocaleString();
};
