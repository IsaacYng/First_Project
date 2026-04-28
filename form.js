import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase Configuration
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

async function fetchBikes() {
    try {
        const snapshot = await getDocs(bikesCol);
        allBikes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const select = document.getElementById('modelSelect');
        if (select) {
            select.innerHTML = allBikes.map(bike => 
                `<option value="${bike.id}">${bike.name}</option>`
            ).join('');
            // Data fetch bhayepachi matrai calculation call garne
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

    // Numeric value helper
    const getVal = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;

    // 1. Raw Data (Cash vs Finance Insurance)
    const mrp = parseFloat(bike.price) || 0;
    const cashInsurance = parseFloat(bike.Insurance) || 0; // Dashboard ko lagi
    const financeInsurance = parseFloat(bike.financeInsurance) || 0; // A4 ko lagi

    // 2. Inputs
    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput');
    const namsari = getVal('namsariInput', 3000);
    const dpPercentVal = getVal('dpPercent');
    const tenure = getVal('tenure');
    const accCost = getVal('helmetInput') + getVal('legguardInput') + 
                    getVal('seatcoverInput') + getVal('othersInput');

    // 3. Base Calculation (After Discount)
    const afterDiscount = mrp - discount; // A4 paper ma yo price load hunchha
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    // 4. Interest Rate Logic
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    // 5. Dashboard Calculation (Using Cash Insurance + Accessories)
    const rawTotalDP_Dash = dpAmountOnly + namsari + cashInsurance + emi + accCost + customerExtraAdv;
    const roundingAdj = rawTotalDP_Dash % 1000 > 0 ? (1000 - (rawTotalDP_Dash % 1000)) : 0;
    
    // Synced Advance EMI (Dubai tira eutai hunchha)
    const totalAdvEmiSync = emi + roundingAdj + customerExtraAdv; 
    const finalTotalDP_Dash = rawTotalDP_Dash + roundingAdj;

    // 6. A4 Paper Calculation (Using Finance Insurance + Sync EMI)
    const finalTotalDP_A4 = dpAmountOnly + namsari + financeInsurance + totalAdvEmiSync;

    updateUI({
        bikeName: bike.name,
        mrp, afterDiscount, cashInsurance, financeInsurance, rate, dpAmountOnly, 
        loanAmount, emi, roundingAdj, finalTotalDP_Dash, finalTotalDP_A4, totalAdvEmiSync, tenure, namsari
    });
};

function updateUI(data) {
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    // --- DASHBOARD (Top View) ---
    safeSet('displayTotalDP', `RS. ${format(data.finalTotalDP_Dash)}`);
    safeSet('mrp', `RS. ${format(data.mrp)}`);
    safeSet('afterDiscount', `RS. ${format(data.afterDiscount)}`);
    safeSet('displayIns', `RS. ${format(data.cashInsurance)}`);
    safeSet('displayRate', `${data.rate}`);
    safeSet('displayDpAmt', `RS. ${format(data.dpAmountOnly)}`);
    safeSet('displayLoanAmt', `RS. ${format(data.loanAmount)}`);
    safeSet('displayEMI', `RS. ${formatDec(data.emi)}`);
    safeSet('displayAutoAdEmi', `RS. ${data.roundingAdj.toFixed(2)}`);
    safeSet('displayTotalAdvEmi', `RS. ${formatDec(data.totalAdvEmiSync)}`);

    // --- A4 PAPER (Print Area) ---
    safeSet('a4Model', data.bikeName);
    safeSet('a4MRP', formatDec(data.afterDiscount));
    safeSet('a4DP', formatDec(data.dpAmountOnly));
    safeSet('a4Loan', formatDec(data.loanAmount));
    safeSet('a4Rate', data.rate.toFixed(2));
    safeSet('a4Tenure', data.tenure);
    safeSet('a4Ins', formatDec(data.financeInsurance));
    safeSet('a4AdvEmiAmt', formatDec(data.totalAdvEmiSync));
    safeSet('a4TotalDP', formatDec(data.finalTotalDP_A4));
    safeSet('a4Namsari', formatDec(data.namsari));
}

// Event Listeners setup
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});

fetchBikes();
