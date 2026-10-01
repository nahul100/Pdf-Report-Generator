const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/report.db");

const products = [
  "Laptop Stand",
  "Wireless Mouse",
  "Mechanical Keyboard",
  "USB Hub",
  "Webcam",
  "Headphones"
];

const customers = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Emma",
  "Frank",
  "Grace",
  "Henry"
];

function randomAmount() {
  return Number((Math.random() * 195 + 5).toFixed(2));
}

function randomDate() {
  const date = new Date();
  const daysAgo = Math.floor(Math.random() * 30);

  date.setDate(date.getDate() - daysAgo);

  return date.toISOString().split("T")[0];
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT NOT NULL,
      product TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Make the seed safe to run repeatedly.
  db.run(`DELETE FROM orders`);

  db.run(`
    DELETE FROM sqlite_sequence
    WHERE name = 'orders'
  `);

  const stmt = db.prepare(`
    INSERT INTO orders
    (customer, product, amount, created_at)
    VALUES (?, ?, ?, ?)
  `);

  for (let i = 0; i < 200; i++) {
    const customer =
      customers[Math.floor(Math.random() * customers.length)];

    const product =
      products[Math.floor(Math.random() * products.length)];

    const amount = randomAmount();
    const createdAt = randomDate();

    stmt.run(customer, product, amount, createdAt); 
  }

  stmt.finalize(() => {
    db.get(
      `SELECT COUNT(*) AS count FROM orders`,
      (err, row) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Orders in database: ${row.count}`);
        }

        db.close();
      }
    );
  });
});