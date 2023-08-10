const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const scrapers = require("./scrapers");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.get("/jobs/alljobs", async (req, res) => {
  const query = req.query.search; // Get the query parameter from the request URL
  const jobs = await scrapers.getAllJobs(query);

  res.json(jobs);
});

app.get("/", (req, res) => {
  res.json({ home: "scraping jobs api" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
