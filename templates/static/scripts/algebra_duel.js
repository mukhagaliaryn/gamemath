document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options');
    const submitBtn = document.getElementById('submit-answer');
    const feedbackEl = document.getElementById('feedback');
    const playerScoreEl = document.getElementById('player-score');
    const botScoreEl = document.getElementById('bot-score');
    const roundEl = document.getElementById('round');
    const finalMessage = document.getElementById('final-message');

    let questions = [];
    let currentRound = 0;
    let playerScore = 0;
    let botScore = 0;
    const answers = [];

    async function loadQuizData() {
        const data = await loadQuiz(quizId, sessionId);
        if (data && data.questions && data.questions.length > 0) {
            questions = data.questions;
            showQuestion();
        } else {
            questionText.textContent = '❌ Сұрақтарды жүктеу мүмкін болмады';
        }
    }

    function showQuestion() {
        if (currentRound >= questions.length) {
            return finishQuiz();
        }

        const q = questions[currentRound];
        questionText.innerHTML = q.question_body;
        roundEl.textContent = currentRound + 1;
        feedbackEl.textContent = '';

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

        // Бот жауабы (рандом)
        const botCorrect = Math.random() < 0.7;
        if (botCorrect) botScore++;

        answers.push({
            question_id: current.id,
            selected_option_ids: [selectedOptionId]  // массив күйінде
        });

        playerScoreEl.textContent = playerScore;
        botScoreEl.textContent = botScore;

        currentRound++;
        setTimeout(showQuestion, 1500);
    }

    async function finishQuiz() {
        submitBtn.disabled = true;
        questionText.textContent = '📤 Тест нәтижесі жіберілуде...';

        const response = await submitQuiz(quizId, sessionId, answers, csrfToken);
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