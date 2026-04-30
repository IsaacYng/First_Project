// 1. Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// 2. Firebase Configuration (Timrai project ko credentials)
const firebaseConfig = {
    apiKey: "AIzaSyAXQW4khEovrBUtP5JpYFTUch_p5KT-8F8",
    authDomain: "first-project-2082-12-26.firebaseapp.com",
    projectId: "first-project-2082-12-26",
    appId: "1:545170954251:web:0d2f7905834af3b0be8f0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Game State
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

/**
 * Step 1: Fetch real data from your "bikes" collection
 */
export async function startOfficeGame(numQ = 5) {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `<div class="text-center p-10 font-bold text-indigo-600 animate-pulse">Loading Office Data... 🚀</div>`;

    try {
        const querySnapshot = await getDocs(collection(db, "bikes"));
        const bikes = querySnapshot.docs.map(doc => doc.data());

        if (bikes.length < 2) {
            container.innerHTML = `<div class="text-red-500 p-6">Error: Master list ma data chhaina!</div>`;
            return;
        }

        prepareQuiz(bikes, numQ);
    } catch (error) {
        console.error("Firebase Error:", error);
        container.innerHTML = `<div class="text-red-500">Data connect bhayena!</div>`;
    }
}

/**
 * Step 2: Prepare random questions from the data
 */
function prepareQuiz(bikes, numQ) {
    quizQuestions = bikes
        .sort(() => 0.5 - Math.random())
        .slice(0, numQ)
        .map(bike => {
            const options_keys = [
                { key: 'price', label: 'Total Price' },
                { key: 'Insurance', label: 'Normal Insurance' },
                { key: 'financeInsurance', label: 'Finance Insurance' }
            ];
            const target = options_keys[Math.floor(Math.random() * options_keys.length)];
            const correctVal = Number(bike[target.key]) || 0;

            return {
                question: `${bike.name} ko **${target.label}** kati ho?`,
                correct: correctVal,
                options: generateSmartOptions(correctVal)
            };
        });

    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
}

/**
 * Step 3: UI Rendering
 */
function renderQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    const container = document.getElementById('quiz-container');
    const progress = (currentQuestionIndex / quizQuestions.length) * 100;

    container.innerHTML = `
        <div class="bg-white p-6 rounded-3xl shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-bottom-4">
            <div class="flex justify-between items-center mb-4">
                <span class="text-xs font-black text-indigo-400 uppercase tracking-widest">Q. ${currentQuestionIndex + 1}</span>
                <div class="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-indigo-600 h-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <h2 class="text-xl font-bold text-slate-800 mb-6 leading-tight">${q.question}</h2>
            
            <div class="grid grid-cols-1 gap-3">
                ${q.options.map(opt => `
                    <button onclick="checkGameAnswer(${opt})" 
                        class="group flex justify-between items-center p-4 bg-slate-50 border-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all">
                        <span class="font-bold text-slate-600 group-hover:text-indigo-700">Rs. ${opt.toLocaleString()}</span>
                        <i class="fa fa-chevron-right text-slate-300 group-hover:text-indigo-500"></i>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Global function to handle clicks
window.checkGameAnswer = (selected) => {
    if (selected === quizQuestions[currentQuestionIndex].correct) {
        score++;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        renderQuestion();
    } else {
        renderFinalScore();
    }
};

function renderFinalScore() {
    const container = document.getElementById('quiz-container');
    const rank = score === quizQuestions.length ? "Hulas Legend! 👑" : score >= 3 ? "Pro Seller! ⭐" : "Need Practice! 📚";
    
    container.innerHTML = `
        <div class="text-center p-8 bg-slate-900 rounded-3xl shadow-2xl text-white">
            <h3 class="text-5xl mb-2">🎉</h3>
            <p class="text-slate-400 uppercase tracking-widest text-xs font-bold">Your Result</p>
            <h1 class="text-6xl font-black text-indigo-400 my-4">${score}/${quizQuestions.length}</h1>
            <div class="py-2 px-4 bg-indigo-900/50 rounded-full inline-block text-indigo-300 font-bold mb-8">${rank}</div>
            
            <button onclick="location.reload()" 
                class="block w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-transform active:scale-95 shadow-lg">
                CONTINUE WORK
            </button>
        </div>
    `;
}

function generateSmartOptions(correct) {
    let opts = new Set([correct]);
    while (opts.size < 4) {
        let diff = Math.floor(correct * (0.1 + Math.random() * 0.3));
        let fake = Math.random() > 0.5 ? correct + diff : correct - diff;
        // Nearest 500 for professional look
        fake = Math.round(fake / 500) * 500;
        if (fake > 0 && fake !== correct) opts.add(fake);
    }
    return Array.from(opts).sort(() => 0.5 - Math.random());
}
