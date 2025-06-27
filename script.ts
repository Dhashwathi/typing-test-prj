const quoteDisplay = document.getElementById("proverb") as HTMLElement;
const quoteInput = document.getElementById("input") as HTMLTextAreaElement;
const restartBtn = document.getElementById("restart") as HTMLButtonElement;
const timerValue = document.getElementById("value") as HTMLSpanElement;
const resultPopup = document.getElementById("res-popup") as HTMLElement;
const msg = document.getElementById("msg") as HTMLParagraphElement;
const totalSpan = document.getElementById("total") as HTMLSpanElement;
const correctSpan = document.getElementById("crt-words") as HTMLSpanElement;
const timeSpan = document.getElementById("tym-taken") as HTMLSpanElement;
const accuracySpan = document.getElementById("acc") as HTMLSpanElement;
const leaderboard = document.getElementById("leaderboard") as HTMLOListElement;
const wpmSpan = document.getElementById("wpm") as HTMLSpanElement;

let sentence = "";
let isStarted = false;
let startTime = 0;
let intervalId: number;
const maxTime = 60;
let totalCharsTyped = 0;
let correctCharsTyped = 0;
let timeTaken = 0;
let wrongchar=0;

async function fetchQuote() {
  try {
    const response = await fetch("https://dummyjson.com/quotes");
    const data = await response.json();
    const quotes = data.quotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    sentence = randomQuote.quote;
    loadQuote();
  } catch {
    sentence = "Stay positive, work hard, make it happen.";
    loadQuote();
  }
}

function loadQuote() {
  quoteDisplay.innerHTML = '';
  sentence.split('').forEach((char, idx) => {
    const span = document.createElement("span");
    span.innerText = char;
    if (idx === 0) span.classList.add("active");
    quoteDisplay.appendChild(span);
  });
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
  startTime = Date.now();
  intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerValue.textContent = formatTime(elapsed);
    if (elapsed >= maxTime) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(intervalId);
  quoteInput.disabled = true;
  timeTaken = Math.floor((Date.now() - startTime) / 1000);
  if (!isStarted) return;
  showResult();
  
}

function showResult() {
  timeTaken = Math.floor((Date.now() - startTime) / 1000);

  totalCharsTyped = correctCharsTyped + wrongchar;

  const accuracy = totalCharsTyped > 0
    ? Math.round((correctCharsTyped / totalCharsTyped) * 100)
    : 0;
  
  const wordsTyped = quoteInput.value.trim().split(/\s+/).length;
  const wpm = timeTaken > 0 ? Math.round((wordsTyped / timeTaken) * 60) : 0;
  
  wpmSpan.textContent= wpm.toString();
  totalSpan.textContent = totalCharsTyped.toString();
  correctSpan.textContent = correctCharsTyped.toString();
  timeSpan.textContent = timeTaken.toString();
  accuracySpan.textContent = accuracy.toString();

  if (accuracy >= 90) {
    msg.textContent = `That’s quack-tastic! You're faster than a flock in migration!`
  } else if (accuracy <= 90 && accuracy>=60) {
    msg.textContent = `Quack on! That’s some solid pecking power!`;
  } else {
    msg.textContent = `You're still learning to fly—keep pecking away!`;
  }
  updateLeaderboard(accuracy);
  resultPopup.classList.remove("hidden-popup");
  resultPopup.style.display = "flex";
}


function updateLeaderboard(score: number) {
  const raw = localStorage.getItem("typingScores") || "[]";
  const scores = JSON.parse(raw);
  const now = new Date().toLocaleString();

  scores.push({ score, timestamp: now });
  const lastFive = scores.slice(-5);
  localStorage.setItem("typingScores", JSON.stringify(lastFive));
  renderLeaderboard(lastFive);
}

function showExistingLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("typingScores") || "[]");
  renderLeaderboard(scores.slice(-5));
}

function renderLeaderboard(scores: { score: number; timestamp: string }[]) {
  leaderboard.innerHTML = "";
  scores.reverse().forEach(({ score, timestamp }) => {
    const li = document.createElement("li");
    li.textContent = `${score}% accuracy — ${timestamp}`;
    leaderboard.appendChild(li);
  });
}

quoteInput.addEventListener("input", () => {
  const input = quoteInput.value;
  const spans = quoteDisplay.querySelectorAll("span");

  if (!isStarted) {
    isStarted = true;
    startTimer();
  }

  restartBtn.classList.remove("hid-restart");

  spans.forEach(span => span.classList.remove("correct", "incorrect", "active"));

  const currentIndex = input.length - 1;
  const currentChar = input[currentIndex];
  const expectedChar = sentence[currentIndex];

  if (currentChar !== expectedChar) {
    if (spans[currentIndex]) {
      spans[currentIndex].classList.add("incorrect");
    }

    wrongchar++;
    quoteInput.value = input.slice(0, currentIndex); 
    return;
  }

  if (spans[currentIndex]) {
    spans[currentIndex].classList.add("correct");
  }

  correctCharsTyped++;
  totalCharsTyped++;


  if (spans[currentIndex + 1]) {
    spans[currentIndex + 1].classList.add("active");
  }

  // If sentence completed
  if (input.length === sentence.length) {
    quoteInput.value = '';
    fetchQuote();
  }
});


restartBtn.addEventListener("click", () => {
  location.reload();
});

window.addEventListener("DOMContentLoaded", () => {
  fetchQuote();
  showExistingLeaderboard();
});
