import {
  SparkSession,
  SparkStep,
  SessionEvent,
  SparkSessionData
} from '../core/spark-engine/types';
import {
  SparkStateMachine,
  createSparkSession
} from '../core/spark-engine/SparkStateMachine';

export interface SessionRecord {
  id: string;
  user_id: string;
  session_type: 'spark' | 'wave' | 'popcorn' | 'rsd';
  current_step: string;
  session_data: SparkSessionData;
  llm_context: string[];
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  totalSessions: number;
  completedSessions: number;
  averageCompletionTime: number;
  mostUsedEmotions: string[];
  mostSelectedActions: string[];
  commonInsightThemes: string[];
}

export class SessionService {
  private activeSessions: Map<string, SparkStateMachine>;

  constructor() {
    this.activeSessions = new Map();
  }

  // Create a new SPARK session
  async createSession(userId: string): Promise<{
    sessionId: string;
    stateMachine: SparkStateMachine;
  }> {
    const stateMachine = createSparkSession(userId);
    const sessionId = stateMachine.getSession().id;

    // Store in memory for active sessions
    this.activeSessions.set(sessionId, stateMachine);

    // Persist to database
    await this.saveSession(stateMachine.getSession());

    return { sessionId, stateMachine };
  }

  // Get active session state machine
  getActiveSession(sessionId: string): SparkStateMachine | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Save session to database (Supabase)
  async saveSession(session: SparkSession): Promise<void> {
    const record: SessionRecord = {
      id: session.id,
      user_id: session.odlukId,
      session_type: 'spark',
      current_step: session.currentStep,
      session_data: session.data,
      llm_context: session.llmContext,
      started_at: session.startedAt.toISOString(),
      completed_at: session.completedAt?.toISOString() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Implement Supabase integration
    // const { error } = await supabase
    //   .from('sessions')
    //   .upsert(record, { onConflict: 'id' });

    console.log('Session saved:', record.id);
  }

  // Load session from database
  async loadSession(sessionId: string): Promise<SparkStateMachine | null> {
    // Check if already active
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId)!;
    }

    // TODO: Load from Supabase
    // const { data, error } = await supabase
    //   .from('sessions')
    //   .select('*')
    //   .eq('id', sessionId)
    //   .single();

    // if (data) {
    //   const session = this.recordToSession(data);
    //   const stateMachine = SparkStateMachine.restore(session);
    //   this.activeSessions.set(sessionId, stateMachine);
    //   return stateMachine;
    // }

    return null;
  }

  // Convert database record to SparkSession
  private recordToSession(record: SessionRecord): SparkSession {
    return {
      id: record.id,
      odlukId: record.user_id,
      currentStep: record.current_step as SparkStep,
      data: record.session_data,
      llmContext: record.llm_context,
      startedAt: new Date(record.started_at),
      completedAt: record.completed_at
        ? new Date(record.completed_at)
        : undefined
    };
  }

  // End session and clean up
  async endSession(sessionId: string): Promise<void> {
    const stateMachine = this.activeSessions.get(sessionId);

    if (stateMachine) {
      const session = stateMachine.getSession();

      // Mark as completed if not already
      if (!session.completedAt) {
        session.completedAt = new Date();
      }

      // Save final state
      await this.saveSession(session);

      // Save analytics events
      await this.saveSessionEvents(sessionId, stateMachine.getEventLog());

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
    }
  }

  // Save session events for analytics
  async saveSessionEvents(
    sessionId: string,
    events: SessionEvent[]
  ): Promise<void> {
    // TODO: Implement Supabase batch insert
    // const eventRecords = events.map(event => ({
    //   session_id: sessionId,
    //   event_type: event.type,
    //   step: event.step,
    //   event_data: event.data,
    //   timestamp: event.timestamp.toISOString()
    // }));

    // await supabase.from('session_events').insert(eventRecords);

    console.log(`Saved ${events.length} events for session ${sessionId}`);
  }

  // Get user's session history
  async getUserSessions(
    userId: string,
    limit: number = 10
  ): Promise<SessionRecord[]> {
    // TODO: Implement Supabase query
    // const { data } = await supabase
    //   .from('sessions')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })
    //   .limit(limit);

    return [];
  }

  // Get analytics for user
  async getUserAnalytics(userId: string): Promise<SessionAnalytics> {
    // TODO: Implement analytics aggregation from Supabase

    return {
      totalSessions: 0,
      completedSessions: 0,
      averageCompletionTime: 0,
      mostUsedEmotions: [],
      mostSelectedActions: [],
      commonInsightThemes: []
    };
  }

  // Clean up stale sessions (not accessed for X minutes)
  async cleanupStaleSessions(timeoutMinutes: number = 30): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, stateMachine] of this.activeSessions) {
      const session = stateMachine.getSession();
      const lastActivity = session.completedAt || session.startedAt;
      const minutesElapsed =
        (now.getTime() - lastActivity.getTime()) / (1000 * 60);

      if (minutesElapsed > timeoutMinutes) {
        await this.endSession(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Get count of active sessions
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }
}

// Singleton instance
export const sessionService = new SessionService();
