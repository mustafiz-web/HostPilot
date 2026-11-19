# Development Roadmap — Host Pilot

## 1. Mandatory Working Method

The owner will provide multiple prompts over time. The AI agent must work incrementally and must not begin the next phase until the current phase is reviewed and approved.

**Required sequence:**

**Documentation → Structure → Environment Setup → Frontend → Backend → Database Integration → Testing**

The AI agent must:
- Inspect the existing workspace before changing it.
- Read the relevant files in `docs/` before every phase.
- Summarize the plan before major changes.
- Make only changes needed for the current phase.
- Preserve approved architecture and design decisions.
- Ask before destructive or security-sensitive operations.
- Report changed files, commands run, test results, and unresolved issues.
- Never claim success without verification.

## 2. Phase 0 — Documentation and Planning

Deliverables:
- Approved project overview.
- Approved functional and non-functional requirements.
- Approved architecture and repository structure.
- Approved conceptual ER diagram and database design.
- Proposed REST API contract.
- Phased development plan.
- List of assumptions and owner decisions.

Acceptance:
- Owner has reviewed and approved documentation.
- Open questions affecting architecture are resolved or explicitly deferred.
- No application implementation has started.

## 3. Phase 1 — Repository Structure and Environment Preparation

Tasks:
1. Inspect the machine's installed Node.js, npm, Git, MySQL, and relevant tools.
2. Check current official compatibility requirements.
3. Create the root repository structure and approved folders.
4. Create root README, `.gitignore`, and safe `.env.example` files as needed.
5. Initialize Git and verify the first clean commit if the owner requests it.
6. Set up frontend and backend environments in separate applications.
7. Do not connect to a real or valuable database yet.
8. Document exact commands, working directories, ports, and required environment variables.

Acceptance:
- Folder structure matches approved architecture.
- Frontend and backend can be started independently when their scaffolds are ready.
- No secrets are committed.
- Setup instructions work from a clean checkout.

## 4. Phase 2 — Frontend Foundation and Design System

Tasks:
1. Create React + TypeScript + Vite application.
2. Configure Tailwind CSS and shadcn/ui according to current official instructions.
3. Configure routing, shared providers, and design tokens.
4. Add typography and Bangla/English localization foundation.
5. Build reusable navigation, buttons, forms, cards, tables, dialogs, feedback states, and layout primitives.
6. Create Public, Admin, and Student layouts.
7. Build approved pages using mock data only where explicitly permitted.
8. Verify responsive behavior.

Acceptance:
- TypeScript check and production build pass.
- Routes and navigation work.
- Design is consistent across panels.
- Mobile, tablet, and desktop layouts are verified.
- Mock data is clearly isolated and labeled.

## 5. Phase 3 — Frontend Feature Pages

Build in small batches:
1. Public website.
2. Admin dashboard and navigation shell.
3. Student dashboard and navigation shell.
4. Students and admissions UI.
5. Rooms and allocations UI.
6. Payments and expenses UI.
7. Complaints and notices UI.
8. Staff and reports UI, if approved.
9. Settings and localization polish.

Acceptance:
- Each page has loading, empty, error, and appropriate success states.
- Forms have validation and accessible labels.
- No fake interactive controls.
- No unrelated page regressions.

## 6. Phase 4 — Backend Foundation

Tasks:
1. Create Express + TypeScript application.
2. Configure environment validation, CORS, Helmet, rate limiting, logging, and error handling.
3. Establish `/api/v1` route structure.
4. Implement shared validation and response conventions.
5. Implement authentication and authorization foundation.
6. Add health-check endpoint.
7. Add backend unit/integration test setup.

Acceptance:
- Server starts reliably.
- Health endpoint responds.
- Invalid environment configuration fails safely.
- Error handling and security middleware are verified.
- API tests pass.

## 7. Phase 5 — Prisma and MySQL Integration

Tasks:
1. Confirm the selected Prisma major version and its official MySQL setup.
2. Configure the correct Prisma datasource and any required driver adapter.
3. Configure database connection using environment variables (`DATABASE_URL`).
4. Finalize schema based on approved database design.
5. Generate and review migrations (`prisma migrate dev`).
6. Apply migrations only to the intended development database.
7. Create safe development seed data (`seed.ts`).
8. Verify relations, constraints, indexes, and transactions.
9. Test allocation and payment conflict scenarios at the database layer.

Acceptance:
- Migrations apply successfully to a development database.
- Prisma client generation succeeds.
- CRUD operations and relations work.
- Critical integrity rules are verified.
- No production database is touched.

## 8. Phase 6 — Backend Business Modules and Persistence

Implement and test modules in dependency order:
1. Users and authentication (bcrypt, JWT/session cookie, role guards).
2. Students and guardians.
3. Admissions (public submission, admin review, auto-enrollment).
4. Rooms and beds (capacity and bed inventory).
5. Allocations (transactional assignment, duplicate prevention, vacating).
6. Billing and payments (manual collection, receipt number, due tracking).
7. Expenses (categorized hostel operational expenses).
8. Complaints (student submission, admin status management).
9. Notices (draft, publish, archive).
10. Dashboard analytics and report aggregation.

For each module:
- Confirm requirements and API contract.
- Implement validation (Zod), authorization, service logic, and Prisma persistence.
- Test success, validation failure, unauthorized access, not-found, and conflict cases.
- Update API documentation.

## 9. Phase 7 — Frontend/Backend Integration

Tasks:
- Replace approved mock data with real API calls.
- Configure API base URL and credential handling.
- Implement loading, empty, success, and error states.
- Verify authentication persistence and logout.
- Verify role-specific routing and server-side authorization.
- Verify student ownership restrictions.
- Verify pagination, filters, and reports.
- Verify receipt and document flows if approved.

Acceptance:
- Full user journeys work against the development database.
- No frontend-only security assumptions.
- API and UI behavior match documentation.

## 10. Phase 8 — Testing and Security Review

Testing layers:
- TypeScript and lint checks.
- Unit tests for business logic.
- API integration tests.
- Database integration tests.
- Browser/end-to-end tests for critical journeys.
- Responsive visual checks.
- Authorization and ownership tests.
- Input validation and error handling tests.
- Migration and backup/restore rehearsal.

Critical journeys:
1. Admin login.
2. Create/review an admission.
3. Create a room and beds.
4. Allocate an eligible student to an available bed.
5. Reject duplicate/concurrent bed allocation.
6. Record a payment.
7. Reject duplicate billing-period payment according to approved rules.
8. Student login and access own data.
9. Student is denied access to another student's private records.
10. Student submits a complaint and admin updates its status.
11. Admin publishes a notice and student can view it.

Acceptance:
- All critical journeys pass.
- Known issues are documented.
- No unresolved critical security or data-integrity defect.
- Build and tests pass.

## 11. Phase 9 — Finalization and Deployment Preparation

Tasks:
- Production build and configuration review.
- Environment variable documentation.
- HTTPS and secure cookie configuration plan.
- Database backup/restore procedure.
- Deployment architecture and hosting decision.
- Logging and monitoring plan.
- User/admin guide.
- Final README and handover report.

Do not deploy, purchase services, publish secrets, or modify production infrastructure without owner approval.

## 12. Git Checkpoints

Recommended commits after approved milestones:
- `docs: add project blueprint`
- `chore: initialize project structure`
- `feat(frontend): establish design system`
- `feat(frontend): build public and dashboard layouts`
- `feat(backend): initialize api foundation`
- `feat(auth): implement authentication and roles`
- `feat(database): add approved prisma schema`
- `feat: integrate core hostel modules`
- `test: verify critical user journeys`

Commit only working, reviewed changes. Do not rewrite Git history or force-push without explicit approval.

## 13. Definition of Done

A phase is complete only when:
- Scope matches the approved plan.
- Code and documentation are updated.
- TypeScript/build checks pass where applicable.
- Relevant automated and manual tests pass.
- Browser verification is complete for UI work.
- Security and data-integrity implications are reviewed.
- Changed files and test results are reported.
- Remaining limitations are clearly stated.
- Owner approves the phase.
