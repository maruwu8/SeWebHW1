const fs = require('fs');

const user = {
    name: 'Mara',
    surname: 'Laura',
    preferredTheme: 'Fantasy',
    readingLevel: 'Advanced'
};

// Create XML format
const userXml = `
<users>
  <user>
    <name>${user.name}</name>
    <surname>${user.surname}</surname>
    <preferredTheme>${user.preferredTheme}</preferredTheme>
    <readingLevel>${user.readingLevel}</readingLevel>
  </user>
</users>
`.trim();

fs.writeFileSync('user.xml', userXml);
console.log('✅ user.xml created with one user!');
