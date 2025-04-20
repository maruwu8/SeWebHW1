const express = require('express');
const fs = require('fs');
const xml2js = require('xml2js');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3001;


// Serve xsl-view at /xsl-files
app.use('/xsl-files', express.static(path.join(__dirname, 'xsl-view')));
// Serve books.xml manually
app.get('/books.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'xsl-view/books.xml'));
});

// Serve books.xsl manually
app.get('/books.xsl', (req, res) => {
    res.sendFile(path.join(__dirname, 'xsl-view/books.xsl'));
});

app.use(cors());
app.use(bodyParser.json());

let booksInMemory = [];

// Load books.xml into memory
function loadBooks() {
    try {
        const xmlData = fs.readFileSync('scraped_books.xml', 'utf-8');
        xml2js.parseString(xmlData, (err, result) => {
            if (err) {
                console.error('❌ Error parsing XML:', err);
                return;
            }
            booksInMemory = result.books.book || [];
            console.log(`✅ Loaded ${booksInMemory.length} books into memory.`);
        });
    } catch (error) {
        console.error('❌ Error reading books.xml:', error.message);
    }
}

// Save books back to books.xml
function saveBooks() {
    const builder = new xml2js.Builder();
    const updatedXml = builder.buildObject({ books: { book: booksInMemory } });

    // Save to the main file
    fs.writeFileSync('scraped_books.xml', updatedXml);
    console.log('✅ scraped_books.xml updated.');

    // Also save to XSL-viewed file
    fs.writeFileSync('xsl-view/books.xml', updatedXml);
    console.log('✅ xsl-view/books.xml updated (for XSL view).');
}


// Load on startup
loadBooks();

// GET route to return books
app.get('/api/books', (req, res) => {
    res.json(booksInMemory);
});

// POST route to add a new book
app.post('/api/books', (req, res) => {
    const { title, themes, levels } = req.body;

    // Validate input
    if (
        !title || typeof title !== 'string' ||
        !Array.isArray(themes) || themes.length !== 2 ||
        !Array.isArray(levels) || levels.length !== 3
    ) {
        return res.status(400).json({ error: 'Please provide a title, 2 themes, and 3 levels.' });
    }

    // Add new book to memory
    const newBook = {
        title: [title],
        themes: [{ theme: themes }],
        levels: [{ level: levels }]
    };

    booksInMemory.push(newBook);
    saveBooks();

    res.json({ message: '✅ Book added successfully', book: newBook });
});

// POST route to add a new user to user.xml
app.post('/api/users', (req, res) => {
    const { name, surname, preferredTheme, readingLevel } = req.body;

    if (!name || !surname || !preferredTheme || !readingLevel) {
        return res.status(400).json({ error: 'All user fields are required.' });
    }

    const newUser = {
        name: [name],
        surname: [surname],
        preferredTheme: [preferredTheme],
        readingLevel: [readingLevel]
    };

    const filePath = 'user.xml';

    // Load and update user.xml
    if (fs.existsSync(filePath)) {
        const xml = fs.readFileSync(filePath, 'utf-8');
        xml2js.parseString(xml, (err, result) => {
            if (err) {
                console.error('❌ Error parsing user.xml:', err);
                return res.status(500).json({ error: 'Error parsing user.xml' });
            }

            const users = result.users.user || [];
            users.push(newUser);

            const builder = new xml2js.Builder();
            const updatedXml = builder.buildObject({ users: { user: users } });
            fs.writeFileSync(filePath, updatedXml);

            return res.json({ message: '✅ User saved successfully' });
        });
    } else {
        // If somehow file doesn't exist
        const builder = new xml2js.Builder();
        const newXml = builder.buildObject({ users: { user: [newUser] } });
        fs.writeFileSync(filePath, newXml);

        return res.json({ message: '✅ user.xml created and user added' });
    }
});

// GET all users from user.xml
app.get('/api/users', (req, res) => {
    const filePath = 'user.xml';

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'user.xml not found' });
    }

    const xml = fs.readFileSync(filePath, 'utf-8');
    xml2js.parseString(xml, (err, result) => {
        if (err) {
            console.error('❌ Error parsing user.xml:', err);
            return res.status(500).json({ error: 'Error parsing user.xml' });
        }

        const users = result.users.user || [];
        res.json(users);
    });
});

// GET recommendations for a user at a given index
app.get('/api/recommendations/:index', (req, res) => {
    const filePath = 'user.xml';
    const userIndex = parseInt(req.params.index, 10);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'user.xml not found' });
    }

    const xml = fs.readFileSync(filePath, 'utf-8');
    xml2js.parseString(xml, (err, result) => {
        if (err) {
            console.error('❌ Error parsing user.xml:', err);
            return res.status(500).json({ error: 'Error parsing user.xml' });
        }

        const users = result.users.user || [];
        const user = users[userIndex];

        if (!user) {
            return res.status(400).json({ error: 'User not found at given index.' });
        }

        const level = user.readingLevel[0];
        const theme = user.preferredTheme[0];

        // Simulated XPath/XQuery using JS filtering on parsed XML
        const byLevel = booksInMemory.filter(book =>
            book.levels[0].level.includes(level)
        );

        const byBoth = booksInMemory.filter(book =>
            book.levels[0].level.includes(level) &&
            book.themes[0].theme.includes(theme)
        );

        res.json({
            level: byLevel,
            both: byBoth
        });
    });
});



// Serve static files in xsl-view/
app.use(express.static(path.join(__dirname, 'xsl-view')));

// Serve the HTML XSL viewer
app.get('/xsl-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'xsl-view/index.html'));
});

// Proxy to serve books.xml with param
app.get('/books.xml', (req, res) => {
    const level = req.query.level || 'Intermediate';
    const theme = req.query.theme || '';
    let xml = fs.readFileSync('xsl-view/books.xml', 'utf-8');

    // Inject stylesheet if missing
    if (!xml.includes('<?xml-stylesheet')) {
        xml = xml.replace(
            /<\?xml version="1.0"\?>/,
            `<?xml version="1.0"?>\n<?xml-stylesheet type="text/xsl" href="books.xsl"?>`
        );
    }

    // Inject level and theme attributes into <books>
    xml = xml.replace(
        /<books>/,
        `<books level="${level}" theme="${theme}">`
    );

    res.set('Content-Type', 'application/xml');
    res.send(xml);
});



const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

app.get('/api/book-details', (req, res) => {
    const titleQuery = req.query.title;
    if (!titleQuery) {
        return res.status(400).json({ error: 'Title is required.' });
    }

    try {
        const xmlData = fs.readFileSync('scraped_books.xml', 'utf-8');
        const doc = new dom().parseFromString(xmlData);

        // XPath to find book by title
        const nodes = xpath.select(`/books/book[title="${titleQuery}"]`, doc);
        if (nodes.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const bookNode = nodes[0];

        const extractValues = (xpathExpr) =>
            xpath.select(xpathExpr, bookNode).map(n => n.firstChild.data);

        const themes = extractValues('themes/theme');
        const levels = extractValues('levels/level');

        res.json({ title: titleQuery, themes, levels });
    } catch (err) {
        console.error('XPath error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Optional root route
app.get('/', (req, res) => {
    res.send('📚 Book API is running! Use /api/books to view or add books.');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
