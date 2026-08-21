# MZCET Faculty Report Management & Automated Document Generation System

Automated Staff Weekly & Monthly Activity Reporting, Analytics, and Document Generation (DOCX/PPTX/PDF) System for **Mount Zion College of Engineering and Technology (MZCET)**.

## Features

- 👥 **Role-Based Access Control**:
  - **Faculty / Staff**: Create, edit, and resubmit weekly and monthly academic activity reports.
  - **HOD (Head of Department)**: Review queue, approve or request corrections with feedback comments, and department analytics.
  - **Administrator / Principal**: Institutional overview, cross-department comparison analytics, and college-wide monthly report summaries.
- 📄 **Multi-Format Automated Document Generation**:
  - Professional **Microsoft Word (DOCX)** report generation.
  - Interactive **PowerPoint (PPTX)** presentation generation.
  - Exportable **PDF** summaries.
- 📊 **Real-Time Analytics & Aggregates**:
  - Live syllabus completion tracking and student attendance metrics.
  - Cross-department comparison aggregates.
- 🗄️ **Dual Database Architecture**:
  - Local **SQLite** database for zero-config local development.
  - Remote **Supabase PostgreSQL** cloud database integration.

## Default Credentials (Demo Accounts)

| Role | Username / Staff ID | Email Address | Account Name | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty / Staff** | `mzcet@it_coordinator` | `staff@mzcet.edu.in` | Mrs. V Brindha Devi | `mzcet@1234` |
| **HOD** | `mzcet@it_hod` | `hod.it@mzcet.edu.in` | Dr. P. Rajkumar | `mzcet@1234` |
| **Administrator** | `mzcet@admin` | `admin@mzcet.edu.in` | MZCET Admin Portal | `mzcet@1234` |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation & Local Setup

```bash
# Clone the repository
git clone https://github.com/hariharan1022/MZCET-Faculty-Report.git
cd MZCET-Faculty-Report

# Install all dependencies (Root, Backend, and Frontend)
npm run install:all

# Run Backend and Frontend concurrently in development mode
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### System Verification Suite

Run the automated backend test suite to verify database seeding, authentication, report workflows, and document generators:

```bash
node backend/verify-system.js
```
