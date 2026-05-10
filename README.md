# PlateZero (50%)

A modern, food waste tracking dashboard built with React and Vite. Monitor and analyze food waste patterns with interactive visualizations and real-time insights.

## Overview

PlateZero provides a comprehensive dashboard for tracking food waste across your organization. Visualize waste trends, identify high-waste categories, and make data-driven decisions to reduce food waste and improve sustainability.

### Key Features

- 📊 **Interactive Charts & Visualizations** - Daily waste trends, category distribution, and top wasted dishes
- 📱 **Responsive Design** - Fully responsive layout that works on desktop, tablet, and mobile devices
- 🎨 **Modern Dark Theme** - Beautiful dark UI with glassmorphism effects and smooth animations
- 📈 **Real-time Insights** - View waste data with trend indicators and comparisons
- ⚡ **Fast Performance** - Built with Vite for instant HMR and optimized builds
- 🎯 **Clean Architecture** - Modular component structure for easy maintenance and scaling

## Tech Stack

- **Frontend Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.11
- **Styling**: Tailwind CSS 4.3.0
- **Charts**: Recharts 3.8.1
- **Icons**: Lucide React 1.14.0
- **CSS Processing**: PostCSS 8.5.14

## Project Structure

```
plate-zero/
├── src/
│   ├── components/
│   │   ├── DashboardLayout.jsx      # Main layout with sidebar and header
│   │   └── DashboardCharts.jsx      # Chart components and visualizations
│   ├── App.jsx                       # Root component
│   ├── main.jsx                      # Entry point
│   ├── index.css                     # Global styles
│   └── mockData.js                   # Sample data for development
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
└── package.json                      # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plate-zero
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Build the project for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start the development server with hot module reloading
- `npm run build` - Create an optimized production build
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Dashboard Features

### Summary Cards
- **Total Waste** - Current day's total waste volume with trend comparison
- **Highest Category** - Most wasted food category
- **Weekly Average** - Average waste over the past week with trend
- **Top Wasted Dish** - Most frequently wasted dish today

### Visualizations
- **Daily Waste Trends** - Line chart showing waste volume over the last 7 days
- **Category Distribution** - Pie chart showing waste breakdown by category
- **Top Wasted Dishes** - Bar chart of the most wasted dishes
- **Heatmap** - Intensity view of daily waste patterns

### Navigation
- Responsive sidebar with main menu items (Dashboard, Reports, Settings)
- Mobile-friendly hamburger menu for small screens
- Header with notification and user profile options

## Data

The project uses mock data located in `src/mockData.js` for demonstration purposes. Replace this with real data from your API or database when deploying.

## Customization

### Color Scheme
Modify colors in `src/components/DashboardLayout.jsx` and `src/components/DashboardCharts.jsx` or adjust the Tailwind CSS color palette in `tailwind.config.js`.

### Chart Data
Update the mock data in `src/mockData.js` or connect to your backend API to display real waste data.

### Layout & Components
- Edit `DashboardLayout.jsx` to customize sidebar, header, and main navigation
- Modify `DashboardCharts.jsx` to add, remove, or customize chart visualizations

## Performance Optimization

- **Code Splitting** - Vite automatically optimizes code splitting for production
- **Asset Optimization** - Images and assets are automatically optimized
- **CSS Purging** - Tailwind CSS purges unused styles for minimal bundle size

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**PlateZero** - Making food waste visible, manageable, and reducible.
