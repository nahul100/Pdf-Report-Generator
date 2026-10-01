const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const { getReportData } = require("./reportData");
const { generatePdf } = require("./generateReport");

const app = express();
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
    // 1. Get aggregated report data
    const report = await getReportData();

    // 2. Find the next report ID
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

    // 3. Decide where the PDF will be stored
    const outputPath = path.join(
      "reports",
      `${nextId}.pdf`
    );

    // 4. Generate the PDF
    await generatePdf(report, outputPath);

    // 5. Save the report record
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

    // 6. Return the report link
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

// Get report information
app.get("/reports/:id", (req, res) => {
  db.get(
    `
    SELECT id, path, created_at
    FROM reports
    WHERE id = ?
    `,
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Failed to get report"
        });
      }

      if (!row) {
        return res.status(404).json({
          error: "Report not found"
        });
      }

      res.json({
        id: row.id,
        path: row.path,
        created_at: row.created_at,
        file: `/reports/${row.id}/file`
      });
    }
  );
});

// Download the PDF
app.get("/reports/:id/file", (req, res) => {
  db.get(
    `
    SELECT path
    FROM reports
    WHERE id = ?
    `,
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Failed to get report file"
        });
      }

      if (!row) {
        return res.status(404).json({
          error: "Report not found"
        });
      }

      const filePath = path.resolve(row.path);

      res.sendFile(filePath, (sendError) => {
        if (sendError) {
          console.error(sendError);

          if (!res.headersSent) {
            res.status(404).json({
              error: "Report file not found"
            });
          }
        }
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});