const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const scrapers = require("./scrapers");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

// app.get("/scrap", async (req, res) => {
//   // const query = req.query.query; // Get the query parameter from the request URL
//   const jobs = await scrapers.scrapeAllJobs();

//   res.json(jobs);
// });

app.get("/jobs/alljobs", async (req, res) => {
  const query = req.query.search; // Get the query parameter from the request URL
  const jobs = await scrapers.scrapeAllJobs(query);

  res.json(jobs);
});

app.get("/", (req, res) => {
  res.json({ hello: "hi" });
});
app.get("/test", (req, res) => {
  res.send("test");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
