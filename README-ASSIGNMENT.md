# 🎓 LTU LMS HTML Builder - Cloud Computing Assignment 2.2

**La Trobe University** | Cloud Computing Course | Assignment 2.2  
**Student:** Nathan | **Date:** October 15, 2025

---

## 🎯 Assignment Status: ✅ **100% COMPLETE**

All 7 requirements successfully implemented, tested, and documented.

---

## 📚 Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Quick Start** | Commands & overview | [ASSIGNMENT-COMPLETE.md](./ASSIGNMENT-COMPLETE.md) |
| **Implementation** | Detailed evidence | [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) |
| **AWS Guide** | Cloud deployment | [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md) |
| **Lambda Guide** | Serverless function | [lambda/README.md](./lambda/README.md) |

---

## ✅ Requirements Checklist

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Dockerize the App | ✅ | `Dockerfile`, `docker-compose.yml` |
| 2 | Add CRUD APIs | ✅ | `app/api/messages/` |
| 3 | Save Button | ✅ | `Courtroom.PRODUCTION.tsx` lines 442-507 |
| 4 | 2x Tests | ✅ | `__tests__/` - 5 tests passing |
| 5 | Instrumentation | ✅ | `instrumentation.ts`, `middleware.ts` |
| 6 | AWS Guide | ✅ | `AWS-DEPLOYMENT.md` |
| 7 | Lambda Function | ✅ | `lambda/index.js` |

---

## 🚀 Quick Start

```bash
# Install
npm install --legacy-peer-deps

# Database setup
npx prisma migrate dev --name init

# Run dev server
npm run dev
# → Visit http://localhost:3000/court-room

# Run tests
npm test
# → 5 tests pass

# Test Lambda locally
cd lambda && node test-local.js
# → Opens test-output.html

# Docker
docker-compose up -d
# → App at http://localhost:3000
```

---

## 📊 API Endpoints

```bash
GET    /api/messages       # List all
POST   /api/messages       # Create
GET    /api/messages/:id   # Get one
PUT    /api/messages/:id   # Update
DELETE /api/messages/:id   # Delete

# Test:
curl http://localhost:3000/api/messages
```

---

## 💾 Save Button Location

**Right panel** of CourtRoom, below timer controls:
- Shows message count
- ✅ Success / ❌ Error feedback
- Saves all messages to database

---

## 🧪 Tests (5 Passing)

- ✅ API GET messages
- ✅ API POST message  
- ✅ API DELETE message
- ✅ UI component rendering
- ✅ Timer functionality

---

## 📈 Project Stats

- **20+ Files Created**
- **3,000+ Lines of Code**
- **1,000+ Lines of Documentation**
- **5 API Endpoints**
- **5 Tests (100% passing)**

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Next.js 15, TypeScript
- **Backend:** Next.js API Routes, Prisma
- **Database:** SQLite (dev), PostgreSQL (prod)
- **Testing:** Jest, React Testing Library
- **DevOps:** Docker, docker-compose
- **Cloud:** AWS Lambda, ECS, RDS

---

## 📁 Key Files

```
/app/api/messages/           → CRUD endpoints
/app/court-room/             → Main app with Save button
/src/db/client.ts            → Database client
/__tests__/                  → Test files
/lambda/                     → AWS Lambda function
/Dockerfile                  → Container config
/instrumentation.ts          → Monitoring
/AWS-DEPLOYMENT.md           → Deployment guide
```

---

## 🎓 Features

- ⏱️ Timer with start/stop/reset
- 📨 Automatic message generation
- 🐛 Interactive code debugging
- 💾 **Database persistence**
- 🎯 Message escalation
- ⚖️ Court room consequences
- 🌓 Dark/light themes

---

## For Complete Details

See **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** for:
- Detailed implementation evidence
- Step-by-step verification
- Code examples
- Screenshots
- Testing instructions

---

**La Trobe University | Cloud Computing | October 2025**
