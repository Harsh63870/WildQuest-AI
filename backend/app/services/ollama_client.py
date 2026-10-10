import json
import httpx
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
        max_retries: Optional[int] = None
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.timeout = timeout or settings.OLLAMA_TIMEOUT_SECONDS
        self.max_retries = max_retries or settings.OLLAMA_MAX_RETRIES

    async def check_connectivity(self) -> Dict[str, Any]:
        """
        Check if the local Ollama instance is accessible and whether
        the configured model is available locally.
        """
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    models_list: List[str] = [
                        m.get("name", "") for m in data.get("models", [])
                    ]
                    # Model match can be exact or match prefix (e.g., qwen2.5:3b or qwen2.5:3b-instruct)
                    model_found = any(
                        self.model.lower() in m.lower() or m.lower().startswith(self.model.lower())
                        for m in models_list
                    )
                    return {
                        "connected": True,
                        "model_available": model_found,
                        "configured_model": self.model,
                        "installed_models": models_list,
                        "error": None
                    }
                else:
                    return {
                        "connected": False,
                        "model_available": False,
                        "configured_model": self.model,
                        "installed_models": [],
                        "error": f"Ollama HTTP {response.status_code}"
                    }
        except httpx.ConnectError:
            return {
                "connected": False,
                "model_available": False,
                "configured_model": self.model,
                "installed_models": [],
                "error": "Ollama service is not running on localhost:11434"
            }
        except Exception as e:
            logger.debug(f"Ollama connectivity check failed: {e}")
            return {
                "connected": False,
                "model_available": False,
                "configured_model": self.model,
                "installed_models": [],
                "error": str(e)
            }

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        override_model: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Invoke Ollama /api/generate with JSON format enforcement,
        bounded retries, and strict timeouts.
        """
        target_model = override_model or self.model
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        if system_prompt:
            payload["system"] = system_prompt

        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        raw_response_text = data.get("response", "")
                        # Parse returned JSON
                        parsed = json.loads(raw_response_text)
                        return parsed
                    else:
                        logger.warning(
                            f"Ollama returned HTTP {response.status_code}: {response.text}"
                        )
                        last_error = f"HTTP {response.status_code}"
            except (httpx.TimeoutException, httpx.ConnectError) as net_err:
                logger.warning(f"Ollama attempt {attempt + 1} failed: {net_err}")
                last_error = str(net_err)
            except json.JSONDecodeError as json_err:
                logger.warning(f"Failed to parse Ollama JSON response: {json_err}")
                last_error = "Malformed JSON from model"
                break  # Don't retry if the model produced unparseable JSON
            except Exception as e:
                logger.warning(f"Unexpected error calling Ollama: {e}")
                last_error = str(e)
                break

        logger.info(f"Ollama generation fallback triggered. Reason: {last_error}")
        return None
