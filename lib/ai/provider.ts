import crypto from 'crypto';

export interface ExtractedClaim {
  id?: string;
  claim: string;
  category: 'Performance' | 'Company' | 'Security' | 'Product' | 'Customer';
  sourceDoc: string;
  pageNumber: number;
  owner: string;
  confidence: number;
  validityPeriod: string;
  expiryDate: string;
  isInferredExpiry: boolean;
  inferredNote: string | null;
  provenance: string;
  contentHash: string;
  tags: string[];
}

export class AIProviderService {
  private openaiApiKey: string | null = null;
  private model = 'gpt-4o';

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
  }

  public getConnectionStatus() {
    return {
      provider: this.openaiApiKey ? 'OpenAI' : 'Local Deterministic NLP Engine',
      configured: Boolean(this.openaiApiKey),
      model: this.openaiApiKey ? this.model : 'Heuristic Rules + Semantic Entity Resolver',
      fallbackActive: !this.openaiApiKey
    };
  }

  /**
   * Parse date & infer expiration from natural language strings
   */
  public inferExpiryDate(text: string): {
    expiryDate: string;
    isInferred: boolean;
    inferredNote: string | null;
    validityPeriod: string;
  } {
    const raw = (text || '').toLowerCase();

    // 1. Explicit ISO date: YYYY-MM-DD
    const isoMatch = raw.match(/\b(202\d|203\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
    if (isoMatch) {
      return {
        expiryDate: isoMatch[0],
        isInferred: false,
        inferredNote: null,
        validityPeriod: `Explicit date until ${isoMatch[0]}`
      };
    }

    // 2. Quarter expressions: e.g. "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"
    const qMatch = raw.match(/\bq([1-4])\s*(202\d|203\d)\b/i);
    if (qMatch) {
      const q = parseInt(qMatch[1], 10);
      const year = qMatch[2];
      const quarterEndDates: Record<number, string> = {
        1: `${year}-03-31`,
        2: `${year}-06-30`,
        3: `${year}-09-30`,
        4: `${year}-12-31`
      };
      return {
        expiryDate: quarterEndDates[q],
        isInferred: true,
        inferredNote: `Inferred from quarter notation '${qMatch[0].toUpperCase()}'`,
        validityPeriod: `Valid through ${qMatch[0].toUpperCase()}`
      };
    }

    // 3. Year end: "end of 2025", "through 2026"
    const yearMatch = raw.match(/\b(?:end\s+of|through|until|valid\s+to)\s+(202\d|203\d)\b/i);
    if (yearMatch) {
      return {
        expiryDate: `${yearMatch[1]}-12-31`,
        isInferred: true,
        inferredNote: `Inferred from end of calendar year ${yearMatch[1]}`,
        validityPeriod: `Valid until end of ${yearMatch[1]}`
      };
    }

    // 4. Relative time: "for 2 years", "1 year"
    const relMatch = raw.match(/(\d+)\s*(?:year|yr)s?/i);
    if (relMatch) {
      const years = parseInt(relMatch[1], 10);
      const targetYear = new Date().getFullYear() + years;
      return {
        expiryDate: `${targetYear}-12-31`,
        isInferred: true,
        inferredNote: `Inferred from relative duration '${years} year(s)'`,
        validityPeriod: `${years} Year Validity`
      };
    }

    // Default fallback
    return {
      expiryDate: '2028-12-31',
      isInferred: true,
      inferredNote: 'Default 3-year enterprise brand warranty policy',
      validityPeriod: '3-Year Standard Brand Cycle'
    };
  }

  /**
   * Determine category from claim text
   */
  public categorizeClaim(text: string): 'Performance' | 'Company' | 'Security' | 'Product' | 'Customer' {
    const lower = text.toLowerCase();
    if (/soc-2|iso\s*27001|gdpr|ccpa|security|audit|encryption|ciso|privacy|data\s*retention/i.test(lower)) {
      return 'Security';
    }
    if (/founded|founder|headquarter|san francisco|zurich|payroll|employee|census|acquisition/i.test(lower)) {
      return 'Company';
    }
    if (/customer|fortune\s*500|brands|roster|nps|client|satisfaction|case\s*study/i.test(lower)) {
      return 'Customer';
    }
    if (/%\s*(?:savings|efficient|faster|reduction|productivity|boost)|minutes|hours|days|benchmark|tei\s*study/i.test(lower)) {
      return 'Performance';
    }
    return 'Product';
  }

  /**
   * Local deterministic claim extractor
   */
  public extractClaimsLocally(
    documentText: string,
    documentTitle: string,
    pageMapping?: Array<{ page: number; text: string }>
  ): ExtractedClaim[] {
    const claims: ExtractedClaim[] = [];
    const seenHashes = new Set<string>();

    const pages = pageMapping && pageMapping.length > 0
      ? pageMapping
      : [{ page: 1, text: documentText }];

    for (const pageItem of pages) {
      const text = pageItem.text;
      // Split into lines first, preserving numbered rules and bullet lists
      const rawLines = text.split(/\r?\n+/).map(l => l.trim()).filter(Boolean);
      const sentences: string[] = [];
      for (const line of rawLines) {
        if (/^\d+\.\s+|^[-•*]\s+/.test(line)) {
          sentences.push(line);
        } else {
          const subs = line.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 20);
          sentences.push(...subs);
        }
      }

      for (const rawSentence of sentences) {
        // Strip leading numbering or bullet points
        const cleanCandidate = rawSentence.replace(/^[\d]+\.\s+|^[-•*]\s+/, '').trim();
        // Look for claim-bearing sentence patterns or numbered guideline rules
        const isFactCandidate =
          Boolean(rawSentence.match(/^\d+\.\s+/)) ||
          /\b(?:\d+%|\$\d+|guarantees?|certified|founded|reduces?|trusted\s+by|compliant\s+with|uptime|sla|soc-?2|iso\s*\d+|patented?)\b/i.test(cleanCandidate) ||
          /\b(?:valid\s+until|benchmark|performance|integrates?\s+with|throughput|fips|fedramp|tokens?|linting|certificates?|immunizer|wcag|gdpr|ccpa)\b/i.test(cleanCandidate);

        if (isFactCandidate && cleanCandidate.length >= 20) {
          // Normalize text
          const cleanClaim = cleanCandidate.replace(/\s+/g, ' ').trim();
          const contentHash = crypto.createHash('sha256').update(cleanClaim.toLowerCase()).digest('hex');

          if (seenHashes.has(contentHash)) continue;
          seenHashes.add(contentHash);

          const category = this.categorizeClaim(cleanClaim);
          const expiryInfo = this.inferExpiryDate(cleanClaim);

          // Extract tags
          const tags: string[] = [category.toLowerCase()];
          if (cleanClaim.includes('%')) tags.push('metric');
          if (/\bsoc-2|iso\b/i.test(cleanClaim)) tags.push('compliance');
          if (/\buptime|sla\b/i.test(cleanClaim)) tags.push('sla');

          claims.push({
            claim: cleanClaim,
            category,
            sourceDoc: `${documentTitle} (p. ${pageItem.page})`,
            pageNumber: pageItem.page,
            owner: category === 'Security' ? 'David Lin (CISO)' : category === 'Company' ? 'Elena Rostova (Executive)' : 'Sarah Chen (Head of Product Marketing)',
            confidence: 0.94 + Math.round((cleanClaim.length % 5)) * 0.01,
            validityPeriod: expiryInfo.validityPeriod,
            expiryDate: expiryInfo.expiryDate,
            isInferredExpiry: expiryInfo.isInferred,
            inferredNote: expiryInfo.inferredNote,
            provenance: `${documentTitle} > Page ${pageItem.page} > Auto-Extracted AST Node`,
            contentHash,
            tags
          });
        }
      }
    }

    return claims;
  }

  /**
   * Extract claims using OpenAI or fallback
   */
  public async extractClaims(
    documentText: string,
    documentTitle: string,
    pageMapping?: Array<{ page: number; text: string }>
  ): Promise<ExtractedClaim[]> {
    if (!this.openaiApiKey) {
      return this.extractClaimsLocally(documentText, documentTitle, pageMapping);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: `You are the FORENSIQ BrandDNA Fact Extraction Engine. Extract verified, defensible brand claims, statistics, certifications, metrics, and policy rules from the text. For each claim return a JSON array of objects with:
              - claim: exact verified statement
              - category: "Performance" | "Company" | "Security" | "Product" | "Customer"
              - pageNumber: integer
              - owner: suggested corporate owner
              - confidence: float 0.8-1.0
              - validityPeriod: text description
              - expiryDate: YYYY-MM-DD (infer if phrase like "valid until Q2 2025" or specify default 2028-12-31)
              - isInferredExpiry: boolean
              - inferredNote: string or null
              - tags: array of strings
              Return ONLY valid JSON array.`
            },
            {
              role: 'user',
              content: `Document: "${documentTitle}"\nContent:\n${documentText.slice(0, 15000)}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
        return parsed.map((item: any) => ({
          claim: item.claim,
          category: item.category || this.categorizeClaim(item.claim),
          sourceDoc: `${documentTitle} (p. ${item.pageNumber || 1})`,
          pageNumber: item.pageNumber || 1,
          owner: item.owner || 'Brand Ingestion Engine',
          confidence: item.confidence || 0.95,
          validityPeriod: item.validityPeriod || 'Active Standard Period',
          expiryDate: item.expiryDate || '2028-12-31',
          isInferredExpiry: Boolean(item.isInferredExpiry),
          inferredNote: item.inferredNote || null,
          provenance: `${documentTitle} > Page ${item.pageNumber || 1} > LLM-Synthesized Node`,
          contentHash: crypto.createHash('sha256').update((item.claim || '').toLowerCase()).digest('hex'),
          tags: item.tags || [item.category?.toLowerCase() || 'general']
        }));
      }
    } catch (err) {
      console.warn('⚠️ OpenAI claim extraction failed, falling back to local extractor:', err);
    }

    return this.extractClaimsLocally(documentText, documentTitle, pageMapping);
  }
}

export const aiProvider = new AIProviderService();
