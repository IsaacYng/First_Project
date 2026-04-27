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

document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('a4Date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-GB');
    fetchBikes();
    setupEventListeners();
});

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
    } catch (e) { console.error("Error fetching bikes:", e); }
}

window.calculateFinance = function() {
    const selectedId = document.getElementById('modelSelect').value;
    const bike = allBikes.find(b => b.id === selectedId);
    if (!bike) return;

    const getVal = (id, fallback = 0) => parseFloat(document.getElementById(id)?.value) || fallback;

    const mrp = parseFloat(bike.price) || 0;
    
    // Logic: Finance ma select huda Finance Insurance line, natra Normal
    // Tapaiko Admin code ma 'financeInsurance' field chha, teslai yaha use gareko chhu
    const normalInsurance = parseFloat(bike.Insurance) || 0;
    const financeInsurance = parseFloat(bike.financeInsurance) || 0;
    
    // Jaba loanAmount > 0 hunchha, hamile Finance Insurance use garna sakchhu
    const dpPercentVal = getVal('dpPercent');
    const insuranceToUse = (dpPercentVal < 100) ? financeInsurance : normalInsurance;

    const discount = getVal('discountInput');
    const customerExtraAdv = getVal('advEmiInput');
    const namsari = getVal('namsariInput', 3000);
    const tenure = getVal('tenure');
    const accCost = getVal('helmetInput') + getVal('legguardInput') + getVal('seatcoverInput') + getVal('othersInput');

    // Calculations
    const afterDiscount = mrp - discount;
    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);
    const loanAmount = afterDiscount - dpAmountOnly;

    // Interest Rate
    let rate = 13.99;
    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    const monthlyRate = (rate / 12) / 100;
    const emi = loanAmount > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1) : 0;

    // Total Downpayment Rounding
    // Yaha insuranceToUse (Finance Insurance) add bhayeko chha
    const rawTotalDownpayment = dpAmountOnly + namsari + insuranceToUse + emi + accCost + customerExtraAdv;
    const lastThreeDigits = rawTotalDownpayment % 1000;
    const autoRounding = (lastThreeDigits > 0) ? (1000 - lastThreeDigits) : 0;
    
    const finalTotalDP = rawTotalDownpayment + autoRounding;
    const totalAdvEmi = emi + autoRounding + customerExtraAdv;

    updateUI({
        bikeName: bike.name,
        mrp, afterDiscount, insurance: insuranceToUse, rate, dpAmountOnly, 
        loanAmount, emi, finalTotalDP, totalAdvEmi, tenure
    });
};

function updateUI(data) {
    const format = (num) => Math.round(num).toLocaleString();
    const formatDec = (num) => num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // Dashboard Display
    const safeSet = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };

    safeSet('displayTotalDP', `RS. ${format(data.finalTotalDP)}`);
    safeSet('displayMRP', `RS. ${format(data.mrp)}`); 
    safeSet('afterDiscount', `RS. ${format(data.afterDiscount)}`);
    safeSet('displayIns', `RS. ${format(data.insurance)}`); // Shows Finance Insurance if applicable
    safeSet('displayRate', `${data.rate}%`);
    safeSet('displayDpAmt', `RS. ${format(data.dpAmountOnly)}`);
    safeSet('displayLoanAmt', `RS. ${format(data.loanAmount)}`);
    safeSet('displayEMI', `RS. ${format(data.emi)}`);

    // A4 Paper Preview
    safeSet('a4Model', data.bikeName);
    safeSet('a4MRP', formatDec(data.mrp));
    safeSet('a4DP', formatDec(data.dpAmountOnly));
    safeSet('a4Loan', formatDec(data.loanAmount));
    safeSet('a4Rate', data.rate.toFixed(2));
    safeSet('a4Tenure', data.tenure);
    safeSet('a4Ins', formatDec(data.insurance)); // A4 ma Finance Insurance display hunchha
    safeSet('a4AdvEmiAmt', formatDec(data.totalAdvEmi));
    safeSet('a4TotalDP', formatDec(data.finalTotalDP));

    // Sync Text Inputs
    safeSet('a4CustName', document.getElementById('custNameInput')?.value || "Enter Name");
    safeSet('a4CustPhone', document.getElementById('custPhoneInput')?.value || "Enter Number");
    safeSet('a4Dealer', document.getElementById('dealerNameInput')?.value || "Samriddhi And Brothers Auto Pvt. Ltd.");
    
    const namsari = parseFloat(document.getElementById('namsariInput')?.value) || 3000;
    safeSet('a4Namsari', formatDec(namsari));
}

function setupEventListeners() {
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
        drawer?.classList.toggle('-translate-x-full');
        overlay?.classList.toggle('hidden');
    };

    [menuBtn, closeBtn, overlay].forEach(el => {
        el?.addEventListener('click', toggleDrawer);
    });
}
