// src/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: { type: String, required: true },
  majorTags: [{ type: String, trim: true }],
  views: { type: Number, default: 0 },
  answersCount: { type: Number, default: 0 },
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;