# PDF Report Generator

A production-oriented Node.js reporting service that converts transactional data into structured, downloadable PDF reports through a complete SQL-to-artifact pipeline.

Built with **Express, SQLite, Playwright, and Chromium**, the service handles data aggregation, HTML report generation, PDF rendering, artifact storage, REST-based file delivery, and idempotent report creation.

### Key Production Concept

1.Idempotency

    POST /reports
        ↓
    Does today's report already exist?
        ↓
    YES → return existing report
    NO  → generate new report

2.Store the artifact, return a link!
    
    Generate PDF
        ↓
    Save PDF
        ↓
    Database stores path
        ↓
    API returns URL
        ↓
    Client downloads PDF

3.Separation of Concern.
    
    index.js
    → API

    reportData.js
    → database/report queries

    generateReport.js
    → HTML → PDF

## Tech Stack

- Node.js
- Express
- SQLite
- Playwright
- Chromium

## How It Works

SQLite orders
    ↓
SQL aggregation
    ↓
Report data
    ↓
HTML template
    ↓
Playwright / Chromium
    ↓
PDF file
    ↓
Express API
    ↓
Download link

### API Workflow

```text
Client
  │
  ▼
POST /reports
  │
  ├── Query SQLite
  ├── Aggregate report data
  ├── Build HTML document
  ├── Render PDF with Playwright
  ├── Store PDF on disk
  └── Save report metadata
  │
  ▼
Report ID + File Link
  │
  ▼
GET /reports/:id/file
  │
  ▼
PDF Download