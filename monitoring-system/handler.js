const axios = require("axios");
const cheerio = require("cheerio");

exports.run = async () => {
    console.log(await getGithubHtmlExtensionUsercount())
};

getGithubHtmlExtensionUsercount = async () => {
    const { data } = await axios.get("https://chromewebstore.google.com/detail/github-html-preview/pmpjligbgooljdpakhophgddmcipglna");
    return cheerio.load(data)('.F9iKBc').contents().eq(2).text().trim().split(" ")[0];
}