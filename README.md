# CoopServe — Cooperative Gig Services & Democratic Marketplace Platform

> **Democratizing Household & Urban Gig Work with Transparent 90/10 Economics, Distance-Based Fair Compensation, AI-Assisted Dispatch, and Democratic Governance.**

---

## 🌟 Overview

**CoopServe** is a next-generation platform for household service discovery, algorithmic dispatch, and cooperative labor governance. It provides a fair, sustainable alternative to high-commission corporate gig platforms by guaranteeing:

- **90% Direct Worker Take-Home:** Workers receive 90% of every transaction, with a strictly capped 10% platform fee for server operations and dispute protection.
- **Transparent Base Pricing + Distance-Based Travel Compensation:** Clear distance fee slabs ($0–2\text{ km}: ₹0$, $2–5\text{ km}: ₹20$, $5–10\text{ km}: ₹40$, $10+\text{ km}: ₹80$) ensure fair travel compensation with zero hidden markups.
- **Multi-Factor AI Smart Matching:**  7-factor algorithmic dispatch weighting trade expertise, proximity, slot availability, rating, and cooperative workload queue balancing to prevent starvation and burnout. 
- **100% Protected Booking Guarantee:** Digital receipts, dispute arbitration through a peer cooperative council, and verified portable work histories.
- **Democratic Member Governance:** 1-member-1-vote cooperative hub for vocational certifications, safety standards, and collective decisions.

---

## 🛠️ Architecture & Tech Stack

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

## 🚀 Quick Start & Installation

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

---

## 👥 Demo Roles & Credentials

CoopServe includes 1-click demo logins on the landing screen:

| Role | Demo Account | Primary Features |
| :--- | :--- | :--- |
| **Household Customer** | `customer@coopserve.demo` | AI Smart Matching, Protected Booking flow, Live In-App Chat, Digital Receipts |
| **Service Provider / Pro** | `provider@coopserve.demo` | Real-time dispatch requests, job lifecycle updates, 90% direct earnings ledger |
| **Cooperative Administrator** | `admin@coopserve.demo` | 8 KPI monitoring, 6-month payout analytics, AI dispatch inspector, platform leakage audit |

---

## 📊 Fee Structure & Transparent Formula

$$\text{Final Customer Total} = \text{Base Service Price} + \text{Distance Travel Fee} + \text{Extra Charges}$$

$$\text{Platform Operations (10\%)} = \text{Customer Total} \times 0.10$$

$$\text{Worker Take-Home (90\%)} = \text{Customer Total} - \text{Platform Operations}$$

*Single source of truth formula executed across all customer quotes, payment steps, provider dispatches, and settled ledgers.*

---

## 📄 License

This project is licensed under the MIT License.
