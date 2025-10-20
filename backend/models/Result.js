// backend/models/Result.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  question: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  userAnswer: { type: String, default: null },
  isCorrect: { type: Boolean, required: true }
});

const ResultSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  questions: { type: [QuestionSchema], default: [] },
  topicScores: { type: Map, of: Number, default: {} },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
