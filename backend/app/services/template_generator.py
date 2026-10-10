import uuid
import hashlib
from typing import List, Dict, Any, Optional
from app.schemas.quest import QuestItem, QuestGenerateRequest
from app.schemas.journal import JournalGenerateRequest

QUEST_CATALOG: List[Dict[str, Any]] = [
    # Campus
    {
        "environments": ["campus", "neighborhood"],
        "interests": ["plants", "textures"],
        "title": "Bark Architecture Survey",
        "description": "Examine three distinct tree trunks on campus or your street. Compare their bark patterns and tactile surfaces.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "botany & textures",
        "observation_prompt": "Are the ridges vertical, crisscrossed, or peeling like paper? Describe their feel against your fingertips.",
        "completion_action": "Record the tree species if known or describe the ridge depth and color of each trunk."
    },
    {
        "environments": ["campus", "neighborhood", "park"],
        "interests": ["birds", "sounds"],
        "title": "Perch & Call Locator",
        "description": "Pause near a quiet courtyard or building corner. Listen intently for 2 minutes to locate bird perches above eye level.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "ornithology & soundscape",
        "observation_prompt": "Can you distinguish between sharp contact chirps and musical territorial songs?",
        "completion_action": "Note where the sounds originated: roof edge, high canopy, or low shrubbery."
    },
    {
        "environments": ["campus", "garden", "neighborhood"],
        "interests": ["insects", "plants"],
        "title": "Micro-Pollinator Watch",
        "description": "Find an open flower bed or wild patch. Observe a single blossoming cluster without moving for 3 minutes.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "entomology",
        "observation_prompt": "Look for small native bees, hoverflies, or ants visiting the blossom center.",
        "completion_action": "Count how many distinct insect visitors touch the bloom within three minutes."
    },
    {
        "environments": ["campus", "park", "neighborhood"],
        "interests": ["weather", "mindful observation"],
        "title": "Sunlight & Microclimate Mapping",
        "description": "Notice how building geometry or tree shade abruptly changes ambient air temperature and wind speed.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "microclimate",
        "observation_prompt": "Feel the temperature difference between the sunny concrete and shaded grass under a tree canopy.",
        "completion_action": "Note the contrast in warmth and how the air moves across your skin."
    },
    # Garden
    {
        "environments": ["garden", "park"],
        "interests": ["plants", "mindful observation"],
        "title": "Leaf Vein Inspection",
        "description": "Pick up a fallen leaf and hold it against the sunlight to reveal its vascular network.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "plant morphology",
        "observation_prompt": "Notice the primary central midrib branching into intricate secondary and tertiary capillary veins.",
        "completion_action": "Describe whether the pattern is parallel (like grasses) or netted (like broadleaf trees)."
    },
    {
        "environments": ["garden", "neighborhood"],
        "interests": ["sounds", "mindful observation"],
        "title": "Acoustic Horizon Sieve",
        "description": "Close your eyes for 90 seconds. Filter out mechanical human noise and focus only on living sounds.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "soundscape ecology",
        "observation_prompt": "Listen for rustling dry foliage, wind through pine needles, or distant wing flaps.",
        "completion_action": "List three distinct organic sounds heard during the silent period."
    },
    {
        "environments": ["garden", "forest trail"],
        "interests": ["plants", "textures"],
        "title": "Moss & Lichen Micro-Forest",
        "description": "Inspect a stone wall, paving edge, or tree base for velvety moss cushions or crustose lichens.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "bryology & lichens",
        "observation_prompt": "Notice the miniature world of damp green leaflets and silver-grey rosettes.",
        "completion_action": "Record the moisture level and the varied shades of emerald, olive, and mint."
    },
    # Park
    {
        "environments": ["park", "forest trail"],
        "interests": ["birds", "sounds"],
        "title": "Canopy Silhouette Tracking",
        "description": "Track birds flitting across the mid-canopy without using binoculars. Observe flight styles (bounding vs glides).",
        "duration_minutes": 7,
        "difficulty": "moderate",
        "category": "avian behavior",
        "observation_prompt": "Do they travel solo or in loose flocks? Notice whether they feed on seeds or glean insects.",
        "completion_action": "Describe the flight path and silhouette outline of at least two bird sightings."
    },
    {
        "environments": ["park", "forest trail"],
        "interests": ["weather", "mindful observation"],
        "title": "Canopy Light Dappling",
        "description": "Look up toward the forest canopy or large park trees to observe how wind moves light patches on the forest floor.",
        "duration_minutes": 6,
        "difficulty": "easy",
        "category": "forest ecology",
        "observation_prompt": "Notice how shadows sway like underwater seaweed in rhythm with wind gusts.",
        "completion_action": "Note the rhythmic swaying cadence and how the sunlight shifts across the ground."
    },
    {
        "environments": ["park", "garden", "forest trail"],
        "interests": ["insects", "textures"],
        "title": "Deadwood Habitat Exploration",
        "description": "Locate a fallen branch or decaying stump safely off the main walkway. Look for decomposition signs.",
        "duration_minutes": 6,
        "difficulty": "moderate",
        "category": "saproxylic ecology",
        "observation_prompt": "Observe beetle boring trails under peeling bark, woodlice, or fungal mycelium threads.",
        "completion_action": "Record the texture of the decaying wood (punky, fibrous, or crumbly)."
    },
    # Forest Trail
    {
        "environments": ["forest trail"],
        "interests": ["plants", "weather", "textures"],
        "title": "Understory Soil Humus Examination",
        "description": "Gently sweep away dry surface leaves on a trail shoulder to reveal the rich, damp humus layer beneath.",
        "duration_minutes": 7,
        "difficulty": "moderate",
        "category": "soil ecology",
        "observation_prompt": "Inhale the rich earthy aroma of geosmin and decomposing leaf litter.",
        "completion_action": "Describe the scent and moisture of the upper soil profile compared to the dry surface."
    },
    {
        "environments": ["forest trail", "park"],
        "interests": ["mindful observation", "sounds"],
        "title": "Slow-Paced Sensory Walk",
        "description": "Walk 50 paces at half your customary walking speed. Focus entirely on ground textures under your footwear.",
        "duration_minutes": 6,
        "difficulty": "easy",
        "category": "mindfulness in nature",
        "observation_prompt": "Feel the difference between compacted clay, gravel crush, and soft needle mulch.",
        "completion_action": "Record which ground surface felt most quiet and supportive underfoot."
    },
    # Neighborhood
    {
        "environments": ["neighborhood", "campus"],
        "interests": ["plants", "mindful observation"],
        "title": "Sidewalk Crack Flora",
        "description": "Find wild pioneer plants thriving in sidewalk expansion joints, curb corners, or pavement fissures.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "urban ecology",
        "observation_prompt": "Look for dandelions, plantains, or shepherd's purse adapting to urban heat and foot traffic.",
        "completion_action": "Count how many resilient species have colonized a single block of pavement."
    },
    {
        "environments": ["neighborhood", "park"],
        "interests": ["weather", "mindful observation"],
        "title": "Cloud Formation & Wind Heading",
        "description": "Find an open patch of sky unobstructed by tall buildings. Observe cloud drift direction and elevation.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "category": "meteorology",
        "observation_prompt": "Are the clouds low cumulus puffs, wispy high cirrus streaks, or a grey overcast deck?",
        "completion_action": "Estimate the wind heading based on cloud motion and flag or leaf rustle."
    }
]

def generate_template_quests(request: QuestGenerateRequest) -> List[QuestItem]:
    """
    Deterministically selects quests that match the user's environment, interests,
    and fit within the requested duration.
    """
    user_env = request.environment.lower()
    user_interests = set(i.lower() for i in request.interests)
    max_minutes = request.available_time

    # Score quests based on match with environment & interests
    scored: List[tuple[int, Dict[str, Any]]] = []
    
    # Hash seed from input parameters for deterministic stable order
    seed_str = f"{user_env}-{max_minutes}-{request.experience_level}-{'-'.join(sorted(request.interests))}"
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)

    for idx, item in enumerate(QUEST_CATALOG):
        score = 0
        # Environment match: strong weight
        if user_env in item["environments"]:
            score += 10
        # Interest match: +5 per matching interest
        matching_interests = sum(1 for intr in item["interests"] if intr in user_interests)
        score += matching_interests * 5
        
        # Accessibility check if requested
        if request.accessibility_preferences and "flat" in request.accessibility_preferences.lower():
            if item.get("difficulty") == "easy":
                score += 3

        # Deterministic tie-breaker
        pseudo_random = (h + idx * 37) % 7
        scored.append((score * 10 + pseudo_random, item))

    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)

    selected_quests: List[QuestItem] = []
    accumulated_duration = 0
    target_count = 3 if max_minutes <= 15 else (4 if max_minutes <= 25 else 4)

    for _, item in scored:
        item_dur = item["duration_minutes"]
        # Ensure total duration does not exceed user's available time
        if accumulated_duration + item_dur <= max_minutes:
            q_id = f"quest_{uuid.uuid4().hex[:8]}"
            quest = QuestItem(
                id=q_id,
                title=item["title"],
                description=item["description"],
                duration_minutes=item_dur,
                difficulty=item.get("difficulty", "easy"),
                category=item["category"],
                observation_prompt=item["observation_prompt"],
                completion_action=item["completion_action"],
                status="pending",
                order_index=len(selected_quests) + 1
            )
            selected_quests.append(quest)
            accumulated_duration += item_dur

            if len(selected_quests) >= 5:
                break
        
        # If we reached 3 quests and approaching time limit, stop
        if len(selected_quests) >= target_count and accumulated_duration >= max_minutes - 3:
            break

    # If by chance fewer than 3 were selected, adjust durations proportionally
    if len(selected_quests) < 3 and len(scored) >= 3:
        # Pick top 3 with scaled duration
        selected_quests = []
        unit_dur = max(2, max_minutes // 3)
        for i in range(3):
            item = scored[i][1]
            q_id = f"quest_{uuid.uuid4().hex[:8]}"
            selected_quests.append(QuestItem(
                id=q_id,
                title=item["title"],
                description=item["description"],
                duration_minutes=unit_dur,
                difficulty=item.get("difficulty", "easy"),
                category=item["category"],
                observation_prompt=item["observation_prompt"],
                completion_action=item["completion_action"],
                status="pending",
                order_index=i + 1
            ))

    return selected_quests

def generate_template_journal(request: JournalGenerateRequest) -> Dict[str, Any]:
    """
    Deterministically crafts a reflective nature journal entry based strictly
    on the user's observations, surprises, learnings, and feelings.
    Never invents observations not provided by the user.
    """
    obs = request.user_observations.strip()
    surp = (request.user_surprises or "").strip()
    learn = (request.user_learnings or "").strip()
    feel = (request.user_feeling or "").strip()

    # Generate a descriptive title
    if surp:
        first_few_words = " ".join(surp.split()[:4]).capitalize()
        title = f"Moments of Wonder: {first_few_words}"
    elif obs:
        first_few_words = " ".join(obs.split()[:4]).capitalize()
        title = f"Field Notes: {first_few_words}"
    else:
        title = "A Quiet Pause in Nature"

    # Assemble narrative strictly grounded in user input
    narrative_paragraphs = []
    narrative_paragraphs.append(
        f"During this outdoor exploration, direct attention was drawn to the living world around. {obs}"
    )

    if surp:
        narrative_paragraphs.append(f"An unexpected discovery emerged along the way: {surp}.")

    if learn:
        narrative_paragraphs.append(f"The walk brought a clear insight: {learn}.")

    if feel:
        narrative_paragraphs.append(f"At the close of the session, the experience left an impression: {feel}.")

    narrative = "\n\n".join(narrative_paragraphs)

    # 3 Observations / takeaways
    takeaways = []
    if obs:
        takeaways.append(f"Observed in detail: {obs[:120]}{'...' if len(obs) > 120 else ''}")
    else:
        takeaways.append("Paused to witness living textures and ambient outdoor rhythm.")

    if surp:
        takeaways.append(f"Surprise noticed: {surp[:120]}{'...' if len(surp) > 120 else ''}")
    elif learn:
        takeaways.append(f"Key insight: {learn[:120]}{'...' if len(learn) > 120 else ''}")
    else:
        takeaways.append("Noticed how shifting pace brings unnoticed details into sharp focus.")

    if feel:
        takeaways.append(f"Personal state: {feel[:120]}{'...' if len(feel) > 120 else ''}")
    elif learn:
        takeaways.append(f"Learned: {learn[:120]}{'...' if len(learn) > 120 else ''}")
    else:
        takeaways.append("Nature presence provided an intentional boundary away from digital screens.")

    # 1 Future suggested activity
    future_activity = (
        "On your next walk, return to the exact same spot at a different hour of the day "
        "to witness how light angle, temperature, and animal activity have transformed."
    )

    return {
        "title": title,
        "narrative": narrative,
        "takeaways": takeaways[:3],
        "future_activity": future_activity
    }
