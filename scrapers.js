const axios = require("axios");
const cheerio = require("cheerio");

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

module.exports = { axiosfun };
