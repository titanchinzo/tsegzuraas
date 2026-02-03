const lessons = [
  {
    title: "Анхан үсгүүд",
    subtitle: "Эхний үсгүүдээр хурууны хөдөлгөөнийг дасгалжуулна.",
    letters: ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З"],
  },
  {
    title: "Дунд шат",
    subtitle: "Давхар авиатай үсгүүдийг цэгцтэй бичиж сурна.",
    letters: ["И", "Й", "К", "Л", "М", "Н", "О", "Ө"],
  },
  {
    title: "Дэвшилтэт",
    subtitle: "Урт бичлэг, дугуйруулсан хэлбэрт дасгал хий.",
    letters: ["П", "Р", "С", "Т", "У", "Ү", "Ф", "Х"],
  },
  {
    title: "Нарийн бичлэг",
    subtitle: "Давхар зураас, нарийн хэлбэрийн үсгүүд.",
    letters: ["Ц", "Ч", "Ш", "Щ", "Э", "Ю", "Я"],
  },
];

const state = {
  lessonIndex: 0,
  letterIndex: 0,
  score: 0,
  correct: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
};

const elements = {
  startLesson: document.getElementById("startLesson"),
  resetProgress: document.getElementById("resetProgress"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonSubtitle: document.getElementById("lessonSubtitle"),
  letterRow: document.getElementById("letterRow"),
  currentLetter: document.getElementById("currentLetter"),
  heroLetter: document.getElementById("heroLetter"),
  statusValue: document.getElementById("statusValue"),
  lessonProgress: document.getElementById("lessonProgress"),
  lessonProgressText: document.getElementById("lessonProgressText"),
  score: document.getElementById("score"),
  correctCount: document.getElementById("correctCount"),
  accuracy: document.getElementById("accuracy"),
  streak: document.getElementById("streak"),
  bestStreak: document.getElementById("bestStreak"),
  level: document.getElementById("level"),
  prevLetter: document.getElementById("prevLetter"),
  nextLetter: document.getElementById("nextLetter"),
  repeatCount: document.getElementById("repeatCount"),
  repeatValue: document.getElementById("repeatValue"),
  practiceSheet: document.getElementById("practiceSheet"),
  letterInput: document.getElementById("letterInput"),
  checkLetter: document.getElementById("checkLetter"),
  feedback: document.getElementById("feedback"),
};

const STORAGE_KEY = "tsegzuraas-progress";

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

const getCurrentLetter = () => {
  const currentLesson = getCurrentLesson();
  return currentLesson.letters[state.letterIndex] || currentLesson.letters[0];
};

const calculateLevel = () => {
  if (state.score >= 400) return "Ахисан шат";
  if (state.score >= 200) return "Дунд шат";
  if (state.score >= 80) return "Идэвхтэй суралцагч";
  return "Анхан шат";
};

const updateProgress = () => {
  const lesson = getCurrentLesson();
  const percent = Math.round(((state.letterIndex + 1) / lesson.letters.length) * 100);
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

const renderLesson = () => {
  const lesson = getCurrentLesson();
  elements.lessonTitle.textContent = lesson.title;
  elements.lessonSubtitle.textContent = lesson.subtitle;
  elements.letterRow.innerHTML = "";
  lesson.letters.forEach((letter, index) => {
    const button = document.createElement("button");
    button.className = "letter-chip";
    button.textContent = letter;
    button.type = "button";
    if (index === state.letterIndex) button.classList.add("active");
    button.addEventListener("click", () => {
      state.letterIndex = index;
      syncLesson();
    });
    elements.letterRow.appendChild(button);
  });
  syncLesson();
};

const renderPracticeSheet = () => {
  const count = Number(elements.repeatCount.value);
  elements.repeatValue.textContent = count;
  elements.practiceSheet.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const div = document.createElement("div");
    div.className = "trace-letter";
    div.textContent = getCurrentLetter();
    elements.practiceSheet.appendChild(div);
  }
};

const syncLesson = () => {
  const letter = getCurrentLetter();
  elements.currentLetter.textContent = letter;
  elements.heroLetter.textContent = letter;
  Array.from(elements.letterRow.children).forEach((child, index) => {
    child.classList.toggle("active", index === state.letterIndex);
  });
  renderPracticeSheet();
  updateProgress();
  updateStats();
  updateStatus("Та бэлэн байна!", "");
  elements.letterInput.value = "";
  saveState();
};

const updateLessonIndex = (direction) => {
  const nextIndex = state.letterIndex + direction;
  const lesson = getCurrentLesson();
  if (nextIndex >= 0 && nextIndex < lesson.letters.length) {
    state.letterIndex = nextIndex;
  } else if (direction > 0 && state.lessonIndex < lessons.length - 1) {
    state.lessonIndex += 1;
    state.letterIndex = 0;
  } else if (direction < 0 && state.lessonIndex > 0) {
    state.lessonIndex -= 1;
    state.letterIndex = lessons[state.lessonIndex].letters.length - 1;
  }
  renderLesson();
};

const checkAnswer = () => {
  const input = elements.letterInput.value.trim().toUpperCase();
  if (!input) {
    updateStatus("Үсгээ бичээд шалгуулна уу.", "error");
    return;
  }

  const target = getCurrentLetter();
  state.attempts += 1;

  if (input === target) {
    state.correct += 1;
    state.score += 10 + state.streak * 2;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    updateStatus("Сайн байна! Зөв бичлээ.", "success");
    updateStats();
    setTimeout(() => updateLessonIndex(1), 500);
  } else {
    state.streak = 0;
    updateStatus(`Бараглаа! Энэ үсэг нь ${target}.`, "error");
    updateStats();
  }

  saveState();
};

const resetAll = () => {
  Object.assign(state, {
    lessonIndex: 0,
    letterIndex: 0,
    score: 0,
    correct: 0,
    attempts: 0,
    streak: 0,
    bestStreak: 0,
  });
  saveState();
  renderLesson();
  updateStatus("Шинээр эхэллээ!", "success");
};

const init = () => {
  loadState();
  renderLesson();
  updateStats();
  updateProgress();
  elements.startLesson.addEventListener("click", () => {
    updateStatus("Хичээл эхэллээ!", "success");
    elements.letterInput.focus();
  });
  elements.resetProgress.addEventListener("click", resetAll);
  elements.prevLetter.addEventListener("click", () => updateLessonIndex(-1));
  elements.nextLetter.addEventListener("click", () => updateLessonIndex(1));
  elements.repeatCount.addEventListener("input", renderPracticeSheet);
  elements.checkLetter.addEventListener("click", checkAnswer);
  elements.letterInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });
};

init();
