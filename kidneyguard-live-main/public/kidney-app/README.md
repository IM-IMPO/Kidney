# Kidney Risk Assessment System

A comprehensive, client-side web application for assessing kidney disease risk using machine learning algorithms.

## 🏥 Overview

This application provides healthcare professionals with a tool to:
- Manage patient records
- Input laboratory test results and lifestyle data
- Assess kidney disease risk using a Random Forest classifier
- Track patient history over time
- Export and import patient data

## 🚀 Features

### Authentication
- User registration and login
- Secure local storage of credentials
- Multi-user support with isolated patient data

### Patient Management
- Add, edit, and delete patient records
- Comprehensive patient profiles
- Search and filter functionality
- Patient history tracking

### Risk Assessment
- Random Forest machine learning algorithm
- Real-time risk categorization (High/Medium/Low)
- Probability visualization with animated charts
- Risk score calculation (0-100)
- Multiple clinical and lifestyle factors

### Data Management
- Import/export patient data as JSON
- Local storage (no server required)
- Sample training data included
- Accessible data format for analysis

## 📋 Clinical Features Assessed

### Laboratory Tests
- **Serum Creatinine** (mg/dL) - Kidney function indicator
- **BUN** (Blood Urea Nitrogen, mg/dL) - Waste product levels
- **GFR** (Glomerular Filtration Rate, mL/min/1.73m²) - Kidney filtering capacity
- **ACR** (Albumin/Creatinine Ratio, mg/g) - Protein leakage indicator
- **Serum Calcium** (mg/dL) - Electrolyte balance
- **Protein in Urine** (mg/dL) - Kidney damage indicator

### Vital Signs
- **Blood Pressure** (Systolic/Diastolic, mmHg)

### Demographics
- Age, Gender, Height, Weight

### Medical History
- Family history of kidney disease

### Lifestyle Factors
- Smoking status
- Alcohol consumption
- Physical activity level
- Diet quality
- Sleep quality

## 🤖 Random Forest Algorithm

The application uses a Random Forest classifier with 10 decision trees to predict kidney disease risk:

```javascript
/* RANDOM FOREST ALGORITHM START */
// Implementation details in random-forest.js
function predictRisk(featureObject) {
    // Returns: { label, probabilities, score }
}
/* RANDOM FOREST ALGORITHM END */
```

### Algorithm Features:
- **Input**: Patient features (lab tests, vitals, demographics, lifestyle)
- **Output**: 
  - `label`: "High", "Medium", or "Low" risk
  - `probabilities`: Breakdown of risk probabilities
  - `score`: Numerical risk score (0-100)
  - `confidence`: Prediction confidence level

### Feature Importance:
1. GFR (18%)
2. Serum Creatinine (16%)
3. ACR (14%)
4. Age (10%)
5. Blood Pressure Systolic (9%)
6. Other factors (33%)

## 💻 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: localStorage / IndexedDB
- **ML Algorithm**: Custom Random Forest implementation
- **No Dependencies**: Pure vanilla JavaScript
- **Responsive**: Mobile-friendly design
- **Accessible**: WCAG 2.1 compliant

## 🎨 Design

- Professional medical interface
- Healthcare color scheme (blues/teals)
- Animated visualizations
- Responsive grid layouts
- Card-based information architecture

## 📦 File Structure

```
kidney-app/
├── index.html           # Main HTML structure
├── styles.css          # Complete styling and design system
├── app.js              # Application logic and UI management
├── random-forest.js    # ML algorithm implementation
├── README.md           # This file
└── sample-data.json    # Example patient data
```

## 🚦 Getting Started

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No installation or build process required

2. **Create an Account**
   - Click "Create Account" tab
   - Enter your name, email, and password
   - Click "Create Account"

3. **Add a Patient**
   - Click "+ Add Patient" button
   - Fill in all required fields:
     - Basic information (name, age, gender, height, weight)
     - Laboratory tests (all 6 required tests)
     - Blood pressure readings
     - Medical history
     - Lifestyle factors
   - Click "Save Patient"

4. **View Risk Assessment**
   - Click the "View" icon on any patient
   - See comprehensive risk assessment with:
     - Overall risk score and category
     - Probability breakdown
     - Complete patient profile
     - Assessment history

5. **Manage Data**
   - **Export**: Click "Export" to download all patient data
   - **Import**: Click "Import" to load previously exported data
   - Data is stored locally in your browser

## 📊 Sample Data

Sample patient data is included in `sample-data.json` for testing:

```json
{
  "exportDate": "2025-01-01T00:00:00.000Z",
  "version": "1.0",
  "patients": [
    {
      "id": "P12345678",
      "name": "John Doe",
      "Age": 65,
      "Gender": "Male",
      // ... additional fields
    }
  ]
}
```

To import sample data:
1. Click "Import" button
2. Select the `sample-data.json` file
3. Confirm the import

## 🔒 Privacy & Security

- **Local Storage Only**: All data stays on your device
- **No Server Communication**: Completely offline application
- **User Isolation**: Each user's patient data is separate
- **No External APIs**: No data sent to third parties

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible
- High contrast color scheme
- Focus indicators
- Semantic HTML structure

## 🎯 Use Cases

1. **Clinical Assessment**: Quick kidney disease risk screening
2. **Patient Education**: Visual risk communication
3. **Research**: Data collection and analysis
4. **Training**: Medical education tool
5. **Monitoring**: Track patient risk over time

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## ⚠️ Important Notes

1. **Not for Clinical Diagnosis**: This tool is for educational and research purposes only. Always consult healthcare professionals for medical decisions.

2. **Data Validation**: All input fields are validated, but users should ensure accuracy of entered data.

3. **Local Storage Limits**: Browser localStorage typically supports 5-10MB. For large datasets, consider IndexedDB implementation.

4. **Algorithm Accuracy**: The Random Forest model is simplified for demonstration. Production use would require training on real clinical datasets.

## 🔧 Customization

### Modify Risk Thresholds
Edit `random-forest.js` to adjust clinical thresholds:

```javascript
this.featureThresholds = {
    SerumCreatinine: { low: 1.2, high: 2.0 },
    GFR: { low: 60, high: 90 },
    // ... modify as needed
};
```

### Adjust Color Scheme
Modify CSS variables in `styles.css`:

```css
:root {
    --primary: 199 89% 48%;  /* Main blue */
    --danger: 0 84% 60%;     /* High risk red */
    --warning: 45 93% 47%;   /* Medium risk yellow */
    --success: 145 63% 42%;  /* Low risk green */
}
```

### Add New Features
The modular structure allows easy extension:
- Add new patient fields in the form
- Extend the ML algorithm with additional trees
- Add new visualization components

## 📈 Future Enhancements

Potential improvements:
- Chart.js integration for detailed graphs
- PDF report generation
- Multi-language support
- Advanced analytics dashboard
- Integration with EHR systems
- Mobile app version
- Real-time collaboration features

## 🤝 Contributing

This is a standalone application. To contribute:
1. Modify the source files
2. Test thoroughly in multiple browsers
3. Document any changes
4. Share improvements with the medical community

## 📄 License

This educational tool is provided as-is for learning and research purposes.

## 👨‍⚕️ Medical Disclaimer

This application is a demonstration tool and should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions regarding medical conditions.

## 📞 Support

For technical questions or feedback about the application:
- Review the code comments
- Check browser console for errors
- Verify all required fields are completed
- Ensure browser supports localStorage

## 🏆 Credits

- Random Forest algorithm: Custom implementation
- Icons: Inline SVG (Feather Icons inspired)
- Design: Custom medical dashboard UI
- Color scheme: Healthcare industry standards

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Status**: Production Ready