# Tasks Generator

A web application that generates user stories and engineering tasks from feature specifications using AI.

**Project**: Problem statement A (Tasks Generator — mini planning tool)

---

## Submission

- **Live app**: https://tasks-generator-six.vercel.app
- **GitHub repo**: https://github.com/mohittumram/tasks-generator

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment (Render + Vercel).

---

## Features

- **Feature Input Form**: Enter goal, target users, constraints, and risks
- **AI Task Generation**: Automatically generates user stories and engineering tasks using free LLM APIs (Groq/Hugging Face)
- **Task Management**: Edit, reorder, and group tasks
- **Export**: Copy or download tasks as markdown
- **Spec History**: View and load the last 5 generated specs
- **Status Page**: Monitor backend, database, and LLM connection health
- **Templates**: Pre-configured templates for Mobile App, Web App, and Internal Tool

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Database**: SQLite
- **LLM**: Groq API (free) or Hugging Face Inference API (free)
- **Styling**: Tailwind CSS

## Prerequisites

- Python 3.11+
- Node.js 18+
- Free API key from [Groq](https://console.groq.com) or [Hugging Face](https://huggingface.co)

## Getting Started

### Option 1: Docker (Recommended - One Command)

```bash
# Copy backend/.env.example to backend/.env and set your API key, then run:
docker-compose up
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (or HUGGINGFACE_API_KEY)

# Run the server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install

# Create .env file (optional, defaults to localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env

# Run the dev server
npm run dev
```

## Environment Variables

### Backend (.env)

```env
GROQ_API_KEY=your_groq_api_key_here
# OR
HUGGINGFACE_API_KEY=your_hf_api_key_here

DATABASE_URL=sqlite:///./tasks.db
FRONTEND_URL=http://localhost:5173
LLM_PROVIDER=groq  # or 'huggingface'
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Getting Free API Keys

### Groq API (Recommended)

1. Go to https://console.groq.com
2. Sign up (free, no credit card required)
3. Navigate to API Keys
4. Create a new API key
5. Copy and use in your `.env` file

### Hugging Face (Alternative)

1. Go to https://huggingface.co
2. Sign up (free)
3. Go to Settings > Access Tokens
4. Create a new token
5. Copy and use in your `.env` file

## API Endpoints

- `POST /api/generate` - Generate tasks from feature spec
- `GET /api/specs` - Get last 5 specs
- `GET /api/specs/{id}` - Get specific spec with tasks
- `PUT /api/specs/{id}/tasks` - Update tasks (reorder, edit, group)
- `GET /api/specs/{id}/export` - Export spec as markdown
- `GET /api/health` - Health check (backend, DB, LLM)

## Project Structure

```
tasks-generator/
├── backend/
│   ├── .env.example        # Copy to .env and set API keys (do not commit .env)
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── llm_service.py   # LLM integration
│   │   └── routes/          # API routes
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── services/        # API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## What's Done

✅ Complete backend API with FastAPI
✅ LLM integration with Groq and Hugging Face
✅ React frontend with modern UI
✅ Task generation from feature specs
✅ Task editing, reordering, and grouping
✅ Export functionality (copy/download)
✅ Spec history (last 5)
✅ Status page with health checks
✅ Templates system (Mobile/Web/Internal)
✅ Risks and unknowns section
✅ Error handling and validation
✅ Docker setup for easy deployment

## What's Not Done

- Drag-and-drop reordering (UI ready, backend supports it)
- Advanced task dependencies
- User authentication
- Persistent groups across sessions (groups are saved but UI could be improved)
- Real-time collaboration

## Deployment

### Backend (Render.com)

1. Connect your GitHub repo
2. Create a new Web Service
3. Set build command: `cd backend && pip install -r requirements.txt`
4. Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (GROQ_API_KEY, etc.)

### Frontend (Vercel)

1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

**Note**: Render free tier spins down after 15 minutes of inactivity. First request may be slow.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
