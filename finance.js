import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// १. Firebase Setup
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
            select.innerHTML = allBikes.map(bike => 
                `<option value="${bike.id}" ${bike.name.includes("Pulsar 150 SD BS VI") ? "selected" : ""}>${bike.name}</option>`
            ).join('');
            
            calculateFinance(); // लोड हुने बित्तिकै हिसाब गर्ने
        }
    } catch (e) {
        console.error("Error fetching bikes:", e);
    }
}

// ३. मुख्य हिसाब गर्ने फङ्सन (The Logic)
window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    // --- इनपुट डेटा लिने ---
    const mrp = parseFloat(bike.price) || 0;
    const insurance = parseFloat(bike.Insurance) || 0;
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const customerAdvEmi = parseFloat(document.getElementById('advEmiInput').value) || 0; // थप एडभान्स
    const namsari = parseFloat(document.getElementById('namsariInput').value) || 0;
    
    const accCost = (parseFloat(document.getElementById('helmetInput').value) || 0) + 
                     (parseFloat(document.getElementById('legguardInput').value) || 0) + 
                     (parseFloat(document.getElementById('seatcoverInput').value) || 0) + 
                     (parseFloat(document.getElementById('othersInput').value) || 0);

    const dpPercentVal = parseFloat(document.getElementById('dpPercent').value);
    const dpPercent = dpPercentVal / 100;
    const tenure = parseFloat(document.getElementById('tenure').value);

    // --- फाईनान्स गणना ---
    const afterDiscount = mrp - discount;
    const downpaymentAmt = afterDiscount * dpPercent;
    const loanAmount = afterDiscount - downpaymentAmt;

    // ब्याज दर (Interest Rate)
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const rawEmi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const emi = Math.round(rawEmi);

    // ४. Auto Calculate Rounding (९१७ लाई १००० बनाउने लजिक)
    const lastThreeDigits = emi % 1000;
    const autoAdEmiAdjustment = lastThreeDigits > 0 ? (1000 - lastThreeDigits) : 0;

    // ५. Total Advance EMI (शोरुमको नियम: १ किस्ता + राउन्डिङ + थप एडभान्स)
    const totalAdvanceEmi = emi + autoAdEmiAdjustment + customerAdvEmi;

    // ६. Due EMI (बाँकी तिर्नुपर्ने जम्मा रकम)
    const dueEmiTotal = (emi * (tenure - 1)) - customerAdvEmi;

    // ७. Final Total Downpayment (जम्मा हातमा कति पैसा बोकेर शोरुम आउने?)
    const finalTotalDP = downpaymentAmt + insurance + namsari + accCost + totalAdvanceEmi;

    // --- स्क्रिनमा अपडेट गर्ने ---
    document.getElementById('mrp').innerText = `RS. ${mrp.toLocaleString()}`;
    document.getElementById('afterDiscount').innerText = `RS. ${afterDiscount.toLocaleString()}`;
    document.getElementById('displayIns').innerText = `RS. ${insurance.toLocaleString()}`;
    
    document.getElementById('displayTotalDP').innerText = `RS. ${Math.round(finalTotalDP).toLocaleString()}`;
    document.getElementById('displayEMI').innerText = `RS. ${emi.toLocaleString()}`;
    document.getElementById('displayRate').innerText = `${rate}%`;
    document.getElementById('displayDpAmt').innerText = `RS. ${Math.round(downpaymentAmt).toLocaleString()}`;
    document.getElementById('displayLoanAmt').innerText = `RS. ${Math.round(loanAmount).toLocaleString()}`;
    
    // नयाँ ID हरु
    document.getElementById('displayAutoAdEmi').innerText = `RS. ${autoAdEmiAdjustment.toLocaleString()}`;
    document.getElementById('displayTotalAdvEmi').innerText = `RS. ${totalAdvanceEmi.toLocaleString()}`;
    document.getElementById('displayDueEmi').innerText = `RS. ${dueEmiTotal.toLocaleString()}`;
    document.getElementById('displayTotalInterest').innerText = `RS. ${Math.round((emi * tenure) - loanAmount).toLocaleString()}`;
};

// ४. Event Listeners
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});

fetchBikes();
