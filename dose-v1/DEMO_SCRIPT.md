# DOSE Platform - Week 1 Demo Script

## Demo Overview

**Duration:** 10-15 minutes
**Goal:** Showcase SPARK feature and backend architecture
**Audience:** Internship supervisors, team members

---

## Pre-Demo Setup

### 1. Start the Backend Server

```bash
cd dose-v1/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify:** Server running at `http://localhost:8000`

### 2. Prepare API Client

Use **Postman**, **Insomnia**, or **curl** for API testing

### 3. Have Documentation Ready

- README.md
- API_DOCUMENTATION.md
- DOSE_System_Architecture.md

---

## Demo Script

### Part 1: Project Introduction (2 min)

**What to Say:**

> "I've built DOSE - an ADHD support platform with a sophisticated backend architecture. This week I completed the SPARK feature, which is a cognitive restructuring tool that helps users work through anxiety and negative thought patterns using a 5-step framework."

**Show:**
- Project directory structure
- README.md overview
- Architecture diagram (if available)

**Key Points:**
- Domain-Driven Design architecture
- FastAPI with async Python
- PostgreSQL database
- JWT authentication
- Scalable to 1M+ users

---

### Part 2: Authentication Demo (3 min)

#### Step 1: Register a User

**API Call:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@dose.app",
    "password": "SecurePass123!",
    "full_name": "Demo User"
  }'
```

**What to Say:**
> "First, let me register a new user. The system uses bcrypt for password hashing and validates email format automatically."

**Expected Response:** User created with UUID

#### Step 2: Login

**API Call:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo@dose.app",
    "password": "SecurePass123!"
  }'
```

**What to Say:**
> "Now I'll login to receive a JWT token. This token will authenticate all future requests."

**Expected Response:** Access token and refresh token

**Copy the access_token for next steps!**

---

### Part 3: SPARK Feature Demo (8 min)

#### Step 1: Create a SPARK Session

**API Call:**
```bash
curl -X POST http://localhost:8000/api/v1/spark/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**What to Say:**
> "Let me create a new SPARK cognitive restructuring session. SPARK stands for Situation, Perception, Affect, Response, and Key Result - a 5-step framework for working through anxiety."

**Expected Response:** New session with `status: "in_progress"`, `current_step: 1`

**Copy the session ID!**

#### Step 2: Complete the 5 Steps

**Step 1 - Situation:**
```bash
curl -X PUT http://localhost:8000/api/v1/spark/sessions/{SESSION_ID}/steps \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 1,
    "response": "I felt overwhelmed when my manager asked for the weekly report this morning. I had completely forgotten it was due today and felt unprepared."
  }'
```

**What to Say:**
> "In step 1, the user describes the triggering situation. Notice how the system validates that steps must be completed sequentially - you can't skip ahead."

**Step 2 - Perception:**
```bash
curl -X PUT http://localhost:8000/api/v1/spark/sessions/{SESSION_ID}/steps \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 2,
    "response": "I thought everyone would think I am incompetent and unreliable. I worried my manager would regret hiring me."
  }'
```

**What to Say:**
> "Step 2 captures the negative thoughts that emerged. This is where users identify their cognitive distortions."

**Step 3 - Affect:**
```bash
curl -X PUT http://localhost:8000/api/v1/spark/sessions/{SESSION_ID}/steps \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 3,
    "response": "I felt anxious, ashamed, and panicked. My heart was racing and I wanted to hide."
  }'
```

**What to Say:**
> "Step 3 helps users recognize and name their emotions - a key part of emotional regulation for ADHD."

**Step 4 - Response:**
```bash
curl -X PUT http://localhost:8000/api/v1/spark/sessions/{SESSION_ID}/steps \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 4,
    "response": "I took a deep breath and reminded myself that forgetting things is common with ADHD. I told my manager I would have it ready by end of day and set an alarm. One mistake does not define my entire performance."
  }'
```

**What to Say:**
> "Step 4 is where users apply cognitive reframes and coping strategies. This is the therapeutic intervention step."

**Step 5 - Key Result:**
```bash
curl -X PUT http://localhost:8000/api/v1/spark/sessions/{SESSION_ID}/steps \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step_number": 5,
    "response": "I learned that I need to set up a weekly reminder for recurring tasks. I also realized that catastrophizing makes my anxiety worse - my manager was understanding when I communicated openly."
  }'
```

**What to Say:**
> "The final step captures the learning. Notice that when I submit step 5, the session automatically completes and records the completion timestamp."

**Expected Response:** Session status changes to `"completed"`, `completed_at` timestamp populated

#### Step 3: Retrieve Session History

**API Call:**
```bash
curl -X GET http://localhost:8000/api/v1/spark/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**What to Say:**
> "Users can retrieve all their past sessions for reflection and pattern recognition. This supports long-term therapeutic benefit."

**Expected Response:** List of sessions with summary data

#### Step 4: Security Demo (Optional)

**Try accessing another user's session (should fail):**

**What to Say:**
> "The system enforces strict ownership rules. Users can only access their own sessions, never another user's data."

**Expected Response:** 403 Forbidden

---

### Part 4: Code Quality & Architecture (2 min)

**Show in VS Code or IDE:**

1. **Domain Layer** (`modules/spark/domain/entities/spark_session.py`)
   - "Business logic lives in the domain entity"
   - "Notice the step progression validation"
   - "Automatic completion when step 5 is filled"

2. **Service Layer** (`modules/spark/application/services/spark_service.py`)
   - "Application logic coordinates between layers"
   - "Uses repository pattern for data access"
   - "All methods have comprehensive docstrings"

3. **API Layer** (`modules/spark/api/endpoints/__init__.py`)
   - "FastAPI endpoints with dependency injection"
   - "JWT authentication on all protected routes"
   - "Proper HTTP status codes and error handling"

**What to Say:**
> "I followed Domain-Driven Design principles with clear separation of concerns. The architecture is designed to scale - all database operations use async/await, and the repository pattern allows us to swap implementations without touching business logic."

---

## Key Talking Points

### Technical Achievements

- **Clean Architecture:** DDD with domain, application, infrastructure layers
- **Type Safety:** Full Pydantic models and type hints
- **Security:** JWT authentication, bcrypt hashing, ownership verification
- **Async/Await:** Non-blocking I/O throughout the stack
- **Documentation:** Comprehensive README, API docs, and inline docstrings

### Business Value

- **SPARK Feature:** Clinically-inspired cognitive tool for ADHD users
- **Data Ownership:** Users fully control their therapeutic data
- **Scalability:** Architecture supports 1M+ users
- **Extensibility:** Easy to add new modules (WAVE, POPCORN)

### Week 1 Scope

✅ Complete backend authentication system
✅ Full SPARK module (domain, service, API, database)
✅ Database migrations and schema
✅ Comprehensive documentation
✅ Security implementation
✅ Code quality (docstrings, type hints, clean code)

---

## Potential Questions & Answers

**Q: Why FastAPI over Django or Flask?**
> A: FastAPI offers native async support, automatic API documentation, Pydantic validation, and superior performance. Perfect for our scalability goals.

**Q: What's next for the platform?**
> A: V2 will add event sourcing for user analytics, WAVE emotional acceptance module, POPCORN task management, and real-time features with WebSockets.

**Q: How do you ensure data privacy?**
> A: JWT authentication, ownership verification on every request, bcrypt password hashing, and database-level foreign key constraints. In production, we'll add encryption at rest.

**Q: What about testing?**
> A: Test structure is in place. Next steps include unit tests for services, integration tests for repositories, and E2E tests for API endpoints. Target: >80% coverage.

**Q: Can this scale?**
> A: Yes - async Python with PostgreSQL connection pooling, Redis caching in V2, horizontal scaling with stateless API design, and event-driven architecture for analytics.

---

## Closing Statement

> "In week 1, I've built a production-ready backend foundation with sophisticated architecture, comprehensive documentation, and a fully functional SPARK cognitive tool. The codebase is clean, well-documented, and designed for long-term scalability. Thank you!"

---

## Backup Demo (If API Issues)

If the live API isn't working:

1. **Show Code Walkthrough** instead
2. **Use Postman Collection** (import pre-configured requests)
3. **Show Database** directly with pgAdmin or `psql`
4. **Walk through Architecture Document** highlighting V1 vs V2 plans

---

## Demo Checklist

Before presenting:

- [ ] Backend server running
- [ ] Database migrations applied
- [ ] .env file configured correctly
- [ ] Postman/curl requests tested
- [ ] Documentation files open in tabs
- [ ] IDE open to key files
- [ ] Practice run completed
- [ ] Timing: 10-15 minutes

---

**Good luck with your demo! 🚀**
