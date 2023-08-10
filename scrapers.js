const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const getAllJobs = async function (query) {
  const url = `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${query}&city=&region=`;
  console.log("Start scraping AllJobs...");
  const html = await axios(url);
  const $ = cheerio.load(html.data);
  const jobs_data = [];
  const jobPosts = $(".openboard-container-jobs .job-content-top");

  // Helper
  const findElement = function (parentEl, queries) {
    let childEl;
    let helper;
    queries.forEach((query) => {
      if (!helper) {
        childEl = $(parentEl).find(query);
        helper = $(parentEl).find(query).text();
      }
    });
    return childEl;
  };

  jobPosts.each((i, post) => {
    // // Scrap URL
    link = findElement(post, [
      ".job-content-top-title a",
      ".job-content-top-title-ltr a",
      ".job-content-top-title-highlight a",
    ]).attr("href");
    link = `https://www.alljobs.co.il${link}`;

    // Scrap title
    title = findElement(post, [
      ".job-content-top-title h3",
      ".job-content-top-title-ltr h3",
      ".job-content-top-title-highlight",
    ]).text();
    title = title.replace(/\s+/g, " ");

    // // Scrap description
    description = findElement(post, [
      ".job-content-top-desc.AR",
      ".job-content-top-desc.AL",
    ]).html();
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

    // // Scrap publish time
    publishTime = findElement(post, [".job-content-top-date"]).text().trim();

    // // Scrap type
    type = findElement(post, [
      ".job-content-top-type",
      ".job-content-top-type-ltr",
    ])
      .text()
      .replace(/\s+/g, " ")
      .replace("סוג משרה:", "")
      .replace("Job Type:", "")
      .trim();

    // // Scrap location
    let location = [];
    // // 1) Get locations list
    locationsEl = findElement(post, [
      ".job-content-top-location a",
      ".job-content-top-location-ltr a",
    ]);
    // // 2) Push loctaions
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

  return jobs_data;
};

// scrapeAllJobs("frontend");

module.exports = { getAllJobs };
