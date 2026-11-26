<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:047857,50:059669,100:34d399&height=220&section=header&text=Host%20Pilot&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=Modern%20Hostel%20Management%20System&descSize=20&descAlignY=60&animation=fadeIn" alt="Host Pilot banner" width="100%" />

<a href="https://github.com/mustafiz-web/HostPilot">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=1400&color=059669&center=true&vCenter=true&width=760&lines=One+platform+for+admins%2C+students+and+visitors;Rooms+%C2%B7+Beds+%C2%B7+Payments+%C2%B7+Complaints+%C2%B7+Notices;Secure%2C+bilingual+(English+%26+%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE)+and+fully+responsive" alt="Typing animation" />
</a>

<br/>

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
<br/>
![Node.js](https://img.shields.io/badge/Node.js_20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

[![Status](https://img.shields.io/badge/status-active_development-059669?style=flat-square)](#-roadmap)
[![API](https://img.shields.io/badge/REST_API-v1-059669?style=flat-square)](#-api-overview)
[![i18n](https://img.shields.io/badge/i18n-EN_%7C_BN-059669?style=flat-square)](#-feature-highlights)
[![Tests](https://img.shields.io/badge/tests-Vitest_%2B_Supertest-059669?style=flat-square)](#-testing)
[![Repo](https://img.shields.io/github/last-commit/mustafiz-web/HostPilot?style=flat-square&color=059669)](https://github.com/mustafiz-web/HostPilot/commits/main)

**[Overview](#-overview)** · **[Features](#-feature-highlights)** · **[Architecture](#-architecture)** · **[Getting Started](#-getting-started)** · **[API](#-api-overview)** · **[Security](#-security)** · **[Docs](#-documentation)**

</div>

---

## 📖 Overview

**Host Pilot** is a secure, responsive, web-based **Hostel Management System** that centralizes day-to-day hostel operations — admissions, room and bed inventory, allocations, payments and receipts, expenses, complaints, and notices — and gives every user a role-appropriate experience.

It is built as a single repository containing a React front end, an Express REST API, and a MySQL database managed through Prisma. Correctness, data integrity, and the protection of student and financial information come before visual effects.

> **Scope:** single-hostel MVP with clean architectural boundaries so multi-hostel support can be added later.

<div align="center">

| 🌐 Public Website | 🛠️ Admin Panel | 🎓 Student Portal |
| :--- | :--- | :--- |
| Hostel info, facilities, room categories, notices, and online admission applications — no account required. | Admissions, students, rooms & beds, allocations, payments, expenses, complaints, notices, reports, and settings. | Profile, assigned room & bed, payment history & receipts, complaints, notices, rules, and account security. |

</div>

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🏠 Hostel Operations
- Room, floor, rate, and **bed-level inventory**
- **Transactional** bed allocation, vacating, and history
- Public admission form with admin review, approval, and enrollment
- Student and guardian records

</td>
<td width="50%" valign="top">

### 💳 Finance
- Manual payment collection — **Cash, Bank Transfer, bKash, Nagad**
- Auto-generated receipt numbers (`HP-REC-YYYY-00001`)
- Categorized operational **expense tracking**
- Precise `Decimal` money handling, currency in **BDT (৳)**

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📣 Communication
- Notice management (draft → publish → archive)
- Complaint submission and status tracking by category and priority
- Public and student-facing notice boards

</td>
<td width="50%" valign="top">

### 📊 Insight & Experience
- Admin dashboard with occupancy, revenue, and complaint analytics
- Reports for occupancy, payments, and expenses
- **Bilingual UI** (English & বাংলা) with `Asia/Dhaka` timezone
- Mobile-first, fully responsive layouts

</td>
</tr>
</table>

<details>
<summary><b>🛠️ Admin Panel modules</b></summary>
<br/>

| Module | What it does |
| :--- | :--- |
| Dashboard | Occupancy, revenue, and complaint summaries |
| Students | Profiles, status, guardians, contact details |
| Admissions | Review applications, approve / reject, enroll |
| Rooms | Rooms, floors, rates, and bed capacity |
| Allocations | Assign and vacate beds with full allocation history |
| Payments | Manual collection, monthly billing, receipts |
| Expenses | Categorized operational expenses |
| Complaints | Review and update complaint status |
| Notices | Draft, publish, and archive notices |
| Reports | Occupancy, payments, and expense reports |
| Settings | Account and hostel settings |

</details>

<details>
<summary><b>🎓 Student Portal modules</b></summary>
<br/>

| Module | What it does |
| :--- | :--- |
| Dashboard | Personal overview |
| Profile | View personal information |
| My Room | Assigned room and bed details |
| Payments | Payment history and receipts |
| Complaints | Submit and track complaints |
| Notices | Published hostel notices |
| Rules | Hostel rules and information |
| Security | Change password |

</details>

---

## 🧰 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19 · TypeScript · Vite 6 · Tailwind CSS · shadcn/ui (Radix UI) · Motion · React Router 7 · TanStack Query · React Hook Form + Zod · i18next · Lucide Icons |
| **Backend** | Node.js 20+ · Express · TypeScript · Zod · JWT (HttpOnly cookie) · bcryptjs · Helmet · express-rate-limit · CORS |
| **Database** | MySQL · Prisma ORM 6 (typed client, seed script) |
| **Quality** | Vitest · Supertest |
| **Deployment** | Frontend on Vercel-style SPA hosting (`vercel.json` rewrite included) · API on any Node host · managed MySQL |

---

## 🏗️ Architecture

```mermaid
flowchart TD
    V[Public Visitor] --> FE
    A[Admin] --> FE
    S[Student] --> FE
    FE["React + TypeScript + Vite<br/>(TanStack Query · i18next)"]
    FE -->|HTTPS · REST JSON| API["Express + TypeScript API<br/>/api/v1"]
    API --> MW["Middleware<br/>auth · roles · ownership · validation · rate limit"]
    MW --> SVC[Business Services]
    SVC --> ORM[Prisma ORM]
    ORM --> DB[(MySQL)]
```

The frontend never talks to the database directly — every protected read and write goes through the API, which enforces authorization on the server.

### Backend module layout

Each feature is a self-contained module with thin controllers and business logic in services:

```text
modules/<feature>/
├── <feature>.routes.ts       # route definitions + middleware wiring
├── <feature>.controller.ts   # HTTP request / response handling
├── <feature>.service.ts      # business logic & Prisma access
└── <feature>.schema.ts       # Zod validation schemas
```

### Data model

```mermaid
erDiagram
    USER ||--o| STUDENT : "has profile"
    STUDENT ||--o{ GUARDIAN : has
    ROOM ||--|{ BED : contains
    BED ||--o{ ROOM_ALLOCATION : "assigned via"
    STUDENT ||--o{ ROOM_ALLOCATION : holds
    STUDENT ||--o{ PAYMENT : makes
    STUDENT ||--o{ COMPLAINT : files
    EXPENSE_CATEGORY ||--o{ EXPENSE : groups
```

The schema also covers `Admission`, `Notice`, `HostelSettings`, and `AuditLog`. See [`docs/database-design.md`](docs/database-design.md) for the full design.

---

## 📁 Project Structure

```text
Host Pilot/
├── frontend/                  # React + TypeScript + Vite application
│   └── src/
│       ├── app/               # router & providers
│       ├── components/        # ui/ (shadcn) and shared/ components
│       ├── layouts/           # public · admin · student shells
│       ├── features/          # auth · public · admin · student pages
│       ├── i18n/              # English & Bangla translations
│       ├── lib/               # API client, formatters, utilities
│       └── styles/            # global styles & design tokens
├── backend/                   # Node.js + Express + TypeScript API
│   ├── prisma/                # schema.prisma & seed.ts
│   ├── src/
│   │   ├── config/            # env validation, database, logger
│   │   ├── middlewares/       # auth, roles, CSRF, rate limit, validation…
│   │   ├── modules/           # feature modules (see above)
│   │   └── utils/             # API response & error helpers
│   └── tests/                 # Vitest + Supertest suites
├── docs/                      # Project documentation (source of truth)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **npm**
- **MySQL** 8.x (a local or hosted database you are free to experiment on)

### 1 · Clone the repository

```bash
git clone https://github.com/mustafiz-web/HostPilot.git
cd HostPilot
```

### 2 · Set up the backend

```bash
cd backend
npm install
cp .env.example .env          # then edit values (see Environment Variables)

npx prisma generate
npx prisma migrate dev        # create / apply the schema to your dev database
npx prisma db seed            # seed expense categories and development accounts

npm run dev                   # API → http://localhost:5000/api/v1
```

> 💡 Set `NODE_ENV=development` in your local `.env` (the example file defaults to `production`).

### 3 · Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env          # set VITE_API_BASE_URL (defaults to http://localhost:5000/api/v1)

npm run dev                   # App → http://localhost:5173
```

### Available scripts

| Where | Command | Purpose |
| :--- | :--- | :--- |
| `backend` | `npm run dev` | Start the API with hot reload (`tsx watch`) |
| `backend` | `npm run build` / `npm start` | Compile TypeScript and run the production build |
| `backend` | `npm test` | Run the test suite once |
| `backend` | `npm run test:watch` | Run tests in watch mode |
| `backend` | `npm run prisma:generate` | Generate the Prisma client |
| `backend` | `npm run prisma:migrate:deploy` | Apply migrations (production-safe) |
| `frontend` | `npm run dev` | Start the Vite dev server |
| `frontend` | `npm run build` | Type-check and build for production |
| `frontend` | `npm run preview` | Preview the production build |
| `frontend` | `npm run lint` | Lint the codebase |

---

## 🔐 Environment Variables

<details open>
<summary><b>Backend — <code>backend/.env</code></b></summary>
<br/>

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` · `test` · `production` | `development` |
| `DATABASE_URL` | MySQL connection string used by Prisma | `mysql://user:password@localhost:3306/host_pilot` |
| `JWT_SECRET` | Secret for signing tokens (32+ random chars) | `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `COOKIE_SECRET` | Secret for cookies | `openssl rand -base64 32` |
| `CLIENT_URL` | Allowed frontend origin (CORS / cookies / CSRF) | `http://localhost:5173` |
| `APP_TIMEZONE` | Application timezone | `Asia/Dhaka` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in ms | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

</details>

<details>
<summary><b>Frontend — <code>frontend/.env</code></b></summary>
<br/>

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public URL of the backend API | `http://localhost:5000/api/v1` |

</details>

> ⚠️ **Never commit real secrets.** `.env` files are git-ignored; only the `.env.example` templates belong in version control. Replace all seeded development credentials before any real deployment.

---

## 🔌 API Overview

All endpoints are served under **`/api/v1`** and return a consistent JSON envelope (`success`, `data`, `message`, and pagination `meta` where relevant).

| Resource | Base path | Notes |
| :--- | :--- | :--- |
| Health | `/health` | Service health check |
| Auth | `/auth` | `register` · `login` · `logout` · `me` · `change-password` · `forgot-password` |
| Students | `/students` | Students and guardians |
| Admissions | `/admissions` | Public submission, admin review & enrollment |
| Rooms | `/rooms` | Rooms and beds |
| Allocations | `/allocations` | Assign / vacate beds, history |
| Payments | `/payments` | Manual collection and receipts |
| Expenses | `/expenses` | Categorized expenses |
| Complaints | `/complaints` | Submit, track, resolve |
| Notices | `/notices` | Draft, publish, archive |
| Dashboard | `/dashboard` | Aggregated analytics |

📘 Full request / response contracts live in [`docs/api-documentation.md`](docs/api-documentation.md).

---

## 🛡️ Security

Security is enforced **on the server**, not just by hiding UI controls.

- 🔑 **Authentication** — JWT delivered in an `HttpOnly` cookie; passwords hashed with bcrypt
- 🧑‍⚖️ **Authorization** — role guards (`ADMIN`, `STUDENT`) plus ownership checks so students can only access their own data
- 🧱 **Hardening** — Helmet security headers, strict CORS to the configured client origin
- 🚦 **Rate limiting** — global limiter plus dedicated limiters for login and registration
- 🛑 **CSRF protection** — origin / custom-header verification for state-changing requests
- ✅ **Validation** — every request validated with Zod schemas
- 🧾 **Observability** — request IDs, request logging, and a centralized error handler
- 🗃️ **Integrity** — database transactions for critical flows, and preserved payment and allocation history

---

## 🧪 Testing

The backend ships with an integration-focused test suite built on **Vitest** and **Supertest**, covering authentication, registration, students, admissions, room inventory, expenses, notices, dashboard analytics, validation, error handling, and end-to-end critical journeys.

```bash
cd backend
npm test
```

---

## ☁️ Deployment

| Component | Recommendation |
| :--- | :--- |
| **Frontend** | Any static / SPA host (Vercel, Netlify, Cloudflare Pages). A SPA fallback is already configured in `frontend/vercel.json` and `public/_redirects`. |
| **Backend** | Any Node.js 20+ host. Build with `npm run build`, run with `npm start`, and apply migrations with `npm run prisma:migrate:deploy`. |
| **Database** | Managed MySQL with automated backups and a tested restore drill. |

Set the production environment variables listed above, serve everything over **HTTPS**, and set `CLIENT_URL` to your exact frontend origin. See [`docs/deployment-guide.md`](docs/deployment-guide.md) for hosting options, cookie / CORS settings, backup strategy, monitoring, and a pre-deployment checklist.

---

## 📚 Documentation

Detailed specifications live in [`docs/`](docs/):

| Document | Description |
| :--- | :--- |
| [Project Overview](docs/project-overview.md) | Vision, roles, scope decisions, design direction |
| [Requirements](docs/requirements.md) | Functional and non-functional requirements |
| [Architecture](docs/architecture.md) | System design, layers, and responsibilities |
| [Database Design](docs/database-design.md) | Entities, relationships, and integrity rules |
| [API Documentation](docs/api-documentation.md) | REST API contract |
| [Deployment Guide](docs/deployment-guide.md) | Production deployment and operations |
| [User Guide](docs/user-guide.md) | Walkthrough for admins and students |
| [Development Roadmap](docs/development-roadmap.md) | Phases and acceptance criteria |

---

## 🎨 Design System

| Token | Value |
| :--- | :--- |
| **Theme** | Clean light theme |
| **Primary** | Emerald `#059669` (`emerald-600`) |
| **Typography** | Inter (English) · Noto Sans Bengali (বাংলা) |
| **Locale** | English & Bangla · `BDT (৳)` · `Asia/Dhaka` |
| **Approach** | Mobile-first, one shared component system across all three experiences |

---

## 🗺️ Roadmap

- [x] Public website, admin panel, and student portal
- [x] REST API with authentication, role-based access, and validation
- [x] Prisma + MySQL persistence with seed data
- [x] Bilingual (English / বাংলা) interface
- [x] Backend integration test suite
- [ ] Online payment gateway integration
- [ ] Automated SMS / email notifications
- [ ] Staff roles with dedicated permissions (e.g. warden, accountant)
- [ ] Multi-hostel support

---

## 👥 Team

**Sherpur Polytechnic Institute** · Department of Computer Science and Technology · Session 6th-1st

| Member | Roll |
| :--- | :--- |
| Fahmena Afrin Ritu | 866433 |
| Mst Fahima | 866437 |
| [**Mustafizur Rahman**](https://github.com/mustafiz-web) | 866441 |
| Sams Sanian Ahamod | 866461 |
| MD. Shaharia Rizve Srabon | 866473 |
---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch — `git checkout -b feat/amazing-feature`
3. Commit using clear messages — `git commit -m "feat: add amazing feature"`
4. Push and open a Pull Request

Please read the relevant files in [`docs/`](docs/) before proposing changes, and keep new work consistent with the documented architecture.

---

<div align="center">

**Built with care for better hostel life.** 🏠

<a href="https://github.com/mustafiz-web/HostPilot/stargazers">⭐ Star this repo if you find it useful</a>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:34d399,50:059669,100:047857&height=120&section=footer" alt="footer" width="100%" />

</div>
