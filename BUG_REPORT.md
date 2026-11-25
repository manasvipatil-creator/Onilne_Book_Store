# Bug Report & Resolution Log

This document details all defects, vulnerabilities, and edge cases discovered during QA inspection, along with root causes, applied code fixes, and verification results.

---

### BUG-001: Simulation Fallback in Production Checkout Flow
- **Severity**: **High (Payment Flow)**
- **Module**: Frontend Checkout (`CheckoutPage.tsx`)
- **Description**: The checkout page contained a simulation fallback branch (`isSimulated || keyId.includes('placeholder')`) that generated mock payment IDs (`pay_sim_*`) instead of strictly executing standard Razorpay popup workflows.
- **Root Cause**: Leftover development prototyping code that bypassed the real Razorpay payment modal if parameters failed to match.
- **Fix Applied**: Refactored `CheckoutPage.tsx` to strictly instantiate `new window.Razorpay(options)` with real test credentials, added `modal.ondismiss` listener for customer cancellation, and attached `payment.failed` event listener for transaction recovery.
- **Verification Result**: **PASS** (Razorpay Standard Checkout loads cleanly in Test Mode with full error boundary).

---

### BUG-002: Guest Cart Login Redirection Override
- **Severity**: **Medium (UX / User Retention)**
- **Module**: Authentication (`LoginPage.tsx`, `RegisterPage.tsx`)
- **Description**: When a guest user clicked "Proceed to Checkout", the authentication modal sent them to `/login?redirect=/checkout`. However, if the user was an admin or default session, `LoginPage` was forcefully redirecting them to `/admin` or `/` instead of `/checkout`.
- **Root Cause**: The redirect parameter was parsed after the role check rather than honoring the specific customer journey intent.
- **Fix Applied**: Updated `LoginPage.tsx` and `RegisterPage.tsx` to prioritize `redirectParam` before any fallback route.
- **Verification Result**: **PASS** (Users successfully authenticate and return directly to the checkout flow with their cart items merged).

---

### BUG-003: Double-Decrement Vulnerability on Order Fulfillment
- **Severity**: **Critical (Financial / Inventory Integrity)**
- **Module**: Payment Fulfillment (`paymentController.ts`)
- **Description**: If a customer refreshed the payment confirmation screen or if Razorpay dispatched multiple webhooks simultaneously for `payment.captured`, physical book inventory could potentially be decremented multiple times.
- **Root Cause**: Lack of an upfront status check in `fulfillOrder()` prior to running `$inc: { 'physical.stock': -item.quantity }`.
- **Fix Applied**: Introduced an upfront idempotency check:
  ```typescript
  if (order.payment.status === 'Paid') {
    return order; // Already fulfilled, prevent duplicate decrements
  }
  ```
- **Verification Result**: **PASS** (Verified with automated test `TC-PAY-005` — second fulfillment attempt left inventory unchanged).

---

### BUG-004: Unhandled Mobile Header Banner Overlapping
- **Severity**: **Low (UI / Responsiveness)**
- **Module**: Storefront Layout (`CategoryBooksPage.tsx`)
- **Description**: On mobile screens (< 640px), the "Curated Genre" badge and "Back to All Collections" link overlapped horizontally on top of each other, and large category icon containers pushed the book grid below the fold.
- **Root Cause**: Hardcoded flex layouts without wrapping rules and oversized fixed desktop containers.
- **Fix Applied**: Applied responsive container wrapping (`flex-wrap gap-2`), scaled typography down to `text-2xl` on mobile, and hid redundant decorative icon blocks on small viewports.
- **Verification Result**: **PASS** (Layout renders with zero horizontal scroll and clean vertical hierarchy).

---

### Summary of Defects
- **Total Defects Identified**: 4
- **Critical / High**: 2
- **Medium**: 1
- **Low**: 1
- **Total Resolved**: 4 (100% Fixed and Verified)
