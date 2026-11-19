# Requirements — Host Pilot

## 1. Purpose

Define the initial functional and non-functional requirements for Host Pilot. This document is the baseline for implementation and acceptance testing.

Requirement status:
- **MVP:** required for the first usable version.
- **Later:** optional enhancement; do not implement without approval.
- **TBC:** must be confirmed by the project owner.

## 2. User Roles and Access

### 2.1 Public Visitor
- View public pages, hostel details, room categories, and facilities.
- Submit an online admission application without requiring prior account registration.
- Access the login page and password recovery options.

### 2.2 Admin (MVP Role)
- Sign in securely via email and password.
- View operational dashboard (occupancy rate, revenue, active complaints, pending admissions).
- Manage students: create, view, update profile details, and toggle active/inactive status.
- Review and process online admission applications (Pending, Approved, Rejected).
- Manage rooms, floors, capacities, rates, and individual beds.
- Allocate and vacate beds for enrolled students; track allocation history.
- Record payments manually (cash/bank), issue receipts, and track monthly dues.
- Record and categorize operational hostel expenses.
- Review student complaints and update resolution statuses.
- Create, publish, and archive hostel notices.
- View and export operational reports (occupancy, payments, expenses).
- Manage hostel settings and review audit history.

### 2.3 Student (MVP Role)
- Sign in securely using credentials issued upon admission approval.
- View and update permitted personal profile fields.
- View assigned room and bed details, including roommates and allocation dates.
- View personal billing history, paid payments, dues, and download receipts.
- Submit new complaints and track their resolution progress.
- View published hostel notices and rules.
- Change password and manage personal account security.

### 2.4 Staff (TBC — Deferred Post-MVP)
- Staff login and independent staff dashboard are deferred post-MVP.
- In MVP, staff records may exist as basic administrative directory data managed solely by Admin.

## 3. Functional Requirements

### FR-01: Authentication (MVP)
- Email/password login and secure logout.
- Password hashing with bcrypt (minimum cost factor 10).
- Server-side token/session validation with HttpOnly, Secure, SameSite cookies.
- Password recovery: In MVP (without active email/SMS gateways), password reset is handled via Admin reset or development console tokens.
- Protect private routes on the frontend and all protected API endpoints on the backend.
- Return consistent authentication (401) and authorization (403) errors.

### FR-02: Role-Based Authorization (MVP)
- Strict server-side enforcement of `ADMIN` and `STUDENT` roles.
- Students must never access another student's private records by manipulating IDs in URLs or API payloads (IDOR prevention).
- Admin endpoints strictly restricted to Admin role.
- Frontend route guards serve as UX guidance, never as a substitute for backend authorization.

### FR-03: Student Management (MVP)
- Maintain student profiles with unique student codes (e.g., `HP-STU-YYYY-XXXX`).
- Validate required fields (name, email, phone, guardian contact).
- Support `ACTIVE`, `INACTIVE`, and `ALUMNI` statuses.
- Preserve student records; soft-delete or deactivate rather than hard-deleting records tied to financial or allocation history.

### FR-04: Admission Management (MVP)
- Public online admission application form capturing applicant and guardian details, room preference.
- Track application status: `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN`.
- Admin reviews applications with decision notes and approval timestamp.
- Upon approval, system creates the `Student` and `User` record with temporary login credentials.
- Bed allocation can only proceed after an application is approved.

### FR-05: Room and Bed Management (MVP)
- Manage rooms with room number, floor, room type, capacity, and monthly rent.
- Track discrete physical beds per room (`Bed` entity with bed code/number and status: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
- Enforce that room capacity strictly matches its bed inventory.
- Prevent capacity overflow.

### FR-06: Room/Bed Allocation (MVP)
- Allocate an approved/active student to a specific available bed.
- Prevent overlapping active allocations for the same bed or student.
- Record allocation start date and vacated/end date.
- Preserve full historical allocation trail.
- Wrap allocation operations in database transactions with concurrency guards.

### FR-07: Payments & Billing (MVP)
- Record manual payments: billing month/period, amount, payment method (Cash, Bank Transfer, bKash/Nagad manual reference), and receipt reference.
- Prevent duplicate monthly rent records for the same student and billing period.
- Allow viewing and printing of payment receipts.
- Payment gateway integration is marked *TBC (Deferred post-MVP)*.

### FR-08: Expenses (MVP)
- Record operational hostel expenses: category, amount, date, description, and recorded-by user.
- Restricted strictly to Admin.
- Include expenses in dashboard analytics and financial reports.

### FR-09: Complaints (MVP)
- Students can submit complaints with category/subject and description.
- Students can view and track only their own complaints.
- Admin reviews and updates complaint status: `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`.
- Maintain audit timestamps for review and resolution.

### FR-10: Notices (MVP)
- Admin can create, edit, publish, and archive notices.
- Students can view published notices; draft notices remain hidden.
- Support priority/pinned notices if required.

### FR-11: Staff Management (TBC — Deferred Post-MVP)
- Basic staff directory record for Admin reference only. No staff login or permissions in MVP.

### FR-12: Dashboard and Reports (MVP)
- Admin dashboard: live counts of total students, total beds, occupied beds, vacancy rate, monthly collected revenue, and pending complaints.
- Student dashboard: assigned bed summary, recent notices, due payments, and complaint status.
- Exportable/printable reports for Occupancy, Payments, and Expenses (date-filtered).

### FR-13: Localization (MVP)
- Full bilingual UI text in Bangla and English.
- Header language toggle switch persisting user choice in local storage.
- Standardized formatting for dates, numbers, and currency (`BDT / ৳`) with `Asia/Dhaka` timezone.
- Zero hard-coded UI strings; all labels sourced from `i18n` dictionaries.

## 4. Core Business Rules

1. Room capacity must never be exceeded.
2. A bed cannot have overlapping active allocations.
3. An admission must meet the approved eligibility/status rule before allocation.
4. A student can access only their own private profile, room, payment, and complaint data.
5. Payment history and allocation history must be preserved.
6. Duplicate billing-period payments must be prevented according to the approved billing model.
7. Critical multi-step operations must use database transactions.
8. Financial amounts must use an appropriate exact decimal representation, not floating-point arithmetic.
9. Dates and billing periods must be stored and compared consistently; document timezone assumptions.
10. Deactivation/archival should be preferred over destructive deletion when records are historically important.

## 5. Non-Functional Requirements

### Security
- Passwords must be hashed using a suitable password-hashing algorithm.
- Validate all untrusted input on the server.
- Apply authentication and authorization to protected API routes.
- Use secure cookie/session settings if cookie-based authentication is selected.
- Implement CSRF protection when required by the chosen cookie authentication design.
- Configure CORS narrowly for trusted frontend origins.
- Use rate limiting and security headers.
- Keep secrets in environment variables and never commit real `.env` files.
- Avoid exposing stack traces, secrets, or internal database errors to clients.

### Reliability and Data Integrity
- Use foreign keys, unique constraints, indexes, transactions, and appropriate delete/update rules.
- Handle duplicate submissions and concurrent requests safely.
- Provide database backup and restore instructions before deployment.

### Usability and Accessibility
- Responsive layouts for mobile, tablet, and desktop.
- Clear labels, keyboard-accessible controls, visible focus states, and readable contrast.
- Every async interaction should provide loading, success, and error feedback.
- Forms should provide field-level validation messages.

### Maintainability
- TypeScript strict mode.
- Modular feature-based code.
- Shared types/contracts where practical without coupling frontend runtime to backend internals.
- Consistent naming, linting, formatting, and error handling.
- Document setup, environment variables, migrations, seed data, and API behavior.

### Performance
- Paginate large tables on the server.
- Avoid unnecessary API requests and expensive repeated queries.
- Add indexes based on actual query patterns.
- Lazy-load routes or heavy UI modules where useful.

## 6. Acceptance Criteria

A feature is not complete until:
- Its approved requirements are implemented.
- Unauthorized access is rejected by the backend.
- Input validation and error states work.
- Data persists correctly where persistence is required.
- Relevant tests pass.
- TypeScript checks and production build pass.
- Browser verification is completed for user-facing flows.
- Documentation is updated.
- Remaining limitations are reported honestly.

## 7. Status of Questions and Decisions

### Confirmed Decisions:
- **Project Name:** **Host Pilot** (Confirmed).
- **Initial Scope:** Single-hostel for MVP, schema structured to permit future multi-hostel support without breaking core models (Confirmed).
- **Student Account Creation:** Created automatically by Admin action upon approving an admission application, which issues student credentials (Confirmed).
- **Online Admission Application:** Yes, public applicants can submit an admission application form online without creating an account first (Confirmed).
- **Payment Method:** Recorded manually by Admin (Cash, Bank Transfer, bKash/Nagad manual reference) with printable receipts (Confirmed).
- **Localization & Currency:** Bangla and English support, currency `BDT` (৳), timezone `Asia/Dhaka` (Confirmed).
- **Required Engineering Order:** Documentation → Structure/Environment → Frontend → Backend → Database Integration → Testing (Confirmed).

### Unresolved Items (Marked TBC):
- **Online Payment Gateway:** *TBC* (Deferred post-MVP).
- **SMS / Email Automated Notifications:** *TBC* (Deferred post-MVP; password reset handled via Admin reset or development mock log).
- **Staff Accounts & Granular Permissions:** *TBC* (Deferred post-MVP; staff records exist only as Admin metadata without independent login).
- **Partial Payments, Refunds & Late Fees:** *TBC* (MVP tracks monthly rent billing status: PAID or DUE).
- **Advanced Export Formats:** *TBC* (MVP provides print-ready view and basic CSV/JSON exports).
