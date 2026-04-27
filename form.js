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

    const mrp = parseFloat(bike.price) || 0;
    const insurance = parseFloat(bike.Insurance) || 0;
    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput');
    const namsari = getVal('namsariInput', 3000);
    const dpPercentVal = getVal('dpPercent');
    const tenure = getVal('tenure');

    const accCost = getVal('helmetInput') + getVal('legguardInput') + 
                   getVal('seatcoverInput') + getVal('othersInput');

    // Calculations
    const afterDiscount = mrp - discount;
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    // Interest Rate Logic
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1) || 0;

    // Downpayment Rounding Logic
    const rawTotalDownpayment = dpAmountOnly + namsari + insurance + emi + accCost + customerExtraAdv;
    const lastThreeDigits = rawTotalDownpayment % 1000;
    const autoRounding = lastThreeDigits > 0 ? (1000 - lastThreeDigits) : 0;
    const finalTotalDP = rawTotalDownpayment + autoRounding;
    const totalAdvEmi = emi + autoRounding + customerExtraAdv;

    updateUI({
        bikeName: bike.name,
        mrp, afterDiscount, insurance, rate, dpAmountOnly, 
        loanAmount, emi, finalTotalDP, totalAdvEmi, tenure
    });
};

function updateUI(data) {
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // Summary Display
    document.getElementById('displayTotalDP').innerText = `RS. ${format(data.finalTotalDP)}`;
    document.getElementById('mrp').innerText = `RS. ${format(data.mrp)}`;
    document.getElementById('afterDiscount').innerText = `RS. ${format(data.afterDiscount)}`;
    document.getElementById('displayIns').innerText = `RS. ${format(data.insurance)}`;
    document.getElementById('displayRate').innerText = `${data.rate}%`;
    document.getElementById('displayDpAmt').innerText = `RS. ${format(data.dpAmountOnly)}`;
    document.getElementById('displayLoanAmt').innerText = `RS. ${format(data.loanAmount)}`;
    document.getElementById('displayEMI').innerText = `RS. ${format(data.emi)}`;

    // A4 Preview
    document.getElementById('a4Model').innerText = data.bikeName;
    document.getElementById('mrp').innerText = formatDec(data.mrp);
    document.getElementById('a4DP').innerText = formatDec(data.dpAmountOnly);
    document.getElementById('a4Loan').innerText = formatDec(data.loanAmount);
    document.getElementById('a4Rate').innerText = data.rate.toFixed(2);
    document.getElementById('a4Tenure').innerText = data.tenure;
    document.getElementById('a4Ins').innerText = formatDec(data.insurance);
    document.getElementById('a4AdvEmiAmt').innerText = formatDec(data.totalAdvEmi);
    document.getElementById('a4TotalDP').innerText = formatDec(data.finalTotalDP);

    // Customer Sync
    document.getElementById('a4CustName').innerText = document.getElementById('custNameInput').value || "Enter Name";
    document.getElementById('a4CustPhone').innerText = document.getElementById('custPhoneInput').value || "Enter Number";
    document.getElementById('a4Dealer').innerText = document.getElementById('dealerNameInput').value || "Samriddhi And Brothers Auto Pvt. Ltd.";
}

// --- Event Listeners & UI Helpers ---
function setupEventListeners() {
    // Recalculate on any input change
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculateFinance);
    });

    // Drawer Logic
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');

    const toggleDrawer = () => {
        drawer.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    };

    [menuBtn, closeBtn, overlay].forEach(el => {
        el?.addEventListener('click', toggleDrawer);
    });
}
