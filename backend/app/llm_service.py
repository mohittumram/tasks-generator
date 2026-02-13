import os
import json
from typing import Dict, List, Optional
import requests


class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "groq").lower()
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
        
    def _call_groq(self, prompt: str) -> str:
        """Call Groq API with Llama 3 model"""
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not set")
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that generates structured task lists for software projects. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000,
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    
    def _call_huggingface(self, prompt: str) -> str:
        """Call Hugging Face Inference API"""
        if not self.huggingface_api_key:
            raise ValueError("HUGGINGFACE_API_KEY not set")
        
        # Using a good open-source model
        model = "meta-llama/Llama-3.1-8B-Instruct"
        url = f"https://api-inference.huggingface.co/models/{model}"
        headers = {
            "Authorization": f"Bearer {self.huggingface_api_key}",
            "Content-Type": "application/json"
        }
        
        # Format prompt for Llama
        formatted_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a helpful assistant that generates structured task lists for software projects. Always respond with valid JSON only.<|eot_id|><|start_header_id|>user<|end_header_id|>

{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""
        
        payload = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": 2000,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        # Handle different response formats
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "")
        elif isinstance(result, dict):
            return result.get("generated_text", json.dumps(result))
        else:
            return json.dumps(result)
    
    def generate_tasks(self, goal: str, users: str, constraints: Optional[str] = None, 
                      risks: Optional[str] = None, template: Optional[str] = None) -> Dict:
        """Generate tasks from feature specification"""
        
        # Build the prompt
        prompt = self._build_prompt(goal, users, constraints, risks, template)
        
        try:
            # Call the appropriate LLM
            if self.provider == "groq" and self.groq_api_key:
                response_text = self._call_groq(prompt)
            elif self.provider == "huggingface" and self.huggingface_api_key:
                response_text = self._call_huggingface(prompt)
            else:
                # Fallback: try Groq first, then Hugging Face
                if self.groq_api_key:
                    response_text = self._call_groq(prompt)
                elif self.huggingface_api_key:
                    response_text = self._call_huggingface(prompt)
                else:
                    raise ValueError("No LLM API key configured")
            
            # Parse JSON response
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code blocks
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    result = json.loads(response_text[json_start:json_end].strip())
                elif "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    result = json.loads(response_text[json_start:json_end].strip())
                else:
                    raise ValueError("Could not parse JSON from LLM response")
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"LLM API error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error generating tasks: {str(e)}")
    
    def _build_prompt(self, goal: str, users: str, constraints: Optional[str], 
                     risks: Optional[str], template: Optional[str]) -> str:
        """Build the prompt for task generation"""
        
        prompt = f"""Generate a comprehensive task breakdown for the following feature specification.

Goal: {goal}

Target Users: {users}
"""
        
        if constraints:
            prompt += f"\nConstraints: {constraints}"
        
        if risks:
            prompt += f"\nRisks and Unknowns: {risks}"
        
        if template:
            prompt += f"\nTemplate Type: {template}"
        
        prompt += """

Please generate a JSON response with the following structure:
{
  "user_stories": [
    {
      "title": "As a [user type], I want to [action] so that [benefit]",
      "description": "Detailed description of the user story"
    }
  ],
  "engineering_tasks": [
    {
      "title": "Task title",
      "description": "Detailed description of the engineering task"
    }
  ],
  "groups": [
    {
      "name": "Group name",
      "tasks": ["task_title_1", "task_title_2"]
    }
  ]
}

Focus on:
- Clear, actionable user stories
- Specific engineering tasks (backend, frontend, database, testing, etc.)
- Logical grouping of related tasks
- Consider dependencies and order

Return ONLY valid JSON, no additional text."""
        
        return prompt
    
    def test_connection(self) -> Dict[str, bool]:
        """Test connection to LLM API"""
        try:
            test_prompt = "Respond with JSON: {\"status\": \"ok\"}"
            if self.provider == "groq" and self.groq_api_key:
                self._call_groq(test_prompt)
                return {"connected": True, "provider": "groq"}
            elif self.provider == "huggingface" and self.huggingface_api_key:
                self._call_huggingface(test_prompt)
                return {"connected": True, "provider": "huggingface"}
            elif self.groq_api_key:
                self._call_groq(test_prompt)
                return {"connected": True, "provider": "groq"}
            elif self.huggingface_api_key:
                self._call_huggingface(test_prompt)
                return {"connected": True, "provider": "huggingface"}
            else:
                return {"connected": False, "error": "No API key configured"}
        except Exception as e:
            return {"connected": False, "error": str(e)}
