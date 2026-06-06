import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import WasteEntry from '../models/WasteEntry.js';
import Feedback from '../models/Feedback.js';

dotenv.config();

// Indian campus mess menu items
const menuItems = {
  grains: ['Rice', 'Roti', 'Paratha', 'Puri', 'Pulao', 'Naan', 'Idli', 'Dosa', 'Upma'],
  vegetables: ['Mixed Sabzi', 'Aloo Gobi', 'Palak', 'Bhindi Fry', 'Salad', 'Raita', 'Baingan Bharta', 'Cabbage Poriyal'],
  protein: ['Dal Tadka', 'Rajma', 'Chana Masala', 'Egg Curry', 'Chicken Curry', 'Paneer Butter Masala', 'Sambar', 'Dal Fry'],
  dairy: ['Curd', 'Paneer', 'Kheer', 'Rasgulla', 'Lassi', 'Buttermilk'],
};

const mealTypes = ['breakfast', 'lunch', 'dinner'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate a random number between min and max
const rand = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Pick random items from an array
const pickRandom = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await WasteEntry.deleteMany({});
    await Feedback.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create default admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@platezero.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Created admin user: admin@platezero.com / admin123');

    // Create a student user
    await User.create({
      name: 'Student',
      email: 'student@platezero.com',
      password: 'student123',
      role: 'student',
    });
    console.log('👤 Created student user: student@platezero.com / student123');

    // Generate 30 days of waste data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entries = [];

    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dayOfWeek = date.getDay();

      // Weekend tends to have slightly different patterns
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseStudents = isWeekend ? randInt(150, 250) : randInt(250, 400);

      for (const mealType of mealTypes) {
        // Breakfast has fewer students, dinner has most
        const mealMultiplier = mealType === 'breakfast' ? 0.6 : mealType === 'lunch' ? 1.0 : 0.85;
        const studentsServed = Math.round(baseStudents * mealMultiplier);

        // Pick 3-5 items per meal
        const itemCount = randInt(3, 5);
        const items = [];
        const categories = Object.keys(menuItems);

        // Ensure variety - at least 2 different categories
        const selectedCategories = pickRandom(categories, Math.min(itemCount, categories.length));

        for (let i = 0; i < itemCount; i++) {
          const category = selectedCategories[i % selectedCategories.length];
          const dishName = pickRandom(menuItems[category], 1)[0];

          // Prepared quantity varies by category
          let preparedKg;
          if (category === 'grains') preparedKg = rand(15, 40);
          else if (category === 'vegetables') preparedKg = rand(10, 30);
          else if (category === 'protein') preparedKg = rand(8, 25);
          else preparedKg = rand(5, 15);

          // Waste is typically 10-30% of prepared, with some outliers
          const wasteRatio = Math.random() < 0.1 ? rand(0.25, 0.45) : rand(0.05, 0.25);
          const wastedKg = parseFloat((preparedKg * wasteRatio).toFixed(1));

          // Fridays tend to have more waste (special meals, less popular)
          const fridayBonus = dayOfWeek === 5 ? 1.2 : 1.0;

          items.push({
            dishName,
            category,
            preparedKg: parseFloat((preparedKg * fridayBonus).toFixed(1)),
            wastedKg: parseFloat((wastedKg * fridayBonus).toFixed(1)),
          });
        }

        entries.push({
          date,
          mealType,
          studentsServed,
          items,
          createdBy: admin._id,
        });
      }
    }

    await WasteEntry.insertMany(entries);
    console.log(`📊 Created ${entries.length} waste entries (${31} days × 3 meals)`);

    // Generate feedback data
    const feedbackEntries = [];
    const studentNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Karan', 'Anjali', 'Vikram', 'Divya', 'Rohit', 'Megha', 'Anonymous'];

    for (let daysAgo = 14; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      // 2-5 feedback entries per day
      const feedbackCount = randInt(2, 5);
      for (let i = 0; i < feedbackCount; i++) {
        feedbackEntries.push({
          date,
          mealType: mealTypes[randInt(0, 2)],
          qualityRating: randInt(2, 5),
          portionRating: randInt(2, 5),
          comment: Math.random() > 0.5 ? pickRandom([
            'Food was good today!',
            'Rice was undercooked',
            'Too much oil in the sabzi',
            'Loved the paneer today',
            'Portions were too small',
            'Great variety in lunch today',
            'Dal was too watery',
            'Roti was perfect',
            'Need more protein options',
            'Salad was fresh and tasty',
            'Curry was too spicy',
            'Overall decent meal',
          ], 1)[0] : undefined,
          studentName: pickRandom(studentNames, 1)[0],
        });
      }
    }

    await Feedback.insertMany(feedbackEntries);
    console.log(`💬 Created ${feedbackEntries.length} feedback entries`);

    console.log('\n✅ Seed complete! Database populated with demo data.');
    console.log('\n📋 Login credentials:');
    console.log('   Admin:   admin@platezero.com / admin123');
    console.log('   Student: student@platezero.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
