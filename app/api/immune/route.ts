import { NextResponse } from 'next/server';
import { immuneEngine } from '../../../lib/immune';

export async function GET() {
  const driftRadar = immuneEngine.getDriftRadarData();
  const rootCause = immuneEngine.getRootCauseAnalysis();
  const heatmap = immuneEngine.getRepeatedMistakesHeatmap();
  const unclearGuidelines = immuneEngine.getUnclearGuidelines();

  return NextResponse.json({
    driftRadar,
    rootCause,
    heatmap,
    unclearGuidelines
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'apply-patch') {
      const result = immuneEngine.applySystemicPatch(body.patchId);
      return NextResponse.json(result);
    }
    if (body.action === 'issue-contract') {
      const contract = immuneEngine.issueBrandContract(body);
      return NextResponse.json(contract);
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
