import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bikesCol = collection(db, "bikes");

// १. बाइक लोड गर्ने र Dropdown मा भर्ने
onSnapshot(bikesCol, (snapshot) => {
    const select = document.getElementById('modelSelect'); // HTML को ID सँग मिलाइएको
    if (!select) return;
    
    select.innerHTML = '<option value="">मोडल छान्नुहोस्</option>';
    snapshot.forEach((doc) => {
        const bike = doc.data();
        let option = document.createElement('option');
        option.value = doc.id;
        option.text = bike.name;
        option.dataset.price = bike.price;
        option.dataset.ins = bike.Insurance1 || 0; // पुरानो इन्स्योरेन्स
        select.appendChild(option);
    });
});

// २. बाइक छानेपछि डाटा अपडेट गर्ने
window.updateDetails = function() {
    const select = document.getElementById('modelSelect');
    const option = select.options[select.selectedIndex];
    
    if (option.value) {
        document.getElementById('mrp').innerText = "RS. " + option.dataset.price;
        document.getElementById('displayIns').innerText = "RS. " + option.dataset.ins;
        calculateFinance();
    }
};

// ३. हिसाब गर्ने फङ्सन
window.calculateFinance = function() {
    const select = document.getElementById('modelSelect');
    const option = select.options[select.selectedIndex];
    if (!option || !option.value) return;

    const mrp = parseFloat(option.dataset.price) || 0;
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const insurance = parseFloat(option.dataset.ins) || 0;
    const dpPercent = parseFloat(document.getElementById('dpPercent').value) || 50;
    const tenure = parseInt(document.getElementById('tenure').value) || 12;
    
    // अतिरिक्त खर्चहरू (तपाईंको HTML बाट)
    const namsari = parseFloat(document.getElementById('namsariInput').value) || 0;
    const helmet = parseFloat(document.getElementById('helmetInput').value) || 0;
    const legguard = parseFloat(document.getElementById('legguardInput').value) || 0;
    const seatcover = parseFloat(document.getElementById('seatcoverInput').value) || 0;
    const others = parseFloat(document.getElementById('othersInput').value) || 0;

    const afterDiscount = mrp - discount;
    const dpAmount = (afterDiscount * dpPercent) / 100;
    const totalDP = dpAmount + insurance + namsari + helmet + legguard + seatcover + others;

    // Loan र EMI
    const loanAmt = afterDiscount - dpAmount;
    const rate = 14; // १४% ब्याज
    const monthlyRate = (rate / 100) / 12;
    const emi = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

    // नतिजा देखाउने
    document.getElementById('displayTotalDP').innerText = "RS. " + Math.round(totalDP).toLocaleString();
    document.getElementById('afterDiscount').innerText = "RS. " + afterDiscount.toLocaleString();
    document.getElementById('displayEMI').innerText = "RS. " + Math.round(emi).toLocaleString();
    document.getElementById('displayLoanAmt').innerText = "RS. " + Math.round(loanAmt).toLocaleString();
    document.getElementById('displayDpAmt').innerText = "RS. " + Math.round(dpAmount).toLocaleString();
    document.getElementById('displayRate').innerText = rate + "%";
};

// Event Listeners थप्ने ताकि टाइप गर्दा आफै हिसाब होस्
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        calculateFinance();
    }
});
