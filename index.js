const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

const scrapers = require("./scrapers");

// const url = "https://books.toscrape.com/";
// const books_data = [];

// const axiosfun = async function () {
//   try {
//     console.log("Start scraping...");
//     const html = await axios(url);
//     const $ = cheerio.load(html.data);
//     const booksParentEl = $("article");

//     booksParentEl.each(function () {
//       title = $(this).find("h3 a").text();
//       price = $(this).find(".price_color").text();
//       stock = $(this).find(".availability").text().trim();

//       books_data.push({ title, price, stock });
//     });

//     console.log(books_data);
//   } catch (err) {
//     console.error(err);
//   }
// };

// axiosfun();

app.get("/scrap", async (req, res) => {
  // const query = req.query.query; // Get the query parameter from the request URL
  const jobs = await scrapers.axiosfun();

  res.json(jobs);
});

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
