import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// 1. Firebase Configuration
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

// Data Fetching
async function fetchBikes() {
    try {
        const snapshot = await getDocs(bikesCol);
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const select = document.getElementById('modelSelect');
        if (select) {
            select.innerHTML = allBikes.map(bike => 
                `<option value="${bike.id}" ${bike.name.includes("Pulsar 150 SD BS VI") ? "selected" : ""}>${bike.name}</option>`
            ).join('');
            calculateFinance();
        }
    } catch (e) {
        console.error("Error fetching bikes:", e);
    }
}

window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    // --- Input Processing ---
    const getVal = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;

    const mrp = parseFloat(bike.price) || 0;
    const cashInsurance = parseFloat(bike.Insurance) || 0;
    const financeInsurance = parseFloat(bike.financeInsurance) || 0; // Fixed for A4 logic
    
    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput'); 
    const namsari = getVal('namsariInput', 3000);
    const dpPercentVal = getVal('dpPercent');
    const tenure = getVal('tenure');

    const accCost = getVal('helmetInput') + getVal('legguardInput') + 
                   getVal('seatcoverInput') + getVal('othersInput');

    // --- Calculation Engine ---
    const afterDiscount = mrp - discount; // Base Price for A4
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    // Interest Rate Logic based on DP %
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = loanAmount > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1) : 0;

    // Logic: Grand Total calculation (Always uses Finance Insurance for A4 printing context)
    const rawTotalDP = dpAmountOnly + namsari + financeInsurance + emi + accCost + customerExtraAdv;
    
    // Exact Rounding to the next 1,000 block
    const lastThree = rawTotalDP % 1000;
    const autoRounding = (lastThree > 0) ? (1000 - lastThree) : 0;
    const finalTotalDP = rawTotalDP + autoRounding;

    // Total Advance EMI (EMI + Rounding + Extra) - This ensures Dashboard & A4 Match
    const totalAdvEmi = emi + autoRounding + customerExtraAdv;
    const totalInterest = (emi * tenure) - loanAmount;

    // --- Update UI (Dashboard Summary) ---
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    safeSet('displayTotalDP', `RS. ${format(finalTotalDP)}`);
    safeSet('mrp', `RS. ${mrp.toLocaleString()}`);
    safeSet('afterDiscount', `RS. ${afterDiscount.toLocaleString()}`);
    safeSet('displayIns', `RS. ${cashInsurance.toLocaleString()}`); 
    safeSet('displayRate', `${rate}`);
    safeSet('displayDpAmt', `RS. ${format(dpAmountOnly)}`);
    safeSet('displayLoanAmt', `RS. ${format(loanAmount)}`);
    safeSet('displayEMI', `RS. ${formatDec(emi)}`);
    safeSet('displayAutoAdEmi', `RS. ${autoRounding.toFixed(2)}`);
    safeSet('displayTotalAdvEmi', `RS. ${formatDec(totalAdvEmi)}`);
    safeSet('displayTotalInterest', `RS. ${formatDec(totalInterest)}`);

    // --- Update UI (A4 Paper Print Area) ---
    safeSet('a4Model', bike.name);
    safeSet('a4MRP', formatDec(afterDiscount)); // Displaying Price After Discount as Retail Price
    safeSet('a4DP', formatDec(dpAmountOnly));
    safeSet('a4Loan', formatDec(loanAmount));
    safeSet('a4Rate', rate.toFixed(2));
    safeSet('a4Tenure', tenure);
    safeSet('a4Ins', formatDec(financeInsurance)); // Loading Finance Insurance price
    safeSet('a4AdvEmiAmt', formatDec(totalAdvEmi)); // Syncing Advance EMI accurately
    safeSet('a4TotalDP', formatDec(finalTotalDP)); // Final Downpayment Paid by Customer
    safeSet('a4Namsari', formatDec(namsari));
    
    // Sync Customer & Contact
    safeSet('a4CustName', document.getElementById('custNameInput')?.value || "Your Name");
    safeSet('a4CustPhone', document.getElementById('custPhoneInput')?.value || "9800000000");
};

// Event Listeners for Dynamic Calculation
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});

// Run on load
fetchBikes();
