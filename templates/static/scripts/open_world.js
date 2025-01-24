// Player объектісін қозғалту
// ------------------------------------------------------------------------------------------------
const player = document.getElementById('player');
let positionX = 0;
let positionY = 0;


document.addEventListener('keydown', (event) => {
    const stepSound = document.getElementById('step-sound');
    const horses = document.querySelectorAll('.horse');
    const sheeps = document.querySelectorAll('.sheep');
    const waters = document.querySelectorAll('.water');
    const chests = document.querySelectorAll('.question'); 

    const step = 50; // Қозғалыс қадамы (пиксель)
    switch(event.key) {
        case 'ArrowUp':
            positionY -= step;
            break;
        case 'ArrowDown':
            positionY += step;
            break;
        case 'ArrowLeft':
            positionX -= step;
            break;
        case 'ArrowRight':
            positionX += step;
            break;
    }

    // Объектіні шекарадан шығармау
    const container = document.documentElement; // Шекараны html элементі ретінде аламыз
    const maxWidth = container.clientWidth - player.offsetWidth;
    const maxHeight = container.clientHeight - player.offsetHeight;
    positionX = Math.max(0, Math.min(positionX, maxWidth));
    positionY = Math.max(0, Math.min(positionY, maxHeight));
    player.style.transform = `translate(${positionX}px, ${positionY}px)`;

 
    // Қадам
    stepSound.currentTime = 0;
    stepSound.play();

    // Жылқылар
    horses.forEach((object) => {
        const rect1 = player.getBoundingClientRect();
        const rect2 = object.getBoundingClientRect();

        if (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        ) {
            // Жақындаған кезде арнайы дыбыс шығару
            const objectSound = document.getElementById('horse-sound');
            if (objectSound) {
                objectSound.currentTime = 0;
                objectSound.play();
            }
        }
    });

    // Қойлар
    sheeps.forEach((object) => {
        const rect1 = player.getBoundingClientRect();
        const rect2 = object.getBoundingClientRect();

        if (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        ) {
            // Жақындаған кезде арнайы дыбыс шығару
            const objectSound = document.getElementById('sheep-sound');
            if (objectSound) {
                objectSound.currentTime = 0;
                objectSound.play();
            }
        }
    });

    // Сулар
    waters.forEach((object) => {
        const rect1 = player.getBoundingClientRect();
        const rect2 = object.getBoundingClientRect();

        if (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        ) {
            const objectSound = document.getElementById('water-sound');
            if (objectSound) {
                objectSound.currentTime = 0;
                objectSound.play();
            }
        }
    });


    // Сандықтарға жақындауды тексеру
    chests.forEach((chest) => {
        const rect1 = player.getBoundingClientRect();
        const rect2 = chest.getBoundingClientRect();

        // Жақындықты тексеру
        if (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        ) {
            // Жақын болған кезде highlight класын қосу
            chest.classList.add('highlight');
        } else {
            // Алыс болған кезде highlight класын алып тастау
            chest.classList.remove('highlight');
        }
    });
});



// Деректерді жүктеу
// -------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value; 
    const userQuizId = document.getElementById('user-quiz-id').value; 
    const sessionId = document.getElementById('session-id').value; 
    const csrfToken = document.getElementById('csrf-token').value; 

    const player = document.getElementById('player'); 
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const submitButton = document.getElementById('submit-answers');
    const timerElement = document.getElementById('timer');

    let userAnswers = [];
    const timerDuration = 300; // 5 минут (секундпен)

    try {
        const data = await loadQuiz(quizId, sessionId); 
        if (data) {
            const quizContainer = document.getElementById('quiz-container');

            const timer = createTimer({
                duration: timerDuration,
                onTick: (remaining) => {
                    timerElement.textContent = formatTime(remaining); // Таймер уақытын жаңарту
                },
                onFinish: async () => {
                    alert('Уақыт аяқталды! Тест автоматты түрде аяқталады.');
                    await doSubmit(); // Автоматты түрде нәтижені шығару
                },
            });

            // Сұрақтарды шығару
            const questions = [];
            data.questions.forEach((question, index) => {
                // Сұрақ элементін жасау
                const questionElement = document.createElement('div');
                questionElement.className = 'question absolute z-50 cursor-pointer';

                // Кездейсоқ орын беру
                questionElement.style.top = `${Math.random() * 80}%`;
                questionElement.style.left = `${Math.random() * 80}%`;

                // Сұраққа сурет қосу
                const img = document.createElement('img');
                img.src = '/static/images/sunduk.png'; // Сурет URL
                img.alt = `Сұрақ ${index + 1}`;
                img.className = 'w-10';

                questionElement.appendChild(img);
                quizContainer.appendChild(questionElement); // Контейнерге қосу

                // Сұрақты массивке сақтау
                questions.push({
                    element: questionElement,
                    data: question
                });
            });

            // Модалды жабу
            document.getElementById('close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Тыңдаушы: тышқанды басу
            document.addEventListener('click', (event) => {
                const playerRect = player.getBoundingClientRect();
                questions.forEach(({ element, data }) => {
                    const questionRect = element.getBoundingClientRect();

                    // Жақын ма және тышқан элементке бағытталған ба
                    if (
                        playerRect.left < questionRect.right &&
                        playerRect.right > questionRect.left &&
                        playerRect.top < questionRect.bottom &&
                        playerRect.bottom > questionRect.top &&
                        event.target === element.querySelector('img')
                    ) {
                        // Жақын және тышқанмен басылған кезде модалды ашу
                        const chestSound = document.getElementById('chest-sound');
                        chestSound.currentTime = 0;
                        chestSound.play();
                        element.firstChild.src = '/static/images/open-sunduk.png';

                        const savedAnswer = userAnswers.find(answer => answer.question_id === data.id);
                        const savedOptionIds = savedAnswer ? savedAnswer.selected_option_ids : [];

                        modalContent.innerHTML = `
                            <div class="question px-4 grid gap-4">
                                <div class="flex items-center justify-center gap-4 p-6 rounded-xl bg-white">
                                    <div class="py-6 px-10 rounded-2xl bg-orange-500">
                                        <h1 class="text-6xl font-black text-white">${data.order}</h1>
                                    </div>
                                    <h1 class="font-semibold text-2xl">${data.question_body}</h1>
                                </div>
                                <div class="grid gap-4 lg:grid-cols-2 mt-4">
                                    ${data.options.map(opt => `
                                        <div class="flex items-center gap-2 p-6 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-all">
                                            <input
                                                type="radio"
                                                id="option_${opt.id}"
                                                name="question_${data.id}"
                                                value="${opt.id}"
                                                ${savedOptionIds.includes(opt.id) ? 'checked' : ''}
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
                            <div class="flex p-6">
                                <button id="save-answer" class="py-4 px-8 font-semibold bg-orange-500 text-white rounded-lg transition-all hover:bg-orange-600">
                                    Сақтау
                                </button>
                            </div>
                        `;
                        modal.style.display = 'flex';

                        // Жауапты сақтау
                        document.getElementById('save-answer').addEventListener('click', () => {
                            saveAnswer(data.id); // Ағымдағы сұрақтың ID-сін жіберу
                            modal.style.display = 'none'; // Модалды жабу
                            updateSubmitButtonState();
                        });
                    }
                });
            });

            // Жауаптарды жіберу
            submitButton.addEventListener('click', async () => {
                timer.stop(); // Таймерді тоқтату
                if (userAnswers.length === data.questions.length) {
                    await doSubmit(); // Барлық жауаптарды серверге жіберу
                } else {
                    alert('Барлық сұрақтарға жауап беріңіз!');
                }
            });

            
            // Жауаптарды сақтау
            function saveAnswer(questionId) {
                const selected = Array.from(
                    document.querySelectorAll(`input[name="question_${questionId}"]:checked`)
                ).map(el => parseInt(el.value, 10));
                userAnswers = userAnswers.filter(a => a.question_id !== questionId);
                // Жаңа жауапты қосу
                userAnswers.push({
                    question_id: questionId,
                    selected_option_ids: selected
                });
            
                console.log('Жаңартылған жауаптар:', userAnswers);
                updateSubmitButtonState();
            }

            
            // Нәтижесін шығару
            async function doSubmit() {
                try {
                    const result = await submitQuiz(quizId, sessionId, userAnswers, csrfToken);
                    if (result && result.status === 'success') {
                        alert(`Тест аяқталды! Жалпы ұпай: ${result.total_score}`);
                        location.href = `/user/quiz/${userQuizId}/`;
                    } else {
                        alert('Тестті аяқтау кезінде қате орын алды!');
                    }
                } catch (error) {
                    console.error('doSubmit қателігі:', error);
                    alert('Серверге қосылу мүмкін болмады!');
                }
            }

            function updateSubmitButtonState() {
                const submitButton = document.getElementById('submit-answers');
                const allAnswered = data.questions.every(question =>
                    userAnswers.some(answer => answer.question_id === question.id)
                );
                if (allAnswered) {
                    submitButton.disabled = false;
                } else {
                    submitButton.disabled = true;
                }
            }
        } else {
            console.error('Деректер бос немесе сервер қате қайтарды');
        }
    } catch (error) {
        console.error('Quiz деректерін жүктеу кезінде қате орын алды:', error);
    }
});