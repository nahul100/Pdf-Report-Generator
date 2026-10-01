const sqlite3 = require("sqlite3").verbose();

function getReportData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./data/report.db");

    const report = {};

    // 1. Total number of orders
    db.get(
      `SELECT COUNT(*) AS totalOrders FROM orders`,
      (err, row) => {
        if (err) return reject(err);

        report.totalOrders = row.totalOrders;

        // 2. Total revenue
        db.get(
          `SELECT SUM(amount) AS totalRevenue FROM orders`,
          (err, row) => {
            if (err) return reject(err);

            report.totalRevenue = row.totalRevenue || 0;

            // 3. Top 5 products by revenue
            db.all(
              `
              SELECT
                product,
                SUM(amount) AS revenue
              FROM orders
              GROUP BY product
              ORDER BY revenue DESC
              LIMIT 5
              `,
              (err, rows) => {
                if (err) return reject(err);

                report.topProducts = rows;

                // 4. Orders per day for the last 7 days
                db.all(
                  `
                  SELECT
                    created_at,
                    COUNT(*) AS orderCount
                  FROM orders
                  WHERE created_at >= date('now', '-6 days')
                  GROUP BY created_at
                  ORDER BY created_at ASC
                  `,
                  (err, rows) => {
                    if (err) return reject(err);

                    report.ordersPerDay = rows;
                         db.all(
                         `
                            SELECT
                                id,
                                customer,
                                product,
                                amount,
                                created_at
                            FROM orders
                            ORDER BY id ASC
                            `,
                            (err, rows) => {
                                if (err) return reject(err);

                                report.allOrders = rows;

                                
                            }
                      );
                 
                    db.close();

                    resolve(report);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

module.exports = { getReportData };