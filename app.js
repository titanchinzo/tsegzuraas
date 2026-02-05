const lessons = [
  {
    title: "Анхан үсгүүд",
    subtitle: "A-I үсгүүдийн морзын кодыг цээжилнэ.",
    symbols: [
      { char: "A", morse: ".-" },
      { char: "B", morse: "-..." },
      { char: "C", morse: "-.-." },
      { char: "D", morse: "-.." },
      { char: "E", morse: "." },
      { char: "F", morse: "..-." },
      { char: "G", morse: "--." },
      { char: "H", morse: "...." },
      { char: "I", morse: ".." },
    ],
  },
  {
    title: "Дунд шат",
    subtitle: "J-R үсгүүдийг нэмээд хурдыг ахиулна.",
    symbols: [
      { char: "J", morse: ".---" },
      { char: "K", morse: "-.-" },
      { char: "L", morse: ".-.." },
      { char: "M", morse: "--" },
      { char: "N", morse: "-." },
      { char: "O", morse: "---" },
      { char: "P", morse: ".--." },
      { char: "Q", morse: "--.-" },
      { char: "R", morse: ".-." },
    ],
  },
  {
    title: "Ахисан шат",
    subtitle: "S-Z үсэг болон тэмдэглэлүүд.",
    symbols: [
      { char: "S", morse: "..." },
      { char: "T", morse: "-" },
      { char: "U", morse: "..-" },
      { char: "V", morse: "...-" },
      { char: "W", morse: ".--" },
      { char: "X", morse: "-..-" },
      { char: "Y", morse: "-.--" },
      { char: "Z", morse: "--.." },
    ],
  },
  {
    title: "Тоонууд",
    subtitle: "0-9 тоог унших дадлага.",
    symbols: [
      { char: "1", morse: ".----" },
      { char: "2", morse: "..---" },
      { char: "3", morse: "...--" },
      { char: "4", morse: "....-" },
      { char: "5", morse: "....." },
      { char: "6", morse: "-...." },
      { char: "7", morse: "--..." },
      { char: "8", morse: "---.." },
      { char: "9", morse: "----." },
      { char: "0", morse: "-----" },
    ],
  },
  {
    title: "Нийтлэг дохио",
    subtitle: "Тусламж, анхаарал татах дохиог цээжилнэ.",
    symbols: [
      { char: "SOS", morse: "...---..." },
      { char: "OK", morse: "---.-" },
      { char: "HELP", morse: "......-...--." },
      { char: "CALL", morse: "-.-..-.-...-" },
    ],
  },
];

const state = {
  lessonIndex: 0,
  symbolIndex: 0,
  score: 0,
  correct: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
  currentSignal: "",
  isPlaying: false,
};

const elements = {
  startLesson: document.getElementById("startLesson"),
  resetProgress: document.getElementById("resetProgress"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonSubtitle: document.getElementById("lessonSubtitle"),
  symbolRow: document.getElementById("symbolRow"),
  currentSymbol: document.getElementById("currentSymbol"),
  heroSymbol: document.getElementById("heroSymbol"),
  heroMorse: document.getElementById("heroMorse"),
  statusValue: document.getElementById("statusValue"),
  lessonProgress: document.getElementById("lessonProgress"),
  lessonProgressText: document.getElementById("lessonProgressText"),
  score: document.getElementById("score"),
  correctCount: document.getElementById("correctCount"),
  accuracy: document.getElementById("accuracy"),
  streak: document.getElementById("streak"),
  bestStreak: document.getElementById("bestStreak"),
  level: document.getElementById("level"),
  prevSymbol: document.getElementById("prevSymbol"),
  nextSymbol: document.getElementById("nextSymbol"),
  repeatCount: document.getElementById("repeatCount"),
  repeatValue: document.getElementById("repeatValue"),
  practiceSheet: document.getElementById("practiceSheet"),
  letterInput: document.getElementById("letterInput"),
  checkAnswer: document.getElementById("checkAnswer"),
  feedback: document.getElementById("feedback"),
  dotButton: document.getElementById("dotButton"),
  dashButton: document.getElementById("dashButton"),
  clearButton: document.getElementById("clearButton"),
  backspaceButton: document.getElementById("backspaceButton"),
  signalDisplay: document.getElementById("signalDisplay"),
  signalLight: document.getElementById("signalLight"),
  playSignal: document.getElementById("playSignal"),
};

const STORAGE_KEY = "tsegzuraas-morse-progress";

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const parsed = JSON.parse(stored);
  Object.assign(state, parsed);
};

const getCurrentLesson = () => lessons[state.lessonIndex];

const getCurrentSymbol = () => {
  const currentLesson = getCurrentLesson();
  return currentLesson.symbols[state.symbolIndex] || currentLesson.symbols[0];
};

const calculateLevel = () => {
  if (state.score >= 400) return "Ахисан шат";
  if (state.score >= 200) return "Дунд шат";
  if (state.score >= 80) return "Идэвхтэй суралцагч";
  return "Анхан шат";
};

const updateProgress = () => {
  const lesson = getCurrentLesson();
  const percent = Math.round(((state.symbolIndex + 1) / lesson.symbols.length) * 100);
  elements.lessonProgress.style.width = `${percent}%`;
  elements.lessonProgressText.textContent = `${percent}%`;
};

const updateStats = () => {
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  elements.score.textContent = state.score;
  elements.correctCount.textContent = state.correct;
  elements.accuracy.textContent = `Нарийвчлал ${accuracy}%`;
  elements.streak.textContent = state.streak;
  elements.bestStreak.textContent = `Дээд амжилт ${state.bestStreak}`;
  elements.level.textContent = calculateLevel();
};

const updateStatus = (message, type) => {
  elements.feedback.textContent = message;
  elements.feedback.classList.remove("success", "error");
  if (type) elements.feedback.classList.add(type);
  if (type === "success") {
    elements.statusValue.textContent = "Зөв";
  } else if (type === "error") {
    elements.statusValue.textContent = "Алдаа";
  } else {
    elements.statusValue.textContent = "Бэлтгэл";
  }
};

const renderMorsePills = (container, morse) => {
  container.innerHTML = "";
  [...morse].forEach((signal) => {
    const pill = document.createElement("span");
    pill.className = "morse-pill";
    pill.textContent = signal === "." ? "Цэг" : "Зураас";
    container.appendChild(pill);
  });
};

const renderLesson = () => {
  const lesson = getCurrentLesson();
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonSubtitle.textContent = lesson.subtitle;
  elements.symbolRow.innerHTML = "";
  lesson.symbols.forEach((symbol, index) => {
    const button = document.createElement("button");
    button.className = "letter-chip";
    button.type = "button";
    button.innerHTML = `${symbol.char} <span>${symbol.morse}</span>`;
    if (index === state.symbolIndex) button.classList.add("active");
    button.addEventListener("click", () => {
      state.symbolIndex = index;
      syncLesson();
    });
    elements.symbolRow.appendChild(button);
  });
  syncLesson();
};

const renderPracticeSheet = () => {
  const count = Number(elements.repeatCount.value);
  elements.repeatValue.textContent = count;
  elements.practiceSheet.innerHTML = "";
  const symbol = getCurrentSymbol();
  for (let i = 0; i < count; i += 1) {
    const div = document.createElement("div");
    div.className = "trace-letter";
    div.innerHTML = `<strong>${symbol.char}</strong><span>${symbol.morse}</span>`;
    elements.practiceSheet.appendChild(div);
  }
};

const updateSignalDisplay = () => {
  elements.signalDisplay.innerHTML = "";
  if (!state.currentSignal) {
    elements.signalDisplay.textContent = "Дохио хоосон байна";
    return;
  }
  [...state.currentSignal].forEach((signal) => {
    const pill = document.createElement("span");
    pill.className = "morse-pill";
    pill.textContent = signal;
    elements.signalDisplay.appendChild(pill);
  });
};

const syncLesson = () => {
  const symbol = getCurrentSymbol();
  elements.currentSymbol.textContent = symbol.char;
  elements.heroSymbol.textContent = symbol.char;
  renderMorsePills(elements.heroMorse, symbol.morse);
  Array.from(elements.symbolRow.children).forEach((child, index) => {
    child.classList.toggle("active", index === state.symbolIndex);
  });
  renderPracticeSheet();
  updateProgress();
  updateStats();
  updateStatus("Та бэлэн байна!", "");
  elements.letterInput.value = "";
  state.currentSignal = "";
  updateSignalDisplay();
  saveState();
};

const updateLessonIndex = (direction) => {
  const nextIndex = state.symbolIndex + direction;
  const lesson = getCurrentLesson();
  if (nextIndex >= 0 && nextIndex < lesson.symbols.length) {
    state.symbolIndex = nextIndex;
  } else if (direction > 0 && state.lessonIndex < lessons.length - 1) {
    state.lessonIndex += 1;
    state.symbolIndex = 0;
  } else if (direction < 0 && state.lessonIndex > 0) {
    state.lessonIndex -= 1;
    state.symbolIndex = lessons[state.lessonIndex].symbols.length - 1;
  }
  renderLesson();
};

const normalizeInput = (value) => value.toUpperCase().replace(/\s+/g, "");

const checkAnswer = () => {
  const input = normalizeInput(elements.letterInput.value.trim());
  const target = getCurrentSymbol();
  const signal = state.currentSignal;
  if (!input && !signal) {
    updateStatus("Дохио эсвэл үсгээ оруулаарай.", "error");
    return;
  }

  state.attempts += 1;

  const isMorseInput = input.includes(".") || input.includes("-");
  const finalInput = input || signal;
  const isCorrect = isMorseInput ? finalInput === target.morse : finalInput === target.char;

  if (isCorrect) {
    state.correct += 1;
    state.score += 12 + state.streak * 3;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    updateStatus("Гайхалтай! Зөв морз код.", "success");
    updateStats();
    setTimeout(() => updateLessonIndex(1), 500);
  } else {
    state.streak = 0;
    updateStatus(`Алдаа. Зөв дохио нь ${target.morse}.`, "error");
    updateStats();
  }

  state.currentSignal = "";
  updateSignalDisplay();
  saveState();
};

const resetAll = () => {
  Object.assign(state, {
    lessonIndex: 0,
    symbolIndex: 0,
    score: 0,
    correct: 0,
    attempts: 0,
    streak: 0,
    bestStreak: 0,
    currentSignal: "",
    isPlaying: false,
  });
  saveState();
  renderLesson();
  updateStatus("Шинээр эхэллээ!", "success");
};

const playSignal = async () => {
  if (state.isPlaying) return;
  const { morse } = getCurrentSymbol();
  state.isPlaying = true;
  elements.playSignal.disabled = true;
  const dotDuration = 180;
  const dashDuration = 480;
  const gap = 160;

  for (const signal of morse) {
    const duration = signal === "." ? dotDuration : dashDuration;
    elements.signalLight.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, duration));
    elements.signalLight.classList.remove("active");
    await new Promise((resolve) => setTimeout(resolve, gap));
  }

  elements.playSignal.disabled = false;
  state.isPlaying = false;
};

const init = () => {
  loadState();
  renderLesson();
  updateStats();
  updateProgress();
  updateSignalDisplay();
  elements.startLesson.addEventListener("click", () => {
    updateStatus("Хичээл эхэллээ!", "success");
    elements.letterInput.focus();
  });
  elements.resetProgress.addEventListener("click", resetAll);
  elements.prevSymbol.addEventListener("click", () => updateLessonIndex(-1));
  elements.nextSymbol.addEventListener("click", () => updateLessonIndex(1));
  elements.repeatCount.addEventListener("input", renderPracticeSheet);
  elements.checkAnswer.addEventListener("click", checkAnswer);
  elements.letterInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });
  elements.dotButton.addEventListener("click", () => {
    state.currentSignal += ".";
    updateSignalDisplay();
  });
  elements.dashButton.addEventListener("click", () => {
    state.currentSignal += "-";
    updateSignalDisplay();
  });
  elements.backspaceButton.addEventListener("click", () => {
    state.currentSignal = state.currentSignal.slice(0, -1);
    updateSignalDisplay();
  });
  elements.clearButton.addEventListener("click", () => {
    state.currentSignal = "";
    updateSignalDisplay();
  });
  elements.playSignal.addEventListener("click", playSignal);
};

init();
