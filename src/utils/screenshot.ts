import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME =
  process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
      ? "/usr/bin/google-chrome"
      : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export default async function screenshot(url: string, width: number = 1920, height: number = 1080) {
  const isProd = process.env.NODE_ENV === "production";

  const browser = await puppeteer.launch(
    isProd
      ? {
          args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
          executablePath: await chromium.executablePath(),
          headless: "shell",
        }
      : { args: [], executablePath: process.env.CHROME_PATH || LOCAL_CHROME, headless: true },
  );

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: "networkidle2" });
    return await page.screenshot({ type: "jpeg" });
  } finally {
    await browser.close();
  }
}
