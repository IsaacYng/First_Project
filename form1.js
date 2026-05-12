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
// NUMBER TO WORDS (FIXED)
// ======================================

function numberToWords(num) {
    num = Math.round(num);

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
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
        if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
        return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
    }

    return inWords(num).replace(/\s+/g, " ").trim();
}

// ======================================
// FETCH BIKES
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
            select.innerHTML = allBikes
                .map(bike => `<option value="${bike.id}">${bike.name}</option>`)
                .join('');

            select.addEventListener('change', calculateFinance);
        }

        calculateFinance();

    } catch (e) {
        console.error("Error fetching bikes:", e);
    }
}

// ======================================
// FIND CHASSIS
// ======================================

window.findChassis = async function () {
    const searchVal = document.getElementById('chassisSearch').value.trim();
    const statusEl = document.getElementById('searchStatus');

    if (!searchVal) return;

    statusEl.innerText = "Searching...";
    statusEl.className = "text-blue-500 text-sm mt-1";

    try {
        const q = query(
            collection(db, "inventory"),
            where("chassis", "==", searchVal)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
            const data = snap.docs[0].data();

            document.getElementById('manualChassis').value = data.chassis || "";
            document.getElementById('manualEngine').value = data.engine || "";
            document.getElementById('manualReg').value = data.regNo || "";
            document.getElementById('manualColor').value = data.color || "";

            const modelSelect = document.getElementById('modelSelect');

            if (data.model) {
                for (let i = 0; i < modelSelect.options.length; i++) {
                    if (modelSelect.options[i].text === data.model) {
                        modelSelect.selectedIndex = i;
                        break;
                    }
                }
            }

            calculateFinance();

            statusEl.innerText = "Vehicle Loaded!";
            statusEl.className = "text-green-600 text-sm mt-1 font-bold";

        } else {
            statusEl.innerText = "Not found.";
            statusEl.className = "text-orange-600 text-sm mt-1";
        }

    } catch (err) {
        statusEl.innerText = "Error!";
        console.error(err);
    }
};

// ======================================
// FINANCE CALCULATION
// ======================================

window.calculateFinance = function () {

    const bike = allBikes.find(
        b => b.id === document.getElementById('modelSelect')?.value
    );

    if (!bike) return;

    const val = (id, d = 0) =>
        parseFloat(document.getElementById(id)?.value) || d;

    const mrp = parseFloat(bike.price) || 0;

    const discount = val('discountInput');
    const afterDiscount = mrp - discount;

    const dpPercent = val('dpPercent');
    const tenure = val('tenure');

    const insurance = parseFloat(bike.financeInsurance || bike.Insurance || 0);

    const namsari = val('namsariInput', 3000);

    const accessories =
        val('helmetInput') +
        val('legguardInput') +
        val('seatcoverInput') +
        val('othersInput');

    const advEmi = val('advEmiInput');

    const dpAmount = afterDiscount * (dpPercent / 100);
    const loanAmount = afterDiscount - dpAmount;

    let rate = 13.99;
    if (dpPercent >= 60) rate = 9.99;
    else if (dpPercent >= 50) rate = 11.99;
    else if (dpPercent >= 40) rate = 12.99;

    const r = rate / 12 / 100;

    const emi =
        (loanAmount * r * Math.pow(1 + r, tenure)) /
        (Math.pow(1 + r, tenure) - 1);

    const totalDP =
        dpAmount + namsari + insurance + accessories + advEmi + emi;

    updateUI({
        bikeName: bike.name,
        mrp,
        discount,
        afterDiscount,
        dpAmount,
        loanAmount,
        emi,
        tenure,
        rate,
        insurance,
        namsari,
        totalDP
    });
};

// ======================================
// UI UPDATE (FIXED)
// ======================================

function updateUI(d) {

    const f = n => Math.round(n).toLocaleString();
    const fd = n => Number(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.innerText = v;
    };

    const date = new Date().toLocaleDateString('en-GB');

    // TOP
    set('mrp', `RS. ${f(d.mrp)}`);
    set('afterDiscount', `RS. ${f(d.afterDiscount)}`);

    // A4 FORM
    set('a4Date', date);
    set('a4Date2', date);

    set('a4CustName', document.getElementById('custNameInput')?.value || "Name");
    set('a4CustPhone', document.getElementById('custPhoneInput')?.value || "Contact");
    set('a4Dealer', document.getElementById('dealerNameInput')?.value || "");

    set('a4Model', d.bikeName);
    set('a4Model2', d.bikeName);

    set('a4MRP', fd(d.afterDiscount));
    set('a4DP', fd(d.dpAmount));
    set('a4Loan', fd(d.loanAmount));
    set('a4Rate', d.rate.toFixed(2));
    set('a4Tenure', d.tenure);

    set('a4Ins', fd(d.insurance));
    set('a4Namsari', fd(d.namsari));
    set('a4TotalDP', fd(d.totalDP));

    // QUOTE PRICE
    set('a4MRP2', f(d.mrp));

    set('a4DiscountWords', numberToWords(d.discount) + " rupees only.");
    set('a4NetPriceWords', numberToWords(d.afterDiscount) + " rupees only.");

    // DISCOUNT BLOCK
    const block = document.getElementById('a4DiscountRow');

    if (block) {
        if (d.discount > 0) {
            block.classList.remove('hidden');
            set('a4DiscountAmt', f(d.discount));
            set('a4NetPrice', f(d.afterDiscount));
        } else {
            block.classList.add('hidden');
        }
    }

    // INVENTORY
    set('a4Color2', document.getElementById('manualColor')?.value || "---");
    set('a4Reg2', document.getElementById('manualReg')?.value || "---");
    set('a4Engine2', document.getElementById('manualEngine')?.value || "---");
    set('a4Chassis2', document.getElementById('manualChassis')?.value || "---");
}

// ======================================
// LIVE INPUT
// ======================================

document.addEventListener('input', () => {
    calculateFinance();
});

// INIT
fetchBikes();
