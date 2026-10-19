(() => {
  "use strict";

  const questions = window.OPENIQ_QUESTIONS;
  const answers = Array(questions.length).fill(null);
  let currentIndex = 0;

  const $ = (id) => document.getElementById(id);
  const screens = ["intro-screen", "test-screen", "results-screen"];
  const showScreen = (id) => screens.forEach((screen) => $(screen).classList.toggle("hidden", screen !== id));

  const consent = $("consent-check");
  const startButton = $("start-button");
  consent.addEventListener("change", () => { startButton.disabled = !consent.checked; });
  startButton.addEventListener("click", () => {
    currentIndex = 0;
    renderQuestion();
    showScreen("test-screen");
  });

  function renderQuestion() {
    const q = questions[currentIndex];
    $("question-counter").textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    $("category-label").textContent = q.domain;
    $("question-prompt").textContent = q.prompt;
    $("progress-fill").style.width = `${(currentIndex / questions.length) * 100}%`;
    $("progress-track").setAttribute("aria-valuenow", String(currentIndex));
    const visual = $("question-visual");
    visual.textContent = q.visual || "";
    visual.classList.toggle("hidden", !q.visual);

    const list = $("options-list");
    list.replaceChildren();
    q.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.setAttribute("aria-pressed", String(answers[currentIndex] === index));
      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement("span");
      label.textContent = option;
      button.append(letter, label);
      button.addEventListener("click", () => {
        answers[currentIndex] = index;
        renderQuestion();
      });
      list.append(button);
    });

    $("back-button").disabled = currentIndex === 0;
    $("next-button").disabled = answers[currentIndex] === null;
    $("next-button").textContent = currentIndex === questions.length - 1 ? "See results" : "Next question";
    $("answer-hint").textContent = answers[currentIndex] === null
      ? "Choose one answer to continue."
      : "Answer selected. You can change it before continuing.";
  }

  $("back-button").addEventListener("click", () => {
    if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); }
  });
  $("next-button").addEventListener("click", () => {
    if (answers[currentIndex] === null) return;
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      renderResults();
      showScreen("results-screen");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  function renderResults() {
    const correct = questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);
    $("score-total").textContent = `${correct} / ${questions.length}`;
    $("score-percent").textContent = `${Math.round((correct / questions.length) * 100)}% correct`;

    const domains = new Map();
    questions.forEach((q, i) => {
      if (!domains.has(q.domain)) domains.set(q.domain, { total: 0, correct: 0 });
      const d = domains.get(q.domain);
      d.total += 1;
      if (answers[i] === q.answer) d.correct += 1;
    });

    const domainResults = $("domain-results");
    domainResults.replaceChildren();
    domains.forEach((d, name) => {
      const row = document.createElement("div");
      row.className = "domain-row";
      const title = document.createElement("span");
      title.className = "domain-name";
      title.textContent = name;
      const score = document.createElement("span");
      score.className = "domain-score";
      score.textContent = `${d.correct} / ${d.total} correct`;
      const track = document.createElement("div");
      track.className = "domain-track";
      const fill = document.createElement("div");
      fill.className = "domain-fill";
      fill.style.width = `${(d.correct / d.total) * 100}%`;
      track.append(fill);
      row.append(title, score, track);
      domainResults.append(row);
    });

    const review = $("answer-review");
    review.replaceChildren();
    questions.forEach((q, i) => {
      const item = document.createElement("article");
      item.className = "review-item";
      const title = document.createElement("h3");
      title.textContent = `${i + 1}. ${q.prompt}`;
      const yourAnswer = document.createElement("p");
      const isCorrect = answers[i] === q.answer;
      yourAnswer.className = isCorrect ? "correct-text" : "incorrect-text";
      yourAnswer.textContent = `Your answer: ${answers[i] === null ? "Not answered" : q.options[answers[i]]} — ${isCorrect ? "Correct" : "Incorrect"}`;
      const correctAnswer = document.createElement("p");
      correctAnswer.textContent = `Correct answer: ${q.options[q.answer]}`;
      const explanation = document.createElement("p");
      explanation.textContent = q.explanation;
      item.append(title, yourAnswer, correctAnswer, explanation);
      review.append(item);
    });
  }

  $("restart-button").addEventListener("click", () => {
    answers.fill(null);
    currentIndex = 0;
    consent.checked = false;
    startButton.disabled = true;
    renderQuestion();
    showScreen("intro-screen");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("download-button").addEventListener("click", () => {
    const correct = questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);
    const report = {
      project: "OpenIQ prototype",
      generatedAt: new Date().toISOString(),
      correctAnswers: correct,
      totalQuestions: questions.length,
      percentageCorrect: Math.round((correct / questions.length) * 100),
      interpretation: "This is a raw reasoning quiz result, not an IQ score or validated population percentile.",
      responses: questions.map((q, i) => ({
        questionId: q.id, domain: q.domain,
        selectedAnswer: answers[i] === null ? null : q.options[answers[i]],
        correctAnswer: q.options[q.answer],
        correct: answers[i] === q.answer
      }))
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openiq-results.json";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
})();
