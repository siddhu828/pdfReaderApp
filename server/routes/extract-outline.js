const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;
  const data = new Uint8Array(fs.readFileSync(filePath));

  try {
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    let rawHeadings = [];
    const textFrequency = new Map();

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const content = await page.getTextContent();

      for (const item of content.items) {
        const text = item.str.trim();
        if (!text || text.length < 3) continue;

        textFrequency.set(text, (textFrequency.get(text) || 0) + 1);

        const transform = item.transform;
        const fontSize = Math.round(Math.abs(transform[0]));

        rawHeadings.push({
          text,
          fontSize,
          page: pageNum,
        });
      }
    }

    // Filter junk based on overused headings (like "Overview")
    rawHeadings = rawHeadings.filter(h => textFrequency.get(h.text) < 3);

    // Merge consecutive number+title lines (e.g. "2.1" + "Intended Audience")
    let merged = [];
    for (let i = 0; i < rawHeadings.length; i++) {
      const current = rawHeadings[i];
      const next = rawHeadings[i + 1];

      const headingNumberRegex = /^(\d+(\.\d+)*)(\s+|\.|\))?$/;

      if (
        next &&
        headingNumberRegex.test(current.text) &&
        !headingNumberRegex.test(next.text) &&
        current.page === next.page
      ) {
        const levelDepth = current.text.split(".").length;
        merged.push({
          text: `${current.text} ${next.text}`,
          level: `H${Math.min(levelDepth, 3)}`,
          page: current.page,
        });
        i++; // Skip next
      } else if (!headingNumberRegex.test(current.text)) {
        // Try regex-based level detection
        const numbered = current.text.match(/^(\d+(\.\d+)*)(\s+|\.|\))+/);
        let level = null;
        if (numbered) {
          const depth = numbered[1].split('.').length;
          level = `H${Math.min(depth, 3)}`;
        } else if (current.fontSize >= 18) {
          level = "H1";
        } else if (current.fontSize >= 14) {
          level = "H2";
        } else if (current.fontSize >= 12) {
          level = "H3";
        }

        if (level) {
          merged.push({
            text: current.text,
            level,
            page: current.page,
          });
        }
      }
    }

    // Final filtering: remove lone numbers/dates
    const cleanOutline = merged.filter(h => {
      return (
        !/^\d+(\.\d+)*$/.test(h.text) &&
        !/^\d{1,2} [A-Z]{3,} \d{4}$/.test(h.text) && // "6 NOV 2013"
        !/^\d{1,2} [A-Z]{3,}\.?$/.test(h.text) &&
        h.text.length >= 5
      );
    });

    const titleCandidates = cleanOutline.slice(0, 2).map(h => h.text).join("  ") || req.file.originalname.replace(/\.pdf$/, "");

    fs.unlinkSync(filePath);

    res.json({
      title: titleCandidates.trim(),
      outline: cleanOutline,
    });

  } catch (err) {
    console.error("🧨 Error extracting structured outline:", err);
    res.status(500).json({ error: "Failed to extract outline" });
  }
});

module.exports = router;