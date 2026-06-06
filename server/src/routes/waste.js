import express from 'express';
import WasteEntry from '../models/WasteEntry.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All waste routes require admin
router.use(protect, requireRole('admin'));

// POST /api/waste — Create new waste entry
router.post('/', async (req, res) => {
  try {
    const { date, mealType, studentsServed, items } = req.body;

    const entry = await WasteEntry.create({
      date,
      mealType,
      studentsServed,
      items,
      createdBy: req.user._id,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/waste — List waste entries (with optional date filters)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, mealType, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (mealType) filter.mealType = mealType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const entries = await WasteEntry.find(filter)
      .sort({ date: -1, mealType: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await WasteEntry.countDocuments(filter);

    res.json({
      entries,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/waste/:id — Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await WasteEntry.findById(req.params.id).populate('createdBy', 'name email');
    if (!entry) {
      return res.status(404).json({ message: 'Waste entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/waste/:id — Update entry
router.put('/:id', async (req, res) => {
  try {
    const entry = await WasteEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) {
      return res.status(404).json({ message: 'Waste entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/waste/:id — Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await WasteEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Waste entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
