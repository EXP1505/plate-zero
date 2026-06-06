import mongoose from 'mongoose';

const wasteItemSchema = new mongoose.Schema({
  dishName: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['grains', 'vegetables', 'protein', 'dairy'],
    required: [true, 'Category is required'],
  },
  preparedKg: {
    type: Number,
    required: [true, 'Prepared quantity is required'],
    min: 0,
  },
  wastedKg: {
    type: Number,
    required: [true, 'Wasted quantity is required'],
    min: 0,
  },
}, { _id: false });

const wasteEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: [true, 'Meal type is required'],
  },
  studentsServed: {
    type: Number,
    required: [true, 'Number of students served is required'],
    min: 0,
  },
  items: {
    type: [wasteItemSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one food item is required',
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: total prepared kg
wasteEntrySchema.virtual('totalPreparedKg').get(function () {
  return this.items.reduce((sum, item) => sum + item.preparedKg, 0);
});

// Virtual: total wasted kg
wasteEntrySchema.virtual('totalWastedKg').get(function () {
  return this.items.reduce((sum, item) => sum + item.wastedKg, 0);
});

// Virtual: waste percentage
wasteEntrySchema.virtual('wastePercentage').get(function () {
  const totalPrepared = this.items.reduce((sum, item) => sum + item.preparedKg, 0);
  if (totalPrepared === 0) return 0;
  const totalWasted = this.items.reduce((sum, item) => sum + item.wastedKg, 0);
  return parseFloat(((totalWasted / totalPrepared) * 100).toFixed(2));
});

// Virtual: waste per student
wasteEntrySchema.virtual('wastePerStudent').get(function () {
  if (this.studentsServed === 0) return 0;
  const totalWasted = this.items.reduce((sum, item) => sum + item.wastedKg, 0);
  return parseFloat((totalWasted / this.studentsServed).toFixed(3));
});

// Index for efficient date queries
wasteEntrySchema.index({ date: -1 });
wasteEntrySchema.index({ date: -1, mealType: 1 });

const WasteEntry = mongoose.model('WasteEntry', wasteEntrySchema);
export default WasteEntry;
