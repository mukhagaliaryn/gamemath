document.addEventListener('DOMContentLoaded', async function () {
    const quizId = document.getElementById('quiz-id').value;
    const userQuizId = document.getElementById('user-quiz-id').value;
    const sessionId = document.getElementById('session-id').value;
    const csrfToken = document.getElementById('csrf-token').value;

    const mazeLayout = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,1,0,0,0,1,0,0,1,0,1,0,0,0,1],
        [1,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,0,1],
        [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,1,0,1],
        [1,0,1,0,1,0,1,1,1,1,1,0,1,1,0,1,0,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,1],
        [1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1],
        [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1],
        [1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let playerPosition = { row: 1, col: 1 };
    let questions = [];
    let questionPositions = {}; // {'row-col': question}
    let finishVisible = false; // Finish (🏁) басында жасырылған

    // Maze салу
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
                    cell.classList.add('finish');
                    cell.innerHTML = '<img src="/static/games/maze_math/door.png">';
                } else if (questionPositions[cellKey]) {
                    // сұрақ бар жер ❓
                    cell.innerHTML = '<span style="font-size: 20px;">❓</span>';
                }

                maze.appendChild(cell);
            }
        }
    }

    // Ойыншыны жылжыту
    async function movePlayer(dr, dc) {
        const newRow = playerPosition.row + dr;
        const newCol = playerPosition.col + dc;

        if (newRow >= 0 && newRow < mazeLayout.length && newCol >= 0 && newCol < mazeLayout[0].length) {
            if (mazeLayout[newRow][newCol] === 0) {
                const cellKey = `${newRow}-${newCol}`;
                if (questionPositions[cellKey]) {
                    openQuestionModal(questionPositions[cellKey], (isCorrect) => {
                        if (isCorrect) {
                            delete questionPositions[cellKey];
                            playerPosition.row = newRow;
                            playerPosition.col = newCol;

                            // Барлық сұрақ шешілсе — Finish көрсету
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

                    // Finish-қа жетті ме?
                    if (finishVisible && newRow === 18 && newCol === 18) {
                        await window.submitQuiz(quizId, sessionId, [], csrfToken);
                        alert('Құттықтаймыз! Сіз лабиринттен өттіңіз! 🎉');
                        window.location.href = `/user/quiz/${userQuizId}/`;
                        return;
                    }

                    createMaze();
                }
            }
        }
    }

    // Сұрақтарға бос клеткаларды Random тарату
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

    // Quiz сұрақтарын серверден жүктеу
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

    // Modal ашу
    function openQuestionModal(question, onAnswer) {
        const modal = document.getElementById('question-modal');
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');

        questionText.innerHTML = question.question_body;
        optionsContainer.innerHTML = '';
        

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerHTML = option.option_body;
            button.className = 'bg-blue-500 text-white p-2 rounded hover:bg-blue-600';
            button.onclick = () => {
                onAnswer(option.is_correct);
                modal.classList.add('hidden');
            };
            optionsContainer.appendChild(button);
        });

        modal.classList.remove('hidden');
    }

    // Пернетақта басқаруы
    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowUp') movePlayer(-1, 0);
        if (event.key === 'ArrowDown') movePlayer(1, 0);
        if (event.key === 'ArrowLeft') movePlayer(0, -1);
        if (event.key === 'ArrowRight') movePlayer(0, 1);
    });

    // Ойын басталғанда бәрін жүктейміз
    await initializeMaze();
});






