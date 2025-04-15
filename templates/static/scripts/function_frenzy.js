// function_frenzy.js

// Global state
let currentIndex = 0;
let questions = [];
let tasks = [];
let answers = [];

// Utility: shuffle array
function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

// Dynamically generate tasks per question
function generateTasks(questions) {
    const functionTypes = [
        { type: 'linear', image: '/static/games/func/linear.png', prompt: 'Қай график сызықтық функцияны білдіреді?', correct: 'linear' },
        { type: 'quadratic', image: '/static/games/func/quadratic.png', prompt: 'Қай график квадраттық функцияны білдіреді?', correct: 'quadratic' },
        { type: 'cubic', image: '/static/games/func/cubic.png', prompt: 'Қай график кубтық функция?', correct: 'cubic' },
        { type: 'reciprocal', image: '/static/games/func/reciprocal.png', prompt: 'Қай график кері пропорционалдықты көрсетеді?', correct: 'reciprocal' },
        { type: 'absolute', image: '/static/games/func/absolute.png', prompt: 'Қай график модуль функциясы?', correct: 'absolute' },
    ];

    const tasks = [];
    for (let i = 0; i < questions.length; i++) {
        const base = functionTypes[i % functionTypes.length];
        const options = shuffleArray([
            base,
            ...functionTypes.filter(f => f.type !== base.type).slice(0, 2)
        ]);

        tasks.push({
            prompt: base.prompt,
            options: options,
            correct: base.type
        });
    }
    return tasks;
}

// DOM elements
const challengeDiv = document.getElementById('graph-challenge');
const quizSection = document.getElementById('quiz-section');
const graphPrompt = document.getElementById('graph-prompt');
const graphOptions = document.getElementById('graph-options');
const quizContainer = document.getElementById('quiz-container');
const csrfToken = document.getElementById('csrf-token').value;
const quizId = document.getElementById('quiz-id').value; 
const userQuizId = document.getElementById('user-quiz-id').value; 
const sessionId = document.getElementById('session-id').value; 

// Start loading questions
async function initGame() {
    const quizId = document.getElementById('quiz-id').value;
    const sessionId = document.getElementById('session-id').value;

    const data = await loadQuiz(quizId, sessionId);
    if (!data) return;

    questions = data.questions;
    tasks = generateTasks(questions);
    currentIndex = 0;

    showTask(currentIndex);
}

function showTask(index) {
    const task = tasks[index];
    if (!task) return;

    quizSection.classList.add('hidden');
    challengeDiv.classList.remove('hidden');
    graphPrompt.textContent = task.prompt;
    graphOptions.innerHTML = '';

    task.options.forEach(opt => {
        const img = document.createElement('img');
        img.src = opt.image;
        img.dataset.type = opt.type;
        img.className = 'w-32 h-32 cursor-pointer bg-white rounded-lg p-4 hover:scale-105 transition-all';
        img.onclick = () => {
            if (opt.type === task.correct) {
                challengeDiv.classList.add('hidden');
                quizSection.classList.remove('hidden');
                renderQuestion(index);
            } else {
                alert("Қате! Тағы байқап көр");
            }
        };
        graphOptions.appendChild(img);
    });
}

function renderQuestion(index) {
    const q = questions[index];
    quizContainer.innerHTML = '';

    const questionEl = document.createElement('div');
    questionEl.className = 'flex gap-2 items-center text-2xl font-bold mb-4';
    questionEl.innerHTML = `${index + 1}. ${q.question_body}`;
    quizContainer.appendChild(questionEl);

    q.options.forEach(opt => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 bg-gray-800 text-white p-3 my-2 rounded cursor-pointer hover:bg-gray-700';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = opt.id;

        label.appendChild(input);
        const span = document.createElement('span');
        span.innerHTML = opt.option_body;
        label.appendChild(span);

        quizContainer.appendChild(label);
    });

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Жауап беру';
    submitBtn.className = 'mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700';
    submitBtn.onclick = () => {
        const selected = document.querySelector('input[name="option"]:checked');
        if (!selected) return alert("Жауап таңда!");

        answers.push({
            question_id: q.id,
            selected_option_ids: [parseInt(selected.value)]
        });

        currentIndex++;
        if (currentIndex < questions.length) {
            showTask(currentIndex);
        } else {
            submitQuiz(quizId, sessionId, answers, csrfToken).then(res => {
                if (res?.status === 'success') {
                    quizContainer.innerHTML = `<h2 class='text-2xl font-bold'>Ойын аяқталды! Сіз ${res.total_score} ұпай жинадыңыз.</h2>`;
                }

                setTimeout(() => {
                    if (userQuizId) {
                        location.href = `/user/quiz/${userQuizId}/`;
                    }
                }, 3000);
            });
        }
    };

    quizContainer.appendChild(submitBtn);
}

// Start the game
initGame();