const puppeteer = require("puppeteer");

const scrapeAllJobs = async function (query) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();
    await page.goto(
      `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${query}&city=&region=`
    );

    // Scrap jobs from page and return an array
    const jobsData = await page.evaluate(() => {
      // Helpers
      const findElementbyQueries = function (parentEl, queries) {
        let childEl;
        queries.forEach((quey) => {
          if (!childEl) childEl = parentEl.querySelector(quey);
        });
        return childEl;
      };

      // Get all the jobs-posts elements
      const jobPosts = Array.from(
        document.querySelectorAll(".openboard-container-jobs .job-content-top")
      );

      // Map over "jobs-posts" and extract the data
      const data = jobPosts.map((job) => {
        // Scrap URL
        const URL = findElementbyQueries(job, [
          ".job-content-top-title a",
          ".job-content-top-title-ltr a",
          ".job-content-top-title-highlight a",
        ])?.href;

        // Scrap title
        const title = findElementbyQueries(job, [
          ".job-content-top-title h3",
          ".job-content-top-title-ltr h3",
          ".job-content-top-title-highlight",
        ])?.innerText;

        // Scrap description
        const description = findElementbyQueries(job, [
          ".job-content-top-desc.AR",
          ".job-content-top-desc.AL",
        ])?.innerText;

        // Scrap publish time
        const publishTime = findElementbyQueries(job, [
          ".job-content-top-date",
        ])?.innerText;

        // Scrap type
        const type = findElementbyQueries(job, [
          ".job-content-top-type",
          ".job-content-top-type-ltr",
        ])?.innerText;

        // Scrap location
        let location;
        // Get the pararent element of the locations
        const locationsParent = job.querySelector(".job-regions-content");
        if (locationsParent) {
          // Get all the location elements
          const locationArr = Array.from(locationsParent.querySelectorAll("a"));

          // Get the location(s) text
          location = locationArr.map((loc) => loc?.innerText).join(", ");
        }
        if (!location)
          location = job.querySelector(
            ".job-content-top-location a"
          )?.innerHTML;

        return {
          URL,
          title,
          description,
          publishTime,
          type,
          location,
        };
      });

      return data;
    });

    return jobsData;
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
};

// scrapeAllJobs("data analyst");

module.exports = { scrapeAllJobs };
