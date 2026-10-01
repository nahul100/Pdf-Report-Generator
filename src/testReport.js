const { getReportData } = require("./reportData");

async function main() {
  try {
    const report = await getReportData();

    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error("Failed to generate report data:", error);
  }
}

main();