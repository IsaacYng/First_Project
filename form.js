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

    // --- Inputs & Raw Data ---
    const mrp = parseFloat(bike.price) || 0;
    const cashInsurance = parseFloat(bike.Insurance) || 0; // Normal Cash Insurance
    const financeInsurance = parseFloat(bike.financeInsurance) || 0; // Finance Insurance logic
    
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const customerExtraAdv = parseFloat(document.getElementById('advEmiInput').value) || 0; 
    const namsari = parseFloat(document.getElementById('namsariInput').value) || 3000;
    const dpPercentVal = parseFloat(document.getElementById('dpPercent').value);
    const tenure = parseFloat(document.getElementById('tenure').value);

    // Accessories
    const accCost = (parseFloat(document.getElementById('helmetInput').value) || 0) + 
                     (parseFloat(document.getElementById('legguardInput').value) || 0) + 
                     (parseFloat(document.getElementById('seatcoverInput').value) || 0) + 
                     (parseFloat(document.getElementById('othersInput').value) || 0);

    // --- Calculation Logic ---
    const afterDiscount = mrp - discount; // A4 paper base price
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    // Interest Rates
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = loanAmount > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1) : 0;

    // --- Grand Total (Using Finance Insurance for A4 Logic) ---
    const rawTotalDownpayment = dpAmountOnly + namsari + financeInsurance + emi + accCost + customerExtraAdv;
    
    // Rounding
    const lastThreeDigits = rawTotalDownpayment % 1000;
    const autoRounding = lastThreeDigits > 0 ? (1000 - lastThreeDigits) : 0;
    const finalTotalDP = rawTotalDownpayment + autoRounding;

    // Final Adv EMI calculation to match dashboard and A4
    const totalAdvEmi = emi + autoRounding + customerExtraAdv;
    const dueEmi = (emi * tenure) - totalAdvEmi;
    const totalInterest = (emi * tenure) - loanAmount;

    // --- Update UI (Dashboard) ---
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    safeSet('displayTotalDP', `RS. ${Math.round(finalTotalDP).toLocaleString()}`);
    safeSet('mrp', `RS. ${mrp.toLocaleString()}`);
    safeSet('afterDiscount', `RS. ${afterDiscount.toLocaleString()}`);
    safeSet('displayIns', `RS. ${cashInsurance.toLocaleString()}`); // Show Cash Insurance on Dashboard
    safeSet('displayRate', `${rate}%`);
    safeSet('displayDpAmt', `RS. ${dpAmountOnly.toLocaleString()}`);
    safeSet('displayLoanAmt', `RS. ${loanAmount.toLocaleString()}`);
    safeSet('displayEMI', `RS. ${emi.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    safeSet('displayAutoAdEmi', `RS. ${autoRounding.toFixed(2)}`);
    safeSet('displayTotalAdvEmi', `RS. ${totalAdvEmi.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    safeSet('displayDueEmi', `RS. ${dueEmi.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    safeSet('displayTotalInterest', `RS. ${totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2})}`);

    // --- Update A4 Paper (Print Area) ---
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    safeSet('a4Date', new Date().toLocaleDateString('en-GB'));
    safeSet('a4Model', bike.name);
    safeSet('a4MRP', formatDec(afterDiscount)); // Display After Discount Price
    safeSet('a4DP', formatDec(dpAmountOnly));
    safeSet('a4Loan', formatDec(loanAmount));
    safeSet('a4Rate', rate.toFixed(2));
    safeSet('a4Tenure', tenure);
    safeSet('a4Ins', formatDec(financeInsurance)); // Display Finance Insurance
    safeSet('a4AdvEmiAmt', formatDec(totalAdvEmi)); // Sync Adv EMI
    safeSet('a4TotalDP', formatDec(finalTotalDP)); // Final Grand Total
    safeSet('a4Namsari', formatDec(namsari));
    
    // Cust Info Sync
    safeSet('a4CustName', document.getElementById('custNameInput')?.value || "Enter Name");
    safeSet('a4CustPhone', document.getElementById('custPhoneInput')?.value || "Enter Number");
    safeSet('a4Dealer', document.getElementById('dealerNameInput')?.value || "Samriddhi And Brothers Auto Pvt. Ltd.");
};

// Listeners
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});

fetchBikes();
