import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. Firebase Setup (तपाईंको आधिकारिक Config)
const firebaseConfig = {
  apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
  authDomain: "first-project-2082-12-26.firebaseapp.com",
  projectId: "first-project-2082-12-26",
  storageBucket: "first-project-2082-12-26.firebasestorage.app",
  messagingSenderId: "545170954251",
  appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

let allBikes = [];

// २. डाटाबेसबाट बाइक तान्ने
async function fetchBikes() {
    try {
        const snapshot = await getDocs(bikesCol);
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const select = document.getElementById('modelSelect');
        if (select) {
            select.innerHTML = allBikes.map(bike => `<option value="${bike.id}">${bike.name}</option>`).join('');
            // बाइक लोड भएपछि हिसाब सुरु गर्ने
            calculateFinance();
        }
    } catch (e) {
        console.error("Error fetching bikes:", e);
    }
}

// ३. मुख्य हिसाब गर्ने फङ्सन (Calculation Logic)
window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    
    if (!bike) return;

    // इनपुटबाट भ्यालु तान्ने (parseFloat ले अक्षरलाई नम्बरमा बदल्छ)
    const mrp = parseFloat(bike.price) || 0;
    const insurance = parseFloat(bike.Insurance) || 0;
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const advEmi = parseFloat(document.getElementById('advEmiInput').value) || 0;
    const namsari = parseFloat(document.getElementById('namsariInput').value) || 0;
    
    const helmet = parseFloat(document.getElementById('helmetInput').value) || 0;
    const legguard = parseFloat(document.getElementById('legguardInput').value) || 0;
    const seatcover = parseFloat(document.getElementById('seatcoverInput').value) || 0;
    const others = parseFloat(document.getElementById('othersInput').value) || 0;
    
    const dpPercentVal = parseFloat(document.getElementById('dpPercent').value);
    const dpPercent = dpPercentVal / 100;
    const tenure = parseFloat(document.getElementById('tenure').value);

    // --- फाईनान्स हिसाब ---
    const afterDiscount = mrp - discount;
    const downpaymentAmt = afterDiscount * dpPercent;
    const loanAmount = afterDiscount - downpaymentAmt;
    
    // ब्याज दर (Interest Rate Logic)
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    // EMI Formula
    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    // Total Downpayment (बाटोमा निस्किँदा तिर्नुपर्ने जम्मा रकम)
    const totalDP = downpaymentAmt + insurance + namsari + helmet + legguard + seatcover + others + advEmi;

    // --- स्क्रिनमा देखाउने (Update UI) ---
    document.getElementById('mrp').innerText = `RS. ${mrp.toLocaleString()}`;
    document.getElementById('afterDiscount').innerText = `RS. ${afterDiscount.toLocaleString()}`;
    document.getElementById('displayIns').innerText = `RS. ${insurance.toLocaleString()}`;
    
    document.getElementById('displayTotalDP').innerText = `RS. ${Math.round(totalDP).toLocaleString()}`;
    document.getElementById('displayEMI').innerText = `RS. ${Math.round(emi).toLocaleString()}`;
    document.getElementById('displayRate').innerText = `${rate}%`;
    document.getElementById('displayDpAmt').innerText = `RS. ${Math.round(downpaymentAmt).toLocaleString()}`;
    document.getElementById('displayLoanAmt').innerText = `RS. ${Math.round(loanAmount).toLocaleString()}`;
    document.getElementById('displayTotalInterest').innerText = `RS. ${Math.round((emi * tenure) - loanAmount).toLocaleString()}`;
};

// ४. केही कुरा फेरिने बित्तिकै हिसाब अपडेट गर्ने
document.addEventListener('change', (e) => {
    if (e.target.id === 'modelSelect' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
        calculateFinance();
    }
});

// टाइप गर्दा गर्दै अपडेट गर्न
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
        calculateFinance();
    }
});

// सुरु गर्ने
fetchBikes();
  
