const syllabus = {
  Physics: {
    Mechanics: ["Laws of Motion", "Work Energy Power", "Rotational Dynamics"],
    Thermodynamics: ["Kinetic Theory", "Heat Transfer", "Thermal Properties"],
    Modern: ["Photoelectric Effect", "Atoms and Nuclei", "Semiconductors"]
  },
  Chemistry: {
    Physical: ["Mole Concept", "Chemical Kinetics", "Electrochemistry"],
    Organic: ["GOC", "Hydrocarbons", "Biomolecules"],
    Inorganic: ["Chemical Bonding", "p-Block", "Coordination Compounds"]
  },
  Biology: {
    Botany: ["Cell Cycle", "Plant Physiology", "Genetics"],
    Zoology: ["Human Physiology", "Evolution", "Biotechnology"],
    Ecology: ["Ecosystem", "Biodiversity", "Environmental Issues"]
  }
};

const profileEls = {
  subject: document.getElementById("subjectSelect"),
  chapter: document.getElementById("chapterSelect"),
  topic: document.getElementById("topicSelect"),
  type: document.getElementById("typeSelect"),
  exam: document.getElementById("examTarget"),
  goal: document.getElementById("studyGoal")
};

const state = {
  asked: 0,
  correct: 0,
  mistakes: JSON.parse(localStorage.getItem("neetMistakes") || "[]"),
  skipped: 0,
  currentQuestion: null
};

function populateSubjects() {
  profileEls.subject.innerHTML = Object.keys(syllabus)
    .map((s) => `<option>${s}</option>`)
    .join("");
  populateChapters();
}

function populateChapters() {
  const subject = profileEls.subject.value;
  const chapters = Object.keys(syllabus[subject]);
  profileEls.chapter.innerHTML = chapters.map((c) => `<option>${c}</option>`).join("");
  populateTopics();
}

function populateTopics() {
  const subject = profileEls.subject.value;
  const chapter = profileEls.chapter.value;
  const topics = syllabus[subject][chapter];
  profileEls.topic.innerHTML = topics.map((t) => `<option>${t}</option>`).join("");
}

function generateQuestion() {
  const q = {
    subject: profileEls.subject.value,
    chapter: profileEls.chapter.value,
    topic: profileEls.topic.value,
    type: profileEls.type.value,
    prompt: `A ${profileEls.type.value.toLowerCase()} NEET question from ${profileEls.subject.value} → ${profileEls.chapter.value} → ${profileEls.topic.value}. Explain your approach step-by-step and verify final option.`
  };
  state.currentQuestion = q;
  state.asked += 1;
  document.getElementById("questionBox").innerHTML = `<strong>${q.subject}</strong> | ${q.chapter} | ${q.topic}<br/><br/>${q.prompt}`;
  updateStats();
}

function logResult(resultType) {
  if (!state.currentQuestion) return;
  if (resultType === "correct") {
    state.correct += 1;
  } else if (resultType === "mistake") {
    state.mistakes.unshift({ ...state.currentQuestion, timestamp: new Date().toLocaleString() });
  } else {
    state.skipped += 1;
  }
  localStorage.setItem("neetMistakes", JSON.stringify(state.mistakes.slice(0, 50)));
  renderMistakes();
  updateStats();
  generateQuestion();
}

function updateStats() {
  const accuracy = state.asked ? Math.round((state.correct / state.asked) * 100) : 0;
  const stats = [
    ["Questions Attempted", state.asked],
    ["Accuracy", `${accuracy}%`],
    ["Mistake Count", state.mistakes.length],
    ["Skipped", state.skipped]
  ];
  document.getElementById("statsGrid").innerHTML = stats
    .map(([label, value]) => `<article class='stat'><p>${label}</p><h3>${value}</h3></article>`)
    .join("");

  const weakTopics = state.mistakes.slice(0, 3).map((m) => m.topic);
  document.getElementById("aiInsight").textContent = weakTopics.length
    ? `Focus alert: Recent errors indicate weakness in ${[...new Set(weakTopics)].join(", ")}. Schedule a 25-minute revision sprint and retest with Conceptual + Assertion-Reason pattern.`
    : "No major weak area detected yet. Keep practicing mixed questions to build consistency.";

  const mockMinutes = Number(document.getElementById("mockTime").value || 60);
  const mockQuestions = Number(document.getElementById("mockQuestions").value || 45);
  const pace = (mockMinutes / mockQuestions).toFixed(1);
  document.getElementById("mockSummary").textContent = `Recommended mock setup: ${mockQuestions} questions in ${mockMinutes} mins (${pace} min/question), with targeted revision for recent error clusters.`;
}

function renderMistakes() {
  const node = document.getElementById("mistakeList");
  if (!state.mistakes.length) {
    node.textContent = "No mistakes logged yet. Mark mistakes during practice to build a personalized improvement journal.";
    return;
  }
  node.innerHTML = state.mistakes
    .slice(0, 8)
    .map(
      (m) => `<div class='mistake-item'><strong>${m.subject}</strong> • ${m.chapter} • ${m.topic}<br/>${m.type} question missed on ${m.timestamp}</div>`
    )
    .join("");
}

document.getElementById("newQuestionBtn").addEventListener("click", generateQuestion);
document.querySelectorAll("[data-result]").forEach((btn) => btn.addEventListener("click", () => logResult(btn.dataset.result)));
document.getElementById("clearMistakesBtn").addEventListener("click", () => {
  state.mistakes = [];
  localStorage.removeItem("neetMistakes");
  renderMistakes();
  updateStats();
});
document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const profile = {
    exam: profileEls.exam.value,
    goal: profileEls.goal.value,
    subject: profileEls.subject.value,
    chapter: profileEls.chapter.value,
    topic: profileEls.topic.value,
    type: profileEls.type.value
  };
  localStorage.setItem("neetProfile", JSON.stringify(profile));
  alert("Profile saved successfully.");
});

document.getElementById("startMockBtn").addEventListener("click", () => {
  updateStats();
  alert("Mock initialized with your current customization. Start solving from Smart Question Practice.");
});

profileEls.subject.addEventListener("change", populateChapters);
profileEls.chapter.addEventListener("change", populateTopics);
["mockQuestions", "mockTime", "mockDifficulty", "mockWeakArea"].forEach((id) =>
  document.getElementById(id).addEventListener("input", updateStats)
);

(function init() {
  populateSubjects();
  const savedProfile = JSON.parse(localStorage.getItem("neetProfile") || "null");
  if (savedProfile) {
    profileEls.exam.value = savedProfile.exam || profileEls.exam.value;
    profileEls.goal.value = savedProfile.goal || profileEls.goal.value;
    profileEls.subject.value = savedProfile.subject || profileEls.subject.value;
    populateChapters();
    profileEls.chapter.value = savedProfile.chapter || profileEls.chapter.value;
    populateTopics();
    profileEls.topic.value = savedProfile.topic || profileEls.topic.value;
    profileEls.type.value = savedProfile.type || profileEls.type.value;
  }
  renderMistakes();
  generateQuestion();
})();
