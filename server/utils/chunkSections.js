const stringSimilarity = require('string-similarity');

function chunkSections(text, pages = []) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let sections = [];
  let current = { title: '', content: '', page: 1 };

  for (let line of lines) {
    const isPotentialHeading = /^[A-Z][A-Za-z\s\-,'&]+$/.test(line) || line === line.toUpperCase();

    if (isPotentialHeading && line.length > 10 && line.length < 100) {
      if (current.title) {
        current.page = estimatePageNumber(current.content, pages);
        sections.push({ ...current });
      }
      current = { title: line, content: '', page: 1 };
    } else {
      current.content += line + ' ';
    }
  }

  if (current.title) {
    current.page = estimatePageNumber(current.content, pages);
    sections.push(current);
  }

  return sections;
}

function estimatePageNumber(content, pages) {
  if (pages.length === 0) return 1;

  const chunkSample = content.slice(0, 500); // take first 500 chars of content
  const matches = stringSimilarity.findBestMatch(chunkSample, pages);
  const bestMatchIndex = matches.bestMatchIndex;

  return bestMatchIndex + 1; // page number is 1-indexed
}

module.exports = chunkSections; 