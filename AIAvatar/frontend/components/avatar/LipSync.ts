// Viseme mapping based on Oculus Lipsync standard
// Maps phonemes to mouth shapes

export type Viseme =
  | 'sil'    // silence
  | 'PP'     // p, b, m
  | 'FF'     // f, v
  | 'TH'     // th
  | 'DD'     // t, d
  | 'kk'     // k, g
  | 'CH'     // ch, j, sh
  | 'SS'     // s, z
  | 'nn'     // n, l
  | 'RR'     // r
  | 'aa'     // a
  | 'E'      // e
  | 'I'      // i
  | 'O'      // o
  | 'U';     // u

// Simple text-to-viseme mapping for pre-generated speech
const phonemeToViseme: Record<string, Viseme> = {
  // Consonants
  'p': 'PP', 'b': 'PP', 'm': 'PP',
  'f': 'FF', 'v': 'FF',
  'th': 'TH',
  't': 'DD', 'd': 'DD',
  'k': 'kk', 'g': 'kk',
  'ch': 'CH', 'j': 'CH', 'sh': 'CH',
  's': 'SS', 'z': 'SS',
  'n': 'nn', 'l': 'nn',
  'r': 'RR',
  // Vowels
  'a': 'aa', 'ah': 'aa',
  'e': 'E', 'eh': 'E',
  'i': 'I', 'ee': 'I',
  'o': 'O', 'oh': 'O',
  'u': 'U', 'oo': 'U',
};

export interface VisemeEvent {
  viseme: Viseme;
  time: number;
  duration: number;
  intensity: number;
}

export class LipSyncEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  private onVisemeChange: (viseme: Viseme, intensity: number) => void;
  private isActive: boolean = false;

  constructor(onVisemeChange: (viseme: Viseme, intensity: number) => void) {
    this.onVisemeChange = onVisemeChange;
  }

  // Initialize audio context for real-time analysis
  initAudioContext(): void {
    if (typeof window === 'undefined') return;

    this.audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  // Connect an audio element for lip sync
  connectAudioElement(audioElement: HTMLAudioElement): void {
    if (!this.audioContext || !this.analyser) {
      this.initAudioContext();
    }

    if (!this.audioContext || !this.analyser) return;

    const source = this.audioContext.createMediaElementSource(audioElement);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  // Start analyzing audio for lip sync
  startAnalysis(): void {
    if (!this.analyser || !this.dataArray) return;

    this.isActive = true;
    this.analyze();
  }

  private analyze = (): void => {
    if (!this.isActive || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Map frequency data to viseme
    const visemeData = this.mapFrequencyToViseme(this.dataArray);
    this.onVisemeChange(visemeData.viseme, visemeData.intensity);

    this.animationFrameId = requestAnimationFrame(this.analyze);
  };

  private mapFrequencyToViseme(frequencyData: Uint8Array): { viseme: Viseme; intensity: number } {
    // Calculate average amplitude
    const sum = frequencyData.reduce((acc, val) => acc + val, 0);
    const average = sum / frequencyData.length;

    // If silent
    if (average < 10) {
      return { viseme: 'sil', intensity: 0 };
    }

    // Analyze frequency bands for vowel detection
    const lowFreq = this.getAverageInRange(frequencyData, 0, 10);   // ~100-400Hz
    const midFreq = this.getAverageInRange(frequencyData, 10, 30);  // ~400-1200Hz
    const highFreq = this.getAverageInRange(frequencyData, 30, 60); // ~1200-2400Hz

    const intensity = Math.min(average / 128, 1);

    // Simple heuristic for viseme selection based on frequency distribution
    if (highFreq > midFreq && highFreq > lowFreq) {
      // High frequencies dominant - sibilants
      return { viseme: 'SS', intensity };
    } else if (midFreq > lowFreq) {
      // Mid frequencies - open vowels
      if (lowFreq > 50) {
        return { viseme: 'aa', intensity };
      } else {
        return { viseme: 'E', intensity };
      }
    } else {
      // Low frequencies - closed vowels or consonants
      if (average > 80) {
        return { viseme: 'O', intensity };
      } else {
        return { viseme: 'PP', intensity };
      }
    }
  }

  private getAverageInRange(data: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end && i < data.length; i++) {
      sum += data[i];
    }
    return sum / (end - start);
  }

  // Stop analysis
  stopAnalysis(): void {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.onVisemeChange('sil', 0);
  }

  // Generate viseme sequence from text (for pre-generated TTS)
  static generateVisemeSequence(text: string, audioDuration: number): VisemeEvent[] {
    const words = text.toLowerCase().split(/\s+/);
    const events: VisemeEvent[] = [];
    const timePerWord = audioDuration / words.length;

    let currentTime = 0;

    words.forEach((word) => {
      const visemes = this.textToVisemes(word);
      const timePerViseme = timePerWord / visemes.length;

      visemes.forEach((viseme) => {
        events.push({
          viseme,
          time: currentTime,
          duration: timePerViseme,
          intensity: 0.8,
        });
        currentTime += timePerViseme;
      });
    });

    return events;
  }

  private static textToVisemes(word: string): Viseme[] {
    const visemes: Viseme[] = [];
    let i = 0;

    while (i < word.length) {
      // Check for digraphs first
      if (i < word.length - 1) {
        const digraph = word.substring(i, i + 2);
        if (phonemeToViseme[digraph]) {
          visemes.push(phonemeToViseme[digraph]);
          i += 2;
          continue;
        }
      }

      // Single character
      const char = word[i];
      if (phonemeToViseme[char]) {
        visemes.push(phonemeToViseme[char]);
      } else if (/[aeiou]/.test(char)) {
        // Default vowel
        visemes.push('aa');
      } else if (/[a-z]/.test(char)) {
        // Default consonant
        visemes.push('DD');
      }

      i++;
    }

    // Add silence at the end
    if (visemes.length === 0 || visemes[visemes.length - 1] !== 'sil') {
      visemes.push('sil');
    }

    return visemes;
  }

  // Cleanup
  destroy(): void {
    this.stopAnalysis();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}
