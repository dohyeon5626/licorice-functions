import axios from "axios";
import { load } from "cheerio";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const CHANNEL_KEY = process.env.CHANNEL_KEY;

export const run = async () => {
  const browser =
        // await (await import("puppeteer")).launch() // 로컬에서 실행시
        await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar'),
            headless: chromium.headless,
        });
  const [
    githubHtmlPreviewExtensionUsercount,
    githubHtmlPreviewExtensionAddButtonSelectorExistence,
    autoGitkeepPluginDownloadcount
  ] = await Promise.all([
    getGithubHtmlPreviewExtensionUsercount(),
    hasGithubHtmlPreviewExtensionAddButtonSelector(browser),
    getAutoGitkeepPluginDownloadcount()
  ]);
  await browser.close();

  const alarm = [];
  alarm.push(axios.post("https://ntfy.sh", {
    "topic": CHANNEL_KEY,
    "message": `Github Html Preview 유저 수: ${githubHtmlPreviewExtensionUsercount}명\nAuto Gitkeep 누적 다운로드: ${autoGitkeepPluginDownloadcount}명`,
    "title": new Date().toISOString().split("T")[0],
    "tags": ["computer"],
    "priority": 3,
    "click": "none"
  }));
  if (!githubHtmlPreviewExtensionAddButtonSelectorExistence) {
    alarm.push(axios.post("https://ntfy.sh", {
      "topic": CHANNEL_KEY,
      "message": `Github Html Preview 문제 확인 필요`,
      "title": "오류 발생",
      "tags": ["warning"],
      "priority": 5,
      "click": "none"
    }));
  }
  await Promise.all(alarm);
};

/* Github Html Preview Extension 사용자 수 */
const getGithubHtmlPreviewExtensionUsercount = async () => {
  const { data } = await axios.get("https://chromewebstore.google.com/detail/github-html-preview/pmpjligbgooljdpakhophgddmcipglna");
  return load(data)('.F9iKBc').contents().eq(2).text().trim().split(" ")[0];
}

/* Github Html Preview Extension 버튼 생성 오류 여부 */
const hasGithubHtmlPreviewExtensionAddButtonSelector = async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://github.com/dohyeon5626/github-html-preview-extension/blob/main/public/popup/popup.html');
  return await page.evaluate(() => document.querySelectorAll(".Box-sc-g0xbh4-0 .prc-ButtonGroup-ButtonGroup-vcMeG")[0].querySelectorAll('div > a[data-testid="raw-button"]').length === 1);
}

/* Auto Gitkeep Plugin 다운로드 수 */
const getAutoGitkeepPluginDownloadcount = async () => {
  const { data } = await axios.get("https://plugins.jetbrains.com/api/plugins/20950");
  return data.downloads;
}