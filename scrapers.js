const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

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

const scrapeAllJobs = async function (query = "frontend") {
  const url = `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${query}&city=&region=`;
  const html = await axios(url);
  const $ = cheerio.load(html.data);
  console.log("Start scraping...");
  const jobPosts = $(".openboard-container-jobs .job-content-top");

  jobPosts.each(function () {
    // Scrap URL
    linkURL = $(this).find(".job-content-top-title a").attr("href");
    if (!linkURL)
      linkURL = $(this).find(".job-content-top-title-ltr a").attr("href");
    if (!linkURL)
      linkURL = $(this).find(".job-content-top-title-highlight a").attr("href");

    // Scrap title
    title = $(this).find(".job-content-top-title h3").text();
    if (!title) title = $(this).find(".job-content-top-title-ltr h3").text();
    if (!title) title = $(this).find(".job-content-top-title-highlight").text();

    // Scrap description
    description = $(this).find(".job-content-top-desc.AR").text();
    if (!description)
      description = $(this).find(".job-content-top-desc.AL").text();

    // Scrap publish time
    publishTime = $(this).find(".job-content-top-date").text();

    // Scrap type
    type = $(this).find(".job-content-top-type").text();
    if (!type) type = $(this).find(".job-content-top-type-ltr").text();

    // Scrap location
    let location;
    // Get the parent element of the locations
    const locationsParent = $(this).find(".job-regions-content");
    if (locationsParent.length > 0) {
      // Get all the location elements
      const locationArr = locationsParent.find("a");

      // Get the location(s) text
      location = locationArr
        .map((index, loc) => $(loc).text())
        .get()
        .join(", ");
    }

    if (!location) {
      location = $(".job-content-top-location a").text();
    }

    jobs_data.push({
      title,
      linkURL,
      description,
      publishTime,
      type,
      location,
    });
  });

  // console.log(jobs_data);
  return jobs_data;
};

// scrapeAllJobs("frontend");

module.exports = { scrapeAllJobs };
