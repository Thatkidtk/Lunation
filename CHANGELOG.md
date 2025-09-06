# Changelog

All notable changes to Lunation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-09-06

### 🚀 Major Phase 2 Release - Enhanced Analytics & Intelligence

### Added
- **📈 Advanced Analytics Dashboard** with interactive charts and visualizations
  - Cycle length trends with Line charts
  - Symptom frequency analysis with Bar charts  
  - Flow intensity distribution with Doughnut charts
  - Comprehensive cycle insights and patterns
- **💊 Medication & Supplement Tracking**
  - Track birth control, pain relief, hormones, supplements
  - Medication scheduling and dosage management
  - Active/inactive medication status
  - Medication insights and effects analysis
- **📤 Data Export Functionality**
  - Export to CSV format for spreadsheet analysis
  - Export to JSON format with complete data backup
  - Data preview before export
  - Privacy-focused local file generation
- **🔮 Enhanced Prediction Algorithm**
  - Weighted averaging giving more importance to recent cycles
  - Confidence scoring for predictions (High/Medium/Low)
  - Historical accuracy tracking and reporting
  - Cycle consistency analysis with variance calculations
  - Improved ovulation prediction with adaptive luteal phase
- **🎯 Smart Navigation System**
  - Tabbed interface for better organization
  - Mobile-responsive navigation with icon-only view
  - Sticky navigation for easy access
- **📊 Advanced Dashboard Features**
  - Confidence badges for predictions
  - Historical accuracy display
  - Cycle consistency indicators
  - Enhanced prediction ranges

### Improved
- **Algorithm Intelligence**: Machine learning concepts applied to cycle prediction
- **User Experience**: Professional tabbed navigation with mobile optimization
- **Data Visualization**: Chart.js integration for rich visual analytics
- **Prediction Accuracy**: Enhanced algorithms with confidence scoring
- **Mobile Support**: Better responsive design and touch interactions

### Technical Enhancements
- Added Chart.js and react-chartjs-2 for data visualization
- Enhanced context management for medications
- Improved state management with additional reducers
- Better error handling and user feedback
- Optimized performance for larger datasets

### Dependencies Added
- `chart.js: ^4.5.0` - Charting library for analytics
- `react-chartjs-2: ^5.3.0` - React wrapper for Chart.js

### Known Improvements
- Prediction accuracy now improves significantly with more data
- Analytics require minimum 2 cycles for meaningful insights
- Export functionality handles edge cases gracefully
- Medication tracking integrates with cycle analysis

---

## [0.1.0-beta] - 2025-09-06

### Added
- **Initial Beta Release** 🎉
- Smart dashboard with cycle statistics and predictions
- Cycle tracking functionality (start/end dates, flow intensity)
- Comprehensive symptom logging (8 common symptoms)
- Interactive visual calendar with color-coded cycle phases
- AI-powered predictions for periods and ovulation
- Local storage data persistence
- Responsive design for desktop, tablet, and mobile
- Privacy-first approach (no external data transmission)
- Professional UI with pink/coral theme
- Comprehensive documentation and user guide

### Features
- **Dashboard**: Overview cards showing cycles tracked, average length, days until next period
- **Cycle Input**: Form for entering period dates, flow intensity, and symptoms
- **Calendar View**: Monthly calendar with visual indicators for periods, fertility windows, predictions
- **Prediction Engine**: Algorithm that learns from user data to forecast cycles
- **Data Persistence**: Automatic saving to browser localStorage
- **Responsive Design**: Mobile-first design that works across devices

### Technical Details
- Built with React 18 and modern hooks
- Context API for state management
- CSS-in-JS styling approach
- Date-fns for date handling
- Browser localStorage for data persistence
- Comprehensive error handling and validation

### Security & Privacy
- 100% client-side data storage
- No external API calls or data transmission
- User-controlled data (can be cleared anytime)
- No cookies or tracking

### Known Issues
- Predictions require at least 1 cycle for basic estimates (improves with more data)
- Calendar navigation limited to month view
- No data export functionality yet

### Coming Soon (Phase 2)
- Enhanced data visualization and charts
- Symptom trend analysis
- Data export capabilities
- Medication tracking

---

## Future Versions

### [0.2.0] - Planned
- Enhanced analytics dashboard
- Symptom pattern recognition
- Export functionality (CSV, PDF)
- Improved prediction accuracy

### [0.3.0] - Planned  
- Healthcare provider data sharing
- Advanced machine learning predictions
- Cloud backup options
- Multi-language support