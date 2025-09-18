import puppeteer from "puppeteer";
import dotenv from "dotenv";
import fs from "fs"; // 👈 new import to save results

dotenv.config();

const CAMPUS_URL = "https://campusweb.vercel.app/student/calendar";

async function run() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 1. Go to login page
  await page.goto("https://campusweb.vercel.app/", { waitUntil: "networkidle2" });

  // 2. Fill login form
  await page.type('input[placeholder="SRM Email / Net ID"]', process.env.CAMPUS_ID, { delay: 50 });
  await page.type('input[placeholder="Password"]', process.env.CAMPUS_PWD, { delay: 50 });

  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // 3. Go to calendar page
  await page.goto(CAMPUS_URL, { waitUntil: "networkidle2" });

  // 4. Extract calendar data
  const calendarData = await page.evaluate(() => {
    const dayBlocks = Array.from(document.querySelectorAll("div"));
    const results = [];

    dayBlocks.forEach(el => {
      const text = el.innerText.trim();
      if (text.includes("DO")) {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

        const date = lines.find(l => /^\d+$/.test(l)) || lines[0];
        const doVal = lines.find(l => l.startsWith("DO"));

        if (doVal) {
          results.push({
            date,
            dayOrder: doVal
          });
        }
      }
    });

    return results;
  });

  // 5. Print in terminal
  console.log("Extracted Calendar Data:", calendarData);

  // 6. Save to JSON file
  fs.writeFileSync("calendar.json", JSON.stringify(calendarData, null, 2));
  console.log("✅ Saved to calendar.json");

  await browser.close();
}

run();
