import express from 'express';
import WasteEntry from '../models/WasteEntry.js';
import Feedback from '../models/Feedback.js';
import { protect, requireRole } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// All stats routes require admin auth
router.use(protect, requireRole('admin'));

// GET /api/stats/summary — Today's summary card data
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's entries
    const todayEntries = await WasteEntry.find({ date: { $gte: today, $lt: tomorrow } });
    const yesterdayEntries = await WasteEntry.find({ date: { $gte: yesterday, $lt: today } });

    // Calculate today's total waste
    let todayTotalWaste = 0;
    let todayCategoryMap = {};
    let todayDishMap = {};

    todayEntries.forEach(entry => {
      entry.items.forEach(item => {
        todayTotalWaste += item.wastedKg;
        todayCategoryMap[item.category] = (todayCategoryMap[item.category] || 0) + item.wastedKg;
        todayDishMap[item.dishName] = (todayDishMap[item.dishName] || 0) + item.wastedKg;
      });
    });

    // Yesterday's total waste for comparison
    let yesterdayTotalWaste = 0;
    yesterdayEntries.forEach(entry => {
      entry.items.forEach(item => {
        yesterdayTotalWaste += item.wastedKg;
      });
    });

    // Weekly average
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = await WasteEntry.find({ date: { $gte: weekAgo, $lt: tomorrow } });
    let weekTotalWaste = 0;
    weekEntries.forEach(entry => {
      entry.items.forEach(item => {
        weekTotalWaste += item.wastedKg;
      });
    });
    const weeklyAvg = weekTotalWaste / 7;

    // Previous week average for comparison
    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    const prevWeekEntries = await WasteEntry.find({ date: { $gte: twoWeeksAgo, $lt: weekAgo } });
    let prevWeekTotalWaste = 0;
    prevWeekEntries.forEach(entry => {
      entry.items.forEach(item => {
        prevWeekTotalWaste += item.wastedKg;
      });
    });
    const prevWeeklyAvg = prevWeekTotalWaste / 7;

    // Highest category
    const highestCategory = Object.entries(todayCategoryMap).sort((a, b) => b[1] - a[1])[0];

    // Top wasted dish
    const topDish = Object.entries(todayDishMap).sort((a, b) => b[1] - a[1])[0];

    // Trend calculations
    const wasteTrend = yesterdayTotalWaste > 0
      ? (((todayTotalWaste - yesterdayTotalWaste) / yesterdayTotalWaste) * 100).toFixed(1)
      : 0;
    const weeklyTrend = prevWeeklyAvg > 0
      ? (((weeklyAvg - prevWeeklyAvg) / prevWeeklyAvg) * 100).toFixed(1)
      : 0;

    res.json({
      totalWaste: { value: parseFloat(todayTotalWaste.toFixed(1)), trend: parseFloat(wasteTrend), unit: 'kg' },
      highestCategory: { value: highestCategory ? highestCategory[0] : 'N/A', percentage: highestCategory && todayTotalWaste > 0 ? parseFloat(((highestCategory[1] / todayTotalWaste) * 100).toFixed(0)) : 0 },
      weeklyAverage: { value: parseFloat(weeklyAvg.toFixed(1)), trend: parseFloat(weeklyTrend), unit: 'kg' },
      topWastedDish: { value: topDish ? topDish[0] : 'N/A', wasteKg: topDish ? parseFloat(topDish[1].toFixed(1)) : 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stats/daily-trends — Daily waste totals over period
router.get('/daily-trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const trends = await WasteEntry.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          wasteKg: { $sum: '$items.wastedKg' },
          preparedKg: { $sum: '$items.preparedKg' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          wasteKg: { $round: ['$wasteKg', 1] },
          preparedKg: { $round: ['$preparedKg', 1] },
        },
      },
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stats/category-distribution — Waste by food category
router.get('/category-distribution', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const distribution = await WasteEntry.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          wasteKg: { $sum: '$items.wastedKg' },
        },
      },
      { $sort: { wasteKg: -1 } },
    ]);

    const totalWaste = distribution.reduce((sum, d) => sum + d.wasteKg, 0);

    const result = distribution.map(d => ({
      category: d._id.charAt(0).toUpperCase() + d._id.slice(1),
      wasteKg: parseFloat(d.wasteKg.toFixed(1)),
      percentage: totalWaste > 0 ? parseFloat(((d.wasteKg / totalWaste) * 100).toFixed(0)) : 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stats/top-wasted — Most wasted dishes
router.get('/top-wasted', async (req, res) => {
  try {
    const { days = 7, limit = 5 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const topDishes = await WasteEntry.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { name: '$items.dishName', category: '$items.category' },
          wasteKg: { $sum: '$items.wastedKg' },
        },
      },
      { $sort: { wasteKg: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          category: '$_id.category',
          wasteKg: { $round: ['$wasteKg', 1] },
        },
      },
    ]);

    res.json(topDishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stats/weekly-heatmap — Average waste by day of week
router.get('/weekly-heatmap', async (req, res) => {
  try {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const heatmap = await WasteEntry.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: { $dayOfWeek: '$date' }, // 1=Sun, 2=Mon, ... 7=Sat
          totalWaste: { $sum: '$items.wastedKg' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = heatmap.map(h => ({
      day: dayNames[h._id - 1],
      avgWasteKg: parseFloat((h.totalWaste / Math.max(h.count / 3, 1)).toFixed(1)), // approximate per-day avg
    }));

    // Fill missing days
    const filledResult = dayNames.map(day => {
      const found = result.find(r => r.day === day);
      return found || { day, avgWasteKg: 0 };
    });

    // Reorder: Monday first
    const reordered = [...filledResult.slice(1), filledResult[0]];

    res.json(reordered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stats/prediction — Proxy to Python prediction service
router.get('/prediction', async (req, res) => {
  try {
    const predictionUrl = process.env.PREDICTION_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${predictionUrl}/predict`);
    res.json(response.data);
  } catch (error) {
    // Return a graceful fallback if prediction service is unavailable
    res.json({
      predictions: [],
      error: 'Prediction service unavailable',
      message: 'Start the Python prediction service to see forecasts',
    });
  }
});

export default router;
