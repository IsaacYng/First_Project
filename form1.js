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

// ================= STATE (SINGLE SOURCE OF TRUTH) =================

const state = {
    bikes: [],
    selectedBike: null
};

// ================= HELPERS =================

const $ = (id) => document.getElementById(id);

const set = (id, value) => {
    const el = $(id);
    if (el) el.innerText = value;
};

const val = (id, fallback = 0) =>
    parseFloat($(id)?.value) || fallback;

// ================= NUMBER TO WORDS =================

function numberToWords(num) {
    num = Math.round(num);
    if (num === 0) return "Zero";

    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

    function w(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n/10)] + " " + a[n%10];
        if (n < 1000) return a[Math.floor(n/100)] + " Hundred " + w(n%100);
        if (n < 100000) return w(Math.floor(n/1000)) + " Thousand " + w(n%1000);
        if (n < 10000000) return w(Math.floor(n/100000)) + " Lakh " + w(n%100000);
        return w(Math.floor(n/10000000)) + " Crore " + w(n%10000000);
    }

    return w(num).replace(/\s+/g,' ').trim();
}

// ================= FETCH BIKES =================

async function fetchBikes() {
    const snap = await getDocs(collection(db, "bikes"));

    state.bikes = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const select = $("modelSelect");

    if (select) {
        select.innerHTML = state.bikes
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join("");

        select.addEventListener("change", calculate);
    }

    calculate();
}

// ================= CHASSIS SEARCH =================

window.findChassis = async function () {

    const search = $("chassisSearch").value.trim();
    const status = $("searchStatus");

    if (!search) return;

    status.innerText = "Searching...";

    const q = query(
        collection(db, "inventory"),
        where("chassis", "==", search)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {

        const d = snap.docs[0].data();

        $("manualChassis").value = d.chassis || "";
        $("manualEngine").value = d.engine || "";
        $("manualReg").value = d.regNo || "";
        $("manualColor").value = d.color || "";

        const select = $("modelSelect");

        if (d.model && select) {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === d.model) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }

        status.innerText = "Loaded";
        syncManual();
        calculate();

    } else {
        status.innerText = "Not found";
    }
};

// ================= MAIN CALCULATION =================

window.calculate = function () {

    const bike = state.bikes.find(
        b => b.id === $("modelSelect")?.value
    );

    if (!bike) return;

    const mrp = Number(bike.price || 0);

    const discount = val("discountInput");
    const afterDiscount = mrp - discount;

    const dpPercent = val("dpPercent");
    const tenure = val("tenure");

    const insurance = Number(bike.financeInsurance || bike.Insurance || 0);

    const namsari = val("namsariInput", 3000);
    const advEmi = val("advEmiInput");

    const accessories =
        val("helmetInput") +
        val("legguardInput") +
        val("seatcoverInput") +
        val("othersInput");

    const dp = afterDiscount * (dpPercent / 100);
    const loan = afterDiscount - dp;

    let rate = 13.99;
    if (dpPercent >= 60) rate = 9.99;
    else if (dpPercent >= 50) rate = 11.99;
    else if (dpPercent >= 40) rate = 12.99;

    const r = rate / 12 / 100;

    const emi =
        (loan * r * Math.pow(1 + r, tenure)) /
        (Math.pow(1 + r, tenure) - 1);

    const totalDP =
        dp + namsari + insurance + emi + accessories + advEmi;

    state.selectedBike = bike;

    state.result = {
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
    };

    render();
};

// ================= RENDER UI =================

function render() {

    const d = state.result;
    if (!d) return;

    const f = n => Math.round(n).toLocaleString();
    const fd = n => Number(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const date = new Date().toLocaleDateString('en-GB');

    // DASHBOARD
    set("mrp", `RS. ${f(d.mrp)}`);
    set("afterDiscount", `RS. ${f(d.afterDiscount)}`);
    set("displayTotalDP", `RS. ${f(d.totalDP)}`);

    // DATE
    set("a4Date", date);
    set("a4Date2", date);

    // CUSTOMER
    set("a4CustName", $("custNameInput")?.value || "Name");
    set("a4CustPhone", $("custPhoneInput")?.value || "Contact");
    set("a4Dealer", $("dealerNameInput")?.value || "");

    // BIKE
    set("a4Model", d.bikeName);
    set("a4Model2", d.bikeName);

    set("a4MRP", fd(d.afterDiscount));
    set("a4DP", fd(d.dp));
    set("a4Loan", fd(d.loan));
    set("a4Rate", d.rate.toFixed(2));
    set("a4Tenure", d.tenure);

    set("a4Ins", fd(d.insurance));
    set("a4Namsari", fd(d.namsari));
    set("a4AdvEmiAmt", fd(d.advEmi));
    set("a4TotalDP", fd(d.totalDP));

    // DISCOUNT
    const row = $("a4DiscountRow");

    if (row) {
        if (d.discount > 0) {
            row.classList.remove("hidden");
            set("a4DiscountAmt", f(d.discount));
            set("a4NetPrice", f(d.afterDiscount));
        } else {
            row.classList.add("hidden");
        }
    }

    syncManual();
}

// ================= MANUAL SYNC =================

function syncManual() {

    const map = ["Chassis","Engine","Reg","Color"];

    map.forEach(f => {
        const v = $("manual"+f)?.value || "---";
        set("a4"+f, v);
    });
}

// ================= INPUT LISTENER =================

document.addEventListener("input", (e) => {
    calculate();

    if (e.target.id?.startsWith("manual")) {
        syncManual();
    }
});

// ================= INIT =================

fetchBikes();
