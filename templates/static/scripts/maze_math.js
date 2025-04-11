document.addEventListener('DOMContentLoaded', async function () {
    const quizId = document.getElementById('quiz-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    const mazeLayout = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    let playerPosition = { row: 1, col: 1 };
    let questions = [];
    let questionPositions = {};
    let finishVisible = false;
    let answers = []; // ✅ жауаптарды жинайтын массив

    function createMaze() {
        const maze = document.getElementById('maze');
        maze.innerHTML = '';

        for (let r = 0; r < mazeLayout.length; r++) {
            for (let c = 0; c < mazeLayout[r].length; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (mazeLayout[r][c] === 1) {
                    cell.classList.add('wall');
                }

                const cellKey = `${r}-${c}`;

                if (r === playerPosition.row && c === playerPosition.col) {
                    cell.classList.add('player');
                    cell.innerHTML = '<img src="/static/games/maze_math/player.png">';
                } else if (r === 18 && c === 18 && finishVisible) {
                    cell.classList.add('finish', 'animate-finish');
                    cell.innerHTML = '<img src="/static/games/maze_math/door.png">';
                } else if (questionPositions[cellKey]) {
                    cell.innerHTML = '<span style="font-size: 20px;">❓</span>';
                }

                maze.appendChild(cell);
            }
        }
    }

    async function movePlayer(dr, dc) {
        const newRow = playerPosition.row + dr;
        const newCol = playerPosition.col + dc;

        if (newRow >= 0 && newRow < mazeLayout.length && newCol >= 0 && newCol < mazeLayout[0].length) {
            if (mazeLayout[newRow][newCol] === 0) {
                const cellKey = `${newRow}-${newCol}`;
                if (questionPositions[cellKey]) {
                    openQuestionModal(questionPositions[cellKey], (isCorrect, selectedOption) => {
                        if (isCorrect) {
                            // ✅ Дұрыс жауап бергенде дұрыс форматта сақтау
                            playAudio("finish-audio");
                            answers.push({
                                question_id: questionPositions[cellKey].id,
                                selected_option_ids: [selectedOption.id]  // ✅ Массив ретінде
                            });

                            delete questionPositions[cellKey];
                            playerPosition.row = newRow;
                            playerPosition.col = newCol;
                            playAudio('step-sound');
                            
                            if (Object.keys(questionPositions).length === 0) {
                                finishVisible = true;
                            }

                            createMaze();
                        } else {
                            alert('Қате жауап! Қайта көр.');
                        }
                    });
                } else {
                    playerPosition.row = newRow;
                    playerPosition.col = newCol;
                    playAudio('step-sound');

                    if (finishVisible && newRow === 18 && newCol === 18) {
                        // ✅ Finish-ке жетті — жауаптарды жібереміз
                        const response = await window.submitQuiz(quizId, sessionId, answers, csrfToken);
                        if (response && response.status === "success") {
                            playAudio("finish-audio");
                            alert('🎉 Құттықтаймыз!')
                            window.location.href = `/user/quiz/${userQuizId}/`;
                        } else {
                            alert('Қате: жауаптар жіберілмеді.');
                        }
                        return;
                    }

                    if (isNearQuestion(newRow, newCol)) {
                        playAudio('chest-sound');
                    }

                    createMaze();
                }
            }
        }
    }

    function isNearFinish(row, col) {
        return Math.abs(row - 18) <= 1 && Math.abs(col - 18) <= 1;
    }

    function isNearQuestion(row, col) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = row + dr;
                const c = col + dc;
                const key = `${r}-${c}`;
                if (questionPositions[key]) {
                    return true;
                }
            }
        }
        return false;
    }

    function assignQuestionsToMaze() {
        const freeCells = [];
        for (let r = 0; r < mazeLayout.length; r++) {
            for (let c = 0; c < mazeLayout[r].length; c++) {
                if (mazeLayout[r][c] === 0 && !(r === playerPosition.row && c === playerPosition.col)) {
                    freeCells.push({ row: r, col: c });
                }
            }
        }

        questions.forEach(question => {
            if (freeCells.length === 0) return;
            const randomIndex = Math.floor(Math.random() * freeCells.length);
            const cell = freeCells.splice(randomIndex, 1)[0];
            questionPositions[`${cell.row}-${cell.col}`] = question;
        });
    }

    async function initializeMaze() {
        const data = await window.loadQuiz(quizId, sessionId);
        if (!data) {
            console.error('Quiz деректері жүктелмеді!');
            return;
        }
        questions = data.questions;
        assignQuestionsToMaze();
        createMaze();
    }

    function openQuestionModal(question, onAnswer) {
        const modal = document.getElementById('question-modal');
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');

        questionText.innerHTML = question.question_body;
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerHTML = option.option_body;
            button.className = 'text-black p-2 rounded-lg border';
            button.onclick = () => {
                onAnswer(option.is_correct, option); // ✅ Option объектісін де қайтарып береміз
                modal.classList.add('hidden');
            };
            optionsContainer.appendChild(button);
        });

        modal.classList.remove('hidden');
    }

    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('question-modal').classList.add('hidden');
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowUp') movePlayer(-1, 0);
        if (event.key === 'ArrowDown') movePlayer(1, 0);
        if (event.key === 'ArrowLeft') movePlayer(0, -1);
        if (event.key === 'ArrowRight') movePlayer(0, 1);
    });



    await initializeMaze();
});



// const mazeLayout = [
//     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
//     [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
//     [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
//     [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
//     [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
//     [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
//     [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
//     [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
//     [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
//     [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
//     [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
//     [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
//     [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
//     [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
//     [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
//     [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
//     [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
//     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
// ];