import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: [true, 'Meal type is required'],
  },
  qualityRating: {
    type: Number,
    required: [true, 'Quality rating is required'],
    min: 1,
    max: 5,
  },
  portionRating: {
    type: Number,
    required: [true, 'Portion rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  studentName: {
    type: String,
    trim: true,
    default: 'Anonymous',
  },
}, {
  timestamps: true,
});

// Index for date queries
feedbackSchema.index({ date: -1 });
feedbackSchema.index({ date: -1, mealType: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
