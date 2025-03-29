const axios = require("axios");
const cheerio = require("cheerio");

exports.run = async () => {
  const [
    githubHtmlExtensionUsercount,
    githubHtmlExtensionAddButtonSelectorExistence,
    autoGitkeepPluginDownloadcount
  ] = await Promise.all([
    getGithubHtmlExtensionUsercount(),
    hasGithubHtmlExtensionAddButtonSelector(),
    getAutoGitkeepPluginDownloadcount()
  ]);
  console.log(githubHtmlExtensionUsercount)
  console.log(githubHtmlExtensionAddButtonSelectorExistence)
  console.log(autoGitkeepPluginDownloadcount)
};

/* Github Html Preview Extension 사용자 수 */
getGithubHtmlExtensionUsercount = async () => {
  const { data } = await axios.get("https://chromewebstore.google.com/detail/github-html-preview/pmpjligbgooljdpakhophgddmcipglna");
  return cheerio.load(data)('.F9iKBc').contents().eq(2).text().trim().split(" ")[0];
}

/* Github Html Preview Extension 버튼 생성 오류 여부 */
hasGithubHtmlExtensionAddButtonSelector = async () => {
  const { data } = await axios.get("https://github.com/dohyeon5626/github-html-preview-extension/blob/main/public/popup/popup.html");
  return cheerio.load(data)('.Box-sc-g0xbh4-0 .kcLCKF div > a[data-testid=raw-button]').length == 1;
}

/* Auto Gitkeep Plugin 다운로드 수 */
getAutoGitkeepPluginDownloadcount = async () => {
  const { data } = await axios.get("https://plugins.jetbrains.com/api/plugins/20950");
  return data.downloads;
}