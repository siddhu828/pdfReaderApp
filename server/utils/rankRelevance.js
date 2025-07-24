function rankRelevance(sections, persona, job) {
    const keywords = (persona + " " + job).toLowerCase().split(/\s+/);
  
    return sections.map((sec) => {
      let score = 0;
      const fullText = (sec.title + " " + sec.content).toLowerCase();
      for (let word of keywords) {
        if (fullText.includes(word)) score += 1;
      }
      return { ...sec, relevance: score };
    }).filter(s => s.relevance > 0) // 🔥 only include relevant ones
      .sort((a, b) => b.relevance - a.relevance);
  }
  
  module.exports = rankRelevance;