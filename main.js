let words = JSON.parse(localStorage.getItem("wordList")) || [
  { id: crypto.randomUUID(), word: "Objection", meaning: "A lawyer's protest against something said or done." },
  { id: crypto.randomUUID(), word: "Evidence", meaning: "Proof presented in court to support facts." }
];

const wordListEl = document.getElementById("wordList");
const meaningEl = document.getElementById("meaning");
const form = document.getElementById("addWordForm");
const newWordInput = document.getElementById("newWord");
const newMeaningInput = document.getElementById("newMeaning");
const deleteSelectedBtn = document.getElementById("deleteSelected");

function saveToStorage() {
  localStorage.setItem("wordList", JSON.stringify(words));
}

function displayWords() {
  wordListEl.innerHTML = "";
  words.forEach((item) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.id = item.id;

    const wordSpan = document.createElement("span");
    wordSpan.textContent = item.word;
    wordSpan.addEventListener("click", () => {
      meaningEl.textContent = item.meaning;
    });

    li.appendChild(checkbox);
    li.appendChild(wordSpan);
    wordListEl.appendChild(li);
  });
}

deleteSelectedBtn.addEventListener("click", () => {
  const checkboxes = document.querySelectorAll('#wordList input[type="checkbox"]:checked');
  const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.id);

  words = words.filter(word => !idsToDelete.includes(word.id));
  saveToStorage();
  displayWords();
  meaningEl.textContent = "Click on a word to see its meaning here.";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newWord = newWordInput.value.trim();
  const newMeaning = newMeaningInput.value.trim();
  if (newWord && newMeaning) {
    words.push({ id: crypto.randomUUID(), word: newWord, meaning: newMeaning });
    saveToStorage();
    displayWords();
    newWordInput.value = "";
    newMeaningInput.value = "";
    meaningEl.textContent = "Click on a word to see its meaning here.";
  }
});

window.addEventListener("beforeunload", saveToStorage);
displayWords();
