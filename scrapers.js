const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://books.toscrape.com/";
const books_data = [];
const jobs_data = [];

const axiosfun = async function () {
  try {
    console.log("Start scraping...");
    const html = await axios(url);
    const $ = cheerio.load(html.data);
    const booksParentEl = $("article");

    booksParentEl.each(function () {
      title = $(this).find("h3 a").text();
      price = $(this).find(".price_color").text();
      stock = $(this).find(".availability").text().trim();

      books_data.push({ title, price, stock });
    });

    // console.log(books_data);
    return books_data;
  } catch (err) {
    console.error(err);
  }
};

const scrapeAllJobs = async function (query) {
  const url = `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${query}&city=&region=`;
  const html = await axios(url);
  const $ = cheerio.load(html);
  const jobPosts = $(".openboard-container-jobs .job-content-top");

  jobPosts.each(function () {
    console.log("Start scraping...");
    URL = $(this).find(".job-content-top-title a").attr("href");
    if (!URL) URL = $(this).find(".job-content-top-title-ltr a").attr("href");
    if (!URL)
      URL = $(this).find(".job-content-top-title-highlight a").attr("href");

    jobs_data.push({ URL });
  });

  return "sds";
  console.log(jobs_data);
};

scrapeAllJobs("frontend");

module.exports = { scrapeAllJobs };
