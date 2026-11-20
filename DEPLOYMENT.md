# 📚 Online Book Store — Setup & Deployment Guide

## Project Overview

A full-stack e-commerce bookstore application built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Mongoose
- **Database**: MongoDB Atlas
- **Payments**: Razorpay (simulation mode included)

---

## Prerequisites

| Tool           | Minimum Version | Download                                 |
| -------------- | --------------- | ---------------------------------------- |
| Node.js        | v18+            | https://nodejs.org                       |
| npm            | v9+             | (comes with Node.js)                     |
| MongoDB Atlas  | Free tier (M0)  | https://www.mongodb.com/cloud/atlas      |
| Razorpay       | Test account    | https://dashboard.razorpay.com/signup    |
| Git            | v2+             | https://git-scm.com                      |

---

## 1. Clone & Install Dependencies

```bash
# Clone the project
git clone <your-repo-url>
cd Online_Book_Store

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Environment Variables

### Backend `.env`

Create `backend/.env` with the following variables:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
# Replace with your own cluster URI. Include the database name.
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/online_book_store?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Razorpay Keys (Test Mode)
# Get from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Admin account (auto-created on first run via seed)
ADMIN_NAME=Admin Manager
ADMIN_EMAIL=admin@bookstore.com
ADMIN_PASSWORD=AdminPassword123!

# File uploads directory
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:5000
```

### Variable Descriptions

| Variable                | Description                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `PORT`                  | Backend server port (default: 5000)                                                      |
| `NODE_ENV`              | `development` or `production`                                                            |
| `MONGODB_URI`           | Full MongoDB Atlas connection string with database name                                   |
| `JWT_SECRET`            | Secret key for signing JWT tokens — use a strong random string                           |
| `JWT_EXPIRES_IN`        | Token expiry duration (e.g., `7d`, `24h`)                                                |
| `RAZORPAY_KEY_ID`       | Your Razorpay API Key ID (starts with `rzp_test_` for test mode)                         |
| `RAZORPAY_KEY_SECRET`   | Your Razorpay Key Secret                                                                 |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification secret (optional for local dev)                         |
| `ADMIN_EMAIL`           | Default admin login email (seeded automatically)                                         |
| `ADMIN_PASSWORD`        | Default admin login password (seeded automatically)                                      |

> **Simulation Mode**: If the Razorpay key contains `placeholder`, the system automatically runs in simulation mode — no real payment gateway is invoked. Perfect for local development and testing.

---

## 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use `0.0.0.0/0` for development)
4. Copy the connection string and replace `<username>`, `<password>`, and `<cluster>` in your `.env`
5. Make sure the connection string includes the database name: `/online_book_store`

---

## 4. Razorpay Setup

### For Local Development (Simulation Mode)

Leave the placeholder values in `.env`. The app will auto-detect and use simulation mode:
```env
RAZORPAY_KEY_ID=rzp_test_bookstore_placeholder
RAZORPAY_KEY_SECRET=rzp_secret_bookstore_placeholder
```

### For Real Payment Testing

1. Register at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy the **Key ID** (starts with `rzp_test_`) and **Key Secret**
4. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your `.env`
5. For webhooks, set the endpoint URL to: `https://your-domain.com/api/v1/payments/webhook`

---

## 5. Run Locally

### Start Backend (Development)
```bash
cd backend
npm run dev
```
The backend starts on `http://localhost:5000` with hot-reload via `tsx watch`.

### Start Frontend (Development)
```bash
cd frontend
npm run dev
```
The frontend starts on `http://localhost:5173` with Vite HMR.

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`.

### Database Seeding

On first startup, the backend automatically seeds:
- 1 admin user (`admin@bookstore.com` / `AdminPassword123!`)
- 10 categories (Fiction, Non-Fiction, Technology, etc.)
- 15 books (mix of physical books and eBooks)
- 2 coupon codes (`WELCOME10` - 10% off, `READMORE` - ₹100 off above ₹699)
- Homepage configuration (hero banner, promo details)

---

## 6. Default Login Credentials

| Role     | Email                     | Password            |
| -------- | ------------------------- | -------------------- |
| Admin    | `admin@bookstore.com`     | `AdminPassword123!`  |
| Customer | Register via `/register`  | (your password)      |

---

## 7. Project Structure

```
Online_Book_Store/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Entry point
│   │   ├── app.ts              # Express app setup
│   │   ├── config/
│   │   │   ├── db.ts           # MongoDB connection
│   │   │   └── env.ts          # Environment config
│   │   ├── models/             # Mongoose schemas
│   │   ├── controllers/        # Route handlers
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Auth, validation, upload
│   │   ├── services/           # Razorpay payment service
│   │   ├── utils/              # JWT helpers, seed data
│   │   └── validators/         # Zod validation schemas
│   ├── uploads/                # Cover images & eBook files
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # React entry point
│   │   ├── App.tsx             # Route configuration
│   │   ├── components/         # Shared UI components
│   │   ├── context/            # Auth & Cart state
│   │   ├── layouts/            # Main, Account, Admin layouts
│   │   ├── pages/              # All page components
│   │   │   ├── admin/          # 7 admin panel pages
│   │   │   └── customer/       # 4 customer account pages
│   │   ├── routes/             # Protected route guard
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interfaces
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── DEPLOYMENT.md               # This file
```

---

## 8. API Endpoints Reference

### Public Routes
| Method | Endpoint                       | Description               |
| ------ | ------------------------------ | ------------------------- |
| GET    | `/api/v1/health`               | Health check              |
| POST   | `/api/v1/auth/register`        | Customer registration     |
| POST   | `/api/v1/auth/login`           | Login                     |
| GET    | `/api/v1/books`                | List books (with filters) |
| GET    | `/api/v1/books/:slug`          | Book details              |
| GET    | `/api/v1/books/featured`       | Featured books            |
| GET    | `/api/v1/books/best-sellers`   | Best selling books        |
| GET    | `/api/v1/books/new-arrivals`   | Latest additions          |
| GET    | `/api/v1/categories`           | All categories            |
| GET    | `/api/v1/categories/:slug`     | Category by slug          |

### Authenticated Routes (Customer)
| Method | Endpoint                       | Description               |
| ------ | ------------------------------ | ------------------------- |
| GET    | `/api/v1/auth/me`              | Current user profile      |
| PATCH  | `/api/v1/auth/profile`         | Update profile            |
| GET    | `/api/v1/cart`                 | Get cart                  |
| POST   | `/api/v1/cart/items`           | Add to cart               |
| PATCH  | `/api/v1/cart/items/:bookId`   | Update quantity           |
| DELETE | `/api/v1/cart/items/:bookId`   | Remove from cart          |
| DELETE | `/api/v1/cart`                 | Clear cart                |
| GET    | `/api/v1/addresses`            | List addresses            |
| POST   | `/api/v1/addresses`            | Add address               |
| PATCH  | `/api/v1/addresses/:id`        | Update address            |
| DELETE | `/api/v1/addresses/:id`        | Delete address            |
| POST   | `/api/v1/checkout`             | Initiate checkout         |
| POST   | `/api/v1/payments/verify`      | Verify Razorpay payment   |
| GET    | `/api/v1/orders`               | My orders                 |
| GET    | `/api/v1/orders/:id`           | Order details             |
| GET    | `/api/v1/my-ebooks`            | My purchased eBooks       |
| GET    | `/api/v1/my-ebooks/:id/download` | Download eBook file     |

### Admin Routes (Requires admin role)
| Method | Endpoint                             | Description             |
| ------ | ------------------------------------ | ----------------------- |
| GET    | `/api/v1/admin/dashboard`            | Dashboard stats         |
| GET    | `/api/v1/admin/books`                | All books (admin)       |
| POST   | `/api/v1/admin/books`                | Create book             |
| PATCH  | `/api/v1/admin/books/:id`            | Update book             |
| DELETE | `/api/v1/admin/books/:id`            | Delete book             |
| GET    | `/api/v1/admin/categories`           | All categories          |
| POST   | `/api/v1/admin/categories`           | Create category         |
| PATCH  | `/api/v1/admin/categories/:id`       | Update category         |
| DELETE | `/api/v1/admin/categories/:id`       | Delete category         |
| GET    | `/api/v1/admin/orders`               | All orders              |
| PATCH  | `/api/v1/admin/orders/:id/status`    | Update order status     |
| GET    | `/api/v1/admin/customers`            | All customers           |
| PATCH  | `/api/v1/admin/customers/:id/toggle-active` | Toggle active    |
| GET    | `/api/v1/admin/coupons`              | All coupons             |
| POST   | `/api/v1/admin/coupons`              | Create coupon           |
| PATCH  | `/api/v1/admin/coupons/:id`          | Update coupon           |
| DELETE | `/api/v1/admin/coupons/:id`          | Delete coupon           |
| GET    | `/api/v1/admin/homepage`             | Homepage config         |
| PATCH  | `/api/v1/admin/homepage`             | Update homepage config  |
| POST   | `/api/v1/admin/upload`               | Upload cover/ebook file |

---

## 9. Production Build

### Frontend
```bash
cd frontend
npm run build
```
Produces optimized static files in `frontend/dist/`.

### Backend
The backend runs TypeScript directly via `tsx`. For production:
```bash
cd backend
npx tsc           # Compile TypeScript to JavaScript
node dist/server.js  # Run compiled output
```

---

## 10. Deployment Options

### Option A: Render (Backend) + Vercel (Frontend)

**Backend on Render:**
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npx tsx src/server.ts`
6. Add all environment variables from `.env`

**Frontend on Vercel:**
1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repo
3. Set Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variable: `VITE_API_URL=https://your-render-backend-url.onrender.com/api/v1`

### Option B: Railway / Fly.io (Full Stack)

Deploy both backend and frontend as separate services, or serve the frontend build from the backend as static files.

### Post-Deployment Checklist

- [ ] Update `CORS origin` in backend to your frontend domain
- [ ] Update `BASE_URL` to your backend domain
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure Razorpay with production keys
- [ ] Set Razorpay webhook URL to `https://your-domain.com/api/v1/payments/webhook`
- [ ] Whitelist production IP in MongoDB Atlas
- [ ] Enable HTTPS
- [ ] Set up `uploads/` directory with proper write permissions

---

## 11. Coupon Codes (Pre-seeded)

| Code        | Type       | Value   | Min Order | Description                    |
| ----------- | ---------- | ------- | --------- | ------------------------------ |
| `WELCOME10` | Percentage | 10%     | ₹0        | 10% off on all orders          |
| `READMORE`  | Fixed      | ₹100    | ₹699      | Flat ₹100 off on orders ≥ ₹699 |

---

## 12. Design System

### Color Palette
| Token          | Hex       | Usage                             |
| -------------- | --------- | --------------------------------- |
| Primary Navy   | `#243B53` | Buttons, headings, navbar text    |
| Accent Golden  | `#E6A23C` | Secondary buttons, highlights     |
| Background     | `#F8FAFC` | Page background                   |
| Surface        | `#FFFFFF` | Cards, panels                     |
| Primary Text   | `#172B4D` | Body text                         |

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px – 1024px
- Desktop: > 1024px

---

## Troubleshooting

| Issue                                           | Solution                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `EADDRINUSE: address already in use :::5000`    | Kill stale node processes: `npx kill-port 5000`                          |
| `Operation buffering timed out after 10000ms`   | Check MongoDB URI includes database name & whitelist IP in Atlas         |
| `401 Authentication failed` from Razorpay       | Use simulation mode (placeholder keys) or add real test keys             |
| Frontend API calls return 404                   | Verify Vite proxy config: `vite.config.ts` should proxy `/api` to 5000  |
| Images not loading                              | Check `helmet` CORS policy allows cross-origin resources                 |

---

**Built with ❤️ using React, Node.js, MongoDB, and Razorpay**
