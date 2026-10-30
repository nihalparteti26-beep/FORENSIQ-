import { NextResponse } from 'next/server';
import { brandDNA } from '../../../lib/brandDNA';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (query) {
    const results = brandDNA.searchSimilarFacts(query, 5);
    return NextResponse.json({ query, results });
  }

  const facts = brandDNA.getAllFacts();
  return NextResponse.json({ facts, total: facts.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'toggle-expiry' && body.id) {
      const updated = brandDNA.toggleFactExpiry(body.id);
      return NextResponse.json({ success: true, fact: updated });
    }
    if (body.action === 'verify' && body.claim) {
      const verification = brandDNA.verifyClaim(body.claim);
      return NextResponse.json(verification);
    }
    const newFact = brandDNA.addFact(body);
    return NextResponse.json({ success: true, fact: newFact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
