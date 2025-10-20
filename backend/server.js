// backend/server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Result = require('./models/Result');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizDB';

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Serve frontend static files
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_PATH));

// Endpoint to receive submission
// Expected body:
// {
//   rollNo: '123',
//   name: 'Alice',
//   answers: {
//     SQL: [{ question, correctAnswer, userAnswer }, ...],
//     Python: [...],
//     DSA: [...]
//   }
// }
app.post('/submit', async (req, res) => {
  try {
    const { rollNo, name, answers } = req.body;
    if (!rollNo || !name || !answers) {
      return res.status(400).json({ success: false, message: 'Missing rollNo/name/answers' });
    }

    let totalScore = 0;
    const questionsFlat = [];
    const topicScores = {};

    for (const topicName of Object.keys(answers)) {
      const topicArr = answers[topicName];
      if (!Array.isArray(topicArr)) continue;

      let topicCorrect = 0;
      for (const q of topicArr) {
        const { question, correctAnswer, userAnswer } = q;
        const isCorrect = typeof userAnswer === 'string' && userAnswer === correctAnswer;
        if (isCorrect) {
          totalScore += 1;
          topicCorrect += 1;
        }
        questionsFlat.push({
          topic: topicName,
          question,
          correctAnswer,
          userAnswer: userAnswer ?? null,
          isCorrect
        });
      }
      topicScores[topicName] = topicCorrect;
    }

    // Save to MongoDB
    const resultDoc = new Result({
      rollNo,
      name,
      score: totalScore,
      questions: questionsFlat,
      topicScores
    });

    await resultDoc.save();

    return res.json({
      success: true,
      message: 'Submission saved',
      data: {
        id: resultDoc._id,
        rollNo,
        name,
        totalScore,
        topicScores
      }
    });
  } catch (err) {
    console.error('Error in /submit:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Fallback — serve index.html for any other route (single page)
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
