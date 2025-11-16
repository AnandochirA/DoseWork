import { SparkStep, SparkSession, StateTransition } from './types';

// Define valid state transitions
export const SPARK_TRANSITIONS: StateTransition[] = [
  {
    from: SparkStep.SITUATION,
    to: SparkStep.PERCEPTION,
    condition: (session) =>
      !!(session.data.situation?.description && session.data.situation?.thoughts)
  },
  {
    from: SparkStep.PERCEPTION,
    to: SparkStep.AFFECT,
    condition: (session) =>
      !!(
        session.data.perception?.selectedReframe &&
        session.data.perception?.userReflection
      )
  },
  {
    from: SparkStep.AFFECT,
    to: SparkStep.RESPONSE,
    condition: (session) =>
      !!(
        session.data.affect?.emotion &&
        session.data.affect?.intensity >= 1 &&
        session.data.affect?.intensity <= 10
      )
  },
  {
    from: SparkStep.RESPONSE,
    to: SparkStep.KEY_RESULT,
    condition: (session) => session.data.response?.actionCompleted === true
  },
  {
    from: SparkStep.KEY_RESULT,
    to: SparkStep.COMPLETED,
    condition: (session) =>
      !!(session.data.keyResult?.followThrough && session.data.keyResult?.insights)
  }
];

export class TransitionManager {
  private transitions: StateTransition[];

  constructor() {
    this.transitions = SPARK_TRANSITIONS;
  }

  canTransition(session: SparkSession): boolean {
    const currentTransition = this.transitions.find(
      (t) => t.from === session.currentStep
    );

    if (!currentTransition) {
      return false;
    }

    if (currentTransition.condition) {
      return currentTransition.condition(session);
    }

    return true;
  }

  getNextStep(session: SparkSession): SparkStep | null {
    const currentTransition = this.transitions.find(
      (t) => t.from === session.currentStep
    );

    if (!currentTransition || !this.canTransition(session)) {
      return null;
    }

    return currentTransition.to;
  }

  getProgress(session: SparkSession): {
    currentStep: number;
    totalSteps: number;
    percentage: number;
  } {
    const stepOrder = [
      SparkStep.SITUATION,
      SparkStep.PERCEPTION,
      SparkStep.AFFECT,
      SparkStep.RESPONSE,
      SparkStep.KEY_RESULT,
      SparkStep.COMPLETED
    ];

    const currentIndex = stepOrder.indexOf(session.currentStep);
    const totalSteps = stepOrder.length - 1; // Exclude COMPLETED from count

    return {
      currentStep: currentIndex + 1,
      totalSteps,
      percentage: Math.round((currentIndex / totalSteps) * 100)
    };
  }

  getStepName(step: SparkStep): string {
    const names: Record<SparkStep, string> = {
      [SparkStep.SITUATION]: 'Situation',
      [SparkStep.PERCEPTION]: 'Perception',
      [SparkStep.AFFECT]: 'Affect',
      [SparkStep.RESPONSE]: 'Response',
      [SparkStep.KEY_RESULT]: 'Key Result',
      [SparkStep.COMPLETED]: 'Completed'
    };

    return names[step] || 'Unknown';
  }

  getStepDescription(step: SparkStep): string {
    const descriptions: Record<SparkStep, string> = {
      [SparkStep.SITUATION]:
        'Understanding your current situation and thoughts',
      [SparkStep.PERCEPTION]:
        'Reframing your perspective with new viewpoints',
      [SparkStep.AFFECT]: 'Acknowledging and rating your emotions',
      [SparkStep.RESPONSE]: 'Taking action to regulate your state',
      [SparkStep.KEY_RESULT]: 'Reflecting on your progress and insights',
      [SparkStep.COMPLETED]: 'Session complete'
    };

    return descriptions[step] || '';
  }

  validateSessionIntegrity(session: SparkSession): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check that we have data for completed steps
    const stepOrder = [
      SparkStep.SITUATION,
      SparkStep.PERCEPTION,
      SparkStep.AFFECT,
      SparkStep.RESPONSE,
      SparkStep.KEY_RESULT
    ];

    const currentIndex = stepOrder.indexOf(session.currentStep);

    for (let i = 0; i < currentIndex; i++) {
      const step = stepOrder[i];
      switch (step) {
        case SparkStep.SITUATION:
          if (
            !session.data.situation?.description ||
            !session.data.situation?.thoughts
          ) {
            errors.push('Situation data incomplete');
          }
          break;
        case SparkStep.PERCEPTION:
          if (
            !session.data.perception?.selectedReframe ||
            !session.data.perception?.userReflection
          ) {
            errors.push('Perception data incomplete');
          }
          break;
        case SparkStep.AFFECT:
          if (!session.data.affect?.emotion || !session.data.affect?.intensity) {
            errors.push('Affect data incomplete');
          }
          break;
        case SparkStep.RESPONSE:
          if (!session.data.response?.selectedAction) {
            errors.push('Response data incomplete');
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
