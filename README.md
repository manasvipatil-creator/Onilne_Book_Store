# Online Book Store - Full Stack eCommerce Platform

A modern, responsive Full Stack E-Commerce Website built with React, TypeScript, Tailwind CSS, Node.js, Express, MongoDB, and Razorpay payment integration.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Catalog & Discovery:**
  - Hero banner with quick links to explore books and instant eBooks.
  - Browse by 10 literature categories (Fiction, Technology, Self-Help, etc.).
  - Search books by title, author, or keywords.
  - Filter by product format (**Physical Paperback** vs **Digital eBook**), price range, and sort by price, popularity, or latest arrivals.
  - Comprehensive book details with pages, ISBN, publisher, language, stock, and related recommendations.

- **Dual Fulfillment Types:**
  - **Physical Books:** Requires shipping address, tracks inventory stock, courier assignment, and delivery statuses.
  - **Digital eBooks:** No delivery address needed; immediate unlock upon verified payment with protected downloads (PDF/EPUB) in customer's personal library.
  - **Mixed Cart Support:** Single checkout supporting both physical items and digital eBooks with isolated fulfillment tracking.

- **Authentication & Dashboard:**
  - Secure registration and login with JWT and bcrypt password hashing.
  - Customer account portal:
    - *My Orders & Tracking*
    - *My eBook Library & Downloads*
    - *Address Management* (Default addresses, multiple entries)
    - *Personal Profile Details*

- **Shopping Cart & Checkout:**
  - Database-backed persistent carts for authenticated users.
  - Strict eBook quantity enforcement (quantity 1, no duplicate purchases allowed).
  - Promo coupon support (e.g., `READMORE` for ₹100 flat discount, `WELCOME10` for 10% off).
  - Razorpay payment gateway integration with server-side HMAC signature verification.

---

### 🛡️ Admin Dashboard
- **Store Overview & Analytics:**
  - Live metric cards: Total Books, Total Sales (₹), Total Orders, Registered Customers, Pending Processing, Low Stock alerts.
  - Recent orders table with customer and pricing details.
- **Book Management:**
  - Add, edit, and delete books.
  - Configure physical stock, SKU, digital file keys, pricing, discount, featured/bestseller badges.
- **Category Management:**
  - Add and update categories, slugs, descriptions, display orders.
  - Delete safeguards ensuring books are not orphaned.
- **Order Management & Shipments:**
  - Update physical delivery statuses (`Processing` -> `Confirmed` -> `Packed` -> `Shipped` -> `Out for Delivery` -> `Delivered` -> `Cancelled`).
  - Attach courier partner names and tracking numbers.
- **Customer Management:**
  - View customer accounts and toggle active/deactivated statuses.
- **Coupons Management:**
  - Create percentage or flat discounts, minimum order constraints, expiry dates, and usage limits.
- **Homepage Customization:**
  - Configure hero banners, promo banner texts, and live announcements.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - React Router DOM
  - Axios
  - Lucide React Icons
- **Backend:**
  - Node.js & Express
  - TypeScript
  - MongoDB & Mongoose
  - JWT (JSON Web Tokens)
  - bcryptjs
  - Multer
  - Razorpay SDK
  - Zod validation
  - Helmet & CORS

---

## 📦 Project Structure

```text
online-book-store/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & environment variables
│   │   ├── controllers/     # Auth, Book, Cart, Order, Admin controllers
│   │   ├── middleware/      # Auth (JWT), Validation, Multer file upload
│   │   ├── models/          # Mongoose Schemas (User, Book, Order, etc.)
│   │   ├── routes/          # Express API route modules
│   │   ├── services/        # Razorpay payment & signature verification
│   │   ├── utils/           # Database seed script & JWT helpers
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.ts           # Express application configuration
│   │   └── server.ts        # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Header, Footer, BookCard)
│   │   ├── context/         # AuthContext & CartContext
│   │   ├── layouts/         # MainLayout, AccountLayout, AdminLayout
│   │   ├── pages/           # Customer pages & Admin panel pages
│   │   ├── routes/          # ProtectedRoute component
│   │   ├── services/        # Axios API client
│   │   └── types/           # TypeScript definitions
│   └── package.json
└── README.md
```

---

## ⚡ Getting Started

### 1. Backend Setup
1. Open a terminal in `./backend`:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment variables in `.env` (or copy `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/online_book_store
   JWT_SECRET=super_secret_bookstore_jwt_key_2026_dev
   RAZORPAY_KEY_ID=rzp_test_placeholder
   RAZORPAY_KEY_SECRET=rzp_secret_placeholder
   ADMIN_EMAIL=admin@bookstore.com
   ADMIN_PASSWORD=AdminPassword123!
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```
   *Note: On first run, the seed script will automatically populate 10 categories, 15 books (physical & eBooks), coupons, and default administrator credentials.*

### 2. Frontend Setup
1. Open a second terminal in `./frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Visit **http://localhost:5173** in your browser.

---

## 🔑 Default Credentials
- **Admin Login:**
  - Email: `admin@bookstore.com`
  - Password: `AdminPassword123!`
  - Dashboard route: `/admin`
- **Customer Registration:**
  - Direct signup via `/register` (always assigns `customer` role safely).
