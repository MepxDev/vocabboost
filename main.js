document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const wordInput = document.getElementById('word-input');
    const definitionInput = document.getElementById('definition-input');
    const addWordBtn = document.getElementById('add-word-btn');
    const wordList = document.getElementById('word-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const wordCount = document.getElementById('word-count');
    const practiceBtn = document.getElementById('practice-btn');
    const practiceContainer = document.getElementById('practice-container');
    const practiceQuestion = document.getElementById('practice-question');
    const practiceAnswer = document.getElementById('practice-answer');
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const practiceFeedback = document.getElementById('practice-feedback');
    const nextQuestionBtn = document.getElementById('next-question-btn');

    // State
    let words = JSON.parse(localStorage.getItem('words')) || [];
    let practiceMode = false;
    let currentQuestionIndex = 0;
    let questionType = ''; // 'word' or 'definition'

    // Initialize
    renderWordList();
    updateWordCount();

    // Event Listeners
    addWordBtn.addEventListener('click', addWord);
    wordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWord();
    });
    definitionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWord();
    });
    searchInput.addEventListener('input', renderWordList);
    sortSelect.addEventListener('change', renderWordList);
    practiceBtn.addEventListener('click', togglePracticeMode);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextQuestionBtn.addEventListener('click', nextQuestion);

    // Functions
    function addWord() {
        const word = wordInput.value.trim();
        const definition = definitionInput.value.trim();

        if (word && definition) {
            const newWord = {
                id: Date.now(),
                word,
                definition,
                dateAdded: new Date().toISOString(),
                timesTested: 0,
                timesCorrect: 0
            };

            words.unshift(newWord);
            saveWords();
            renderWordList();
            updateWordCount();

            // Clear inputs
            wordInput.value = '';
            definitionInput.value = '';
            wordInput.focus();
        }
    }

    function deleteWord(id) {
        words = words.filter(word => word.id !== id);
        saveWords();
        renderWordList();
        updateWordCount();
    }

    function saveWords() {
        localStorage.setItem('words', JSON.stringify(words));
    }

    function renderWordList() {
        const searchTerm = searchInput.value.toLowerCase();
        let filteredWords = words.filter(word => 
            word.word.toLowerCase().includes(searchTerm) || 
            word.definition.toLowerCase().includes(searchTerm)
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
        }

        wordList.innerHTML = '';
        filteredWords.forEach(word => {
            const accuracy = word.timesTested > 0 
                ? Math.round((word.timesCorrect / word.timesTested) * 100) 
                : 0;

            const wordCard = document.createElement('div');
            wordCard.className = 'word-card';
            wordCard.innerHTML = `
                <button class="delete-btn" data-id="${word.id}">×</button>
                <h3>${word.word}</h3>
                <p>${word.definition}</p>
                <small>Added: ${new Date(word.dateAdded).toLocaleDateString()}</small>
                <small>Accuracy: ${accuracy}% (${word.timesCorrect}/${word.timesTested})</small>
            `;
            wordList.appendChild(wordCard);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this word?')) {
                    deleteWord(id);
                }
            });
        });
    }

    function updateWordCount() {
        wordCount.textContent = words.length;
    }

    function togglePracticeMode() {
        practiceMode = !practiceMode;
        
        if (practiceMode) {
            if (words.length === 0) {
                alert('Please add some words first!');
                practiceMode = false;
                return;
            }
            
            practiceBtn.textContent = 'End Practice';
            practiceContainer.classList.remove('hidden');
            startPractice();
        } else {
            practiceBtn.textContent = 'Start Practice';
            practiceContainer.classList.add('hidden');
            resetPracticeUI();
        }
    }

    function startPractice() {
        currentQuestionIndex = 0;
        nextQuestion();
    }

    function nextQuestion() {
        if (words.length === 0) {
            practiceFeedback.textContent = 'No words available for practice.';
            return;
        }

        // Reset UI for new question
        resetPracticeUI();

        // Randomly decide whether to ask for word or definition
        questionType = Math.random() > 0.5 ? 'word' : 'definition';
        currentQuestionIndex = Math.floor(Math.random() * words.length);
        const currentWord = words[currentQuestionIndex];

        if (questionType === 'word') {
            practiceQuestion.textContent = `What is the definition of: "${currentWord.word}"?`;
        } else {
            practiceQuestion.textContent = `What word matches this definition: "${currentWord.definition}"?`;
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
        if (isCorrect) currentWord.timesCorrect += 1;
        saveWords();

        // Display feedback
        if (isCorrect) {
            practiceFeedback.textContent = 'Correct! Well done!';
            practiceFeedback.className = 'correct';
        } else {
            practiceFeedback.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
            practiceFeedback.className = 'incorrect';
        }

        // Show next question button
        checkAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.remove('hidden');
    }

    function resetPracticeUI() {
        practiceFeedback.textContent = '';
        practiceFeedback.className = '';
        practiceAnswer.classList.add('hidden');
        checkAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
    }
});
