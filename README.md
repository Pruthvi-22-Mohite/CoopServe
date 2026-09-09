# CoopServe - Cooperative Gig Services & Democratic Marketplace Platform

> **A fairer way to discover, book, and deliver household services through transparent pricing, cooperative governance, and worker-first economics.**

## About

CoopServe is a cooperative marketplace for trusted household and urban services. Customers can discover providers, receive distance-aware quotes, book protected services, and communicate in real time. Providers receive transparent earnings, smart dispatch recommendations, and a direct voice in cooperative decisions.

The platform is designed around a 90/10 model: workers receive 90% of each completed transaction, while 10% supports platform operations and dispute protection.

**Live application:** [frontend-seven-rust-97.vercel.app](https://frontend-seven-rust-97.vercel.app)

**Production API:** [backend-delta-beige-48.vercel.app](https://backend-delta-beige-48.vercel.app)

---

## Overview

**CoopServe** is a next-generation platform for household service discovery, algorithmic dispatch, and cooperative labor governance. It provides a fair, sustainable alternative to high-commission corporate gig platforms by guaranteeing:

- **90% Direct Worker Take-Home:** Workers receive 90% of every transaction, with a strictly capped 10% platform fee for server operations and dispute protection.
- **Transparent Base Pricing + Distance-Based Travel Compensation:** Clear distance fee slabs ($0–2\text{ km}: ₹0$, $2–5\text{ km}: ₹20$, $5–10\text{ km}: ₹40$, $10+\text{ km}: ₹80$) ensure fair travel compensation with zero hidden markups.
- **Multi-Factor AI Smart Matching:** 7-factor algorithmic dispatch weighting trade expertise, proximity, slot availability, rating, and cooperative workload queue balancing to prevent starvation and burnout.
- **100% Protected Booking Guarantee:** Digital receipts, dispute arbitration through a peer cooperative council, and verified portable work histories.
- **Democratic Member Governance:** 1-member-1-vote cooperative hub for vocational certifications, safety standards, and collective decisions.

---

## Architecture and Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** Lucide React
- **Visualizations:** Recharts (6-month revenue trends, 90/10 split donut, hourly demand curves)
- **Real-Time:** Socket.IO Client
- **Internationalization:** Multi-language support (English, Hindi, Marathi)

### Backend
- **Runtime:** Node.js + Express (ES Modules)
- **Real-Time:** Socket.IO Server (Live job dispatch and bidirectional customer-provider chat)
- **Data Persistence:** Dual-engine In-Memory & MongoDB Mongoose data stores
- **Security:** JWT Authentication, bcryptjs password hashing, and role-based access control

---

## Quick Start and Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/coopserve.git
cd coopserve
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with WebSocket support.*

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### Environment Variables

Create `backend/.env` for local development. At minimum, configure:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
CLIENT_URL=http://localhost:5173
MONGODB_URI=your-mongodb-connection-string
```

Add Razorpay credentials when payment flows are enabled:

```env
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

For the deployed frontend, set `VITE_API_BASE_URL` to the production API URL, for example:

```env
VITE_API_BASE_URL=https://backend-delta-beige-48.vercel.app
```

Never commit `.env` files or production secrets.

## Deployment

The frontend and backend are deployed as separate Vercel projects:

- `frontend/` uses Vite and the SPA rewrite in `frontend/vercel.json`.
- `backend/` exposes the Express API through `backend/api/[...path].js`.

Deploy either project from its directory:

```bash
cd frontend
npx vercel --prod

cd ../backend
npx vercel --prod
```

The backend health endpoint is available at `/api/health`. Configure the backend environment variables in Vercel before using production authentication, database, and payment flows.

---

## Demo Roles and Credentials

CoopServe includes 1-click demo logins on the landing screen:

| Role | Demo Account | Primary Features |
| :--- | :--- | :--- |
| **Household Customer** | `customer@coopserve.demo` | AI Smart Matching, Protected Booking flow, Live In-App Chat, Digital Receipts |
| **Service Provider / Pro** | `provider@coopserve.demo` | Real-time dispatch requests, job lifecycle updates, 90% direct earnings ledger |
| **Cooperative Administrator** | `admin@coopserve.demo` | 8 KPI monitoring, 6-month payout analytics, AI dispatch inspector, platform leakage audit |

---

## Fee Structure and Transparent Formula

$$\text{Final Customer Total} = \text{Base Service Price} + \text{Distance Travel Fee} + \text{Extra Charges}$$

$$\text{Platform Operations (10\%)} = \text{Customer Total} \times 0.10$$

$$\text{Worker Take-Home (90\%)} = \text{Customer Total} - \text{Platform Operations}$$

*Single source of truth formula executed across all customer quotes, payment steps, provider dispatches, and settled ledgers.*

---

## License

This project is licensed under the MIT License.
