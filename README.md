# KisanDirect — Farmer-to-Consumer Agricultural Marketplace

**KisanDirect** is a modern, mobile-first agricultural marketplace that directly connects rural farmers with consumers. Farmers can list harvested crops, manage stock, and receive orders directly, while consumers can buy fresh produce at fair prices without intermediaries.

---

## 🌟 Key Features

### 1. Multi-Language Onboarding (i18n)
- **English**, **తెలుగు (Telugu)**, and **हिंदी (Hindi)**.
- Persistent language dictionary applied across navigation, forms, order status, and dashboard metrics.

### 2. Role-Based Dual Interface
- **Farmer (Seller)**:
  - **Dashboard**: Live earnings metrics (Total Sales, Pending Payouts), total orders, active inventory count, recent buyer orders.
  - **Add Agricultural Produce**: Upload harvest photos (with instant image preview & backend file storage), set price per unit, available quantity, unit (`kg`, `gram`, `bunch`, `piece`, `dozen`, `litre`), location, harvest date, and 100% organic certification badge.
  - **My Products**: Card view with live stock badges, edit modal, delete action, and active/hidden toggles.
  - **Order Management**: Receive buyer orders with buyer details, contact, and delivery address. Real-time status transitions: `Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready for Dispatch` ➔ `Completed` / `Cancelled`.
  - **Earnings & Payouts**: Detailed financial breakdown of completed bank payouts, pending dispatches, and full transaction history.
  - **Farm Profile**: Farmer name, farm name, mobile, location, language preferences, and support tickets.

- **Buyer (Consumer)**:
  - **Discovery Marketplace**: Hero banner, live delivery location pill, search by product name/crop/location, category filters (`Vegetables`, `Fruits`, `Grains`, `Pulses`, `Spices`, `Other Products`), price sliders, organic filter, and sorting (Recently Added, Price Low-High, Price High-Low).
  - **Product Details Page**: High-resolution produce photography, crop description, cultivation location, harvest date, farmer contact, quantity selector, and real-time stock validation.
  - **Shopping Cart**: Real-time quantity adjustments, subtotal calculation, free delivery indicator (free on orders > ₹500, otherwise standard ₹40), and multi-farmer order grouping.
  - **Checkout & Multi-Farmer Order Placement**: Select or add delivery addresses, choose payment method (`Cash on Delivery`, `Direct UPI`, or `Online Sandbox Payment`), with ACID transaction stock deduction.
  - **Order History & Step Timeline**: Interactive progress stepper (`Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready for Dispatch` ➔ `Delivered`), order cancellation with automatic stock restoration if still pending.
  - **Profile & Address Manager**: Manage saved addresses, set default address, switch app language, and contact support.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6 |
| **Backend** | Python 3.11, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Werkzeug |
| **Database** | MySQL 8.0 (`kisandirect_db` on `127.0.0.1:3306`) with DECIMAL monetary precision & snapshots |
| **Storage** | Local disk image upload storage (`backend/uploads/`) with static routing |

---

## 🔑 Quick Demo Credentials

| Role | Mobile Number | Password | Details |
|---|---|---|---|
| **Farmer (Seller)** | `9876543210` | `farmer123` | Ramesh Patel (Green Valley Organic Farms, Sangareddy) |
| **Farmer (Seller)** | `9876543211` | `farmer123` | Lakshmi Devi (Annapurna Orchards, Rangareddy) |
| **Buyer (Customer)** | `9123456780` | `buyer123` | Ananya Sharma (Hyderabad, Banjara Hills) |
| **New Registrations** | *Any 10-digit number* | *Any 6+ chars* | **Dev OTP: `123456`** |

---

## 🚀 Running the Application

### 1. Database Setup (MySQL)
The database `kisandirect_db` is running on MySQL 8.0:
```bash
# Verify or seed data
python backend/seed.py
```

### 2. Start Backend API
```bash
# Starts Flask server on port 5050
python backend/app.py
```
API Health Check: `http://127.0.0.1:5050/api/health`

### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev -- --port 3000
```
Open in browser: **`http://127.0.0.1:3000/`**

---

## 🧪 Testing & Verification
Integration tests and end-to-end tests are included:
```bash
# Run unit & API integration tests
python backend/test_api.py

# Run live end-to-end multi-role transaction test
python verify_e2e.py
```
