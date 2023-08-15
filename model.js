const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

const getDrushim = async function (query, page = 1) {
  try {
    let _page = page - 2;
    console.log("Start fetching Drushim...");

    // Use dynamic import for node-fetch
    const { default: fetch } = await import("node-fetch");

    const response = await fetch(
      `https://www.drushim.co.il/api/jobs/search?searchTerm=${query}&page=${_page}`
    );
    const data = await response.json();
    const jobsList = data.ResultList;

    const jobs = jobsList.map((j) => {
      const link = `https://www.drushim.co.il${j.JobInfo.Link}`;
      const id = "id-dr-" + j.JobAnalytics.id;
      const title = j.JobContent.Name;
      const description = j.JobContent.Description;
      const requirements = j.JobContent.Requirements;
      const publishTime = j.JobInfo.JumpDateString;
      const type = j.JobContent.Scopes[0].NameInHebrew;
      const location = [j.JobContent.Addresses[0].City];
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

    return jobs;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getAllJobs = async function (query, page = 1) {
  try {
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

      if (postJobInfo.includes("דרישות:")) {
        description = postJobInfo.slice(0, postJobInfo.indexOf("דרישות:"));
        requirements = postJobInfo.slice(
          postJobInfo.indexOf("דרישות:") + "דרישות:".length
        );
      } else {
        description = postJobInfo.slice(
          0,
          postJobInfo.indexOf("Requirements:")
        );
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

    return jobs_data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getJobMaster = async function (query, page = 1) {
  try {
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
      try {
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
      } catch (err) {
        console.error(err);
        throw err;
      }
    };

    const jobDataPromises = jobPosts.map(async (i, post) => {
      try {
        // Check if the post has the class name "Mekudam"
        if ($(post).hasClass("Mekudam")) {
          return null; // Skip this job post
        }

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
        publishTime = findElement(post, [".paddingTop10px .Gray"])
          .text()
          .trim();

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
      } catch (err) {
        console.error(err);
        throw err;
      }
    });

    // Wait for all promises to resolve
    const jobsData = await Promise.all(jobDataPromises);

    // Filter out null values (skipped job posts)
    const filteredJobsData = jobsData.filter((job) => job !== null);

    // console.log(filteredJobsData);
    return filteredJobsData;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = { getAllJobs, getJobMaster, getDrushim };
