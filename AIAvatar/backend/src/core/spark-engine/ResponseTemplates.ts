import { SparkStep, SparkSession, EmotionType, FollowThroughLevel } from './types';

// System prompt for the LLM to act as ADHD coach
export const SPARK_SYSTEM_PROMPT = `You are a compassionate and knowledgeable ADHD coach avatar. Your role is to guide users through the SPARK methodology for intentional thinking.

SPARK stands for:
- S: Situation - Understanding the current challenge
- P: Perception - Reframing thoughts and perspectives
- A: Affect - Acknowledging emotions
- R: Response - Taking action
- K: Key Result - Reflecting on progress

Your communication style:
- Warm, encouraging, and non-judgmental
- Concise and clear (ADHD brains appreciate brevity)
- Validating feelings while gently challenging unhelpful thought patterns
- Celebratory of small wins
- Understanding of ADHD-specific challenges (RSD, executive dysfunction, time blindness)

Keep responses under 3 sentences unless detailed guidance is needed.
Never use clinical jargon without explanation.
Always acknowledge effort, not just outcomes.`;

export interface ResponseContext {
  session: SparkSession;
  userInput?: string;
  step: SparkStep;
}

// Templates for generating contextual responses
export class ResponseTemplateEngine {
  // Generate acknowledgment after user shares situation
  getSituationAcknowledgment(context: ResponseContext): string {
    const situation = context.session.data.situation;
    if (!situation) return '';

    const templates = [
      `Thank you for sharing that. Dealing with "${this.extractKeyPhrase(situation.description)}" while your mind is racing with thoughts like "${this.extractKeyPhrase(situation.thoughts)}" sounds really challenging.`,
      `I hear you. It takes courage to articulate what you're going through. The situation you're facing and those thoughts are valid, even if they feel overwhelming right now.`,
      `That's a lot to carry. The good news is that by putting it into words, you've already taken the first step toward working through it.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Generate personalized reframe based on selected question
  getPerceptionReframe(context: ResponseContext): string {
    const perception = context.session.data.perception;
    const situation = context.session.data.situation;

    if (!perception || !situation) return '';

    const reframeResponses: Record<string, string> = {
      "Am I solving today's problem or tomorrow's imaginary one?":
        `Great choice. Let's ground ourselves in the present. Looking at "${this.extractKeyPhrase(situation.description)}", what's the ONE thing you can actually influence today? Not tomorrow's worst-case scenario, just today.`,

      "What would I think about this on my best day?":
        `Love this perspective shift. On your best day, you'd probably see this situation with more clarity and self-compassion. What advice would that version of you give?`,

      "Am I focusing on what I can't control?":
        `This is such an important question for ADHD brains. We often spend energy on things outside our control. What's one small thing in this situation that IS within your power?`,

      "How is my inner critic trying to 'help' me right now?":
        `Ah, the inner critic. It thinks it's protecting you, but often it just amplifies the noise. What's that voice saying, and what would a compassionate friend say instead?`
    };

    return reframeResponses[perception.selectedReframe] ||
      "That's a powerful question to sit with. Take a moment to really consider it.";
  }

  // Generate empathetic response to emotion selection
  getAffectValidation(context: ResponseContext): string {
    const affect = context.session.data.affect;
    if (!affect) return '';

    const emotionResponses: Record<EmotionType, string> = {
      [EmotionType.ANXIOUS]: "Anxiety is your brain's alarm system working overtime. It's trying to protect you, even when the threat isn't as big as it feels.",
      [EmotionType.OVERWHELMED]: "That overwhelming feeling is realyour brain is processing a lot. You don't have to solve everything at once.",
      [EmotionType.FRUSTRATED]: "Frustration often comes when things don't match our expectations. It's okay to feel this way; it means you care.",
      [EmotionType.SAD]: "Sadness is a natural response to difficult situations. Allow yourself to feel it without judgment.",
      [EmotionType.ANGRY]: "Anger is a signal that something matters to you. Let's channel that energy constructively.",
      [EmotionType.CONFUSED]: "Confusion is actually a sign that you're thinking deeply about this. Clarity will come.",
      [EmotionType.HOPELESS]: "Hopelessness can feel heavy, but rememberfeelings aren't facts. This moment isn't forever.",
      [EmotionType.STRESSED]: "Stress is your body's way of saying 'this matters.' Let's find a way to reduce the pressure."
    };

    const intensityComment = this.getIntensityComment(affect.intensity);

    return `${emotionResponses[affect.emotion]} ${intensityComment}`;
  }

  private getIntensityComment(intensity: number): string {
    if (intensity >= 8) {
      return "With that level of intensity, taking action to regulate is really important right now.";
    } else if (intensity >= 5) {
      return "That's a moderate intensitydefinitely worth addressing before it builds.";
    } else {
      return "Even at this level, it's great that you're being proactive about it.";
    }
  }

  // Generate encouragement during response/action phase
  getActionEncouragement(action: string): string {
    const encouragements: Record<string, string> = {
      'Guided breathing exercise':
        "Perfect choice. Breathing exercises directly calm your nervous system. I'll guide you through a simple 4-7-8 pattern. Ready when you are.",
      'Go for a 5-minute walk':
        "Movement is medicine for the ADHD brain. Even 5 minutes of walking can reset your mental state. I'll be here when you get back.",
      'Do jumping jacks for 30 seconds':
        "Quick physical movement is amazing for releasing tension and boosting dopamine. 30 seconds is all you need. Let's do this!",
      'Ask someone for help':
        "Reaching out takes courage, especially with ADHD. You're not a burdenconnection is a strength. Who feels safe to talk to right now?"
    };

    return encouragements[action] || "You've chosen your action. Remember, starting is the hardest part.";
  }

  // Generate session completion summary
  getSessionSummary(context: ResponseContext): string {
    const { session } = context;
    const keyResult = session.data.keyResult;

    if (!keyResult) return '';

    const followThroughResponses: Record<FollowThroughLevel, string> = {
      [FollowThroughLevel.COMPLETED_ALL]:
        "You completed everything! That's incredible. Your insight shows real self-awareness.",
      [FollowThroughLevel.SIGNIFICANT_PROGRESS]:
        "Significant progress is still progress. Celebrate that! What you learned matters more than perfection.",
      [FollowThroughLevel.STARTED_NOT_FINISHED]:
        "You started, and that's huge for ADHD. Starting is often the hardest part. Your reflection shows growth.",
      [FollowThroughLevel.STRUGGLED_TO_BEGIN]:
        "Thank you for being honest. Executive dysfunction is real. The fact that you're reflecting on it is meaningful.",
      [FollowThroughLevel.UNEXPECTED_ISSUE]:
        "Life happens, especially with ADHD. Adaptability is a strength. What you learned today still counts."
    };

    return `${followThroughResponses[keyResult.followThrough]} Your insight"${this.extractKeyPhrase(keyResult.insights)}"is something to carry forward.`;
  }

  // Generate LLM prompt for dynamic responses
  buildLLMPrompt(context: ResponseContext, userMessage: string): string {
    const { session, step } = context;

    let contextualInfo = `Current SPARK step: ${step}\n`;
    contextualInfo += `Session data so far:\n${JSON.stringify(session.data, null, 2)}\n`;
    contextualInfo += `User's latest input: ${userMessage}\n`;

    const stepInstructions: Record<SparkStep, string> = {
      [SparkStep.SITUATION]:
        "Acknowledge what the user shared about their situation. Be empathetic and validate their experience. Keep it brief.",
      [SparkStep.PERCEPTION]:
        "Help the user explore the reframe question they selected. Guide them to see their situation from a new angle. Be curious, not prescriptive.",
      [SparkStep.AFFECT]:
        "Validate the emotion they're feeling. Normalize it in the context of ADHD. Encourage them to take the next action.",
      [SparkStep.RESPONSE]:
        "Encourage them as they prepare for or complete their chosen action. Be supportive and motivating.",
      [SparkStep.KEY_RESULT]:
        "Celebrate their completion of the session. Reflect back their insights. End on an empowering note.",
      [SparkStep.COMPLETED]:
        "Thank them for completing the session. Remind them they can return anytime."
    };

    return `${SPARK_SYSTEM_PROMPT}\n\n---\n\n${contextualInfo}\n\nInstruction: ${stepInstructions[step]}\n\nRespond as the ADHD coach avatar:`;
  }

  private extractKeyPhrase(text: string): string {
    // Extract first 50 characters or first sentence, whichever is shorter
    const firstSentence = text.split(/[.!?]/)[0];
    if (firstSentence.length <= 50) {
      return firstSentence.trim();
    }
    return text.substring(0, 47).trim() + '...';
  }
}
