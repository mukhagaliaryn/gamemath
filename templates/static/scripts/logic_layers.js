document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    const container = document.getElementById('layers-container');
    const quizData = await loadQuiz(quizId, sessionId);
    const questions = quizData?.questions || [];
    const answers = [];

    let current = 0;

    function renderLayer(index) {
        const question = questions[index];
        const layer = document.createElement('div');
        layer.className = 'layer locked animate-slide-up';
        layer.innerHTML = `
            <div class="layer-header flex gap-2 items-center text-2xl text-black font-semibold">🧩 ${question.question_body}</div>
            <div class="options grid grid-cols-2 gap-4 mt-4"></div>
            <div class="layer-status mt-2 text-center text-lg font-semibold text-black"></div>
        `;

        const optionsArea = layer.querySelector('.options');
        const status = layer.querySelector('.layer-status');

        question.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.innerHTML = opt.option_body;
            btn.className = 'option-btn';
            btn.onclick = () => {
                if (btn.disabled) return;
            
                const allButtons = layer.querySelectorAll('button');
                allButtons.forEach(b => b.disabled = true);
            
                if (opt.is_correct) {
                    btn.classList.add('correct');
                    status.innerHTML = "✅ Құлып ашылды!";
                    answers.push({
                        question_id: question.id,
                        selected_option_ids: [opt.id]
                    });
                    unlockNextLayer(index + 1);
                } else {
                    btn.classList.add('wrong');
                    status.innerHTML = "❌ Қате жауап! Тағы бір рет байқап көріңіз...";
                    
                    // 2 секундтан кейін қайта таңдау құқығын беру
                    setTimeout(() => {
                        allButtons.forEach(b => {
                            if (!b.classList.contains('correct') && !b.classList.contains('wrong')) {
                                b.disabled = false;
                            }
                        });
                        status.innerHTML = "🔁 Таңдау жасап көріңіз!";
                    }, 2000);
                }
            };
            optionsArea.appendChild(btn);
        });

        container.appendChild(layer);
        if (index === 0) layer.classList.remove('locked');
    }

    function unlockNextLayer(index) {
        const nextLayer = container.children[index];
        if (nextLayer) {
            nextLayer.classList.remove('locked');
            nextLayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showCompletionScreen();
        }
    }

    function showCompletionScreen() {
        submitQuiz(quizId, sessionId, answers, csrfToken);
        const success = document.createElement('div');
        success.className = "text-center py-10 animate-pop";
        success.innerHTML = `
            <img src="/static/images/logo.png" class="w-40 mx-auto mb-6" />
            <h2 class="text-4xl font-bold text-green-600">🎉 Сіз барлық қабаттан өттіңіз!</h2>
        `;
        container.appendChild(success);
        success.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            window.location.href = `/user/quiz/${userQuizId}/`;
        }, 3000);
    }

    questions.forEach((_, index) => renderLayer(index));
});