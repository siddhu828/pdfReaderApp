# pdfReaderApp

---
## 1A: Frontend — Persona + Job Input Interface

### 🔧 Tech Stack:
- **Vite + React**
- Tailwind CSS (optional if styled)
- API calls to backend (`/persona-extract`)

###  What It Does:
- User uploads multiple PDFs
- Enters a **persona** (e.g., "Travel Planner")
- Specifies a **job to be done** (e.g., "Plan a 4-day trip for 10 friends")
- On submit, it calls the backend and displays extracted content

---

## ⚙1B: Backend — PDF Chunking & Relevance Extraction

###  Tech Stack:
- Node.js + Express
- `pdf-parse` for extracting raw PDF text
- `string-similarity` to estimate page numbers
- `multer` for file uploads
- Simple scoring system for relevance (no AI used)

### 🔍How It Works:
1. **PDFs are parsed** using `pdf-parse`
2. **Text is chunked** into logical sections
3. Each chunk is **scored** for relevance against the persona & job
4. Top 5 chunks are returned with metadata (file name, section, page number)

---

## Docker Setup

### Prerequisites:
- Docker installed
- Docker Compose

### ▶Run the app:
```bash
docker-compose up --build
