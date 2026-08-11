# Dispute Management System

## Architecture
This project is built using a modern fullstack architecture:
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion, and Recharts.
- **Backend API**: Next.js Route Handlers (`/app/api`).
- **Database**: SQLite (using `better-sqlite3`), running entirely locally without external dependencies.
- **Data Initialization**: The system automatically reads `seed_dataset.csv` and populates the `data.db` SQLite database on the first API request.

## Installation & Running

1. Ensure you have Node.js installed (v20+ recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Implemented Features
- Real-time client-side search (by Email, Case ID, User ID, Device ID).
- Resolution capturing with optional notes.
- Resolution Trends chart (using Recharts).
- Glassmorphism aesthetic and fluid animations (Framer Motion).

## Design & Assumptions
- **Outcome Correction**: Analysts can update an already resolved case. To maintain data integrity, every update creates a record in a hidden `audit_logs` table.
- **PII Data**: Emails and Device IDs are shown unmasked in the UI to facilitate easy searching by analysts.
- **Pagination**: Intentionally omitted since the dataset is small (220 rows). Loading everything upfront and filtering in the client is faster and smoother.

## Tests
Basic setup is provided. You can add Jest tests if required.
