const axios = require("axios");
const cheerio = require("cheerio");
const { query } = require("express");
const { URL } = require("url");

const getAllJobs = async function (query, page = 1) {
  const url = `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=${page}&position=&type=&freetxt=${query}&city=&region=`;
  console.log("Start scraping AllJobs...");
  const html = await axios(url);
  const $ = cheerio.load(html.data);
  const jobPosts = $(".openboard-container-jobs .job-content-top");
  const jobs_data = [];

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

    // Create ID
    id = "id-aj-" + link.slice(link.indexOf("=") + 1);

    // Scrap title
    title = findElement(post, [
      ".job-content-top-title h3",
      ".job-content-top-title-ltr h3",
      ".job-content-top-title-highlight",
    ]).text();
    title = title.replace(/\s+/g, " ");

    // // Scrap description & requirements
    postJobInfo = findElement(post, [
      ".job-content-top-desc.AR",
      ".job-content-top-desc.AL",
    ]).html();
    // // Replace <br> with a newline character
    // postJobInfo = postJobInfo.replace(/<br>/g, "\n");
    // // Remove all remaining HTML tags
    // postJobInfo = postJobInfo.replace(/<\/?[^>]+(>|$)/g, "");
    // // Replace &nbsp; with a regular space character
    // postJobInfo = postJobInfo.replace(/&nbsp;/g, " ");
    // slice info
    if (postJobInfo.includes("דרישות:")) {
      description = postJobInfo.slice(0, postJobInfo.indexOf("דרישות:"));
      requirements = postJobInfo.slice(
        postJobInfo.indexOf("דרישות:") + "דרישות:".length
      );
    } else {
      description = postJobInfo.slice(0, postJobInfo.indexOf("Requirements:"));
      requirements = postJobInfo.slice(
        postJobInfo.indexOf("Requirements:") + "Requirements:".length
      );
    }
    // requirements = requirements.slice(postJobInfo.indexOf("Requirements:"));
    // requirements = "";

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
      id,
      title,
      link,
      description,
      requirements,
      publishTime,
      type,
      location,
    });
  });

  // console.log(jobs_data);
  return jobs_data;
};

const getJobMaster = async function (query, page = 1) {
  const url = `https://www.jobmaster.co.il/jobs/?currPage=${page}&q=${query}`;
  console.log("Start scraping JobMaster...");
  const html = await axios(url);
  const $ = cheerio.load(html.data);
  const jobPosts = $(".ul_results_list .JobItem");

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

  const getPostInfo = async function (link) {
    const postHtml = await axios(link);
    const post$ = cheerio.load(postHtml.data);
    const jobPost = post$(".JobItem");

    description = findElement(jobPost, [".jobDescription"])
      .children()
      .eq(1)
      .html();
    requirements = findElement(jobPost, [".jobRequirements "])
      .children()
      .eq(1)
      .html();

    return { description, requirements, link };
  };

  const jobDataPromises = jobPosts.map(async (i, post) => {
    // Scrap URL
    link = findElement(post, [".CardHeader"]).attr("href");
    link = `https://www.jobmaster.co.il/${link}`;
    // Get post info
    const postJobInfo = await getPostInfo(link);
    link = postJobInfo.link;

    // Create ID
    id = "id-jm-" + link.slice(link.indexOf("=") + 1);

    // Scrap title
    title = findElement(post, [".CardHeader"]).text();

    // Scrap description
    description = postJobInfo.description;

    // Scrap requirements
    requirements = postJobInfo.requirements;

    // Scrap publish time
    publishTime = findElement(post, [".paddingTop10px .Gray"]).text().trim();

    // Scrap type
    type = findElement(post, [".JobExtraInfo .jobType"]).text();

    // Scrap location
    location = [
      findElement(post, [".JobExtraInfo .jobLocation"]).text().trim(),
    ];

    return {
      id,
      title,
      link,
      description,
      requirements,
      publishTime,
      type,
      location,
    };
  });

  // Wait for all promises to resolve
  const jobsData = await Promise.all(jobDataPromises);

  return jobsData;
};

module.exports = { getAllJobs, getJobMaster };
