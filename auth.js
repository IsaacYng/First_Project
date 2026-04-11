import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    // ... बाँकी config उस्तै हुन्छ
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// १. लगइन फङ्सन
document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // २. युजरको रोल चेक गर्ने (Firestore बाट)
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            // यदि डाटाबेसमा अनुमति छ भने मात्र एडमिन प्यानलमा पठाउने
            window.location.href = "admin.html";
        } else {
            alert("Account exists but no permission assigned. Contact Main Admin.");
        }
    } catch (e) { alert("Error: " + e.message); }
});

// ३. पासवर्ड रिसेट (OTP को सट्टा सुरक्षित इमेल लिङ्क)
document.getElementById('forgotBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    if(!email) return alert("Please enter your email address first.");
    
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent to your email! Please check your inbox.");
    } catch (e) { alert(e.message); }
});
  
