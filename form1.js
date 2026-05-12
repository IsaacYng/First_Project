import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// ================= FIREBASE =================

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

// ================= UTIL =================

const $ = (id) => document.getElementById(id);

const safe = (id, val) => {
    const el = $(id);
    if (el) el.innerText = val;
};

// ================= NUMBER TO WORDS =================

function numberToWords(num) {
    num = Math.round(num);
    if (num === 0) return "Zero";

    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

    function inWords(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n/10)] + " " + a[n%10];
        if (n < 1000) return a[Math.floor(n/100)] + " Hundred " + inWords(n%100);
        if (n < 100000) return inWords(Math.floor(n/1000)) + " Thousand " + inWords(n%1000);
        if (n < 10000000) return inWords(Math.floor(n/100000)) + " Lakh " + inWords(n%100000);
        return inWords(Math.floor(n/10000000)) + " Crore " + inWords(n%10000000);
    }

    return inWords(num).replace(/\s+/g,' ').trim();
}

// ================= FETCH BIKES =================

async function fetchBikes() {
    const snap = await getDocs(collection(db, "bikes"));
    allBikes = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const select = $("modelSelect");

    if (select) {
        select.innerHTML = allBikes
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join("");

        select.addEventListener("change", calculateFinance);
    }

    calculateFinance();
}

// ================= CHASSIS SEARCH =================

window.findChassis = async function () {
    const val = $("chassisSearch").value.trim();
    const status = $("searchStatus");

    status.innerText = "Searching...";

    const q = query(collection(db,"inventory"), where("chassis","==",val));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const d = snap.docs[0].data();

        $("manualChassis").value = d.chassis || "";
        $("manualEngine").value = d.engine || "";
        $("manualReg").value = d.regNo || "";
        $("manualColor").value = d.color || "";

        const modelSelect = $("modelSelect");

        if (d.model && modelSelect) {
            for (let i=0;i<modelSelect.options.length;i++) {
                if (modelSelect.options[i].text === d.model) {
                    modelSelect.selectedIndex = i;
                    break;
                }
            }
        }

        status.innerText = "Loaded";
        syncManualToA4();
        calculateFinance();

    } else {
        status.innerText = "Not found";
    }
};

// ================= FINANCE =================

window.calculateFinance = function () {

    const bike = allBikes.find(b => b.id === $("modelSelect")?.value);
    if (!bike) return;

    const v = (id) => parseFloat($(id)?.value) || 0;

    const mrp = parseFloat(bike.price || 0);
    const discount = v("discountInput");
    const afterDiscount = mrp - discount;

    const dpPercent = v("dpPercent");
    const tenure = v("tenure");

    const insurance = parseFloat(bike.financeInsurance || bike.Insurance || 0);

    const namsari = v("namsariInput",3000);
    const advEmi = v("advEmiInput");

    const acc =
        v("helmetInput") +
        v("legguardInput") +
        v("seatcoverInput") +
        v("othersInput");

    const dp = afterDiscount * (dpPercent/100);
    const loan = afterDiscount - dp;

    let rate = 13.99;
    if (dpPercent >= 60) rate = 9.99;
    else if (dpPercent >= 50) rate = 11.99;
    else if (dpPercent >= 40) rate = 12.99;

    const r = rate/12/100;

    const emi =
        (loan*r*Math.pow(1+r,tenure)) /
        (Math.pow(1+r,tenure)-1);

    const totalDP =
        dp + namsari + insurance + emi + acc + advEmi;

    updateUI({
        bikeName: bike.name,
        mrp,
        discount,
        afterDiscount,
        dp,
        loan,
        emi,
        tenure,
        rate,
        insurance,
        namsari,
        advEmi,
        totalDP
    });
};

// ================= UI UPDATE =================

function updateUI(d) {

    const f = n => Math.round(n).toLocaleString();
    const fd = n => Number(n).toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });

    const date = new Date().toLocaleDateString('en-GB');

    // DASHBOARD
    safe("mrp",`RS. ${f(d.mrp)}`);
    safe("afterDiscount",`RS. ${f(d.afterDiscount)}`);

    safe("displayTotalDP",`RS. ${f(d.totalDP)}`);

    // A4
    safe("a4Date",date);
    safe("a4Date2",date);

    safe("a4CustName",$("custNameInput")?.value || "Name");
    safe("a4CustPhone",$("custPhoneInput")?.value || "Contact");
    safe("a4Dealer",$("dealerNameInput")?.value || "");

    safe("a4Model",d.bikeName);
    safe("a4Model2",d.bikeName);

    safe("a4MRP",fd(d.afterDiscount));
    safe("a4DP",fd(d.dp));
    safe("a4Loan",fd(d.loan));
    safe("a4Rate",d.rate.toFixed(2));
    safe("a4Tenure",d.tenure);

    safe("a4Ins",fd(d.insurance));
    safe("a4Namsari",fd(d.namsari));
    safe("a4AdvEmiAmt",fd(d.advEmi));
    safe("a4TotalDP",fd(d.totalDP));

    // DISCOUNT
    const row = $("a4DiscountRow");

    if (row) {
        if (d.discount > 0) {
            row.classList.remove("hidden");
            safe("a4DiscountAmt",f(d.discount));
            safe("a4NetPrice",f(d.afterDiscount));
        } else {
            row.classList.add("hidden");
        }
    }
}

// ================= SYNC MANUAL =================

function syncManualToA4() {
    ["Chassis","Engine","Reg","Color"].forEach(f=>{
        const v = $("manual"+f)?.value || "---";
        safe("a4"+f,v);
    });
}

// ================= INPUT =================

document.addEventListener("input",(e)=>{
    calculateFinance();
    if(e.target.id?.startsWith("manual")) syncManualToA4();
});

// INIT
fetchBikes();
