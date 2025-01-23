// static/scripts/simple_quiz.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1) HTML элементтерін DOM-нан алу
    const quizContainer = document.getElementById('quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    const progressBar = document.getElementById('progress-bar');
    const timerDisplay = document.getElementById('timer-display');

    // 2) Жасырын (<input type="hidden">) өрістерден мәндерді жинау
    const quizId = document.getElementById('quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    // 3) Айнымалылар
    let questions = [];   // Сұрақтар массиві
    let answers = [];     // Жауаптар массиві: [{ question_id, selected_option_ids: [...] }, ...]
    let currentIndex = 0; // Қай сұрақта тұрмыз
    let timerObj = null;  // createTimer қайтарған объект (керек болса stop() шақырамыз)
    const TOTAL_TIME = 120; // 120 секунд = 2 минут

    // ---- A) Серверден мәліметтер алу:
    const quizData = await loadQuiz(quizId, sessionId);
    if (!quizData || !quizData.questions) {
        alert('Сұрақтарды жүктеу мүмкін болмады!');
        return;
    }
    questions = quizData.questions;

    // ---- B) Алдымен бірінші сұрақты көрсетеміз
    renderQuestion(currentIndex);

    // ---- C) Таймерді бастаймыз
    timerObj = createTimer({
        duration: TOTAL_TIME,
        onTick: (remainSec) => {
            if (timerDisplay) {
                timerDisplay.textContent = `Қалған уақыт: ${formatTime(remainSec)}`;
            }
        },
        onFinish: () => {
            alert('Уақыт аяқталды! Тест автоматты түрде жіберіледі.');
            saveAnswer();
            doSubmit(); // уақыты біткенде бірден submit
        }
    });

    // ---- D) Батырмалардың event-тері
    prevBtn.addEventListener('click', () => {
        saveAnswer();
        if (currentIndex > 0) {
            currentIndex--;
            renderQuestion(currentIndex);
        }
    });
    nextBtn.addEventListener('click', () => {
        saveAnswer();
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            renderQuestion(currentIndex);
        }
    });
    finishBtn.addEventListener('click', async () => {
        // Ерікті түрде “Аяқтау”
        saveAnswer();
        if (timerObj) timerObj.stop(); // таймерді тоқтата саламыз
        await doSubmit();
    });

    // ---- E) ФУНКЦИЯЛАР

    // ** Серверден келген бастапқы сұрақ(тар)ты экранда шығару
    function renderQuestion(index) {
        const question = questions[index];
        if (!question) return;

        // 1) HTML дайындау
        quizContainer.innerHTML = `
            <div class="question px-4 grid gap-4">
                <div class="flex items-center justify-center gap-4 bg-white p-6 rounded-xl">
                    <div class="py-6 px-10 rounded-2xl bg-orange-500">
                        <h1 class="text-6xl font-black text-white">${index + 1}</h1>
                    </div>
                    <h1 class="text-2xl font-semibold text-gray-900">${question.question_body}</h1>
                </div>
                <div class="grid gap-4 lg:grid-cols-2 mt-4">
                    ${question.options.map(opt => `
                        <div class="flex items-center gap-2 p-6 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-all">
                            <input
                                type="radio"
                                id="option_${opt.id}"
                                name="question_${question.id}"
                                value="${opt.id}"
                                class="w-8 h-8 text-orange-500 border-4 border-orange-300 focus:ring-orange-500 focus:ring-2 transition-all cursor-pointer"
                                onclick="playAudio('click-audio')"
                            >
                            <label
                                for="option_${opt.id}"
                                class="ms-2 font-medium text-gray-900 flex-1 cursor-pointer"
                            >
                                ${opt.option_body}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 2) Бегіленген жауаптарды сақтап отыру
        const stored = answers.find(a => a.question_id === question.id);
        if (stored) {
            stored.selected_option_ids.forEach(optionId => {
                const inputEl = document.getElementById(`option_${optionId}`);
                if (inputEl) {
                    inputEl.checked = true;
                }
            });
        }

        // 3) Прогресс-бар
        updateProgressBar();
        // 4) Батырмаларды жаңартып отыру
        updateButtons();
    }


    // ** Ағымдағы сұраққа таңдалған опцияларды answers[] массивіне жазу
    function saveAnswer() {
        const question = questions[currentIndex];
        if (!question) return;

        // radio (немесе checkbox болса, бәрін жинау)
        const selected = Array.from(
            document.querySelectorAll(`input[name="question_${question.id}"]:checked`)
        ).map(el => parseInt(el.value));

        // Бұрынғы жауапты өшіреміз
        answers = answers.filter(a => a.question_id !== question.id);

        // Жаңа жауапты қосамыз
        answers.push({
            question_id: question.id,
            selected_option_ids: selected
        });
    }


    // ** Жауаптарды серверге submitQuiz() арқылы жіберу
    async function doSubmit() {
        const result = await submitQuiz(quizId, sessionId, answers, csrfToken);
        if (result && result.status === 'success') {
            alert(`Тест аяқталды! Жалпы ұпай: ${result.total_score}`);
            // /user/quiz/XXX бетіне көшеміз
            location.href = `/user/quiz/${userQuizId}/`;
        } else {
            alert('Тестті аяқтау кезінде қате орын алды!');
        }
    }


    // ** Прогресс-барды жаңарту
    function updateProgressBar() {
        const progress = ((currentIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }


    //** Батырмалардың күйін жаңарту
    function updateButtons() {
        prevBtn.disabled = (currentIndex === 0);
        nextBtn.disabled = (currentIndex === questions.length - 1);
        finishBtn.disabled = (currentIndex !== questions.length - 1);
    }
});