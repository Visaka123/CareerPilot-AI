

# CareerPilot AI

An AI-powered Personal Career Agent platform — production-ready SaaS application.

## Tech Stack

**Frontend:** React 19 + Vite, Tailwind CSS v4, Framer Motion, Recharts, Zustand, React Router v6, Axios  
**Backend:** Spring Boot 3.2, Spring Security, JWT, JPA/Hibernate, MySQL  
**AI:** OpenAI GPT-4o-mini / Gemini API integration  
**Deployment:** Vercel (frontend) + Railway/Render (backend) + PlanetScale/Railway MySQL

---

## Project Structure

```
CareerPilot-AI/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Progress.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   └── chat/
│   │   │       └── ChatAssistant.jsx
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── resume/          # AI Resume Analyzer
│   │   │   ├── jobs/            # Job Matching
│   │   │   ├── interview/       # Mock Interview
│   │   │   ├── tracker/         # Application Tracker
│   │   │   ├── roadmap/         # Career Roadmap
│   │   │   ├── linkedin/        # LinkedIn AI
│   │   │   ├── analytics/       # Analytics
│   │   │   ├── admin/           # Admin Panel
│   │   │   └── settings/        # Settings
│   │   ├── services/            # API service layer
│   │   ├── store/               # Zustand state management
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Utility functions
│   └── vercel.json
│
├── backend/                     # Spring Boot backend
│   └── src/main/java/com/careerpilot/
│       ├── controller/          # REST controllers
│       ├── service/             # Business logic
│       ├── repository/          # JPA repositories
│       ├── model/               # JPA entities
│       ├── dto/                 # Data transfer objects
│       ├── security/            # JWT auth filter
│       ├── config/              # Security config
│       └── exception/           # Global exception handler
│
└── database/
    └── schema.sql               # MySQL schema + seed data
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your DB credentials and API keys

# Run
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env .env.local
# Edit VITE_API_URL if needed

# Run dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Demo Credentials

| Role  | Email                    | Password |
|-------|--------------------------|----------|
| User  | demo@careerpilot.ai      | demo123  |
| Admin | admin@careerpilot.ai     | demo123  |

---

## API Endpoints

### Auth
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Register user      |
| POST   | /api/auth/login       | Login              |
| GET    | /api/auth/me          | Get profile        |
| PUT    | /api/auth/profile     | Update profile     |

### Dashboard
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | /api/dashboard/stats        | Career stats       |
| GET    | /api/dashboard/activity     | Activity feed      |

### Resume
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| POST   | /api/resume/upload          | Upload resume      |
| POST   | /api/resume/{id}/analyze    | AI analysis        |
| GET    | /api/resume                 | List resumes       |

### Jobs
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | /api/jobs                   | All jobs           |
| GET    | /api/jobs/search?q=         | Search jobs        |
| GET    | /api/jobs/recommended       | AI recommendations |

### Applications
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | /api/applications           | All applications   |
| POST   | /api/applications           | Add application    |
| PUT    | /api/applications/{id}      | Update status      |
| DELETE | /api/applications/{id}      | Delete             |

### Interview
| Method | Endpoint                        | Description        |
|--------|---------------------------------|--------------------|
| POST   | /api/interview/generate         | Generate questions |
| POST   | /api/interview/{id}/answer      | Submit + get score |
| GET    | /api/interview/history          | Session history    |

### AI Features
| Method | Endpoint                        | Description        |
|--------|---------------------------------|--------------------|
| POST   | /api/chat/message               | AI career chat     |
| POST   | /api/linkedin/generate-post     | LinkedIn post      |
| POST   | /api/linkedin/generate-message  | Recruiter message  |
| POST   | /api/linkedin/generate-email    | Outreach email     |
| POST   | /api/roadmap/generate           | Career roadmap     |

### Admin (ADMIN role required)
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | /api/admin/stats            | Platform stats     |
| GET    | /api/admin/users            | All users          |
| PUT    | /api/admin/users/{id}       | Update user        |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Deploy via Vercel CLI
npx vercel --prod

# Or connect GitHub repo to Vercel dashboard
# Set environment variable: VITE_API_URL=https://your-backend.railway.app/api
```

### Backend → Railway

1. Push backend to GitHub
2. Create new Railway project → Deploy from GitHub
3. Add MySQL service in Railway
4. Set environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `CORS_ORIGINS=https://your-app.vercel.app`
5. Set start command: `mvn spring-boot:run -Dspring-boot.run.profiles=prod`

### Backend → Render

1. Create Web Service → Connect GitHub repo
2. Build command: `mvn clean package -DskipTests`
3. Start command: `java -jar target/careerpilot-backend-1.0.0.jar --spring.profiles.active=prod`
4. Add environment variables as above

---

## AI Integration

### OpenAI (Recommended)
```properties
OPENAI_API_KEY=sk-your-key-here
```
Uses `gpt-4o-mini` model for cost efficiency.

### Gemini (Alternative)
```properties
GEMINI_API_KEY=your-gemini-key
```

### Fallback Mode
If no API key is configured, the app uses intelligent pre-built responses for all AI features — fully functional for demos.

---

## Features

| Module | Status |
|--------|--------|
| Landing Page | Complete |
| Authentication (JWT) | Complete |
| User Dashboard | Complete |
| AI Resume Analyzer | Complete |
| AI Job Matching | Complete |
| AI Mock Interview | Complete |
| Application Tracker (Kanban + List) | Complete |
| Career Roadmap Generator | Complete |
| LinkedIn AI Assistant | Complete |
| Analytics Dashboard | Complete |
| Admin Panel | Complete |
| AI Chat Assistant | Complete |
| Notifications | Complete |
| Settings | Complete |
| Dark Mode | Complete |
| Responsive Design | Complete |

---

## Environment Variables Reference

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=CareerPilot AI
```

### Backend (application.properties)
```
DB_USERNAME=root
DB_PASSWORD=password
JWT_SECRET=your-256-bit-secret
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:5173
```

---

## License

MIT License — Free to use for portfolio, startup, and commercial projects.
