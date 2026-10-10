import uuid
import logging
from typing import Dict, Any, List
from app.schemas.quest import QuestItem, QuestGenerateRequest, QuestGenerateResponse
from app.schemas.journal import JournalGenerateRequest
from app.services.ollama_client import OllamaClient
from app.services.template_generator import generate_template_quests, generate_template_journal
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.client = ollama_client or OllamaClient()

    async def get_status(self) -> Dict[str, Any]:
        """Check Ollama connectivity and model availability."""
        conn_info = await self.client.check_connectivity()
        is_ready = conn_info["connected"] and conn_info["model_available"]
        
        if is_ready:
            msg = f"Ready. Local model '{self.client.model}' active."
        elif conn_info["connected"]:
            msg = f"Ollama is connected, but model '{self.client.model}' is not installed locally. Run: ollama pull {self.client.model}"
        else:
            msg = "Ollama is currently offline. Operating in deterministic offline template mode."

        return {
            "connected": conn_info["connected"],
            "model_available": conn_info["model_available"],
            "configured_model": self.client.model,
            "installed_models": conn_info["installed_models"],
            "fallback_mode": not is_ready,
            "message": msg
        }

    async def generate_quests(self, request: QuestGenerateRequest) -> QuestGenerateResponse:
        """
        Generates 3 to 5 nature exploration missions using Ollama,
        with automated fallback to deterministic nature templates.
        """
        status = await self.get_status()
        
        # If Ollama is ready, attempt local inference
        if not status["fallback_mode"]:
            system_prompt = (
                "You are WildQuest AI, an outdoor exploration companion. "
                "You create safe, mindful, nature-discovery missions that encourage sensory awareness. "
                "CRITICAL PRINCIPLE: Never claim to identify plants, birds, or species with certainty. "
                "Encourage careful observation, textures, sounds, and patterns instead. "
                "Return strictly valid JSON with key 'quests', containing a list of 3 to 5 quest objects."
            )

            prompt = (
                f"Generate a customized set of 3 to 5 outdoor exploration missions for:\n"
                f"- Environment: {request.environment}\n"
                f"- Total available time: {request.available_time} minutes\n"
                f"- Experience level: {request.experience_level}\n"
                f"- Interests: {', '.join(request.interests)}\n"
                f"- Accessibility constraints: {request.accessibility_preferences or 'None'}\n\n"
                f"STRICT DURATION RULE:\n"
                f"The sum of all quests' duration_minutes MUST NOT EXCEED {request.available_time} minutes.\n\n"
                f"Output strictly JSON with format:\n"
                f"{{\n"
                f'  "quests": [\n'
                f"    {{\n"
                f'      "title": "Short title (under 50 chars)",\n'
                f'      "description": "Clear step-by-step outdoor instruction",\n'
                f'      "duration_minutes": 5,\n'
                f'      "difficulty": "easy",\n'
                f'      "category": "botany / sounds / birds / etc",\n'
                f'      "observation_prompt": "What sensory detail to notice",\n'
                f'      "completion_action": "Action to finish the quest"\n'
                f"    }}\n"
                f"  ]\n"
                f"}}"
            )

            try:
                result = await self.client.generate_json(prompt=prompt, system_prompt=system_prompt)
                if result and "quests" in result and isinstance(result["quests"], list) and len(result["quests"]) >= 3:
                    parsed_quests: List[QuestItem] = []
                    total_dur = 0
                    for idx, q_raw in enumerate(result["quests"]):
                        try:
                            # Clamp duration if needed
                            d_mins = max(2, min(int(q_raw.get("duration_minutes", 5)), request.available_time))
                            q = QuestItem(
                                id=f"quest_{uuid.uuid4().hex[:8]}",
                                title=str(q_raw.get("title", "Nature Exploration")),
                                description=str(q_raw.get("description", "Observe your surroundings quietly.")),
                                duration_minutes=d_mins,
                                difficulty=str(q_raw.get("difficulty", "easy")),
                                category=str(q_raw.get("category", request.interests[0])),
                                observation_prompt=str(q_raw.get("observation_prompt", "Notice the small details.")),
                                completion_action=str(q_raw.get("completion_action", "Reflect on this observation.")),
                                status="pending",
                                order_index=idx + 1
                            )
                            if total_dur + q.duration_minutes <= request.available_time:
                                parsed_quests.append(q)
                                total_dur += q.duration_minutes
                        except Exception as parse_item_err:
                            logger.warning(f"Failed to parse AI quest item: {parse_item_err}")

                    # If we got at least 3 valid quests within duration, return AI result
                    if len(parsed_quests) >= 3:
                        return QuestGenerateResponse(
                            quests=parsed_quests,
                            total_duration_minutes=total_dur,
                            fallback_used=False,
                            source="local_model",
                            model_name=self.client.model,
                            message=f"Generated successfully using local {self.client.model}"
                        )
            except Exception as e:
                logger.warning(f"AI quest generation failed, engaging fallback: {e}")

        # Fallback to deterministic template generator
        template_quests = generate_template_quests(request)
        total_time = sum(q.duration_minutes for q in template_quests)
        return QuestGenerateResponse(
            quests=template_quests,
            total_duration_minutes=total_time,
            fallback_used=True,
            source="deterministic_template",
            model_name="deterministic_nature_catalog",
            message="Generated using deterministic nature exploration templates (offline mode)."
        )

    async def generate_journal(self, request: JournalGenerateRequest) -> Dict[str, Any]:
        """
        Turns the user's field observations into a thoughtful, grounded journal entry.
        Never hallucinates observations that the user did not supply.
        """
        status = await self.get_status()

        if not status["fallback_mode"]:
            system_prompt = (
                "You are WildQuest AI, an outdoor nature journaling companion. "
                "Synthesize the user's outdoor notes into an elegant, grounded reflection. "
                "CRITICAL TRUTHFULNESS RULE: Base your narrative strictly on what the user actually recorded. "
                "DO NOT invent observations, sightings, bird species, or feelings the user did not write. "
                "Return strictly valid JSON with keys: 'title', 'narrative', 'takeaways' (list of 3 strings), and 'future_activity' (1 string)."
            )

            prompt = (
                f"Field Notes to reflect upon:\n"
                f"- Observations: {request.user_observations}\n"
                f"- Surprises noticed: {request.user_surprises or 'None recorded'}\n"
                f"- Learnings/Insights: {request.user_learnings or 'None recorded'}\n"
                f"- Personal feeling: {request.user_feeling or 'Not specified'}\n\n"
                f"Output JSON format:\n"
                f"{{\n"
                f'  "title": "A short, resonant title",\n'
                f'  "narrative": "A cohesive reflection strictly grounded in user notes (1-2 paragraphs)",\n'
                f'  "takeaways": ["Point 1", "Point 2", "Point 3"],\n'
                f'  "future_activity": "One practical suggestion for the next nature walk"\n'
                f"}}"
            )

            try:
                result = await self.client.generate_json(prompt=prompt, system_prompt=system_prompt)
                if (
                    result
                    and "title" in result
                    and "narrative" in result
                    and "takeaways" in result
                    and isinstance(result.get("takeaways"), list)
                    and len(result["takeaways"]) >= 3
                    and "future_activity" in result
                ):
                    return {
                        "title": str(result["title"]),
                        "narrative": str(result["narrative"]),
                        "takeaways": [str(t) for t in result["takeaways"][:3]],
                        "future_activity": str(result["future_activity"]),
                        "fallback_used": False
                    }
            except Exception as e:
                logger.warning(f"AI journal reflection failed, engaging fallback: {e}")

        # Deterministic fallback
        res = generate_template_journal(request)
        res["fallback_used"] = True
        return res
