const fs = require('fs');
const pdf = require('pdf-parse');

async function readPDF(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const data = await pdf(dataBuffer);
  const fullText = data.text;
  const pages = fullText
    .split(/\f|\n(?=Page\s*\d+)/gi) // common page break patterns
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return { fullText, pages };
}

module.exports = readPDF;