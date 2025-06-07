document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const wordInput = document.getElementById('word-input');
    const definitionInput = document.getElementById('definition-input');
    const categoryInput = document.getElementById('category-input');
    const addWordBtn = document.getElementById('add-word-btn');
    const wordList = document.getElementById('word-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const categoryFilter = document.getElementById('category-filter');
    const wordCount = document.getElementById('word-count');
    const masteredCount = document.getElementById('mastered-count');
    const streakCount = document.getElementById('streak-count');
    const practiceBtn = document.getElementById('practice-btn');
    const practiceContainer = document.getElementById('practice-container');
    const practiceQuestion = document.getElementById('practice-question');
    const practiceAnswer = document.getElementById('practice-answer');
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const practiceFeedback = document.getElementById('practice-feedback');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const progressFill = document.getElementById('progress-fill');
    const confettiContainer = document.getElementById('confetti-container');

    // State
    let words = JSON.parse(localStorage.getItem('words')) || [];
    let practiceMode = false;
    let currentQuestionIndex = 0;
    let questionType = '';
    let correctAnswersInSession = 0;
    let totalQuestionsInSession = 0;
    let lastPracticeDate = localStorage.getItem('lastPracticeDate') || null;
    let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;

    // Initialize
    checkStreak();
    renderWordList();
    updateStats();
    loadTheme();

    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    addWordBtn.addEventListener('click', addWord);
    wordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWord();
    });
    definitionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWord();
    });
    searchInput.addEventListener('input', renderWordList);
    sortSelect.addEventListener('change', renderWordList);
    categoryFilter.addEventListener('change', renderWordList);
    practiceBtn.addEventListener('click', togglePracticeMode);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextQuestionBtn.addEventListener('click', nextQuestion);

    // Functions
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    function checkStreak() {
        const today = new Date().toDateString();
        
        if (lastPracticeDate) {
            const lastDate = new Date(lastPracticeDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (today === lastDate.toDateString()) {
                // Already practiced today
                return;
            } else if (yesterday.toDateString() === lastDate.toDateString()) {
                // Practiced yesterday - increment streak
                currentStreak++;
            } else {
                // Broken streak - reset
                currentStreak = 1;
            }
        } else {
            // First time practicing
            currentStreak = 1;
        }
        
        lastPracticeDate = today;
        localStorage.setItem('lastPracticeDate', lastPracticeDate);
        localStorage.setItem('currentStreak', currentStreak.toString());
        streakCount.textContent = currentStreak;
    }

    function addWord() {
        const word = wordInput.value.trim();
        const definition = definitionInput.value.trim();
        const category = categoryInput.value;

        if (word && definition) {
            const newWord = {
                id: Date.now(),
                word,
                definition,
                category,
                dateAdded: new Date().toISOString(),
                timesTested: 0,
                timesCorrect: 0,
                lastTested: null
            };

            words.unshift(newWord);
            saveWords();
            renderWordList();
            updateStats();

            // Clear inputs and focus
            wordInput.value = '';
            definitionInput.value = '';
            wordInput.focus();

            // Animation feedback
            addWordBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => {
                addWordBtn.innerHTML = '<i class="fas fa-plus"></i> Add Word';
            }, 1500);
        }
    }

    function deleteWord(id) {
        words = words.filter(word => word.id !== id);
        saveWords();
        renderWordList();
        updateStats();
    }

    function saveWords() {
        localStorage.setItem('words', JSON.stringify(words));
    }

    function renderWordList() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryFilterValue = categoryFilter.value;
        
        let filteredWords = words.filter(word => 
            (word.word.toLowerCase().includes(searchTerm) || 
             word.definition.toLowerCase().includes(searchTerm)) &&
            (categoryFilterValue === 'all' || word.category === categoryFilterValue)
        );

        // Sort words
        const sortBy = sortSelect.value;
        switch (sortBy) {
            case 'newest':
                filteredWords.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'oldest':
                filteredWords.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                break;
            case 'alphabetical':
                filteredWords.sort((a, b) => a.word.localeCompare(b.word));
                break;
            case 'reverse-alphabetical':
                filteredWords.sort((a, b) => b.word.localeCompare(a.word));
                break;
            case 'mastery':
                filteredWords.sort((a, b) => {
                    const aMastery = a.timesTested > 0 ? a.timesCorrect / a.timesTested : 0;
                    const bMastery = b.timesTested > 0 ? b.timesCorrect / b.timesTested : 0;
                    return aMastery - bMastery;
                });
                break;
        }

        wordList.innerHTML = '';
        
        if (filteredWords.length === 0) {
            wordList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No words found</h3>
                    <p>Try changing your search or filters</p>
                </div>
            `;
            return;
        }

        filteredWords.forEach(word => {
            const accuracy = word.timesTested > 0 
                ? Math.round((word.timesCorrect / word.timesTested) * 100) 
                : 0;
            
            const masteryWidth = accuracy + '%';
            const categoryClass = word.category.toLowerCase();

            const wordCard = document.createElement('div');
            wordCard.className = 'word-card';
            wordCard.innerHTML = `
                <button class="delete-btn" data-id="${word.id}" title="Delete word">
                    <i class="fas fa-times"></i>
                </button>
                <h3>
                    <i class="fas fa-font"></i>
                    ${word.word}
                </h3>
                <p>${word.definition}</p>
                <div class="meta">
                    <span class="category ${categoryClass}">
                        <i class="fas fa-tag"></i> ${word.category}
                    </span>
                    <span>${new Date(word.dateAdded).toLocaleDateString()}</span>
                </div>
                <div class="mastery">
                    <div class="mastery-fill" style="width: ${masteryWidth}"></div>
                </div>
                <small>Mastery: ${accuracy}% (${word.timesCorrect}/${word.timesTested})</small>
            `;
            wordList.appendChild(wordCard);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                showDeleteConfirmation(id);
            });
        });
    }

    function showDeleteConfirmation(id) {
        const word = words.find(w => w.id === id);
        if (!word) return;

        const confirmation = confirm(`Are you sure you want to delete the word "${word.word}"?`);
        if (confirmation) {
            deleteWord(id);
        }
    }

    function updateStats() {
        wordCount.textContent = words.length;
        
        const masteredWords = words.filter(word => 
            word.timesTested > 0 && (word.timesCorrect / word.timesTested) >= 0.8
        ).length;
        
        masteredCount.textContent = masteredWords;
        streakCount.textContent = currentStreak;
    }

    function togglePracticeMode() {
        practiceMode = !practiceMode;
        
        if (practiceMode) {
            if (words.length === 0) {
                showNotification('Please add some words first!', 'error');
                practiceMode = false;
                return;
            }
            
            checkStreak();
            practiceBtn.innerHTML = '<i class="fas fa-stop"></i> End Practice';
            practiceContainer.classList.remove('hidden');
            correctAnswersInSession = 0;
            totalQuestionsInSession = 0;
            startPractice();
        } else {
            endPracticeSession();
        }
    }

    function startPractice() {
        currentQuestionIndex = 0;
        nextQuestion();
    }

    function endPracticeSession() {
        practiceBtn.innerHTML = '<i class="fas fa-play"></i> Start Practice';
        practiceContainer.classList.add('hidden');
        resetPracticeUI();
        
        if (totalQuestionsInSession > 0) {
            const accuracy = Math.round((correctAnswersInSession / totalQuestionsInSession) * 100);
            showNotification(`Practice session completed! Accuracy: ${accuracy}%`, 'success');
        }
    }

    function nextQuestion() {
        if (words.length === 0) {
            practiceFeedback.textContent = 'No words available for practice.';
            return;
        }

        // Reset UI for new question
        resetPracticeUI();

        // Update progress bar
        const progress = totalQuestionsInSession > 0 
            ? Math.min(Math.round((correctAnswersInSession / totalQuestionsInSession) * 100), 100)
            : 0;
        progressFill.style.width = `${progress}%`;

        // Randomly decide whether to ask for word or definition
        questionType = Math.random() > 0.5 ? 'word' : 'definition';
        currentQuestionIndex = Math.floor(Math.random() * words.length);
        const currentWord = words[currentQuestionIndex];

        if (questionType === 'word') {
            practiceQuestion.innerHTML = `
                <i class="fas fa-question-circle"></i>
                <div>What is the definition of:</div>
                <div class="highlight">"${currentWord.word}"</div>
            `;
        } else {
            practiceQuestion.innerHTML = `
                <i class="fas fa-question-circle"></i>
                <div>What word matches this definition:</div>
                <div class="highlight">"${currentWord.definition}"</div>
            `;
        }

        practiceAnswer.classList.remove('hidden');
        checkAnswerBtn.classList.remove('hidden');
        practiceAnswer.value = '';
        practiceAnswer.focus();
    }

    function checkAnswer() {
        const userAnswer = practiceAnswer.value.trim().toLowerCase();
        const currentWord = words[currentQuestionIndex];
        let correctAnswer, isCorrect;

        if (questionType === 'word') {
            correctAnswer = currentWord.definition.toLowerCase();
            isCorrect = userAnswer === correctAnswer;
        } else {
            correctAnswer = currentWord.word.toLowerCase();
            isCorrect = userAnswer === correctAnswer;
        }

        // Update word stats
        currentWord.timesTested += 1;
        currentWord.lastTested = new Date().toISOString();
        if (isCorrect) {
            currentWord.timesCorrect += 1;
            correctAnswersInSession++;
        }
        totalQuestionsInSession++;
        saveWords();
        updateStats();

        // Display feedback
        if (isCorrect) {
            practiceFeedback.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>Correct! Well done!</div>
            `;
            practiceFeedback.className = 'feedback-box correct';
            createConfetti();
        } else {
            practiceFeedback.innerHTML = `
                <i class="fas fa-times-circle"></i>
                <div>Incorrect. The correct answer is:</div>
                <div class="highlight">"${questionType === 'word' ? currentWord.definition : currentWord.word}"</div>
            `;
            practiceFeedback.className = 'feedback-box incorrect';
        }

        // Show next question button
        checkAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.remove('hidden');
    }

    function resetPracticeUI() {
        practiceFeedback.textContent = '';
        practiceFeedback.className = 'feedback-box';
        practiceAnswer.classList.add('hidden');
        checkAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
    }

    function createConfetti() {
        // Clear previous confetti
        confettiContainer.innerHTML = '';
        
        // Create new confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 5000);
    }

    function getRandomColor() {
        const colors = [
            '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', 
            '#fdcb6e', '#e17055', '#0984e3', '#00cec9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
});

// Add confetti animation to CSS
const style = document.createElement('style');
style.textContent = `
@keyframes fall {
    0% {
        opacity: 1;
        transform: translateY(-100px) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(360deg);
    }
}

.notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    border-radius: 5px;
    color: white;
    font-weight: 600;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
}

.notification.show {
    opacity: 1;
    bottom: 30px;
}

.notification.success {
    background-color: #00b894;
    box-shadow: 0 5px 15px rgba(0, 184, 148, 0.4);
}

.notification.error {
    background-color: #d63031;
    box-shadow: 0 5px 15px rgba(214, 48, 49, 0.4);
}

.highlight {
    color: var(--primary-color);
    font-weight: 700;
    margin-top: 10px;
}

.category {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    background-color: var(--secondary-color);
    color: white;
}

.category.general {
    background-color: #6c5ce7;
}

.category.academic {
    background-color: #0984e3;
}

.category.business {
    background-color: #00b894;
}

.category.technical {
    background-color: #e17055;
}
`;
document.head.appendChild(style);
