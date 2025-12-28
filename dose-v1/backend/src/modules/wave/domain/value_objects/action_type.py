"""
ActionType Value Object - Available quick actions
"""

from enum import Enum

class ActionType(Enum):
    """Available quick actions with metadata."""
    
    # Original 8
    BREATHING_EXERCISE = "breathing_exercise"
    FRESH_AIR = "fresh_air"
    DRINK_WATER = "drink_water"
    JUMPING_JACKS = "jumping_jacks"
    LISTEN_MUSIC = "listen_music"
    TEXT_SOMEONE = "text_someone"
    GRATITUDE_LIST = "gratitude_list"
    TIDY_SPACE = "tidy_space"
    
    # New 5
    STRETCHING = "stretching"
    MUSCLE_RELAXATION = "muscle_relaxation"
    GROUNDING_5_4_3_2_1 = "grounding_5_4_3_2_1"
    CREATIVE_DOODLE = "creative_doodle"
    PHOTO_GRATITUDE = "photo_gratitude"

    def get_metadata(self) -> dict:
        """Get action metadata including input requirements."""
        metadata_map = {
            # ========== ACTION 1: BREATHING ==========
            self.BREATHING_EXERCISE: {
                "emoji": "🫁",
                "name": "Guided breathing exercise",
                "duration_minutes": 1,
                "description": "Box breathing: inhale 4, hold 4, exhale 4",
                "requires_input": False,
                "input_type": None,
                "input_prompt": None
            },
            
            # ========== ACTION 2: FRESH AIR ==========
            self.FRESH_AIR: {
                "emoji": "✅",
                "name": "Step outside for fresh air",
                "duration_minutes": 2,
                "description": "Take a short walk or stand outside",
                "requires_input": True,
                "input_type": "text",
                "input_prompt": "What did you notice outside? (optional)",
                "input_placeholder": "e.g., 'Fresh breeze', 'Birds singing', 'Sunshine'...",
                "input_required": False,
                "input_max_length": 200
            },
            
            # ========== ACTION 3: DRINK WATER ==========
            self.DRINK_WATER: {
                "emoji": "💧",
                "name": "Drink a glass of water",
                "duration_minutes": 1,
                "description": "Hydrate mindfully",
                "requires_input": True,
                "input_type": "counter",
                "input_prompt": "How many glasses did you drink?",
                "input_min": 1,
                "input_max": 5,
                "input_default": 1,
                "input_unit": "glasses"
            },
            
            # ========== ACTION 4: JUMPING JACKS ==========
            self.JUMPING_JACKS: {
                "emoji": "🏃",
                "name": "Do 10 jumping jacks",
                "duration_minutes": 1,
                "description": "Quick burst of movement",
                "requires_input": True,
                "input_type": "counter",
                "input_prompt": "How many jumping jacks did you complete?",
                "input_min": 1,
                "input_max": 100,
                "input_default": 10,
                "input_unit": "jumping jacks"
            },
            
            # ========== ACTION 5: LISTEN MUSIC ==========
            self.LISTEN_MUSIC: {
                "emoji": "🎵",
                "name": "Listen to one favorite song",
                "duration_minutes": 3,
                "description": "Put on a song that lifts your mood",
                "requires_input": True,
                "input_type": "text",
                "input_prompt": "What song did you listen to? (optional)",
                "input_placeholder": "e.g., 'Happy by Pharrell', 'Your favorite song'...",
                "input_required": False,
                "input_max_length": 100
            },
            
            # ========== ACTION 6: TEXT SOMEONE ==========
            self.TEXT_SOMEONE: {
                "emoji": "💌",
                "name": "Text someone you care about",
                "duration_minutes": 2,
                "description": "Reach out to a friend or loved one",
                "requires_input": True,
                "input_type": "text",
                "input_prompt": "Who did you reach out to? (optional)",
                "input_placeholder": "e.g., 'Mom', 'Best friend', 'A friend'...",
                "input_required": False,
                "input_max_length": 50
            },
            
            # ========== ACTION 7: GRATITUDE LIST ==========
            self.GRATITUDE_LIST: {
                "emoji": "📝",
                "name": "Write down 3 things going well",
                "duration_minutes": 3,
                "description": "Focus on positive aspects of your day",
                "requires_input": True,
                "input_type": "text_list",
                "input_prompt": "List 3 things you're grateful for:",
                "input_count": 3,
                "input_placeholder": "Something you're grateful for...",
                "input_max_length": 150,
                "input_labels": [
                    "First thing:",
                    "Second thing:",
                    "Third thing:"
                ]
            },
            
            # ========== ACTION 8: TIDY SPACE ==========
            self.TIDY_SPACE: {
                "emoji": "✅",
                "name": "Tidy up your immediate space",
                "duration_minutes": 5,
                "description": "Organize your desk or immediate area",
                "requires_input": True,
                "input_type": "checklist",
                "input_prompt": "What did you organize?",
                "input_options": [
                    "Desk surface",
                    "Papers/documents",
                    "Coffee cup/dishes",
                    "Trash/recycling",
                    "Cables/electronics",
                    "Books/supplies",
                    "Floor area",
                    "Other items"
                ],
                "input_min_selections": 1
            },
            
            # ========== ACTION 9: STRETCHING ==========
            self.STRETCHING: {
                "emoji": "🧘",
                "name": "Gentle stretching routine",
                "duration_minutes": 2,
                "description": "Stretch neck, shoulders, and back",
                "requires_input": True,
                "input_type": "checklist",
                "input_prompt": "Which areas did you stretch?",
                "input_options": [
                    "Neck",
                    "Shoulders",
                    "Upper back",
                    "Lower back",
                    "Arms",
                    "Wrists/hands",
                    "Legs",
                    "Ankles/feet"
                ],
                "input_min_selections": 1
            },
            
            # ========== ACTION 10: MUSCLE RELAXATION ==========
            self.MUSCLE_RELAXATION: {
                "emoji": "🌈",
                "name": "Progressive muscle relaxation",
                "duration_minutes": 3,
                "description": "Tense and release muscle groups",
                "requires_input": True,
                "input_type": "checklist",
                "input_prompt": "Which muscle groups did you work with?",
                "input_options": [
                    "Face (jaw, forehead)",
                    "Neck and shoulders",
                    "Arms and hands",
                    "Chest and stomach",
                    "Back",
                    "Hips and buttocks",
                    "Legs and feet"
                ],
                "input_min_selections": 1
            },
            
            # ========== ACTION 11: GROUNDING 5-4-3-2-1 ==========
            self.GROUNDING_5_4_3_2_1: {
                "emoji": "🌟",
                "name": "5-4-3-2-1 Grounding technique",
                "duration_minutes": 2,
                "description": "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
                "requires_input": True,
                "input_type": "grounding_5_4_3_2_1",
                "input_prompt": "Name the things you notice:",
                "input_structure": {
                    "see": {
                        "count": 5,
                        "label": "5 things you can SEE",
                        "placeholder": "Something you see..."
                    },
                    "hear": {
                        "count": 4,
                        "label": "4 things you can HEAR",
                        "placeholder": "A sound you hear..."
                    },
                    "touch": {
                        "count": 3,
                        "label": "3 things you can TOUCH/FEEL",
                        "placeholder": "Something you can touch..."
                    },
                    "smell": {
                        "count": 2,
                        "label": "2 things you can SMELL",
                        "placeholder": "A scent you smell..."
                    },
                    "taste": {
                        "count": 1,
                        "label": "1 thing you can TASTE",
                        "placeholder": "Something you taste..."
                    }
                }
            },
            
            # ========== ACTION 12: CREATIVE DOODLE ==========
            self.CREATIVE_DOODLE: {
                "emoji": "🎨",
                "name": "Creative doodling",
                "duration_minutes": 3,
                "description": "Draw or color without judgment",
                "requires_input": True,
                "input_type": "text",
                "input_prompt": "What did you draw or doodle? (optional)",
                "input_placeholder": "e.g., 'Abstract shapes', 'Flowers', 'Patterns'...",
                "input_required": False,
                "input_max_length": 100
            },
            
            # ========== ACTION 13: PHOTO GRATITUDE ==========
            self.PHOTO_GRATITUDE: {
                "emoji": "📸",
                "name": "Photo gratitude walk",
                "duration_minutes": 2,
                "description": "Take 3 photos of things you appreciate",
                "requires_input": True,
                "input_type": "text_list",
                "input_prompt": "What did you photograph?",
                "input_count": 3,
                "input_placeholder": "Describe what you photographed...",
                "input_max_length": 100,
                "input_labels": [
                    "Photo 1:",
                    "Photo 2:",
                    "Photo 3:"
                ]
            }
        }
        
        return metadata_map.get(self, {
            "emoji": "✨",
            "name": "Unknown action",
            "duration_minutes": 1,
            "description": "",
            "requires_input": False,
            "input_type": None
        })
    
    @classmethod
    def from_string(cls, value: str) -> "ActionType":
        """Create ActionType from string value."""
        for action in cls:
            if action.value == value:
                return action
        raise ValueError(f"Invalid action type: {value}")

    def __str__(self) -> str:
        return self.value

    @classmethod
    def all_actions(cls) -> list[dict]:
        """Get all actions with metadata."""
        return [
            {
                "value": action.value,
                **action.get_metadata()
            }
            for action in cls
        ]