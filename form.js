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
window.findChassis = async function() {
    const searchVal = document.getElementById('chassisSearch').value.trim();
    const statusEl = document.getElementById('searchStatus');
    
    // Status clear garne
    statusEl.innerText = "Searching...";
    statusEl.className = "text-blue-500 text-sm mt-1";

    try {
        // HAMI "inventory" COLLECTION MA SEARCH GARDAI CHHAU
        const inventoryCol = collection(db, "inventory");
        const q = query(inventoryCol, where("chassis", "==", searchVal));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            
            // Input field ma data halne
            document.getElementById('manualChassis').value = data.chassis || "";
            document.getElementById('manualEngine').value = data.engine || "";
            document.getElementById('manualReg').value = data.regNo || "";
            document.getElementById('manualColor').value = data.color || "";

            // Dropdown matching (Yedi model name exact match hunchha bhane)
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect && data.model) {
                for (let i = 0; i < modelSelect.options.length; i++) {
                    if (modelSelect.options[i].text === data.model) {
                        modelSelect.selectedIndex = i;
                        calculateFinance(); // Price recalculate garna
                        break;
                    }
                }
            }

            statusEl.innerText = "Match Found!";
            statusEl.className = "text-green-600 text-sm mt-1 font-bold";
            syncToA4(); // A4 preview update garna
        } else {
            statusEl.innerText = "Chassis not found in inventory. Enter manually.";
            statusEl.className = "text-orange-600 text-sm mt-1";
            document.getElementById('manualChassis').value = searchVal;
        }
    } catch (error) {
        console.error("Firebase Error:", error);
        statusEl.innerText = "Database connection error! Config check garnuhos.";
        statusEl.className = "text-red-500 text-sm mt-1";
    }
};
