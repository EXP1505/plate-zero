import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/feedback — Submit feedback (public, no auth required)
router.post('/', async (req, res) => {
  try {
    const { date, mealType, qualityRating, portionRating, comment, studentName } = req.body;

    const feedback = await Feedback.create({
      date,
      mealType,
      qualityRating,
      portionRating,
      comment,
      studentName: studentName || 'Anonymous',
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/feedback — List all feedback (admin only)
router.get('/', protect, requireRole('admin'), async (req, res) => {
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
    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/feedback/avg-ratings — Average ratings (admin only)
router.get('/avg-ratings', protect, requireRole('admin'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const ratings = await Feedback.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: '$mealType',
          avgQuality: { $avg: '$qualityRating' },
          avgPortion: { $avg: '$portionRating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = ratings.map(r => ({
      mealType: r._id,
      avgQuality: parseFloat(r.avgQuality.toFixed(1)),
      avgPortion: parseFloat(r.avgPortion.toFixed(1)),
      totalResponses: r.count,
    }));

    // Overall average
    const allFeedback = await Feedback.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgQuality: { $avg: '$qualityRating' },
          avgPortion: { $avg: '$portionRating' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      byMeal: result,
      overall: allFeedback[0] ? {
        avgQuality: parseFloat(allFeedback[0].avgQuality.toFixed(1)),
        avgPortion: parseFloat(allFeedback[0].avgPortion.toFixed(1)),
        totalResponses: allFeedback[0].count,
      } : { avgQuality: 0, avgPortion: 0, totalResponses: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
