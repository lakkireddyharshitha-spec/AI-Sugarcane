# CaneGuard AI

CaneGuard AI is a full-stack sugarcane crop intelligence platform that combines a FastAPI backend, React + Vite frontend, and lightweight ML/disease-analysis workflows for crop monitoring, recommendations, and risk assessment.

## Features

- Farmer authentication and profile management
- Farm management dashboard
- Environmental monitoring and trend analysis
- Crop growth tracking and historical observations
- Disease detection workflow with image upload and demo analysis fallback
- Risk prediction module
- AI recommendation engine
- Alerts and analytics views
- PDF audit report generation
- Dataset and model status view

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Axios
- Backend: FastAPI, SQLAlchemy, SQLite
- ML/data: pandas, scikit-learn, NumPy, joblib, Pillow

## Demo login

- Email: farmer@caneguard.ai
- Password: Farmer@123

## Project structure

- backend/: FastAPI application and database models/routes/services
- frontend/: React UI
- dataset/: dataset assets and class mapping
- ml_models/: model artifacts and training scripts
- uploads/: demo leaf images used by the disease analysis flow
- reports/: generated report output

## Local setup

### 1. Backend

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

Then start the API:

```powershell
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open:

- http://localhost:5173
- Backend API docs: http://localhost:8000/docs

## Verification status

The current project has been verified to run in its working state:

- backend API starts successfully on port 8000
- frontend builds successfully with Vite
- dataset endpoint responds correctly
- authentication flow works with the seeded demo account
- protected pages load after login

## Notes

- The app includes demo-mode ML behavior when trained model files are not present.
- Some pages may show empty-state data depending on the selected farm and seeded observations.
- The dataset endpoints and demo assets are included to support the demo experience without requiring a full model retrain.
