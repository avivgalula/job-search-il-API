const { chromium } = require("playwright");

const scrapTest = async function (query = "frontend") {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${query}&city=&region=`;
  try {
    await page.goto(url);
    // Replace the following selectors with the actual HTML elements you want to scrape
    const titleElement = await page.$(".job-content-top-title h3");
    const title = await titleElement.innerText();
    // const descriptionElement = await page.$("p.description");
    // const description = await descriptionElement.textContent();
    // const inputElement = await page.$('input[type="text"]');
    // const value = await inputElement.inputValue();

    // console.log(value);
    console.log("Title:", title);
    return { Title: title };
    // console.log("Description:", description);
  } catch (error) {
    console.error("Error while scraping:", error);
  } finally {
    await browser.close();
  }
};

scrapTest();

module.exports = { scrapTest };
