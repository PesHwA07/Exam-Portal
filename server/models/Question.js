import mongoose from 'mongoose';

const questionItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'subjective'], default: 'mcq' },
  category: { type: String, default: 'General' },
  options: [String],
  correctAnswer: { type: Number, default: -1 }, // index, -1 if unknown
}, { _id: false });

const questionSetSchema = new mongoose.Schema({
  examTitle: { type: String, required: true },
  version: { type: Number, default: 1 },
  questions: [questionItemSchema],
  sourceFileName: { type: String },
  isPublished: { type: Boolean, default: false },
  randomizeQuestions: { type: Boolean, default: false },
  randomizeOptions: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Only one exam can be published at a time
questionSetSchema.pre('save', async function (next) {
  if (this.isPublished) {
    await mongoose.model('QuestionSet').updateMany(
      { _id: { $ne: this._id }, isPublished: true },
      { isPublished: false }
    );
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('QuestionSet', questionSetSchema);
