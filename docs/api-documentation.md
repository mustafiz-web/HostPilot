# REST API Documentation — Host Pilot

> Proposed API contract. Finalize request/response fields after requirements and database design are approved.

## 1. API Conventions

- Base path: `/api/v1`
- Content type: `application/json`
- Authentication: selected secure cookie/session or token strategy; document exact implementation.
- Validate all path parameters, query parameters, and request bodies on the server.
- Use consistent response envelopes.
- Use pagination for collection endpoints.
- Never return password hashes, secrets, or unnecessary private fields.

### Success response

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed"
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid",
    "details": []
  }
}
```

## 2. Status Code Guidance

- `200` — successful read/update/action.
- `201` — resource created.
- `204` — successful operation with no response body, where appropriate.
- `400` — malformed or invalid request.
- `401` — unauthenticated.
- `403` — authenticated but not authorized.
- `404` — resource not found or intentionally concealed.
- `409` — conflict, duplicate, or state conflict.
- `422` — semantically invalid input, if adopted consistently.
- `429` — rate limit exceeded.
- `500` — unexpected server error; do not expose internal details.

## 3. Proposed Endpoint Inventory

### Authentication
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Sign in |
| POST | `/auth/logout` | Authenticated | Sign out |
| GET | `/auth/me` | Authenticated | Current user |
| POST | `/auth/forgot-password` | Public | Start recovery |
| POST | `/auth/reset-password` | Public with valid token | Reset password |

Registration endpoint is TBC. Do not expose unrestricted admin registration.

### Students (Implemented - Batch 1)
| Method | Endpoint | Access | Purpose | Status |
|---|---|---|---|---|
| GET | `/students` | Admin | Paginated, searchable & filterable student list | ✅ Implemented |
| POST | `/students` | Admin | Atomically create User, Student & Guardian records | ✅ Implemented |
| GET | `/students/me/profile` | Student | Logged-in student's own complete profile | ✅ Implemented |
| GET | `/students/:id` | Admin or owning student | Complete student profile, guardian & allocations | ✅ Implemented |
| PATCH | `/students/:id` | Admin or owning student | Update student profile (phone, address, blood group) | ✅ Implemented |
| PATCH | `/students/:id/status` | Admin | Change student status (ACTIVE, INACTIVE, SUSPENDED) | ✅ Implemented |

#### Student Endpoints Contract Details

##### 1. POST `/api/v1/students`
- **Access:** Admin only (`Bearer <token>` or HttpOnly cookie)
- **Request Body:**
```json
{
  "name": "Tanvir Ahmed",
  "email": "tanvir@campus.edu.bd",
  "studentCode": "HP-STU-2026-001",
  "phone": "01711223344",
  "department": "CSE",
  "rollNumber": "045",
  "session": "2022-23",
  "batch": "23",
  "bloodGroup": "B+",
  "address": "Uttara, Dhaka",
  "dateOfBirth": "2003-05-15T00:00:00.000Z",
  "guardianName": "Rafiqul Islam",
  "guardianRelation": "পিতা",
  "guardianPhone": "01811987654",
  "emergencyContact": "01811987654"
}
```
- **Response (201 Created):** Returns created student record along with user and guardian relations.
- **Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `409 CONFLICT` (if email or studentCode exists).

##### 2. GET `/api/v1/students`
- **Access:** Admin only
- **Query Params:** `page` (default: 1), `limit` (default: 10, max: 100), `search` (name, email, studentCode, phone, rollNumber), `department`, `session`, `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`), `sortBy`, `sortOrder` (`asc`/`desc`).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "student-uuid",
      "studentCode": "HP-STU-2026-001",
      "phone": "01711223344",
      "department": "CSE",
      "rollNumber": "045",
      "session": "2022-23",
      "status": "ACTIVE",
      "user": {
        "name": "Tanvir Ahmed",
        "email": "tanvir@campus.edu.bd"
      },
      "guardians": [
        { "name": "Rafiqul Islam", "relationship": "পিতা", "phone": "01811987654" }
      ],
      "allocations": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

##### 3. GET `/api/v1/students/:id`
- **Access:** Admin or the student whose `studentId` or `userId` matches `:id` (enforced by `requireStudentOwnership('id')`). Any other student attempting to access this returns `403 FORBIDDEN`.
- **Response (200 OK):** Single student record with user, guardians, and active bed allocations.
- **Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

##### 4. GET `/api/v1/students/me/profile`
- **Access:** Authenticated Student
- **Response (200 OK):** Current student's full profile without passing ID in URL.

##### 5. PATCH `/api/v1/students/:id`
- **Access:** Admin or owning student.
- **Request Body:** Partial fields (`phone`, `address`, `bloodGroup`, `dateOfBirth`, `guardianName`, `guardianPhone`, `emergencyContact`).
- **Response (200 OK):** Updated student object.

##### 6. PATCH `/api/v1/students/:id/status`
- **Access:** Admin only
- **Request Body:** `{ "status": "ACTIVE" | "INACTIVE" | "SUSPENDED" }`
- **Response (200 OK):** Updated student with synchronized user status.

### Admissions
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/admissions` | Public | Submit online admission application |
| GET | `/admissions` | Admin | List applications (with status filter) |
| GET | `/admissions/:id` | Admin | Application details |
| PATCH | `/admissions/:id/status` | Admin | Review decision (Approved/Rejected) |
| POST | `/admissions/:id/enroll` | Admin | Enroll approved applicant into Student & assign bed |

### Rooms and Beds
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/rooms` | Public (summary) or Authenticated | List rooms and bed counts |
| POST | `/rooms` | Admin | Create room |
| GET | `/rooms/:id` | Authorized | Room details |
| PATCH | `/rooms/:id` | Admin | Update room |
| GET | `/rooms/:id/beds` | Authorized | List beds in room |
| POST | `/rooms/:id/beds` | Admin | Add/manage beds in room |

### Allocations
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/allocations` | Admin | Allocation list and history |
| POST | `/allocations` | Admin | Allocate bed to student |
| GET | `/allocations/:id` | Admin or owning student | Allocation details |
| PATCH | `/allocations/:id/vacate` | Admin | Vacate bed / end allocation |

### Payments
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/payments` | Admin | All payments list (paginated, filtered) |
| POST | `/payments` | Admin | Record manual payment (cash/bank/mfs) |
| GET | `/payments/:id` | Admin or owning student | Payment receipt details |
| GET | `/students/me/payments` | Student | Logged-in student's payment history |
| GET | `/payments/:id/receipt` | Admin or owning student | Printable receipt data |

### Expenses
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/expenses` | Admin | List operational expenses |
| POST | `/expenses` | Admin | Record new expense |
| GET | `/expenses/:id` | Admin | Expense details |
| PATCH | `/expenses/:id` | Admin | Update expense record |

### Complaints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/complaints` | Student | Submit own complaint |
| GET | `/complaints` | Admin | List all hostel complaints |
| GET | `/complaints/me` | Student | Logged-in student's complaints |
| GET | `/complaints/:id` | Admin or owning student | Complaint details |
| PATCH | `/complaints/:id/status` | Admin | Update status (Pending/In Progress/Resolved) |

### Notices
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/notices` | Public published subset or authenticated | List visible notices |
| POST | `/notices` | Admin | Create notice |
| GET | `/notices/:id` | Authorized | Notice details |
| PATCH | `/notices/:id` | Admin | Update notice |
| PATCH | `/notices/:id/publish` | Admin | Publish/archive action |

### Dashboard and Reports
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/dashboard/admin` | Admin | Admin metrics |
| GET | `/dashboard/student` | Student | Student summary |
| GET | `/reports/occupancy` | Admin | Occupancy report |
| GET | `/reports/payments` | Admin | Payment report |
| GET | `/reports/expenses` | Admin | Expense report |

## 4. Pagination and Filtering

Proposed query convention:
- `page`: 1-based page number.
- `limit`: bounded page size, with a safe maximum.
- `search`: optional search string.
- `sortBy`: allowlisted field only.
- `sortOrder`: `asc` or `desc`.
- Resource-specific filters such as `status`, `from`, and `to`.

Example:
`GET /api/v1/students?page=1&limit=20&search=rahim&status=ACTIVE`

Return pagination metadata, for example:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## 5. Authorization Rules

- Students may only read or modify their own permitted records.
- Never trust a student ID supplied by a student client as proof of ownership.
- Derive the authenticated user's identity from the verified server-side authentication context.
- Admin routes require explicit admin permission.
- Staff permissions, if introduced, must be granular and documented.
- Apply authorization to every relevant endpoint, including nested resources and exports.

## 6. API Implementation Rules

- Keep controllers thin and move business rules into services.
- Use Zod schemas for input validation.
- Map Prisma/database errors to safe, consistent API errors.
- Avoid returning raw database errors.
- Add request logging without logging passwords, tokens, or sensitive personal data.
- Test both allowed and denied access paths.
- Document every implemented endpoint with request schema, response schema, access role, and error cases.
- Update this file when endpoint behavior changes.

## 7. Not Yet Approved

Do not implement until approved:
- Online payment gateway endpoints and webhooks.
- SMS/email notifications.
- File uploads and document storage.
- Multi-hostel/tenant selection.
- Public room availability API.
- Staff-specific endpoints.
