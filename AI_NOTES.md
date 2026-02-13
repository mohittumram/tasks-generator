# AI Usage Notes

## LLM Provider

**Provider**: Groq API
**Model**: Llama 3.1 8B Instant
**Alternative**: Hugging Face Inference API (meta-llama/Llama-3.1-8B-Instruct)

## Why Groq?

1. **Free Tier**: No credit card required, generous rate limits
2. **Fast Inference**: Optimized for speed, great for real-time task generation
3. **Open Source Models**: Uses Llama 3.1, a high-quality open-source model
4. **Easy Integration**: Simple REST API, similar to OpenAI
5. **Reliability**: Good uptime and consistent performance

## What AI Was Used For

### Code Generation
- Initial project structure and boilerplate
- FastAPI backend setup with database models
- React component structure and routing
- API client service layer
- Docker configuration files

### Prompt Engineering
- LLM service prompt templates for task generation
- JSON response formatting instructions
- Error handling patterns

### Code Review & Debugging
- Validation of API endpoint implementations
- Error handling improvements
- Type checking and schema validation

## What Was Manually Verified

✅ All API endpoints tested manually
✅ Database schema and relationships verified
✅ Frontend-backend integration tested
✅ Error handling scenarios tested
✅ Export functionality verified
✅ Health check endpoints tested
✅ CORS configuration verified
✅ Environment variable handling
✅ Docker setup tested locally

## Manual Customizations

- Enhanced error messages for better UX
- Improved validation logic in forms
- Custom styling and UI improvements
- Export formatting enhancements
- Status page visual indicators

## LLM Integration Details

The app uses Groq's API to call Llama 3.1 8B Instant model. The prompt is carefully structured to:
1. Take feature specifications (goal, users, constraints, risks)
2. Generate structured JSON with user stories and engineering tasks
3. Include logical grouping suggestions
4. Return parseable JSON format

The service handles:
- Rate limiting gracefully
- JSON parsing with fallbacks
- Error handling for API failures
- Provider switching (Groq/Hugging Face)

## Testing

All functionality was manually tested:
- Task generation with various inputs
- Task editing and updates
- Spec loading from history
- Export functionality
- Health check endpoints
- Error scenarios (invalid input, network errors)
