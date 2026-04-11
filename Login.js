import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// १. इमेलबाट लगइन
document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.href = "admin.html";
    } catch (e) { alert("Login Failed: " + e.message); }
};

// २. गुगलबाट लगइन (Continue with Google)
document.getElementById('googleBtn').onclick = async () => {
    try {
        await signInWithPopup(auth, provider);
        window.location.href = "admin.html";
    } catch (e) { alert("Google Login Failed"); }
};

// ३. पासवर्ड बिर्सिएमा
document.getElementById('forgotBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    if(!email) return alert("Please enter email first");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent to your email!");
    } catch (e) { alert(e.message); }
};

