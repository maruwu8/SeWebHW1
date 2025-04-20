const puppeteer = require('puppeteer');
const fs = require('fs');

// Predefined theme and reading level arrays
const THEMES = ['Fantasy', 'Mystery', 'Science Fiction', 'Romance', 'Thriller',
    'Adventure', 'Drama', 'Historical Fiction', 'Non-Fiction', 'Self-Help', 'Biography',
    'Poetry', 'Graphic Novel', 'Young Adult', 'Children Literature', 'Classic Literature', 'Dystopian Fiction',
    'Horror', 'Contemporary Fiction'];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function getRandomThemes() {
    const shuffled = THEMES.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
}

function getRandomLevels() {
    const shuffled = LEVELS.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

async function scrapeBooks() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const url = 'https://reedsy.com/discovery/blog/best-books-to-read-in-a-lifetime';
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Scroll to load more books
        for (let i = 0; i < 6; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise(r => setTimeout(r, 1000));
        }

        const titles = await page.evaluate(() => {
            const results = [];
            const headings = Array.from(document.querySelectorAll('h2'));

            for (const el of headings) {
                let text = el.innerText.trim();
                text = text.replace(/^\d+\.\s*/, ''); // Remove numbering

                if (text.length > 3 && !results.includes(text)) {
                    results.push(text);
                }

                if (results.length === 40) break;
            }

            return results;
        });

        await browser.close();

        const books = titles.map(title => ({
            title,
            themes: getRandomThemes(),
            levels: getRandomLevels()
        }));

        // Convert to XML
        const xmlBooks = `
<books>
${books.map(book => `
  <book>
    <title>${book.title}</title>
    <themes>
      <theme>${book.themes[0]}</theme>
      <theme>${book.themes[1]}</theme>
    </themes>
    <levels>
      <level>${book.levels[0]}</level>
      <level>${book.levels[1]}</level>
      <level>${book.levels[2]}</level>
    </levels>
  </book>`).join('\n')}
</books>
        `.trim();

        fs.writeFileSync('scraped_books.xml', xmlBooks);
        console.log('✅ scraped_books.xml generated with 40 books!');
    } catch (err) {
        console.error('❌ Error during scraping:', err.message);
    }
}

scrapeBooks();
