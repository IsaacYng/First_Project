import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// १. तपाईँको फायरबेस कन्फिगरेसन
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// २. लगइन अवस्था चेक गर्ने (यदि पहिले नै लगइन छ भने एडमिनमा पठाउने)
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "admin.html";
    }
});

// ३. Google Login
const googleBtn = document.getElementById('googleBtn');
if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then(() => {
                window.location.href = "admin.html";
            })
            .catch((err) => alert("Google Login Error: " + err.message));
    });
}

// ४. Email Login (यसलाई window.emailLogin बनाइएको छ ताकि HTML को onclick ले काम गरोस्)
window.emailLogin = () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    
    if(email && pass) {
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => {
                window.location.href = "admin.html";
            })
            .catch((err) => {
                alert("Login Failed: " + err.message);
            });
    } else {
        alert("कृपया इमेल र पासवर्ड भर्नुहोस्।");
    }
};
        
