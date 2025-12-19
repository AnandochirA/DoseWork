# DOSE: System Architecture Document
**Version 1.0 | December 2025**  
**Prepared by: Anand-Ochir Amartuvshin**  
**Internship Period: Dec 19, 2025 - Mar 19, 2026**

---

## 📋 Executive Summary

DOSE is an ADHD support platform featuring four core modules (SPARK, WAVE, POPCORN, RSD METER) delivered as a mobile application. This document outlines a sophisticated, scalable architecture that:

- Supports 1M+ users from day one
- Enables seamless transition to microservices
- Provides comprehensive audit trails and analytics
- Implements enterprise-grade patterns in a pragmatic way

**Key Decision:** Build V1 with "smart foundation" patterns that activate in V2, avoiding premature complexity while maintaining architectural sophistication.

---

## 🎯 Architecture Philosophy

### The "Smart Foundation" Approach

**V1 Strategy:**
- Simple implementations with sophisticated structure
- Patterns that scale without rewriting
- Technical moat through architecture, not complexity

**V2 Activation:**
- Async processing layers
- AI orchestration
- Advanced analytics

---

## 🏗️ Version 1 Architecture

### High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│                      (Flutter)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  SPARK   │  │  WAVE    │  │ POPCORN  │  │   Home   │      │
│  │  Module  │  │  Module  │  │  Module  │  │Dashboard │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└──────────────────────────────────────────────────────────────┘
                              ↓
                        HTTPS / JWT
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│              (FastAPI + Rate Limiting)                       │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Request Validation │ Auth Middleware │ CORS │ Logs  │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   Application Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ SPARK        │  │ WAVE         │  │ POPCORN      │        │
│  │ Service      │  │ Service      │  │ Service      │        │
│  │ (DDD)        │  │ (DDD)        │  │ (DDD)        │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         ↓                  ↓                 ↓               │
│  ┌─────────────────────────────────────────────────┐         │
│  │     Domain Event Bus (In-Memory for V1)         │         │
│  │  • SessionStarted, SessionCompleted             │         │
│  │  • InsightRecorded, PatternDetected             │         │
│  └─────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│  ┌───────────────────┐  ┌──────────────────┐                │
│  │ Repository        │  │ Event Store      │                │
│  │ Pattern (R/W)     │  │ (Write-Only)     │                │
│  │ - User Repo       │  │ - Audit Trail    │                │
│  │ - Session Repo    │  │ - Analytics      │                │
│  └───────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                             │
│  ┌────────────────────────────────────────────────┐         │
│  │ Transactional Tables (users, sessions, etc)    │         │
│  │ Event Log (immutable audit trail)              │         │
│  │ Materialized Views (analytics optimization)    │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Core Architectural Patterns (V1)

#### 1. Domain-Driven Design (DDD)

Each module is a **bounded context** with clear boundaries:

```python
# SPARK Context
spark/
├── domain/
│   ├── aggregates/
│   │   └── spark_session.py      # Root aggregate
│   ├── entities/
│   │   ├── situation.py
│   │   ├── perception.py
│   │   └── reframe.py
│   ├── value_objects/
│   │   ├── emotion.py
│   │   └── intensity.py
│   └── events/
│       ├── session_started.py
│       ├── step_completed.py
│       └── session_completed.py
├── application/
│   ├── services/
│   │   └── spark_service.py      # Use cases
│   └── dto/
│       └── spark_dto.py
├── infrastructure/
│   ├── repositories/
│   │   └── spark_repository.py
│   └── persistence/
│       └── models.py              # SQLAlchemy models
└── api/
    └── spark_endpoints.py
```

**Benefits:**
- Clear separation of concerns
- Easy to test business logic
- Prepares for microservices split

#### 2. Event Sourcing Foundation

Every significant action generates an **immutable event**:

```python
class DomainEvent(BaseModel):
    event_id: UUID
    aggregate_id: UUID
    event_type: str
    timestamp: datetime
    user_id: UUID
    payload: dict
    
# Example events:
SessionStartedEvent(
    aggregate_id=session.id,
    event_type="spark.session.started",
    payload={
        "situation": "...",
        "trigger": "anxiety"
    }
)

StepCompletedEvent(
    aggregate_id=session.id,
    event_type="spark.perception.completed",
    payload={
        "selected_reframes": [...],
        "custom_thoughts": "..."
    }
)
```

**Storage:**
```sql
CREATE TABLE event_store (
    event_id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_aggregate (aggregate_id, created_at),
    INDEX idx_user (user_id, created_at)
);
```

**V1 Usage:** Audit trail, analytics  
**V2 Usage:** Time-travel debugging, ML training data, pattern recognition

#### 3. CQRS (Command Query Responsibility Segregation)

Separate **write** operations from **read** operations:

```python
# Commands (writes)
class CreateSparkSessionCommand:
    user_id: UUID
    situation: str
    
class CompletePerceptionStepCommand:
    session_id: UUID
    selected_reframes: List[str]
    custom_thought: Optional[str]

# Queries (reads)
class GetSparkSessionQuery:
    session_id: UUID
    
class GetUserSparkHistoryQuery:
    user_id: UUID
    limit: int = 10
```

**Implementation:**
```python
# Write side
@router.post("/spark/sessions")
async def create_session(
    command: CreateSparkSessionCommand,
    service: SparkService = Depends()
):
    session = await service.handle_command(command)
    return session

# Read side (uses materialized views)
@router.get("/spark/sessions/{session_id}")
async def get_session(
    query: GetSparkSessionQuery,
    service: SparkService = Depends()
):
    return await service.handle_query(query)
```

**Benefits:**
- Optimize reads and writes independently
- Scale read replicas separately
- Cache reads without affecting writes

#### 4. Repository Pattern

Abstract data access behind interfaces:

```python
class ISparkRepository(ABC):
    @abstractmethod
    async def save(self, session: SparkSession) -> None:
        pass
    
    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> Optional[SparkSession]:
        pass
    
    @abstractmethod
    async def get_user_sessions(
        self, 
        user_id: UUID, 
        limit: int
    ) -> List[SparkSession]:
        pass

# Implementation
class PostgresSparkRepository(ISparkRepository):
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def save(self, session: SparkSession) -> None:
        # Convert domain model to ORM model
        # Save to database
        # Publish domain events
        pass
```

**Benefits:**
- Swap database implementation easily
- Mock for testing
- Single place for data access logic

---

### Database Schema (V1)

#### Core Tables

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SPARK Sessions
CREATE TABLE spark_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    situation TEXT NOT NULL,
    perception_data JSONB,
    affect_data JSONB,
    response_data JSONB,
    key_result_data JSONB,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    INDEX idx_user_created (user_id, started_at DESC)
);

-- WAVE Sessions
CREATE TABLE wave_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    trigger TEXT NOT NULL,
    feeling VARCHAR(50) NOT NULL,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
    acceptance_statements TEXT[],
    actions_taken TEXT[],
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    INDEX idx_user_created (user_id, started_at DESC)
);

-- POPCORN Ideas
CREATE TABLE popcorn_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    tags VARCHAR(50)[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_tags (tags)
);

-- Event Store (for audit trail and analytics)
CREATE TABLE event_store (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_aggregate (aggregate_id, created_at),
    INDEX idx_user (user_id, created_at),
    INDEX idx_event_type (event_type, created_at)
);
```

#### Analytics Views (Materialized)

```sql
-- User progress summary
CREATE MATERIALIZED VIEW user_progress_summary AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT ss.id) as spark_sessions,
    COUNT(DISTINCT ws.id) as wave_sessions,
    COUNT(DISTINCT pi.id) as ideas_captured,
    MAX(ss.completed_at) as last_spark_session,
    MAX(ws.completed_at) as last_wave_session
FROM users u
LEFT JOIN spark_sessions ss ON u.id = ss.user_id AND ss.completed = true
LEFT JOIN wave_sessions ws ON u.id = ws.user_id AND ws.completed = true
LEFT JOIN popcorn_ideas pi ON u.id = pi.user_id
GROUP BY u.id;

-- Refresh strategy: Daily or on-demand
CREATE INDEX idx_user_progress ON user_progress_summary(user_id);
```

---

### API Endpoint Structure

```
# Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me

# SPARK Module
POST   /api/v1/spark/sessions                    # Start new session
GET    /api/v1/spark/sessions/{id}               # Get session details
PUT    /api/v1/spark/sessions/{id}/perception    # Update perception step
PUT    /api/v1/spark/sessions/{id}/affect        # Update affect step
PUT    /api/v1/spark/sessions/{id}/response      # Update response step
PUT    /api/v1/spark/sessions/{id}/key-result    # Complete session
GET    /api/v1/spark/sessions                    # List user sessions
GET    /api/v1/spark/reframes                    # Get reframe questions (hardcoded in V1)

# WAVE Module
POST   /api/v1/wave/sessions                     # Start new session
GET    /api/v1/wave/sessions/{id}                # Get session details
PUT    /api/v1/wave/sessions/{id}/acknowledge    # Update acknowledge step
PUT    /api/v1/wave/sessions/{id}/accept         # Update accept step
PUT    /api/v1/wave/sessions/{id}/act            # Complete session
GET    /api/v1/wave/sessions                     # List user sessions
GET    /api/v1/wave/actions                      # Get action library
GET    /api/v1/wave/acceptance-statements        # Get acceptance statements

# POPCORN Module
POST   /api/v1/popcorn/ideas                     # Capture new idea
GET    /api/v1/popcorn/ideas/{id}                # Get idea details
PUT    /api/v1/popcorn/ideas/{id}                # Update idea
DELETE /api/v1/popcorn/ideas/{id}                # Delete idea
GET    /api/v1/popcorn/ideas                     # List ideas (with tag filters)
GET    /api/v1/popcorn/tags                      # Get user's tags

# Analytics (V1 Basic)
GET    /api/v1/analytics/summary                 # User progress summary
GET    /api/v1/analytics/patterns                # Basic pattern insights
```

---

### Infrastructure & Deployment (V1)

#### Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL 15+ (Supabase or AWS RDS)
- Alembic (migrations)
- Pydantic (validation)
- SQLAlchemy 2.0 (ORM)

**Frontend:**
- Flutter 3.x
- Riverpod/Bloc (state management)
- Dio (HTTP client)
- Hive (local storage)

**DevOps:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- AWS ECS/Fargate (or Fly.io)
- Sentry (error tracking)
- CloudWatch (logs & metrics)

#### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CloudFront (CDN)                       │
│              SSL/TLS Termination                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│            Application Load Balancer (ALB)               │
│         Health checks, Auto-scaling triggers             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              ECS/Fargate (2+ instances)                  │
│  ┌───────────────────┐    ┌───────────────────┐        │
│  │ FastAPI Container │    │ FastAPI Container │        │
│  │  • API Server     │    │  • API Server     │        │
│  │  • Workers        │    │  • Workers        │        │
│  └───────────────────┘    └───────────────────┘        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL (RDS Multi-AZ)                      │
│         Primary + Read Replica                           │
└─────────────────────────────────────────────────────────┘
```

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          python -m pytest tests/
          coverage report --fail-under=70
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t dose-api:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login...
          docker push dose-api:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster dose-prod \
            --service dose-api \
            --force-new-deployment
```

---

## 🚀 Version 2 Architecture

### Enhanced System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Mobile Application                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway + BFF Layer                    │
│              (Backend-for-Frontend Pattern)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Async Processing Layer (NEW)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Redis Queue  │  │ Celery       │  │ Event        │     │
│  │ (Tasks)      │  │ Workers      │  │ Handlers     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               AI Orchestration Layer (NEW)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LLM Service  │  │ Voice Service│  │ RAG Engine   │     │
│  │ (OpenAI)     │  │ (Deepgram)   │  │ (Pinecone)   │     │
│  │ • Reframes   │  │ • STT        │  │ • Coach KB   │     │
│  │ • Analysis   │  │ • Voice ID   │  │ • Embeddings │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (Enhanced)                      │
│  PostgreSQL + Redis Cache + Vector DB (Pinecone)            │
└─────────────────────────────────────────────────────────────┘
```

### Key V2 Additions

#### 1. Async Processing with Celery

```python
# tasks/llm_tasks.py
from celery import Celery

celery_app = Celery('dose', broker='redis://localhost:6379/0')

@celery_app.task(bind=True, max_retries=3)
def generate_personalized_reframes(
    self,
    session_id: UUID,
    situation: str,
    user_history: dict
):
    try:
        # Call OpenAI API
        response = openai.ChatCompletion.create(...)
        
        # Store results
        await update_session_reframes(session_id, response)
        
        return {"status": "success"}
    except Exception as e:
        self.retry(exc=e, countdown=60)

# Usage in API
@router.post("/spark/sessions/{id}/perception")
async def update_perception(session_id: UUID, data: dict):
    # Immediate response
    session = await service.update_perception(session_id, data)
    
    # Async AI enhancement
    generate_personalized_reframes.delay(
        session_id, 
        data["situation"],
        await get_user_history(session.user_id)
    )
    
    return session
```

#### 2. LLM Integration with OpenAI

```python
# services/llm_service.py
class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4-turbo"
    
    async def generate_spark_reframes(
        self,
        situation: str,
        user_context: dict
    ) -> List[str]:
        
        prompt = f"""
        You are an ADHD coach helping someone reframe their thoughts.
        
        Situation: {situation}
        User's typical patterns: {user_context.get('patterns', 'N/A')}
        
        Generate 4 powerful reframe questions that:
        1. Challenge catastrophic thinking
        2. Encourage perspective-taking
        3. Focus on what's controllable
        4. Are specific to this person's situation
        
        Format: Return only the questions, one per line.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert ADHD coach."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        questions = response.choices[0].message.content.strip().split('\n')
        return [q.strip() for q in questions if q.strip()]
```

#### 3. Voice Integration with Deepgram

```python
# services/voice_service.py
class VoiceService:
    def __init__(self):
        self.deepgram = Deepgram(settings.DEEPGRAM_API_KEY)
    
    async def transcribe_idea(
        self,
        audio_data: bytes,
        user_id: UUID
    ) -> dict:
        
        response = await self.deepgram.transcription.prerecorded({
            'buffer': audio_data,
            'mimetype': 'audio/webm'
        }, {
            'punctuate': True,
            'model': 'nova-2',
            'language': 'en-US'
        })
        
        transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
        confidence = response['results']['channels'][0]['alternatives'][0]['confidence']
        
        return {
            'text': transcript,
            'confidence': confidence
        }
```

#### 4. RAG with Pinecone

```python
# services/rag_service.py
class RAGService:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self.pc.Index("dose-coach-knowledge")
        self.embeddings = OpenAIEmbeddings()
    
    async def get_coach_insights(
        self,
        user_query: str,
        user_context: dict
    ) -> str:
        # Generate embedding for query
        query_embedding = await self.embeddings.embed_query(user_query)
        
        # Search similar content in coach knowledge base
        results = self.index.query(
            vector=query_embedding,
            top_k=3,
            include_metadata=True,
            filter={"category": "adhd_strategies"}
        )
        
        # Build context from results
        context = "\n\n".join([
            match['metadata']['text'] 
            for match in results['matches']
        ])
        
        # Generate personalized response with LLM
        prompt = f"""
        Based on this expert ADHD coaching knowledge:
        {context}
        
        User's situation: {user_query}
        User's history: {user_context}
        
        Provide a personalized insight or tip.
        """
        
        response = await openai.ChatCompletion.create(...)
        return response.choices[0].message.content
```

---

### RSD METER Module (V2)

```sql
-- RSD Episodes
CREATE TABLE rsd_episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
    trigger_description TEXT,
    reality_test_responses JSONB,
    interventions_used TEXT[],
    recovery_time_minutes INTEGER,
    episode_started_at TIMESTAMP DEFAULT NOW(),
    episode_resolved_at TIMESTAMP,
    INDEX idx_user_created (user_id, episode_started_at DESC)
);
```

**API Endpoints:**
```
POST   /api/v1/rsd/episodes                      # Start RSD episode
PUT    /api/v1/rsd/episodes/{id}/reality-test    # Reality testing step
PUT    /api/v1/rsd/episodes/{id}/intervention    # Apply intervention
PUT    /api/v1/rsd/episodes/{id}/resolve         # Mark resolved
GET    /api/v1/rsd/episodes                      # Get user episodes
GET    /api/v1/rsd/patterns                      # Pattern analysis
```

---

## 🔒 Security Considerations

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Password hashing with bcrypt (cost factor 12)
- Rate limiting (100 req/min per user)
- CORS properly configured

### Data Protection
- Encryption at rest (AWS RDS encryption)
- Encryption in transit (TLS 1.3)
- PII data handling (GDPR/CCPA compliant)
- Regular security audits

### API Security
```python
# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/spark/sessions")
@limiter.limit("100/minute")
async def get_sessions(request: Request):
    ...
```

---

## 📊 Monitoring & Observability

### Structured Logging
```python
import structlog

logger = structlog.get_logger()

logger.info(
    "spark_session_started",
    user_id=str(user_id),
    session_id=str(session.id),
    duration_ms=elapsed_time
)
```

### Metrics (Prometheus)
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Database query times
- Cache hit rates
- LLM API costs (V2)

### Distributed Tracing
- OpenTelemetry integration
- Correlation IDs across services
- Request flow visualization

---

## 🎯 Extension Pitch Material (V3 & V4)

### Version 3: HeyGen Interactive Avatar
**Estimated effort:** 8-10 weeks  
**Key features:**
- Real-time AI coaching sessions
- Emotional intelligence integration
- Multi-modal interactions (voice + visual)
- Session recording & playback

### Version 4: Custom Deep Learning Model
**Estimated effort:** 12-16 weeks  
**Key features:**
- Custom ADHD pattern recognition model
- Reduced dependency on OpenAI (cost savings)
- Proprietary IP ownership
- Fine-tuned for DOSE user base
- Real-time inference optimization

---

## 📈 Success Metrics

### V1 Success Criteria
- [ ] All 4 modules functional
- [ ] App Store & Play Store approved
- [ ] <2s average API response time
- [ ] >70% test coverage
- [ ] Zero critical security issues

### V2 Success Criteria
- [ ] LLM personalization working
- [ ] Voice capture >90% accuracy
- [ ] RAG insights rated helpful by users
- [ ] All V1 performance maintained
- [ ] AI costs <$0.10 per user/month

---

## 🗓️ Implementation Timeline

See Asana project for detailed weekly breakdown:
- **Weeks 1-4:** Backend foundation + Flutter setup
- **Weeks 5-7:** SPARK, WAVE, POPCORN modules
- **Week 8:** V1 polish & store submission
- **Weeks 9-11:** RSD METER + LLM + Voice
- **Weeks 12-13:** RAG + final polish

---

**Document Version:** 1.0  
**Last Updated:** December 16, 2025  
**Next Review:** January 15, 2026
