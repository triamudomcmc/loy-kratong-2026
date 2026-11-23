import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME =
  process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
      ? "/usr/bin/google-chrome"
      : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function launchOptions() {
  // An installed Chromium (the Docker image sets CHROME_PATH=/usr/bin/chromium) wins in every environment.
  if (process.env.CHROME_PATH) {
    return {
      executablePath: process.env.CHROME_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
    };
  }
  // Serverless (Vercel / Lambda): the bundled @sparticuz/chromium build.
  if (process.env.NODE_ENV === "production") {
    return {
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell" as const,
    };
  }
  return { args: [], executablePath: LOCAL_CHROME, headless: true };
}

export default async function screenshot(url: string, width: number = 1920, height: number = 1080) {
  const browser = await puppeteer.launch(await launchOptions());

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: "networkidle2" });
    return await page.screenshot({ type: "jpeg" });
  } finally {
    await browser.close();
  }
}
