const lessons = [
  {
    id: "mn-basic",
    title: "Монгол үсгийн үндэс",
    text: "а э и о у ө ү н г ш ч ж з р л б п т д",
  },
  {
    id: "mn-syllable",
    title: "Үе, үг холболт",
    text: "ба бо бу бэ бө бүү ба бу бэ бө",
  },
  {
    id: "mn-phrase",
    title: "Өдөр тутмын өгүүлбэр",
    text: "Сайн байна уу? Би өнөөдөр Монгол үсэг давтаж байна.",
  },
];

const lessonSelect = document.getElementById("lessonSelect");
const repeatRange = document.getElementById("repeatRange");
const repeatValue = document.getElementById("repeatValue");
const startLesson = document.getElementById("startLesson");
const resetSession = document.getElementById("resetSession");
const pauseLesson = document.getElementById("pauseLesson");
const lessonText = document.getElementById("lessonText");
const lessonTitle = document.getElementById("lessonTitle");
const repeatStatus = document.getElementById("repeatStatus");
const currentLetter = document.getElementById("currentLetter");
const nextLetter = document.getElementById("nextLetter");
const repeatTracker = document.getElementById("repeatTracker");
const lastResult = document.getElementById("lastResult");
const typeInput = document.getElementById("typeInput");
const scoreValue = document.getElementById("scoreValue");
const scoreHint = document.getElementById("scoreHint");
const progressValue = document.getElementById("progressValue");
const progressHint = document.getElementById("progressHint");
const progressBar = document.getElementById("progressBar");
const errorValue = document.getElementById("errorValue");
const errorHint = document.getElementById("errorHint");

let currentLesson = lessons[0];
let currentIndex = 0;
let currentRepeat = 0;
let repeatTarget = Number(repeatRange.value);
let correctCount = 0;
let errorCount = 0;
let totalKeystrokes = 0;
let isPaused = false;

const setHint = (element, message, className) => {
  element.textContent = message;
  element.classList.remove("success", "error");
  if (className) {
    element.classList.add(className);
  }
};

const buildLesson = () => {
  lessonText.innerHTML = "";
  currentLesson.text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.className = index === 0 ? "current" : "upcoming";
    lessonText.appendChild(span);
  });
};

const updateLessonHighlight = () => {
  const spans = lessonText.querySelectorAll("span");
  spans.forEach((span, index) => {
    span.className = "";
    if (index < currentIndex) {
      span.classList.add("done");
    } else if (index === currentIndex) {
      span.classList.add("current");
    } else {
      span.classList.add("upcoming");
    }
  });
};

const updateStats = () => {
  const total = currentLesson.text.length;
  const progress = Math.min(currentIndex, total);
  const percent = totalKeystrokes === 0 ? 0 : Math.round((correctCount / totalKeystrokes) * 100);
  scoreValue.textContent = `${percent}%`;
  scoreHint.textContent = totalKeystrokes === 0 ? "Одоогоор бичиж эхлээгүй байна" : "Оноо бодож байна";
  progressValue.textContent = `${progress} / ${total}`;
  progressHint.textContent = progress === total ? "Хичээл дууслаа!" : "Дасгал үргэлжилж байна";
  progressBar.style.width = total === 0 ? "0%" : `${Math.round((progress / total) * 100)}%`;
  errorValue.textContent = errorCount;
  errorHint.textContent = errorCount === 0 ? "Төгс эхлэл!" : "Дахин анхаараарай";
};

const updateRepeatUI = () => {
  repeatValue.textContent = `${repeatTarget}x`;
  repeatStatus.textContent = `Үсэг бүр ${repeatTarget} удаа`;
  repeatTracker.textContent = `${currentRepeat} / ${repeatTarget}`;
};

const updateCurrentLetterUI = () => {
  const text = currentLesson.text;
  currentLetter.textContent = text[currentIndex] || "—";
  nextLetter.textContent = text[currentIndex + 1] || "—";
  updateLessonHighlight();
};

const resetProgress = () => {
  currentIndex = 0;
  currentRepeat = 0;
  correctCount = 0;
  errorCount = 0;
  totalKeystrokes = 0;
  isPaused = false;
  pauseLesson.textContent = "Түр зогсоох";
  buildLesson();
  updateRepeatUI();
  updateCurrentLetterUI();
  updateStats();
  setHint(lastResult, "Алдаагүй", "success");
  typeInput.value = "";
  typeInput.focus();
};

const completeLesson = () => {
  setHint(lastResult, "Хичээл дууслаа!", "success");
  currentLetter.textContent = "✓";
  nextLetter.textContent = "—";
  progressHint.textContent = "Хичээл дууслаа!";
  typeInput.blur();
};

const handleKey = (event) => {
  if (isPaused) {
    return;
  }

  const key = event.key;
  if (key.length !== 1) {
    return;
  }
  event.preventDefault();

  const expected = currentLesson.text[currentIndex];
  totalKeystrokes += 1;

  if (key === expected) {
    correctCount += 1;
    currentRepeat += 1;
    setHint(lastResult, "Зөв!", "success");
    if (currentRepeat >= repeatTarget) {
      currentIndex += 1;
      currentRepeat = 0;
    }
  } else {
    errorCount += 1;
    setHint(lastResult, "Алдаа гарлаа", "error");
    lessonText.classList.remove("shake");
    void lessonText.offsetWidth;
    lessonText.classList.add("shake");
  }

  if (currentIndex >= currentLesson.text.length) {
    updateStats();
    completeLesson();
    return;
  }

  updateRepeatUI();
  updateCurrentLetterUI();
  updateStats();
};

const populateLessons = () => {
  lessonSelect.innerHTML = "";
  lessons.forEach((lesson) => {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = lesson.title;
    lessonSelect.appendChild(option);
  });
};

const selectLesson = (lessonId) => {
  currentLesson = lessons.find((lesson) => lesson.id === lessonId) || lessons[0];
  lessonTitle.textContent = currentLesson.title;
  resetProgress();
};

repeatRange.addEventListener("input", (event) => {
  repeatTarget = Number(event.target.value);
  updateRepeatUI();
});

lessonSelect.addEventListener("change", (event) => {
  selectLesson(event.target.value);
});

startLesson.addEventListener("click", () => {
  selectLesson(lessonSelect.value);
  typeInput.focus();
});

resetSession.addEventListener("click", resetProgress);

pauseLesson.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseLesson.textContent = isPaused ? "Үргэлжлүүлэх" : "Түр зогсоох";
  setHint(lastResult, isPaused ? "Түр зогссон" : "Үргэлжлүүлж байна", "success");
  if (!isPaused) {
    typeInput.focus();
  }
});

typeInput.addEventListener("keydown", handleKey);

populateLessons();
selectLesson(lessons[0].id);
