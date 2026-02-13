# Prompts Used for Development

This document records all prompts used during the development of this application. Responses and API keys are not included.

## Initial Setup

### Backend Structure
- "Create a FastAPI backend structure for a task generator app with SQLite database"
- "Set up database models for Spec, Task, and TaskGroup with SQLAlchemy"
- "Create Pydantic schemas for request/response validation"

### Frontend Structure
- "Set up React + Vite frontend with Tailwind CSS and routing"
- "Create API service layer for FastAPI backend communication"

## LLM Integration

### Groq API Client
- "Create a Groq API client in Python to call Llama 3 model"
- "Implement prompt template for generating user stories and engineering tasks from feature specs"
- "Handle JSON response parsing with error handling"

### Prompt Engineering
- "Create a prompt that takes goal, users, constraints, and risks, and generates structured JSON with user stories and engineering tasks"
- "Include logical grouping of tasks in the prompt"
- "Ensure the LLM returns valid JSON format"

## Feature Development

### Task Generation Endpoint
- "Create a FastAPI endpoint that takes a feature spec and generates tasks using Groq API"
- "Handle LLM response parsing and database storage"
- "Implement error handling for LLM API failures"

### Task Management
- "Create endpoints for updating tasks: reorder, edit, and group"
- "Implement task grouping functionality"

### Export Functionality
- "Create an endpoint to export tasks as markdown text"
- "Format tasks with groups and descriptions"

## Frontend Components

### Form Component
- "Build a React form component for feature input with validation"
- "Add template selector with pre-filled constraints"
- "Implement risks and unknowns field"

### Task List Component
- "Create a task list component with edit functionality"
- "Implement inline editing for tasks"
- "Add group assignment UI"

### Status Page
- "Build a status page that displays health check results"
- "Show visual indicators for backend, database, and LLM status"

## Integration

### CORS Configuration
- "Set up CORS in FastAPI to allow requests from Vercel frontend"

### Health Check
- "Create a health check endpoint that tests backend, database, and LLM API connection"

## Deployment

### Docker Setup
- "Create a Dockerfile for FastAPI backend"
- "Create a Dockerfile for React frontend"
- "Set up docker-compose.yml to run both backend and frontend"

### Error Handling
- "Improve error handling for empty inputs, API errors, and network issues"
- "Add user-friendly error messages"

## Code Quality

### Validation
- "Add input validation for form fields"
- "Implement proper error handling in API calls"

### UI/UX
- "Improve loading states and user feedback"
- "Add success/error notifications"
