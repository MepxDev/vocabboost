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
  words.forEach((item, index) => {
    const li = document.createElement("li");

    const wordSpan = document.createElement("span");
    wordSpan.textContent = item.word;
    wordSpan.addEventListener("click", () => {
      meaningEl.textContent = item.meaning;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      words.splice(index, 1);
      saveToStorage();
      displayWords();
      meaningEl.textContent = "Click on a word to see its meaning here.";
    });

    li.appendChild(wordSpan);
    li.appendChild(deleteBtn);
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

window.addEventListener("beforeunload", saveToStorage);
displayWords();
