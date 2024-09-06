let words = [];
let selectedEnglish = null;
let selectedFrench = null;
let matchCount = 0; // Track the number of correct matches made
let timer = 120; // 2 minutes = 120 seconds
let timerInterval;

window.onload = () => {
    fetchWords();
    startTimer();
};

// Fetch words from words.json
function fetchWords() {
    fetch('words.json') // Load the JSON file containing words
        .then(response => response.json())
        .then(data => {
            words = data; // Store the words in the `words` array
            startGame();  // Start the game once words are loaded
        })
        .catch(error => {
            console.error('Error fetching the word list:', error);
        });
}

// Start the game with the shuffled words
function startGame() {
    const frenchColumn = document.getElementById('french-words');
    const englishColumn = document.getElementById('english-words');

    // Shuffle the word list and select 5 word pairs to create 5 rows
    const shuffledWords = shuffle([...words]).slice(0, 5);

    // Split the words into two separate arrays for French and English words
    let frenchWords = shuffledWords.map(word => word.french);
    let englishWords = shuffledWords.map(word => word.english);

    // Shuffle both arrays to randomize their positions
    frenchWords = shuffle(frenchWords);
    englishWords = shuffle(englishWords);

    // Clear previous words before repopulating
    frenchColumn.innerHTML = '';
    englishColumn.innerHTML = '';

    // Add the French words to the French column and the English words to the English column
    frenchWords.forEach(frenchWord => {
        createWordElement(frenchWord, shuffledWords.find(word => word.french === frenchWord).english, frenchColumn, 'french');
    });
    englishWords.forEach(englishWord => {
        createWordElement(englishWord, shuffledWords.find(word => word.english === englishWord).french, englishColumn, 'english');
    });

    // Reset match count
    matchCount = 0;

    // Attach event listeners to all created word elements
    const allWords = [...frenchColumn.children, ...englishColumn.children];
    allWords.forEach(word => word.addEventListener('click', () => selectWord(word)));
}

// Create a word element and add it to the column
function createWordElement(word, match, container, language) {
    const div = document.createElement('div');
    div.classList.add('grid-item');
    div.innerText = word;
    div.dataset.language = language;
    div.dataset.word = word;
    div.dataset.match = match;

    container.appendChild(div); // Add to the container (French or English column)
}

// Shuffle the words
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Handle word selection
function selectWord(div) {
    // Ensure that both selections clear any previous states
    if (selectedEnglish) selectedEnglish.classList.remove('selected');
    if (selectedFrench) selectedFrench.classList.remove('selected');

    // Mark the word as selected (apply orange background)
    if (div.dataset.language === 'english') {
        selectedEnglish = div;
        selectedEnglish.classList.add('selected');
    } else {
        selectedFrench = div;
        selectedFrench.classList.add('selected');
    }

    // Check for a match if both a French and English word are selected
    if (selectedEnglish && selectedFrench) {
        if (selectedEnglish.dataset.word === selectedFrench.dataset.match) {
            handleCorrectMatch();
        } else {
            resetSelection(); // If not a match, reset the selection
        }
    }
}

// Handle a correct match
function handleCorrectMatch() {
    // Set the matched words' background to pale blue and make them unselectable
    selectedEnglish.classList.add('matched');
    selectedFrench.classList.add('matched');
    selectedEnglish.style.backgroundColor = 'rgba(0, 123, 255, 0.5)'; // Pale blue
    selectedFrench.style.backgroundColor = 'rgba(0, 123, 255, 0.5)'; // Pale blue

    selectedEnglish.removeEventListener('click', selectWord); // Make unselectable
    selectedFrench.removeEventListener('click', selectWord); // Make unselectable

    // Clear the selection
    selectedEnglish = null;
    selectedFrench = null;

    matchCount++;

    // After 3 correct matches, repopulate both columns with new words
    if (matchCount % 3 === 0) {
        replaceMatchedWords();
    }
}

// Reset the selected words' style when there's no match
function resetSelection() {
    if (selectedEnglish) selectedEnglish.classList.remove('selected');
    if (selectedFrench) selectedFrench.classList.remove('selected');
    selectedEnglish = null;
    selectedFrench = null;
}

// Replace matched words after 3 correct matches
function replaceMatchedWords() {
    const frenchColumn = document.getElementById('french-words');
    const englishColumn = document.getElementById('english-words');

    // Get new words to replace the matched ones
    const newWords = shuffle([...words]).slice(0, 3); // Replace with 3 new word pairs

    const matchedFrenchItems = frenchColumn.querySelectorAll('.matched');
    const matchedEnglishItems = englishColumn.querySelectorAll('.matched');

    // Shuffle the new words so they are not side-by-side
    let frenchWords = shuffle(newWords.map(word => word.french));
    let englishWords = shuffle(newWords.map(word => word.english));

    // Reset selection states before replacing matched words
    selectedEnglish = null;
    selectedFrench = null;

    // Replace matched French words
    matchedFrenchItems.forEach((item, index) => {
        const newFrenchWord = frenchWords[index];
        const newEnglishMatch = newWords.find(word => word.french === newFrenchWord).english;

        item.classList.remove('matched');
        item.style.backgroundColor = 'rgba(0, 123, 255, 1)'; // Reset to blue
        item.innerText = newFrenchWord;
        item.dataset.word = newFrenchWord;
        item.dataset.match = newEnglishMatch;
    });

    // Replace matched English words
    matchedEnglishItems.forEach((item, index) => {
        const newEnglishWord = englishWords[index];
        const newFrenchMatch = newWords.find(word => word.english === newEnglishWord).french;

        item.classList.remove('matched');
        item.style.backgroundColor = 'rgba(0, 123, 255, 1)'; // Reset to blue
        item.innerText = newEnglishWord;
        item.dataset.word = newEnglishWord;
        item.dataset.match = newFrenchMatch;
    });

    // Re-attach event listeners to the newly added words
    const newFrenchElements = frenchColumn.querySelectorAll('.grid-item');
    newFrenchElements.forEach(word => word.addEventListener('click', () => selectWord(word)));
    const newEnglishElements = englishColumn.querySelectorAll('.grid-item');
    newEnglishElements.forEach(word => word.addEventListener('click', () => selectWord(word)));
}

// Timer functionality
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    const timerBar = document.getElementById('timer-bar');
    const totalWidth = 100; // Start with 100% width

    timerInterval = setInterval(() => {
        timer--;
        let percentage = (timer / 120) * 100; // Calculate remaining percentage
        timerBar.style.width = percentage + '%';

        if (timer === 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// End the game when the timer hits zero
function endGame() {
    alert("Time's up! The game is over.");
    const frenchColumn = document.getElementById('french-words');
    const englishColumn = document.getElementById('english-words');

    // Disable all words from being selected
    const allWords = [...frenchColumn.children, ...englishColumn.children];
    allWords.forEach(word => {
        word.removeEventListener('click', selectWord);
    });
}
