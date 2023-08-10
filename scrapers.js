const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const url = "https://books.toscrape.com/";
const books_data = [];

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
  const jobs_data = [];
  const url = `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${query}&city=&region=`;
  const html = await axios(url);
  const $ = cheerio.load(html.data);
  console.log("Start scraping...");
  const jobPosts = $(".openboard-container-jobs .job-content-top");

  jobPosts.each(function () {
    // Scrap URL
    link = $(this).find(".job-content-top-title a").attr("href");
    if (!link) link = $(this).find(".job-content-top-title-ltr a").attr("href");
    if (!link)
      link = $(this).find(".job-content-top-title-highlight a").attr("href");
    link = `https://www.alljobs.co.il${link}`;

    // Scrap title
    title = $(this).find(".job-content-top-title h3").text();
    if (!title) title = $(this).find(".job-content-top-title-ltr h3").text();
    if (!title) title = $(this).find(".job-content-top-title-highlight").text();
    title = title.replace(/\s+/g, " ");

    // Scrap description
    description = $(this).find(".job-content-top-desc.AR").html();
    if (!description)
      description = $(this).find(".job-content-top-desc.AL").html();
    // Replace <br> with a newline character
    description = description.replace(/<br>/g, "\n");
    // Remove all remaining HTML tags
    description = description.replace(/<\/?[^>]+(>|$)/g, "");
    // Replace &nbsp; with a regular space character
    description = description.replace(/&nbsp;/g, " ");
    // Insert a new line before "Requirements:"
    description = description.replace("Requirements:", "\n\nRequirements:");
    // Insert a new line before "דרישות:"
    description = description.replace("דרישות:", "\n\nדרישות:");

    // Scrap publish time
    publishTime = $(this).find(".job-content-top-date").text();

    // Scrap type
    type = $(this).find(".job-content-top-type").text();
    if (!type) type = $(this).find(".job-content-top-type-ltr").text();
    type = type.replace(/\s+/g, " ");
    type = type.replace("סוג משרה:", "");
    type = type.replace("Job Type:", "").trim();

    // Scrap location
    let location = [];
    // 1) Get locations list
    let locationsEl = $(this).find(".job-content-top-location a");
    if (locationsEl.html() === null)
      locationsEl = $(this).find(".job-content-top-location-ltr a");
    // 2) Push loctaions
    if (locationsEl)
      locationsEl.each(function () {
        location.push($(this).text());
      });

    jobs_data.push({
      title,
      link,
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
