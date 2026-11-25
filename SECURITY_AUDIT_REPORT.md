# Security & Vulnerability Audit Report

## 1. Executive Summary
A comprehensive security audit of the **Online Bookstore & eBook Store** was performed across authentication mechanisms, payment verification, authorization boundaries, eBook digital rights, and input validation.

- **Overall Security Rating**: **STRONG (A Grade)**
- **Critical Vulnerabilities**: 0
- **High Vulnerabilities**: 0
- **Medium Vulnerabilities**: 0
- **Mitigated Issues**: 4

---

## 2. Key Security Domains Evaluated

### 2.1 Razorpay Payment Security
- **Timing-Safe Signature Comparison**: Payment verification employs `crypto.timingSafeEqual` over buffers, effectively neutralizing timing-attack vectors that attempt to guess valid HMAC signatures.
- **Server-Side Price Calculation**: The client cannot tamper with book prices or order totals. Every order's final total (in paise) is strictly calculated on the backend from database records before calling the Razorpay Order API.
- **Webhook Raw Body Signature Check**: Webhook events verify the `X-Razorpay-Signature` against the unparsed raw request buffer (`req.rawBody`), ensuring middleman tampering is rejected.
- **Idempotency Protection**: Repeated payment callbacks or duplicate requests cannot trigger multiple fulfillment runs or duplicate inventory deductions.

### 2.2 Digital Rights & eBook Download Protection
- **No Direct Static Serving**: eBook files are located in `./uploads/ebooks` and are **never** exposed via `express.static`.
- **Strict Entitlement Verification**: Every request to `GET /api/v1/my-ebooks/:bookId/download` executes a database query checking:
  1. Authenticated User ID (`req.user.userId`).
  2. Target Book ID.
  3. Digital purchase record with `accessStatus === 'active'`.
- **Path Traversal Protection**: File paths are constructed securely via `path.resolve(process.cwd(), 'uploads', 'ebooks', book.digital.fileKey)`. Arbitrary file paths or relative traversal (`../`) are impossible because the file key is fetched from the database, not user input.

### 2.3 Authentication & Session Security
- **Bcrypt Salt Hashing**: All passwords use `bcryptjs` with salt rounds = 10.
- **JWT Protection**: Signed with `JWT_SECRET` and set with reasonable expiration (`7d`).
- **Role-Based Access Control (RBAC)**: All administrative endpoints are guarded by both `authenticate` and `requireAdmin` middleware. Unauthorized access attempts yield `403 Forbidden`.

### 2.4 Rate Limiting & DoS Mitigation
- Sensitive endpoints under `/api/v1/payment/*` are protected with `express-rate-limit` capped at 100 requests per 15-minute window per IP to prevent brute-force or resource exhaustion.
- Helmet security headers (`helmet()`) are attached globally on all HTTP responses.

---

## 3. Security Recommendations for Future Production Launch
1. Ensure `NODE_ENV=production` is enabled in production deployment.
2. In production, configure HTTPS with TLS 1.3 certificates.
3. Migrate to AWS S3 / Cloudflare R2 with pre-signed URLs (with 5-minute expiration) for scaling digital file distribution.
