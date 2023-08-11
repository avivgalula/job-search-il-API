const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const scrapers = require("./scrapers");
const model = require("./model");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.get("/jobs/alljobs", async (req, res) => {
  const query = req.query.search;
  const jobs = await model.getAllJobs(query);
  console.log("jobs");
  console.log(jobs);

  res.json(jobs);
});

app.get("/jobs/jobmaster", async (req, res) => {
  const query = req.query.search;
  const jobs = await model.getJobMaster(query);

  res.json(jobs);
});

app.get("/jobs/drushim", async (req, res) => {
  const query = req.query.search;
  try {
    const jobs = await model.getDrushim(query);

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching all jobs:", err);
    res.status(500).json({ err: "An error occurred while fetching the jobs." });
  }
});

app.get("/", (req, res) => {
  res.json({ home: "scraping jobs api" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
