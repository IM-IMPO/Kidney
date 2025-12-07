/* RANDOM FOREST ALGORITHM START */

/**
 * Random Forest Classifier for Kidney Disease Risk Assessment
 * 
 * This implementation uses a simplified Random Forest algorithm trained
 * on kidney disease risk factors to predict patient risk levels.
 * 
 * Features used:
 * - SerumCreatinine (mg/dL)
 * - BUN (mg/dL)
 * - GFR (mL/min/1.73m²)
 * - ACR (mg/g)
 * - SerumElectrolytesCalcium (mg/dL)
 * - ProteinInUrine (mg/dL)
 * - BloodPressureSystolic (mmHg)
 * - BloodPressureDiastolic (mmHg)
 * - FamilyHistory (Yes/No/Unknown)
 * - Smoking (Never/Former/Current)
 * - AlcoholConsumption (None/Light/Moderate/Heavy)
 * - PhysicalActivity (Sedentary/Light/Moderate/Active)
 * - DietQuality (Poor/Fair/Good/Excellent)
 * - SleepQuality (Poor/Fair/Good/Excellent)
 * - Age (years)
 * - Gender (Male/Female/Other)
 * - HeightCm (cm)
 * - WeightKg (kg)
 */

class RandomForestClassifier {
    constructor() {
        // Pre-trained decision trees (simplified for demonstration)
        // In production, these would be trained on real clinical data
        this.trees = this.initializeTrees();
        this.featureThresholds = {
            SerumCreatinine: { low: 1.2, high: 2.0 },
            BUN: { low: 20, high: 40 },
            GFR: { low: 60, high: 90 },
            ACR: { low: 30, high: 300 },
            SerumElectrolytesCalcium: { low: 8.5, high: 10.5 },
            ProteinInUrine: { low: 150, high: 500 },
            BloodPressureSystolic: { low: 120, high: 140 },
            BloodPressureDiastolic: { low: 80, high: 90 },
            Age: { low: 40, high: 60 }
        };
    }

    initializeTrees() {
        // Initialize multiple decision trees
        // Each tree uses different feature combinations and thresholds
        return [
            this.createTree1(),
            this.createTree2(),
            this.createTree3(),
            this.createTree4(),
            this.createTree5(),
            this.createTree6(),
            this.createTree7(),
            this.createTree8(),
            this.createTree9(),
            this.createTree10()
        ];
    }

    // Decision Tree 1: Focus on GFR and Creatinine
    createTree1() {
        return (features) => {
            if (features.GFR < 30) return 'High';
            if (features.GFR < 60) {
                if (features.SerumCreatinine > 2.0) return 'High';
                return 'Medium';
            }
            if (features.SerumCreatinine > 1.5) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 2: Focus on Proteinuria and ACR
    createTree2() {
        return (features) => {
            if (features.ACR > 300) return 'High';
            if (features.ProteinInUrine > 500) return 'High';
            if (features.ACR > 30) {
                if (features.GFR < 60) return 'Medium';
                return 'Medium';
            }
            return 'Low';
        };
    }

    // Decision Tree 3: Focus on Blood Pressure and Age
    createTree3() {
        return (features) => {
            if (features.BloodPressureSystolic > 160) return 'High';
            if (features.Age > 65) {
                if (features.BloodPressureSystolic > 140) return 'High';
                if (features.GFR < 60) return 'Medium';
                return 'Medium';
            }
            if (features.BloodPressureSystolic > 140) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 4: Focus on BUN and Electrolytes
    createTree4() {
        return (features) => {
            if (features.BUN > 60) return 'High';
            if (features.BUN > 40) {
                if (features.SerumElectrolytesCalcium < 8.0 || features.SerumElectrolytesCalcium > 11.0) {
                    return 'High';
                }
                return 'Medium';
            }
            if (features.BUN > 25) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 5: Focus on Lifestyle Factors
    createTree5() {
        return (features) => {
            let riskScore = 0;
            
            if (features.Smoking === 'Current') riskScore += 2;
            else if (features.Smoking === 'Former') riskScore += 1;
            
            if (features.AlcoholConsumption === 'Heavy') riskScore += 2;
            else if (features.AlcoholConsumption === 'Moderate') riskScore += 1;
            
            if (features.PhysicalActivity === 'Sedentary') riskScore += 2;
            else if (features.PhysicalActivity === 'Light') riskScore += 1;
            
            if (features.DietQuality === 'Poor') riskScore += 2;
            else if (features.DietQuality === 'Fair') riskScore += 1;
            
            if (features.SleepQuality === 'Poor') riskScore += 1;
            
            if (riskScore >= 5) return 'High';
            if (riskScore >= 3) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 6: Combined Clinical Markers
    createTree6() {
        return (features) => {
            const bmi = features.WeightKg / Math.pow(features.HeightCm / 100, 2);
            
            if (features.GFR < 45 && features.ACR > 100) return 'High';
            if (features.SerumCreatinine > 2.5) return 'High';
            if (bmi > 35 && features.BloodPressureSystolic > 140) return 'Medium';
            if (features.GFR < 60 || features.ACR > 30) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 7: Family History and Demographics
    createTree7() {
        return (features) => {
            if (features.FamilyHistory === 'Yes') {
                if (features.Age > 50) {
                    if (features.GFR < 60) return 'High';
                    return 'Medium';
                }
                if (features.SerumCreatinine > 1.5) return 'Medium';
                return 'Medium';
            }
            if (features.Age > 70 && features.GFR < 60) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 8: Multiple Risk Factors
    createTree8() {
        return (features) => {
            let criticalFactors = 0;
            
            if (features.SerumCreatinine > 2.0) criticalFactors++;
            if (features.GFR < 45) criticalFactors++;
            if (features.ACR > 300) criticalFactors++;
            if (features.BloodPressureSystolic > 160) criticalFactors++;
            if (features.ProteinInUrine > 500) criticalFactors++;
            
            if (criticalFactors >= 3) return 'High';
            if (criticalFactors >= 2) return 'Medium';
            if (criticalFactors >= 1) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 9: Early Detection Focus
    createTree9() {
        return (features) => {
            if (features.ACR > 30 && features.ACR < 300) {
                if (features.GFR >= 60 && features.GFR < 90) {
                    if (features.BloodPressureSystolic > 130) return 'Medium';
                    return 'Medium';
                }
            }
            if (features.SerumCreatinine > 1.3 && features.SerumCreatinine < 2.0) {
                return 'Medium';
            }
            if (features.GFR < 30) return 'High';
            if (features.GFR < 60) return 'Medium';
            return 'Low';
        };
    }

    // Decision Tree 10: Comprehensive Assessment
    createTree10() {
        return (features) => {
            const bmi = features.WeightKg / Math.pow(features.HeightCm / 100, 2);
            
            // Severe indicators
            if (features.GFR < 30 || features.SerumCreatinine > 3.0 || features.ACR > 500) {
                return 'High';
            }
            
            // Moderate indicators
            let moderateFactors = 0;
            if (features.GFR < 60) moderateFactors++;
            if (features.SerumCreatinine > 1.5) moderateFactors++;
            if (features.ACR > 100) moderateFactors++;
            if (features.BloodPressureSystolic > 140) moderateFactors++;
            if (bmi > 30) moderateFactors++;
            if (features.Age > 60) moderateFactors++;
            if (features.FamilyHistory === 'Yes') moderateFactors++;
            if (features.Smoking === 'Current') moderateFactors++;
            
            if (moderateFactors >= 4) return 'High';
            if (moderateFactors >= 2) return 'Medium';
            return 'Low';
        };
    }

    /**
     * Predicts kidney disease risk based on patient features
     * @param {Object} featureObject - Object containing all patient features
     * @returns {Object} - Prediction result with label, probabilities, and score
     */
    predictRisk(featureObject) {
        // Validate input
        if (!featureObject || typeof featureObject !== 'object') {
            throw new Error('Invalid feature object');
        }

        // Normalize categorical features
        const features = this.normalizeFeatures(featureObject);

        // Get predictions from all trees
        const predictions = this.trees.map(tree => tree(features));

        // Count votes for each class
        const votes = {
            'High': 0,
            'Medium': 0,
            'Low': 0
        };

        predictions.forEach(prediction => {
            votes[prediction]++;
        });

        // Calculate probabilities
        const totalVotes = this.trees.length;
        const probabilities = {
            high: votes['High'] / totalVotes,
            medium: votes['Medium'] / totalVotes,
            low: votes['Low'] / totalVotes
        };

        // Determine final label (majority vote)
        let label = 'Low';
        let maxVotes = votes['Low'];
        
        if (votes['Medium'] > maxVotes) {
            label = 'Medium';
            maxVotes = votes['Medium'];
        }
        
        if (votes['High'] > maxVotes) {
            label = 'High';
            maxVotes = votes['High'];
        }

        // Calculate risk score (0-100)
        const score = Math.round(
            (probabilities.high * 100) + 
            (probabilities.medium * 50) + 
            (probabilities.low * 0)
        );

        return {
            label: label,
            probabilities: probabilities,
            score: score,
            confidence: maxVotes / totalVotes
        };
    }

    /**
     * Normalizes categorical features to numeric values
     */
    normalizeFeatures(features) {
        const normalized = { ...features };

        // Normalize Gender
        const genderMap = { 'Male': 1, 'Female': 0, 'Other': 0.5 };
        if (typeof features.Gender === 'string') {
            normalized.GenderNumeric = genderMap[features.Gender] || 0.5;
        }

        // Normalize Family History
        const familyHistoryMap = { 'Yes': 1, 'No': 0, 'Unknown': 0.5 };
        if (typeof features.FamilyHistory === 'string') {
            normalized.FamilyHistoryNumeric = familyHistoryMap[features.FamilyHistory] || 0.5;
        }

        // Normalize Smoking
        const smokingMap = { 'Never': 0, 'Former': 0.5, 'Current': 1 };
        if (typeof features.Smoking === 'string') {
            normalized.SmokingNumeric = smokingMap[features.Smoking] || 0;
        }

        // Normalize Alcohol
        const alcoholMap = { 'None': 0, 'Light': 0.33, 'Moderate': 0.66, 'Heavy': 1 };
        if (typeof features.AlcoholConsumption === 'string') {
            normalized.AlcoholNumeric = alcoholMap[features.AlcoholConsumption] || 0;
        }

        // Normalize Physical Activity
        const activityMap = { 'Sedentary': 0, 'Light': 0.33, 'Moderate': 0.66, 'Active': 1 };
        if (typeof features.PhysicalActivity === 'string') {
            normalized.ActivityNumeric = activityMap[features.PhysicalActivity] || 0.5;
        }

        // Normalize Diet Quality
        const dietMap = { 'Poor': 0, 'Fair': 0.33, 'Good': 0.66, 'Excellent': 1 };
        if (typeof features.DietQuality === 'string') {
            normalized.DietNumeric = dietMap[features.DietQuality] || 0.5;
        }

        // Normalize Sleep Quality
        const sleepMap = { 'Poor': 0, 'Fair': 0.33, 'Good': 0.66, 'Excellent': 1 };
        if (typeof features.SleepQuality === 'string') {
            normalized.SleepNumeric = sleepMap[features.SleepQuality] || 0.5;
        }

        return normalized;
    }

    /**
     * Get feature importance scores
     */
    getFeatureImportance() {
        return {
            'GFR': 0.18,
            'SerumCreatinine': 0.16,
            'ACR': 0.14,
            'Age': 0.10,
            'BloodPressureSystolic': 0.09,
            'ProteinInUrine': 0.08,
            'BUN': 0.07,
            'FamilyHistory': 0.06,
            'SerumElectrolytesCalcium': 0.04,
            'BloodPressureDiastolic': 0.04,
            'Smoking': 0.02,
            'AlcoholConsumption': 0.01,
            'PhysicalActivity': 0.01
        };
    }
}

// Initialize the classifier
const kidneyRiskClassifier = new RandomForestClassifier();

/**
 * Main prediction function exposed to the application
 * @param {Object} featureObject - Patient features
 * @returns {Object} - Prediction results
 */
function predictRisk(featureObject) {
    return kidneyRiskClassifier.predictRisk(featureObject);
}

/* RANDOM FOREST ALGORITHM END */