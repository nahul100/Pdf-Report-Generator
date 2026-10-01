const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const { getReportData } = require("./reportData");
const { generatePdf } = require("./generateReport");

const app = express();
app.use(express.json());
const PORT = 3000;

const db = new sqlite3.Database("./data/report.db");

// Create the reports table when the server starts.
db.run(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Generate a report
app.post("/reports", async (req, res) => {
  try {
    const force = req.body?.force === true;

    // Check whether today's report already exists.
    if (!force) {
      const existingReport = await new Promise((resolve, reject) => {
        db.get(
          `
          SELECT id, path, created_at
          FROM reports
          WHERE date(created_at) = date('now')
          ORDER BY id DESC
          LIMIT 1
          `,
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          }
        );
      });

      if (existingReport) {
        return res.status(200).json({
          id: existingReport.id,
          file: `/reports/${existingReport.id}/file`
        });
      }
    }

    // Generate new report data.
    const report = await getReportData();

    // Find the next report ID.
    const nextId = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM reports`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.id);
          }
        }
      );
    });

    const outputPath = path.join(
      "reports",
      `${nextId}.pdf`
    );

    // Generate PDF.
    await generatePdf(report, outputPath);

    // Save report information.
    await new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO reports (id, path, created_at)
        VALUES (?, ?, datetime('now'))
        `,
        [nextId, outputPath],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    res.status(201).json({
      id: nextId,
      file: `/reports/${nextId}/file`
    });

  } catch (error) {
    console.error("Failed to generate report:", error);

    res.status(500).json({
      error: "Failed to generate report"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});