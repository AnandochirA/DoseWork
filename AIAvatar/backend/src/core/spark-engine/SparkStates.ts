import {
  SparkStep,
  SparkSession,
  AvatarMessage,
  UserInput,
  EmotionType,
  ResponseAction,
  FollowThroughLevel
} from './types';

export interface StateHandler {
  enter(session: SparkSession): AvatarMessage[];
  processInput(session: SparkSession, input: UserInput): SparkSession;
  canTransition(session: SparkSession): boolean;
  getNextStep(): SparkStep;
}

// SITUATION State - "S" in SPARK
export class SituationState implements StateHandler {
  private phase: 'description' | 'thoughts' = 'description';

  enter(session: SparkSession): AvatarMessage[] {
    if (!session.data.situation) {
      session.data.situation = { description: '', thoughts: '' };
    }

    if (this.phase === 'description') {
      return [
        {
          type: 'speech',
          content: "Let's work through this together, one step at a time. I'm here to help you navigate what's on your mind."
        },
        {
          type: 'prompt',
          content: 'Describe the situation:'
        },
        {
          type: 'input',
          content: 'What situation is weighing on you right now?',
          inputType: 'textarea'
        }
      ];
    } else {
      return [
        {
          type: 'speech',
          content: "Thank you for sharing that. Now, let's explore what's happening in your mind."
        },
        {
          type: 'prompt',
          content: 'What thoughts are running through your mind?'
        },
        {
          type: 'input',
          content: 'What thoughts keep coming up about this situation?',
          inputType: 'textarea'
        }
      ];
    }
  }

  processInput(session: SparkSession, input: UserInput): SparkSession {
    if (!session.data.situation) {
      session.data.situation = { description: '', thoughts: '' };
    }

    if (this.phase === 'description') {
      session.data.situation.description = input.value as string;
      this.phase = 'thoughts';
    } else {
      session.data.situation.thoughts = input.value as string;
    }

    return session;
  }

  canTransition(session: SparkSession): boolean {
    return !!(
      session.data.situation?.description &&
      session.data.situation?.thoughts &&
      this.phase === 'thoughts'
    );
  }

  getNextStep(): SparkStep {
    return SparkStep.PERCEPTION;
  }
}

// PERCEPTION State - "P" in SPARK
export class PerceptionState implements StateHandler {
  private reframeQuestions = [
    "Am I solving today's problem or tomorrow's imaginary one?",
    "What would I think about this on my best day?",
    "Am I focusing on what I can't control?",
    "How is my inner critic trying to 'help' me right now?"
  ];

  enter(session: SparkSession): AvatarMessage[] {
    if (!session.data.perception) {
      session.data.perception = { selectedReframe: '', userReflection: '' };
    }

    return [
      {
        type: 'speech',
        content: "Your thoughts are real, but they're not always true. Let's look at this another way."
      },
      {
        type: 'prompt',
        content: 'Choose a reframe question that resonates with you:'
      },
      {
        type: 'options',
        content: 'Select a perspective shift:',
        options: this.reframeQuestions
      }
    ];
  }

  processInput(session: SparkSession, input: UserInput): SparkSession {
    if (!session.data.perception) {
      session.data.perception = { selectedReframe: '', userReflection: '' };
    }

    if (input.type === 'option_select') {
      session.data.perception.selectedReframe = input.value as string;
    } else if (input.type === 'text') {
      session.data.perception.userReflection = input.value as string;
    }

    return session;
  }

  canTransition(session: SparkSession): boolean {
    return !!(
      session.data.perception?.selectedReframe &&
      session.data.perception?.userReflection
    );
  }

  getNextStep(): SparkStep {
    return SparkStep.AFFECT;
  }
}

// AFFECT State - "A" in SPARK
export class AffectState implements StateHandler {
  private emotions: EmotionType[] = [
    EmotionType.ANXIOUS,
    EmotionType.OVERWHELMED,
    EmotionType.FRUSTRATED,
    EmotionType.SAD,
    EmotionType.ANGRY,
    EmotionType.CONFUSED,
    EmotionType.HOPELESS,
    EmotionType.STRESSED
  ];

  enter(session: SparkSession): AvatarMessage[] {
    if (!session.data.affect) {
      session.data.affect = { emotion: EmotionType.STRESSED, intensity: 5 };
    }

    return [
      {
        type: 'speech',
        content: "It's okay to feel whatever you're feeling. Pick what resonates with you right now."
      },
      {
        type: 'prompt',
        content: 'Select your current emotion:'
      },
      {
        type: 'input',
        content: 'How are you feeling?',
        inputType: 'emotion_selector',
        metadata: { emotions: this.emotions }
      },
      {
        type: 'prompt',
        content: 'Rate your emotional intensity (1-10):'
      },
      {
        type: 'input',
        content: 'How intense is this feeling?',
        inputType: 'intensity_slider',
        metadata: { min: 1, max: 10 }
      }
    ];
  }

  processInput(session: SparkSession, input: UserInput): SparkSession {
    if (!session.data.affect) {
      session.data.affect = { emotion: EmotionType.STRESSED, intensity: 5 };
    }

    if (input.type === 'emotion_select') {
      session.data.affect.emotion = input.value as EmotionType;
    } else if (input.type === 'intensity') {
      session.data.affect.intensity = input.value as number;
    }

    return session;
  }

  canTransition(session: SparkSession): boolean {
    return !!(
      session.data.affect?.emotion &&
      session.data.affect?.intensity >= 1 &&
      session.data.affect?.intensity <= 10
    );
  }

  getNextStep(): SparkStep {
    return SparkStep.RESPONSE;
  }
}

// RESPONSE State - "R" in SPARK
export class ResponseState implements StateHandler {
  private actions = [
    {
      id: ResponseAction.BREATHING_EXERCISE,
      label: 'Guided breathing exercise',
      duration: '3 minutes'
    },
    {
      id: ResponseAction.FIVE_MIN_WALK,
      label: 'Go for a 5-minute walk',
      duration: '5 minutes'
    },
    {
      id: ResponseAction.JUMPING_JACKS,
      label: 'Do jumping jacks for 30 seconds',
      duration: '30 seconds'
    },
    {
      id: ResponseAction.ASK_FOR_HELP,
      label: 'Ask someone for help',
      duration: 'Variable'
    }
  ];

  enter(session: SparkSession): AvatarMessage[] {
    if (!session.data.response) {
      session.data.response = {
        selectedAction: ResponseAction.BREATHING_EXERCISE,
        actionCompleted: false
      };
    }

    return [
      {
        type: 'speech',
        content: "You've got this. Pick whatever feels doable for you right nowno judgment."
      },
      {
        type: 'prompt',
        content: 'Choose an action to help you regulate:'
      },
      {
        type: 'options',
        content: 'Select an action:',
        options: this.actions.map((a) => a.label),
        metadata: { actions: this.actions }
      }
    ];
  }

  processInput(session: SparkSession, input: UserInput): SparkSession {
    if (!session.data.response) {
      session.data.response = {
        selectedAction: ResponseAction.BREATHING_EXERCISE,
        actionCompleted: false
      };
    }

    if (input.type === 'option_select') {
      const actionLabel = input.value as string;
      const action = this.actions.find((a) => a.label === actionLabel);
      if (action) {
        session.data.response.selectedAction = action.id;
      }
    } else if (input.type === 'action_complete') {
      session.data.response.actionCompleted = input.value as boolean;
    }

    return session;
  }

  canTransition(session: SparkSession): boolean {
    return session.data.response?.actionCompleted === true;
  }

  getNextStep(): SparkStep {
    return SparkStep.KEY_RESULT;
  }
}

// KEY RESULT State - "K" in SPARK
export class KeyResultState implements StateHandler {
  private followThroughOptions = [
    { id: FollowThroughLevel.COMPLETED_ALL, label: 'Completed everything I planned' },
    { id: FollowThroughLevel.SIGNIFICANT_PROGRESS, label: 'Made significant progress' },
    { id: FollowThroughLevel.STARTED_NOT_FINISHED, label: "Started but didn't finish" },
    { id: FollowThroughLevel.STRUGGLED_TO_BEGIN, label: 'Struggled to begin' },
    { id: FollowThroughLevel.UNEXPECTED_ISSUE, label: 'Something unexpected came up' }
  ];

  enter(session: SparkSession): AvatarMessage[] {
    if (!session.data.keyResult) {
      session.data.keyResult = {
        followThrough: FollowThroughLevel.COMPLETED_ALL,
        insights: ''
      };
    }

    return [
      {
        type: 'speech',
        content: "You made it through. That's something to celebrate. How did it go?"
      },
      {
        type: 'prompt',
        content: 'How did your follow-through go?'
      },
      {
        type: 'options',
        content: 'Select your progress:',
        options: this.followThroughOptions.map((o) => o.label)
      },
      {
        type: 'prompt',
        content: '=¡ Key Insights'
      },
      {
        type: 'input',
        content: 'What did you learn about yourself or your ADHD?',
        inputType: 'textarea'
      }
    ];
  }

  processInput(session: SparkSession, input: UserInput): SparkSession {
    if (!session.data.keyResult) {
      session.data.keyResult = {
        followThrough: FollowThroughLevel.COMPLETED_ALL,
        insights: ''
      };
    }

    if (input.type === 'option_select') {
      const label = input.value as string;
      const option = this.followThroughOptions.find((o) => o.label === label);
      if (option) {
        session.data.keyResult.followThrough = option.id;
      }
    } else if (input.type === 'text') {
      session.data.keyResult.insights = input.value as string;
    }

    return session;
  }

  canTransition(session: SparkSession): boolean {
    return !!(
      session.data.keyResult?.followThrough &&
      session.data.keyResult?.insights
    );
  }

  getNextStep(): SparkStep {
    return SparkStep.COMPLETED;
  }
}

// Factory to create state handlers
export function createStateHandler(step: SparkStep): StateHandler | null {
  switch (step) {
    case SparkStep.SITUATION:
      return new SituationState();
    case SparkStep.PERCEPTION:
      return new PerceptionState();
    case SparkStep.AFFECT:
      return new AffectState();
    case SparkStep.RESPONSE:
      return new ResponseState();
    case SparkStep.KEY_RESULT:
      return new KeyResultState();
    default:
      return null;
  }
}
