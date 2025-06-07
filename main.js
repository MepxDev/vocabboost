let words = JSON.parse(localStorage.getItem("wordList")) || [
  { id: crypto.randomUUID(), word: "Objection", meaning: "A lawyer’s protest in court." },
  { id: crypto.randomUUID(), word: "Evidence", meaning: "Proof used in court." }
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

    const wordSpan = document.createElement("span");
    wordSpan.textContent = item.word;
    wordSpan.addEventListener("click", () => {
      meaningEl.textContent = `📖 ${item.meaning}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      words = words.filter(w => w.id !== item.id);
      saveToStorage();
      displayWords();
      meaningEl.textContent = "💡 Click a word to see its meaning";
    });

    li.appendChild(wordSpan);
    li.appendChild(deleteBtn);
    wordListEl.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const word = newWordInput.value.trim();
  const meaning = newMeaningInput.value.trim();
  if (word && meaning) {
    words.push({ id: crypto.randomUUID(), word, meaning });
    saveToStorage();
    displayWords();
    form.reset();
    meaningEl.textContent = "💡 Click a word to see its meaning";
  }
});

window.addEventListener("beforeunload", saveToStorage);
displayWords();

