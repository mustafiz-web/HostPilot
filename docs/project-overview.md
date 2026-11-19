# Project Overview — Host Pilot

> Project name: **Host Pilot**  
> Product type: Web-based Hostel Management System  
> Initial deployment scope: Single-hostel for MVP, designed with clean architectural boundaries to support multi-hostel extension post-MVP.

## 1. Product Vision

Build a modern, secure, responsive Hostel Management System (**Host Pilot**) that centralizes hostel operations and gives administrators and students role-appropriate access to information and services.

The system consists of three connected experiences:

1. **Public Website** — information about the hostel, facilities, room categories, notices, and public admission applications.
2. **Admin Panel** — operational management of students, admissions, rooms, beds, allocations, payments, expenses, complaints, notices, and operational reports.
3. **Student Panel** — authenticated student portal for viewing personal profile, assigned room/bed, payment history and receipts, hostel notices, and filing/tracking complaints.

The product must be usable on desktop, tablet, and mobile devices.

## 2. Technology Stack (Fixed Unless the Owner Approves a Change)

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Motion for purposeful, subtle animation
- React Router for routing
- TanStack Query for server state and API caching
- React Hook Form + Zod for forms and validation
- Lucide React for icons
- i18next + react-i18next for Bangla/English localization

### Backend
- Node.js
- Express.js
- TypeScript
- REST API
- Zod for request validation
- bcrypt for password hashing
- Helmet and rate limiting for baseline API security

### Database
- MySQL
- Prisma ORM
- Prisma migrations for schema evolution

### Development and Quality
- Visual Studio Code
- Git and GitHub
- Postman or an equivalent API client
- Vitest for unit tests
- Playwright for browser/end-to-end tests where appropriate

**Compatibility rule:** Before installing or upgrading packages, inspect current official documentation and verify compatibility among Node.js, Prisma, its MySQL driver adapter, TypeScript, and the selected packages. Do not assume a package's latest major version is compatible with the existing project.

## 3. Product Areas

### 3.1 Public Website
Initial pages:
- Home
- About
- Rooms / Room details
- Facilities
- Admission information / Application (Public submission without prior login)
- Contact
- Login (Admin and Student)
- Forgot password (Admin-assisted / mock recovery in MVP)

### 3.2 Admin Panel
Initial modules:
- Dashboard and analytics (occupancy, revenue, complaints summary)
- Student management (profiles, status, contact details)
- Admission management (review applications, approve/reject, enroll)
- Room management (rooms, floors, rates, bed capacity)
- Bed management & allocation (assign/vacate beds, allocation history)
- Payment management and receipts (manual payment collection, monthly billing)
- Expense management (operational hostel expenses)
- Complaint management (review and status updates)
- Notice management (draft, publish, archive)
- Staff management (TBC — record profile only, no separate login in MVP)
- Reports (occupancy, payments, expenses)
- Account and hostel settings

### 3.3 Student Panel
Initial modules:
- Dashboard
- My profile
- My room / allocation details
- My payments and payment history
- Payment details / receipts
- My complaints (submit, track progress)
- Notices
- Hostel rules and information
- Account security / change password

## 4. Roles

Approved MVP Roles:
- **Admin:** authorized hostel-wide operational and financial management.
- **Student:** access strictly restricted to their own personal profile, assigned bed, payments, complaints, and published notices.
- **Staff:** *TBC (Deferred post-MVP)*. In MVP, staff records may exist as administrative metadata, but staff do not have independent logins or permissions.

## 5. Design Direction

- Theme: Light
- Primary color family: Emerald
- Languages: Bangla and English
- Typography: Inter for Latin text and Noto Sans Bengali for Bangla
- UI foundation: shadcn/ui with Tailwind CSS
- Animation: Motion, used sparingly and only where it improves feedback or transitions
- Layout: mobile-first and fully responsive
- Visual direction: clean, modern, professional, readable, consistent
- Avoid excessive gradients, glassmorphism, decorative animation, and inconsistent page-specific styling.

Create reusable design tokens and components. The same design system must be used across the public website, admin panel, and student panel.

## 6. Product Principles

1. Correctness and data integrity are more important than visual effects.
2. Protect student and financial information.
3. Enforce authorization on the backend, not only by hiding frontend controls.
4. Use real API/database integration for completed features; mock data is allowed only in explicitly identified UI prototyping phases.
5. Preserve historical records such as payments and room allocations.
6. Keep code modular, maintainable, documented, and testable.
7. Do not add optional features without documenting their scope and obtaining approval.
8. Never claim a feature is complete unless it has been verified.

## 7. Scope Decisions Status

Approved Decisions:
- Final project/brand name: **Host Pilot** (Approved)
- Initial scope: **One hostel** for MVP, extensible database design (Approved)
- Account creation: **Admin-created** upon admission approval; public admission application without prior account (Approved)
- Payment method: **Manual payment recording** by Admin (cash/bank); online payment gateway is *TBC* (Approved)
- Staff login: *TBC (Deferred post-MVP)*; only Admin and Student logins for MVP (Approved)
- Admission application: **Online submission via Public Website** (Approved)
- Currency and locale: **BDT (৳)** and Bangladesh locale (`Asia/Dhaka`), Bangla + English UI (Approved)

Unresolved Decisions (Marked TBC):
- Online payment gateway integration (TBC)
- Automated SMS/Email notification delivery (TBC — Admin-assisted password reset in MVP)
- Multi-hostel multi-tenancy support (TBC — deferred post-MVP)
- Granular staff roles (Warden, Accountant) with discrete dashboards (TBC — deferred post-MVP)
