# OdontoSuite Backend

Dental clinic management system backend built with NestJS, TypeScript, and Prisma.

## Architecture

This project follows **Domain-Driven Design (DDD)** with 7 Bounded Contexts:

- **Identity** — Authentication, authorization, user management
- **Patient** — Patient management, medical history
- **Appointment** — Appointment scheduling and management
- **Treatment** — Treatment planning and records
- **Billing** — Invoicing and payment processing
- **Clinic** — Clinic management and service configuration
- **Reporting** — Analytics and audit logs

## Tech Stack

- **Framework:** NestJS 10
- **Language:** TypeScript 6
- **ORM:** Prisma
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Auth:** JWT + Passport
- **Testing:** Jest + Supertest
- **Linting:** ESLint

## Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Development

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your local settings
```

3. **Setup database:**
```bash
npx prisma migrate dev
```

4. **Start development server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Docker Setup

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3000)
- MailHog (port 8025)

## Available Scripts

```bash
npm run start        # Start production server
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:cov     # Test coverage report
npm run test:e2e     # Run E2E tests
```

## API Endpoints

### Health Check
- `GET /health` — System health status

### Authentication
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login user
- `POST /auth/me` — Get current user (requires JWT)

### Patients
- `POST /patients` — Create patient
- `GET /patients/:id` — Get patient by ID
- `GET /patients?clinicId=...` — List patients by clinic

### Appointments
- `POST /appointments` — Create appointment
- `GET /appointments/:id` — Get appointment by ID
- `GET /appointments/patient/:patientId` — Get patient's appointments
- `PATCH /appointments/:id/status` — Update appointment status

## Database Schema

Run migrations with:
```bash
npx prisma migrate dev --name "your migration name"
```

View database schema:
```bash
npx prisma studio
```

## Testing

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # E2E tests
```

## Project Structure

```
src/
├── common/                      # Shared infrastructure
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── decorators/
│   └── services/
│
├── identity/                    # Auth & User Management Context
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── patient/                     # Patient Context
├── appointment/                 # Appointment Context
├── treatment/                   # Treatment Context
├── billing/                     # Billing Context
├── clinic/                      # Clinic Context
├── reporting/                   # Reporting Context
│
├── app.module.ts               # Root module
├── main.ts                     # Application bootstrap
└── health.controller.ts        # Health check
```

## Key Patterns

### Repository Pattern
All data access is done through repositories in `infrastructure/repositories/`.

### Use Cases
Business logic is encapsulated in use cases (`application/use-cases/`).

### Value Objects
Domain value objects provide type safety (e.g., `EmailVO`).

### DTOs
Request/response data is validated using DTOs.

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing key
- `REDIS_HOST` — Redis server hostname
- `CORS_ORIGIN` — Frontend URL for CORS

## Development Workflow

1. Create a feature branch: `git checkout -b feat/JIRA-123-feature-name`
2. Make changes following DDD structure
3. Write tests for new features
4. Run linting: `npm run lint`
5. Create PR with clear description

## Documentation

- [STACK.md](../docs/STACK.md) — Technology stack and architecture
- [GUIDE.md](../docs/GUIDE.md) — Frontend/backend integration guide
- [Prisma Docs](https://www.prisma.io/docs/) — ORM documentation
- [NestJS Docs](https://docs.nestjs.com/) — Framework documentation

## Troubleshooting

### Database connection issues
```bash
# Check connection string in .env
# Ensure PostgreSQL is running
# Reset migrations: npx prisma migrate reset
```

### TypeScript errors
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Port conflicts
```bash
# Change PORT in .env or docker-compose.yml
```

## Contributing

See [CLAUDE.md](../CLAUDE.md) for code style guidelines and [STACK.md](../docs/STACK.md) for architectural decisions.

## License

MIT
