import { NextResponse } from 'next/server';
import { forensicsEngine } from '../../../lib/forensics';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factId = searchParams.get('factId') || 'FACT-001';
  const cascade = searchParams.get('cascade') === 'true';

  const blastRadius = forensicsEngine.calculateBlastRadius(factId);
  const graph = forensicsEngine.getGraphData(factId, cascade);

  return NextResponse.json({
    factId,
    cascade,
    blastRadius,
    graph
  });
}
