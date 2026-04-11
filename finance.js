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
        
        // डाटाबेसको नाम "Insurance1" र "price" सँग मिल्नुपर्छ
        option.setAttribute('data-price', bike.price);
        option.setAttribute('data-ins', bike.Insurance1 || 0); 
        select.appendChild(option);
    });
});

// २. बाइक छानेपछि मूल्य र इन्स्योरेन्स सेट गर्ने
window.updateBikeDetails = function() {
    const select = document.getElementById('bikeSelect');
    const option = select.options[select.selectedIndex];
    
    if (option && option.value !== "") {
        const price = option.getAttribute('data-price');
        const ins = option.getAttribute('data-ins'); 
        
        document.getElementById('mrpPrice').value = price;
        document.getElementById('insuranceFee').value = ins;
        
        // भ्यालु सेट भएपछि हिसाब गर्ने
        calculateFinance();
    } else {
        document.getElementById('mrpPrice').value = "";
        document.getElementById('insuranceFee').value = "";
    }
};

// ३. फाइनान्स क्याल्कुलेसन लजिक
window.calculateFinance = function() {
    const mrp = parseFloat(document.getElementById('mrpPrice').value) || 0;
    const dpPercent = parseFloat(document.getElementById('dpPercent').value) || 40;
    const insurance = parseFloat(document.getElementById('insuranceFee').value) || 0;
    const interestRate = 14; 
    const tenure = parseInt(document.getElementById('tenure').value) || 12;

    if (mrp <= 0) return;

    // डाउनपेमेन्ट हिसाब
    const dpAmount = (mrp * dpPercent) / 100;
    const totalDownPayment = dpAmount + insurance;

    // ऋण (Loan) हिसाब
    const loanAmount = mrp - dpAmount;
    const monthlyInterest = (interestRate / 100) / 12;
    
    // EMI फर्मुला
    const emi = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, tenure)) / (Math.pow(1 + monthlyInterest, tenure) - 1);

    // नतिजा देखाउने (ID हरू तपाईंको HTML सँग मिल्नुपर्छ)
    if(document.getElementById('resDownPayment')) {
        document.getElementById('resDownPayment').innerText = "Rs. " + Math.round(totalDownPayment).toLocaleString();
    }
    if(document.getElementById('resEMI')) {
        document.getElementById('resEMI').innerText = "Rs. " + Math.round(emi).toLocaleString();
    }
    if(document.getElementById('resLoan')) {
        document.getElementById('resLoan').innerText = "Rs. " + Math.round(loanAmount).toLocaleString();
    }
};
