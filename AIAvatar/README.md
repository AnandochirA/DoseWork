# AI Avatar - ADHD Coaching Assistant

Interactive AI avatar for ADHD management using the SPARK methodology.

## Overview

This application provides an engaging, real-time AI avatar coach that guides users through SPARK sessions - a structured approach to intentional thinking designed specifically for ADHD challenges.

**SPARK = Situation → Perception → Affect → Response → Key Result**

## Features

- **3D Animated Avatar**: Real-time lip-synced avatar using Ready Player Me
- **Interactive Sessions**: Guided SPARK methodology with progress tracking
- **Emotional Support**: Emotion selection and intensity rating
- **Action Guides**: Breathing exercises, timers, and activity prompts
- **Real-time Communication**: WebSocket-based instant feedback
- **Session Analytics**: Track progress and insights over time

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React Three Fiber + Three.js (3D Avatar)
- Zustand (State Management)
- Framer Motion (Animations)
- Tailwind CSS (Styling)
- Socket.io Client (Real-time)

### Backend
- Node.js + Express
- Socket.io (WebSocket)
- TypeScript
- Supabase (Database)

### Services (To Integrate)
- ElevenLabs (Text-to-Speech)
- Anthropic Claude (LLM responses)
- Ready Player Me (Avatar models)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- ElevenLabs API key (optional for MVP)
- Anthropic API key (for LLM features)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd AIAvatar
```

2. Install backend dependencies
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up database
```bash
# Run the schema in Supabase SQL editor
# Located at: backend/src/database/schema.sql
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

2. Start the frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

3. Open http://localhost:3000 in your browser

## Project Structure

```
AIAvatar/
├── frontend/                 # Next.js frontend
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   │   ├── avatar/          # 3D avatar components
│   │   ├── session/         # SPARK session UI
│   │   └── shared/          # Reusable components
│   ├── lib/                  # Utilities and state
│   │   ├── state/           # Zustand stores
│   │   └── websocket/       # Socket.io client
│   └── public/              # Static assets
│
└── backend/                  # Node.js backend
    ├── src/
    │   ├── core/            # SPARK engine
    │   │   └── spark-engine/# State machine
    │   ├── services/        # Business logic
    │   ├── controllers/     # API controllers
    │   ├── websocket/       # Real-time handlers
    │   └── database/        # Schema and models
    └── config/              # Configuration files
```

## SPARK Session Flow

1. **Situation** - User describes their challenge and current thoughts
2. **Perception** - Reframe thoughts using guided questions
3. **Affect** - Acknowledge emotions and rate intensity
4. **Response** - Take action (breathing, walking, etc.)
5. **Key Result** - Reflect on progress and capture insights

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Fly.io)
```bash
cd backend
flyctl launch
flyctl deploy
```

### Database (Supabase)
- Create project at supabase.com
- Run schema.sql in SQL editor
- Configure Row Level Security

## Roadmap

- [ ] Week 1: Core infrastructure (DONE)
- [ ] Week 2: LLM + TTS integration
- [ ] Week 3: Enhanced avatar animations
- [ ] Week 4: Complete UI polish
- [ ] Week 5: Testing and deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Acknowledgments

- SPARK methodology for ADHD coaching
- Ready Player Me for avatar technology
- Anthropic Claude for AI responses
- ElevenLabs for voice synthesis
