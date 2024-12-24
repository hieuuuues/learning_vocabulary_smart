let vocabList = JSON.parse(localStorage.getItem("vocabList")) || [];
let learningVocab = JSON.parse(localStorage.getItem("learningVocab")) || [];
let learnedVocab = JSON.parse(localStorage.getItem("learnedVocab")) || [];

document.getElementById("new-count").textContent = `${vocabList.length} từ`;
document.getElementById(
  "learning-count"
).textContent = `${learningVocab.length} từ`;
document.getElementById(
  "learned-count"
).textContent = `${learnedVocab.length} từ`;

updateVocabularyLists();

function addVocabulary() {
  const vocabInput = document.getElementById("vocab-input");
  const meaningInput = document.getElementById("meaning-input");
  const newWord = vocabInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (newWord && meaning) {
    vocabList.push({ word: newWord, meaning: meaning });
    updateVocabularyLists();
    vocabInput.value = "";
    meaningInput.value = "";
  }
}

function updateVocabularyLists() {
  document.getElementById("new-count").textContent = `${vocabList.length} từ`;
  document.getElementById(
    "learning-count"
  ).textContent = `${learningVocab.length} từ`;
  document.getElementById(
    "learned-count"
  ).textContent = `${learnedVocab.length} từ`;

  localStorage.setItem("vocabList", JSON.stringify(vocabList));
  localStorage.setItem("learningVocab", JSON.stringify(learningVocab));
  localStorage.setItem("learnedVocab", JSON.stringify(learnedVocab));

  if (document.getElementById("stats-page").style.display === "block") {
    showStatistics();
  }
}

function openFlashcard(type) {
  currentType = type;
  const flashcards = getFlashcardsByType(type);

  if (flashcards.length > 0) {
    currentIndex = 0;
    document.getElementById("main-page").style.display = "none";
    document.getElementById("flashcard-page").style.display = "block";
    showFlashcard();
  }
}

function getFlashcardsByType(type) {
  if (type === "new") return vocabList;
  if (type === "learning") return learningVocab;
  return [];
}

function showFlashcard() {
  const flashcards = getFlashcardsByType(currentType);
  if (flashcards.length > 0 && currentIndex < flashcards.length) {
    const currentVocab = flashcards[currentIndex];
    document.getElementById("vocab-word").textContent = currentVocab.word;
    document.getElementById("vocab-meaning").textContent = currentVocab.meaning;

    const flashcard = document.getElementById("flashcard");
    flashcard.classList.add("show-front");
    flashcard.classList.remove("show-back");

    flashcard.onclick = () => {
      flashcard.classList.toggle("show-front");
      flashcard.classList.toggle("show-back");
    };
  }
}

function nextFlashcard() {
  const flashcards = getFlashcardsByType(currentType);
  if (currentIndex < flashcards.length - 1) {
    currentIndex++;
    showFlashcard();
  } else {
    alert("Đã hết flashcard.");
  }
}

function prevFlashcard() {
  if (currentIndex > 0) {
    currentIndex--;
    showFlashcard();
  } else {
    alert("Đây là thẻ đầu tiên.");
  }
}

function markLearned() {
  if (currentType === "learning") {
    const currentVocab = learningVocab.splice(currentIndex, 1)[0];
    learnedVocab.push(currentVocab);
  } else if (currentType === "new") {
    const currentVocab = vocabList.splice(currentIndex, 1)[0];
    learnedVocab.push(currentVocab);
  }
  updateVocabularyLists();
  adjustIndexAndShowNext();
}

function markLearning() {
  if (currentType === "new") {
    const currentVocab = vocabList.splice(currentIndex, 1)[0];
    learningVocab.push(currentVocab);
    updateVocabularyLists();
    adjustIndexAndShowNext();
  }
}

function adjustIndexAndShowNext() {
  const flashcards = getFlashcardsByType(currentType);
  if (currentIndex >= flashcards.length) {
    currentIndex = flashcards.length - 1;
  }
  if (flashcards.length > 0) {
    showFlashcard();
  } else {
    goBack();
  }
}

function viewLearnedWords() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("learned-page").style.display = "block";

  const learnedList = document.getElementById("learned-list");
  learnedList.innerHTML = "";

  learnedVocab.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.word}: ${item.meaning}`;
    learnedList.appendChild(li);
  });
}

function goBack() {
  document.getElementById("main-page").style.display = "block";
  document.getElementById("flashcard-page").style.display = "none";
  document.getElementById("learned-page").style.display = "none";
  document.getElementById("matching-page").style.display = "none";
  document.getElementById("stats-page").style.display = "none";
  document.getElementById("learned-scramble-page").style.display = "none";
}

function startMatching() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("matching-page").style.display = "block";
  generateMatchingGame();
}

function generateMatchingGame() {
  const matchingContainer = document.getElementById("matching-container");
  matchingContainer.innerHTML = "";

  const allWords = [...learnedVocab];
  const shuffled = allWords.sort(() => Math.random() - 0.5);
  const words = shuffled.map((item) => ({ type: "word", text: item.word }));
  const meanings = shuffled.map((item) => ({
    type: "meaning",
    text: item.meaning,
  }));

  const items = [...words, ...meanings].sort(() => Math.random() - 0.5);
  const selectedItems = [];

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "matching-item";
    div.textContent = item.text;
    div.dataset.type = item.type;
    div.dataset.text = item.text;

    div.addEventListener("click", () => {
      if (selectedItems.length < 2 && !div.classList.contains("selected")) {
        div.classList.add("selected");
        selectedItems.push(div);

        if (selectedItems.length === 2) {
          checkMatch(selectedItems);
        }
      }
    });

    matchingContainer.appendChild(div);
  });
}

function checkMatch(selectedItems) {
  const [first, second] = selectedItems;

  const firstText = first.dataset.text;
  const secondText = second.dataset.text;

  let match = false;
  for (const vocab of learnedVocab) {
    if (
      (firstText === vocab.word && secondText === vocab.meaning) ||
      (firstText === vocab.meaning && secondText === vocab.word)
    ) {
      match = true;
      break;
    }
  }

  if (match) {
    first.style.backgroundColor = "#4caf50";
    second.style.backgroundColor = "#4caf50";
    setTimeout(() => {
      first.style.visibility = "hidden";
      second.style.visibility = "hidden";
    }, 1000);
  } else {
    first.style.backgroundColor = "#ff5733";
    second.style.backgroundColor = "#ff5733";
    setTimeout(() => {
      first.classList.remove("selected");
      second.classList.remove("selected");
      first.style.backgroundColor = "#e0e0e0";
      second.style.backgroundColor = "#e0e0e0";
    }, 1000);
  }

  setTimeout(() => {
    selectedItems.length = 0;
  }, 1000);
}

function resetApplication() {
  if (confirm("Bạn có chắc muốn đặt lại toàn bộ dữ liệu không?")) {
    vocabList = [];
    learningVocab = [];
    learnedVocab = [];
    updateVocabularyLists();
    alert("Dữ liệu đã được đặt lại!");
  }
}

function endGame() {
  alert("Kết thúc trò chơi! Bạn đã hoàn thành bài luyện tập.");
  goBack();
}
let progressChart;

function showStatistics() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("stats-page").style.display = "block";

  const ctx = document.getElementById("progressChart").getContext("2d");

  const data = {
    labels: ["Từ mới", "Đang học", "Đã học"],
    datasets: [
      {
        label: "Tiến độ học tập",
        data: [vocabList.length, learningVocab.length, learnedVocab.length],
        backgroundColor: ["#ff6384", "#36a2eb", "#4caf50"],
        hoverOffset: 4,
      },
    ],
  };

  if (progressChart) {
    progressChart.data.datasets[0].data = [
      vocabList.length,
      learningVocab.length,
      learnedVocab.length,
    ];
    progressChart.update();
  } else {
    const config = {
      type: "pie",
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} từ`,
            },
          },
        },
      },
    };

    progressChart = new Chart(ctx, config);
  }
}

function startScramblePractice() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("learned-scramble-page").style.display = "block";
  generateLearnedScrambledWords();
}

function generateLearnedScrambledWords() {
  const container = document.getElementById("scrambled-words-container");
  container.innerHTML = ""; // Xóa nội dung cũ

  if (learnedVocab.length > 0) {
    // Xáo trộn từ vựng đã học mỗi lần vào trang
    const shuffledLearnedVocab = learnedVocab.sort(() => Math.random() - 0.5);

    shuffledLearnedVocab.forEach((vocab, index) => {
      const scrambledWord = scrambleWord(vocab.word);

      const wordDiv = document.createElement("div");
      wordDiv.textContent = `Từ xáo trộn: ${scrambledWord}`;
      container.appendChild(wordDiv);

      const input = document.createElement("input");
      input.type = "text";
      input.id = `unscrambled-input-${index}`;
      input.dataset.originalWord = vocab.word;
      container.appendChild(input);
    });
  }
}

function scrambleWord(word) {
  const wordArray = word.split("");
  for (let i = wordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }
  return wordArray.join("");
}

function checkAllUnscrambledWords() {
  const resultDiv = document.getElementById("scramble-result");
  resultDiv.innerHTML = ""; // Xóa kết quả cũ

  learnedVocab.forEach((vocab, index) => {
    const input = document.getElementById(`unscrambled-input-${index}`);
    const userWord = input.value.trim();

    if (userWord === vocab.word) {
      const correctDiv = document.createElement("div");
      correctDiv.textContent = `Từ "${vocab.word}" nhập đúng!`;
      correctDiv.style.color = "green";
      resultDiv.appendChild(correctDiv);
    } else {
      const wrongDiv = document.createElement("div");
      wrongDiv.textContent = `Từ "${vocab.word}" nhập sai!`;
      wrongDiv.style.color = "red";
      resultDiv.appendChild(wrongDiv);
    }
  });
}
