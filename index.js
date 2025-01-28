import path from 'node:path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

const BASE_URL = 'https://memegen-link-examples-upleveled.netlify.app/';
const MEMES_FOLDER = './memes';

async function scrapeMemes() {
  try {
    // Step 1: Fetch the HTML
    const { data: html } = await axios.get(BASE_URL);

    // Step 2: Parse the HTML using cheerio
    const $ = cheerio.load(html);
    const imageUrls = [];

    $('img').each((i, el) => {
      if (i < 10) {
        const src = $(el).attr('src');
        if (src) imageUrls.push(src);
      }
    });

    // Step 3: Ensure the memes folder exists
    await fs.ensureDir(MEMES_FOLDER);

    // Step 4: Download the images
    for (const [index, url] of imageUrls.entries()) {
      const filePath = path.join(
        MEMES_FOLDER,
        `${String(index + 1).padStart(2, '0')}.jpg`,
      );
      const { data: image } = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      await fs.writeFile(filePath, image);
      console.log(`Downloaded meme ${index + 1}`);
    }

    console.log('All memes downloaded successfully!');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Run the scraper
scrapeMemes().catch((error) =>
  console.error('An error occurred while scraping memes:', error),
);
