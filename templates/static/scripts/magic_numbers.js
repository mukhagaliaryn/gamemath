document.addEventListener('DOMContentLoaded', async function () {
    const quizId = document.getElementById('quiz-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    let questions = [];
    let userAnswers = [];
    let selectedOptions = [];
    let selectedMagicOption = null;
    let currentMagicQuestionIndex = 0;
    let currentQuestionIndex = 0;
    let gameState = "find_magic_number";
    let timer = null; // Таймерді сақтау үшін

    const quizData = await loadQuiz(quizId, sessionId);
    if (!quizData) {
        console.error("Ойынды жүктеу кезінде қате болды.");
        return;
    }
    questions = quizData.questions;

    // Magic Numbers
    const magicQuestions = [
        {
            question: "Тақ санды таңдаңыз",
            options: [4, 7, 8, 10],
            correct: 7
        },
        {
            question: "Жұп санды таңдаңыз",
            options: [3, 5, 12, 7],
            correct: 12
        },
        {
            question: "Ең үлкен санды таңдаңыз",
            options: [2, 9, 5, 8],
            correct: 9
        },
        {
            question: "Ең кіші санды таңдаңыз",
            options: [7, 11, 6, 13],
            correct: 6
        },
        {
            question: "Тақ санды таңдаңыз",
            options: [1, 2, 8, 6],
            correct: 1
        },
    ];

    const numberContainer = document.getElementById('number-container');
    const numberQuestion = document.getElementById('number-question');
    const numberOptions = document.getElementById('number-options');
    const numberSubmitBtn = document.getElementById('number-submit-btn');

    const quizContainer = document.getElementById('quiz-container');
    const questionBody = document.getElementById('question-body');
    const optionsContainer = document.getElementById('options');
    const submitBtn = document.getElementById('submit-btn');
    const timerElement = document.getElementById('timer');

    // Таймер бастау
    function startGameTimer() {
        timer = createTimer({
            duration: 300, // 5 минут = 300 секунд
            onTick: (seconds) => {
                timerElement.innerText = formatTime(seconds);
                // Егер 30 секундтан аз қалса қызартып көрсету
                if (seconds <= 30) {
                    timerElement.classList.add('text-red-500');
                }
            },
            onFinish: async () => {
                await finishGame();
            }
        });
    }

    // Ғажайып санды көрсету
    function renderMagicNumber() {
        numberContainer.style.display = "grid";
        quizContainer.style.display = "none";

        const magicQuestion = magicQuestions[currentMagicQuestionIndex];
        numberQuestion.innerText = `${currentMagicQuestionIndex + 1}. ${magicQuestion.question}`;
        numberOptions.innerHTML = '';
        numberSubmitBtn.disabled = true;
        selectedMagicOption = null;

        magicQuestion.options.forEach(number => {
            const btn = document.createElement('button');
            btn.className = "flex h-64 justify-center items-center rounded-xl text-7xl font-black bg-white text-black";
            btn.innerText = number;
            btn.onclick = () => {
                selectedMagicOption = number;
                Array.from(numberOptions.children).forEach(b => b.classList.remove('bg-green-500'));
                btn.classList.add('bg-green-500');
                numberSubmitBtn.disabled = false;
                playAudio('click-audio');
            };
            numberOptions.appendChild(btn);
        });
    }

    numberSubmitBtn.addEventListener('click', function () {
        const magicQuestion = magicQuestions[currentMagicQuestionIndex];
        if (selectedMagicOption === magicQuestion.correct) {
            alert("🎯 Дұрыс! Енді сұраққа жауап беріңіз.");
            gameState = "answer_question";
            renderQuestion();
        } else {
            alert("❌ Қате! Тағы бір рет байқап көріңіз.");
        }
    });

    // Нақты тест сұрақты көрсету
    function renderQuestion() {
        numberContainer.style.display = "none";
        quizContainer.style.display = "grid";

        const question = questions[currentQuestionIndex];
        questionBody.innerHTML = `
            <div class="flex items-center justify-center gap-4 p-6 rounded-xl bg-white">
                <div class="py-6 px-10 rounded-2xl bg-orange-500">
                    <h1 class="text-6xl font-black text-white">${currentQuestionIndex + 1}</h1>
                </div>
                <h1 class="font-medium text-2xl text-black">${question.question_body}</h1>
            </div>
        `;
        optionsContainer.innerHTML = "";
        submitBtn.style.display = "inline-block";
        submitBtn.disabled = true;
        selectedOptions = [];

        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = "flex items-center gap-2 p-6 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-all";
            btn.innerHTML = `
                <div class="text-black font-medium">
                    ${option.option_body}
                </div>
            `;
            btn.onclick = () => {
                selectedOptions = [option.id];
                Array.from(optionsContainer.children).forEach(b => b.classList.remove("bg-green-500"));
                btn.classList.add("bg-green-500");
                submitBtn.disabled = false;
                playAudio('click-audio');
            };
            optionsContainer.appendChild(btn);
        });
    }

    submitBtn.addEventListener('click', async function () {
        const question = questions[currentQuestionIndex];

        userAnswers.push({
            question_id: question.id,
            selected_option_ids: selectedOptions
        });

        currentQuestionIndex++;
        currentMagicQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            gameState = "find_magic_number";
            renderMagicNumber();
        } else {
            await finishGame();
        }
    });

    async function finishGame() {
        if (timer) {
            timer.stop(); // Таймерді тоқтатамыз
        }
        await submitQuiz(quizId, sessionId, userAnswers, csrfToken);
        playAudio('finish-audio');
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = "<h1 class='finish-message'>🎉 Ойын аяқталды! Жарайсың!</h1>";
        location.href = `/user/quiz/${userQuizId}/`;
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Ойынды бастау
    startGameTimer();
    renderMagicNumber();
});
