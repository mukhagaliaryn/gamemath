document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;
    const userQuizId = document.getElementById('user-quiz-id').value;

    const pinDisplay = document.getElementById('pin-display');
    const questionBox = document.getElementById('question-box');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const checkBtn = document.getElementById('check-btn');

    const quizData = await loadQuiz(quizId, sessionId);
    const questions = quizData?.questions || [];
    const userAnswers = new Array(questions.length).fill(null);

    // Ұяшықтар жасау
    questions.forEach((_, idx) => {
        const slot = document.createElement('div');
        slot.className = 'pin-slot';
        slot.dataset.index = idx;
        slot.textContent = '_';
        pinDisplay.appendChild(slot);
    });

    let current = 0;

    function renderQuestion(index) {
        const question = questions[index];
        questionText.innerHTML = `${index + 1}. ${question.question_body}`;
        optionsContainer.innerHTML = '';

        question.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = opt.option_body;
            btn.onclick = () => {
                const pinSlot = pinDisplay.children[index];
                pinSlot.textContent = opt.id;
                userAnswers[index] = {
                    question_id: question.id,
                    selected_option_id: opt.id,
                    correct_option_id: question.options.find(o => o.is_correct).id
                };
                pinSlot.classList.add('filled');
                current++;
                if (current < questions.length) {
                    renderQuestion(current);
                } else {
                    checkBtn.classList.remove('hidden');
                    questionBox.innerHTML = '<h2 class="text-xl text-gray-600">Барлық ұяшық толды. Тексеруді басыңыз!</h2>';
                }
            };
            optionsContainer.appendChild(btn);
        });
    }

    checkBtn.addEventListener('click', async () => {
        let allCorrect = true;

        userAnswers.forEach((ans, idx) => {
            const slot = pinDisplay.children[idx];
            if (ans.selected_option_id === ans.correct_option_id) {
                slot.classList.add('correct');
            } else {
                slot.classList.add('wrong');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            checkBtn.textContent = "✅ Дұрыс! Аяқтау...";
            checkBtn.disabled = true;
            await submitQuiz(quizId, sessionId, userAnswers.map(a => ({
                question_id: a.question_id,
                selected_option_ids: [a.selected_option_id]
            })), csrfToken);
            setTimeout(() => {
                window.location.href = `/user/quiz/${userQuizId}/`;
            }, 3000);
        } else {
            checkBtn.textContent = "❌ Қате! Қайта басталады...";
            checkBtn.disabled = true;
            setTimeout(() => window.location.reload(), 3000);
        }
    });

    renderQuestion(current);
});