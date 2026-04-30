// --- 4. Q&A QUIZ SYSTEM ---
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

window.startQuiz = (numQuestions = 5) => {
    if (allMasterBikes.length < 3) return alert("Add at least 3 bikes in Master List first!");
    
    // Prepare Questions from your Firestore Data
    quizQuestions = [...allMasterBikes]
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, numQuestions)
        .map(bike => {
            const types = ['price', 'Insurance', 'financeInsurance'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let questionText = `What is the **${type.toUpperCase()}** for **${bike.name}**?`;
            let correctAnswer = bike[type];
            
            // Generate 3 wrong options
            let options = [correctAnswer];
            while(options.length < 4) {
                let randomVal = Math.floor(correctAnswer * (0.5 + Math.random()));
                if(!options.includes(randomVal)) options.push(randomVal);
            }

            return {
                question: questionText,
                correct: correctAnswer,
                options: options.sort(() => 0.5 - Math.random())
            };
        });

    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
};

function showQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    const quizArea = document.getElementById('quiz-container');
    
    quizArea.innerHTML = `
        <div class="animate-fade-in p-6 bg-white rounded-2xl shadow-xl border-2 border-indigo-100">
            <p class="text-sm font-bold text-indigo-500 mb-2 font-mono">QUESTION ${currentQuestionIndex + 1}/${quizQuestions.length}</p>
            <h3 class="text-xl font-bold text-slate-800 mb-6">${q.question}</h3>
            <div class="grid grid-cols-1 gap-3">
                ${q.options.map(opt => `
                    <button onclick="handleAnswer(${opt})" 
                        class="p-4 text-left border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all font-semibold">
                        Rs. ${Number(opt).toLocaleString()}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

window.handleAnswer = (selected) => {
    if (selected === quizQuestions[currentQuestionIndex].correct) score++;
    
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
};

function showResult() {
    let reward = score === quizQuestions.length ? "🥇 Gold Expert" : (score >= 3 ? "🥈 Silver Semi-Pro" : "🥉 Bronze Learner");
    const quizArea = document.getElementById('quiz-container');
    
    quizArea.innerHTML = `
        <div class="text-center p-8 bg-slate-900 text-white rounded-2xl shadow-2xl">
            <h2 class="text-4xl mb-4">🎉</h2>
            <h3 class="text-2xl font-bold mb-2">Quiz Finished!</h3>
            <p class="text-slate-400 mb-6">Your Score: <span class="text-yellow-400 font-bold">${score}/${quizQuestions.length}</span></p>
            <div class="inline-block px-6 py-2 bg-indigo-600 rounded-full font-bold mb-6">${reward}</div>
            <button onclick="startQuiz()" class="block w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-200">Try Again</button>
        </div>
    `;
}
