document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id')?.value;
    const sessionId = document.getElementById('session-id')?.value;
    const csrfToken = document.getElementById('csrf-token')?.value;
    const userQuizId = document.getElementById('user-quiz-id')?.value;

    const playerScoreEl = document.getElementById('player-score');
    const botScoreEl = document.getElementById('bot-score');
    const roundEl = document.getElementById('round');
    const finalMessage = document.getElementById('final-message');

    const figureStep = document.getElementById('figure-step');
    const figurePrompt = document.getElementById('figure-question');
    const figureOptions = document.getElementById('figure-options');
    const figureFeedback = document.getElementById('figure-feedback');

    const quizStep = document.getElementById('quiz-step');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options');
    const feedbackEl = document.getElementById('feedback');
    const submitBtn = document.getElementById('submit-answer');

    let currentRound = 0;
    let playerScore = 0;
    let botScore = 0;
    let questions = [];
    const answers = [];
    const figureTasks = [];

    const allFigures = [
        { label: "⭕ Шеңбер", value: "circle" },
        { label: "🔺 Үшбұрыш", value: "triangle" },
        { label: "◼ Шаршы", value: "square" },
        { label: "🔻 Трапеция", value: "trapezoid" },
        { label: "▭ Тіктөртбұрыш", value: "rectangle" },
        { label: "⬠ Алтыбұрыш", value: "hexagon" }
    ];

    async function loadQuizData() {
        const data = await window.loadQuiz(quizId, sessionId);
        if (data && data.questions && data.questions.length > 0) {
            questions = data.questions;

            const possiblePrompts = [
                { prompt: "Барлық қабырғалары тең әрі бұрыштары 90° болатын фигураны таңдаңыз.", correct: "square" },
                { prompt: "Барлық нүктелері бірдей қашықтықта орналасқан фигураны таңдаңыз.", correct: "circle" },
                { prompt: "Үш қабырғадан тұратын фигураны таңдаңыз.", correct: "triangle" },
                { prompt: "Екі қабырғасы параллель болатын фигураны таңдаңыз.", correct: "trapezoid" },
                { prompt: "Төрт қабырғасы бар, тек қарама-қарсы қабырғалары тең болатын фигураны таңдаңыз.", correct: "rectangle" }
            ];

            for (let i = 0; i < questions.length; i++) {
                const p = possiblePrompts[i % possiblePrompts.length];
                const incorrectOptions = allFigures.filter(f => f.value !== p.correct);
                const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
                const correctOption = allFigures.find(f => f.value === p.correct);
                const options = [...shuffledIncorrect, correctOption].sort(() => 0.5 - Math.random());
                figureTasks.push({ prompt: p.prompt, correct: p.correct, options });
            }

            showFigureStep();
        } else {
            figurePrompt.textContent = '❌ Сұрақтарды жүктеу мүмкін болмады';
        }
    }

    function showFigureStep() {
        figureStep.classList.remove('hidden');
        quizStep.classList.add('hidden');
        figureFeedback.textContent = '';
        roundEl.textContent = currentRound + 1;

        const task = figureTasks[currentRound];
        figurePrompt.textContent = task.prompt;
        figureOptions.innerHTML = '';

        task.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "bg-gray-700 hover:bg-blue-600 p-3 rounded";
            btn.textContent = opt.label;
            btn.setAttribute('data-value', opt.value);
            btn.onclick = () => {
                const selected = btn.getAttribute('data-value');
                if (selected === task.correct) {
                    figureFeedback.textContent = '✅ Дұрыс!';
                    setTimeout(showQuizStep, 1000);
                } else {
                    figureFeedback.textContent = '❌ Қате! Қайта таңдаңыз.';
                }
            };
            figureOptions.appendChild(btn);
        });
    }

    function showQuizStep() {
        figureStep.classList.add('hidden');
        quizStep.classList.remove('hidden');
        feedbackEl.textContent = '';

        const q = questions[currentRound];
        questionText.innerHTML = q.question_body;
        optionsContainer.innerHTML = '';

        q.options.forEach((opt) => {
            const optionId = `option-${opt.id}`;
            const optionHTML = `
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="option" value="${opt.id}" id="${optionId}" class="form-radio h-5 w-5 text-blue-500">
            <span>${opt.option_body}</span>
          </label>
        `;
            optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
        });
    }

    function getSelectedOptionId() {
        const selected = document.querySelector('input[name="option"]:checked');
        return selected ? parseInt(selected.value) : null;
    }

    function handleAnswer() {
        const selectedOptionId = getSelectedOptionId();
        if (!selectedOptionId) {
            feedbackEl.textContent = '⚠️ Жауап таңдаңыз!';
            return;
        }

        const current = questions[currentRound];
        const selected = current.options.find(opt => opt.id === selectedOptionId);
        const isCorrect = selected?.is_correct === true;

        if (isCorrect) {
            playerScore++;
            feedbackEl.textContent = '✅ Дұрыс жауап!';
        } else {
            feedbackEl.textContent = '❌ Қате жауап!';
        }

        const botCorrect = Math.random() < 0.7;
        if (botCorrect) botScore++;

        answers.push({
            question_id: current.id,
            selected_option_ids: [selectedOptionId]
        });

        playerScoreEl.textContent = playerScore;
        botScoreEl.textContent = botScore;

        currentRound++;
        if (currentRound < questions.length) {
            setTimeout(showFigureStep, 1500);
        } else {
            setTimeout(finishQuiz, 1500);
        }
    }

    async function finishQuiz() {
        submitBtn.disabled = true;
        questionText.textContent = '📤 Тест нәтижесі жіберілуде...';

        const response = await window.submitQuiz(quizId, sessionId, answers, csrfToken);
        finalMessage.classList.remove('hidden');

        if (response && response.status === 'success') {
            finalMessage.textContent = `🎉 Тест аяқталды! Сіздің ұпайыңыз: ${playerScore} / ${questions.length}`;
        } else {
            finalMessage.textContent = '⚠️ Тестті серверге жіберу кезінде қате кетті';
        }

        setTimeout(() => {
            if (userQuizId) {
                location.href = `/user/quiz/${userQuizId}/`;
            }
        }, 3000);
    }

    submitBtn.addEventListener('click', handleAnswer);

    await loadQuizData();
});
