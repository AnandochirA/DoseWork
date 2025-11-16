// SPARK Session Types and Interfaces

export enum SparkStep {
  SITUATION = 'SITUATION',
  PERCEPTION = 'PERCEPTION',
  AFFECT = 'AFFECT',
  RESPONSE = 'RESPONSE',
  KEY_RESULT = 'KEY_RESULT',
  COMPLETED = 'COMPLETED'
}

export enum EmotionType {
  ANXIOUS = 'anxious',
  OVERWHELMED = 'overwhelmed',
  FRUSTRATED = 'frustrated',
  SAD = 'sad',
  ANGRY = 'angry',
  CONFUSED = 'confused',
  HOPELESS = 'hopeless',
  STRESSED = 'stressed'
}

export enum ResponseAction {
  BREATHING_EXERCISE = 'breathing_exercise',
  FIVE_MIN_WALK = 'five_min_walk',
  JUMPING_JACKS = 'jumping_jacks',
  ASK_FOR_HELP = 'ask_for_help'
}

export enum FollowThroughLevel {
  COMPLETED_ALL = 'completed_all',
  SIGNIFICANT_PROGRESS = 'significant_progress',
  STARTED_NOT_FINISHED = 'started_not_finished',
  STRUGGLED_TO_BEGIN = 'struggled_to_begin',
  UNEXPECTED_ISSUE = 'unexpected_issue'
}

export interface SituationData {
  description: string;
  thoughts: string;
}

export interface PerceptionData {
  selectedReframe: string;
  userReflection: string;
}

export interface AffectData {
  emotion: EmotionType;
  intensity: number; // 1-10 scale
}

export interface ResponseData {
  selectedAction: ResponseAction;
  actionCompleted: boolean;
}

export interface KeyResultData {
  followThrough: FollowThroughLevel;
  insights: string;
}

export interface SparkSessionData {
  situation?: SituationData;
  perception?: PerceptionData;
  affect?: AffectData;
  response?: ResponseData;
  keyResult?: KeyResultData;
}

export interface SparkSession {
  id: string;
  odlukId: string;
  currentStep: SparkStep;
  data: SparkSessionData;
  startedAt: Date;
  completedAt?: Date;
  llmContext: string[];
}

export interface StateTransition {
  from: SparkStep;
  to: SparkStep;
  condition?: (session: SparkSession) => boolean;
}

export interface AvatarMessage {
  type: 'speech' | 'prompt' | 'options' | 'input' | 'guide';
  content: string;
  options?: string[];
  inputType?: 'text' | 'textarea' | 'emotion_selector' | 'intensity_slider';
  guideType?: 'breathing' | 'timer' | 'progress';
  metadata?: Record<string, unknown>;
}

export interface UserInput {
  type: 'text' | 'option_select' | 'emotion_select' | 'intensity' | 'action_complete';
  value: string | number | boolean;
  timestamp: Date;
}

export interface SessionEvent {
  type: 'state_change' | 'user_input' | 'avatar_response' | 'action_start' | 'action_complete';
  step: SparkStep;
  data: unknown;
  timestamp: Date;
}
