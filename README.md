# 🌙 Lunation - Menstrual Cycle Tracking App

A comprehensive, privacy-focused React web application for tracking menstrual cycles, predicting periods, and monitoring fertility windows.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Status](https://img.shields.io/badge/status-beta-yellow)
[![CI](https://github.com/Thatkidtk/Lunation/actions/workflows/ci.yml/badge.svg)](https://github.com/Thatkidtk/Lunation/actions/workflows/ci.yml)
[![Deploy](https://github.com/Thatkidtk/Lunation/actions/workflows/deploy.yml/badge.svg)](https://github.com/Thatkidtk/Lunation/actions/workflows/deploy.yml)

Live: https://thatkidtk.github.io/Lunation/

## 🌟 Features

### Current Features (Beta v0.1.0)
- **📊 Smart Dashboard**: Overview of cycle statistics and upcoming predictions
- **📝 Cycle Tracking**: Input and track menstrual cycle start/end dates
- **🩸 Flow Monitoring**: Track flow intensity (light, medium, heavy)
- **🤒 Symptom Logging**: Monitor common symptoms like cramps, mood swings, headaches
- **📅 Visual Calendar**: Interactive calendar with color-coded cycle phases
- **🔮 Smart Predictions**: Algorithm-based predictions for periods and ovulation
- **💾 Local Storage**: Secure data persistence in your browser
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Node 20 used in CI)
- npm package manager

### Installation & Setup

1. **Clone or download the project**
   ```bash
   cd lunation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to the URL printed by Vite (typically http://localhost:5173)
   - The app will automatically reload when you make changes

## 📖 How to Use Lunation

### 🏁 Getting Started
1. **First Time Setup**: When you first open Lunation, you'll see an empty dashboard
2. **Add Your First Cycle**: Use the "Track Your Cycle" section to input your most recent period

### 📝 Adding Cycle Data

#### Step 1: Enter Period Dates
- **Start Date** (required): Select the first day of your period
- **End Date** (optional): Select the last day of your period if it's finished

#### Step 2: Track Flow Intensity
Choose from three options:
- **Light**: Minimal flow, light protection needed
- **Medium**: Moderate flow, regular protection
- **Heavy**: Heavy flow, extra protection needed

#### Step 3: Log Symptoms
Select any symptoms you're experiencing:
- Cramps
- Bloating  
- Mood swings
- Fatigue
- Headache
- Breast tenderness
- Back pain
- Acne

#### Step 4: Save Your Data
Click **"Add Cycle Data"** to save your information

### 📅 Understanding the Calendar

The calendar uses color coding to show different cycle phases:

| Color | Meaning |
|-------|---------|
| 🔴 **Dark Pink (filled)** | Period start day |
| 🌸 **Light Pink (filled)** | Period days |
| 🟢 **Green (filled)** | Predicted fertile window |
| ⭕ **Pink (dashed)** | Predicted future period |

**Navigation**:
- Use ← and → buttons to navigate between months
- Hover over any day to see details

### 📊 Reading Your Dashboard

The dashboard provides key insights:

#### Statistics Cards
- **Cycles Tracked**: Total number of cycles you've logged
- **Average Cycle Length**: Your personal average (starts at 28 days)
- **Until Next Period**: Countdown to your predicted next period

#### Predictions Section
- **Next Period**: When your next period is expected to start
- **Fertility Window**: Your predicted fertile days for conception

## 🧮 How Predictions Work

### Algorithm Details
Lunation uses your personal cycle data to make predictions:

1. **Cycle Length Calculation**: Averages your historical cycle lengths
2. **Next Period**: Adds average cycle length to your last period start date
3. **Ovulation Prediction**: Estimates 14 days before next predicted period
4. **Fertility Window**: 6-day window (5 days before + day of ovulation)

### Accuracy Improvements
- **More Data = Better Predictions**: Accuracy improves with each cycle you track
- **Personal Patterns**: Algorithm learns your unique cycle characteristics
- **Variation Handling**: Accounts for natural cycle length variations

> **Note**: Predictions are estimates based on your data. Always consult healthcare providers for medical advice.

## 🔒 Privacy & Data Security

### Your Data is Safe
- **100% Local Storage**: All data stays in your browser
- **No External Servers**: Nothing is sent to third-party services
- **Complete Privacy**: Your cycle data never leaves your device
- **User Control**: Clear browser data to remove all information

### Data Location
Your data is stored using your browser's `localStorage` feature:
- **Chrome**: Settings > Privacy > Site Settings > All Sites > localhost
- **Firefox**: Developer Tools > Storage > Local Storage
- **Safari**: Develop > Storage > Local Storage

## 🛠 Technical Details

### Built With
- **React 18 + Vite**: Fast dev server and modern bundling
- **Context API**: Global state with useReducer
- **Vitest + RTL**: Unit tests with jsdom
- **date-fns**: Date math and formatting
- **LocalStorage + Web Crypto**: Optional AES-GCM at-rest encryption

### Project Structure
```
src/
├── components/              # React components (JSX)
│   ├── Header.jsx           # App header (theme toggle)
│   ├── Dashboard.jsx        # Stats and predictions
│   ├── CycleInput.jsx       # Data input form
│   ├── CycleCalendar.jsx    # Interactive calendar
│   ├── Analytics.jsx        # Charts and insights
│   ├── MedicationTracking.jsx
│   └── DataExport.jsx
├── contexts/
│   └── CycleContext.jsx     # Global state + encryption controls
├── utils/
│   ├── cycleCalculations.js # Prediction algorithms
│   └── security.js          # CSV sanitization + encryption helpers
├── styles/
│   └── index.css            # Lunar theme CSS variables
├── main.jsx                 # React entry point
└── App.jsx                  # App shell/tabs
```

### Available Commands
```bash
npm run dev        # Start Vite dev server
npm test           # Run tests (Vitest)
npm run build      # Build production bundle (dist/)
npm run preview    # Preview the production build locally
```

### Environment Variables

- `VITE_SENTRY_DSN` (optional): Sentry DSN to enable browser crash reporting.
- `VITE_APP_VERSION` (optional): Release version tag. Defaults to package.json version at build.

### Deployment (GitHub Pages)
- Deploys automatically on push to `main` via GitHub Actions.
- Live site: https://thatkidtk.github.io/Lunation/
- If you fork/rename, update `base` in `vite.config.js` to `/<your-repo>/`.

## 🐛 Troubleshooting

### Common Issues

**App won't start?**
- Ensure Node.js version 14+ is installed
- Try `npm install` to reinstall dependencies
- Check if port 3000 is available

**Data not saving?**
- Ensure your browser allows localStorage
- Check if you're in private/incognito mode (data won't persist)
- Verify browser storage isn't full

**Predictions seem off?**
- Predictions improve with more cycle data (3+ cycles recommended)
- Check that you've entered accurate start dates
- Remember predictions are estimates, not guarantees

**Calendar not displaying correctly?**
- Try refreshing the browser
- Clear browser cache and reload
- Ensure JavaScript is enabled

## 🎯 Roadmap

### Phase 2 Features (Coming Soon)
- **📈 Trend Analysis**: Symptom patterns and cycle insights
- **📤 Export Data**: Download your data as CSV/PDF
- **📊 Enhanced Charts**: Visual trends and statistics
- **💊 Medication Tracking**: Track birth control and supplements

### Phase 3 Features (Future)
- **👩‍⚕️ Healthcare Sharing**: Secure data sharing with providers
- **🤖 Advanced AI**: Machine learning for better predictions
- **☁️ Cloud Backup**: Optional cloud sync across devices
- **👥 Community Features**: Anonymous insights and comparisons

## 🤝 Contributing

This is currently a personal project, but feedback is welcome:
- Report bugs via GitHub issues
- Suggest features for future releases
- Share your experience using the app

## 📄 License

This project is for personal use and educational purposes. All rights reserved.

## 🩺 Medical Disclaimer

**Important**: Lunation is for informational purposes only and should not replace professional medical advice. Always consult healthcare providers for:
- Birth control decisions
- Fertility planning
- Unusual cycle patterns
- Health concerns

The app's predictions are estimates based on your data and may not be accurate for medical purposes.

---

## 🆘 Support

Having issues? Here's how to get help:

1. **Check this README** for common solutions
2. **Check browser console** for error messages
3. **Try in a different browser** to isolate issues
4. **Create a GitHub issue** with details about the problem

---

**Made with ❤️ for better reproductive health awareness**

*Version 0.1.0-beta | Built with React | Privacy-First Design*
