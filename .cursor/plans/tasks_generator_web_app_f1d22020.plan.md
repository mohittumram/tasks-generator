# Tasks Generator Web App - Implementation Plan

## Architecture Overview

**Tech Stack:**

- **Backend:** FastAPI (Python) - modern, fast, auto-docs, easy LLM integration
- **Frontend:** React + Vite - modern, fast development
- **Database:** SQLite (simple, no setup) - works on all free hosting
- **LLM Integration:** **Groq API (FREE)** or **Hugging Face Inference API (FREE)** - both offer free tiers with open-source models
- **Hosting:**
  - **Backend:** Render.com free tier OR Railway.app free tier
  - **Frontend:** Vercel (free) OR Netlify (free) - both excellent for React apps
- **Styling:** Tailwind CSS for modern UI

## Project Structure

```
tasks-generator/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry
│   │   ├── models.py             # Database models
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── database.py           # DB connection
│   │   ├── llm_service.py        # LLM integration
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── tasks.py          # Task generation endpoints
│   │   │   ├── specs.py          # Spec management endpoints
│   │   │   └── health.py         # Health check endpoint
│   │   └── utils.py              # Helper functions
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.jsx      # Feature input form
│   │   │   ├── TaskList.jsx      # Editable task list
│   │   │   ├── SpecHistory.jsx   # Last 5 specs
│   │   │   └── StatusPage.jsx    # Health status
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Main page
│   │   │   └── Status.jsx        # Status page
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── README.md
├── AI_NOTES.md
├── ABOUTME.md
├── PROMPTS_USED.md
└── .gitignore
```

## Implementation Steps

### Phase 1: Backend Setup (2-3 hours)

1. **Initialize FastAPI backend**

   - Set up FastAPI app with CORS
   - Create database models (Spec, Task, TaskGroup)
   - Set up SQLite database with SQLAlchemy
   - Create Pydantic schemas for request/response

2. **LLM Integration (FREE)**

   - **Option 1 (Recommended): Groq API** - Free tier, very fast, supports Llama 3, Mixtral
     - Sign up at console.groq.com (free, no credit card)
     - Get API key (free forever with rate limits)
   - **Option 2: Hugging Face Inference API** - Free tier available
     - Sign up at huggingface.co (free)
     - Use models like meta-llama/Llama-3-8b or mistralai/Mixtral-8x7B
   - Create `llm_service.py` with Groq or Hugging Face client
   - Build prompt template for generating user stories and tasks
   - Implement generation endpoint that takes feature spec and returns structured tasks
   - Handle rate limits gracefully (free tiers have limits)

3. **API Endpoints**

   - `POST /api/generate` - Generate tasks from feature spec
   - `GET /api/specs` - Get last 5 specs
   - `GET /api/specs/{id}` - Get specific spec with tasks
   - `PUT /api/specs/{id}/tasks` - Update tasks (reorder, edit, group)
   - `GET /api/health` - Health check (backend, DB, LLM)

4. **Database Schema**
   ```python
   Spec: id, goal, users, constraints, created_at
   Task: id, spec_id, title, description, type (user_story/engineering), order, group_id
   TaskGroup: id, spec_id, name, order
   ```


### Phase 2: Frontend Setup (2-3 hours)

1. **React App Setup**

   - Initialize Vite + React project
   - Set up Tailwind CSS
   - Create routing (React Router)
   - Set up API service layer

2. **Home Page Components**

   - Feature input form (goal, users, constraints)
   - Loading state during generation
   - Task list display with drag-and-drop reordering
   - Edit functionality (inline editing)
   - Grouping UI (create groups, assign tasks)
   - Export buttons (copy as text, download as markdown)

3. **Status Page**

   - Backend health check indicator
   - Database connection status
   - LLM API connection test
   - Visual indicators (green/yellow/red)

4. **Spec History**

   - Display last 5 generated specs
   - Click to load and edit
   - Clear, minimal UI

### Phase 3: Enhanced Features (1-2 hours)

1. **Templates System**

   - Add template selector (Mobile App, Web App, Internal Tool)
   - Pre-fill common constraints based on template

2. **Risk/Unknowns Section**

   - Add optional "risks and unknowns" field to form
   - Include in LLM prompt for better task generation

3. **Export Functionality**

   - Copy to clipboard (text format)
   - Download as markdown file
   - Format: grouped tasks with descriptions

### Phase 4: Polish & Testing (1 hour)

1. **Error Handling**

   - Empty input validation
   - Invalid API responses
   - Network error handling
   - User-friendly error messages

2. **UI/UX Improvements**

   - Loading states
   - Success/error notifications
   - Responsive design
   - Clean, modern styling

3. **Basic Testing**

   - Test API endpoints manually
   - Test frontend flows
   - Test error cases

### Phase 5: Documentation & Deployment (1-2 hours)

1. **README.md**

   - Project description
   - How to run locally (with Docker)
   - Tech stack
   - What's done / what's not done
   - Environment variables

2. **AI_NOTES.md**

   - List what AI was used for (code generation, debugging, etc.)
   - Which LLM provider (OpenAI/Anthropic) and why
   - What was manually verified/checked

3. **PROMPTS_USED.md**

   - Record all prompts used during development
   - No responses, no API keys
   - Organized by feature/component

4. **ABOUTME.md**

   - Your name
   - Resume/CV content

5. **Deployment (FREE)**

   - **Backend:** Deploy to Render.com
     - Connect GitHub repo
     - Set build command: `cd backend && pip install -r requirements.txt`
     - Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - Add environment variables (GROQ_API_KEY, etc.)
   - **Frontend:** Deploy to Vercel
     - Connect GitHub repo
     - Set root directory to `frontend`
     - Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
     - Build automatically on push
   - Test live deployment thoroughly
   - Note: Render free tier spins down after inactivity (first request may be slow)

## Key Files to Create

### Backend Core Files

**`backend/app/main.py`** - FastAPI app initialization

**`backend/app/models.py`** - SQLAlchemy models

**`backend/app/llm_service.py`** - LLM integration with prompt engineering

**`backend/app/routes/tasks.py`** - Task generation and management endpoints

**`backend/app/routes/health.py`** - Health check endpoint

### Frontend Core Files

**`frontend/src/pages/Home.jsx`** - Main application page

**`frontend/src/components/TaskForm.jsx`** - Feature input form

**`frontend/src/components/TaskList.jsx`** - Editable, sortable task list

**`frontend/src/pages/Status.jsx`** - Health status page

## LLM Prompt Strategy

The core prompt for task generation should:

1. Take goal, users, constraints (and optionally risks)
2. Generate structured user stories and engineering tasks
3. Return JSON format for easy parsing
4. Include dependencies and grouping hints

## Hosting Strategy (100% FREE)

**Backend Hosting:**

- **Render.com (Recommended)** - Free tier:
  - Spins down after 15 min inactivity (wakes on request)
  - 750 hours/month free
  - Easy GitHub integration
  - Environment variables support
- **Railway.app** - Free tier with $5 credit/month
  - More reliable uptime
  - Good for production-like testing

**Frontend Hosting:**

- **Vercel (Recommended)** - Free tier:
  - Unlimited deployments
  - Automatic HTTPS
  - Great for React apps
  - Connect GitHub repo directly
- **Netlify** - Free tier:
  - Similar to Vercel
  - Good alternative

**Deployment Approach:**

1. Deploy backend to Render.com (connects to GitHub)
2. Deploy frontend to Vercel (connects to GitHub)
3. Update frontend API URL to point to Render backend
4. Both stay live and free

## Environment Variables

Create `.env.example` with:

```
# LLM API Key (FREE - get from Groq or Hugging Face)
GROQ_API_KEY=your_groq_api_key_here
# OR use Hugging Face:
# HUGGINGFACE_API_KEY=your_hf_api_key_here

# Database (SQLite - no setup needed)
DATABASE_URL=sqlite:///./tasks.db

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# LLM Provider choice
LLM_PROVIDER=groq  # or 'huggingface'
```

**Getting Free API Keys:**

1. **Groq API (Recommended):**

   - Go to https://console.groq.com
   - Sign up (free, no credit card)
   - Go to API Keys section
   - Create new API key
   - Copy and use in environment variables

2. **Hugging Face (Alternative):**

   - Go to https://huggingface.co
   - Sign up (free)
   - Go to Settings > Access Tokens
   - Create new token
   - Copy and use in environment variables

## Success Criteria

- ✅ Form accepts feature input
- ✅ Generates user stories and engineering tasks
- ✅ Tasks can be edited, reordered, grouped
- ✅ Export works (copy + download)
- ✅ Shows last 5 specs
- ✅ Status page shows backend, DB, LLM health
- ✅ Handles empty/wrong input gracefully
- ✅ All documentation files present
- ✅ App is live and accessible
- ✅ GitHub repo is clean (no API keys)

## Sample Prompts for AI Development

**Note:** Record all prompts you use in `PROMPTS_USED.md` (without responses or API keys)

### Initial Setup Prompts

- "Create a FastAPI backend structure for a task generator app with SQLite database"
- "Set up React + Vite frontend with Tailwind CSS and routing"
- "Create a Groq API client in Python to call Llama 3 model"

### Feature Development Prompts

- "Create a FastAPI endpoint that takes a feature spec (goal, users, constraints) and generates user stories and engineering tasks using Groq API"
- "Build a React form component for feature input with validation"
- "Create a draggable task list component in React with edit and group functionality"
- "Implement export functionality to copy tasks as markdown to clipboard"

### Integration Prompts

- "Create a health check endpoint that tests backend, database, and LLM API connection"
- "Build a status page in React that displays health check results with visual indicators"
- "Set up CORS in FastAPI to allow requests from Vercel frontend"

### Deployment Prompts

- "Create a Dockerfile for FastAPI backend"
- "Create a Dockerfile for React frontend"
- "Set up docker-compose.yml to run both backend and frontend"
- "Create deployment configuration for Render.com backend"
- "Create deployment configuration for Vercel frontend"

## Submission Checklist

Before submitting, ensure:

1. **Functionality:**

   - [ ] App works end-to-end (form → generation → editing → export)
   - [ ] Status page shows all health checks
   - [ ] Last 5 specs are displayed and loadable
   - [ ] Error handling works (empty inputs, API errors)

2. **Documentation:**

   - [ ] README.md with setup instructions
   - [ ] AI_NOTES.md with LLM provider info (Groq/Hugging Face)
   - [ ] PROMPTS_USED.md with all prompts (no responses/keys)
   - [ ] ABOUTME.md with your name and resume

3. **Code Quality:**

   - [ ] No API keys in code
   - [ ] .env.example file present
   - [ ] .gitignore excludes .env and sensitive files
   - [ ] Code is clean and understandable

4. **Deployment:**

   - [ ] Backend deployed and live (Render.com)
   - [ ] Frontend deployed and live (Vercel)
   - [ ] Both links work and are accessible
   - [ ] Environment variables configured on hosting platforms

5. **Email Response:**

   - [ ] Reply with: "Project A"
   - [ ] Include live link (frontend URL)
   - [ ] Include GitHub repo link

## Quick Start Commands

**Local Development:**

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Docker (One Command):**

```bash
docker-compose up
```

## Time Estimate

- Backend setup: 2-3 hours
- Frontend setup: 2-3 hours
- Integration & testing: 1-2 hours
- Documentation: 1 hour
- Deployment: 1 hour
- **Total: 7-10 hours** (within 48-hour window)