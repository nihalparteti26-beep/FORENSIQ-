import { INKLOOM_BRAND_FACTS, type BrandFact } from '../mockData/inkloom.ts';

// In-memory Vector Search & Knowledge Graph Engine for BrandDNA
export class BrandDNARepository {
  private facts: Map<string, BrandFact> = new Map();
  private auditLog: Array<{ id: string; action: string; factId: string; timestamp: string; actor: string }> = [];

  constructor(initialFacts: BrandFact[] = INKLOOM_BRAND_FACTS) {
    initialFacts.forEach(fact => {
      this.facts.set(fact.id, { ...fact });
    });
  }

  public getAllFacts(): BrandFact[] {
    return Array.from(this.facts.values());
  }

  public getFactById(id: string): BrandFact | undefined {
    return this.facts.get(id);
  }

  public addFact(fact: Omit<BrandFact, 'id'>): BrandFact {
    const newId = `FACT-${String(this.facts.size + 1).padStart(3, '0')}`;
    const newFact: BrandFact = {
      ...fact,
      id: newId,
    };
    this.facts.set(newId, newFact);
    this.auditLog.push({
      id: `AUD-${Date.now()}`,
      action: 'FACT_CREATED',
      factId: newId,
      timestamp: new Date().toISOString(),
      actor: fact.owner || 'System Administrator'
    });
    return newFact;
  }

  public updateFact(id: string, updates: Partial<BrandFact>): BrandFact | null {
    const existing = this.facts.get(id);
    if (!existing) return null;
    const updated: BrandFact = { ...existing, ...updates };
    this.facts.set(id, updated);
    this.auditLog.push({
      id: `AUD-${Date.now()}`,
      action: 'FACT_UPDATED',
      factId: id,
      timestamp: new Date().toISOString(),
      actor: updates.owner || 'Brand Manager'
    });
    return updated;
  }

  public toggleFactExpiry(id: string): BrandFact | null {
    const existing = this.facts.get(id);
    if (!existing) return null;
    const newStatus = existing.status === 'expired' ? 'valid' : 'expired';
    const newExpiry = newStatus === 'expired' ? '2023-12-31' : '2028-12-31';
    return this.updateFact(id, { status: newStatus, expiry_date: newExpiry });
  }

  /**
   * Vector Search Simulation with Cosine Similarity over Lexical & Semantic Token Vectors
   * Simulates Qdrant / Pinecone vector collection similarity scoring
   */
  public searchSimilarFacts(query: string, limit: number = 3): Array<{ fact: BrandFact; score: number }> {
    const queryTokens = this.tokenize(query);
    const results: Array<{ fact: BrandFact; score: number }> = [];

    for (const fact of this.facts.values()) {
      const factTokens = this.tokenize(`${fact.claim_text} ${fact.tags.join(' ')} ${fact.category}`);
      const similarity = this.calculateCosineSimilarity(queryTokens, factTokens);
      
      // Bonus boost for exact keyword matches (e.g., percentages, years, numbers)
      const numMatches = (query.match(/\d+%/g) || []).filter(pct => fact.claim_text.includes(pct)).length;
      const boost = numMatches * 0.15;
      const finalScore = Math.min(1.0, similarity + boost);

      if (finalScore > 0.15) {
        results.push({ fact, score: Number(finalScore.toFixed(3)) });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Verifies an individual claim snippet against the BrandDNA vector index
   */
  public verifyClaim(claimSnippet: string): {
    matched: boolean;
    confidence: number;
    fact: BrandFact | null;
    isExpired: boolean;
    recommendation: string;
  } {
    const matches = this.searchSimilarFacts(claimSnippet, 1);
    if (!matches.length || matches[0].score < 0.45) {
      return {
        matched: false,
        confidence: matches.length ? matches[0].score : 0.1,
        fact: null,
        isExpired: false,
        recommendation: `No verifiable evidence found in BrandDNA. Suggest replacing with an approved claim or submitting for review.`
      };
    }

    const top = matches[0];
    const isExpired = top.fact.status === 'expired' || new Date(top.fact.expiry_date) < new Date();

    let recommendation = `Verified by BrandDNA (Confidence: ${Math.round(top.score * 100)}%). Source: ${top.fact.source_doc}`;
    if (isExpired) {
      recommendation = `CAUTION: Fact was valid under ${top.fact.version} but EXPIRED on ${top.fact.expiry_date}. Replace with current active guidance.`;
    }

    return {
      matched: true,
      confidence: top.score,
      fact: top.fact,
      isExpired,
      recommendation
    };
  }

  private tokenize(text: string): Map<string, number> {
    const map = new Map<string, number>();
    const words = text.toLowerCase().replace(/[^a-z0-9% ]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      map.set(w, (map.get(w) || 0) + 1);
    }
    return map;
  }

  private calculateCosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const val of a.values()) normA += val * val;
    for (const val of b.values()) normB += val * val;

    if (normA === 0 || normB === 0) return 0;

    for (const [key, valA] of a.entries()) {
      const valB = b.get(key);
      if (valB) {
        dot += valA * valB;
      }
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Singleton instance for in-memory use
export const brandDNA = new BrandDNARepository();
