import { useAvatarStore, AvatarEmotion, AvatarState } from '@/lib/state/avatarStore';
import { useAudioStore } from '@/lib/state/audioStore';
import { LipSyncEngine, Viseme } from './LipSync';

export class AvatarController {
  private lipSyncEngine: LipSyncEngine | null = null;
  private blinkInterval: NodeJS.Timeout | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private onSpeechEnd: (() => void) | null = null;

  constructor() {
    this.initializeLipSync();
    this.startBlinking();
  }

  private initializeLipSync(): void {
    const { setViseme, setSpeaking } = useAvatarStore.getState();

    this.lipSyncEngine = new LipSyncEngine((viseme: Viseme, intensity: number) => {
      setViseme(viseme, intensity);
    });
  }

  private startBlinking(): void {
    const { triggerBlink } = useAvatarStore.getState();

    // Random blinking every 2-6 seconds
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      this.blinkInterval = setTimeout(() => {
        triggerBlink();
        scheduleBlink();
      }, delay);
    };

    scheduleBlink();
  }

  // Set avatar emotional state based on context
  setEmotionForStep(step: string): void {
    const { setEmotion } = useAvatarStore.getState();

    const stepEmotions: Record<string, AvatarEmotion> = {
      SITUATION: 'empathetic',
      PERCEPTION: 'encouraging',
      AFFECT: 'empathetic',
      RESPONSE: 'encouraging',
      KEY_RESULT: 'celebrating',
      COMPLETED: 'happy',
    };

    setEmotion(stepEmotions[step] || 'neutral');
  }

  // Make avatar speak with audio
  async speak(audioUrl: string, onEnd?: () => void): Promise<void> {
    const { setSpeaking, setEmotion } = useAvatarStore.getState();
    const { setPlaying } = useAudioStore.getState();

    this.onSpeechEnd = onEnd || null;

    // Create audio element
    this.audioElement = new Audio(audioUrl);
    this.audioElement.crossOrigin = 'anonymous';

    // Set up lip sync
    if (this.lipSyncEngine) {
      this.lipSyncEngine.connectAudioElement(this.audioElement);
    }

    // Event handlers
    this.audioElement.onplay = () => {
      setSpeaking(true);
      setPlaying(true);
      this.lipSyncEngine?.startAnalysis();
    };

    this.audioElement.onended = () => {
      setSpeaking(false);
      setPlaying(false);
      this.lipSyncEngine?.stopAnalysis();
      if (this.onSpeechEnd) {
        this.onSpeechEnd();
      }
    };

    this.audioElement.onerror = (error) => {
      console.error('Audio playback error:', error);
      setSpeaking(false);
      setPlaying(false);
      this.lipSyncEngine?.stopAnalysis();
    };

    // Play audio
    try {
      await this.audioElement.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      setSpeaking(false);
      setPlaying(false);
    }
  }

  // Simulate speech with viseme sequence (for text without audio)
  async simulateSpeech(text: string, duration: number = 3000): Promise<void> {
    const { setSpeaking, setViseme } = useAvatarStore.getState();

    setSpeaking(true);

    const visemeSequence = LipSyncEngine.generateVisemeSequence(text, duration / 1000);

    for (const event of visemeSequence) {
      setViseme(event.viseme, event.intensity);
      await this.sleep(event.duration * 1000);
    }

    setSpeaking(false);
    setViseme('sil', 0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Set avatar to listening state
  setListening(): void {
    const { setState, setEmotion } = useAvatarStore.getState();
    setState('listening');
    setEmotion('empathetic');
  }

  // Set avatar to thinking state
  setThinking(): void {
    const { setState } = useAvatarStore.getState();
    setState('thinking');
  }

  // Set avatar to idle state
  setIdle(): void {
    const { setState } = useAvatarStore.getState();
    setState('idle');
  }

  // Head nod for acknowledgment
  nod(): void {
    const { setHeadNod } = useAvatarStore.getState();
    setHeadNod(true);
    setTimeout(() => setHeadNod(false), 1000);
  }

  // Stop current speech
  stopSpeaking(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }

    const { setSpeaking } = useAvatarStore.getState();
    const { setPlaying } = useAudioStore.getState();

    setSpeaking(false);
    setPlaying(false);
    this.lipSyncEngine?.stopAnalysis();
  }

  // Cleanup
  destroy(): void {
    if (this.blinkInterval) {
      clearTimeout(this.blinkInterval);
      this.blinkInterval = null;
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }

    this.lipSyncEngine?.destroy();
    this.lipSyncEngine = null;

    const { resetAvatar } = useAvatarStore.getState();
    resetAvatar();
  }
}

// Hook for using avatar controller in React components
export function useAvatarController() {
  const controllerRef = { current: null as AvatarController | null };

  const getController = () => {
    if (!controllerRef.current) {
      controllerRef.current = new AvatarController();
    }
    return controllerRef.current;
  };

  const cleanup = () => {
    if (controllerRef.current) {
      controllerRef.current.destroy();
      controllerRef.current = null;
    }
  };

  return { getController, cleanup };
}
