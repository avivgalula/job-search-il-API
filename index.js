const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

const url = "https://books.toscrape.com/";

const axiosfun = async function () {
  console.log("Start scraping...");
  const html = await axios(url);
  const $ = cheerio.load(html.data);
  const item = $("h1").text();

  console.log(item);
  return item;
};

// axiosfun();

app.get("/scrap", async (req, res) => {
  // const query = req.query.query; // Get the query parameter from the request URL
  const jobs = await axiosfun();

  res.json(jobs);
});

// const scrapers = require("./scrapers");

// app.get("/jobs/alljobs", async (req, res) => {
//   // const query = req.query.query; // Get the query parameter from the request URL
//   const jobs = await scrapers.scrapeAllJobs("מנהל סושיאל");

//   res.json(jobs);
// });

app.get("/", (req, res) => {
  res.json({ hello: "hi" });
});
app.get("/test", (req, res) => {
  res.send("test");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
