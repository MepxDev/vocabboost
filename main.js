// Load from localStorage or use default values
let words = JSON.parse(localStorage.getItem("wordList")) || [
  { word: "Objection", meaning: "A lawyer's protest against something said or done." },
  { word: "Evidence", meaning: "Proof presented in court to support facts." }
];

const wordListEl = document.getElementById("wordList");
const meaningEl = document.getElementById("meaning");
const form = document.getElementById("addWordForm");
const newWordInput = document.getElementById("newWord");
const newMeaningInput = document.getElementById("newMeaning");

function saveToStorage() {
  localStorage.setItem("wordList", JSON.stringify(words));
}

function displayWords() {
  wordListEl.innerHTML = "";
  words.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.word;
    li.addEventListener("click", () => {
      meaningEl.textContent = item.meaning;
    });
    wordListEl.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newWord = newWordInput.value.trim();
  const newMeaning = newMeaningInput.value.trim();
  if (newWord && newMeaning) {
    words.push({ word: newWord, meaning: newMeaning });
    saveToStorage();
    displayWords();
    newWordInput.value = "";
    newMeaningInput.value = "";
    meaningEl.textContent = "Click on a word to see its meaning here.";
  }
});

window.addEventListener("beforeunload", saveToStorage); // Save again on exit
displayWords(); // Load existing words
