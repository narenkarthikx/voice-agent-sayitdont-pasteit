# 🎙️ Say It! Don't Paste It

**AI-Powered Voice Recruitment Platform** | Automate candidate screening with intelligent voice agents

[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM-orange)](https://groq.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [3-Phase AI Screening](#-3-phase-ai-screening)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Demo Credentials](#-demo-credentials)

---

## 🎯 Overview

**Say It! Don't Paste It** is a cutting-edge recruitment automation platform that uses AI voice agents to screen candidates efficiently. The system performs a **3-phase intelligent screening process** that saves time, reduces costs, and improves hiring quality.

### Why Say It! Don't Paste It?

- ⚡ **80% faster** candidate screening
- 💰 **Save voice credits** by pre-screening resumes
- 🎯 **Consistent evaluation** with AI-powered assessments
- 📊 **Data-driven decisions** with detailed analytics
- 🔄 **Automated workflow** from resume upload to final decision

---

## ✨ Key Features

### 🤖 AI-Powered Screening
- **Resume Parsing**: Automatic extraction of skills, experience, and qualifications
- **Voice AI Interviews**: Natural conversational screening with 3-5 targeted questions
- **Smart Evaluation**: Automatic assessment with match scores (high/medium/low)

### 📊 Intelligent Dashboard
- Real-time screening statistics
- Pre-screening vs voice screening metrics
- Average fit scores and success rates
- Top candidate rankings

### 👥 Candidate Management
- Bulk resume uploads (PDF)
- Pre-screening status badges
- Fit score visualization
- Detailed candidate profiles with skill matching

### 📞 Call History & Analytics
- Complete call transcripts
- AI-generated summaries
- Recording playback with waveform visualization
- Skills assessment reports

### 🔒 Secure Authentication
- JWT-based authentication
- Role-based access control
- Protected API endpoints

---

## 🎭 3-Phase AI Screening

### **Phase 1: Pre-Call Screening** 🔍
**Purpose**: Filter candidates before spending voice credits

**Process**:
1. Resume uploaded → LLM analyzes against job requirements
2. Fit score calculated (0-100) based on:
   - Skill match (40% weight)
   - Experience relevance (30% weight)

## 🔑 Environment Setup

### Backend Configuration

Create `backend/.env` file:

```env
# MongoDB
MONGO_DETAILS=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Security
SECRET_KEY=your-secret-key-for-jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI/Voice APIs
GROQ_API_KEY=your-groq-api-key
DINODIAL_PROXY_API_KEY=your-dinodial-api-key
```

### Frontend Configuration

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🚀 Running the Application

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed admin user (first time only)
python seed_user.py

# Start backend server
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

### Dashboard
- `GET /api/dashboard/stats` - Get screening statistics

### Jobs
- `GET /api/jobs/` - List all job positions
- `POST /api/jobs/` - Create new job position
- `DELETE /api/jobs/{id}` - Delete job position

### Candidates
- `GET /api/candidates/` - List all candidates
- `POST /api/candidates/upload` - Upload resume (PDF)
- `POST /api/candidates/{id}/call` - Initiate voice screening

### Calls
- `GET /api/calls/` - List all screening calls
- `GET /api/calls/{id}/recording` - Get call recording URL

Interactive API documentation available at: `http://localhost:8000/docs`

## 📁 Project Structure

```
sayit-dont-pasteit/
├── backend/
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── candidates.py     # Candidate management & call triggering
│   │   ├── calls.py          # Call history & recordings
│   │   ├── dashboard.py      # Statistics endpoints
│   │   └── jobs.py           # Job position management
│   ├── services/
│   │   ├── resume_parser.py  # PDF extraction & LLM parsing
│   │   ├── pre_screening.py  # Phase 1: Fit score calculation
│   │   └── llm_service.py    # Groq API integration
│   ├── models.py             # Pydantic schemas
│   ├── database.py           # MongoDB connection
│   ├── security.py           # JWT & password utilities
│   ├── main.py               # FastAPI application
│   ├── call_status_checker.py # Background task (Phase 3)
│   ├── seed_user.py          # Admin user creation
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js     # Sidebar navigation
│   │   ├── pages/
│   │   │   ├── Login.js      # Authentication page
│   │   │   ├── Dashboard.js  # Main dashboard with stats
│   │   │   ├── Candidates.js # Candidate pool & upload
│   │   │   ├── Jobs.js       # Job position management
│   │   │   └── CallHistory.js # AI screening history
│   │   ├── context/
│   │   │   └── AuthContext.js # Auth state management
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with JWT
│   │   ├── App.js            # Main app component
│   │   └── index.js          # React entry point
│   └── package.json          # Node dependencies
│
└── README.md                 # This file
```

---

## 🔐 Demo Credentials

```
Username: admin
Password: password123
```

**Note**: Change these credentials in production!

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


---

## 🚀 Roadmap

- [ ] Multi-language voice support
- [ ] Video screening integration
- [ ] Advanced analytics dashboard
- [ ] Candidate self-scheduling
- [ ] Integration with ATS systems
- [ ] Custom evaluation rubrics
- [ ] Team collaboration features

