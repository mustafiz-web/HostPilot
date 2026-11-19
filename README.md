<<<<<<< HEAD
# Host Pilot — Hostel Management System

Host Pilot is a modern, secure, responsive web-based Hostel Management System designed to centralize and streamline hostel operations for administrators and students.

## System Architecture

The project is structured into three connected interfaces:
1. **Public Website** — Hostel information, facilities, room categories, notices, and public online admission applications.
2. **Admin Panel** — Comprehensive hostel management: admissions review, room & bed management, transactional allocations, manual payment collection with receipts, expense tracking, notice management, complaints handling, and operational analytics.
3. **Student Panel** — Authenticated student portal: personal profile, assigned bed & room details, billing history, payment receipts, complaint submission & tracking, and published notices.

## Fixed Technology Stack

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, shadcn/ui, Motion, TanStack Query, React Hook Form + Zod, React Router, i18next (Bangla & English).
- **Backend:** Node.js (LTS) + Express.js + TypeScript, REST API (`/api/v1`), Zod validation, bcrypt, Helmet, express-rate-limit.
- **Database:** MySQL + Prisma ORM (Version-controlled migrations, Decimal precision for finances).

## Design System

- **Theme:** Clean Light theme
- **Primary Color:** Emerald (`#059669` / Tailwind `emerald-600`)
- **Typography:** Inter (English) + Noto Sans Bengali (Bangla)
- **Localization:** Bilingual support (English & Bangla) with standardized currency (`BDT / ৳`) and timezone (`Asia/Dhaka`).

## Repository Structure

```text
Host Pilot/
├── frontend/             # React + TypeScript + Vite application
│   └── .env.example      # Frontend environment placeholders
├── backend/              # Node.js + Express.js + TypeScript REST API
│   └── .env.example      # Backend environment placeholders
├── docs/                 # Project documentation & source of truth
│   ├── project-overview.md
│   ├── requirements.md
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-documentation.md
│   └── development-roadmap.md
├── .gitignore            # Git exclusion rules (secrets, dependencies, logs)
└── README.md             # Project documentation entry point
```

## Mandatory Engineering Order

1. Documentation
2. Project folder / repository structure
3. Development environment setup
4. Frontend foundation and UI
5. Frontend feature pages and verification
6. Backend foundation and API
7. Prisma and MySQL integration
8. Backend business modules and persistence
9. Frontend / backend / database integration
10. Testing, security review, and final verification

## Documentation Source of Truth

For detailed specifications, consult the files in `docs/`:
- [Project Overview](file:///docs/project-overview.md)
- [Requirements](file:///docs/requirements.md)
- [Architecture](file:///docs/architecture.md)
- [Database Design](file:///docs/database-design.md)
- [API Documentation](file:///docs/api-documentation.md)
- [Development Roadmap](file:///docs/development-roadmap.md)
=======
# HostPilot
A hostel management webapp
<br> <br> <br>
Sherpur Polytechnic Institute <br>
Computer Science and Technology <br>
6th-1st <br>
Mustafizur Rahman-866441 <br>
Sams Sanian Ahamod- 866461 <br>
MD.Shaharia Rizve Srabon- 866473 <br>
Fahmena Afrin Ritu- 866433 <br>
>>>>>>> 37f4c91128e5c74c3dbd3bd1de2066f479820fe4
