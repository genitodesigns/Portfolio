/**
 * Initializes the quiz when the DOM content is fully loaded.
 * Sets up the quiz container and submit button functionality.
 */
document.addEventListener("DOMContentLoaded", function () {
  const quizContainer = document.getElementById("quiz-container");
  renderQuiz(quizData, quizContainer);

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.addEventListener("click", submitQuiz);
});

/**
 * Renders the quiz questions and options within the given container.
 * @param {Array} quizData - Array of question objects.
 * @param {HTMLElement} container - The DOM element where the quiz will be rendered.
 */
function renderQuiz(quizData, container) {
  // Keep any existing title inside the container (don't wipe innerHTML)
  const oldList = container.querySelector("ol.quiz-list");
  if (oldList) oldList.remove();

  // Normalize quizData into an array of questions
  const questions = Array.isArray(quizData)
    ? quizData
    : Array.isArray(quizData?.questions)
      ? quizData.questions
      : [];

  if (questions.length === 0) {
    console.error("Quiz data is not in the expected format:", quizData);
    container.insertAdjacentHTML(
      "beforeend",
      `<p style="margin-top:12px;">Quiz data could not be loaded. Check quiz-us-history.js structure.</p>`
    );
    return;
  }

  const ol = document.createElement("ol");
  ol.classList.add("quiz-list");

  questions.forEach((q, index) => {
    const questionNumber = index + 1;

    const li = document.createElement("li");
    li.classList.add("question", q.type);
    li.dataset.questionIndex = String(index);

    // Question text
    const prompt = document.createElement("p");
    prompt.classList.add("question-text");
    prompt.textContent = q.question;
    li.appendChild(prompt);

    if (q.type === "single-answer") {
      q.options.forEach((opt) => {
        const label = document.createElement("label");
        label.classList.add("option");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question${questionNumber}`;
        input.value = opt;
        input.dataset.correct = String(opt === q.answer);

        label.appendChild(input);
        label.appendChild(document.createTextNode(opt));
        li.appendChild(label);
      });
    } else if (q.type === "multiple-answer") {
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];

      q.options.forEach((opt) => {
        const label = document.createElement("label");
        label.classList.add("option");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = `question${questionNumber}`;
        input.value = opt;
        input.dataset.correct = String(answers.includes(opt));

        label.appendChild(input);
        label.appendChild(document.createTextNode(opt));
        li.appendChild(label);
      });
    } else if (q.type === "free-form") {
      const input = document.createElement("input");
      input.type = "text";
      input.name = `question${questionNumber}`;
      input.classList.add("free-form-input");

      const acceptable = Array.isArray(q.answer) ? q.answer : [q.answer];
      input.dataset.correctAnswers = acceptable.join(",");

      li.appendChild(input);
    } else {
      const warn = document.createElement("p");
      warn.textContent = "Unsupported question type.";
      li.appendChild(warn);
    }

    ol.appendChild(li);
  });

  container.appendChild(ol);
}


/**
 * Checks if all quiz questions have been answered.
 * @return {Boolean} True if all questions are answered, false otherwise.
 */
function areAllQuestionsAnswered() {
  const questions = document.querySelectorAll("li.question");

  // Safeguard: if the quiz didn't render, treat as not answered
  if (questions.length === 0) return false;

  for (const q of questions) {
    if (q.classList.contains("single-answer")) {
      const checked = q.querySelector('input[type="radio"]:checked');
      if (!checked) return false;
    }

    if (q.classList.contains("multiple-answer")) {
      const checked = q.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length === 0) return false;
    }

    if (q.classList.contains("free-form")) {
      const input = q.querySelector('input[type="text"]');
      if (!input) return false;
      if (input.value.trim() === "") return false;
    }
  }

  return true;
}

/**
 * Checks if the answers provided for a multiple-answer question are correct.
 * @param {HTMLElement} question - The DOM element representing the question.
 * @return {Boolean} True if all correct answers are selected and no incorrect answers are selected.
 */
function isMultipleAnswerCorrect(question) {
  const allCheckboxes = Array.from(question.querySelectorAll('input[type="checkbox"]'));
  const checked = allCheckboxes.filter((cb) => cb.checked);

  // Must pick at least one to be considered (handled by areAllQuestionsAnswered, but safe)
  if (checked.length === 0) return false;

  const correctOnes = allCheckboxes.filter((cb) => cb.dataset.correct === "true");

  // Condition:
  // 1) Every correct checkbox is checked
  // 2) No incorrect checkbox is checked
  const allCorrectChecked = correctOnes.every((cb) => cb.checked);
  const noIncorrectChecked = checked.every((cb) => cb.dataset.correct === "true");

  return allCorrectChecked && noIncorrectChecked;
}

/**
 * Checks if the answer provided for a free-form question is correct.
 * @param {HTMLElement} question - The DOM element representing the question.
 * @return {Boolean} True if the free-form answer matches any acceptable answer.
 */
function isFreeFormAnswerCorrect(question) {
  const input = question.querySelector('input[type="text"]');
  if (!input) return false;

  const userAnswer = input.value.trim().toLowerCase();

  const raw = input.dataset.correctAnswers || "";
  const acceptableAnswers = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return acceptableAnswers.includes(userAnswer);
}

function isSingleAnswerCorrect(question) {
  const checked = question.querySelector('input[type="radio"]:checked');
  if (!checked) return false;
  return checked.dataset.correct === "true";
}

function isMultipleAnswerCorrect(question) {
  const allCheckboxes = Array.from(question.querySelectorAll('input[type="checkbox"]'));
  const checked = allCheckboxes.filter((cb) => cb.checked);

  if (checked.length === 0) return false;

  const correctOnes = allCheckboxes.filter((cb) => cb.dataset.correct === "true");

  const allCorrectChecked = correctOnes.every((cb) => cb.checked);
  const noIncorrectChecked = checked.every((cb) => cb.dataset.correct === "true");

  return allCorrectChecked && noIncorrectChecked;
}

function isFreeFormAnswerCorrect(question) {
  const input = question.querySelector('input[type="text"]');
  if (!input) return false;

  const userAnswer = input.value.trim().toLowerCase();

  const raw = input.dataset.correctAnswers || "";
  const acceptableAnswers = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return acceptableAnswers.includes(userAnswer);
}

/**
 * Submits the quiz, checks all answers, calculates the score, and displays it.
 * Alerts the user if not all questions have been answered.
 */
function submitQuiz() {
  // Remove previous incorrect highlighting
  const questions = document.querySelectorAll("li.question");
  questions.forEach((q) => q.classList.remove("incorrect"));

  // Clear previous result display
  const resultEl = document.getElementById("result");
  if (resultEl) resultEl.innerHTML = "";

  // Check completeness
  if (!areAllQuestionsAnswered()) {
    alert("Almost there! Please answer every question before submitting the quiz.");
    return;
  }

  let score = 0;
  const total = questions.length;

  questions.forEach((q) => {
    let correct = false;

    if (q.classList.contains("single-answer")) {
      correct = isSingleAnswerCorrect(q);
    } else if (q.classList.contains("multiple-answer")) {
      correct = isMultipleAnswerCorrect(q);
    } else if (q.classList.contains("free-form")) {
      correct = isFreeFormAnswerCorrect(q);
    }

    if (correct) {
      score += 1;
    } else {
      q.classList.add("incorrect");
    }
  });

  const scoreEl = createScoreDisplay(score, total);

  if (resultEl) {
    resultEl.appendChild(scoreEl);
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Creates and returns a new score display element.
 * @param {Number} score - number correct
 * @param {Number} total - total questions
 * @return {HTMLElement} The created score display element.
 */
function createScoreDisplay(score, total) {
  const div = document.createElement("div");
  div.id = "score-display";
  div.classList.add("score-display");

  const percentage = (score / total) * 100;

  let message = "";

  if (percentage === 100) {
    message = "🧙‍♂️ You are a true Ring-bearer. Middle-earth is safe in your hands!";
  } else if (percentage >= 80) {
    message = "⚔️ A worthy member of the Fellowship! Very well done.";
  } else if (percentage >= 60) {
    message = "🧝 Not bad! You know your way around Middle-earth.";
  } else if (percentage >= 40) {
    message = "🧌 The road is long… perhaps a rewatch of the trilogy is in order.";
  } else {
    message = "🔥 One does not simply walk into Mordor unprepared. Try again!";
  }

  div.innerHTML = `
    <p>Your Score: <strong>${score} / ${total}</strong></p>
    <p class="result-message">${message}</p>
  `;

  return div;
}