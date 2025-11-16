import { create } from 'zustand';

export type AvatarEmotion = 'neutral' | 'happy' | 'empathetic' | 'encouraging' | 'celebrating';
export type AvatarState = 'idle' | 'listening' | 'speaking' | 'thinking';

interface AvatarStoreState {
  // Avatar state
  isLoaded: boolean;
  currentEmotion: AvatarEmotion;
  currentState: AvatarState;

  // Lip sync
  isSpeaking: boolean;
  currentViseme: string;
  visemeIntensity: number;

  // Animations
  isBlinking: boolean;
  isBreathing: boolean;
  headNodding: boolean;

  // 3D model
  modelUrl: string;
  cameraPosition: [number, number, number];

  // Actions
  setLoaded: (loaded: boolean) => void;
  setEmotion: (emotion: AvatarEmotion) => void;
  setState: (state: AvatarState) => void;
  setSpeaking: (speaking: boolean) => void;
  setViseme: (viseme: string, intensity: number) => void;
  triggerBlink: () => void;
  setHeadNod: (nodding: boolean) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  resetAvatar: () => void;
}

export const useAvatarStore = create<AvatarStoreState>((set) => ({
  // Initial state
  isLoaded: false,
  currentEmotion: 'neutral',
  currentState: 'idle',
  isSpeaking: false,
  currentViseme: 'sil',
  visemeIntensity: 0,
  isBlinking: false,
  isBreathing: true,
  headNodding: false,
  modelUrl: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb',
  cameraPosition: [0, 0, 2.5],

  // Actions
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  setState: (state) => set({ currentState: state }),
  setSpeaking: (speaking) =>
    set({
      isSpeaking: speaking,
      currentState: speaking ? 'speaking' : 'idle',
    }),
  setViseme: (viseme, intensity) =>
    set({
      currentViseme: viseme,
      visemeIntensity: intensity,
    }),
  triggerBlink: () => {
    set({ isBlinking: true });
    setTimeout(() => set({ isBlinking: false }), 150);
  },
  setHeadNod: (nodding) => set({ headNodding: nodding }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  resetAvatar: () =>
    set({
      currentEmotion: 'neutral',
      currentState: 'idle',
      isSpeaking: false,
      currentViseme: 'sil',
      visemeIntensity: 0,
      isBlinking: false,
      headNodding: false,
    }),
}));
