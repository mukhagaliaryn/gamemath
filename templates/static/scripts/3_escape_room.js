document.addEventListener('DOMContentLoaded', async () => {
    const quizId = document.getElementById('quiz-id').value; 
    const userQuizId = document.getElementById('user-quiz-id').value; 
    const sessionId = document.getElementById('session-id').value; 
    const csrfToken = document.getElementById('csrf-token').value; 

    const objects = document.querySelectorAll('.object');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const submitButton = document.getElementById('submit-answers');
    
    let userAnswers = [];

    objects.forEach((object, i) => {
        object.addEventListener('click', () => {
            console.log(object.id);
            
        })        
    })
    
});