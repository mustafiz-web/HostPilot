# Host Pilot — Production Deployment Guide & Architecture

> Version: 1.0.0 (Production Release Preparation)  
> Scope: Single-hostel MVP with scalable boundaries for multi-tenant expansion.  
> Status: Pre-deployment Review. **Do not deploy or purchase services without explicit owner approval.**

---

## 1. Executive Summary & Architecture Overview

Host Pilot is built with a separated client-server architecture:
- **Frontend:** React 19 + TypeScript + Vite SPA, styled with Tailwind CSS and shadcn/ui.
- **Backend API:** Node.js 20+ + Express + TypeScript, secured with Helmet, strict CORS, rate limiting, and Zod input validation.
- **Database:** MySQL 8.0+ managed via Prisma ORM 6.4.1.

```
                    ┌───────────────────────────────┐
                    │    Cloudflare / DNS & CDN     │
                    │      (SSL Termination & DDoS)  │
                    └──────────────┬────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
              ▼                                         ▼
   Frontend Application                      Backend API Gateway
   https://hostpilot.example.com             https://api.hostpilot.example.com
   (Static SPA on CDN / Nginx)               (Node.js / Express Cluster via PM2)
              │                                         │
              │  REST API Calls / JWT Bearer            │  Prisma ORM (Connection Pool)
              └────────────────────────────────────────►│
                                                        ▼
                                             MySQL Production Database
                                             (utf8mb4_unicode_ci / Daily Backups)
```

---

## 2. Hosting Options & Cost Comparison

Based on the approved single-hostel MVP scope, predictability, budget constraints, and operational complexity, here is the comparative analysis:

| Criteria | Option A: Modern Managed Cloud (Recommended for MVP) | Option B: Self-Managed VPS | Option C: Enterprise Cloud (AWS / GCP) |
|---|---|---|---|
| **Frontend Platform** | Vercel / Netlify / Cloudflare Pages | Nginx on VPS | AWS CloudFront + S3 |
| **Backend Platform** | Railway / Render / DigitalOcean App Platform | VPS (Ubuntu 24.04 + PM2 / Docker) | AWS ECS / App Runner |
| **Database Platform** | Railway / PlanetScale / Aiven MySQL | Local MySQL 8.0 on VPS | AWS RDS for MySQL (db.t4g.micro) |
| **Monthly Cost (Est.)** | **\$5 – \$15 / month** (or free tier) | **\$6 – \$12 / month** | **\$35 – \$65+ / month** |
| **Setup Complexity** | Very Low (Push-to-Deploy, Git integration) | Medium (Requires Linux CLI, Nginx, SSL setup) | High (VPC, IAM, Security Groups) |
| **Maintenance Burden** | Zero OS/patching maintenance | High (Requires OS security updates, firewall) | Medium-High (AWS configuration management) |
| **SSL / HTTPS** | Automated Let's Encrypt certificates | Certbot / Let's Encrypt cronjob | AWS ACM Certificate Manager |
| **Auto-scaling** | Yes (Built-in container restarts & scaling) | Vertical only (resize VPS) | Highly scalable (Auto Scaling Groups) |
| **Recommendation** | **Best for immediate MVP launch**: high uptime, low ops overhead, fast CI/CD. | **Alternative for tight budget with Linux expertise**. | Overkill for single-hostel MVP. |

---

## 3. Environment Variables & Secret Management

### 3.1 Strict Security Rules
1. **Never commit `.env` files** to Git. Ensure `.gitignore` ignores `*.env`, `.env.*.local`.
2. **Generate Cryptographically Secure Secrets:** Use 256-bit random keys for production:
   ```bash
   openssl rand -base64 32
   ```
3. **Use Environment Secret Managers:** Inject environment variables via your hosting dashboard (e.g. Railway Variables, Vercel Environment Variables, Doppler, or AWS Parameter Store).

### 3.2 Backend Production Environment Variables
| Variable | Required | Description | Production Example |
|---|---|---|---|
| `NODE_ENV` | **Yes** | Runtime environment mode | `production` |
| `PORT` | **Yes** | Server listening port | `5000` |
| `DATABASE_URL` | **Yes** | MySQL connection string with SSL | `mysql://hp_user:STRONG_SECRET@db.host.com:3306/hostpilot_prod?sslmode=require` |
| `JWT_SECRET` | **Yes** | Key for signing and verifying tokens (min 32 chars) | `(32-char cryptographically random string)` |
| `JWT_EXPIRES_IN` | **Yes** | Token expiration lifespan | `7d` |
| `COOKIE_SECRET` | **Yes** | Key for signing HTTP cookies | `(32-char cryptographically random string)` |
| `CLIENT_URL` | **Yes** | Allowed frontend origin for CORS and cookies | `https://hostpilot.example.com` |
| `APP_TIMEZONE` | No | Application timezone | `Asia/Dhaka` |
| `LOG_LEVEL` | No | Minimum logging verbosity | `info` |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit sliding window (ms) | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | No | Maximum requests per IP window | `100` |

### 3.3 Frontend Production Environment Variables
| Variable | Required | Description | Production Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Public endpoint to the backend API | `https://api.hostpilot.example.com/api/v1` |

---

## 4. HTTPS, CORS & Cookie Security Configuration

1. **Strict Transport Security (HSTS):** Enforced by `helmet()` on all API responses in production.
2. **CORS:** 
   - Backend only allows origins defined in `env.CLIENT_URL`.
   - `credentials: true` is strictly bound to explicit domain origins (wildcards `*` are rejected).
3. **Cookie Attributes (Production):**
   ```ts
   {
     httpOnly: true,             // Prevents XSS script access
     secure: true,               // Enforces HTTPS-only transmission
     sameSite: 'lax',            // CSRF protection for cross-site navigations
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     path: '/'
   }
   ```

---

## 5. Database Migration & Maintenance Strategy

### 5.1 Safe Production Migration Rule
> [!CAUTION]
> Never run `prisma migrate dev`, `prisma db push`, or `migrate reset` on a production database! These commands can drop tables or erase historical records.

Always use:
```bash
npx prisma migrate deploy
```
`prisma migrate deploy` applies only pending, reviewed migration files without prompting or executing destructive resets.

### 5.2 Automated Database Backups & Retention
1. **Daily Scheduled Backup Script:**
   ```bash
   mysqldump -u <db_user> -p<db_password> --single-transaction --quick --routines --triggers hostpilot_prod | gzip > /backups/hostpilot_$(date +%Y%m%d_%H%M%S).sql.gz
   ```
2. **Retention Policy:**
   - Daily backups retained for **14 days**.
   - Weekly backups retained for **8 weeks**.
   - Monthly backups retained for **12 months**.
3. **Offsite Storage:** Encrypted backups pushed to private object storage (e.g. AWS S3 Glacier or Cloudflare R2).

### 5.3 Restore Drill (Tested & Verified)
```bash
gunzip < /backups/hostpilot_YYYYMMDD.sql.gz | mysql -u <db_user> -p<db_password> hostpilot_prod
```

---

## 6. Logging, Monitoring & Incident Response

1. **Request Identification:** Every incoming request receives a unique UUID (`X-Request-ID`), traceable across client and server logs.
2. **Safe Logging:** Sensitive fields (passwords, tokens, blood group, phone) are never printed to terminal or application logs.
3. **Process Supervision:** In VPS deployments, supervise Node.js processes using **PM2**:
   ```bash
   pm2 start dist/server.js --name "hostpilot-api" -i max
   pm2 startup
   pm2 save
   ```
4. **Health Monitoring:**
   - Automated heartbeat endpoint: `GET /api/v1/health`
   - Setup free external uptime monitor (e.g. Uptime Kuma or Better Stack) to ping the health endpoint every 60 seconds with email/SMS alerts on failure.

---

## 7. Domain, DNS & Routing

### 7.1 DNS Record Recommendations
| Type | Name / Host | Target / Destination | Purpose |
|---|---|---|---|
| `CNAME` | `hostpilot.example.com` | `cname.vercel-dns.com` (or CDN) | Public Frontend |
| `CNAME` | `api.hostpilot.example.com` | `railway.app` (or VPS IP) | Backend API |
| `A` | `@` | (Host IP or Redirect) | Root domain redirect |

### 7.2 Single Page Application (SPA) Fallback
For client-side routing (`React Router`), web servers must route non-file requests to `/index.html`:
- **Nginx Configuration:**
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
- **Vercel:** Configured via `vercel.json` (`rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]`).
- **Netlify / Cloudflare Pages:** Configured via `public/_redirects` (`/* /index.html 200`).

---

## 8. Pre-Deployment Verification Checklist

Before giving deployment approval, confirm each item:

- [ ] **Production Build Check:** `npm run build` succeeds in both `frontend` and `backend`.
- [ ] **Test Coverage:** All unit, integration, and security tests pass (`npm test`).
- [ ] **Environment Variables:** Production `.env` configured on host; no development credentials used.
- [ ] **Database Setup:** Production MySQL database initialized with `utf8mb4_unicode_ci`.
- [ ] **Prisma Migration:** Migrations verified and applied via `npx prisma migrate deploy`.
- [ ] **Default Admin Account:** Seeded or manually created with a strong, non-default password.
- [ ] **HTTPS Enforced:** SSL certificates verified on both frontend and backend domains.
- [ ] **CORS Verification:** `CLIENT_URL` strictly matches frontend production URL.
- [ ] **SPA Rewrites:** Fallback to `/index.html` configured on web server.
- [ ] **Automated Backups:** Daily backup cron scheduled and tested.
- [ ] **Owner Approval:** Final sign-off received from project owner.
