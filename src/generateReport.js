const { chromium } = require("playwright");
const { getReportData } = require("./reportData");

function buildHtml(report) {
  const today = new Date().toISOString().split("T")[0];

  const topProductsRows = report.topProducts
    .map(
      (item, index) => `
        <tr>
          <td class="rank">${index + 1}</td>
          <td>${item.product}</td>
          <td class="money">$${Number(item.revenue).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const ordersPerDayRows = report.ordersPerDay
    .map(
      (item) => `
        <tr>
          <td>${item.created_at}</td>
          <td>${item.orderCount}</td>
        </tr>
      `
    )
    .join("");

  const allOrdersRows = report.allOrders
    .map(
      (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${order.customer}</td>
          <td>${order.product}</td>
          <td class="money">$${Number(order.amount).toFixed(2)}</td>
          <td>${order.created_at}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>

  @page {
    size: A4;
    margin: 16mm 15mm 18mm 15mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
    font-size: 11px;
    line-height: 1.4;
  }

  .header {
    border-bottom: 3px solid #222;
    padding-bottom: 14px;
    margin-bottom: 22px;
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }

  .subtitle {
    margin-top: 5px;
    color: #6b7280;
    font-size: 11px;
  }

  .summary {
    display: flex;
    gap: 12px;
    margin-bottom: 25px;
  }

  .card {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 14px;
  }

  .card-label {
    font-size: 10px;
    text-transform: uppercase;
    color: #6b7280;
    letter-spacing: 0.5px;
  }

  .card-value {
    margin-top: 6px;
    font-size: 21px;
    font-weight: 700;
  }

  .section {
    margin-top: 25px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 9px;
    padding-bottom: 5px;
    border-bottom: 1px solid #d1d5db;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  thead {
    display: table-header-group;
  }

  tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  th {
    background: #f3f4f6;
    font-weight: 700;
    text-align: left;
    font-size: 10px;
  }

  th,
  td {
    border-bottom: 1px solid #e5e7eb;
    padding: 7px 8px;
    vertical-align: middle;
  }

  .rank {
    width: 40px;
    text-align: center;
  }

  .money {
    text-align: right;
    white-space: nowrap;
  }

  .top-products th:nth-child(1),
  .top-products td:nth-child(1) {
    width: 45px;
  }

  .top-products th:nth-child(3),
  .top-products td:nth-child(3) {
    width: 130px;
  }

  .daily th:first-child,
  .daily td:first-child {
    width: 70%;
  }

  .daily th:last-child,
  .daily td:last-child {
    text-align: right;
    width: 30%;
  }

  .orders th:nth-child(1),
  .orders td:nth-child(1) {
    width: 8%;
  }

  .orders th:nth-child(2),
  .orders td:nth-child(2) {
    width: 20%;
  }

  .orders th:nth-child(3),
  .orders td:nth-child(3) {
    width: 30%;
  }

  .orders th:nth-child(4),
  .orders td:nth-child(4) {
    width: 20%;
  }

  .orders th:nth-child(5),
  .orders td:nth-child(5) {
    width: 22%;
  }

  .page-break {
    page-break-before: always;
  }

  .footer {
    margin-top: 25px;
    padding-top: 8px;
    border-top: 1px solid #ddd;
    color: #9ca3af;
    font-size: 9px;
  }

</style>
</head>

<body>

  <div class="header">
    <div class="title">Sales Report</div>
    <div class="subtitle">
      Generated on ${today}
    </div>
  </div>

  <div class="summary">

    <div class="card">
      <div class="card-label">Total Orders</div>
      <div class="card-value">
        ${report.totalOrders}
      </div>
    </div>

    <div class="card">
      <div class="card-label">Total Revenue</div>
      <div class="card-value">
        $${Number(report.totalRevenue).toFixed(2)}
      </div>
    </div>

  </div>

  <div class="section">

    <div class="section-title">
      Top 5 Products by Revenue
    </div>

    <table class="top-products">

      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Revenue</th>
        </tr>
      </thead>

      <tbody>
        ${topProductsRows}
      </tbody>

    </table>

  </div>

  <div class="section">

    <div class="section-title">
      Orders per Day — Last 7 Days
    </div>

    <table class="daily">

      <thead>
        <tr>
          <th>Date</th>
          <th>Orders</th>
        </tr>
      </thead>

      <tbody>
        ${ordersPerDayRows}
      </tbody>

    </table>

  </div>

  <div class="section page-break">

    <div class="section-title">
      Order Details
    </div>

    <table class="orders">

      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Product</th>
          <th>Amount</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        ${allOrdersRows}
      </tbody>

    </table>

  </div>

  <div class="footer">
    FlyRank Backend Track — PDF Report Generator
  </div>

</body>
</html>
`;
}