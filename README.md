# PlateZero — Food Waste Analysis Dashboard for Campus Mess

A full-stack web application for digitizing, analyzing, and predicting food waste data from a campus mess. Built as a mini project for **22CS49 — 4th Sem Mini Project**, Department of Computer Science & Engineering, Dayananda Sagar College of Engineering, Bengaluru.

## Team

| Name | USN | Contribution |
|------|-----|-------------|
| Chandan Meher | 1DS24CS046 | Backend (Node.js + Express, MongoDB, JWT auth) & Python prediction microservice |
| Anubhav Pandey | 1DS24CS022 | Frontend (React.js, dashboard UI, Recharts visualizations) |
| Abhay Kumar | 1DS24CS001 | Admin data entry, student feedback form, integration testing |

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React.js    │────▶│  Node.js/Express │────▶│    MongoDB      │
│  Frontend    │◀────│  REST API        │◀────│    Database     │
│  (Vite)      │     │  (Port 5000)     │     │                 │
└──────────────┘     └────────┬─────────┘     └─────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Python/Flask    │
                     │  Prediction      │
                     │  (Port 5001)     │
                     └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Recharts, TailwindCSS 4, Lucide React |
| Backend | Node.js, Express.js, JWT, Bcrypt |
| Database | MongoDB, Mongoose |
| Prediction | Python, Flask, scikit-learn (Linear Regression) |
| Build Tool | Vite 8 |

## Features

### 1. Data Collection Layer
- Secure admin login with JWT authentication
- Daily waste entry form: date, meal type, students served
- Dynamic menu item rows: dish name, category, prepared (kg), wasted (kg)
- Auto-calculated waste percentage

### 2. Statistical Analysis Layer (Dashboard)
- **Line Chart**: Daily waste trends over the last 7 days
- **Donut Chart**: Waste distribution by food category (grains, vegetables, protein, dairy)
- **Bar Chart**: Top 5 most wasted dishes
- **Heatmap**: Average waste intensity by day of week
- **Summary Cards**: Today's total waste, highest category, weekly average, top dish

### 3. Prediction Layer
- Python/Flask microservice using scikit-learn Linear Regression
- Features: day of week (one-hot), 7-day rolling average, previous day's waste
- Predicts tomorrow's total waste with confidence score
- Displayed on admin dashboard as AI Prediction card

### 4. Student Feedback Layer
- Public feedback form (no login required)
- Star ratings for food quality (1-5) and portion size (1-5)
- Optional text comments
- Aggregated ratings displayed on admin dashboard per meal type

### 5. Reports & Analytics
- Date range selector for custom analysis periods
- Prepared vs. Wasted trend comparison chart
- Summary stats: total waste, avg waste %, waste per student
- Feedback correlation view
- Detailed entries table

## Project Structure

```
plate-zero/
├── src/                          # React frontend
│   ├── api/axios.js              # API client with JWT interceptor
│   ├── context/AuthContext.jsx   # Authentication state management
│   ├── pages/
│   │   ├── LoginPage.jsx         # Login/Register
│   │   ├── DashboardPage.jsx     # Main dashboard with charts
│   │   ├── DataEntryPage.jsx     # Admin waste entry form
│   │   ├── FeedbackPage.jsx      # Student feedback form
│   │   └── ReportsPage.jsx       # Reports & analytics
│   ├── components/
│   │   ├── DashboardLayout.jsx   # Layout with sidebar & header
│   │   ├── DashboardCharts.jsx   # All chart visualizations
│   │   ├── PredictionCard.jsx    # ML prediction display
│   │   └── ProtectedRoute.jsx    # Route guard
│   ├── App.jsx                   # Routing configuration
│   └── mockData.js               # Fallback demo data
│
├── server/                       # Node.js backend
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── middleware/auth.js    # JWT middleware
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # API endpoints
│   │   ├── seed/seed.js          # Database seeder
│   │   └── index.js              # Express entry point
│   └── .env                      # Environment variables
│
└── prediction/                   # Python microservice
    ├── app.py                    # Flask prediction server
    └── requirements.txt          # Python dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.8+ (for prediction service)

### 1. Install Dependencies

```bash
# Frontend
cd plate-zero
npm install

# Backend
cd server
npm install

# Prediction service
cd ../prediction
pip install -r requirements.txt
```

### 2. Configure Environment

Copy and edit the server `.env` file:
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI
```

Default values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/platezero
JWT_SECRET=platezero_jwt_secret_2026
PREDICTION_SERVICE_URL=http://localhost:5001
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- 30 days of waste data with Indian mess menu items
- Admin user: `admin@platezero.com` / `admin123`
- Student user: `student@platezero.com` / `student123`
- 2 weeks of student feedback entries

### 4. Start All Services

Terminal 1 — Backend:
```bash
cd server
npm run dev
```

Terminal 2 — Frontend:
```bash
cd plate-zero
npm run dev
```

Terminal 3 — Prediction (optional):
```bash
cd prediction
python app.py
```

### 5. Open in Browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Prediction API: http://localhost:5001

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login (returns JWT) |
| GET | `/api/auth/me` | Yes | Get current user |

### Waste Entries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/waste` | Admin | Create waste entry |
| GET | `/api/waste` | Admin | List entries (with filters) |
| GET | `/api/waste/:id` | Admin | Get single entry |
| PUT | `/api/waste/:id` | Admin | Update entry |
| DELETE | `/api/waste/:id` | Admin | Delete entry |

### Statistics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats/summary` | Admin | Today's summary cards |
| GET | `/api/stats/daily-trends` | Admin | Daily waste totals |
| GET | `/api/stats/category-distribution` | Admin | Waste by category |
| GET | `/api/stats/top-wasted` | Admin | Most wasted dishes |
| GET | `/api/stats/weekly-heatmap` | Admin | Avg waste by weekday |
| GET | `/api/stats/prediction` | Admin | ML prediction proxy |

### Feedback
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/feedback` | No | Submit feedback |
| GET | `/api/feedback` | Admin | List all feedback |
| GET | `/api/feedback/avg-ratings` | Admin | Average ratings |

## License

MIT License

---

**PlateZero** — Making food waste visible, manageable, and reducible. 🌱
