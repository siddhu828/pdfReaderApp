const express = require('express');
const multer = require('multer');
const readPDF = require('../utils/readPDF');
const chunkSections = require('../utils/chunkSections');
const rankRelevance = require('../utils/rankRelevance');


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('files'), async (req, res) => {
  const { persona, job } = req.body;
  const files = req.files;

  const processingTimestamp = new Date().toISOString();
  let allSections = [];

  // Step 1: Read & Chunk all PDFs
  for (let file of files) {
    const { fullText, pages } = await readPDF(file.path);
    const chunks = chunkSections(fullText, pages).map(chunk => ({
      ...chunk,
      source: file.originalname
    }));
    allSections.push(...chunks);
  }

  // Step 2: Rank Relevance
  const ranked = rankRelevance(allSections, persona, job);
  const topSections = ranked.slice(0, 5); // take top 5

  // Step 3: Format Output
  const response = {
    metadata: {
      input_documents: files.map(f => f.originalname),
      persona: persona,
      job_to_be_done: job,
      processing_timestamp: processingTimestamp
    },
    extracted_sections: topSections.map((section, index) => ({
      document: section.source,
      section_title: section.title,
      importance_rank: index + 1,
      page_number: section.page || 1
    })),
    subsection_analysis: topSections.map(section => ({
      document: section.source,
      refined_text: section.content.trim(),
      page_number: section.page || 1
    }))
  };

  res.json(response);
});

module.exports = router;