import { v4 as uuidv4 } from 'uuid';
import {
  SparkStep,
  SparkSession,
  SparkSessionData,
  AvatarMessage,
  UserInput,
  SessionEvent
} from './types';
import { createStateHandler, StateHandler } from './SparkStates';
import { TransitionManager } from './TransitionRules';
import { ResponseTemplateEngine, ResponseContext } from './ResponseTemplates';

export interface StateMachineConfig {
  enableLLM?: boolean;
  enableAnalytics?: boolean;
  sessionTimeout?: number; // in minutes
}

export interface StateMachineResult {
  session: SparkSession;
  messages: AvatarMessage[];
  transitioned: boolean;
  completed: boolean;
  events: SessionEvent[];
}

export class SparkStateMachine {
  private session: SparkSession;
  private currentHandler: StateHandler | null;
  private transitionManager: TransitionManager;
  private templateEngine: ResponseTemplateEngine;
  private config: StateMachineConfig;
  private eventLog: SessionEvent[];

  constructor(userId: string, config: StateMachineConfig = {}) {
    this.config = {
      enableLLM: true,
      enableAnalytics: true,
      sessionTimeout: 30,
      ...config
    };

    this.session = this.createNewSession(userId);
    this.currentHandler = createStateHandler(this.session.currentStep);
    this.transitionManager = new TransitionManager();
    this.templateEngine = new ResponseTemplateEngine();
    this.eventLog = [];
  }

  private createNewSession(userId: string): SparkSession {
    return {
      id: uuidv4(),
      odlukId: userId,
      currentStep: SparkStep.SITUATION,
      data: {},
      startedAt: new Date(),
      llmContext: []
    };
  }

  // Initialize session and get first messages
  start(): StateMachineResult {
    const messages = this.currentHandler?.enter(this.session) || [];

    this.logEvent({
      type: 'state_change',
      step: this.session.currentStep,
      data: { action: 'session_started' },
      timestamp: new Date()
    });

    return {
      session: this.session,
      messages,
      transitioned: false,
      completed: false,
      events: this.eventLog
    };
  }

  // Process user input and advance state if possible
  processInput(input: UserInput): StateMachineResult {
    if (!this.currentHandler) {
      throw new Error('No active state handler');
    }

    // Log user input event
    this.logEvent({
      type: 'user_input',
      step: this.session.currentStep,
      data: input,
      timestamp: new Date()
    });

    // Update session with input
    this.session = this.currentHandler.processInput(this.session, input);

    // Check if we can transition to next state
    const canTransition = this.currentHandler.canTransition(this.session);
    let messages: AvatarMessage[] = [];
    let transitioned = false;
    let completed = false;

    if (canTransition) {
      // Generate contextual response before transitioning
      const context: ResponseContext = {
        session: this.session,
        step: this.session.currentStep
      };

      const acknowledgment = this.getContextualAcknowledgment(context);
      if (acknowledgment) {
        messages.push({
          type: 'speech',
          content: acknowledgment
        });
      }

      // Transition to next state
      const nextStep = this.currentHandler.getNextStep();
      this.session.currentStep = nextStep;
      this.currentHandler = createStateHandler(nextStep);

      this.logEvent({
        type: 'state_change',
        step: nextStep,
        data: { from: context.step, to: nextStep },
        timestamp: new Date()
      });

      transitioned = true;

      // Check if session is complete
      if (nextStep === SparkStep.COMPLETED) {
        completed = true;
        this.session.completedAt = new Date();

        // Generate completion summary
        const summary = this.templateEngine.getSessionSummary({
          session: this.session,
          step: SparkStep.COMPLETED
        });

        messages.push({
          type: 'speech',
          content: summary
        });

        messages.push({
          type: 'speech',
          content:
            "You've completed a full SPARK session. Remember, you can come back anytime you need to work through something. Take care of yourself."
        });
      } else {
        // Enter new state and get its messages
        const stateMessages = this.currentHandler?.enter(this.session) || [];
        messages.push(...stateMessages);
      }
    } else {
      // Still in current state, might need more input
      messages.push({
        type: 'speech',
        content: this.getPartialInputResponse()
      });
    }

    return {
      session: this.session,
      messages,
      transitioned,
      completed,
      events: this.eventLog
    };
  }

  private getContextualAcknowledgment(context: ResponseContext): string {
    switch (context.step) {
      case SparkStep.SITUATION:
        return this.templateEngine.getSituationAcknowledgment(context);
      case SparkStep.PERCEPTION:
        return this.templateEngine.getPerceptionReframe(context);
      case SparkStep.AFFECT:
        return this.templateEngine.getAffectValidation(context);
      case SparkStep.RESPONSE:
        const action = this.session.data.response?.selectedAction;
        return action
          ? this.templateEngine.getActionEncouragement(action)
          : '';
      case SparkStep.KEY_RESULT:
        return this.templateEngine.getSessionSummary(context);
      default:
        return '';
    }
  }

  private getPartialInputResponse(): string {
    const responses = [
      'Take your time. There\'s no rush here.',
      'I\'m still listening. Share whatever feels right.',
      'You\'re doing great. Keep going when you\'re ready.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get current session state
  getSession(): SparkSession {
    return this.session;
  }

  // Get progress information
  getProgress(): {
    currentStep: number;
    totalSteps: number;
    percentage: number;
    stepName: string;
    stepDescription: string;
  } {
    const progress = this.transitionManager.getProgress(this.session);
    return {
      ...progress,
      stepName: this.transitionManager.getStepName(this.session.currentStep),
      stepDescription: this.transitionManager.getStepDescription(
        this.session.currentStep
      )
    };
  }

  // Validate session integrity
  validate(): { valid: boolean; errors: string[] } {
    return this.transitionManager.validateSessionIntegrity(this.session);
  }

  // Get all events for analytics
  getEventLog(): SessionEvent[] {
    return this.eventLog;
  }

  private logEvent(event: SessionEvent): void {
    if (this.config.enableAnalytics) {
      this.eventLog.push(event);
    }
  }

  // Restore session from saved data
  static restore(
    sessionData: SparkSession,
    config: StateMachineConfig = {}
  ): SparkStateMachine {
    const machine = new SparkStateMachine(sessionData.odlukId, config);
    machine.session = sessionData;
    machine.currentHandler = createStateHandler(sessionData.currentStep);
    return machine;
  }

  // Get LLM prompt for generating dynamic response
  getLLMPrompt(userMessage: string): string {
    const context: ResponseContext = {
      session: this.session,
      step: this.session.currentStep
    };

    return this.templateEngine.buildLLMPrompt(context, userMessage);
  }

  // Add LLM response to context for continuity
  addLLMResponse(response: string): void {
    this.session.llmContext.push(response);

    // Keep context manageable (last 10 exchanges)
    if (this.session.llmContext.length > 10) {
      this.session.llmContext = this.session.llmContext.slice(-10);
    }
  }
}

// Export a factory function for easy instantiation
export function createSparkSession(
  userId: string,
  config?: StateMachineConfig
): SparkStateMachine {
  return new SparkStateMachine(userId, config);
}
