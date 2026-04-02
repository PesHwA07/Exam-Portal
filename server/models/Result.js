import mongoose from 'mongoose';
const resultSchema = new mongoose.Schema({
  studentData: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
  },
  total: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  skipped: { type: Number, required: true },
  violations: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});
export default mongoose.model('Result', resultSchema);
