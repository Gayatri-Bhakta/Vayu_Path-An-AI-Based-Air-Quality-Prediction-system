# AI-Based-Air-Quality-Prediction-Sys-for-Personalized-Pollution-Alerts---Route-Optimization-July-2026
# AI-Powered Air Quality Prediction & Monitoring Dashboard

A responsive full-stack platform built with **FastAPI** and **React (Vite)** featuring authentication, live pollutant telemetries, deep learning-based LSTM multi-horizon forecasts, and interactive geospatial mapping.

---

## 📸 Screenshots & UI Showcase

### 1. User Authentication (Login & Signup)
*Secure session-managed user authentication interface designed with dynamic frosted-glass cards, live AQI telemetry previews, and responsive background perspectives.*

## 🌟 Core Implemented Features

### 🔐 1. Authentication & Security
* **Sign In & Sign Up Workflows:** Form validation and credential authentication handling via FastAPI backend endpoints (`/auth/login`, `/auth/signup`).
* **Session Persistence:** Secure browser local storage handling for auth tokens and user profile state.
* **Frosted-Glass Aesthetic:** Themed UI built with twilight and ice color palettes, password visibility toggles, and live pollutant summary pills.

### 📊 2. Live Monitoring & Deep Learning Dashboard
* **Interactive Map Visualization:** Dynamic station markers rendered with Leaflet, color-coded by AQI category:
  * 🔴 **Very Poor (>300):** High-alert pulse markers.
  * 🟠 **Poor (201–300):** Elevated risk markers.
  * 🔵 **Moderate (101–200):** Cautionary station points.
  * 🟢 **Good (≤100):** Safe baseline zones.
* **LSTM Multi-Horizon AQI Forecast:** Deep-learning neural network inference generating predictions across key horizons (**+1h, +6h, +12h, and +24h**) using cyclical temporal features.
* **City-Wide Monitoring Grid:** Real-time metrics grid displaying simultaneous $\text{PM}_{2.5}$, $\text{PM}_{10}$, and overall AQI readings across 30+ regional monitoring stations.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, React Router v6, Recharts, React-Leaflet, Lucide Icons
* **Backend:** FastAPI, Uvicorn, Pydantic, Python 3.12
* **Machine Learning:** TensorFlow (Keras LSTM), Scikit-Learn, NumPy, Pandas, Joblib

---

## 🚀 Quickstart Guide

### 1. Backend Server
```bash
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000

### 1. Frontend 
```bash
cd Frontend
npm run dev


