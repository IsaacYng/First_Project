import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

    const getVal = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;
    const getText = (id, fallback = "") => document.getElementById(id)?.value || fallback;

    // 1. Details from Inputs (Yo thapiyo)
    const custName = getText('custNameInput', 'Your Name');
    const custPhone = getText('custPhoneInput', 'Contact');
    const dealerName = getText('dealerNameInput', 'Samriddhi And Brothers Auto Pvt. Ltd.');

    // 2. Raw Data
    const mrp = parseFloat(bike.price) || 0;
    const cashInsurance = parseFloat(bike.Insurance) || 0;
    const financeInsurance = parseFloat(bike.financeInsurance) || 0;

    // 3. Finance Inputs
    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput');
    const namsari = getVal('namsariInput', 3000);
    const dpPercentVal = getVal('dpPercent');
    const tenure = getVal('tenure');
    const accCost = getVal('helmetInput') + getVal('legguardInput') + 
                    getVal('seatcoverInput') + getVal('othersInput');

    const afterDiscount = mrp - discount;
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    const rawTotalDP_Dash = dpAmountOnly + namsari + cashInsurance + emi + accCost + customerExtraAdv;
    const roundingAdj = rawTotalDP_Dash % 1000 > 0 ? (1000 - (rawTotalDP_Dash % 1000)) : 0;
    
    const totalAdvEmiSync = emi + roundingAdj + customerExtraAdv; 
    const finalTotalDP_Dash = rawTotalDP_Dash + roundingAdj;
    const finalTotalDP_A4 = dpAmountOnly + namsari + financeInsurance + totalAdvEmiSync;

    updateUI({
        bikeName: bike.name,
        custName, custPhone, dealerName, // UI ma pathaune
        mrp, afterDiscount, cashInsurance, financeInsurance, rate, dpAmountOnly, 
        loanAmount, emi, roundingAdj, finalTotalDP_Dash, finalTotalDP_A4, totalAdvEmiSync, tenure, namsari
    });
};

function updateUI(data) {
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    // Dashboard
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

    // A4 Paper Customer Details (Yo thapiyo)
    safeSet('a4CustName', data.custName);
    safeSet('a4CustPhone', data.custPhone);
    safeSet('a4Dealer', data.dealerName);

    // A4 Paper Finance Details
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

document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});
// Import logic (Already top ma chha bhane pardaina)
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Database reference
const stockCol = collection(db, "stock"); // Tapaiko chassis collection ko name yaha halnuhos

window.findChassis = async function() {
    const searchVal = document.getElementById('chassisSearch').value.trim().toUpperCase();
    const statusEl = document.getElementById('searchStatus');
    
    if (!searchVal) {
        statusEl.innerText = "Please enter a chassis number.";
        statusEl.className = "text-red-500 text-sm mt-2";
        return;
    }

    statusEl.innerText = "Searching...";
    statusEl.className = "text-blue-500 text-sm mt-2";

    try {
        // Chassis match garne query
        const q = query(stockCol, where("chassisNo", "==", searchVal));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Data bhetiyo bhane
            const data = querySnapshot.docs[0].data();
            
            document.getElementById('manualChassis').value = data.chassisNo || searchVal;
            document.getElementById('manualEngine').value = data.engineNo || "";
            document.getElementById('manualReg').value = data.regNo || "";
            document.getElementById('manualColor').value = data.color || "";

            statusEl.innerText = "Match found! Data loaded. You can still edit if needed.";
            statusEl.className = "text-green-600 text-sm mt-2";
            
            // A4 paper ma auto-sync garna
            syncToA4();
        } else {
            // Data bhetiyena bhane
            statusEl.innerText = "No match found. Please enter manual data.";
            statusEl.className = "text-orange-600 text-sm mt-2";
            
            // Khali manually type garna milne banaucha (value clear nagari user lai help huncha)
            document.getElementById('manualChassis').value = searchVal;
        }
    } catch (error) {
        console.error("Search Error:", error);
        statusEl.innerText = "Error searching database.";
    }
};

// Input ma type garda pani A4 ma sync huna parcha
function syncToA4() {
    const chassis = document.getElementById('manualChassis').value;
    const engine = document.getElementById('manualEngine').value;
    const reg = document.getElementById('manualReg').value;
    const color = document.getElementById('manualColor').value;

    // A4 Paper ma bhayeko span/div haru ko ID anusar update garne
    if(document.getElementById('a4Chassis')) document.getElementById('a4Chassis').innerText = chassis;
    if(document.getElementById('a4Engine')) document.getElementById('a4Engine').innerText = engine;
    if(document.getElementById('a4Reg')) document.getElementById('a4Reg').innerText = reg;
    if(document.getElementById('a4Color')) document.getElementById('a4Color').innerText = color;
}

// Event listener for real-time manual editing sync
document.querySelectorAll('#manualChassis, #manualEngine, #manualReg, #manualColor').forEach(el => {
    el.addEventListener('input', syncToA4);
});

fetchBikes();
