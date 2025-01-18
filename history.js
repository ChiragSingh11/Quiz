const fetchWithDelay = async (url, delay) => {
    return new Promise(resolve => setTimeout(resolve, delay)).then(() => fetch(url));
};

let score = 0;
let currentQuestionIndex = 0;
let buttonsEnabled = true;

fetchWithDelay('https://opentdb.com/api.php?amount=10&category=23&type=boolean', 2000)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const questions = data.results;

        function updateScore() {
            document.getElementById('score').innerText = score;
        }

        function loadQuestion(index) {
            buttonsEnabled = true;
            
            if (index >= questions.length) {
                const questionElement = document.getElementsByClassName("main-question")[0];
                questionElement.innerHTML = `Quiz Completed! Final Score: ${score}/${questions.length}`;
                const buttons = document.querySelectorAll('.option-btn');
                buttons.forEach(button => button.disabled = true);
                return;
            }

            const question = questions[index];
            const questionElement = document.getElementsByClassName("main-question")[0];

            if (questionElement) {
                questionElement.innerHTML = `Question ${index + 1}: ${question.question}`;
                
                const buttons = document.querySelectorAll('.option-btn');
                buttons.forEach(button => {
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    newButton.innerHTML = newButton.value === "true" ? "True" : "False";
                    newButton.classList.remove('correct', 'incorrect');
                    newButton.disabled = false;
                    newButton.style.backgroundColor = '#007bff';
                    newButton.addEventListener('click', handleAnswerClick);
                });
            }
        }

        async function handleAnswerClick(e) {
            if (!buttonsEnabled) return;
            buttonsEnabled = false;

            const clickedButton = e.target;
            const clickedValue = clickedButton.value;
            const currentQuestion = questions[currentQuestionIndex];
            const isCorrect = clickedValue === currentQuestion.correct_answer.toLowerCase();
            
            // Disable all buttons during animation
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(button => button.disabled = true);
            
            if (isCorrect) {
                clickedButton.classList.add('correct');
                score += 1;
            } else {
                clickedButton.classList.add('incorrect');
                // Show correct answer
                buttons.forEach(button => {
                    if (button.value === currentQuestion.correct_answer.toLowerCase()) {
                        button.classList.add('correct');
                    }
                });
            }
            
            updateScore();

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        }

        loadQuestion(currentQuestionIndex);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        const questionElement = document.getElementsByClassName("main-question")[0];
        if (questionElement) {
            questionElement.innerHTML = "Error loading quiz. Please try again.";
        }
    });