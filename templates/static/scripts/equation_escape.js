document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const timerElement = document.getElementById('timer');

    const objects = document.querySelectorAll('.object');
    let questions = [];
    let userAnswers = [];
    const timerDuration = 3 * 60;

    try {
        const data = await loadQuiz(quizId, sessionId);
        if (data && data.questions) {
            questions = data.questions;

            // Таймерді іске қосу
            const timer = createTimer({
                duration: timerDuration,
                onTick: (remainingTime) => {
                    // Таймердің экрандағы мәнін жаңарту
                    const minutes = Math.floor(remainingTime / 60);
                    const seconds = remainingTime % 60;
                    timerElement.textContent = `Қалған уақыт: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                },
                onFinish: async () => {
                    // Таймер аяқталған кезде
                    alert('Уақыт аяқталды! Ойын бітті.');

                    // Жауаптарды автоматты түрде жіберу
                    try {
                        const result = await submitQuiz(quizId, sessionId, userAnswers, csrfToken);
                        if (result && result.status === 'success') {
                            alert(`Ойын аяқталды! Жалпы ұпай: ${result.total_score}`);
                            location.href = `/user/quiz/${userQuizId}/`; // Нәтиже бетіне бағыттау
                        } else {
                            alert('Тестті аяқтау кезінде қате орын алды!');
                        }
                    } catch (error) {
                        console.error('Таймер аяқталғаннан кейін жауаптарды жіберу кезінде қате орын алды:', error);
                        alert('Серверге қосылу мүмкін болмады!');
                    }
                }
            });


            const objectQuestions = {
                task_1: 1,
                task_2: 2,
                task_3: 3,
                task_4: 4,
                task_5: 5,
            };

            // objects
            objects.forEach((object) => {
                object.addEventListener('click', () => {
                    const objectId = object.id;
                    const questionId = objectQuestions[objectId];
                    const question = questions.find(q => q.order === questionId);
                    if (question) {
                        playAudio('chest-sound');
                        showModal(question);
                    } else {
                        console.error(`Сұрақ табылмады: ${objectId}`);
                    }
                });
            });

            // Модалды ашу
            function showModal(question) {

                const savedAnswer = userAnswers.find(answer => answer.question_id === question.id);
                const savedOptionIds = savedAnswer ? savedAnswer.selected_option_ids : [];

                modalContent.innerHTML = `
                    <div class="question px-4 grid gap-4">
                        <div class="flex items-center justify-center gap-4 p-6 rounded-xl bg-white">
                            <div class="py-6 px-10 rounded-2xl bg-orange-500">
                                <h1 class="text-6xl font-black text-white">${question.order}</h1>
                            </div>
                            <h1 class="font-semibold text-2xl">${question.question_body}</h1>
                        </div>
                        <div class="grid gap-4 lg:grid-cols-2 mt-4">
                            ${question.options.map(opt => `
                                <div class="flex items-center gap-2 p-6 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-all">
                                    <input
                                        type="radio"
                                        id="option_${opt.id}"
                                        name="question_${question.id}"
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
                modal.style.display = "flex";

                // Жауапты сақтау
                document.getElementById('save-answer').addEventListener('click', () => {
                    saveAnswer(question.id);
                    modal.style.display = 'none';
                });
            }

            // Модалды жабу
            document.getElementById('close-modal').addEventListener('click', () => {
                modal.style.display = "none";
            });


            // Жауаптарды сақтау
            function saveAnswer(questionId) {
                const selected = Array.from(
                    document.querySelectorAll(`input[name="question_${questionId}"]:checked`)
                ).map(el => parseInt(el.value, 10));
                userAnswers = userAnswers.filter(a => a.question_id !== questionId);
                userAnswers.push({
                    question_id: questionId,
                    selected_option_ids: selected
                });

                console.log('Жаңартылған жауаптар:', userAnswers);
                updateLockAndKeyState(); // Кілт пен құлыпты жаңарту
            }


            // Есікке басу оқиғасы
            document.getElementById('lock').addEventListener('click', async () => {
                alert('Сұрақтарға толық жауап беріңіз!');
            });

            document.getElementById('key').addEventListener('click', async () => {
                const allAnswered = questions.every(q =>
                    userAnswers.some(ans => ans.question_id === q.id)
                );

                if (!allAnswered) {
                    alert('Сұрақтарға толық жауап беріңіз!');
                    return;
                }

                try {
                    const result = await submitQuiz(quizId, sessionId, userAnswers, csrfToken);
                    if (result && result.status === 'success') {
                        timer.stop();
                        playAudio("finish-audio")
                        alert(`Ойын аяқталды! Жалпы ұпай: ${result.total_score}`);
                        location.href = `/user/quiz/${userQuizId}/`;
                    } else {
                        alert('Тестті аяқтау кезінде қате орын алды!');
                    }
                } catch (error) {
                    console.error('Жауаптарды жіберу кезінде қате орын алды:', error);
                    alert('Серверге қосылу мүмкін болмады!');
                }
            });


            function updateLockAndKeyState() {
                const lock = document.getElementById('lock');
                const key = document.getElementById('key');

                const allAnswered = questions.every(q =>
                    userAnswers.some(ans => ans.question_id === q.id)
                );

                if (allAnswered) {
                    // Барлық сұрақтарға жауап берілгенде
                    lock.classList.add('hidden');
                    key.classList.remove('hidden');
                } else {
                    // Жауаптар толық болмаса
                    lock.classList.remove('hidden');
                    key.classList.add('hidden');
                }
            }
        } else {
            console.error('Серверден сұрақтар табылмады!');
        }
    } catch (error) {
        console.error('Сұрақтарды жүктеу кезінде қате орын алды:', error);
    }
});