import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

// 2. Initial Fetch: Load Models to Dropdown
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

// 3. Chassis Search Function
window.findChassis = async function() {
    const searchVal = document.getElementById('chassisSearch').value.trim();
    const statusEl = document.getElementById('searchStatus');
    
    if (!statusEl) return;

    statusEl.innerText = "Searching Inventory...";
    statusEl.className = "text-blue-500 text-sm mt-1";

    try {
        const inventoryCol = collection(db, "inventory");
        const q = query(inventoryCol, where("chassis", "==", searchVal));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            
            // Auto-fill manual fields
            document.getElementById('manualChassis').value = data.chassis || searchVal;
            document.getElementById('manualEngine').value = data.engine || "";
            document.getElementById('manualReg').value = data.regNo || "";
            document.getElementById('manualColor').value = data.color || "";

            // Auto-select model from dropdown
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect && data.model) {
                for (let i = 0; i < modelSelect.options.length; i++) {
                    if (modelSelect.options[i].text === data.model) {
                        modelSelect.selectedIndex = i;
                        calculateFinance(); 
                        break;
                    }
                }
            }

            statusEl.innerText = "Match Found!";
            statusEl.className = "text-green-600 text-sm mt-1 font-bold";
            syncToA4ManualFields();
        } else {
            statusEl.innerText = "Not found. Enter manually.";
            statusEl.className = "text-orange-600 text-sm mt-1";
            document.getElementById('manualChassis').value = searchVal;
        }
    } catch (error) {
        console.error("Firebase Search Error:", error);
        statusEl.innerText = "Database error! Config check garnuhos.";
        statusEl.className = "text-red-500 text-sm mt-1";
    }
};

// 4. Manual Field Sync to A4 Paper
function syncToA4ManualFields() {
    const fields = {
        'manualChassis': 'a4Chassis',
        'manualEngine': 'a4Engine',
        'manualReg': 'a4Reg',
        'manualColor': 'a4Color'
    };

    for (let inputId in fields) {
        const val = document.getElementById(inputId)?.value || "";
        const displayId = fields[inputId];
        if (document.getElementById(displayId)) {
            document.getElementById(displayId).innerText = val;
        }
    }
}

// 5. Core Finance Calculation Logic
window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    const getVal = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;
    const getText = (id, fallback = "") => document.getElementById(id)?.value || fallback;

    // Details from Inputs
    const custName = getText('custNameInput', 'Your Name');
    const custPhone = getText('custPhoneInput', 'Contact');
    const dealerName = getText('dealerNameInput', 'Samriddhi And Brothers Auto Pvt. Ltd.');

    // Pricing & Insurance
    const mrp = parseFloat(bike.price) || 0;
    const cashInsurance = parseFloat(bike.Insurance) || 0;
    const financeInsurance = parseFloat(bike.financeInsurance) || 0;

    // Inputs
    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput');
    const namsari = getVal('namsariInput', 3000);
    const dpPercentVal = getVal('dpPercent');
    const tenure = getVal('tenure');
    const accCost = getVal('helmetInput') + getVal('legguardInput') + 
                    getVal('seatcoverInput') + getVal('othersInput');

    // Loan Calculation
    const afterDiscount = mrp - discount;
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    // Interest Rate Tier
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    // Rounding & Advance EMI logic
    const rawTotalDP_Dash = dpAmountOnly + namsari + cashInsurance + emi + accCost + customerExtraAdv;
    const roundingAdj = rawTotalDP_Dash % 1000 > 0 ? (1000 - (rawTotalDP_Dash % 1000)) : 0;
    
    const totalAdvEmiSync = emi + roundingAdj + customerExtraAdv; 
    const finalTotalDP_Dash = rawTotalDP_Dash + roundingAdj;
    const finalTotalDP_A4 = dpAmountOnly + namsari + financeInsurance + totalAdvEmiSync;

    updateUI({
        bikeName: bike.name,
        custName, custPhone, dealerName,
        mrp, afterDiscount, cashInsurance, financeInsurance, rate, dpAmountOnly, 
        loanAmount, emi, roundingAdj, finalTotalDP_Dash, finalTotalDP_A4, totalAdvEmiSync, tenure, namsari
    });
};

// 6. Update HTML UI
function updateUI(data) {
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    // --- DASHBOARD PRICE FIX ---
    // Yadi tapaiko HTML ma MRP display hune thau ko ID 'displayMRP' chha bhane yo use garnuhos
    safeSet('displayTotalDP', `RS. ${format(data.finalTotalDP_Dash)}`);
    
    // Yaha check garnuhos: yadi ID 'mrp' ho ki 'displayMRP' ho? 
    // Screenshot anusar 'mrp' ID bhayeko thau ma 0 chha, teslai data.mrp le set garnuhos.
    safeSet('mrp', `RS. ${format(data.mrp)}`); 
    
    safeSet('afterDiscount', `RS. ${format(data.afterDiscount)}`);
    safeSet('displayIns', `RS. ${format(data.cashInsurance)}`);
    safeSet('displayRate', `${data.rate}`);
    safeSet('displayDpAmt', `RS. ${format(data.dpAmountOnly)}`);
    safeSet('displayLoanAmt', `RS. ${format(data.loanAmount)}`);
    safeSet('displayEMI', `RS. ${formatDec(data.emi)}`);
    safeSet('displayTotalAdvEmi', `RS. ${formatDec(data.totalAdvEmiSync)}`);

    // A4 Paper Details... (Aru sabai same rakhnuhos)
}

    // A4 Paper View
    safeSet('a4CustName', data.custName);
    safeSet('a4CustPhone', data.custPhone);
    safeSet('a4Dealer', data.dealerName);
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

// 7. Event Listeners
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
        // Check if manual inventory fields are changed
        if (['manualChassis', 'manualEngine', 'manualReg', 'manualColor'].includes(e.target.id)) {
            syncToA4ManualFields();
        }
    }
});

// Run on Load
fetchBikes();
