// ======================================
// FIREBASE IMPORTS
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// ======================================
// FIREBASE CONFIG
// ======================================

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

let allBikes = [];

// ======================================
// NUMBER TO WORDS (Nepali Format)
// ======================================

function numberToWords(num) {

    if (num === 0) return "Zero";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const b = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    function inWords(n) {
        if (n < 20)        return a[n];
        if (n < 100)       return b[Math.floor(n / 10)] + " " + a[n % 10];
        if (n < 1000)      return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
        if (n < 100000)    return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
        if (n < 10000000)  return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
        return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
    }

    return inWords(num).replace(/\s+/g, ' ').trim();
}

// ======================================
// FETCH BIKES FROM FIRESTORE
// ======================================

async function fetchBikes() {
    try {
        const snapshot = await getDocs(collection(db, "bikes"));

        allBikes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

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

// ======================================
// CHASSIS SEARCH
// ======================================

window.findChassis = async function () {

    const searchVal = document.getElementById('chassisSearch').value.trim();
    const statusEl  = document.getElementById('searchStatus');

    if (!statusEl) return;

    statusEl.innerText   = "Searching Inventory...";
    statusEl.className   = "text-blue-500 text-sm mt-1";

    try {
        const q             = query(collection(db, "inventory"), where("chassis", "==", searchVal));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();

            document.getElementById('manualChassis').value = data.chassis || searchVal;
            document.getElementById('manualEngine').value  = data.engine  || "";
            document.getElementById('manualReg').value     = data.regNo   || "";
            document.getElementById('manualColor').value   = data.color   || "";

            // Auto-select matching model
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

            statusEl.innerText = "Vehicle Data Loaded!";
            statusEl.className = "text-green-600 text-sm mt-1 font-bold";

            syncManualFieldsToA4();

        } else {
            document.getElementById('manualChassis').value = searchVal;
            statusEl.innerText = "Not found. Enter manually.";
            statusEl.className = "text-orange-600 text-sm mt-1";
        }

    } catch (error) {
        statusEl.innerText = "Connection Error!";
        console.error("Chassis search error:", error);
    }
};

// ======================================
// SYNC MANUAL FIELDS → A4 DISPLAY
// ======================================

function syncManualFieldsToA4() {
    const fieldMap = {
        manualChassis : 'a4Chassis2',
        manualEngine  : 'a4Engine2',
        manualReg     : 'a4Reg2',
        manualColor   : 'a4Color2'
    };

    for (const [inputId, displayId] of Object.entries(fieldMap)) {
        const inputEl   = document.getElementById(inputId);
        const displayEl = document.getElementById(displayId);
        if (displayEl) {
            displayEl.innerText = inputEl?.value || "---";
        }
    }
}

// ======================================
// FINANCE CALCULATION
// ======================================

window.calculateFinance = function () {

    const selectedId = document.getElementById('modelSelect').value;
    const bike       = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    const getVal = (id, fallback = 0) =>
        parseFloat(document.getElementById(id)?.value) || fallback;

    // --- Inputs ---
    const mrp              = parseFloat(bike.price)            || 0;
    const cashInsurance    = parseFloat(bike.Insurance)        || 0;
    const financeInsurance = parseFloat(bike.financeInsurance) || 0;

    const discount         = getVal('discountInput');
    const namsari          = getVal('namsariInput', 3000);
    const dpPercentVal     = getVal('dpPercent');
    const tenure           = getVal('tenure');
    const customerExtraAdv = getVal('advEmiInput');

    const accCost =
        getVal('helmetInput')    +
        getVal('legguardInput')  +
        getVal('seatcoverInput') +
        getVal('othersInput');

    // --- Core Calculations ---
    const afterDiscount = mrp - discount;
    const dpAmountOnly  = afterDiscount * (dpPercentVal / 100);
    const loanAmount    = afterDiscount - dpAmountOnly;

    // --- Interest Rate by DP % ---
    let rate = 13.99;
    if      (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    // --- EMI Calculation (Reducing Balance) ---
    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                (Math.pow(1 + monthlyRate, tenure) - 1);

    // --- Rounding Adjustment (round up to nearest 1000) ---
    const rawTotalDP_Dash = dpAmountOnly + namsari + cashInsurance + emi + accCost + customerExtraAdv;
    const roundingAdj     = rawTotalDP_Dash % 1000 > 0
                            ? (1000 - (rawTotalDP_Dash % 1000))
                            : 0;

    // Adv EMI synced (includes rounding + customer extra)
    const totalAdvEmiSync = emi + roundingAdj + customerExtraAdv;

    // --- Total DP: Dashboard vs A4 ---
    const finalTotalDP_Dash = rawTotalDP_Dash + roundingAdj;           // Uses cashInsurance
    const finalTotalDP_A4   = dpAmountOnly + namsari + financeInsurance + totalAdvEmiSync;  // Uses financeInsurance

    // --- Pass to UI ---
    updateUI({
        bikeName   : bike.name,
        custName   : document.getElementById('custNameInput')?.value   || "Your Name",
        custPhone  : document.getElementById('custPhoneInput')?.value  || "Contact",
        dealerName : document.getElementById('dealerNameInput')?.value || "Samriddhi & Brothers Auto Pvt. Ltd.",

        mrp,
        discount,
        afterDiscount,
        cashInsurance,
        financeInsurance,
        rate,
        dpAmountOnly,
        loanAmount,
        emi,
        roundingAdj,
        totalAdvEmiSync,
        tenure,
        namsari,
        finalTotalDP_Dash,
        finalTotalDP_A4
    });
};

// ======================================
// UPDATE UI
// ======================================

function updateUI(data) {

    const format    = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => Number(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    // --- Today's Date ---
    const today         = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        day   : '2-digit',
        month : '2-digit',
        year  : 'numeric'
    });

    // ==================
    // DASHBOARD DISPLAY
    // ==================

    safeSet('mrp',               `RS. ${format(data.mrp)}`);
    safeSet('afterDiscount',     `RS. ${format(data.afterDiscount)}`);
    safeSet('displayTotalDP',    `RS. ${format(data.finalTotalDP_Dash)}`);
    safeSet('displayIns',        `RS. ${format(data.cashInsurance)}`);
    safeSet('displayRate',       `${data.rate}`);
    safeSet('displayDpAmt',      `RS. ${format(data.dpAmountOnly)}`);
    safeSet('displayLoanAmt',    `RS. ${format(data.loanAmount)}`);
    safeSet('displayEMI',        `RS. ${formatDec(data.emi)}`);
    safeSet('displayTotalAdvEmi',`RS. ${format(data.totalAdvEmiSync)}`);

    // ==================
    // A4 FINANCE FORM
    // ==================

    safeSet('a4Date',       formattedDate);
    safeSet('a4CustName',   data.custName);
    safeSet('a4CustPhone',  data.custPhone);
    safeSet('a4Dealer',     data.dealerName);
    safeSet('a4Model',      data.bikeName);

    safeSet('a4MRP',        formatDec(data.afterDiscount));
    safeSet('a4DP',         formatDec(data.dpAmountOnly));
    safeSet('a4Loan',       formatDec(data.loanAmount));
    safeSet('a4Rate',       data.rate.toFixed(2));
    safeSet('a4Tenure',     data.tenure);
    safeSet('a4Ins',        formatDec(data.financeInsurance));
    safeSet('a4AdvEmiAmt',  formatDec(data.totalAdvEmiSync));
    safeSet('a4TotalDP',    formatDec(data.finalTotalDP_A4));
    safeSet('a4Namsari',    formatDec(data.namsari));

    // ==================
    // QUOTATION FORM
    // ==================

    safeSet('a4Date2',    formattedDate);
    safeSet('a4CustName2',data.custName);
    safeSet('a4Model2',   data.bikeName);
    safeSet('a4MRP2',     format(data.mrp));

    // In Words (for Quotation)
    safeSet('a4PriceWords',    numberToWords(Math.round(data.mrp))          + " rupees only.");
    safeSet('a4NetPriceWords', numberToWords(Math.round(data.afterDiscount)) + " rupees only.");
    safeSet('a4DiscountWords', numberToWords(Math.round(data.discount))      + " rupees only.");

    // Manual / Inventory Fields
    syncManualFieldsToA4();

    // Discount Row — show only if discount > 0
const a4DiscRow = document.getElementById('a4DiscountRow');
const p2DiscRow = document.getElementById('p2DiscountRow');  // ← ADD THIS

if (a4DiscRow) {
    if (data.discount > 0) {
        a4DiscRow.classList.remove('hidden');
        safeSet('a4DiscountAmt', format(data.discount));
        safeSet('a4NetPrice',    format(data.afterDiscount));
        if (p2DiscRow) p2DiscRow.style.display = 'block';   // ← ADD THIS
    } else {
        a4DiscRow.classList.add('hidden');
        if (p2DiscRow) p2DiscRow.style.display = 'none';    // ← ADD THIS
    }
}
}

// ======================================
// EVENT LISTENERS
// ======================================

document.addEventListener('input', (e) => {
    calculateFinance();
    if (e.target.id?.startsWith('manual')) {
        syncManualFieldsToA4();
    }
});

// ======================================
// INIT
// ======================================

fetchBikes();
