// frontend/script.js
// (This is your original script.js with a small modification in finishExam to POST to /submit
// — I assume quizData, UI elements, and functions exist as in your previous file.)
// For brevity I include the full script adapted to the UI you provided.

const nameContainer = document.getElementById("name-container");
const instructionsContainer = document.getElementById("instructions-container");
const quizContainer = document.getElementById("quiz-container");
const resultContainer = document.getElementById("result-container");

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const statusGrid = document.getElementById("status-grid");
const timerDisplay = document.getElementById("timer");

let rollNo = "";
let participantName = "";
let currentTopic = "SQL";
let currentQuestionIndex = 0;
let timer;
let timeLeft = 30 * 60; // 30 minutes

let userAnswers = {}; // { SQL: {0: index, 1: index}, Python: {...} }
let finished = false;

const quizData = {
  "SQL": [
    { question: "Which SQL command is used to retrieve data from a database?", options: ["GET", "SELECT", "EXTRACT", "FETCH"], answer: "SELECT" },
    { question: "Which clause is used to filter rows in SQL?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], answer: "WHERE" },
    { question: "What does the PRIMARY KEY constraint do?", options: ["Allows NULL values", "Ensures uniqueness", "Creates index only", "Stores duplicate rows"], answer: "Ensures uniqueness" },
    { question: "Which SQL function returns the number of rows?", options: ["COUNT()", "SUM()", "LENGTH()", "ROWNUM()"], answer: "COUNT()" },
    { question: "Which operator is used for pattern matching in SQL?", options: ["BETWEEN", "LIKE", "IN", "EXISTS"], answer: "LIKE" },
    { question: "What is the default sorting order of ORDER BY?", options: ["Descending", "Ascending", "Random", "Depends on index"], answer: "Ascending" },
    { question: "Which SQL statement is used to remove a table?", options: ["DELETE TABLE", "DROP TABLE", "REMOVE TABLE", "TRUNCATE TABLE"], answer: "DROP TABLE" },
    { question: "What is a foreign key in SQL?", options: ["Unique identifier", "Link between tables", "Temporary column", "Auto increment column"], answer: "Link between tables" },
    { question: "Which SQL clause groups rows based on a column?", options: ["ORDER BY", "GROUP BY", "PARTITION BY", "JOIN"], answer: "GROUP BY" },
    { question: "Which command is used to update existing records?", options: ["CHANGE", "UPDATE", "MODIFY", "ALTER"], answer: "UPDATE" }
  ],
  "Python": [
    { question: "What type of programming language is Python?", options: ["Compiled", "Interpreted", "Assembly", "Machine"], answer: "Interpreted" },
    { question: "Which of these is immutable in Python?", options: ["List", "Dictionary", "Tuple", "Set"], answer: "Tuple" },
    { question: "What does the len() function do?", options: ["Counts only numbers", "Returns length of object", "Finds memory size", "Counts only strings"], answer: "Returns length of object" },
    { question: "Which keyword is used to handle exceptions?", options: ["try", "except", "catch", "throw"], answer: "except" },
    { question: "What is the output of bool('False') in Python?", options: ["False", "True", "Error", "None"], answer: "True" },
    { question: "Which library is used for numerical computations?", options: ["NumPy", "Flask", "Django", "Tkinter"], answer: "NumPy" },
    { question: "Which method is used to add an item to a list?", options: ["add()", "append()", "insert()", "push()"], answer: "append()" },
    { question: "What is the default return value of a Python function without return?", options: ["0", "None", "False", "Empty string"], answer: "None" },
    { question: "Which symbol is used for floor division in Python?", options: ["/", "//", "%", "**"], answer: "//" },
    { question: "Which Python keyword defines an anonymous function?", options: ["def", "func", "lambda", "inline"], answer: "lambda" }
  ],
  "DSA": [
    { question: "Which data structure uses FIFO principle?", options: ["Stack", "Queue", "Tree", "Graph"], answer: "Queue" },
    { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], answer: "O(log n)" },
    { question: "Which traversal visits nodes in Left-Root-Right order?", options: ["Preorder", "Inorder", "Postorder", "Level order"], answer: "Inorder" },
    { question: "Which sorting algorithm has the best average time complexity?", options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], answer: "Merge Sort" },
    { question: "Which data structure is used in recursion?", options: ["Queue", "Stack", "Array", "Graph"], answer: "Stack" },
    { question: "What is the maximum number of nodes in a binary tree of height h?", options: ["2^h - 1", "h^2", "h * 2", "h!"], answer: "2^h - 1" },
    { question: "Which algorithm is used for shortest path in graphs?", options: ["DFS", "BFS", "Dijkstra’s", "Kruskal’s"], answer: "Dijkstra’s" },
    { question: "Which operation is not possible in a stack?", options: ["Push", "Pop", "Peek", "Enqueue"], answer: "Enqueue" },
    { question: "Which data structure is best for implementing LRU cache?", options: ["Stack", "LinkedHashMap", "Queue", "HashSet"], answer: "LinkedHashMap" },
    { question: "Which searching algorithm is best for unsorted data?", options: ["Binary Search", "Linear Search", "DFS", "BFS"], answer: "Linear Search" }
  ]
};

// UI wiring (start quiz, begin exam, timer, navigation) — same logic as your original file:
document.getElementById("start-quiz").addEventListener("click", () => {
  rollNo = document.getElementById("roll-no").value.trim();
  participantName = document.getElementById("participant-name").value.trim();
  if (!rollNo || !participantName) {
    alert("Please enter Roll Number and Name!");
    return;
  }
  nameContainer.style.display = "none";
  instructionsContainer.style.display = "block";
});

document.getElementById("begin-exam").addEventListener("click", () => {
  instructionsContainer.style.display = "none";
  quizContainer.style.display = "block";
  document.getElementById("display-roll").innerText = rollNo;
  document.getElementById("display-name").innerText = participantName;
  startTimer();
  loadTopic("SQL"); // default topic
});

function startTimer() {
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      finishExam();
    } else {
      timeLeft--;
      const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const seconds = String(timeLeft % 60).padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
    }
  }, 1000);
}

function loadTopic(topic) {
  currentTopic = topic;
  currentQuestionIndex = 0;

  document.getElementById("exam-title").textContent = topic;

  document.querySelectorAll(".topic-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.topic === topic);
  });

  renderQuestion();
  renderStatusPanel();
}

document.querySelectorAll(".topic-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (finished) return;
    const selectedTopic = btn.dataset.topic;
    loadTopic(selectedTopic);
  });
});

function renderQuestion() {
  const questionObj = quizData[currentTopic][currentQuestionIndex];
  questionText.textContent = questionObj.question;
  optionsContainer.innerHTML = "";

  questionObj.options.forEach((opt, i) => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = opt;

    if (userAnswers[currentTopic]?.[currentQuestionIndex] === i)
      btn.classList.add("selected");

    btn.addEventListener("click", () => selectOption(i));
    optionsContainer.appendChild(btn);
  });

  document.getElementById("finish-btn").style.display =
    currentTopic === "DSA" &&
    currentQuestionIndex === quizData[currentTopic].length - 1
      ? "inline-block"
      : "none";
}

function selectOption(index) {
  if (!userAnswers[currentTopic]) userAnswers[currentTopic] = {};
  userAnswers[currentTopic][currentQuestionIndex] = index;
  renderQuestion();
  renderStatusPanel();
}

document.getElementById("next-btn").addEventListener("click", () => {
  if (currentQuestionIndex < quizData[currentTopic].length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    const topics = Object.keys(quizData);
    const nextTopic = topics[topics.indexOf(currentTopic) + 1];
    if (nextTopic) loadTopic(nextTopic);
  }
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

function renderStatusPanel() {
  statusGrid.innerHTML = "";
  const questions = quizData[currentTopic];
  for (let i = 0; i < questions.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;

    const ans = userAnswers[currentTopic]?.[i];
    btn.className = ans === undefined ? "not-answered" : "answered";

    btn.addEventListener("click", () => {
      currentQuestionIndex = i;
      renderQuestion();
    });

    statusGrid.appendChild(btn);
  }
}

document.getElementById("finish-btn").addEventListener("click", finishExam);

async function finishExam() {
  if (finished) return;
  clearInterval(timer);
  finished = true;

  quizContainer.style.display = "none";
  resultContainer.style.display = "block";

  document.getElementById("result-roll").innerText = rollNo;
  document.getElementById("result-name").innerText = participantName;

  // Build payload: answers organized by topic, each entry includes question, correctAnswer, userAnswer
  const payloadAnswers = {};
  for (const topic of Object.keys(quizData)) {
    payloadAnswers[topic] = quizData[topic].map((q, i) => {
      const selectedIndex = userAnswers[topic]?.[i];
      const userAnswer = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      return {
        question: q.question,
        correctAnswer: q.answer,
        userAnswer
      };
    });
  }

  // POST to backend /submit
  try {
    const resp = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rollNo,
        name: participantName,
        answers: payloadAnswers
      })
    });

    const json = await resp.json();
    if (json && json.success) {
      const { data } = json;
      const totalScore = data.totalScore ?? data.totalScore; // backend returns this in data
      document.getElementById("result-score").innerText = data.totalScore ?? 'N/A';
      // build result details for user's review
      let resultHTML = '';
      for (const topic of Object.keys(payloadAnswers)) {
        resultHTML += `<h3>${topic} (Score: ${data.topicScores?.[topic] ?? 0})</h3>`;
        payloadAnswers[topic].forEach((q, idx) => {
          const isCorrect = q.userAnswer === q.correctAnswer;
          resultHTML += `<p><strong>Q${idx+1}:</strong> ${q.question}<br>
                         Your Answer: ${q.userAnswer ?? '<em>Not answered</em>'} —
                         <strong>${isCorrect ? 'Correct' : 'Wrong'}</strong><br>
                         Correct: ${q.correctAnswer}</p>`;
        });
      }
      document.getElementById("result-details").innerHTML = resultHTML;
    } else {
      // if backend failed, fallback to local scoring (should not be necessary)
      let fallbackScore = 0;
      let fallbackHTML = '';
      for (const topic of Object.keys(payloadAnswers)) {
        let topicCorrect = 0;
        fallbackHTML += `<h3>${topic}</h3>`;
        payloadAnswers[topic].forEach((q, idx) => {
          const isCorrect = q.userAnswer === q.correctAnswer;
          if (isCorrect) topicCorrect++;
          fallbackHTML += `<p><strong>Q${idx+1}:</strong> ${q.question} — Your: ${q.userAnswer ?? 'N/A'} — ${isCorrect ? 'Correct' : 'Wrong'}</p>`;
        });
        fallbackScore += topicCorrect;
      }
      document.getElementById("result-score").innerText = fallbackScore;
      document.getElementById("result-details").innerHTML = fallbackHTML;
    }
  } catch (err) {
    console.error('Submit error:', err);
    alert('Failed to submit results to server. See console for details.');
    // Still show local computed results
    let fallbackScore = 0;
    let fallbackHTML = '';
    for (const topic of Object.keys(payloadAnswers)) {
      let topicCorrect = 0;
      fallbackHTML += `<h3>${topic}</h3>`;
      payloadAnswers[topic].forEach((q, idx) => {
        const isCorrect = q.userAnswer === q.correctAnswer;
        if (isCorrect) topicCorrect++;
        fallbackHTML += `<p><strong>Q${idx+1}:</strong> ${q.question} — Your: ${q.userAnswer ?? 'N/A'} — ${isCorrect ? 'Correct' : 'Wrong'}</p>`;
      });
      fallbackScore += topicCorrect;
    }
    document.getElementById("result-score").innerText = fallbackScore;
    document.getElementById("result-details").innerHTML = fallbackHTML;
  }
}
