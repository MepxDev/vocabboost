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
    const grammarPracticeBtn = document.getElementById('grammar-practice-btn');
    const grammarContainer = document.getElementById('grammar-container');
    const grammarQuestion = document.getElementById('grammar-question');
    const grammarAnswer = document.getElementById('grammar-answer');
    const checkGrammarBtn = document.getElementById('check-grammar-btn');
    const grammarFeedback = document.getElementById('grammar-feedback');
    const nextGrammarBtn = document.getElementById('next-grammar-btn');
    const progressFill = document.getElementById('progress-fill');
    const grammarProgressFill = document.getElementById('grammar-progress-fill');
    const confettiContainer = document.getElementById('confetti-container');

    // State
    let words = JSON.parse(localStorage.getItem('words')) || [];
    let vocabPracticeMode = false;
    let grammarPracticeMode = false;
    let currentQuestionIndex = 0;
    let questionType = '';
    let vocabCorrectAnswers = 0;
    let vocabTotalQuestions = 0;
    let grammarCorrectAnswers = 0;
    let grammarTotalQuestions = 0;
    let lastPracticeDate = localStorage.getItem('lastPracticeDate') || null;
    let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
    let currentGrammarQuestion = null;

    // Grammar error patterns (can be expanded)
    const grammarErrors = [
        {
            error: "their",
            correction: "there",
            example: "Their going to the park later."
        },
        {
            error: "your",
            correction: "you're",
            example: "Your going to love this!"
        },
        {
            error: "it's",
            correction: "its",
            example: "The dog wagged it's tail."
        },
        {
            error: "could of",
            correction: "could have",
            example: "I could of gone to the party."
        },
        {
            error: "less",
            correction: "fewer",
            example: "We have less options now."
        },
        {
            error: "then",
            correction: "than",
            example: "She is taller then him."
        },
        {
            error: "affect",
            correction: "effect",
            example: "The medicine had a good affect."
        },
        {
            error: "me",
            correction: "I",
            example: "Her and me went to the store."
        },
        {
            error: "was",
            correction: "were",
            example: "If I was you, I'd go."
        },
        {
            error: "this",
            correction: "these",
            example: "This kind of problems are hard."
        },
        {
            error: "alot",
            correction: "a lot",
            example: "I like pizza alot."
        },
        {
            error: "should of",
            correction: "should have",
            example: "You should of seen that movie."
        },
        {
            error: "its'",
            correction: "its",
            example: "The cat licked its' paw."
        },
        {
            error: "to",
            correction: "too",
            example: "This is to much for me."
        },
        {
            error: "loose",
            correction: "lose",
            example: "I don't want to loose the game."
        }
    ];

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
    practiceBtn.addEventListener('click', toggleVocabPractice);
    checkAnswerBtn.addEventListener('click', checkVocabAnswer);
    nextQuestionBtn.addEventListener('click', nextVocabQuestion);
    practiceAnswer.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkVocabAnswer();
    });
    grammarPracticeBtn.addEventListener('click', toggleGrammarPractice);
    checkGrammarBtn.addEventListener('click', checkGrammarAnswer);
    nextGrammarBtn.addEventListener('click', nextGrammarQuestion);
    grammarAnswer.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            checkGrammarAnswer();
        }
    });

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

    function toggleVocabPractice() {
        vocabPracticeMode = !vocabPracticeMode;
        
        if (vocabPracticeMode) {
            if (words.length === 0) {
                showNotification('Please add some words first!', 'error');
                vocabPracticeMode = false;
                return;
            }
            
            checkStreak();
            practiceBtn.innerHTML = '<i class="fas fa-stop"></i> End Practice';
            practiceContainer.classList.remove('hidden');
            vocabCorrectAnswers = 0;
            vocabTotalQuestions = 0;
            startVocabPractice();
        } else {
            endVocabPractice();
        }
    }

    function toggleGrammarPractice() {
        grammarPracticeMode = !grammarPracticeMode;
        
        if (grammarPracticeMode) {
            checkStreak();
            grammarPracticeBtn.innerHTML = '<i class="fas fa-stop"></i> End Practice';
            grammarContainer.classList.remove('hidden');
            grammarCorrectAnswers = 0;
            grammarTotalQuestions = 0;
            startGrammarPractice();
        } else {
            endGrammarPractice();
        }
    }

    function startVocabPractice() {
        currentQuestionIndex = 0;
        nextVocabQuestion();
    }

    function startGrammarPractice() {
        nextGrammarQuestion();
    }

    function endVocabPractice() {
        practiceBtn.innerHTML = '<i class="fas fa-play"></i> Start Practice';
        practiceContainer.classList.add('hidden');
        resetVocabUI();
        
        if (vocabTotalQuestions > 0) {
            const accuracy = Math.round((vocabCorrectAnswers / vocabTotalQuestions) * 100);
            showNotification(`Vocabulary practice completed! Accuracy: ${accuracy}%`, 'success');
        }
    }

    function endGrammarPractice() {
        grammarPracticeBtn.innerHTML = '<i class="fas fa-play"></i> Start Practice';
        grammarContainer.classList.add('hidden');
        resetGrammarUI();
        
        if (grammarTotalQuestions > 0) {
            const accuracy = Math.round((grammarCorrectAnswers / grammarTotalQuestions) * 100);
            showNotification(`Grammar practice completed! Accuracy: ${accuracy}%`, 'success');
        }
    }

    function nextVocabQuestion() {
        if (words.length === 0) {
            practiceFeedback.textContent = 'No words available for practice.';
            return;
        }

        // Reset UI for new question
        resetVocabUI();

        // Update progress bar
        const progress = vocabTotalQuestions > 0 
            ? Math.min(Math.round((vocabCorrectAnswers / vocabTotalQuestions) * 100), 100)
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
        nextQuestionBtn.classList.add('hidden');
        practiceAnswer.value = '';
        practiceAnswer.focus();
    }

    function nextGrammarQuestion() {
        currentGrammarQuestion = generateGrammarQuestion();
        grammarQuestion.innerHTML = `
            <i class="fas fa-question-circle"></i>
            <div>Correct this sentence:</div>
            <div class="highlight">"${currentGrammarQuestion.sentence}"</div>
        `;
        
        // Update progress bar
        const progress = grammarTotalQuestions > 0 
            ? Math.min(Math.round((grammarCorrectAnswers / grammarTotalQuestions) * 100), 100)
            : 0;
        grammarProgressFill.style.width = `${progress}%`;
        
        grammarAnswer.value = '';
        grammarFeedback.innerHTML = '';
        grammarFeedback.className = 'feedback-box';
        nextGrammarBtn.classList.add('hidden');
        grammarAnswer.focus();
    }

    function generateGrammarQuestion() {
        // Select a random error pattern
        const errorPattern = grammarErrors[Math.floor(Math.random() * grammarErrors.length)];
        
        // Sometimes use the example, sometimes generate a new sentence
        let sentence;
        if (Math.random() > 0.5) {
            sentence = errorPattern.example;
        } else {
            // Simple sentence generator
            const subjects = ["The cat", "My friend", "Our teacher", "The computer", "The weather", "Many people"];
            const verbs = ["is", "was", "looks", "seems", "became", "appears"];
            const objects = ["very happy", "too big", "quite interesting", "rather cold", "extremely fast", "completely wrong"];
            const connectors = ["because", "although", "while", "since", "unless"];
            const secondParts = ["it's fun", "they tried", "we know", "you see", "I agree"];
            
            // 50% chance for simple or complex sentence
            if (Math.random() > 0.5) {
                sentence = `${subjects[Math.floor(Math.random() * subjects.length)]} ` +
                           `${verbs[Math.floor(Math.random() * verbs.length)]} ` +
                           `${objects[Math.floor(Math.random() * objects.length)]}.`;
            } else {
                sentence = `${subjects[Math.floor(Math.random() * subjects.length)]} ` +
                           `${verbs[Math.floor(Math.random() * verbs.length)]} ` +
                           `${objects[Math.floor(Math.random() * objects.length)]} ` +
                           `${connectors[Math.floor(Math.random() * connectors.length)]} ` +
                           `${secondParts[Math.floor(Math.random() * secondParts.length)]}.`;
            }
            
            // Introduce the error
            sentence = sentence.replace(
                new RegExp(`\\b${errorPattern.correction}\\b`, 'gi'), 
                errorPattern.error
            );
        }
        
        return {
            sentence,
            error: errorPattern.error,
            correction: errorPattern.correction,
            explanation: `The word "${errorPattern.error}" should be "${errorPattern.correction}" in this context. ${getGrammarExplanation(errorPattern.error, errorPattern.correction)}`
        };
    }

    function getGrammarExplanation(error, correction) {
        const explanations = {
            "their/there": "Use 'their' for possession (their house) and 'there' for location (over there).",
            "your/you're": "'Your' shows possession (your book), while 'you're' is short for 'you are'.",
            "it's/its": "'It's' means 'it is' or 'it has', while 'its' shows possession (its tail).",
            "could of/could have": "The correct phrase is 'could have' (or 'could've'), not 'could of'.",
            "less/fewer": "Use 'fewer' for countable items (fewer apples) and 'less' for uncountable (less water).",
            "then/than": "'Then' relates to time (we ate, then left), 'than' is for comparisons (taller than).",
            "affect/effect": "'Affect' is usually a verb (to affect change), 'effect' is usually a noun (the effect).",
            "me/I": "Use 'I' as the subject (I went) and 'me' as the object (with me).",
            "was/were": "Use 'were' in hypothetical situations (if I were you).",
            "this/these": "'This' is singular (this book), 'these' is plural (these books)."
        };
        
        const key = `${error}/${correction}`.toLowerCase();
        return explanations[key] || "";
    }

    function checkVocabAnswer() {
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
            vocabCorrectAnswers++;
        }
        vocabTotalQuestions++;
        saveWords();
        updateStats();

        // Display feedback
        if (isCorrect) {
            practiceFeedback.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>Correct! Well done!</div>
                <div class="highlight">"${questionType === 'word' ? currentWord.definition : currentWord.word}"</div>
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

    function checkGrammarAnswer() {
        const userAnswer = grammarAnswer.value.trim();
        const correctAnswer = currentGrammarQuestion.sentence.replace(
            new RegExp(`\\b${currentGrammarQuestion.error}\\b`, 'gi'),
            currentGrammarQuestion.correction
        );

        // Basic check - could be enhanced with more sophisticated comparison
        const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

        // Update stats
        if (isCorrect) {
            grammarCorrectAnswers++;
        }
        grammarTotalQuestions++;

        // Highlight differences
        let feedbackHTML = '';
        if (isCorrect) {
            feedbackHTML = `
                <i class="fas fa-check-circle"></i>
                <div>Perfect! Well done!</div>
                <div class="highlight">"${correctAnswer}"</div>
            `;
            grammarFeedback.className = 'feedback-box correct';
            createConfetti();
        } else {
            // Show comparison
            const originalWithHighlight = currentGrammarQuestion.sentence.replace(
                new RegExp(`\\b${currentGrammarQuestion.error}\\b`, 'gi'),
                match => `<span class="grammar-error">${match}</span>`
            );
            
            const correctedWithHighlight = correctAnswer.replace(
                new RegExp(`\\b${currentGrammarQuestion.correction}\\b`, 'gi'),
                match => `<span class="grammar-correction">${match}</span>`
            );
            
            feedbackHTML = `
                <i class="fas fa-times-circle"></i>
                <div>Here's the correction:</div>
                <div class="comparison">
                    <div><strong>Original:</strong> ${originalWithHighlight}</div>
                    <div><strong>Correct:</strong> ${correctedWithHighlight}</div>
                </div>
                <div class="explanation">${currentGrammarQuestion.explanation}</div>
            `;
            grammarFeedback.className = 'feedback-box incorrect';
        }

        grammarFeedback.innerHTML = feedbackHTML;
        nextGrammarBtn.classList.remove('hidden');
    }

    function resetVocabUI() {
        practiceFeedback.textContent = '';
        practiceFeedback.className = 'feedback-box';
        practiceAnswer.classList.add('hidden');
        checkAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
    }

    function resetGrammarUI() {
        grammarFeedback.textContent = '';
        grammarFeedback.className = 'feedback-box';
        grammarAnswer.classList.add('hidden');
        checkGrammarBtn.classList.add('hidden');
        nextGrammarBtn.classList.add('hidden');
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
