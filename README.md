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
   - Years of experience (30% weight)
3. **Decision**: Auto-reject if score < 60, proceed if ≥ 60

**Time**: ~10-30 seconds (background)

**Benefits**: Saves money, filters unqualified candidates early

---

### **Phase 2: Voice Screening** 📞
**Purpose**: Verify real skill depth through conversation

**Process**:
1. AI voice agent calls qualified candidates
2. Asks 3-5 experience-based questions
3. Evaluates technical depth and communication
4. No hints or teaching - pure assessment
5. Asks availability and salary expectations

**Time**: 4-6 minutes per call

**Benefits**: Validates resume claims, assesses real knowledge

---

### **Phase 3: Post-Call Analysis** 📊
**Purpose**: Convert conversation into hiring decision

**Process**:
1. Fetch call details from voice API
2. Extract AI evaluation (outcome, match score, skills assessment)
3. Generate structured summary with:
   - Technical strengths and weaknesses
   - Communication quality
   - Availability and salary details
   - Final recommendation (shortlisted/rejected/on-hold)
4. Auto-update candidate status

**Time**: ~5-10 seconds

**Benefits**: Clear hiring signals, no manual transcript review needed

---

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.3 - UI framework
- **React Router** 7.10.1 - Navigation
- **Tailwind CSS** 3.4.17 - Styling
- **Axios** - HTTP client
- **WaveSurfer.js** - Audio waveform visualization
- **React Toastify** - Notifications

### Backend
- **FastAPI** - High-performance Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **python-jose** - JWT authentication
- **bcrypt** - Password hashing
- **Groq API** - LLM for resume parsing and pre-screening
- **httpx** - Async HTTP client for voice API

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database

### External Services
- **Dinodial Voice API** - AI voice calling service
- **Groq LLM** - llama-3.3-70b-versatile for NLP tasks

---

## 📦 Installation

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+
- **MongoDB Atlas** account
- **Groq API** key
- **Dinodial Voice API** key

### Clone Repository
```bash
git clone <repository-url>
cd sayit-dont-pasteit
```

---

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

---

## 🌐 Deployment

### **Recommended: Vercel (Frontend) + Railway/Render (Backend)**

#### Why Vercel for Frontend?
✅ **Automatic deployments** from Git  
✅ **Serverless edge network** for fast global delivery  
✅ **Zero configuration** for React apps  
✅ **Built-in HTTPS** and custom domains  
✅ **Free tier** with generous limits  
✅ **Preview deployments** for every PR  

#### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Vercel Configuration** (create `vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend.railway.app/api"
  },
  "github": {
    "silent": true
  }
}
```

#### Backend Deployment: Render (Free Tier) ✅

**Why Render?**
- ✅ **100% Free tier** - No credit card required
- ✅ Auto-sleep after inactivity (wakes in ~30s)
- ✅ Simple dashboard with live logs
- ✅ Easy environment variables UI
- ✅ Automatic HTTPS/SSL certificates
- ✅ GitHub auto-deploy on push

**Deploy via Render Website:**

1. **Push backend to GitHub** (entire backend folder)

2. **Go to [render.com](https://render.com)** → Sign up with GitHub

3. **New → Web Service** → Connect your repository

4. **Configure**:
   - **Name**: `sayit-backend`
   - **Root Directory**: Leave blank (or `backend` if monorepo)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. **Add Environment Variables** (in dashboard):
   ```
   MONGO_DETAILS=mongodb+srv://...
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   GROQ_API_KEY=your-groq-key
   DINODIAL_PROXY_API_KEY=your-dinodial-key
   ```

6. **Deploy** → Copy your backend URL (e.g., `https://sayit-backend.onrender.com`)

7. **Update Frontend** on Vercel with backend URL

**⚠️ Important**: Free tier sleeps after 15 min inactivity. First request takes ~30s to wake up.

**Alternative**: Railway (free but needs credit card verification)

### Alternative: Netlify (Not Recommended)
❌ Netlify is great for static sites but has limitations for React apps with routing  
❌ Requires additional configuration for SPA routing  
❌ Less seamless than Vercel for React  

---

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

## 🎨 UI Screenshots

### Dashboard
- Pre-screening analytics with average fit score
- Voice screening statistics (completed, in-progress, shortlisted)
- AI match score distribution
- Top screened candidates

### Candidate Pool
- Pre-screen status badges (✓ Qualified / ✗ Rejected)
- Fit scores (0-100)
- Voice screening status
- Initiate Call button (disabled for rejected candidates)

### Call History
- AI screening outcomes with badges
- Match score indicators
- Call recordings with waveform
- Detailed assessment summaries

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙋 Support

For issues or questions:
- Open an issue on GitHub
- Check API documentation at `/docs`
- Review backend logs for debugging

---

## 🚀 Roadmap

- [ ] Multi-language voice support
- [ ] Video screening integration
- [ ] Advanced analytics dashboard
- [ ] Candidate self-scheduling
- [ ] Integration with ATS systems
- [ ] Custom evaluation rubrics
- [ ] Team collaboration features

---

**Built with ❤️ for smarter recruiting**
