// static/scripts/race_battle.js

let quizData = [];
let currentQuestionIndex = 0;
let playerPos = 0;
let botPos = 0;
let totalSteps = 0;

const quizId = document.getElementById('quiz-id').value;
const sessionId = document.getElementById('session-id').value;
const csrfToken = document.getElementById('csrf-token').value;
const userQuizId = document.getElementById('user-quiz-id').value;

function renderTrack(trackId, position, label) {
    const track = document.getElementById(trackId);
    track.innerHTML = '';
    for (let i = 0; i < totalSteps + 1; i++) {
        const cell = document.createElement('div');
        cell.className = 'h-14 flex items-center justify-center rounded bg-white';
        if (i === position) {
            cell.classList.add(label === 'player' ? 'bg-green-500' : 'bg-blue-500');
            cell.innerText = label === 'player' ? '👤' : '🤖';
        }
        track.appendChild(cell);
    }
}

function renderQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        return checkWinner();
    }
    const q = quizData[currentQuestionIndex];
    console.log('Current Question:', q);

    document.getElementById('question-text').innerHTML = q.text;
    const optionsBox = document.getElementById('options');
    optionsBox.innerHTML = '';

    if (!q.options || q.options.length === 0) {
        optionsBox.innerHTML = '<div class="text-red-500">Сұрақ нұсқалары табылмады.</div>';
        return;
    }

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'block w-full text-left px-4 py-2 border rounded hover:bg-gray-100 bg-gray-50';
        btn.innerHTML = opt.text;
        btn.onclick = () => handleAnswer(opt.id, q.correct_option_id);
        optionsBox.appendChild(btn);
    });
}

function handleAnswer(selectedId, correctId) {
    const optionButtons = document.querySelectorAll('#options button');
    optionButtons.forEach(btn => btn.disabled = true);

    optionButtons.forEach(btn => {
        const isCorrect = parseInt(btn.onclick.toString().match(/opt\\.id\\, (\\d+)/)?.[1]) === correctId;
        if (parseInt(btn.dataset.optionId) === correctId) {
            btn.classList.add('bg-green-200', 'border-green-600', 'text-green-800');
        } else if (parseInt(btn.dataset.optionId) === selectedId) {
            btn.classList.add('bg-red-200', 'border-red-600', 'text-red-800');
        } else {
            btn.classList.add('opacity-50');
        }
    });

    if (selectedId === correctId) playerPos++;
    const botCorrect = Math.random() < 0.7;
    if (botCorrect) botPos++;

    renderTrack('player-track', playerPos, 'player');
    renderTrack('bot-track', botPos, 'bot');

    currentQuestionIndex++;
    setTimeout(() => {
        if (playerPos >= totalSteps || botPos >= totalSteps || currentQuestionIndex >= quizData.length) {
            checkWinner();
        } else {
            renderQuestion();
        }
    }, 1000);
}


function checkWinner() {
    const result = document.getElementById('result');
    const optionsBox = document.getElementById('options');
    optionsBox.innerHTML = '';

    if (playerPos >= totalSteps || botPos >= totalSteps) {
        const answers = quizData.slice(0, currentQuestionIndex).map(q => ({
            question_id: q.id,
            selected_option_ids: [q.correct_option_id]
        }));

        submitQuiz(quizId, sessionId, answers, csrfToken).then(() => {
            if (playerPos >= totalSteps && botPos >= totalSteps) {
                result.textContent = 'Тең ойын!';
            } else if (playerPos >= totalSteps) {
                result.textContent = 'Сіз жеңдіңіз! 🎉';
            } else {
                result.textContent = 'Бот жеңді! 🤖';
            }
            setTimeout(() => {
                location.href = `/user/quiz/${userQuizId}`;
            }, 3000);
        });
    } else {
        result.textContent = 'Мәреге ешкім жетпеді. Ойын қайта басталады...';
        setTimeout(() => location.reload(), 3000);
    }
}

async function initRaceGame() {
    const data = await loadQuiz(quizId, sessionId);
    if (!data) return;

    quizData = data.questions
        .filter(q => q.options && q.options.length > 0)
        .map(q => {
            const correct = q.options.find(opt => opt.is_correct);
            return {
                id: q.id,
                text: q.question_body || '',
                options: q.options.map(opt => ({
                    id: opt.id,
                    text: opt.option_body
                })),
                correct_option_id: correct?.id || null
            };
        });

    totalSteps = quizData.length;

    renderTrack('player-track', playerPos, 'player');
    renderTrack('bot-track', botPos, 'bot');
    renderQuestion();
}

document.addEventListener('DOMContentLoaded', initRaceGame);