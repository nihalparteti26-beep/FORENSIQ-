import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as xlsx from 'xlsx';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParsePkg = require('pdf-parse');
import { aiProvider } from '../ai/provider.ts';
import { neo4jService } from '../db/neo4j.ts';
import { qdrantService } from '../db/qdrant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const JOBS_PATH = path.join(DATA_DIR, 'ingest_jobs.json');

export interface IngestJob {
  jobId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'queued' | 'parsing' | 'extracting' | 'vectorizing' | 'completed' | 'failed';
  progress: number; // 0 - 100
  stage: string;
  documentId: string;
  extractedCount: number;
  duplicateCount: number;
  extractedFacts: any[];
  warnings: string[];
  error: string | null;
  parserUsed: 'unstructured_api' | 'local_pdf_parser' | 'local_spreadsheet_parser' | 'local_text_parser';
  createdAt: string;
  completedAt: string | null;
}

class IngestionPipelineService {
  private jobs: Record<string, IngestJob> = {};

  constructor() {
    this.initJobsStore();
  }

  private initJobsStore() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(JOBS_PATH)) {
      try {
        const raw = fs.readFileSync(JOBS_PATH, 'utf-8');
        this.jobs = JSON.parse(raw);
      } catch (err) {
        this.jobs = {};
      }
    }
  }

  private persistJobs() {
    try {
      const tmp = `${JOBS_PATH}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.jobs, null, 2), 'utf-8');
      fs.renameSync(tmp, JOBS_PATH);
    } catch (e) {
      console.error('Failed to persist ingest_jobs.json:', e);
    }
  }

  public getJob(jobId: string): IngestJob | null {
    return this.jobs[jobId] || null;
  }

  public getAllJobs(): IngestJob[] {
    return Object.values(this.jobs).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * PDF text extraction with page numbers
   */
  private async parsePdf(buffer: Buffer): Promise<{
    fullText: string;
    pages: Array<{ page: number; text: string }>;
  }> {
    const pages: Array<{ page: number; text: string }> = [];
    let fullText = '';

    try {
      const PDFParse = (pdfParsePkg as any).PDFParse;
      if (typeof PDFParse === 'function') {
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const textResult = await parser.getText();
        if (textResult && Array.isArray(textResult.pages)) {
          textResult.pages.forEach((p: any, idx: number) => {
            const pageText = p.text || '';
            pages.push({ page: idx + 1, text: pageText });
            fullText += pageText + '\n\n';
          });
        } else if (textResult && typeof textResult.text === 'string') {
          fullText = textResult.text;
          pages.push({ page: 1, text: fullText });
        }
      }
    } catch (e) {
      console.warn('PDFParse class failed, falling back to direct stream parsing:', e);
    }

    // Fallback if pages empty: extract textual strings directly from PDF buffer
    if (!fullText || pages.length === 0) {
      const raw = buffer.toString('latin1');
      // Match text inside parentheses or text blocks
      const matches = raw.match(/\(([^()]{3,})\)\s*Tj/g) || raw.match(/BT[\s\S]*?ET/g) || [];
      const extracted = matches
        .map(m => m.replace(/BT|ET|\(|\)|Tj/g, ' ').trim())
        .filter(m => m.length > 5)
        .join(' ');

      if (extracted.length > 20) {
        fullText = extracted;
        pages.push({ page: 1, text: extracted });
      } else {
        // Human-readable string filter
        const clean = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        const lines = clean.split('\n').filter(l => l.trim().length > 15);
        fullText = lines.join('\n');
        pages.push({ page: 1, text: fullText });
      }
    }

    return { fullText, pages };
  }

  /**
   * Spreadsheet (XLSX, XLS, CSV) parsing
   */
  private parseSpreadsheet(buffer: Buffer, fileName: string): {
    fullText: string;
    pages: Array<{ page: number; text: string }>;
    rawRows: any[];
  } {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const pages: Array<{ page: number; text: string }> = [];
    const allRows: any[] = [];
    let fullText = '';

    workbook.SheetNames.forEach((sheetName, index) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet) as any[];
      allRows.push(...rows);

      let sheetText = `--- Sheet: ${sheetName} ---\n`;
      rows.forEach((row, rIdx) => {
        const line = Object.entries(row)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
        sheetText += line + '\n';
      });

      pages.push({ page: index + 1, text: sheetText });
      fullText += sheetText + '\n\n';
    });

    return { fullText, pages, rawRows: allRows };
  }

  /**
   * Markdown, HTML, Plain text parsing
   */
  private parseTextDoc(buffer: Buffer, mimeType: string): {
    fullText: string;
    pages: Array<{ page: number; text: string }>;
  } {
    let raw = buffer.toString('utf-8');

    // Strip HTML tags if HTML
    if (mimeType.includes('html')) {
      raw = raw.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      raw = raw.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      raw = raw.replace(/<[^>]+>/g, ' ');
    }

    // Chunk into ~1500 character logical pages
    const paragraphs = raw.split(/\n\s*\n/);
    const pages: Array<{ page: number; text: string }> = [];
    let currentPage = 1;
    let currentChunk = '';

    for (const p of paragraphs) {
      if (currentChunk.length + p.length > 1500) {
        pages.push({ page: currentPage++, text: currentChunk.trim() });
        currentChunk = p + '\n\n';
      } else {
        currentChunk += p + '\n\n';
      }
    }
    if (currentChunk.trim().length > 0) {
      pages.push({ page: currentPage, text: currentChunk.trim() });
    }

    return { fullText: raw, pages };
  }

  /**
   * Main ingest pipeline execution
   */
  public async processUpload(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }): Promise<IngestJob> {
    const jobId = `JOB-${Date.now().toString(36).toUpperCase()}`;
    const docId = `DOC-${crypto.createHash('md5').update(file.originalname + Date.now()).digest('hex').slice(0, 6).toUpperCase()}`;

    // Validate size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error(`File size ${Math.round(file.size / (1024 * 1024))}MB exceeds maximum limit of 50MB.`);
    }

    // Supported extensions & mimetypes
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.pdf', '.csv', '.xlsx', '.xls', '.md', '.markdown', '.html', '.txt'];
    if (!validExts.includes(ext)) {
      throw new Error(`Unsupported file type '${ext}'. Please upload Brand Guidelines PDF, CSV/XLSX spreadsheets, or Markdown/HTML documents.`);
    }

    const job: IngestJob = {
      jobId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'queued',
      progress: 5,
      stage: 'File validated and queued for parsing',
      documentId: docId,
      extractedCount: 0,
      duplicateCount: 0,
      extractedFacts: [],
      warnings: [],
      error: null,
      parserUsed: 'local_text_parser',
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    this.jobs[jobId] = job;
    this.persistJobs();

    // Run processing
    this.executePipelineAsync(job, file.buffer, ext);

    return job;
  }

  private async executePipelineAsync(job: IngestJob, buffer: Buffer, ext: string) {
    try {
      // STAGE 1: PARSING
      job.status = 'parsing';
      job.progress = 25;
      job.stage = 'Extracting structured text and page boundaries';
      this.persistJobs();

      let parsed: { fullText: string; pages: Array<{ page: number; text: string }>; rawRows?: any[] };

      if (ext === '.pdf') {
        job.parserUsed = 'local_pdf_parser';
        parsed = await this.parsePdf(buffer);
      } else if (['.csv', '.xlsx', '.xls'].includes(ext)) {
        job.parserUsed = 'local_spreadsheet_parser';
        parsed = this.parseSpreadsheet(buffer, job.fileName);
      } else {
        job.parserUsed = 'local_text_parser';
        parsed = this.parseTextDoc(buffer, job.mimeType);
      }

      if (!parsed.fullText || parsed.fullText.trim().length < 10) {
        throw new Error('Document contained no readable text or parseable claim records.');
      }

      // STAGE 2: CLAIM EXTRACTION & INFERENCE
      job.status = 'extracting';
      job.progress = 50;
      job.stage = 'Synthesizing verified claims, categories, and inferring expiry dates';
      this.persistJobs();

      const extractedClaims: ExtractedClaim[] = await aiProvider.extractClaims(
        parsed.fullText,
        job.fileName,
        parsed.pages
      );

      // If document was spreadsheet with explicit columns, convert rows directly to facts
      if (parsed.rawRows && parsed.rawRows.length > 0 && extractedClaims.length === 0) {
        for (let idx = 0; idx < parsed.rawRows.length; idx++) {
          const row = parsed.rawRows[idx];
          const claim = row.claim || row.claim_text || row.Fact || row.Statement || row.Description || Object.values(row)[0];
          if (claim && String(claim).length > 10) {
            const cat = row.category || row.Category || aiProvider.categorizeClaim(String(claim));
            const expiry = row.expiry_date || row.expiry || row.Expiry || '2028-12-31';
            const owner = row.owner || row.Owner || 'Spreadsheet Ingest';
            const conf = parseFloat(row.confidence || 0.96);
            const contentHash = crypto.createHash('sha256').update(String(claim).toLowerCase()).digest('hex');

            extractedClaims.push({
              claim: String(claim),
              category: cat,
              sourceDoc: `${job.fileName} (Row ${idx + 2})`,
              pageNumber: 1,
              owner,
              confidence: conf,
              validityPeriod: `Valid until ${expiry}`,
              expiryDate: expiry,
              isInferredExpiry: false,
              inferredNote: null,
              provenance: `${job.fileName} > Row ${idx + 2}`,
              contentHash,
              tags: [cat.toLowerCase(), 'spreadsheet']
            });
          }
        }
      }

      // STAGE 3: VECTORIZATION & GRAPH PERSISTENCE
      job.status = 'vectorizing';
      job.progress = 75;
      job.stage = 'Generating semantic embeddings and indexing into Qdrant & Neo4j';
      this.persistJobs();

      // Check existing facts for deduplication
      const existingFacts = await neo4jService.getAllFacts();
      const existingHashes = new Set(existingFacts.map(f => f.contentHash || crypto.createHash('sha256').update((f.claim || '').toLowerCase()).digest('hex')));

      let newCount = 0;
      let dupCount = 0;
      const savedFactRecords: any[] = [];

      for (const claimItem of extractedClaims) {
        if (existingHashes.has(claimItem.contentHash)) {
          dupCount++;
          job.warnings.push(`Duplicate fact skipped: "${claimItem.claim.slice(0, 50)}..."`);
          continue;
        }

        // Generate next Fact ID
        const totalFacts = existingFacts.length + newCount + 1;
        const factId = `FACT-${String(totalFacts).padStart(3, '0')}`;

        // 1. Save to Neo4j
        const neoFact = await neo4jService.upsertFact({
          id: factId,
          claim: claimItem.claim,
          category: claimItem.category,
          sourceDoc: claimItem.sourceDoc,
          evidenceUrl: `https://evidence.inkloom.internal/uploads/${encodeURIComponent(job.fileName)}`,
          expiryDate: claimItem.expiryDate,
          version: 'v1.0',
          owner: claimItem.owner,
          confidence: claimItem.confidence,
          status: 'valid',
          tags: claimItem.tags,
          isInferredExpiry: claimItem.isInferredExpiry,
          inferredNote: claimItem.inferredNote,
          pageNumber: claimItem.pageNumber,
          provenance: claimItem.provenance,
          documentId: job.documentId
        });

        // 2. Save vector to Qdrant
        await qdrantService.upsertPoint(
          factId,
          `${claimItem.claim} ${claimItem.category} ${claimItem.tags.join(' ')}`,
          {
            fact_id: factId,
            claim: claimItem.claim,
            category: claimItem.category,
            source_doc: claimItem.sourceDoc,
            expiry_date: claimItem.expiryDate,
            status: 'valid',
            confidence: claimItem.confidence,
            tags: claimItem.tags,
            isInferredExpiry: claimItem.isInferredExpiry
          }
        );

        savedFactRecords.push(neoFact);
        existingHashes.add(claimItem.contentHash);
        newCount++;
      }

      // STAGE 4: COMPLETED
      job.status = 'completed';
      job.progress = 100;
      job.stage = `Ingestion complete! Synthesized ${newCount} new BrandDNA facts (${dupCount} duplicates omitted).`;
      job.extractedCount = newCount;
      job.duplicateCount = dupCount;
      job.extractedFacts = savedFactRecords;
      job.completedAt = new Date().toISOString();
      this.persistJobs();
      console.log(`✅ Ingestion Job ${job.jobId} completed: ${newCount} facts added to Neo4j & Qdrant.`);
    } catch (err: any) {
      console.error(`❌ Ingestion Job ${job.jobId} failed:`, err);
      job.status = 'failed';
      job.progress = 100;
      job.stage = 'Ingestion processing failed';
      job.error = err.message || 'Unknown ingestion error';
      job.completedAt = new Date().toISOString();
      this.persistJobs();
    }
  }
}

export const ingestionPipeline = new IngestionPipelineService();
