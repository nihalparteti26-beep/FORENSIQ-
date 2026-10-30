import { NextResponse } from 'next/server';
import { brandCompiler } from '../../../lib/compiler';
import { brandNegotiator } from '../../../lib/compiler/agents';

export async function POST(request: Request) {
  try {
    const { content, visualContext, runDebate } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content string is required' }, { status: 400 });
    }

    const report = brandCompiler.compile(content, visualContext);
    let debateResult = null;
    if (runDebate) {
      debateResult = brandNegotiator.conductDebate(content, report);
    }

    return NextResponse.json({ report, debateResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
