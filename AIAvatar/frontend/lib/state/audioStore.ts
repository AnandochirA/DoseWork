import { create } from 'zustand';

interface AudioState {
  // Audio playback
  isPlaying: boolean;
  currentAudioUrl: string | null;
  audioQueue: string[];
  volume: number;
  playbackRate: number;

  // TTS
  isTTSLoading: boolean;
  ttsError: string | null;

  // Speech recognition
  isListening: boolean;
  transcript: string;
  interimTranscript: string;

  // Audio analysis (for lip sync)
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array | null;

  // Actions
  setPlaying: (playing: boolean) => void;
  setCurrentAudio: (url: string | null) => void;
  addToQueue: (url: string) => void;
  clearQueue: () => void;
  nextInQueue: () => string | null;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setTTSLoading: (loading: boolean) => void;
  setTTSError: (error: string | null) => void;
  setListening: (listening: boolean) => void;
  setTranscript: (transcript: string) => void;
  setInterimTranscript: (transcript: string) => void;
  initAudioContext: () => void;
  setFrequencyData: (data: Uint8Array) => void;
  resetAudio: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentAudioUrl: null,
  audioQueue: [],
  volume: 1.0,
  playbackRate: 1.0,
  isTTSLoading: false,
  ttsError: null,
  isListening: false,
  transcript: '',
  interimTranscript: '',
  audioContext: null,
  analyser: null,
  frequencyData: null,

  // Actions
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentAudio: (url) => set({ currentAudioUrl: url }),
  addToQueue: (url) =>
    set((state) => ({
      audioQueue: [...state.audioQueue, url],
    })),
  clearQueue: () => set({ audioQueue: [] }),
  nextInQueue: () => {
    const state = get();
    if (state.audioQueue.length === 0) return null;
    const [next, ...rest] = state.audioQueue;
    set({ audioQueue: rest, currentAudioUrl: next });
    return next;
  },
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setPlaybackRate: (rate) => set({ playbackRate: Math.max(0.5, Math.min(2, rate)) }),
  setTTSLoading: (loading) => set({ isTTSLoading: loading }),
  setTTSError: (error) => set({ ttsError: error }),
  setListening: (listening) => set({ isListening: listening }),
  setTranscript: (transcript) => set({ transcript }),
  setInterimTranscript: (transcript) => set({ interimTranscript: transcript }),
  initAudioContext: () => {
    if (typeof window !== 'undefined' && !get().audioContext) {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      set({ audioContext, analyser, frequencyData });
    }
  },
  setFrequencyData: (data) => set({ frequencyData: data }),
  resetAudio: () =>
    set({
      isPlaying: false,
      currentAudioUrl: null,
      audioQueue: [],
      isTTSLoading: false,
      ttsError: null,
      isListening: false,
      transcript: '',
      interimTranscript: '',
    }),
}));
