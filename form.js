import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// --- Configuration ---
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('a4Date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-GB');
    fetchBikes();
    setupEventListeners();
});

// --- Data Fetching ---
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

// --- Finance Logic ---
window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    // Helper to get numeric values
    const getVal = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;

    // 1. RAW DATA FROM FIREBASE
    const mrp = parseFloat(bike.price) || 0;
    const cashInsurance = parseFloat(bike.Insurance) || 0; // Normal Cash Insurance
    const financeInsurance = parseFloat(bike.financeInsurance) || 0; // Finance Insurance Price
    
    // 2. INPUTS
    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput');
    const namsari = getVal('namsariInput', 3000);
    const dpPercentVal = getVal('dpPercent');
    const tenure = getVal('tenure');
    const accCost = getVal('helmetInput') + getVal('legguardInput') + 
                   getVal('seatcoverInput') + getVal('othersInput');

    // 3. LOGIC: PRICE AFTER DISCOUNT (This is our Base for A4)
    const afterDiscountPrice = mrp - discount;

    // 4. DP & LOAN (Calculated on After Discount Price)
    const dpAmountOnly = afterDiscountPrice * (dpPercentVal / 100);
    const loanAmount = afterDiscountPrice - dpAmountOnly;

    // 5. INTEREST RATE LOGIC
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = loanAmount > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1) : 0;

    // 6. TOTAL DOWNPAYMENT (Using Finance Insurance for Print Logic)
    const rawTotalDownpayment = dpAmountOnly + namsari + financeInsurance + emi + accCost + customerExtraAdv;
    
    // Rounding Logic
    const lastThreeDigits = rawTotalDownpayment % 1000;
    const autoRounding = lastThreeDigits > 0 ? (1000 - lastThreeDigits) : 0;
    
    const finalTotalDP = rawTotalDownpayment + autoRounding;
    const totalAdvEmi = emi + autoRounding + customerExtraAdv;

    // 7. SEND DATA TO UI
    updateUI({
        bikeName: bike.name,
        originalMRP: mrp,
        basePrice: afterDiscountPrice, // A4 ma main price
        cashInsurance: cashInsurance,
        financeInsurance: financeInsurance,
        rate: rate,
        dpAmountOnly: dpAmountOnly, 
        loanAmount: loanAmount, 
        emi: emi, 
        finalTotalDP: finalTotalDP, 
        totalAdvEmi: totalAdvEmi, 
        tenure: tenure,
        namsari: namsari
    });
};

function updateUI(data) {
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    // --- A4 PAPER PREVIEW (Finance Style) ---
    safeSet('a4Model', data.bikeName);
    safeSet('a4MRP', formatDec(data.basePrice)); // Displaying Price After Discount as MRP
    safeSet('a4DP', formatDec(data.dpAmountOnly));
    safeSet('a4Loan', formatDec(data.loanAmount));
    safeSet('a4Rate', data.rate.toFixed(2));
    safeSet('a4Tenure', data.tenure);
    safeSet('a4Ins', formatDec(data.financeInsurance)); // Finance Insurance on A4
    safeSet('a4AdvEmiAmt', formatDec(data.totalAdvEmi)); // Total Advance EMI
    safeSet('a4TotalDP', formatDec(data.finalTotalDP)); // Final DP including Rounding
    safeSet('a4Namsari', formatDec(data.namsari));

    // --- CALCULATOR DASHBOARD (Top Summary) ---
    safeSet('displayTotalDP', `RS. ${format(data.finalTotalDP)}`);
    safeSet('displayMRP', `RS. ${format(data.originalMRP)}`);
    safeSet('afterDiscount', `RS. ${format(data.basePrice)}`);
    safeSet('displayIns', `RS. ${format(data.cashInsurance)}`); // Top show Cash Insurance
    safeSet('displayRate', `${data.rate}%`);
    safeSet('displayDpAmt', `RS. ${format(data.dpAmountOnly)}`);
    safeSet('displayLoanAmt', `RS. ${format(data.loanAmount)}`);
    safeSet('displayEMI', `RS. ${format(data.emi)}`);

    // --- CUSTOMER & DEALER SYNC ---
    safeSet('a4CustName', document.getElementById('custNameInput')?.value || "Enter Name");
    safeSet('a4CustPhone', document.getElementById('custPhoneInput')?.value || "Enter Number");
    safeSet('a4Dealer', document.getElementById('dealerNameInput')?.value || "Samriddhi And Brothers Auto Pvt. Ltd.");
}

// --- Event Listeners ---
function setupEventListeners() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculateFinance);
    });

    // Drawer/Menu Logic
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');

    const toggleDrawer = () => {
        drawer?.classList.toggle('-translate-x-full');
        overlay?.classList.toggle('hidden');
    };

    [menuBtn, closeBtn, overlay].forEach(el => {
        el?.addEventListener('click', toggleDrawer);
    });
}
