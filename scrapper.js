import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Go to Campus Web calendar
  await page.goto("https://campusweb.vercel.app/student/calendar", {
    waitUntil: "networkidle2",
  });

  // Example: Grab all text content
  const text = await page.evaluate(() => document.body.innerText);

  console.log("Page text preview:\n", text.substring(0, 500));

  await browser.close();
}

main();
