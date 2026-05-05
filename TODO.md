# Testing Plan for LingoMaster AI

## ✅ 1. Install dependencies
✓ npm install complete

## ✅ 2. Prisma setup
✓ Prisma Client generated, schema pushed to Neon PG DB

## ✅ 3. Start dev server
✓ Running on http://localhost:3001 (port 3000 used, Turbopack ready)

## [ ] 4. Test Grammar Lab
- Enter text e.g. \"I has a apple\"
- Submit → expect AI correction
- Check console/DB for save

## ✅ 5. Lint and Build
✓ Lint: 14 TS issues (no-explicit-any x13, unused-var x1)
✓ Build: ✓ Compiled successfully

## [ ] 6. API Tests
curl -X POST http://localhost:3000/api/grammar -H \"Content-Type: application/json\" -d '{\"text\":\"test wrong grammar\"}'

Notes:
- Ensure .env has DATABASE_URL, OPENROUTER_API_KEY or GROQ_API_KEY, UPSTASH_REDIS_* vars

