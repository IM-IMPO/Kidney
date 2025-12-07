/**
 * Kidney Risk Assessment Application
 * Main application logic for patient management and risk assessment
 * Integrated with Supabase for multi-user support
 */

// Supabase Configuration
const SUPABASE_URL = 'https://cwhjrxsvieymwakcgghy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aGpyeHN2aWV5bXdha2NnZ2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzgwMjcsImV4cCI6MjA4MDM1NDAyN30.tAgA53nx3NG2p3XJ_wd65pphxrO4nA-Yl7uTr-9n1Ik';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Application State
const AppState = {
    currentUser: null,
    currentProfile: null,
    patients: [],
    profiles: {},  // Cache of all profiles for displaying auditor names
    currentPatient: null,
    isEditing: false,
    session: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        AppState.session = session;
        AppState.currentUser = session?.user ?? null;
        
        if (session?.user) {
            setTimeout(async () => {
                await loadCurrentProfile();
                await loadAllProfiles();
                await loadPatients();
                showApp();
            }, 0);
        } else {
            showAuth();
        }
    });
    
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        AppState.session = session;
        AppState.currentUser = session.user;
        await loadCurrentProfile();
        await loadAllProfiles();
        await loadPatients();
        showApp();
    } else {
        showAuth();
    }
    
    // Set up event listeners
    setupAuthListeners();
    setupAppListeners();
}

// ===========================
// Authentication Functions
// ===========================

function setupAuthListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchAuthTab(tabName);
        });
    });
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

function switchAuthTab(tabName) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tabName}-form`);
    });
    
    // Clear errors
    document.querySelectorAll('.auth-error').forEach(error => {
        error.textContent = '';
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            errorEl.textContent = error.message;
            return;
        }
        
        // Session will be handled by onAuthStateChange
    } catch (err) {
        errorEl.textContent = 'An error occurred. Please try again.';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errorEl = document.getElementById('signup-error');
    
    // Validation
    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }
    
    try {
        const redirectUrl = `${window.location.origin}/kidney-app/`;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: name
                }
            }
        });
        
        if (error) {
            errorEl.textContent = error.message;
            return;
        }
        
        // Session will be handled by onAuthStateChange
    } catch (err) {
        errorEl.textContent = 'An error occurred. Please try again.';
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    AppState.currentUser = null;
    AppState.currentProfile = null;
    AppState.session = null;
    AppState.patients = [];
    showAuth();
}

// ===========================
// Profile Management
// ===========================

async function loadCurrentProfile() {
    if (!AppState.currentUser) return;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', AppState.currentUser.id)
        .maybeSingle();
    
    if (data) {
        AppState.currentProfile = data;
    }
}

async function loadAllProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');
    
    if (data) {
        // Create a lookup map
        AppState.profiles = {};
        data.forEach(profile => {
            AppState.profiles[profile.id] = profile;
        });
    }
}

// ===========================
// Screen Management
// ===========================

function showAuth() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
}

function showApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    const displayName = AppState.currentProfile?.full_name || AppState.currentUser?.email || 'Doctor';
    document.getElementById('current-user').textContent = displayName;
    renderDashboard();
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');
}

// ===========================
// App Event Listeners
// ===========================

function setupAppListeners() {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Add patient
    document.getElementById('add-patient-btn').addEventListener('click', () => {
        AppState.isEditing = false;
        AppState.currentPatient = null;
        openPatientModal();
    });
    
    // Modal controls
    document.querySelector('.modal-close').addEventListener('click', closePatientModal);
    document.querySelector('.modal-cancel').addEventListener('click', closePatientModal);
    
    // Patient form
    document.getElementById('patient-form').addEventListener('submit', handlePatientSave);
    
    // Search
    document.getElementById('patient-search').addEventListener('input', handleSearch);
    
    // Back to dashboard
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        showView('dashboard');
        renderDashboard();
    });
    
    // Edit patient
    document.getElementById('edit-patient-btn').addEventListener('click', () => {
        AppState.isEditing = true;
        openPatientModal();
    });
    
    // Delete patient
    document.getElementById('delete-patient-btn').addEventListener('click', handleDeletePatient);
    
    // Import/Export
    document.getElementById('import-data-btn').addEventListener('click', handleImport);
    document.getElementById('export-data-btn').addEventListener('click', handleExport);
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
}

// ===========================
// Patient Management
// ===========================

async function loadPatients() {
    if (!AppState.session) return;
    
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (data) {
        // Transform DB records to match app format
        AppState.patients = data.map(p => ({
            id: p.id,
            dbId: p.id,
            name: p.name,
            Age: p.age,
            Gender: p.gender,
            HeightCm: p.height_cm,
            WeightKg: p.weight_kg,
            SerumCreatinine: p.serum_creatinine,
            BUN: p.bun,
            GFR: p.gfr,
            ACR: p.acr,
            SerumElectrolytesCalcium: p.serum_electrolytes_calcium,
            ProteinInUrine: p.protein_in_urine,
            BloodPressureSystolic: p.blood_pressure_sys,
            BloodPressureDiastolic: p.blood_pressure_dia,
            FamilyHistory: p.family_history ? 'Yes' : 'No',
            Smoking: p.smoking,
            AlcoholConsumption: p.alcohol_consumption,
            PhysicalActivity: p.physical_activity,
            DietQuality: p.diet_quality,
            SleepQuality: p.sleep_quality,
            riskLabel: p.risk_level || 'Unknown',
            riskScore: p.risk_score || 0,
            riskProbabilities: { high: 0.33, medium: 0.33, low: 0.34 },
            lastAssessment: p.updated_at,
            auditedBy: p.audited_by,
            history: []
        }));
    }
}

function generatePatientId() {
    return 'P' + Date.now().toString().slice(-8);
}

async function handlePatientSave(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('patient-name').value.trim(),
        Age: parseInt(document.getElementById('patient-age').value),
        Gender: document.getElementById('patient-gender').value,
        HeightCm: parseFloat(document.getElementById('patient-height').value),
        WeightKg: parseFloat(document.getElementById('patient-weight').value),
        SerumCreatinine: parseFloat(document.getElementById('serum-creatinine').value),
        BUN: parseFloat(document.getElementById('bun').value),
        GFR: parseFloat(document.getElementById('gfr').value),
        ACR: parseFloat(document.getElementById('acr').value),
        SerumElectrolytesCalcium: parseFloat(document.getElementById('serum-calcium').value),
        ProteinInUrine: parseFloat(document.getElementById('protein-urine').value),
        BloodPressureSystolic: parseInt(document.getElementById('bp-systolic').value),
        BloodPressureDiastolic: parseInt(document.getElementById('bp-diastolic').value),
        FamilyHistory: document.getElementById('family-history').value,
        Smoking: document.getElementById('smoking').value,
        AlcoholConsumption: document.getElementById('alcohol').value,
        PhysicalActivity: document.getElementById('physical-activity').value,
        DietQuality: document.getElementById('diet-quality').value,
        SleepQuality: document.getElementById('sleep-quality').value
    };
    
    // Calculate risk
    const prediction = predictRisk(formData);
    
    // Prepare database record
    const dbRecord = {
        name: formData.name,
        age: formData.Age,
        gender: formData.Gender,
        height_cm: formData.HeightCm,
        weight_kg: formData.WeightKg,
        serum_creatinine: formData.SerumCreatinine,
        bun: formData.BUN,
        gfr: formData.GFR,
        acr: formData.ACR,
        serum_electrolytes_calcium: formData.SerumElectrolytesCalcium,
        protein_in_urine: formData.ProteinInUrine,
        blood_pressure_sys: formData.BloodPressureSystolic,
        blood_pressure_dia: formData.BloodPressureDiastolic,
        family_history: formData.FamilyHistory === 'Yes',
        smoking: parseInt(formData.Smoking) || 0,
        alcohol_consumption: parseInt(formData.AlcoholConsumption) || 0,
        physical_activity: parseInt(formData.PhysicalActivity) || 3,
        diet_quality: parseInt(formData.DietQuality) || 3,
        sleep_quality: parseInt(formData.SleepQuality) || 3,
        risk_level: prediction.label,
        risk_score: prediction.score,
        audited_by: AppState.currentProfile?.id
    };
    
    try {
        if (AppState.isEditing && AppState.currentPatient?.dbId) {
            // Update existing patient
            const { error } = await supabase
                .from('patients')
                .update(dbRecord)
                .eq('id', AppState.currentPatient.dbId);
            
            if (error) throw error;
        } else {
            // Insert new patient
            const { error } = await supabase
                .from('patients')
                .insert(dbRecord);
            
            if (error) throw error;
        }
        
        // Reload patients
        await loadPatients();
        closePatientModal();
        renderDashboard();
    } catch (err) {
        console.error('Error saving patient:', err);
        alert('Error saving patient. Please try again.');
    }
}

async function handleDeletePatient() {
    if (!AppState.currentPatient) return;
    
    if (confirm(`Are you sure you want to delete ${AppState.currentPatient.name}? This action cannot be undone.`)) {
        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', AppState.currentPatient.dbId);
            
            if (error) throw error;
            
            await loadPatients();
            showView('dashboard');
            renderDashboard();
        } catch (err) {
            console.error('Error deleting patient:', err);
            alert('Error deleting patient. Please try again.');
        }
    }
}

function openPatientModal() {
    const modal = document.getElementById('patient-modal');
    const form = document.getElementById('patient-form');
    const title = document.getElementById('modal-title');
    
    title.textContent = AppState.isEditing ? 'Edit Patient' : 'Add New Patient';
    form.reset();
    
    if (AppState.isEditing && AppState.currentPatient) {
        // Populate form with current patient data
        const p = AppState.currentPatient;
        document.getElementById('patient-name').value = p.name;
        document.getElementById('patient-age').value = p.Age;
        document.getElementById('patient-gender').value = p.Gender;
        document.getElementById('patient-height').value = p.HeightCm;
        document.getElementById('patient-weight').value = p.WeightKg;
        document.getElementById('serum-creatinine').value = p.SerumCreatinine;
        document.getElementById('bun').value = p.BUN;
        document.getElementById('gfr').value = p.GFR;
        document.getElementById('acr').value = p.ACR;
        document.getElementById('serum-calcium').value = p.SerumElectrolytesCalcium;
        document.getElementById('protein-urine').value = p.ProteinInUrine;
        document.getElementById('bp-systolic').value = p.BloodPressureSystolic;
        document.getElementById('bp-diastolic').value = p.BloodPressureDiastolic;
        document.getElementById('family-history').value = p.FamilyHistory;
        document.getElementById('smoking').value = p.Smoking;
        document.getElementById('alcohol').value = p.AlcoholConsumption;
        document.getElementById('physical-activity').value = p.PhysicalActivity;
        document.getElementById('diet-quality').value = p.DietQuality;
        document.getElementById('sleep-quality').value = p.SleepQuality;
    }
    
    modal.classList.add('active');
}

function closePatientModal() {
    document.getElementById('patient-modal').classList.remove('active');
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = AppState.patients.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.id.toLowerCase().includes(query)
    );
    renderPatientList(filtered);
}

// ===========================
// Rendering Functions
// ===========================

function renderDashboard() {
    updateStats();
    renderPatientList(AppState.patients);
}

function updateStats() {
    const stats = {
        high: AppState.patients.filter(p => p.riskLabel === 'High').length,
        medium: AppState.patients.filter(p => p.riskLabel === 'Medium').length,
        low: AppState.patients.filter(p => p.riskLabel === 'Low').length,
        total: AppState.patients.length
    };
    
    document.getElementById('high-risk-count').textContent = stats.high;
    document.getElementById('medium-risk-count').textContent = stats.medium;
    document.getElementById('low-risk-count').textContent = stats.low;
    document.getElementById('total-patients-count').textContent = stats.total;
}

function renderPatientList(patients) {
    const tbody = document.getElementById('patient-list');
    
    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="8">
                    <div class="empty-state-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <p>No patients found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = patients.map(patient => {
        // Get auditor name from profiles cache
        const auditorProfile = AppState.profiles[patient.auditedBy];
        const auditorName = auditorProfile?.full_name || 'Unknown';
        
        return `
        <tr>
            <td><strong>${patient.id.substring(0, 8)}</strong></td>
            <td>${patient.name}</td>
            <td>${patient.Age}</td>
            <td>${patient.Gender}</td>
            <td><span class="auditor-badge">${auditorName}</span></td>
            <td>${formatDate(patient.lastAssessment)}</td>
            <td>
                <span class="risk-badge ${patient.riskLabel.toLowerCase()}">
                    ${patient.riskLabel} Risk
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewPatient('${patient.id}')" 
                            aria-label="View patient ${patient.name}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

function viewPatient(patientId) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;
    
    AppState.currentPatient = patient;
    showView('profile');
    renderPatientProfile(patient);
}

function generateAdvice(patient) {
    const adviceList = [];
    
    // Risk-level based advice
    if (patient.riskLabel === 'High') {
        adviceList.push('Schedule an appointment with a nephrologist for comprehensive kidney function evaluation.');
        adviceList.push('Monitor blood pressure daily and keep a log for your healthcare provider.');
        adviceList.push('Consider more frequent lab tests to track kidney function changes.');
    } else if (patient.riskLabel === 'Medium') {
        adviceList.push('Schedule regular check-ups every 3-6 months to monitor kidney health.');
        adviceList.push('Work with your doctor to manage any underlying conditions like diabetes or hypertension.');
    } else {
        adviceList.push('Continue maintaining healthy lifestyle habits to preserve kidney function.');
        adviceList.push('Schedule annual kidney function tests as part of routine health screening.');
    }
    
    // GFR-based advice
    if (patient.GFR < 60) {
        adviceList.push('Your GFR indicates reduced kidney function. Discuss dietary modifications with a renal dietitian.');
    }
    
    // Blood pressure advice
    if (patient.BloodPressureSystolic > 140 || patient.BloodPressureDiastolic > 90) {
        adviceList.push('Blood pressure appears elevated. Reduce sodium intake and discuss medication options with your doctor.');
    }
    
    // Lifestyle-based advice
    if (patient.Smoking === 1) {
        adviceList.push('Smoking cessation is strongly recommended as it can accelerate kidney damage.');
    }
    if (patient.PhysicalActivity < 3) {
        adviceList.push('Aim for at least 150 minutes of moderate physical activity per week.');
    }
    if (patient.DietQuality < 3) {
        adviceList.push('Consider adopting a kidney-friendly diet rich in fruits, vegetables, and whole grains.');
    }
    
    // Hydration advice
    adviceList.push('Stay well-hydrated by drinking adequate water unless fluid restriction is advised.');
    
    return adviceList.map(advice => `<div class="advice-item"><span class="advice-bullet">•</span>${advice}</div>`).join('');
}

function renderPatientProfile(patient) {
    const bmi = (patient.WeightKg / Math.pow(patient.HeightCm / 100, 2)).toFixed(1);
    const auditorProfile = AppState.profiles[patient.auditedBy];
    const auditorName = auditorProfile?.full_name || 'Unknown';
    
    const content = `
        <!-- Risk Assessment Card -->
        <div class="risk-assessment">
            <h3>Current Risk Assessment</h3>
            <div class="risk-result">
                <div class="risk-score">
                    <div class="score-circle ${patient.riskLabel.toLowerCase()}">
                        <div>
                            <div>${patient.riskScore}</div>
                            <div class="score-label">${patient.riskLabel}</div>
                        </div>
                    </div>
                    <div class="probability-bars">
                        <div class="prob-bar">
                            <div class="prob-label">
                                <span>High Risk</span>
                                <span>${(patient.riskProbabilities.high * 100).toFixed(1)}%</span>
                            </div>
                            <div class="prob-track">
                                <div class="prob-fill high" style="width: ${patient.riskProbabilities.high * 100}%">
                                    ${patient.riskProbabilities.high > 0.1 ? `<span>${(patient.riskProbabilities.high * 100).toFixed(0)}%</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="prob-bar">
                            <div class="prob-label">
                                <span>Medium Risk</span>
                                <span>${(patient.riskProbabilities.medium * 100).toFixed(1)}%</span>
                            </div>
                            <div class="prob-track">
                                <div class="prob-fill medium" style="width: ${patient.riskProbabilities.medium * 100}%">
                                    ${patient.riskProbabilities.medium > 0.1 ? `<span>${(patient.riskProbabilities.medium * 100).toFixed(0)}%</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="prob-bar">
                            <div class="prob-label">
                                <span>Low Risk</span>
                                <span>${(patient.riskProbabilities.low * 100).toFixed(1)}%</span>
                            </div>
                            <div class="prob-track">
                                <div class="prob-fill low" style="width: ${patient.riskProbabilities.low * 100}%">
                                    ${patient.riskProbabilities.low > 0.1 ? `<span>${(patient.riskProbabilities.low * 100).toFixed(0)}%</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Advice Section -->
            <div class="advice-section">
                <div class="advice-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                    </svg>
                    <span>Health Advice</span>
                    <span class="advice-disclaimer">For informational purposes only</span>
                </div>
                <div class="advice-content">
                    ${generateAdvice(patient)}
                </div>
            </div>
        </div>

        <!-- Patient Information Grid -->
        <div class="profile-grid">
            <!-- Demographics -->
            <div class="profile-card">
                <h3>Demographics</h3>
                <div class="info-row">
                    <span class="info-label">Patient ID</span>
                    <span class="info-value">${patient.id.substring(0, 8)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Audited By</span>
                    <span class="info-value"><span class="auditor-badge">${auditorName}</span></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">${patient.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Age</span>
                    <span class="info-value">${patient.Age} years</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Gender</span>
                    <span class="info-value">${patient.Gender}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Height</span>
                    <span class="info-value">${patient.HeightCm} cm</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Weight</span>
                    <span class="info-value">${patient.WeightKg} kg</span>
                </div>
                <div class="info-row">
                    <span class="info-label">BMI</span>
                    <span class="info-value">${bmi}</span>
                </div>
            </div>

            <!-- Laboratory Tests -->
            <div class="profile-card">
                <h3>Laboratory Tests</h3>
                <div class="info-row">
                    <span class="info-label">Serum Creatinine</span>
                    <span class="info-value">${patient.SerumCreatinine} mg/dL</span>
                </div>
                <div class="info-row">
                    <span class="info-label">BUN</span>
                    <span class="info-value">${patient.BUN} mg/dL</span>
                </div>
                <div class="info-row">
                    <span class="info-label">GFR</span>
                    <span class="info-value">${patient.GFR} mL/min/1.73m²</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ACR</span>
                    <span class="info-value">${patient.ACR} mg/g</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Serum Calcium</span>
                    <span class="info-value">${patient.SerumElectrolytesCalcium} mg/dL</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Protein in Urine</span>
                    <span class="info-value">${patient.ProteinInUrine} mg/dL</span>
                </div>
            </div>

            <!-- Vital Signs & History -->
            <div class="profile-card">
                <h3>Vital Signs & History</h3>
                <div class="info-row">
                    <span class="info-label">Blood Pressure</span>
                    <span class="info-value">${patient.BloodPressureSystolic}/${patient.BloodPressureDiastolic} mmHg</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Family History</span>
                    <span class="info-value">${patient.FamilyHistory}</span>
                </div>
            </div>

            <!-- Lifestyle Factors -->
            <div class="profile-card">
                <h3>Lifestyle Factors</h3>
                <div class="info-row">
                    <span class="info-label">Smoking Status</span>
                    <span class="info-value">${patient.Smoking}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Alcohol Consumption</span>
                    <span class="info-value">${patient.AlcoholConsumption}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Physical Activity</span>
                    <span class="info-value">${patient.PhysicalActivity}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Diet Quality</span>
                    <span class="info-value">${patient.DietQuality}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sleep Quality</span>
                    <span class="info-value">${patient.SleepQuality}</span>
                </div>
            </div>
        </div>

        <!-- Assessment History -->
        ${patient.history && patient.history.length > 0 ? `
            <div class="card">
                <div class="card-header">
                    <h3>Assessment History</h3>
                </div>
                <div style="padding: var(--spacing-xl);">
                    <div class="history-timeline">
                        ${patient.history.map(h => `
                            <div class="history-item">
                                <div class="history-dot"></div>
                                <div class="history-content">
                                    <div class="history-date">${formatDate(h.date)}</div>
                                    <div>
                                        <span class="risk-badge ${h.riskLabel.toLowerCase()}">${h.riskLabel} Risk</span>
                                        <span style="margin-left: 10px; font-weight: 600;">Score: ${h.riskScore}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('patient-profile-content').innerHTML = content;
}

// ===========================
// Import/Export Functions
// ===========================

let selectedExportFormat = null;

function handleExport() {
    const modal = document.getElementById('export-modal');
    modal.classList.add('active');
    selectedExportFormat = null;
    document.getElementById('export-confirm-btn').disabled = true;
    document.getElementById('image-format-options').style.display = 'none';
    document.querySelectorAll('.export-format-btn').forEach(btn => btn.classList.remove('selected'));
}

function closeExportModal() {
    document.getElementById('export-modal').classList.remove('active');
    selectedExportFormat = null;
}

function selectExportFormat(format) {
    selectedExportFormat = format;
    document.querySelectorAll('.export-format-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-format="${format}"]`).classList.add('selected');
    document.getElementById('export-confirm-btn').disabled = false;
    document.getElementById('image-format-options').style.display = format === 'image' ? 'flex' : 'none';
}

function confirmExport() {
    if (!selectedExportFormat) return;
    
    switch(selectedExportFormat) {
        case 'json':
            exportAsJSON();
            break;
        case 'pdf':
            exportAsPDF();
            break;
        case 'word':
            exportAsWord();
            break;
        case 'image':
            const imageFormat = document.querySelector('input[name="image-format"]:checked').value;
            exportAsImage(imageFormat);
            break;
    }
    closeExportModal();
}

function exportAsJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        patients: AppState.patients
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidney-risk-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function generateReadableReport() {
    const exportDate = new Date().toLocaleString();
    let report = `
═══════════════════════════════════════════════════════════════
                  KIDNEY RISK ASSESSMENT REPORT
                     Clinical Decision Support
═══════════════════════════════════════════════════════════════
Export Date: ${exportDate}
Total Patients: ${AppState.patients.length}
───────────────────────────────────────────────────────────────

`;

    if (AppState.patients.length === 0) {
        report += 'No patient data available.\n';
    } else {
        AppState.patients.forEach((patient, index) => {
            const riskLabel = patient.riskAssessment?.label || 'Not Assessed';
            const riskScore = patient.riskAssessment?.score?.toFixed(1) || 'N/A';
            
            report += `
┌─────────────────────────────────────────────────────────────┐
│ PATIENT ${index + 1}: ${patient.name.toUpperCase()}
├─────────────────────────────────────────────────────────────┤
│ BASIC INFORMATION
│   • Patient ID: ${patient.id}
│   • Age: ${patient.Age} years
│   • Gender: ${patient.Gender === 1 ? 'Male' : 'Female'}
│   • Height: ${patient.HeightCm} cm
│   • Weight: ${patient.WeightKg} kg
│   • BMI: ${(patient.WeightKg / Math.pow(patient.HeightCm / 100, 2)).toFixed(1)}
│
│ RISK ASSESSMENT
│   • Risk Level: ${riskLabel}
│   • Risk Score: ${riskScore}/100
│   • Last Assessment: ${patient.lastAssessment ? formatDate(patient.lastAssessment) : 'N/A'}
│
│ LABORATORY VALUES
│   • Serum Creatinine: ${patient.SerumCreatinine} mg/dL
│   • BUN: ${patient.BUN} mg/dL
│   • GFR: ${patient.GFR} mL/min/1.73m²
│   • ACR: ${patient.ACR} mg/g
│   • Serum Calcium: ${patient.SerumElectrolytesCalcium} mg/dL
│   • Protein in Urine: ${patient.ProteinInUrine} mg/dL
│
│ VITAL SIGNS
│   • Blood Pressure: ${patient.BloodPressureSys}/${patient.BloodPressureDia} mmHg
│
│ LIFESTYLE FACTORS
│   • Family History: ${patient.FamilyHistory ? 'Yes' : 'No'}
│   • Smoking: ${patient.Smoking ? 'Yes' : 'No'}
│   • Alcohol: ${patient.AlcoholConsumption ? 'Yes' : 'No'}
│   • Physical Activity: ${getActivityLevel(patient.PhysicalActivity)}
│   • Diet Quality: ${getDietQuality(patient.DietQuality)}
│   • Sleep Quality: ${getSleepQuality(patient.SleepQuality)}
└─────────────────────────────────────────────────────────────┘
`;
        });
    }

    report += `
═══════════════════════════════════════════════════════════════
                        END OF REPORT
    ⚠️ FOR INFORMATIONAL PURPOSES ONLY - NOT MEDICAL ADVICE
═══════════════════════════════════════════════════════════════
`;
    return report;
}

function getActivityLevel(value) {
    const levels = { 0: 'Sedentary', 1: 'Light', 2: 'Moderate', 3: 'Active' };
    return levels[value] || 'Unknown';
}

function getDietQuality(value) {
    const levels = { 0: 'Poor', 1: 'Fair', 2: 'Good', 3: 'Excellent' };
    return levels[value] || 'Unknown';
}

function getSleepQuality(value) {
    const levels = { 0: 'Poor', 1: 'Fair', 2: 'Good', 3: 'Excellent' };
    return levels[value] || 'Unknown';
}

function exportAsPDF() {
    const report = generateReadableReport();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Kidney Risk Assessment Report</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            padding: 40px;
            background: white;
            color: #1a1a2e;
            line-height: 1.4;
            white-space: pre-wrap;
            font-size: 11px;
        }
        @media print {
            body { padding: 20px; }
        }
    </style>
</head>
<body>${report}</body>
</html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

function exportAsWord() {
    const report = generateReadableReport();
    const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
    <meta charset="UTF-8">
    <title>Kidney Risk Assessment Report</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            white-space: pre-wrap;
            line-height: 1.4;
        }
    </style>
</head>
<body>
<pre>${report}</pre>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidney-risk-report-${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportAsImage(format) {
    const report = generateReadableReport();
    const lines = report.split('\n');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const lineHeight = 16;
    const padding = 40;
    const fontSize = 12;
    
    ctx.font = `${fontSize}px "Courier New", monospace`;
    
    let maxWidth = 0;
    lines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
    });
    
    canvas.width = Math.max(800, maxWidth + padding * 2);
    canvas.height = lines.length * lineHeight + padding * 2;
    
    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.fillStyle = '#e0e0e0';
    ctx.textBaseline = 'top';
    
    lines.forEach((line, i) => {
        // Highlight risk levels
        if (line.includes('High')) {
            ctx.fillStyle = '#ff6b6b';
        } else if (line.includes('Medium')) {
            ctx.fillStyle = '#feca57';
        } else if (line.includes('Low') && line.includes('Risk')) {
            ctx.fillStyle = '#48dbfb';
        } else {
            ctx.fillStyle = '#e0e0e0';
        }
        ctx.fillText(line, padding, padding + i * lineHeight);
    });
    
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.95 : undefined;
    
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kidney-risk-report-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }, mimeType, quality);
}

// Export modal event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('export-modal-close')?.addEventListener('click', closeExportModal);
    document.getElementById('export-cancel-btn')?.addEventListener('click', closeExportModal);
    document.getElementById('export-confirm-btn')?.addEventListener('click', confirmExport);
    
    document.querySelectorAll('.export-format-btn').forEach(btn => {
        btn.addEventListener('click', () => selectExportFormat(btn.dataset.format));
    });
    
    document.getElementById('export-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'export-modal') closeExportModal();
    });
});

function handleImport() {
    document.getElementById('file-input').click();
}

async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.patients && Array.isArray(data.patients)) {
                if (confirm(`Import ${data.patients.length} patients? This will add to your existing data.`)) {
                    // Convert imported patients to database format and insert
                    const dbRecords = data.patients.map(p => ({
                        name: p.name,
                        age: p.Age,
                        gender: p.Gender,
                        height_cm: p.HeightCm,
                        weight_kg: p.WeightKg,
                        serum_creatinine: p.SerumCreatinine,
                        bun: p.BUN,
                        gfr: p.GFR,
                        acr: p.ACR,
                        serum_electrolytes_calcium: p.SerumElectrolytesCalcium,
                        protein_in_urine: p.ProteinInUrine,
                        blood_pressure_sys: p.BloodPressureSystolic,
                        blood_pressure_dia: p.BloodPressureDiastolic,
                        family_history: p.FamilyHistory === 'Yes',
                        smoking: parseInt(p.Smoking) || 0,
                        alcohol_consumption: parseInt(p.AlcoholConsumption) || 0,
                        physical_activity: parseInt(p.PhysicalActivity) || 3,
                        diet_quality: parseInt(p.DietQuality) || 3,
                        sleep_quality: parseInt(p.SleepQuality) || 3,
                        risk_level: p.riskLabel || 'Unknown',
                        risk_score: p.riskScore || 0,
                        audited_by: AppState.currentProfile?.id
                    }));
                    
                    const { error } = await supabase
                        .from('patients')
                        .insert(dbRecords);
                    
                    if (error) throw error;
                    
                    await loadPatients();
                    renderDashboard();
                    alert('Data imported successfully!');
                }
            } else {
                alert('Invalid file format');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
        e.target.value = '';
    };
    reader.readAsText(file);
}

// ===========================
// Utility Functions
// ===========================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}