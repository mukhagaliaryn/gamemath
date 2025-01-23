// static/scripts/games.js

// **Серверден JSON түрінде сұрақтарды алу
async function loadQuiz(quizId, sessionId) {
    try {
        const response = await fetch(`/quiz/control/${quizId}/session/${sessionId}/`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (!response.ok) {
            throw new Error('Сервер дұрыс жауап қайтарған жоқ');
        }
        return await response.json(); // { questions: [...], title: "...", т.б. }
    } catch (error) {
        console.error('loadQuiz error:', error);
        return null;
    }
}

// **Жауаптарды серверге жіберу (тестті аяқтау)
async function submitQuiz(quizId, sessionId, answers, csrfToken) {
    try {
        const payload = { answers };
        const response = await fetch(`/quiz/control/${quizId}/session/${sessionId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Сервер қате қайтарды');
        }
        return await response.json();
    } catch (error) {
        console.error('submitQuiz error:', error);
        return null;
    }
}


// **Таймер функциясы
function createTimer({ duration, onTick, onFinish }) {
    let remaining = duration;
    const timerId = setInterval(() => {
        remaining--;
        if (onTick) onTick(remaining);
        if (remaining <= 0) {
            clearInterval(timerId);
            if (onFinish) onFinish();
        }
    }, 1000);

    return {
        stop() {
            clearInterval(timerId);
        }
    };
}


// ** Уақытты MM:SS форматқа келтіру
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}


// ** Аудио ойнату (onclick="playAudio('my-audio-id')")
function playAudio(audioId) {
    const audio = document.getElementById(audioId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error(err));
    }
}


// **Бұл файлда "window" объектісіне байлап қойсаңыз, басқа .js-тер де көре алады.
window.loadQuiz = loadQuiz;
window.submitQuiz = submitQuiz;
window.createTimer = createTimer;
window.formatTime = formatTime;
window.playAudio = playAudio;