import { create } from 'zustand';
import { AvatarMessage, SessionProgress } from '../websocket/SocketManager';

export type SparkStep = 'SITUATION' | 'PERCEPTION' | 'AFFECT' | 'RESPONSE' | 'KEY_RESULT' | 'COMPLETED';

export interface SessionData {
  situation?: {
    description: string;
    thoughts: string;
  };
  perception?: {
    selectedReframe: string;
    userReflection: string;
  };
  affect?: {
    emotion: string;
    intensity: number;
  };
  response?: {
    selectedAction: string;
    actionCompleted: boolean;
  };
  keyResult?: {
    followThrough: string;
    insights: string;
  };
}

interface SessionState {
  // Session info
  sessionId: string | null;
  userId: string;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;

  // SPARK progress
  currentStep: SparkStep;
  progress: SessionProgress | null;
  sessionData: SessionData;

  // Messages from avatar
  messages: AvatarMessage[];
  currentMessageIndex: number;

  // Actions
  setSessionId: (id: string) => void;
  setUserId: (id: string) => void;
  setActive: (active: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentStep: (step: SparkStep) => void;
  setProgress: (progress: SessionProgress) => void;
  updateSessionData: (data: Partial<SessionData>) => void;
  addMessages: (messages: AvatarMessage[]) => void;
  clearMessages: () => void;
  nextMessage: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  sessionId: null,
  userId: 'user-' + Math.random().toString(36).substr(2, 9),
  isActive: false,
  isLoading: false,
  error: null,
  currentStep: 'SITUATION',
  progress: null,
  sessionData: {},
  messages: [],
  currentMessageIndex: 0,

  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setUserId: (id) => set({ userId: id }),
  setActive: (active) => set({ isActive: active }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setProgress: (progress) =>
    set({
      progress,
      currentStep: progress.stepName.toUpperCase().replace(' ', '_') as SparkStep,
    }),
  updateSessionData: (data) =>
    set((state) => ({
      sessionData: { ...state.sessionData, ...data },
    })),
  addMessages: (messages) =>
    set((state) => ({
      messages: [...state.messages, ...messages],
    })),
  clearMessages: () => set({ messages: [], currentMessageIndex: 0 }),
  nextMessage: () =>
    set((state) => ({
      currentMessageIndex: Math.min(
        state.currentMessageIndex + 1,
        state.messages.length - 1
      ),
    })),
  resetSession: () =>
    set({
      sessionId: null,
      isActive: false,
      isLoading: false,
      error: null,
      currentStep: 'SITUATION',
      progress: null,
      sessionData: {},
      messages: [],
      currentMessageIndex: 0,
    }),
}));
