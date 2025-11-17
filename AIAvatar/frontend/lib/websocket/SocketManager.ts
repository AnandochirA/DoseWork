import { io, Socket } from 'socket.io-client';

export interface UserInput {
  type: 'text' | 'option_select' | 'emotion_select' | 'intensity' | 'action_complete';
  value: string | number | boolean;
  timestamp: Date;
}

export interface AvatarMessage {
  type: 'speech' | 'prompt' | 'options' | 'input' | 'guide';
  content: string;
  options?: string[];
  inputType?: 'text' | 'textarea' | 'emotion_selector' | 'intensity_slider';
  guideType?: 'breathing' | 'timer' | 'progress';
  metadata?: Record<string, unknown>;
}

export interface SessionProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  stepName: string;
  stepDescription: string;
}

export interface ActionGuide {
  type: 'breathing' | 'timer' | 'prompt' | 'generic';
  pattern?: number[];
  cycles?: number;
  duration?: number;
  instruction: string;
}

export interface SocketEvents {
  onSessionJoined: (data: { session: unknown; progress: SessionProgress }) => void;
  onSessionUpdate: (data: {
    messages: AvatarMessage[];
    progress: SessionProgress;
    transitioned: boolean;
    completed: boolean;
  }) => void;
  onSessionCompleted: (data: { session: unknown; events: unknown[] }) => void;
  onActionGuide: (guide: ActionGuide) => void;
  onError: (error: { message: string }) => void;
}

class SocketManager {
  private socket: Socket | null = null;
  private serverUrl: string;
  private eventHandlers: Partial<SocketEvents> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('session_joined', (data) => {
      this.eventHandlers.onSessionJoined?.(data);
    });

    this.socket.on('session_update', (data) => {
      this.eventHandlers.onSessionUpdate?.(data);
    });

    this.socket.on('session_completed', (data) => {
      this.eventHandlers.onSessionCompleted?.(data);
    });

    this.socket.on('action_guide', (guide) => {
      this.eventHandlers.onActionGuide?.(guide);
    });

    this.socket.on('error', (error) => {
      this.eventHandlers.onError?.(error);
    });
  }

  setEventHandlers(handlers: Partial<SocketEvents>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  joinSession(sessionId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('join_session', { sessionId });
  }

  sendUserInput(sessionId: string, input: UserInput): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('user_input', { sessionId, input });
  }

  startAction(actionType: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('start_action', { actionType });
  }

  completeAction(sessionId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('action_complete', { sessionId });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketManager = new SocketManager();
