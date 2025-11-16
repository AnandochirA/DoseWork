import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { sessionService } from './services/SessionService';
import { UserInput } from './core/spark-engine/types';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSessions: sessionService.getActiveSessionCount()
  });
});

// REST API endpoints
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId } = req.body;
    const { sessionId, stateMachine } = await sessionService.createSession(
      userId
    );
    const result = stateMachine.start();

    res.json({
      sessionId,
      messages: result.messages,
      progress: stateMachine.getProgress()
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const stateMachine = sessionService.getActiveSession(sessionId);

    if (!stateMachine) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      session: stateMachine.getSession(),
      progress: stateMachine.getProgress()
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let currentSessionId: string | null = null;

  // Join a SPARK session
  socket.on('join_session', async (data: { sessionId: string }) => {
    const { sessionId } = data;
    const stateMachine = sessionService.getActiveSession(sessionId);

    if (!stateMachine) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    currentSessionId = sessionId;
    socket.join(sessionId);

    socket.emit('session_joined', {
      session: stateMachine.getSession(),
      progress: stateMachine.getProgress()
    });

    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  // Process user input
  socket.on('user_input', async (data: { sessionId: string; input: UserInput }) => {
    const { sessionId, input } = data;
    const stateMachine = sessionService.getActiveSession(sessionId);

    if (!stateMachine) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      const result = stateMachine.processInput(input);

      // Save session after each input
      await sessionService.saveSession(result.session);

      // Emit result to client
      socket.emit('session_update', {
        messages: result.messages,
        progress: stateMachine.getProgress(),
        transitioned: result.transitioned,
        completed: result.completed
      });

      if (result.completed) {
        await sessionService.endSession(sessionId);
        socket.emit('session_completed', {
          session: result.session,
          events: result.events
        });
      }
    } catch (error) {
      console.error('Error processing input:', error);
      socket.emit('error', { message: 'Failed to process input' });
    }
  });

  // Request action guide (breathing, timer, etc.)
  socket.on('start_action', (data: { actionType: string }) => {
    const { actionType } = data;

    switch (actionType) {
      case 'breathing_exercise':
        socket.emit('action_guide', {
          type: 'breathing',
          pattern: [4, 7, 8], // 4-7-8 breathing
          cycles: 3,
          instruction:
            'Breathe in for 4 seconds, hold for 7, exhale for 8. Follow the visual guide.'
        });
        break;

      case 'five_min_walk':
        socket.emit('action_guide', {
          type: 'timer',
          duration: 300, // 5 minutes in seconds
          instruction:
            "Take a 5-minute walk. I'll be here when you return. Timer started."
        });
        break;

      case 'jumping_jacks':
        socket.emit('action_guide', {
          type: 'timer',
          duration: 30,
          instruction:
            '30 seconds of jumping jacks. Ready? Go!'
        });
        break;

      case 'ask_for_help':
        socket.emit('action_guide', {
          type: 'prompt',
          instruction:
            'Think of one person you trust. What would you say to them? Write it down first if it helps.'
        });
        break;

      default:
        socket.emit('action_guide', {
          type: 'generic',
          instruction: 'Take your chosen action. Come back when you are ready.'
        });
    }
  });

  // Mark action as complete
  socket.on('action_complete', (data: { sessionId: string }) => {
    const { sessionId } = data;
    const stateMachine = sessionService.getActiveSession(sessionId);

    if (stateMachine) {
      const input: UserInput = {
        type: 'action_complete',
        value: true,
        timestamp: new Date()
      };

      const result = stateMachine.processInput(input);

      socket.emit('session_update', {
        messages: result.messages,
        progress: stateMachine.getProgress(),
        transitioned: result.transitioned,
        completed: result.completed
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (currentSessionId) {
      socket.leave(currentSessionId);
    }
  });
});

// Cleanup stale sessions every 10 minutes
setInterval(async () => {
  const cleaned = await sessionService.cleanupStaleSessions(30);
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} stale sessions`);
  }
}, 10 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`AI Avatar Backend running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
