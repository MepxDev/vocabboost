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
    
    // Vocabulary Practice Elements
    const practiceBtn = document.getElementById('practice-btn');
    const practiceContainer = document.getElementById('practice-container');
    const practiceQuestion = document.getElementById('practice-question');
    const practiceAnswer = document.getElementById('practice-answer');
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const practiceFeedback = document.getElementById('practice-feedback');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const progressFill = document.getElementById('progress-fill');
    
    // Word Order Practice Elements
    const wordOrderPracticeBtn = document.getElementById('wordorder-practice-btn');
    const wordOrderContainer = document.getElementById('wordorder-container');
    const wordOrderQuestion = document.getElementById('wordorder-question');
    const scrambledWords = document.getElementById('scrambled-words');
    const wordBank = document.getElementById('word-bank');
    const checkWordOrderBtn = document.getElementById('check-wordorder-btn');
    const wordOrderFeedback = document.getElementById('wordorder-feedback');
    const nextWordOrderBtn = document.getElementById('next-wordorder-btn');
    const wordOrderProgressFill = document.getElementById('wordorder-progress-fill');
    
    const confettiContainer = document.getElementById('confetti-container');

    // State
    let words = JSON.parse(localStorage.getItem('words')) || [];
    let vocabPracticeMode = false;
    let wordOrderPracticeMode = false;
    let currentQuestionIndex = 0;
    let questionType = '';
    let vocabCorrectAnswers = 0;
    let vocabTotalQuestions = 0;
    let wordOrderCorrectAnswers = 0;
    let wordOrderTotalQuestions = 0;
    let lastPracticeDate = localStorage.getItem('lastPracticeDate') || null;
    let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
    let currentWordOrderQuestion = null;
    let draggedWord = null;

    // Word order patterns
    const wordOrderPatterns = [
        {
            description: "Basic SVO (Subject-Verb-Object) sentence",
            structure: "Subject + Verb + Object",
            example: "The cat chased the mouse."
        },
        {
            description: "Sentence with time expression",
            structure: "Subject + Verb + Object + Time",
            example: "I eat breakfast at 8 AM."
        },
        {
            description: "Sentence with place expression",
            structure: "Subject + Verb + Place + Object",
            example: "She reads books in the library."
        },
        {
            description: "Sentence with adverb",
            structure: "Subject + Adverb + Verb + Object",
            example: "He quickly finished his homework."
        },
        {
            description: "Negative sentence",
            structure: "Subject + Auxiliary + Not + Verb + Object",
            example: "They do not like pizza."
        },
        {
            description: "Question with auxiliary",
            structure: "Auxiliary + Subject + Verb + Object",
            example: "Do you speak English?"
        },
        {
            description: "Question with question word",
            structure: "Question Word + Auxiliary + Subject + Verb",
            example: "Where did you go yesterday?"
        },
        {
            description: "Sentence with indirect object",
            structure: "Subject + Verb + Indirect Object + Direct Object",
            example: "She gave her friend a gift."
        },
        {
            description: "Sentence with adjective",
            structure: "Subject + Verb + Adjective + Object",
            example: "She bought a beautiful dress."
        },
        {
            description: "Sentence with adjective",
            structure: "Subject + Verb + Adjective + Object",
            example: "He cooks the poorly things."
        },
        {
            description: "Sentence with frequency adverb",
            structure: "Subject + Adverb + Verb + Object",
            example: "I always drink coffee in the morning."
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
    
    // Vocabulary Practice Events
    practiceBtn.addEventListener('click', toggleVocabPractice);
    checkAnswerBtn.addEventListener('click', checkVocabAnswer);
    nextQuestionBtn.addEventListener('click', nextVocabQuestion);
    practiceAnswer.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkVocabAnswer();
    });
    
    // Word Order Practice Events
    wordOrderPracticeBtn.addEventListener('click', toggleWordOrderPractice);
    checkWordOrderBtn.addEventListener('click', checkWordOrderAnswer);
    nextWordOrderBtn.addEventListener('click', nextWordOrderQuestion);
    
    // Drag and Drop Events
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('drop', function(e) {
        e.preventDefault();
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

    // Vocabulary Practice Functions
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

    function startVocabPractice() {
        currentQuestionIndex = 0;
        nextVocabQuestion();
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

    function resetVocabUI() {
        practiceFeedback.textContent = '';
        practiceFeedback.className = 'feedback-box';
        practiceAnswer.classList.add('hidden');
        checkAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
    }

    // Word Order Practice Functions
    function toggleWordOrderPractice() {
        wordOrderPracticeMode = !wordOrderPracticeMode;
        
        if (wordOrderPracticeMode) {
            checkStreak();
            wordOrderPracticeBtn.innerHTML = '<i class="fas fa-stop"></i> End Practice';
            wordOrderContainer.classList.remove('hidden');
            wordOrderCorrectAnswers = 0;
            wordOrderTotalQuestions = 0;
            startWordOrderPractice();
        } else {
            endWordOrderPractice();
        }
    }

    function startWordOrderPractice() {
        nextWordOrderQuestion();
    }

    function endWordOrderPractice() {
        wordOrderPracticeBtn.innerHTML = '<i class="fas fa-play"></i> Start Practice';
        wordOrderContainer.classList.add('hidden');
        resetWordOrderUI();
        
        if (wordOrderTotalQuestions > 0) {
            const accuracy = Math.round((wordOrderCorrectAnswers / wordOrderTotalQuestions) * 100);
            showNotification(`Word order practice completed! Accuracy: ${accuracy}%`, 'success');
        }
    }

    function nextWordOrderQuestion() {
        resetWordOrderUI();
        
        // Select a random pattern
        const pattern = wordOrderPatterns[Math.floor(Math.random() * wordOrderPatterns.length)];
        currentWordOrderQuestion = {
            pattern: pattern,
            correctSentence: pattern.example,
            scrambledWords: scrambleSentence(pattern.example)
        };
        
        // Update progress bar
        const progress = wordOrderTotalQuestions > 0 
            ? Math.min(Math.round((wordOrderCorrectAnswers / wordOrderTotalQuestions) * 100), 100)
            : 0;
        wordOrderProgressFill.style.width = `${progress}%`;
        
        // Display question
        wordOrderQuestion.innerHTML = `
            <i class="fas fa-random"></i>
            <div>Arrange these words in the correct order:</div>
            <div class="syntax-diagram">
                <h4>Pattern: ${pattern.structure}</h4>
                <div>${pattern.description}</div>
            </div>
        `;
        
        // Display scrambled words
        scrambledWords.innerHTML = '';
        wordBank.innerHTML = '';
        
        currentWordOrderQuestion.scrambledWords.forEach((word, index) => {
            const wordTile = document.createElement('div');
            wordTile.className = 'word-tile';
            wordTile.textContent = word;
            wordTile.draggable = true;
            wordTile.dataset.index = index;
            
            wordTile.addEventListener('dragstart', function(e) {
                draggedWord = this;
                setTimeout(() => {
                    this.classList.add('dragging');
                }, 0);
            });
            
            wordTile.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
            
            wordBank.appendChild(wordTile);
        });
        
        // Make word bank a drop zone
        wordBank.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        wordBank.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedWord && draggedWord.parentNode === scrambledWords) {
                this.appendChild(draggedWord);
            }
        });
        
        // Make scrambled words area a drop zone
        scrambledWords.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        scrambledWords.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedWord) {
                this.appendChild(draggedWord);
            }
        });
    }

    function scrambleSentence(sentence) {
        // Remove punctuation and split into words
        const words = sentence.replace(/[.,\/#!$%\^&\*;?:{}=\-_`~()]/g, '')
                             .split(' ')
                             .filter(word => word.length > 0);
        
        // Shuffle array
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        
        return words;
    }

    function checkWordOrderAnswer() {
        wordOrderTotalQuestions++;
        
        // Get the words in the order they were placed
        const placedWords = Array.from(scrambledWords.children)
                               .map(tile => tile.textContent)
                               .join(' ');
        
        // Compare with correct sentence (without punctuation for comparison)
        const correctAnswer = currentWordOrderQuestion.correctSentence
            .replace(/[.,\/#!$%\^&\*;?:{}=\-_`~()]/g, '');
        
        const isCorrect = placedWords.toLowerCase() === correctAnswer.toLowerCase();
        
        if (isCorrect) {
            wordOrderCorrectAnswers++;
            wordOrderFeedback.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>Perfect! Correct word order:</div>
                <div class="highlight">"${currentWordOrderQuestion.correctSentence}"</div>
            `;
            wordOrderFeedback.className = 'feedback-box correct';
            
            // Mark all words as correct
            Array.from(scrambledWords.children).forEach(tile => {
                tile.classList.add('correct-position');
            });
            
            createConfetti();
        } else {
            wordOrderFeedback.innerHTML = `
                <i class="fas fa-times-circle"></i>
                <div>The correct order is:</div>
                <div class="highlight">"${currentWordOrderQuestion.correctSentence}"</div>
                <div class="syntax-diagram">
                    <h4>Remember the pattern:</h4>
                    <div>${currentWordOrderQuestion.pattern.structure}</div>
                    <div>${currentWordOrderQuestion.pattern.description}</div>
                </div>
            `;
            wordOrderFeedback.className = 'feedback-box incorrect';
            
            // Highlight correct positions (simplified version)
            const correctWords = correctAnswer.split(' ');
            Array.from(scrambledWords.children).forEach((tile, index) => {
                if (index < correctWords.length && 
                    tile.textContent.toLowerCase() === correctWords[index].toLowerCase()) {
                    tile.classList.add('correct-position');
                } else {
                    tile.classList.add('incorrect-position');
                }
            });
        }
        
        checkWordOrderBtn.classList.add('hidden');
        nextWordOrderBtn.classList.remove('hidden');
    }

    function resetWordOrderUI() {
        wordOrderFeedback.textContent = '';
        wordOrderFeedback.className = 'feedback-box';
        checkWordOrderBtn.classList.remove('hidden');
        nextWordOrderBtn.classList.add('hidden');
    }

    // Utility Functions
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
