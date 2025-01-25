// Деректерді жүктеу
// -------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    const quizContainer = document.getElementById('quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    const progressBar = document.getElementById('progress-bar');
    const timerDisplay = document.getElementById('timer-display');


    let questions = [];   
    let answers = [];     
    let currentIndex = 0; 
    let timerObj = null;  
    const TOTAL_TIME = 10 * 60;


    const quizData = await loadQuiz(quizId, sessionId);
    if (!quizData || !quizData.questions) {
        alert('Сұрақтарды жүктеу мүмкін болмады!');
        return;
    }
    questions = quizData.questions;

    renderQuestion(currentIndex);

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
        saveAnswer();
        if (timerObj) timerObj.stop(); // таймерді тоқтата саламыз
        await doSubmit();
    });


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
                <div class="grid grid-cols-4 gap-4 mt-4">
                    ${question.options.map((opt, i) => `
                        <div 
                            class="card h-80 relative rounded-xl bg-white shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <div class="card-front absolute w-full h-full flex justify-center items-center text-4xl text-gray-900 font-bold">
                                <img src="/static/games/random_card/qa.png" class="w-24">
                            </div>
                            <div class="card-back absolute w-full h-full absolute flex items-center p-6">
                                <label
                                    class="ms-2 font-medium text-gray-900 flex-1"
                                >
                                    ${opt.option_body}
                                </label>

                                <input
                                    type="radio"
                                    id="option_${opt.id}"
                                    name="question_${question.id}"
                                    value="${opt.id}"
                                    class="absolute bottom-5 right-5 z-50 w-8 h-8 text-orange-500 border-4 border-orange-300 focus:ring-orange-500 focus:ring-2 transition-all cursor-pointer"
                                    onclick="playAudio('click-audio')"
                                >
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const cards = document.querySelectorAll(".card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                playAudio("next-audio");
                card.classList.add("opened")
            })
        })

        const stored = answers.find(a => a.question_id === question.id);
        if (stored) {
            stored.selected_option_ids.forEach(optionId => {
                const inputEl = document.getElementById(`option_${optionId}`);
                if (inputEl) {
                    inputEl.checked = true;
                }
            });
        }

        updateProgressBar();
        updateButtons();
    }


    function saveAnswer() {
        const question = questions[currentIndex];
        if (!question) return;

        const selected = Array.from(
            document.querySelectorAll(`input[name="question_${question.id}"]:checked`)
        ).map(el => parseInt(el.value));
        answers = answers.filter(a => a.question_id !== question.id);
        answers.push({
            question_id: question.id,
            selected_option_ids: selected
        });
    }


    async function doSubmit() {
        const result = await submitQuiz(quizId, sessionId, answers, csrfToken);
        if (result && result.status === 'success') {
            alert(`Тест аяқталды! Жалпы ұпай: ${result.total_score}`);
            location.href = `/user/quiz/${userQuizId}/`;
        } else {
            alert('Тестті аяқтау кезінде қате орын алды!');
        }
    }


    function updateProgressBar() {
        const progress = ((currentIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }


    function updateButtons() {
        prevBtn.disabled = (currentIndex === 0);
        nextBtn.disabled = (currentIndex === questions.length - 1);
        finishBtn.disabled = (currentIndex !== questions.length - 1);
    }
});