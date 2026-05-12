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
// FIND CHASSIS
// ======================================

window.findChassis = async function () {

    const searchVal = document.getElementById('chassisSearch').value.trim();

    const statusEl = document.getElementById('searchStatus');

    if (!statusEl) return;

    statusEl.innerText = "Searching Inventory...";
    statusEl.className = "text-blue-500 text-sm mt-1";

    try {

        const q = query(
            collection(db, "inventory"),
            where("chassis", "==", searchVal)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {

            const data = querySnapshot.docs[0].data();

            document.getElementById('manualChassis').value = data.chassis || "";
            document.getElementById('manualEngine').value = data.engine || "";
            document.getElementById('manualReg').value = data.regNo || "";
            document.getElementById('manualColor').value = data.color || "";

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

        } else {

            statusEl.innerText = "Not found. Enter manually.";
            statusEl.className = "text-orange-600 text-sm mt-1";

        }

    } catch (error) {

        statusEl.innerText = "Connection Error!";

    }

};

// ======================================
// FINANCE CALCULATION
// ======================================

window.calculateFinance = function () {

    const selectedId = document.getElementById('modelSelect').value;

    const bike = allBikes.find(b => b.id === selectedId);

    if (!bike) return;

    const getVal = (id, fallback = 0) =>
        parseFloat(document.getElementById(id)?.value) || fallback;

    const mrp = parseFloat(bike.price) || 0;

    const discount = getVal('discountInput');

    const financeInsurance = parseFloat(bike.financeInsurance) || 0;

    const cashInsurance = parseFloat(bike.Insurance) || 0;

    const namsari = getVal('namsariInput', 3000);

    const dpPercentVal = getVal('dpPercent');

    const tenure = getVal('tenure');

    const customerExtraAdv = getVal('advEmiInput');

    const accCost =
        getVal('helmetInput') +
        getVal('legguardInput') +
        getVal('seatcoverInput') +
        getVal('othersInput');

    // =========================

    const afterDiscount = mrp - discount;

    const dpAmountOnly = afterDiscount * (dpPercentVal / 100);

    const loanAmount = afterDiscount - dpAmountOnly;

    // =========================

    let rate = 13.99;

    if (dpPercentVal >= 60) rate = 9.99;
    else if (dpPercentVal >= 50) rate = 11.99;
    else if (dpPercentVal >= 40) rate = 12.99;

    // =========================

    const monthlyRate = (rate / 12) / 100;

    const emi =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);

    // =========================

    const rawTotalDP =
        dpAmountOnly +
        namsari +
        cashInsurance +
        emi +
        accCost +
        customerExtraAdv;

    const roundingAdj =
        rawTotalDP % 1000 > 0
            ? (1000 - (rawTotalDP % 1000))
            : 0;

    const totalAdvEmiSync =
        emi + roundingAdj + customerExtraAdv;

    const finalTotalDP_A4 =
        dpAmountOnly +
        namsari +
        financeInsurance +
        totalAdvEmiSync;

    // =========================

    updateUI({

        bikeName: bike.name,

        custName:
            document.getElementById('custNameInput')?.value ||
            "Your Name",

        custPhone:
            document.getElementById('custPhoneInput')?.value ||
            "Contact",

        dealerName:
            document.getElementById('dealerNameInput')?.value ||
            "Samriddhi And Brothers Auto Pvt. Ltd.",

        mrp,
        discount,
        afterDiscount,
        financeInsurance,
        rate,
        dpAmountOnly,
        loanAmount,
        emi,
        totalAdvEmiSync,
        tenure,
        namsari,
        finalTotalDP_A4

    });

};

// ======================================
// UPDATE UI
// ======================================

function updateUI(data) {

    const format = (num) =>
        Math.round(num).toLocaleString();

    const formatDec = (num) =>
        Number(num).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const safeSet = (id, val) => {

        const el = document.getElementById(id);

        if (el) el.innerText = val;

    };

    // ======================================
    // TODAY DATE
    // ======================================

    const today = new Date();

    const formattedDate =
        today.toLocaleDateString('en-GB');

    // ======================================
    // DASHBOARD
    // ======================================

    safeSet('displayLoanAmt', `RS. ${format(data.loanAmount)}`);
    safeSet('displayEMI', `RS. ${formatDec(data.emi)}`);
    safeSet('displayDpAmt', `RS. ${format(data.dpAmountOnly)}`);

    // ======================================
    // A4 FORM
    // ======================================

    safeSet('a4Date', formattedDate);

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

    // ======================================
    // QUOTATION
    // ======================================

    safeSet('a4Date2', formattedDate);

    safeSet('a4CustName2', data.custName);

    safeSet('a4Model2', data.bikeName);

    safeSet('a4MRP2', format(data.mrp));

    // DATABASE / INPUT VALUES

    safeSet(
        'a4Color2',
        document.getElementById('manualColor')?.value || "---"
    );

    safeSet(
        'a4Reg2',
        document.getElementById('manualReg')?.value || "---"
    );

    safeSet(
        'a4Engine2',
        document.getElementById('manualEngine')?.value || "---"
    );

    safeSet(
        'a4Chassis2',
        document.getElementById('manualChassis')?.value || "---"
    );

    // ======================================
    // DISCOUNT SHOW / HIDE
    // ======================================

    const a4DiscRow =
        document.getElementById('a4DiscountRow');

    if (a4DiscRow) {

        if (data.discount > 0) {

            a4DiscRow.classList.remove('hidden');

            safeSet(
                'a4DiscountAmt',
                format(data.discount)
            );

            safeSet(
                'a4NetPrice',
                format(data.afterDiscount)
            );

        } else {

            a4DiscRow.classList.add('hidden');

        }

    }

}

// ======================================
// LISTENERS
// ======================================

document.addEventListener('input', () => {

    calculateFinance();

});

// ======================================

fetchBikes();
